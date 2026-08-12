import { createHash } from "node:crypto";
import type { VideoStudioSourceSetEntry } from "@/lib/video-studio-source-set";

export const PINNED_VIDEO_STUDIO_SOURCE_INVENTORY_SHA256: Readonly<Record<string, string>> = {
  "SCQ-NTX9R": "dbfa7c026d2a6176302776fd16f2e73e837799eb0f69eaf4f1b2467f40a36c57",
};

type InventoryItem = {
  ordinal: number;
  slot: string;
  filename: string;
  sha256: string;
  bytes: number;
  width: number;
  height: number;
  legacyAssetIdentityReuseForbidden?: boolean;
};

type SourceInventory = {
  schemaVersion: "piximmo_video_source_set_audit_v1";
  sourceProduct: "piximmo";
  jobReference: string;
  itemCount: number;
  totalBytes: number;
  items: InventoryItem[];
};

export function verifyVideoStudioSourceInventory(input: {
  inventoryBytes: Buffer;
  expectedReportSha256?: string | null;
  entries: Array<Pick<VideoStudioSourceSetEntry, "filename" | "sha256" | "bytes" | "width" | "height">>;
}) {
  const reportSha256 = createHash("sha256").update(input.inventoryBytes).digest("hex");
  const parsed = JSON.parse(input.inventoryBytes.toString("utf8")) as Partial<SourceInventory>;
  if (
    parsed.schemaVersion !== "piximmo_video_source_set_audit_v1" ||
    parsed.sourceProduct !== "piximmo" ||
    typeof parsed.jobReference !== "string" ||
    !Array.isArray(parsed.items) ||
    !Number.isSafeInteger(parsed.itemCount) ||
    !Number.isSafeInteger(parsed.totalBytes)
  ) throw new Error("Video Studio source inventory is invalid");
  const jobReference = parsed.jobReference.toUpperCase();
  const expectedReportSha256 = PINNED_VIDEO_STUDIO_SOURCE_INVENTORY_SHA256[jobReference]
    ?? input.expectedReportSha256?.toLowerCase();
  if (!expectedReportSha256 || !/^[0-9a-f]{64}$/.test(expectedReportSha256) || reportSha256 !== expectedReportSha256) {
    throw new Error("Video Studio source inventory report sha256 is not trusted");
  }
  if (parsed.itemCount !== parsed.items.length || parsed.items.length !== input.entries.length) {
    throw new Error("Video Studio source inventory count does not match the import manifest");
  }
  let totalBytes = 0;
  parsed.items.forEach((rawItem, index) => {
    const item = rawItem as Partial<InventoryItem>;
    const entry = input.entries[index];
    if (
      item.ordinal !== index + 1 ||
      item.slot !== `m${String(index + 1).padStart(2, "0")}` ||
      item.filename !== entry.filename ||
      item.sha256 !== entry.sha256 ||
      item.bytes !== entry.bytes ||
      item.width !== entry.width ||
      item.height !== entry.height
    ) throw new Error(`Video Studio source inventory differs at slot ${index + 1}`);
    totalBytes += entry.bytes;
  });
  if (totalBytes !== parsed.totalBytes) throw new Error("Video Studio source inventory byte total is invalid");
  if (jobReference === "SCQ-NTX9R") {
    const slot30 = parsed.items[29] as Partial<InventoryItem> | undefined;
    if (
      slot30?.filename !== "20260803-Wohnzimmer-_V4A4507.jpg" ||
      slot30.sha256 !== "4fdca8c315e07abeb8ba959ef2b06df59ceca7de2ad9c9dc047d9348a59334ab" ||
      slot30.legacyAssetIdentityReuseForbidden !== true
    ) throw new Error("Seeburg slot m30 identity contract is invalid");
  }
  return { jobReference, reportSha256, itemCount: parsed.items.length, totalBytes };
}
