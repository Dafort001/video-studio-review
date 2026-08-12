import { createHash } from "node:crypto";
import sharp from "sharp";
import type { VideoStudioSourceSetEntry } from "@/lib/video-studio-source-set";

export type VideoStudioSourceObject = {
  bytes: Buffer;
  contentType?: string;
};

export async function validateVideoStudioSourceSetObjects(
  entries: VideoStudioSourceSetEntry[],
  readObject: (key: string) => Promise<VideoStudioSourceObject>,
  concurrency = 2,
) {
  if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 8) {
    throw new Error("Video Studio source validation concurrency must be 1-8");
  }
  await mapWithConcurrency(entries, concurrency, async (entry, index) => {
    await validateJpegObject(index, "original", entry.originalKey, {
      sha256: entry.sha256,
      bytes: entry.bytes,
      width: entry.width,
      height: entry.height,
    }, readObject);
    await validateJpegObject(index, "preview", entry.previewKey, {
      sha256: entry.previewSha256,
      bytes: entry.previewBytes,
      width: entry.previewWidth,
      height: entry.previewHeight,
    }, readObject);
  });
  return { verifiedAssetCount: entries.length, verifiedObjectCount: entries.length * 2 };
}

async function validateJpegObject(
  index: number,
  role: "original" | "preview",
  key: string,
  expected: { sha256: string; bytes: number; width: number; height: number },
  readObject: (key: string) => Promise<VideoStudioSourceObject>,
) {
  const object = await readObject(key);
  const contentType = object.contentType?.split(";", 1)[0]?.trim().toLowerCase();
  if (contentType && contentType !== "image/jpeg") {
    throw new Error(`Source asset ${index + 1} ${role} has an invalid content type`);
  }
  if (object.bytes.length !== expected.bytes) {
    throw new Error(`Source asset ${index + 1} ${role} byte length does not match the manifest`);
  }
  const digest = createHash("sha256").update(object.bytes).digest("hex");
  if (digest !== expected.sha256) {
    throw new Error(`Source asset ${index + 1} ${role} sha256 does not match the manifest`);
  }
  const metadata = await sharp(object.bytes, { failOn: "error" }).metadata();
  if (metadata.format !== "jpeg" || metadata.width !== expected.width || metadata.height !== expected.height) {
    throw new Error(`Source asset ${index + 1} ${role} JPEG dimensions do not match the manifest`);
  }
}

async function mapWithConcurrency<T>(
  values: T[],
  concurrency: number,
  operation: (value: T, index: number) => Promise<void>,
) {
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, async () => {
    while (cursor < values.length) {
      const index = cursor++;
      await operation(values[index], index);
    }
  }));
}
