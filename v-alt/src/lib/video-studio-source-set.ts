import { createHash } from "node:crypto";

export const VIDEO_STUDIO_SOURCE_SET_SCHEMA_VERSION = "video_studio_source_set_v1" as const;
export const VIDEO_STUDIO_SOURCE_SET_MAX_ASSETS = 120;

export type VideoStudioSourceTaxonomy = {
  motif?: "exterior" | "living" | "kitchen" | "dining" | "bedroom" | "bathroom" | "hallway" | "balcony" | "terrace" | "garden" | "detail" | "other";
  roomLabel?: string;
  roomType?: string;
  floor?: string;
  description?: string;
};

export type VideoStudioSourceSetEntry = {
  id: string;
  originalKey: string;
  previewKey: string;
  sha256: string;
  bytes: number;
  width: number;
  height: number;
  filename: string;
  taxonomy: VideoStudioSourceTaxonomy;
  previewSha256: string;
  previewBytes: number;
  previewWidth: number;
  previewHeight: number;
};

export type PreparedVideoStudioSourceSet = {
  schemaVersion: typeof VIDEO_STUDIO_SOURCE_SET_SCHEMA_VERSION;
  jobId: string;
  manifestDigest: string;
  snapshotDigest: string;
  sourceReferenceId: string;
  assetCount: number;
  entries: VideoStudioSourceSetEntry[];
};

type SourceSetEntryInput = Omit<VideoStudioSourceSetEntry, "id"> & { id?: string };

const SHA256_PATTERN = /^[0-9a-f]{64}$/;
const SOURCE_ASSET_ID_PATTERN = /^vssa_[0-9a-f]{32}$/;
const MOTIFS = new Set([
  "exterior", "living", "kitchen", "dining", "bedroom", "bathroom",
  "hallway", "balcony", "terrace", "garden", "detail", "other",
]);

export function videoStudioSourceAssetId(jobId: string, originalSha256: string) {
  const normalizedJobId = requiredBoundedString(jobId, "jobId", 160);
  const normalizedSha256 = normalizeSha256(originalSha256, "sha256");
  const digest = createHash("sha256")
    .update(`video_studio_source_asset_v1\0piximmo\0${normalizedJobId}\0${normalizedSha256}`)
    .digest("hex");
  return `vssa_${digest.slice(0, 32)}`;
}

export function videoStudioSourceKeyNamespace(jobId: string) {
  const normalizedJobId = requiredBoundedString(jobId, "jobId", 160);
  return `job_${createHash("sha256").update(`video_studio_source_key_v1\0piximmo\0${normalizedJobId}`).digest("hex").slice(0, 24)}`;
}

export function videoStudioSourceManifestDigest(entries: VideoStudioSourceSetEntry[]) {
  return createHash("sha256")
    .update(JSON.stringify(entries.map((entry) => ({
      id: entry.id,
      kind: "image" as const,
      storageKey: entry.originalKey,
    }))))
    .digest("hex");
}

export function videoStudioSourceReferenceId(jobId: string, manifestDigest: string) {
  const reference = `job:${requiredBoundedString(jobId, "jobId", 40)}:assets:${normalizeSha256(manifestDigest, "manifestDigest")}`;
  if (reference.length > 120) throw new Error("Video Studio source reference exceeds 120 characters");
  return reference;
}

export function prepareVideoStudioSourceSet(
  jobId: string,
  inputEntries: SourceSetEntryInput[],
): PreparedVideoStudioSourceSet {
  if (!Array.isArray(inputEntries) || inputEntries.length < 2 || inputEntries.length > VIDEO_STUDIO_SOURCE_SET_MAX_ASSETS) {
    throw new Error(`Video Studio source set must contain 2-${VIDEO_STUDIO_SOURCE_SET_MAX_ASSETS} assets`);
  }
  const entries = inputEntries.map((entry, index) => normalizeEntry(jobId, entry, index));
  ensureUnique(entries.map((entry) => entry.id), "source asset id");
  ensureUnique(entries.map((entry) => entry.sha256), "original sha256");
  ensureUnique(entries.map((entry) => entry.originalKey), "original key");
  ensureUnique(entries.map((entry) => entry.previewKey), "preview key");
  const manifestDigest = videoStudioSourceManifestDigest(entries);
  const snapshotDigest = createHash("sha256").update(JSON.stringify(entries)).digest("hex");
  return {
    schemaVersion: VIDEO_STUDIO_SOURCE_SET_SCHEMA_VERSION,
    jobId,
    manifestDigest,
    snapshotDigest,
    sourceReferenceId: videoStudioSourceReferenceId(jobId, manifestDigest),
    assetCount: entries.length,
    entries,
  };
}

export function parseStoredVideoStudioSourceSet(input: {
  schemaVersion: string;
  jobId: string;
  manifestDigest: string;
  snapshotDigest: string;
  sourceReferenceId: string;
  assetCount: number;
  entries: unknown;
}) {
  if (input.schemaVersion !== VIDEO_STUDIO_SOURCE_SET_SCHEMA_VERSION) {
    throw new Error("Unsupported Video Studio source set schema");
  }
  if (!Array.isArray(input.entries)) throw new Error("Video Studio source set entries are invalid");
  const prepared = prepareVideoStudioSourceSet(input.jobId, input.entries as SourceSetEntryInput[]);
  if (
    input.assetCount !== prepared.assetCount ||
    input.manifestDigest !== prepared.manifestDigest ||
    input.snapshotDigest !== prepared.snapshotDigest ||
    input.sourceReferenceId !== prepared.sourceReferenceId
  ) {
    throw new Error("Video Studio source set manifest verification failed");
  }
  return prepared;
}

export async function videoStudioSourceSetHandoff(
  sourceSet: PreparedVideoStudioSourceSet,
  sourcePreviewUrlExpiresAt: string,
  signPreview: (previewKey: string) => Promise<string>,
) {
  return {
    sourceReferenceId: sourceSet.sourceReferenceId,
    creativeAssets: [],
    assets: await Promise.all(sourceSet.entries.map(async (entry) => ({
      id: entry.id,
      kind: "image" as const,
      storageKey: entry.originalKey,
      filename: entry.filename,
      width: entry.width,
      height: entry.height,
      motif: entry.taxonomy.motif,
      description: entry.taxonomy.description,
      sourcePreviewUrl: await signPreview(entry.previewKey),
      sourcePreviewUrlExpiresAt,
    }))),
  };
}

function normalizeEntry(jobId: string, entry: SourceSetEntryInput, index: number): VideoStudioSourceSetEntry {
  if (!entry || typeof entry !== "object") throw new Error(`Source asset ${index + 1} is invalid`);
  const sha256 = normalizeSha256(entry.sha256, `assets[${index}].sha256`);
  const id = videoStudioSourceAssetId(jobId, sha256);
  if (entry.id !== undefined && (!SOURCE_ASSET_ID_PATTERN.test(entry.id) || entry.id !== id)) {
    throw new Error(`Source asset ${index + 1} id does not match its content identity`);
  }
  const originalKey = objectKey(entry.originalKey, `assets[${index}].originalKey`);
  const previewKey = objectKey(entry.previewKey, `assets[${index}].previewKey`);
  const jobPrefix = `piximmo/video-source-sets/${videoStudioSourceKeyNamespace(jobId)}/`;
  if (originalKey === previewKey) throw new Error(`Source asset ${index + 1} must use a separate preview object`);
  if (!originalKey.startsWith(jobPrefix) || !originalKey.includes(`/originals/${sha256}/`)) {
    throw new Error(`Source asset ${index + 1} original key is not immutable and content-addressed`);
  }
  const previewSha256 = normalizeSha256(entry.previewSha256, `assets[${index}].previewSha256`);
  if (!previewKey.startsWith(jobPrefix) || !previewKey.includes(`/previews/`) || !previewKey.includes(previewSha256)) {
    throw new Error(`Source asset ${index + 1} preview key is not immutable and content-addressed`);
  }
  return {
    id,
    originalKey,
    previewKey,
    sha256,
    bytes: positiveSafeInteger(entry.bytes, `assets[${index}].bytes`),
    width: imageDimension(entry.width, `assets[${index}].width`),
    height: imageDimension(entry.height, `assets[${index}].height`),
    filename: safeFilename(entry.filename, `assets[${index}].filename`),
    taxonomy: taxonomy(entry.taxonomy, `assets[${index}].taxonomy`),
    previewSha256,
    previewBytes: positiveSafeInteger(entry.previewBytes, `assets[${index}].previewBytes`),
    previewWidth: imageDimension(entry.previewWidth, `assets[${index}].previewWidth`),
    previewHeight: imageDimension(entry.previewHeight, `assets[${index}].previewHeight`),
  };
}

function taxonomy(value: unknown, label: string): VideoStudioSourceTaxonomy {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} is invalid`);
  const input = value as Record<string, unknown>;
  const motif = input.motif === undefined ? undefined : requiredBoundedString(input.motif, `${label}.motif`, 32);
  if (motif !== undefined && !MOTIFS.has(motif)) throw new Error(`${label}.motif is invalid`);
  return {
    motif: motif as VideoStudioSourceTaxonomy["motif"],
    roomLabel: optionalBoundedString(input.roomLabel, `${label}.roomLabel`, 200),
    roomType: optionalBoundedString(input.roomType, `${label}.roomType`, 80),
    floor: optionalBoundedString(input.floor, `${label}.floor`, 40),
    description: optionalBoundedString(input.description, `${label}.description`, 1_000),
  };
}

function objectKey(value: unknown, label: string) {
  const key = requiredBoundedString(value, label, 1_024);
  if (key.startsWith("/") || key.split("/").some((segment) => segment === "..") || /[\u0000-\u001f]/.test(key)) {
    throw new Error(`${label} is invalid`);
  }
  return key;
}

function safeFilename(value: unknown, label: string) {
  const filename = requiredBoundedString(value, label, 240);
  if (filename.includes("/") || filename.includes("\\") || /[\u0000-\u001f]/.test(filename)) throw new Error(`${label} is invalid`);
  return filename;
}

function requiredBoundedString(value: unknown, label: string, maxLength: number) {
  if (typeof value !== "string" || !value.trim() || value.trim().length > maxLength) throw new Error(`${label} is invalid`);
  return value.trim();
}

function optionalBoundedString(value: unknown, label: string, maxLength: number) {
  if (value === undefined || value === null || value === "") return undefined;
  return requiredBoundedString(value, label, maxLength);
}

function normalizeSha256(value: unknown, label: string) {
  if (typeof value !== "string" || !SHA256_PATTERN.test(value.toLowerCase())) throw new Error(`${label} is invalid`);
  return value.toLowerCase();
}

function positiveSafeInteger(value: unknown, label: string) {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value <= 0) throw new Error(`${label} is invalid`);
  return value;
}

function imageDimension(value: unknown, label: string) {
  const dimension = positiveSafeInteger(value, label);
  if (dimension > 100_000) throw new Error(`${label} is invalid`);
  return dimension;
}

function ensureUnique(values: string[], label: string) {
  if (new Set(values).size !== values.length) throw new Error(`Video Studio source set contains a duplicate ${label}`);
}
