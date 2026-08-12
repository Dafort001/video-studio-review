import { prisma } from "@/lib/prisma";
import { createHash } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { piximmoJobWhere } from "@/lib/job-scope";
import { getSignedDownloadUrl, headObject } from "@/lib/r2";
import { deliveryReadyImageWhere } from "@/lib/delivery-assets";
import { parseShotPlan, type VideoStudioJob } from "@/lib/video-studio";
import {
  publishedGalleryAssetMap,
  readPublishedGalleryRelease,
} from "@/lib/gallery-release";
import { buildGalleryRoomName } from "@/lib/gallery-room-display";
import {
  inferVideoImageRole,
  type VideoImageRole,
  type VideoProjectSourceImage,
} from "@/lib/video-project-briefing";
import {
  SHARED_VIDEO_STUDIO_SOURCE_PREVIEW_TTL_SECONDS,
  sharedVideoStudioSourcePreviewExpiresAt,
} from "@/lib/central-video-studio";
import { videoMaskCandidatesForHandoff } from "@/lib/video-studio-workflow";
import {
  activeVideoStudioSourceSetSelect,
  parsePrismaVideoStudioSourceSet,
} from "@/lib/video-studio-source-set-server";
import { videoStudioSourceSetHandoff } from "@/lib/video-studio-source-set";

type SessionUserScope = {
  userId?: string | null;
  email?: string | null;
  isAdmin?: boolean;
};

export type VideoStudioSetupJob = {
  id: string;
  reference: string;
  jobId: string;
  projectName: string;
  propertyAddress: string | null;
  readyImageCount: number;
  pendingImageCount: number;
  images: Array<VideoProjectSourceImage & { inferredRole: VideoImageRole }>;
};

export type PiximmoSharedVideoStudioJob = {
  setup: VideoStudioSetupJob;
  tenantId: string;
  sourceReferenceId: string;
  assets: Array<{
    id: string;
    kind: "image";
    storageKey: string;
    filename: string;
    width?: number;
    height?: number;
    motif?: "exterior" | "living" | "kitchen" | "dining" | "bedroom" | "bathroom" | "hallway" | "balcony" | "terrace" | "garden" | "detail" | "other";
    description?: string;
    sourcePreviewUrl: string;
    sourcePreviewUrlExpiresAt: string;
  }>;
  creativeAssets: Array<{
    assetId: string;
    kind: "occlusion_mask";
    storageKey: string;
    filename: string;
    mimeType: "image/png";
    sizeBytes: number;
    displayName: string;
    sourceAssetId: string;
  }>;
};

const videoStudioSetupJobSelect = {
  id: true,
  userId: true,
  customerCode: true,
  jobId: true,
  projectName: true,
  propertyAddress: true,
  styleModifiers: true,
  processedImages: {
    select: {
      id: true,
      deliveryKey: true,
      thumbKey: true,
      qcStatus: true,
      finalFilename: true,
      finalRoomName: true,
      finalRoomType: true,
      finalFloor: true,
      finalMotifName: true,
      roomName: true,
      roomType: true,
      floor: true,
      altText: true,
      width: true,
      height: true,
      deliveryWidth: true,
      deliveryHeight: true,
      exposeSortOrder: true,
      motifIndex: true,
      createdAt: true,
      aiOverlays: true,
    },
    orderBy: [
      { exposeSortOrder: "asc" as const },
      { motifIndex: "asc" as const },
      { createdAt: "asc" as const },
    ],
  },
} satisfies Prisma.JobSelect;

const sharedVideoStudioJobSelect = {
  ...videoStudioSetupJobSelect,
  activeVideoStudioSourceSet: { select: activeVideoStudioSourceSetSelect },
} satisfies Prisma.JobSelect;

type VideoStudioSetupJobRow = Prisma.JobGetPayload<{ select: typeof videoStudioSetupJobSelect }>;

export async function resolveSessionUser(scope: SessionUserScope) {
  if (scope.userId) {
    return { id: scope.userId };
  }
  if (!scope.email) return null;
  return prisma.user.findUnique({
    where: { email: scope.email },
    select: { id: true },
  });
}

export async function getVideoStudioJobs(scope: SessionUserScope): Promise<VideoStudioJob[]> {
  const currentUser = await resolveSessionUser(scope);
  if (!currentUser && !scope.isAdmin) return [];

  const jobs = await prisma.job.findMany({
    where: {
      ...piximmoJobWhere,
      ...(scope.isAdmin
        ? {}
        : {
            userId: currentUser?.id,
            galleryShares: {
              some: {
                active: true,
                shareType: "customer_portal",
              },
            },
          }),
      ...(scope.isAdmin ? { processedImages: { some: deliveryReadyImageWhere } } : {}),
    },
    select: {
      id: true,
      jobId: true,
      projectName: true,
      propertyAddress: true,
      styleModifiers: true,
      processedImages: {
        where: scope.isAdmin ? deliveryReadyImageWhere : {},
        select: {
          id: true,
          deliveryKey: true,
          thumbKey: true,
          finalFilename: true,
          roomName: true,
          finalRoomName: true,
          altText: true,
          qcMetadata: true,
          exposeSortOrder: true,
          motifIndex: true,
          createdAt: true,
        },
        orderBy: [
          { exposeSortOrder: "asc" },
          { motifIndex: "asc" },
          { createdAt: "asc" },
        ],
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const mapped = await Promise.all(jobs.map(async (job) => {
    const release = readPublishedGalleryRelease(job.styleModifiers);
    if (!scope.isAdmin && !release) return null;
    const releaseAssets = release ? publishedGalleryAssetMap(release) : null;
    const visibleImages = releaseAssets
      ? job.processedImages.filter((image) => releaseAssets.has(image.id))
      : job.processedImages;
    const shots = await Promise.all(visibleImages.map(async (image) => {
      const plan = parseShotPlan(image.qcMetadata);
      if (!plan) return null;
      const key = releaseAssets?.get(image.id)?.objectKey ?? image.deliveryKey ?? image.thumbKey;
      const imageUrl = await resolveImageUrl(key);
      if (!imageUrl) return null;
      return {
        ...plan,
        imageId: image.id,
        imageUrl,
        filename: image.finalFilename,
        roomLabel: image.finalRoomName ?? image.roomName,
        altText: image.altText,
      };
    }));
    const validShots = shots
      .filter((shot): shot is NonNullable<typeof shot> => Boolean(shot))
      .sort((a, b) => a.order - b.order);
    if (validShots.length === 0) return null;
    const first = validShots[0];
    return {
      id: job.id,
      jobId: job.jobId,
      projectName: job.projectName ?? `Motiv ${first.candidateIndex}`,
      propertyAddress: job.propertyAddress,
      candidateIndex: first.candidateIndex,
      candidateLabel: first.candidateLabel,
      durationSeconds: validShots.reduce((sum, shot) => sum + shot.durationSeconds, 0),
      shots: validShots,
    };
  }));

  return mapped.filter((job): job is VideoStudioJob => Boolean(job));
}

export async function getVideoStudioSetupJobs(scope: SessionUserScope): Promise<VideoStudioSetupJob[]> {
  const currentUser = await resolveSessionUser(scope);
  if (!currentUser && !scope.isAdmin) return [];
  const jobs = await prisma.job.findMany({
    where: {
      ...piximmoJobWhere,
      ...(scope.isAdmin ? {} : { userId: currentUser?.id }),
      processedImages: { some: {} },
    },
    select: videoStudioSetupJobSelect,
    orderBy: { updatedAt: "desc" },
  });

  return Promise.all(jobs.map(mapVideoStudioSetupJob));
}

export async function getVideoStudioSetupJob(scope: SessionUserScope, reference: string) {
  const currentUser = await resolveSessionUser(scope);
  if (!currentUser && !scope.isAdmin) return null;
  const normalized = reference.toUpperCase();
  const [customerCode, jobId] = normalized.split("-");
  const job = await prisma.job.findFirst({
    where: {
      ...piximmoJobWhere,
      ...(scope.isAdmin ? {} : { userId: currentUser?.id }),
      OR: [
        { id: reference },
        { jobId: normalized },
        ...(customerCode && jobId ? [{ customerCode, jobId }] : []),
      ],
    },
    select: videoStudioSetupJobSelect,
  });
  return job ? mapVideoStudioSetupJob(job) : null;
}

export async function getPiximmoSharedVideoStudioJob(
  scope: SessionUserScope,
  reference: string,
): Promise<PiximmoSharedVideoStudioJob | null> {
  const currentUser = await resolveSessionUser(scope);
  if (!currentUser && !scope.isAdmin) return null;
  const normalized = reference.toUpperCase();
  const [customerCode, jobId] = normalized.split("-");
  const job = await prisma.job.findFirst({
    where: {
      ...piximmoJobWhere,
      ...(scope.isAdmin ? {} : { userId: currentUser?.id }),
      OR: [
        { id: reference },
        { jobId: normalized },
        ...(customerCode && jobId ? [{ customerCode, jobId }] : []),
      ],
    },
    select: sharedVideoStudioJobSelect,
  });
  if (!job) return null;
  const sourcePreviewUrlExpiresAt = sharedVideoStudioSourcePreviewExpiresAt();
  if (job.activeVideoStudioSourceSet) {
    if (job.activeVideoStudioSourceSet.jobId !== job.id) {
      throw new Error("Video Studio source set owner mismatch");
    }
    const sourceSet = parsePrismaVideoStudioSourceSet(job.activeVideoStudioSourceSet);
    const sourceHandoff = await videoStudioSourceSetHandoff(
      sourceSet,
      sourcePreviewUrlExpiresAt,
      (previewKey) => getSignedDownloadUrl(
        previewKey,
        SHARED_VIDEO_STUDIO_SOURCE_PREVIEW_TTL_SECONDS,
      ),
    );
    const sourceEntryById = new Map(sourceSet.entries.map((entry) => [entry.id, entry]));
    const assets = sourceHandoff.assets.map((asset) => ({
      ...asset,
      motif: asset.motif ?? sharedStudioMotif(
        asset.filename,
        sourceEntryById.get(asset.id)?.taxonomy.roomLabel ?? null,
        sourceEntryById.get(asset.id)?.taxonomy.roomType,
      ),
    }));
    const images = assets.map((asset, index) => {
      const taxonomy = sourceEntryById.get(asset.id)!.taxonomy;
      const source: VideoProjectSourceImage = {
        id: asset.id,
        filename: asset.filename,
        imageUrl: asset.sourcePreviewUrl,
        roomLabel: taxonomy.roomLabel ?? null,
        roomType: taxonomy.roomType,
        floor: taxonomy.floor,
        motifName: taxonomy.motif,
        altText: taxonomy.description ?? null,
        width: asset.width,
        height: asset.height,
        order: index + 1,
      };
      return { ...source, inferredRole: inferVideoImageRole(source) };
    });
    return {
      setup: {
        id: job.id,
        reference: `${job.customerCode}-${job.jobId}`,
        jobId: job.jobId,
        projectName: job.projectName ?? `Auftrag ${job.jobId}`,
        propertyAddress: job.propertyAddress,
        readyImageCount: images.length,
        pendingImageCount: 0,
        images,
      },
      tenantId: job.userId ? `user:${job.userId}` : `customer:${job.customerCode}`,
      ...sourceHandoff,
      assets,
    };
  }
  const setup = await mapVideoStudioSetupJob(job);
  const setupImageById = new Map(setup.images.map((image) => [image.id, image]));
  const ready = job.processedImages.filter((image) => image.qcStatus === "delivery_ready" && image.deliveryKey);
  const readyById = new Map(ready.map((image) => [image.id, image]));
  const maskCandidates = videoMaskCandidatesForHandoff(ready);
  const creativeAssets = (await mapWithConcurrency(maskCandidates, 8, async ({ sourceAssetId, maskKey, label }) => {
      const image = readyById.get(sourceAssetId)!;
      const metadata = await headObject(maskKey);
      if (
        !metadata.ok || !metadata.exists || !metadata.size ||
        metadata.size > 16 * 1024 * 1024 ||
        metadata.contentType?.toLowerCase() !== "image/png" ||
        !/\.png$/i.test(maskKey)
      ) return null;
      const assetId = `vsm_${createHash("sha256").update(`${image.id}\0${maskKey}`).digest("hex").slice(0, 32)}`;
      return {
        assetId,
        kind: "occlusion_mask" as const,
        storageKey: maskKey,
        filename: `${assetId}.png`,
        mimeType: "image/png" as const,
        sizeBytes: metadata.size,
        displayName: label,
        sourceAssetId: image.id,
      };
  })).filter((asset): asset is NonNullable<typeof asset> => Boolean(asset));
  return {
    setup,
    tenantId: job.userId ? `user:${job.userId}` : `customer:${job.customerCode}`,
    sourceReferenceId: setup.id,
    creativeAssets,
    assets: await Promise.all(ready.map(async (image, index) => {
      const setupImage = setupImageById.get(image.id);
      const filename = setupImage?.filename || image.finalFilename || `${job.jobId}-${String(index + 1).padStart(3, "0")}.jpg`;
      const roomLabel = setupImage?.roomLabel ?? image.finalRoomName ?? image.roomName;
      return {
        id: image.id,
        kind: "image" as const,
        storageKey: image.deliveryKey!,
        filename,
        width: image.deliveryWidth ?? image.width ?? undefined,
        height: image.deliveryHeight ?? image.height ?? undefined,
        motif: sharedStudioMotif(filename, roomLabel, setupImage?.roomType),
        description: image.altText ?? undefined,
        sourcePreviewUrl: await getSignedDownloadUrl(
          image.deliveryKey!,
          SHARED_VIDEO_STUDIO_SOURCE_PREVIEW_TTL_SECONDS,
        ),
        sourcePreviewUrlExpiresAt,
      };
    })),
  };
}

async function mapWithConcurrency<T, R>(
  values: T[],
  concurrency: number,
  operation: (value: T) => Promise<R>,
) {
  const results = new Array<R>(values.length);
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, async () => {
    while (cursor < values.length) {
      const index = cursor++;
      results[index] = await operation(values[index]);
    }
  }));
  return results;
}


export async function canAccessVideoStudioJob(scope: SessionUserScope, reference: string) {
  const currentUser = await resolveSessionUser(scope);
  if (!currentUser && !scope.isAdmin) return false;
  const normalized = reference.toUpperCase();
  const [customerCode, jobId] = normalized.split("-");
  const job = await prisma.job.findFirst({
    where: {
      ...piximmoJobWhere,
      ...(scope.isAdmin ? {} : { userId: currentUser?.id }),
      OR: [
        { id: reference },
        { jobId: normalized },
        ...(customerCode && jobId ? [{ customerCode, jobId }] : []),
      ],
    },
    select: { id: true },
  });
  return Boolean(job);
}

export async function resolveImageUrl(key?: string | null) {
  if (!key) return null;
  if (key.startsWith("demo/")) return `/${key}`;
  try {
    return await getSignedDownloadUrl(key, 3600);
  } catch {
    return null;
  }
}

async function mapVideoStudioSetupJob(job: VideoStudioSetupJobRow): Promise<VideoStudioSetupJob> {
  const ready = job.processedImages.filter((image) => image.qcStatus === "delivery_ready" && image.deliveryKey);
  const release = readPublishedGalleryRelease(job.styleModifiers);
  const releaseAssets = release ? publishedGalleryAssetMap(release) : null;
  const images = (await Promise.all(ready.map(async (image, index) => {
    const imageUrl = await resolveImageUrl(image.deliveryKey ?? image.thumbKey);
    if (!imageUrl) return null;
    const released = releaseAssets?.get(image.id);
    const filename = released?.filename || image.finalFilename || `${job.jobId}-${String(index + 1).padStart(3, "0")}.jpg`;
    const roomType = released?.roomType ?? image.finalRoomType ?? image.roomType;
    const roomName = released?.roomName ?? image.finalRoomName ?? image.roomName;
    const floor = released?.floor ?? image.finalFloor ?? image.floor;
    const source: VideoProjectSourceImage = {
      id: image.id,
      filename,
      imageUrl,
      roomLabel: buildGalleryRoomName({ roomType, roomName, floor }),
      roomType,
      floor,
      motifName: image.finalMotifName,
      altText: image.altText,
      width: image.deliveryWidth ?? image.width,
      height: image.deliveryHeight ?? image.height,
      order: image.exposeSortOrder ?? image.motifIndex ?? index + 1,
    };
    return { ...source, inferredRole: inferVideoImageRole(source) };
  }))).filter((image): image is NonNullable<typeof image> => Boolean(image));
  return {
    id: job.id,
    reference: `${job.customerCode}-${job.jobId}`,
    jobId: job.jobId,
    projectName: job.projectName ?? `Auftrag ${job.jobId}`,
    propertyAddress: job.propertyAddress,
    readyImageCount: images.length,
    pendingImageCount: Math.max(job.processedImages.length - ready.length, 0),
    images,
  };
}

function sharedStudioMotif(filename: string, roomLabel: string | null, roomType?: string | null) {
  const value = `${filename} ${roomLabel ?? ""} ${roomType ?? ""}`.toLowerCase();
  const rules = [
    [["aussen", "außen", "fassade"], "exterior"],
    [["wohn"], "living"],
    [["küche", "kueche"], "kitchen"],
    [["essen"], "dining"],
    [["schlaf"], "bedroom"],
    [["bad", "dusche", "wc"], "bathroom"],
    [["flur", "diele"], "hallway"],
    [["balkon"], "balcony"],
    [["terrasse"], "terrace"],
    [["garten"], "garden"],
    [["detail"], "detail"],
  ] as const;
  return rules.find(([needles]) => needles.some((needle) => value.includes(needle)))?.[1] ?? "other";
}
