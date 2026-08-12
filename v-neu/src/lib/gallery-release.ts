import type { Prisma } from "@prisma/client";

export const PIXIMMO_GALLERY_RELEASE_SCHEMA = "piximmo.gallery-release.v1";

export type PublishedGalleryAsset = {
  imageId: string;
  objectKey: string;
  filename: string;
  width: number | null;
  height: number | null;
  deliveryVersion: number;
  roomName: string | null;
  roomType: string | null;
  floor: string | null;
  motifIndex: number | null;
  altText: string | null;
  exposeText: string | null;
};

export type PublishedGalleryRelease = {
  schema: typeof PIXIMMO_GALLERY_RELEASE_SCHEMA;
  status: "published";
  version: number;
  publishedAt: string;
  publishedBy: string | null;
  taxonomyStage: "final";
  outputProfile: {
    format: "jpeg";
    maxLongEdge: 3000;
    colorSpace: "srgb";
  };
  assets: PublishedGalleryAsset[];
};

type GalleryReleaseSourceImage = {
  id: string;
  deliveryKey: string | null;
  finalFilename: string | null;
  deliveryWidth: number | null;
  deliveryHeight: number | null;
  deliveryVersion: number;
  finalRoomName: string | null;
  roomName: string | null;
  finalRoomType: string | null;
  roomType: string | null;
  finalFloor: string | null;
  floor: string | null;
  motifIndex: number | null;
  altText: string | null;
  exposeText: string | null;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function nullableString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function nullableNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function parseAsset(value: unknown): PublishedGalleryAsset | null {
  const record = asRecord(value);
  if (!record) return null;
  if (
    typeof record.imageId !== "string"
    || typeof record.objectKey !== "string"
    || typeof record.filename !== "string"
    || typeof record.deliveryVersion !== "number"
  ) {
    return null;
  }

  return {
    imageId: record.imageId,
    objectKey: record.objectKey,
    filename: record.filename,
    width: nullableNumber(record.width),
    height: nullableNumber(record.height),
    deliveryVersion: record.deliveryVersion,
    roomName: nullableString(record.roomName),
    roomType: nullableString(record.roomType),
    floor: nullableString(record.floor),
    motifIndex: nullableNumber(record.motifIndex),
    altText: nullableString(record.altText),
    exposeText: nullableString(record.exposeText),
  };
}

export function readPublishedGalleryRelease(styleModifiers: unknown): PublishedGalleryRelease | null {
  const modifiers = asRecord(styleModifiers);
  const release = asRecord(modifiers?.galleryRelease);
  if (
    !release
    || release.schema !== PIXIMMO_GALLERY_RELEASE_SCHEMA
    || release.status !== "published"
    || typeof release.version !== "number"
    || typeof release.publishedAt !== "string"
    || !Array.isArray(release.assets)
  ) {
    return null;
  }

  const assets = release.assets
    .map(parseAsset)
    .filter((asset): asset is PublishedGalleryAsset => Boolean(asset));
  if (assets.length === 0 || assets.length !== release.assets.length) return null;

  return {
    schema: PIXIMMO_GALLERY_RELEASE_SCHEMA,
    status: "published",
    version: release.version,
    publishedAt: release.publishedAt,
    publishedBy: nullableString(release.publishedBy),
    taxonomyStage: "final",
    outputProfile: {
      format: "jpeg",
      maxLongEdge: 3000,
      colorSpace: "srgb",
    },
    assets,
  };
}

export function buildPublishedGalleryRelease(input: {
  images: GalleryReleaseSourceImage[];
  previousRelease?: PublishedGalleryRelease | null;
  publishedBy?: string | null;
  publishedAt?: Date;
}): PublishedGalleryRelease {
  const assets = input.images.map((image) => {
    if (!image.deliveryKey) {
      throw new Error(`Bild ${image.id} besitzt keine Delivery-Datei.`);
    }
    return {
      imageId: image.id,
      objectKey: image.deliveryKey,
      filename: image.finalFilename || image.deliveryKey.split("/").pop() || `${image.id}.jpg`,
      width: image.deliveryWidth,
      height: image.deliveryHeight,
      deliveryVersion: image.deliveryVersion,
      roomName: image.finalRoomName ?? image.roomName,
      roomType: image.finalRoomType ?? image.roomType,
      floor: image.finalFloor ?? image.floor,
      motifIndex: image.motifIndex,
      altText: image.altText,
      exposeText: image.exposeText,
    };
  });

  if (assets.length === 0) {
    throw new Error("Eine leere Galerie kann nicht veröffentlicht werden.");
  }

  return {
    schema: PIXIMMO_GALLERY_RELEASE_SCHEMA,
    status: "published",
    version: (input.previousRelease?.version ?? 0) + 1,
    publishedAt: (input.publishedAt ?? new Date()).toISOString(),
    publishedBy: input.publishedBy ?? null,
    taxonomyStage: "final",
    outputProfile: {
      format: "jpeg",
      maxLongEdge: 3000,
      colorSpace: "srgb",
    },
    assets,
  };
}

export function withPublishedGalleryRelease(
  styleModifiers: unknown,
  release: PublishedGalleryRelease,
): Prisma.InputJsonValue {
  return {
    ...(asRecord(styleModifiers) ?? {}),
    galleryRelease: release,
  } as Prisma.InputJsonValue;
}

export function publishedGalleryAssetMap(release: PublishedGalleryRelease) {
  return new Map(release.assets.map((asset) => [asset.imageId, asset]));
}

export function publishedGalleryImageIds(release: PublishedGalleryRelease) {
  return release.assets.map((asset) => asset.imageId);
}

export function isPublishedGalleryImage(
  release: PublishedGalleryRelease,
  imageId: string,
) {
  return release.assets.some((asset) => asset.imageId === imageId);
}
