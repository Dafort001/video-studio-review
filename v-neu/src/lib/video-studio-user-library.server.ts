import { prisma } from "@/lib/prisma";
import { getSignedDownloadUrl } from "@/lib/r2";

export async function getVideoStudioUserLibrary(userId: string) {
  const [assets, presets] = await Promise.all([
    prisma.videoStudioBrandAsset.findMany({ where: { userId }, orderBy: [{ isActive: "desc" }, { updatedAt: "desc" }] }),
    prisma.videoStudioPreset.findMany({ where: { userId }, orderBy: { updatedAt: "desc" } }),
  ]);
  return {
    brandAssets: await Promise.all(assets.map(async (asset) => ({
      id: asset.id, filename: asset.filename, mimeType: asset.mimeType, width: asset.width, height: asset.height, sizeBytes: asset.sizeBytes, isActive: asset.isActive,
      previewUrl: await getSignedDownloadUrl(asset.storageKey, 3600),
    }))),
    presets: presets.map((preset) => ({ id: preset.id, name: preset.name, kind: preset.kind as "rhythm" | "cut_sequence", definition: preset.definition })),
  };
}
export async function getVideoStudioBrandAssetForHandoff(userId: string, assetId: string) {
  return prisma.videoStudioBrandAsset.findFirst({ where: { id: assetId, userId } });
}
