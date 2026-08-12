import {
  readVideoWorkbenchProject,
  writeVideoWorkbenchProject,
  type VideoWorkbenchProject,
} from "@/lib/video-workbench-projects";

export const DEFAULT_VIDEO_WORKBENCH_PROJECT_ID = "candidate-10-shared-video-project-v1";

export type VideoProvider = "google" | "fal";
export type VideoResolution = "720p" | "1080p" | "4k";
export type VideoQualityPreset =
  | "probe_lite_720p"
  | "product_fast_720p"
  | "final_standard_4k";

export type VideoCostInput = {
  provider: VideoProvider;
  model: string;
  durationSeconds: number;
  resolution: VideoResolution;
  generateAudio: boolean;
};

export type VideoQualityPresetConfig = {
  id: VideoQualityPreset;
  label: string;
  purpose: string;
  provider: VideoProvider;
  model: string;
  durationSeconds: number;
  resolution: VideoResolution;
  aspectRatio: "9:16";
  generateAudio: boolean;
};

export type VideoCostEstimate = VideoCostInput & {
  currency: "USD";
  unitPriceUsd: number;
  estimatedCostUsd: number;
  estimatedCostCents: number;
};

export type VideoWorkbenchProviderJob = {
  id: string;
  provider: VideoProvider;
  model: string;
  status: "queued" | "running" | "completed" | "failed";
  operationName?: string | null;
  requestId?: string | null;
  videoUri?: string | null;
  startedAt?: string | null;
  updatedAt: string;
  completedAt?: string | null;
  durationSeconds: number;
  resolution: VideoResolution;
  generateAudio: boolean;
  qualityPreset?: VideoQualityPreset | null;
  qualityLabel?: string | null;
  estimatedCostUsd: number;
  billedCostUsd?: number | null;
  costEstimated: boolean;
  promptLength?: number;
  imageUrl?: string | null;
  errorMessage?: string | null;
  raw?: unknown;
};

export const VIDEO_QUALITY_PRESETS: Record<VideoQualityPreset, VideoQualityPresetConfig> = {
  probe_lite_720p: {
    id: "probe_lite_720p",
    label: "Probe / Lite",
    purpose: "Gueltige Route, Prompt und Motiv pruefen, ohne viel Budget zu verbrennen.",
    provider: "google",
    model: "veo-3.1-lite-generate-preview",
    durationSeconds: 4,
    resolution: "720p",
    aspectRatio: "9:16",
    generateAudio: true,
  },
  product_fast_720p: {
    id: "product_fast_720p",
    label: "Produktprobe / Fast 720p",
    purpose: "Realistische PixImmo-Produktqualitaet fuer normale Test- und Arbeitsclips.",
    provider: "google",
    model: "veo-3.1-fast-generate-preview",
    durationSeconds: 4,
    resolution: "720p",
    aspectRatio: "9:16",
    generateAudio: true,
  },
  final_standard_4k: {
    id: "final_standard_4k",
    label: "Final / Standard 4K",
    purpose: "Konservative Endkalkulation fuer finale Premium- oder Hero-Clips.",
    provider: "google",
    model: "veo-3.1-generate-preview",
    durationSeconds: 4,
    resolution: "4k",
    aspectRatio: "9:16",
    generateAudio: true,
  },
};

type ProviderJobsData = {
  jobs?: VideoWorkbenchProviderJob[];
  costs?: {
    currency: "USD";
    estimatedTotalUsd: number;
    billedTotalUsd: number;
    jobCount: number;
    completedJobCount: number;
    updatedAt: string;
  };
};

const GOOGLE_VEO_PRICES: Record<string, Partial<Record<VideoResolution, number>>> = {
  "veo-3.1-generate-preview": { "720p": 0.4, "1080p": 0.4, "4k": 0.6 },
  "veo-3.1-fast-generate-preview": { "720p": 0.1, "1080p": 0.12, "4k": 0.3 },
  "veo-3.1-lite-generate-preview": { "720p": 0.05, "1080p": 0.08 },
};

const FAL_VEO_PRICES: Record<string, {
  audio: Partial<Record<VideoResolution, number>>;
  noAudio: Partial<Record<VideoResolution, number>>;
}> = {
  "fal-ai/veo3.1/image-to-video": {
    audio: { "720p": 0.4, "1080p": 0.4, "4k": 0.6 },
    noAudio: { "720p": 0.2, "1080p": 0.2, "4k": 0.4 },
  },
  "fal-ai/veo3.1/fast/image-to-video": {
    audio: { "720p": 0.15, "1080p": 0.15, "4k": 0.35 },
    noAudio: { "720p": 0.1, "1080p": 0.1, "4k": 0.3 },
  },
  "fal-ai/veo3.1/lite/image-to-video": {
    audio: { "720p": 0.05, "1080p": 0.08 },
    noAudio: { "720p": 0.03, "1080p": 0.05 },
  },
  "fal-ai/veo2/image-to-video": {
    audio: { "720p": 0.5, "1080p": 0.5 },
    noAudio: { "720p": 0.5, "1080p": 0.5 },
  },
};

function roundUsd(value: number) {
  return Math.round(value * 10000) / 10000;
}

export function estimateVideoGenerationCost(input: VideoCostInput): VideoCostEstimate {
  const priceMap = input.provider === "google"
    ? GOOGLE_VEO_PRICES[input.model]
    : FAL_VEO_PRICES[input.model]?.[input.generateAudio ? "audio" : "noAudio"];
  const unitPriceUsd = priceMap?.[input.resolution];

  if (typeof unitPriceUsd !== "number") {
    throw new Error(`Kein Kostenmodell fuer ${input.provider}/${input.model}/${input.resolution}.`);
  }

  const estimatedCostUsd = roundUsd(unitPriceUsd * input.durationSeconds);
  return {
    ...input,
    currency: "USD",
    unitPriceUsd,
    estimatedCostUsd,
    estimatedCostCents: Math.round(estimatedCostUsd * 100),
  };
}

export function resolveVideoQualityPreset(preset?: string | null) {
  if (preset === "product_fast_1080p") {
    return VIDEO_QUALITY_PRESETS.product_fast_720p;
  }
  if (preset && preset in VIDEO_QUALITY_PRESETS) {
    return VIDEO_QUALITY_PRESETS[preset as VideoQualityPreset];
  }
  return VIDEO_QUALITY_PRESETS.product_fast_720p;
}

export function listVideoQualityPresets() {
  return Object.values(VIDEO_QUALITY_PRESETS).map((preset) => ({
    ...preset,
    costEstimate: estimateVideoGenerationCost(preset),
  }));
}

function providerJobsData(project: VideoWorkbenchProject): ProviderJobsData {
  const section = project.sections.providerJobs as { data?: unknown } | undefined;
  const data = section?.data;
  return data && typeof data === "object" ? data as ProviderJobsData : {};
}

function summarizeJobs(jobs: VideoWorkbenchProviderJob[]) {
  const estimatedTotalUsd = roundUsd(jobs.reduce((sum, job) => sum + job.estimatedCostUsd, 0));
  const billedTotalUsd = roundUsd(jobs.reduce((sum, job) => {
    if (job.status !== "completed") return sum;
    return sum + (typeof job.billedCostUsd === "number" ? job.billedCostUsd : job.estimatedCostUsd);
  }, 0));

  return {
    currency: "USD" as const,
    estimatedTotalUsd,
    billedTotalUsd,
    jobCount: jobs.length,
    completedJobCount: jobs.filter((job) => job.status === "completed").length,
    updatedAt: new Date().toISOString(),
  };
}

export async function upsertVideoWorkbenchProviderJob(
  projectId: string,
  nextJob: VideoWorkbenchProviderJob,
) {
  const project = await readVideoWorkbenchProject(projectId);
  const current = providerJobsData(project);
  const jobs = [...(current.jobs ?? [])];
  const index = jobs.findIndex((job) => job.id === nextJob.id);

  if (index >= 0) {
    jobs[index] = { ...jobs[index], ...nextJob };
  } else {
    jobs.unshift(nextJob);
  }

  const savedAt = new Date().toISOString();
  return writeVideoWorkbenchProject({
    ...project,
    updatedAt: savedAt,
    revision: Number(project.revision || 0) + 1,
    sections: {
      ...project.sections,
      providerJobs: {
        savedAt,
        data: {
          ...current,
          jobs,
          costs: summarizeJobs(jobs),
        },
      },
    },
    lastWriter: {
      page: "provider",
      sourceProduct: "workbench",
      savedAt,
    },
  });
}

export async function readVideoWorkbenchProviderJob(projectId: string, jobId: string) {
  const project = await readVideoWorkbenchProject(projectId);
  const current = providerJobsData(project);
  return (current.jobs ?? []).find((job) => job.id === jobId) ?? null;
}
