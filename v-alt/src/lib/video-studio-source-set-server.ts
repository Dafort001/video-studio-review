import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  parseStoredVideoStudioSourceSet,
  prepareVideoStudioSourceSet,
  type VideoStudioSourceSetEntry,
} from "@/lib/video-studio-source-set";

export const activeVideoStudioSourceSetSelect = {
  id: true,
  jobId: true,
  schemaVersion: true,
  manifestDigest: true,
  snapshotDigest: true,
  sourceReferenceId: true,
  assetCount: true,
  entries: true,
  createdAt: true,
} satisfies Prisma.VideoStudioSourceSetSelect;

type StoredSourceSet = Prisma.VideoStudioSourceSetGetPayload<{
  select: typeof activeVideoStudioSourceSetSelect;
}>;

export function parsePrismaVideoStudioSourceSet(sourceSet: StoredSourceSet) {
  return parseStoredVideoStudioSourceSet(sourceSet);
}

export async function createImmutableVideoStudioSourceSet(
  jobId: string,
  entries: Array<Omit<VideoStudioSourceSetEntry, "id"> & { id?: string }>,
) {
  const owner = await prisma.job.findFirst({
    where: { id: jobId, sourceProduct: "piximmo" },
    select: { id: true },
  });
  if (!owner) throw new Error("PixImmo job was not found for Video Studio source set");
  const prepared = prepareVideoStudioSourceSet(jobId, entries);
  const existing = await prisma.videoStudioSourceSet.findUnique({
    where: { jobId_manifestDigest: { jobId, manifestDigest: prepared.manifestDigest } },
    select: activeVideoStudioSourceSetSelect,
  });
  if (existing) return requireExactStoredManifest(existing, prepared);
  try {
    const created = await prisma.videoStudioSourceSet.create({
      data: {
        jobId,
        schemaVersion: prepared.schemaVersion,
        manifestDigest: prepared.manifestDigest,
        snapshotDigest: prepared.snapshotDigest,
        sourceReferenceId: prepared.sourceReferenceId,
        assetCount: prepared.assetCount,
        entries: prepared.entries as unknown as Prisma.InputJsonValue,
      },
      select: activeVideoStudioSourceSetSelect,
    });
    return { record: created, manifest: parsePrismaVideoStudioSourceSet(created), created: true };
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") throw error;
    const raced = await prisma.videoStudioSourceSet.findUnique({
      where: { jobId_manifestDigest: { jobId, manifestDigest: prepared.manifestDigest } },
      select: activeVideoStudioSourceSetSelect,
    });
    if (!raced) throw error;
    return requireExactStoredManifest(raced, prepared);
  }
}

export async function activateVideoStudioSourceSet(
  jobId: string,
  sourceSetId: string,
  expectedActiveSourceSetId: string | null,
) {
  // Prisma's Neon HTTP adapter wraps updateMany relation filters in a
  // transaction, which the production HTTP transport cannot execute. Keep the
  // owner check and compare-and-swap atomic in one parameterized statement.
  const updated = await prisma.$executeRaw`
    UPDATE "Job" AS job
    SET "activeVideoStudioSourceSetId" = ${sourceSetId}, "updatedAt" = NOW()
    WHERE job."id" = ${jobId}
      AND job."sourceProduct" = 'piximmo'
      AND job."activeVideoStudioSourceSetId" IS NOT DISTINCT FROM ${expectedActiveSourceSetId}
      AND EXISTS (
        SELECT 1
        FROM "VideoStudioSourceSet" AS source_set
        WHERE source_set."id" = ${sourceSetId}
          AND source_set."jobId" = job."id"
      )
  `;
  if (updated === 1) return;
  const current = await prisma.job.findUnique({
    where: { id: jobId },
    select: { sourceProduct: true, activeVideoStudioSourceSetId: true },
  });
  if (current?.sourceProduct === "piximmo" && current.activeVideoStudioSourceSetId === sourceSetId) return;
  throw new Error("Video Studio source set activation conflict");
}

export async function rollbackVideoStudioSourceSetToLegacy(jobId: string, expectedActiveSourceSetId: string | null) {
  const updated = await prisma.$executeRaw`
    UPDATE "Job"
    SET "activeVideoStudioSourceSetId" = NULL, "updatedAt" = NOW()
    WHERE "id" = ${jobId}
      AND "sourceProduct" = 'piximmo'
      AND "activeVideoStudioSourceSetId" IS NOT DISTINCT FROM ${expectedActiveSourceSetId}
  `;
  if (updated === 1) return;
  const current = await prisma.job.findUnique({
    where: { id: jobId },
    select: { sourceProduct: true, activeVideoStudioSourceSetId: true },
  });
  if (current?.sourceProduct === "piximmo" && current.activeVideoStudioSourceSetId === null) return;
  throw new Error("Video Studio source set rollback conflict");
}

function requireExactStoredManifest(
  record: StoredSourceSet,
  expected: ReturnType<typeof prepareVideoStudioSourceSet>,
) {
  const manifest = parsePrismaVideoStudioSourceSet(record);
  if (JSON.stringify(manifest.entries) !== JSON.stringify(expected.entries)) {
    throw new Error("Existing Video Studio source set has conflicting immutable metadata");
  }
  return { record, manifest, created: false };
}
