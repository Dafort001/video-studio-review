import { getModalPipelineTarget } from "@/lib/modal-config";

export type VideoWorkbenchRenderJob = {
  id: string;
  status: "queued" | "rendering" | "completed" | "failed";
  createdAt: string;
  updatedAt: string;
  sourceProduct: "piximmo" | "pixcapture" | "workbench";
  projectId: string;
  provider?: "modal-social-video";
  providerCallId?: string;
  outputUrl?: string;
  outputKey?: string;
  durationSeconds?: number;
  itemCount?: number;
  progress?: unknown;
  error?: string;
};

type Crop = {
  cx?: number;
  cy?: number;
  zoom?: number;
};

type TextOverlay = {
  title?: string;
  subtitle?: string;
  titleColor?: string;
  subtitleColor?: string;
  titleSize?: number;
  subtitleSize?: number;
  lineGap?: number;
  x?: number;
  y?: number;
};

type MotionItem = {
  id?: string;
  filename?: string;
  motion_type?: string;
  motionType?: string;
  large?: string;
  preview_large_path?: string;
  r2Key?: string;
  r2_key?: string;
  render_source_r2_key?: string;
  duration_seconds?: number;
  cutplan?: {
    duration_seconds?: number;
  };
  start_crop?: Crop;
  end_crop?: Crop;
  startCrop?: Crop;
  endCrop?: Crop;
  start?: Crop;
  end?: Crop;
  text_overlay?: TextOverlay;
  avatar_prep?: {
    candidate?: boolean;
  };
};

export type MotionPlan = {
  items?: MotionItem[];
};

type ModalStartResponse = {
  ok?: boolean;
  status?: string;
  callId?: string;
  error?: string;
};

type ModalStatusResponse = {
  ok?: boolean;
  status?: string;
  callId?: string;
  error?: string;
  progress?: unknown;
  render?: {
    ok?: boolean;
    status?: string;
    r2Key?: string;
    durationSeconds?: number;
    itemCount?: number;
    error?: string;
  };
};

const CANDIDATE_10_MAKLERIN_CLIP_R2_KEY =
  "video-workbench/source-assets/motion/candidate-10-maklerin-first-preview.mp4";

function nowIso() {
  return new Date().toISOString();
}

function safeId(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 100) || "video-workbench";
}

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
}

function normalizeCrop(crop?: Crop) {
  return {
    cx: clamp(Number(crop?.cx ?? 0.5), 0.08, 0.92),
    cy: clamp(Number(crop?.cy ?? 0.5), 0.08, 0.92),
    zoom: clamp(Number(crop?.zoom ?? 1.12), 1, 2.2),
  };
}

function isZoomOnlyMotion(type?: string) {
  return type === "slow_push" || type === "pull_out";
}

function motionTypeForItem(item: MotionItem) {
  return item.motion_type || item.motionType;
}

function normalizedMotionCrops(item: MotionItem) {
  const startCrop = normalizeCrop(item.start_crop || item.startCrop || item.start);
  const endCrop = normalizeCrop(item.end_crop || item.endCrop || item.end);
  if (!isZoomOnlyMotion(motionTypeForItem(item))) {
    return { startCrop, endCrop };
  }
  return {
    startCrop,
    endCrop: {
      ...endCrop,
      cx: startCrop.cx,
      cy: startCrop.cy,
    },
  };
}

function durationForItem(item: MotionItem) {
  return clamp(Number(item.duration_seconds ?? item.cutplan?.duration_seconds ?? 1.5), 0.25, 12);
}

function modalHeaders() {
  const headers: Record<string, string> = { "content-type": "application/json" };
  const secret = process.env.MODAL_WEBHOOK_SECRET?.trim();
  if (secret) headers["x-modal-trigger-secret"] = secret;
  return headers;
}

function sourceR2KeyForItem(item: MotionItem) {
  if (item.r2Key) return item.r2Key;
  if (item.r2_key) return item.r2_key;
  if (item.render_source_r2_key) return item.render_source_r2_key;
  const webPath = item.preview_large_path || item.large;
  if (!webPath) return null;
  const normalizedPath = webPath
    .replace(/^\/+/, "")
    .replace(/^video-workbench\//, "")
    .replace(/^\.\.\//, "");
  if (normalizedPath.startsWith("all_highres_jpgs_by_candidate/")) {
    return `video-workbench/source-assets/${normalizedPath}`;
  }
  return `video-workbench/source-assets/motion/${normalizedPath}`;
}

function outputUrlForJob(job: VideoWorkbenchRenderJob) {
  return `/api/video-workbench/projects/${safeId(job.projectId)}/render/download?jobId=${encodeURIComponent(job.id)}`;
}

function outputKeyForJob(job: VideoWorkbenchRenderJob) {
  return `video-workbench/renders/${safeId(job.projectId)}/${safeId(job.id)}.mp4`;
}

function renderScenesFromPlan(motionPlan: MotionPlan) {
  return (motionPlan.items ?? [])
    .map((item, index) => {
      if (item.avatar_prep?.candidate) {
        return {
          clientSceneId: item.id || `scene-${index + 1}`,
          filename: "candidate-10-maklerin-first-preview.mp4",
          videoR2Key: CANDIDATE_10_MAKLERIN_CLIP_R2_KEY,
          durationSeconds: durationForItem(item),
          textOverlay: item.text_overlay ?? {},
        };
      }

      const r2Key = sourceR2KeyForItem(item);
      if (!r2Key) return null;
      const { startCrop, endCrop } = normalizedMotionCrops(item);
      const motionType = motionTypeForItem(item);
      return {
        clientSceneId: item.id || `scene-${index + 1}`,
        filename: item.filename || `scene-${index + 1}.jpg`,
        motionType,
        r2Key,
        durationSeconds: durationForItem(item),
        startCrop,
        endCrop,
        textOverlay: item.text_overlay ?? {},
      };
    })
    .filter(Boolean);
}

export function createRenderJob(input: {
  projectId: string;
  sourceProduct?: "piximmo" | "pixcapture" | "workbench" | null;
}): VideoWorkbenchRenderJob {
  const createdAt = nowIso();
  return {
    id: `render-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    status: "queued",
    createdAt,
    updatedAt: createdAt,
    sourceProduct: input.sourceProduct ?? "workbench",
    projectId: safeId(input.projectId),
    provider: "modal-social-video",
  };
}

export async function startVideoWorkbenchRenderJob(input: {
  job: VideoWorkbenchRenderJob;
  motionPlan: MotionPlan;
}): Promise<VideoWorkbenchRenderJob> {
  const scenes = renderScenesFromPlan(input.motionPlan);
  if (!scenes.length) {
    throw new Error("Der Motion-Plan enthaelt keine R2-Quellbilder.");
  }

  const target = getModalPipelineTarget("object-video-render");
  const outputKey = outputKeyForJob(input.job);
  const response = await fetch(new URL("/render/workbench/start", target.url), {
    method: "POST",
    headers: modalHeaders(),
    cache: "no-store",
    body: JSON.stringify({
      schemaVersion: "pix_video_workbench_render_request_v1",
      renderJobId: input.job.id,
      projectId: safeId(input.job.projectId),
      sourceProduct: input.job.sourceProduct,
      outputKey,
      fps: 60,
      scenes,
    }),
  });
  const data = (await response.json().catch(() => ({}))) as ModalStartResponse;
  if (!response.ok || data.ok !== true || !data.callId) {
    throw new Error(data.error || "Modal-Render konnte nicht gestartet werden.");
  }

  return {
    ...input.job,
    status: "rendering",
    updatedAt: nowIso(),
    provider: "modal-social-video",
    providerCallId: data.callId,
    outputKey,
    outputUrl: outputUrlForJob(input.job),
    durationSeconds: scenes.reduce((sum, scene) => sum + Number(scene?.durationSeconds ?? 0), 0),
    itemCount: scenes.length,
  };
}

export async function refreshVideoWorkbenchRenderJob(job: VideoWorkbenchRenderJob): Promise<VideoWorkbenchRenderJob> {
  if (!job.providerCallId || job.status === "completed" || job.status === "failed") {
    return job;
  }

  const target = getModalPipelineTarget("object-video-render");
  const statusUrl = new URL(`/render/workbench/status/${encodeURIComponent(job.providerCallId)}`, target.url);
  statusUrl.searchParams.set("renderJobId", job.id);
  const response = await fetch(statusUrl, {
    method: "GET",
    headers: modalHeaders(),
    cache: "no-store",
  });
  const data = (await response.json().catch(() => ({}))) as ModalStatusResponse;
  if (!response.ok || data.ok !== true) {
    return {
      ...job,
      status: "failed",
      updatedAt: nowIso(),
      error: data.error || "Modal-Renderstatus konnte nicht gelesen werden.",
    };
  }

  if (data.status !== "done") {
    return {
      ...job,
      status: "rendering",
      updatedAt: nowIso(),
      progress: data.progress,
    };
  }

  if (data.render?.ok !== true || !data.render.r2Key) {
    return {
      ...job,
      status: "failed",
      updatedAt: nowIso(),
      progress: data.progress,
      error: data.render?.error || "Modal-Render endete ohne R2-Video.",
    };
  }

  return {
    ...job,
    status: "completed",
    updatedAt: nowIso(),
    progress: data.progress,
    outputKey: data.render.r2Key,
    outputUrl: outputUrlForJob(job),
    durationSeconds: data.render.durationSeconds ?? job.durationSeconds,
    itemCount: data.render.itemCount ?? job.itemCount,
  };
}
