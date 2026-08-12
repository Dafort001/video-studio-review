import { createHash } from "node:crypto";
import { PrismaNeonHttp } from "@prisma/adapter-neon";
import { Prisma, PrismaClient } from "@prisma/client";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  CentralVideoStudioAccountLibrary,
  persistBrandAssetUpload,
  StudioAccountLibraryInputError,
  validateCentralStudioR2Endpoint,
  type StudioAccountBrandAsset,
  type StudioAccountLibraryAdapter,
  type StudioAccountProduct,
  type StudioInternalFontAsset,
  type StudioInternalBrandAsset,
} from "./central-video-studio-account-library";

export type ProductConfiguration = {
  databaseUrl: string;
  r2AccountId: string;
  r2EndpointUrl: string;
  r2AccessKeyId: string;
  r2SecretAccessKey: string;
  r2BucketName: string;
};

const adapters = new Map<StudioAccountProduct, StudioAccountLibraryAdapter>();

const PRODUCT_ENV_NAMES = {
  piximmo: {
    databaseUrl: "CENTRAL_VIDEO_STUDIO_PIXIMMO_DATABASE_URL",
    r2AccountId: "CENTRAL_VIDEO_STUDIO_PIXIMMO_R2_ACCOUNT_ID",
    r2EndpointUrl: "CENTRAL_VIDEO_STUDIO_PIXIMMO_R2_ENDPOINT_URL",
    r2AccessKeyId: "CENTRAL_VIDEO_STUDIO_PIXIMMO_R2_ACCESS_KEY_ID",
    r2SecretAccessKey: "CENTRAL_VIDEO_STUDIO_PIXIMMO_R2_SECRET_ACCESS_KEY",
    r2BucketName: "CENTRAL_VIDEO_STUDIO_PIXIMMO_R2_BUCKET_NAME",
  },
  pixcapture: {
    databaseUrl: "CENTRAL_VIDEO_STUDIO_PIXCAPTURE_DATABASE_URL",
    r2AccountId: "CENTRAL_VIDEO_STUDIO_PIXCAPTURE_R2_ACCOUNT_ID",
    r2EndpointUrl: "CENTRAL_VIDEO_STUDIO_PIXCAPTURE_R2_ENDPOINT_URL",
    r2AccessKeyId: "CENTRAL_VIDEO_STUDIO_PIXCAPTURE_R2_ACCESS_KEY_ID",
    r2SecretAccessKey: "CENTRAL_VIDEO_STUDIO_PIXCAPTURE_R2_SECRET_ACCESS_KEY",
    r2BucketName: "CENTRAL_VIDEO_STUDIO_PIXCAPTURE_R2_BUCKET_NAME",
  },
} as const;

export const centralVideoStudioAccountLibrary =
  new CentralVideoStudioAccountLibrary((product) => {
    const current = adapters.get(product);
    if (current) return current;
    const adapter = createProductAdapter(product, readProductConfiguration(product));
    adapters.set(product, adapter);
    return adapter;
  });

export function createProductAdapter(
  product: StudioAccountProduct,
  configuration: ProductConfiguration,
): StudioAccountLibraryAdapter {
  const prisma = new PrismaClient({
    adapter: new PrismaNeonHttp(configuration.databaseUrl, {
      fetchOptions: { cache: "no-store" },
    }),
  });
  const r2 = new S3Client({
    region: "auto",
    endpoint: validateCentralStudioR2Endpoint(
      configuration.r2EndpointUrl,
      configuration.r2AccountId,
    ),
    credentials: {
      accessKeyId: configuration.r2AccessKeyId,
      secretAccessKey: configuration.r2SecretAccessKey,
    },
    forcePathStyle: true,
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
  const bucket = configuration.r2BucketName;

  async function previewUrl(storageKey: string) {
    return getSignedUrl(
      r2,
      new GetObjectCommand({ Bucket: bucket, Key: storageKey }),
      { expiresIn: 3600 },
    );
  }

  return {
    async readLibrary(actorId) {
      const [assets, presets, fontAssets] = await Promise.all([
        prisma.videoStudioBrandAsset.findMany({
          where: { userId: actorId },
          orderBy: [{ isActive: "desc" }, { updatedAt: "desc" }],
        }),
        prisma.videoStudioPreset.findMany({
          where: { userId: actorId },
          orderBy: { updatedAt: "desc" },
        }),
        prisma.$queryRaw<Array<{
          id: string;
          displayName: string;
          filename: string;
          mimeType: string;
          sizeBytes: number;
          rightsConfirmedAt: Date;
          licenseReference: string | null;
        }>>`
          SELECT "id", "displayName", "filename", "mimeType", "sizeBytes",
                 "rightsConfirmedAt", "licenseReference"
          FROM "VideoStudioFontAsset"
          WHERE "userId" = ${actorId}
          ORDER BY "updatedAt" DESC
        `,
      ]);
      return {
        brandAssets: await Promise.all(
          assets.map(async (asset) => ({
            id: asset.id,
            filename: asset.filename,
            mimeType: asset.mimeType,
            width: asset.width,
            height: asset.height,
            sizeBytes: asset.sizeBytes,
            isActive: asset.isActive,
            previewUrl: await previewUrl(asset.storageKey),
          })),
        ),
        presets: presets.map((preset) => ({
          id: preset.id,
          name: preset.name,
          kind: preset.kind as "rhythm" | "cut_sequence",
          definition: preset.definition,
        })),
        fontAssets: fontAssets.map((asset) => ({
          assetId: asset.id,
          displayName: asset.displayName,
          filename: asset.filename,
          mimeType: asset.mimeType as "font/ttf" | "font/otf" | "font/woff2",
          sizeBytes: asset.sizeBytes,
          rightsConfirmedAt: asset.rightsConfirmedAt.toISOString(),
          ...(asset.licenseReference ? { licenseReference: asset.licenseReference } : {}),
        })),
      };
    },

    async registerBrandAsset(actorId, input) {
      const storageKey = `video-studio/${product}/${actorPath(actorId)}/brand/${input.id}.png`;
      const asset = await persistBrandAssetUpload({
        storageKey,
        data: input.data,
        upload: async (key, data) => {
          await r2.send(
            new PutObjectCommand({
              Bucket: bucket,
              Key: key,
              Body: data,
              ContentType: "image/png",
            }),
          );
        },
        register: async (key) => {
          const [registered] = await prisma.$queryRaw<Array<{
            id: string;
            filename: string;
            mimeType: string;
            width: number;
            height: number;
            sizeBytes: number;
            isActive: boolean;
          }>>`
            WITH deactivated AS (
              UPDATE "VideoStudioBrandAsset"
              SET "isActive" = false, "updatedAt" = CURRENT_TIMESTAMP
              WHERE "userId" = ${actorId} AND "isActive" = true
              RETURNING "id"
            )
            INSERT INTO "VideoStudioBrandAsset" (
              "id", "userId", "storageKey", "filename", "mimeType",
              "width", "height", "sizeBytes", "isActive", "updatedAt"
            )
            VALUES (
              ${input.id}, ${actorId}, ${key}, ${input.filename},
              'image/png', ${input.width}, ${input.height},
              ${input.data.byteLength}, true, CURRENT_TIMESTAMP
            )
            RETURNING "id", "filename", "mimeType", "width", "height",
              "sizeBytes", "isActive"
          `;
          if (!registered) throw new Error("Brand asset registration failed");
          return registered;
        },
        remove: async (key) => {
          await r2.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
        },
      });
      return {
        ...asset,
        previewUrl: await previewUrl(storageKey),
      } satisfies StudioAccountBrandAsset;
    },

    async savePreset(actorId, input) {
      const [count, existing] = await Promise.all([
        prisma.videoStudioPreset.count({ where: { userId: actorId } }),
        prisma.videoStudioPreset.findUnique({
          where: {
            userId_kind_name: {
              userId: actorId,
              kind: input.kind,
              name: input.name,
            },
          },
        }),
      ]);
      if (!existing && count >= 50) {
        throw new StudioAccountLibraryInputError(
          409,
          "Es können höchstens 50 persönliche Videovorlagen gespeichert werden.",
        );
      }
      const preset = await prisma.videoStudioPreset.upsert({
        where: {
          userId_kind_name: {
            userId: actorId,
            kind: input.kind,
            name: input.name,
          },
        },
        create: {
          userId: actorId,
          ...input,
          definition: input.definition as Prisma.InputJsonValue,
        },
        update: { definition: input.definition as Prisma.InputJsonValue },
      });
      return {
        created: !existing,
        preset: {
          id: preset.id,
          name: preset.name,
          kind: preset.kind as "rhythm" | "cut_sequence",
          definition: preset.definition,
        },
      };
    },

    async resolveBrandAsset(actorId, assetId) {
      const asset = await prisma.videoStudioBrandAsset.findFirst({
        where: { id: assetId, userId: actorId },
      });
      if (!asset) return null;
      return {
        id: asset.id,
        storageKey: asset.storageKey,
        filename: asset.filename,
        mimeType: asset.mimeType,
        width: asset.width,
        height: asset.height,
        sizeBytes: asset.sizeBytes,
      } satisfies StudioInternalBrandAsset;
    },

    async registerFontAsset(actorId, input) {
      const extension = input.mimeType === "font/ttf" ? "ttf" : input.mimeType === "font/otf" ? "otf" : "woff2";
      const storageKey = `video-studio/${product}/${actorPath(actorId)}/fonts/${input.assetId}.${extension}`;
      const asset = await persistBrandAssetUpload({
        storageKey,
        data: input.data,
        upload: async (key, data) => {
          await r2.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: data, ContentType: input.mimeType }));
        },
        register: async (key) => {
          const [registered] = await prisma.$queryRaw<Array<{
            id: string;
            displayName: string;
            filename: string;
            mimeType: string;
            sizeBytes: number;
            rightsConfirmedAt: Date;
            licenseReference: string | null;
          }>>`
            INSERT INTO "VideoStudioFontAsset" (
              "id", "userId", "storageKey", "displayName", "filename", "mimeType",
              "sizeBytes", "rightsConfirmedAt", "licenseReference", "updatedAt"
            ) VALUES (
              ${input.assetId}, ${actorId}, ${key}, ${input.displayName}, ${input.filename},
              ${input.mimeType}, ${input.data.byteLength}, ${input.rightsConfirmedAt},
              ${input.licenseReference ?? null}, CURRENT_TIMESTAMP
            )
            RETURNING "id", "displayName", "filename", "mimeType", "sizeBytes",
                      "rightsConfirmedAt", "licenseReference"
          `;
          if (!registered) throw new Error("Font asset registration failed");
          return registered;
        },
        remove: async (key) => {
          await r2.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
        },
      });
      return {
        assetId: asset.id,
        displayName: asset.displayName,
        filename: asset.filename,
        mimeType: asset.mimeType as StudioInternalFontAsset["mimeType"],
        sizeBytes: asset.sizeBytes,
        rightsConfirmedAt: asset.rightsConfirmedAt.toISOString(),
        ...(asset.licenseReference ? { licenseReference: asset.licenseReference } : {}),
        storageKey,
      } satisfies StudioInternalFontAsset;
    },

    async readFontAsset(actorId, assetId) {
      const [asset] = await prisma.$queryRaw<Array<{
        id: string;
        displayName: string;
        filename: string;
        mimeType: string;
        sizeBytes: number;
        rightsConfirmedAt: Date;
        licenseReference: string | null;
        storageKey: string;
      }>>`
        SELECT "id", "displayName", "filename", "mimeType", "sizeBytes",
               "rightsConfirmedAt", "licenseReference", "storageKey"
        FROM "VideoStudioFontAsset"
        WHERE "id" = ${assetId} AND "userId" = ${actorId}
        LIMIT 1
      `;
      if (!asset || asset.sizeBytes < 1 || asset.sizeBytes > 5 * 1024 * 1024) return null;
      if (!(["font/ttf", "font/otf", "font/woff2"] as string[]).includes(asset.mimeType)) return null;
      const response = await r2.send(new GetObjectCommand({ Bucket: bucket, Key: asset.storageKey }));
      if (!response.Body || response.ContentLength !== asset.sizeBytes || response.ContentType !== asset.mimeType) return null;
      const data = await response.Body.transformToByteArray();
      if (data.byteLength !== asset.sizeBytes || data.byteLength > 5 * 1024 * 1024) return null;
      return {
        assetId: asset.id,
        displayName: asset.displayName,
        filename: asset.filename,
        mimeType: asset.mimeType as StudioInternalFontAsset["mimeType"],
        sizeBytes: asset.sizeBytes,
        rightsConfirmedAt: asset.rightsConfirmedAt.toISOString(),
        ...(asset.licenseReference ? { licenseReference: asset.licenseReference } : {}),
        data,
      };
    },

    async resolveFontAsset(actorId, assetId) {
      const [asset] = await prisma.$queryRaw<Array<{
        id: string;
        displayName: string;
        filename: string;
        mimeType: string;
        sizeBytes: number;
        rightsConfirmedAt: Date;
        licenseReference: string | null;
        storageKey: string;
      }>>`
        SELECT "id", "displayName", "filename", "mimeType", "sizeBytes",
               "rightsConfirmedAt", "licenseReference", "storageKey"
        FROM "VideoStudioFontAsset"
        WHERE "id" = ${assetId} AND "userId" = ${actorId}
        LIMIT 1
      `;
      if (!asset || asset.sizeBytes < 1 || asset.sizeBytes > 5 * 1024 * 1024) return null;
      if (!(["font/ttf", "font/otf", "font/woff2"] as string[]).includes(asset.mimeType)) return null;
      return {
        assetId: asset.id,
        displayName: asset.displayName,
        filename: asset.filename,
        mimeType: asset.mimeType as StudioInternalFontAsset["mimeType"],
        sizeBytes: asset.sizeBytes,
        rightsConfirmedAt: asset.rightsConfirmedAt.toISOString(),
        ...(asset.licenseReference ? { licenseReference: asset.licenseReference } : {}),
        storageKey: asset.storageKey,
      };
    },
  };
}

function readProductConfiguration(product: StudioAccountProduct) {
  const names = PRODUCT_ENV_NAMES[product];
  return {
    databaseUrl: required(names.databaseUrl),
    r2AccountId: required(names.r2AccountId),
    r2EndpointUrl: required(names.r2EndpointUrl),
    r2AccessKeyId: required(names.r2AccessKeyId),
    r2SecretAccessKey: required(names.r2SecretAccessKey),
    r2BucketName: required(names.r2BucketName),
  };
}

function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function actorPath(actorId: string) {
  return createHash("sha256").update(actorId).digest("hex").slice(0, 32);
}
