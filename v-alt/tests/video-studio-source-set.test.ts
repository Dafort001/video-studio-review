import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import sharp from "sharp";
import {
  parseStoredVideoStudioSourceSet,
  prepareVideoStudioSourceSet,
  videoStudioSourceAssetId,
  videoStudioSourceKeyNamespace,
  videoStudioSourceSetHandoff,
} from "../src/lib/video-studio-source-set.ts";
import { validateVideoStudioSourceSetObjects } from "../src/lib/video-studio-source-set-import.ts";
import { verifyVideoStudioSourceInventory } from "../src/lib/video-studio-source-inventory.ts";

const serverSource = readFileSync(new URL("../src/lib/video-studio-server.ts", import.meta.url), "utf8");
const storeSource = readFileSync(new URL("../src/lib/video-studio-source-set-server.ts", import.meta.url), "utf8");
const routeSource = readFileSync(new URL("../src/app/api/video-studio/shared/jobs/[jobReference]/handoff/route.ts", import.meta.url), "utf8");
const importerSource = readFileSync(new URL("../scripts/activate-video-studio-source-set.ts", import.meta.url), "utf8");
const schemaSource = readFileSync(new URL("../prisma/schema.prisma", import.meta.url), "utf8");
const migrationSource = readFileSync(new URL("../prisma/migrations/manual_video_studio_source_sets.sql", import.meta.url), "utf8");

test("source set digest and content-derived ids are deterministic and order-bound", () => {
  const entries = Array.from({ length: 31 }, (_, index) => manifestEntry(index + 1, "job-internal-seeburg"));
  const first = prepareVideoStudioSourceSet("job-internal-seeburg", entries);
  const repeated = prepareVideoStudioSourceSet("job-internal-seeburg", entries);
  const reversed = prepareVideoStudioSourceSet("job-internal-seeburg", [...entries].reverse());
  assert.deepEqual(repeated, first);
  assert.equal(first.assetCount, 31);
  assert.equal(first.entries[0].id, videoStudioSourceAssetId("job-internal-seeburg", entries[0].sha256));
  assert.notEqual(reversed.manifestDigest, first.manifestDigest);
  assert.notEqual(reversed.sourceReferenceId, first.sourceReferenceId);
  assert.match(first.sourceReferenceId, /^job:job-internal-seeburg:assets:[0-9a-f]{64}$/);
  assert.ok(first.sourceReferenceId.length <= 120);
});

test("stored manifests are idempotent but reject metadata tampering", () => {
  const prepared = prepareVideoStudioSourceSet("job-a", [manifestEntry(1, "job-a"), manifestEntry(2, "job-a")]);
  assert.deepEqual(parseStoredVideoStudioSourceSet(prepared), prepared);
  assert.throws(() => parseStoredVideoStudioSourceSet({
    ...prepared,
    entries: prepared.entries.map((entry, index) => index === 0 ? { ...entry, width: entry.width + 1 } : entry),
  }), /verification failed|conflicting|does not match/);
});

test("active source handoff keeps originals internal and signs only separate previews", async () => {
  const prepared = prepareVideoStudioSourceSet("job-active", [manifestEntry(1, "job-active"), manifestEntry(2, "job-active")]);
  const signedKeys: string[] = [];
  const handoff = await videoStudioSourceSetHandoff(prepared, "2026-08-11T20:00:00.000Z", async (previewKey) => {
    signedKeys.push(previewKey);
    return `https://preview.invalid/${signedKeys.length}`;
  });
  assert.equal(handoff.sourceReferenceId, prepared.sourceReferenceId);
  assert.deepEqual(signedKeys, prepared.entries.map((entry) => entry.previewKey));
  assert.deepEqual(handoff.creativeAssets, []);
  assert.equal(handoff.assets[0].storageKey, prepared.entries[0].originalKey);
  assert.equal(handoff.assets[0].width, prepared.entries[0].width);
  assert.equal(handoff.assets[0].height, prepared.entries[0].height);
  assert.ok(!("previewKey" in handoff.assets[0]));
  assert.ok(!handoff.assets[0].sourcePreviewUrl.includes(prepared.entries[0].originalKey));
});

test("source object validation checks bytes, hashes, JPEG decoding and dimensions", async () => {
  const originalA = await sharp({ create: { width: 32, height: 24, channels: 3, background: "#223344" } }).jpeg().toBuffer();
  const previewA = await sharp(originalA).resize(16, 12).jpeg().toBuffer();
  const originalB = await sharp({ create: { width: 30, height: 20, channels: 3, background: "#8899aa" } }).jpeg().toBuffer();
  const previewB = await sharp(originalB).resize(15, 10).jpeg().toBuffer();
  const originalShaA = digest(originalA);
  const previewShaA = digest(previewA);
  const originalShaB = digest(originalB);
  const previewShaB = digest(previewB);
  const namespace = videoStudioSourceKeyNamespace("job-verify");
  const originalKeyA = `piximmo/video-source-sets/${namespace}/originals/${originalShaA}/a.jpg`;
  const previewKeyA = `piximmo/video-source-sets/${namespace}/previews/v1/${previewShaA}.jpg`;
  const originalKeyB = `piximmo/video-source-sets/${namespace}/originals/${originalShaB}/b.jpg`;
  const previewKeyB = `piximmo/video-source-sets/${namespace}/previews/v1/${previewShaB}.jpg`;
  const objects = new Map([
    [originalKeyA, originalA], [previewKeyA, previewA],
    [originalKeyB, originalB], [previewKeyB, previewB],
  ]);
  const prepared = prepareVideoStudioSourceSet("job-verify", [
    measuredEntry(1, originalKeyA, previewKeyA, originalA, previewA, 32, 24, 16, 12),
    measuredEntry(2, originalKeyB, previewKeyB, originalB, previewB, 30, 20, 15, 10),
  ]);
  assert.deepEqual(await validateVideoStudioSourceSetObjects(prepared.entries, async (key) => ({ bytes: objects.get(key)!, contentType: "image/jpeg" })), {
    verifiedAssetCount: 2,
    verifiedObjectCount: 4,
  });
  await assert.rejects(
    validateVideoStudioSourceSetObjects([
      { ...prepared.entries[0], previewWidth: 17 },
      prepared.entries[1],
    ], async (key) => ({ bytes: objects.get(key)!, contentType: "image/jpeg" })),
    /dimensions do not match/,
  );
});

test("active/fallback handoff and rollback stay isolated from the legacy project", () => {
  assert.match(serverSource, /if \(job\.activeVideoStudioSourceSet\)[\s\S]*videoStudioSourceSetHandoff/);
  assert.ok(serverSource.indexOf("if (job.activeVideoStudioSourceSet)") < serverSource.indexOf("videoMaskCandidatesForHandoff(ready)"));
  assert.match(serverSource, /sourceReferenceId: setup\.id/);
  assert.match(routeSource, /sourceReference: \{ type: "job", id: job\.sourceReferenceId \}/);
  assert.match(storeSource, /where: \{ id: jobId, sourceProduct: "piximmo" \}/);
  assert.match(storeSource, /SET "activeVideoStudioSourceSetId" = NULL/);
  const legacy = "job-job-active";
  assert.match(serverSource, /activeVideoStudioSourceSet\.jobId !== job\.id/);
  assert.match(storeSource, /activeVideoStudioSourceSetId" IS NOT DISTINCT FROM \$\{expectedActiveSourceSetId\}/);
  assert.match(storeSource, /prisma\.\$executeRaw/);
  assert.match(storeSource, /IS NOT DISTINCT FROM \$\{expectedActiveSourceSetId\}/);
  assert.match(storeSource, /EXISTS \([\s\S]*source_set\."jobId" = job\."id"/);
  assert.doesNotMatch(storeSource, /prisma\.job\.updateMany/);
  assert.equal((storeSource.match(/current\?\.sourceProduct === "piximmo"/g) ?? []).length, 2);
  assert.match(storeSource, /activation conflict/);
  assert.match(storeSource, /rollback conflict/);
  assert.match(migrationSource, /Job_activeVideoStudioSourceSetId_owner_fkey/);
  const fresh = prepareVideoStudioSourceSet("job-active", [manifestEntry(1, "job-active"), manifestEntry(2, "job-active")]).sourceReferenceId;
  assert.notEqual(fresh, legacy);
});

test("source keys are job-bound and Shared rejects asset 121", () => {
  const jobAEntries = [manifestEntry(1, "job-a"), manifestEntry(2, "job-a")];
  assert.throws(() => prepareVideoStudioSourceSet("job-b", jobAEntries), /not immutable and content-addressed/);
  const tooMany = Array.from({ length: 121 }, (_, index) => manifestEntry(index + 1, "job-limit"));
  assert.throws(() => prepareVideoStudioSourceSet("job-limit", tooMany), /2-120/);
  assert.match(migrationSource, /"assetCount" <= 120/);
});

const realAuditPath = new URL("../../../CODEX_WORKING_MEMORY_DO_NOT_TOUCH/SEEBURG_SOURCESET_STAGING_MANIFEST_20260811.json", import.meta.url);
test("real Seeburg audit is pinned and matches all 31 ordered originals including new m30", { skip: !existsSync(realAuditPath) }, () => {
  const inventoryBytes = readFileSync(realAuditPath);
  const audit = JSON.parse(inventoryBytes.toString("utf8")) as { items: Array<{ filename: string; sha256: string; bytes: number; width: number; height: number }> };
  const result = verifyVideoStudioSourceInventory({
    inventoryBytes,
    entries: audit.items,
  });
  assert.deepEqual(result, {
    jobReference: "SCQ-NTX9R",
    reportSha256: "dbfa7c026d2a6176302776fd16f2e73e837799eb0f69eaf4f1b2467f40a36c57",
    itemCount: 31,
    totalBytes: 688_065_245,
  });
  assert.throws(() => verifyVideoStudioSourceInventory({
    inventoryBytes,
    entries: audit.items.map((entry, index) => index === 29 ? { ...entry, filename: "old-apple-m30.jpg" } : entry),
  }), /differs at slot 30/);
});

test("staged importer verifies every object before activation and never overwrites keys", () => {
  assert.match(importerSource, /async function main\(\)/);
  assert.match(importerSource, /void main\(\)\.catch/);
  assert.match(importerSource, /new PutObjectCommand\([\s\S]*IfNoneMatch: "\*"/);
  assert.match(importerSource, /new HeadObjectCommand/);
  assert.match(importerSource, /new GetObjectCommand/);
  assert.match(importerSource, /verifyVideoStudioSourceInventory/);
  assert.match(importerSource, /requireMutationConfirmation\(job\.reference\)/);
  assert.match(importerSource, /localObjectPathMap/);
  assert.doesNotMatch(importerSource, /new Map<string, Buffer>/);
  const verifyIndex = importerSource.lastIndexOf("validateVideoStudioSourceSetObjects(sourceSet.entries");
  const createIndex = importerSource.indexOf("createImmutableVideoStudioSourceSet(job.id");
  const activateIndex = importerSource.indexOf("activateVideoStudioSourceSet(job.id");
  assert.ok(verifyIndex > 0 && verifyIndex < createIndex && createIndex < activateIndex);
  assert.match(importerSource, /Without --activate|Ohne --activate/);
  assert.match(schemaSource, /activeVideoStudioSourceSetId\s+String\?\s+@unique/);
  assert.match(migrationSource, /ON DELETE SET NULL/);
});

function manifestEntry(index: number, jobId = "job-internal-seeburg") {
  const sha256 = createHash("sha256").update(`original-${index}`).digest("hex");
  const previewSha256 = createHash("sha256").update(`preview-${index}`).digest("hex");
  const namespace = videoStudioSourceKeyNamespace(jobId);
  return {
    originalKey: `piximmo/video-source-sets/${namespace}/originals/${sha256}/image-${index}.jpg`,
    previewKey: `piximmo/video-source-sets/${namespace}/previews/v1/${previewSha256}.jpg`,
    sha256,
    bytes: 20_000 + index,
    width: index === 30 ? 8_688 : 6_000,
    height: index === 30 ? 5_792 : 4_000,
    filename: `image-${String(index).padStart(2, "0")}.jpg`,
    taxonomy: { motif: index <= 8 ? "exterior" as const : "other" as const, roomLabel: `Motiv ${index}` },
    previewSha256,
    previewBytes: 2_000 + index,
    previewWidth: 1_500,
    previewHeight: 1_000,
  };
}

function digest(value: Buffer) {
  return createHash("sha256").update(value).digest("hex");
}

function measuredEntry(
  index: number,
  originalKey: string,
  previewKey: string,
  original: Buffer,
  preview: Buffer,
  width: number,
  height: number,
  previewWidth: number,
  previewHeight: number,
) {
  return {
    ...manifestEntry(index, "job-verify"),
    originalKey,
    previewKey,
    sha256: createHash("sha256").update(original).digest("hex"),
    bytes: original.length,
    width,
    height,
    previewSha256: createHash("sha256").update(preview).digest("hex"),
    previewBytes: preview.length,
    previewWidth,
    previewHeight,
  };
}
