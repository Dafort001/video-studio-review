#!/usr/bin/env node
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { GetObjectCommand, HeadObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import {
  prepareVideoStudioSourceSet,
  type VideoStudioSourceSetEntry,
} from "../src/lib/video-studio-source-set";
import { validateVideoStudioSourceSetObjects } from "../src/lib/video-studio-source-set-import";
import { verifyVideoStudioSourceInventory } from "../src/lib/video-studio-source-inventory";

type ImportEntry = Omit<VideoStudioSourceSetEntry, "id"> & {
  id?: string;
  originalLocalPath?: string;
  previewLocalPath?: string;
};

type ImportManifest = {
  schemaVersion: "video_studio_source_set_import_v1";
  jobReference: string;
  entries: ImportEntry[];
};

loadEnv(".env.local");
loadEnv(".env.production.local");

const manifestPath = readArg("--manifest");
const inventoryPath = readArg("--audit-manifest");
const inventorySha256 = readArg("--audit-sha256");
const rollback = process.argv.includes("--rollback");
const activate = process.argv.includes("--activate");
const uploadRoot = readArg("--upload-root");
const confirmedJob = readArg("--confirm-job")?.toUpperCase() ?? null;
const expectedCount = Number(readArg("--expected-count") ?? "31");

if (!Number.isInteger(expectedCount) || expectedCount < 2 || expectedCount > 120) fail("--expected-count muss zwischen 2 und 120 liegen.");
if (!process.env.DATABASE_URL) fail("DATABASE_URL fehlt.");
if (rollback && (activate || uploadRoot)) fail("--rollback darf nicht mit --activate oder --upload-root kombiniert werden.");
if (!rollback && !manifestPath) fail("--manifest=/absoluter/pfad/manifest.json fehlt.");
if (!rollback && !inventoryPath) fail("--audit-manifest=/absoluter/pfad/audit.json fehlt.");

async function main() {
  const { prisma } = await import("../src/lib/prisma");
  const { R2_BUCKET, s3Client } = await import("../src/lib/r2");
  const {
    activateVideoStudioSourceSet,
    createImmutableVideoStudioSourceSet,
    rollbackVideoStudioSourceSetToLegacy,
  } = await import("../src/lib/video-studio-source-set-server");

  try {
  if (rollback) {
    const job = await resolveJob(prisma, readArg("--job"));
    requireMutationConfirmation(job.reference);
    await rollbackVideoStudioSourceSetToLegacy(job.id, job.activeVideoStudioSourceSetId);
    console.log(`Legacy-Fallback aktiviert für ${job.reference}. SourceSet-Snapshots und R2-Objekte blieben unverändert.`);
    process.exit(0);
  }

  const manifest = parseManifest(manifestPath!);
  const inventory = verifyVideoStudioSourceInventory({
    inventoryBytes: fs.readFileSync(path.resolve(inventoryPath!)),
    expectedReportSha256: inventorySha256,
    entries: manifest.entries,
  });
  if (inventory.jobReference !== manifest.jobReference.toUpperCase()) fail("Auditmanifest und Importmanifest gehören nicht zum selben Auftrag.");
  if (manifest.entries.length !== expectedCount) fail(`Manifest enthält ${manifest.entries.length} statt ${expectedCount} Motive.`);
  const job = await resolveJob(prisma, manifest.jobReference);
  const sourceSet = prepareVideoStudioSourceSet(job.id, manifest.entries);

  if (uploadRoot) {
    requireMutationConfirmation(job.reference);
    const root = fs.realpathSync(path.resolve(uploadRoot));
    const localObjects = localObjectPathMap(manifest.entries, root);
    await validateVideoStudioSourceSetObjects(sourceSet.entries, async (key) => {
      const objectPath = localObjects.get(key);
      if (!objectPath) throw new Error("Lokales SourceSet-Objekt fehlt");
      return { bytes: fs.readFileSync(objectPath), contentType: "image/jpeg" };
    });
    let createdObjects = 0;
    for (const entry of sourceSet.entries) {
      createdObjects += await putImmutable(s3Client, R2_BUCKET, entry.originalKey, fs.readFileSync(localObjects.get(entry.originalKey)!));
      createdObjects += await putImmutable(s3Client, R2_BUCKET, entry.previewKey, fs.readFileSync(localObjects.get(entry.previewKey)!));
    }
    console.log(`${createdObjects}/${sourceSet.assetCount * 2} Objekte neu und unveränderlich angelegt; vorhandene Keys wurden nicht überschrieben.`);
  }

  const verification = await validateVideoStudioSourceSetObjects(sourceSet.entries, async (key) => {
    const head = await s3Client.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: key }));
    if (!head.ContentLength || head.ContentLength <= 0) throw new Error("R2-Objekt fehlt oder ist leer");
    const object = await s3Client.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }));
    if (!object.Body) throw new Error("R2-Objekt hat keinen Body");
    return {
      bytes: Buffer.from(await object.Body.transformToByteArray()),
      contentType: object.ContentType ?? head.ContentType,
    };
  });
  console.log(`${verification.verifiedAssetCount} Motive / ${verification.verifiedObjectCount} R2-Objekte vollständig verifiziert.`);
  console.log(`Manifest-Digest: ${sourceSet.manifestDigest}`);
  console.log(`Source-Reference: ${sourceSet.sourceReferenceId}`);

  if (!activate) {
    console.log("Validierung abgeschlossen. Ohne --activate wurde keine Datenbankzeile und kein aktiver Pointer verändert.");
    process.exit(0);
  }
  requireMutationConfirmation(job.reference);
  const stored = await createImmutableVideoStudioSourceSet(job.id, sourceSet.entries);
  await activateVideoStudioSourceSet(job.id, stored.record.id, job.activeVideoStudioSourceSetId);
  console.log(`SourceSet ${stored.created ? "erstellt und" : "idempotent wiederverwendet und"} atomar für ${job.reference} aktiviert.`);
  } finally {
    await prisma.$disconnect();
  }
}

void main().catch((error: unknown) => {
  console.error("Video Studio source set command failed:", error instanceof Error ? error.name : "UnknownError");
  process.exitCode = 1;
});

function requireMutationConfirmation(jobReference: string) {
  if (confirmedJob !== jobReference.toUpperCase()) {
    fail(`Mutation gesperrt. Wiederhole mit --confirm-job=${jobReference}.`);
  }
}

async function putImmutable(
  s3Client: typeof import("../src/lib/r2").s3Client,
  bucket: string,
  key: string,
  bytes: Buffer,
) {
  try {
    await s3Client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: bytes,
      ContentType: "image/jpeg",
      IfNoneMatch: "*",
      Metadata: { sha256: createHash("sha256").update(bytes).digest("hex") },
    }));
    return 1;
  } catch (error) {
    const status = error && typeof error === "object" && "$metadata" in error
      ? (error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode
      : undefined;
    if (status === 409 || status === 412) return 0;
    throw error;
  }
}

function localObjectPathMap(entries: ImportEntry[], root: string) {
  const result = new Map<string, string>();
  entries.forEach((entry, index) => {
    result.set(entry.originalKey, resolveLocal(root, entry.originalLocalPath, index, "Original"));
    result.set(entry.previewKey, resolveLocal(root, entry.previewLocalPath, index, "Preview"));
  });
  return result;
}

function resolveLocal(root: string, relativePath: string | undefined, index: number, role: string) {
  if (!relativePath) throw new Error(`Motiv ${index + 1}: ${role}-Dateipfad fehlt`);
  const resolved = fs.realpathSync(path.resolve(root, relativePath));
  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) throw new Error(`Motiv ${index + 1}: ${role}-Datei liegt außerhalb des Upload-Roots`);
  return resolved;
}

async function resolveJob(prisma: typeof import("../src/lib/prisma").prisma, reference: string | null) {
  if (!reference) fail("Job-Referenz fehlt.");
  const normalized = reference!.toUpperCase();
  const [customerCode, jobId] = normalized.split("-");
  const job = await prisma.job.findFirst({
    where: {
      sourceProduct: "piximmo",
      OR: [
        { id: reference! },
        { jobId: normalized },
        ...(customerCode && jobId ? [{ customerCode, jobId }] : []),
      ],
    },
    select: { id: true, customerCode: true, jobId: true, activeVideoStudioSourceSetId: true },
  });
  if (!job) throw new Error("PixImmo-Auftrag nicht gefunden");
  return { ...job, reference: `${job.customerCode}-${job.jobId}` };
}

function parseManifest(file: string): ImportManifest {
  const absolute = path.resolve(file);
  const parsed = JSON.parse(fs.readFileSync(absolute, "utf8")) as Partial<ImportManifest>;
  if (parsed.schemaVersion !== "video_studio_source_set_import_v1" || typeof parsed.jobReference !== "string" || !Array.isArray(parsed.entries)) {
    throw new Error("SourceSet-Importmanifest ist ungültig");
  }
  return parsed as ImportManifest;
}

function readArg(name: string) {
  const prefix = `${name}=`;
  return process.argv.find((argument) => argument.startsWith(prefix))?.slice(prefix.length) ?? null;
}

function loadEnv(file: string) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (!process.env[key]) process.env[key] = value;
  }
}

function fail(message: string): never {
  console.error(message);
  process.exit(2);
}
