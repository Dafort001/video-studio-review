import { Prisma } from "@prisma/client";
import demoCandidates from "@/data/video-studio-demo-candidates.json";

export const VIDEO_STUDIO_METADATA_KEY = "videoStudio";

export const VIDEO_STUDIO_MOTIONS = [
  "still",
  "push_in",
  "pull_back",
  "pan_left",
  "pan_right",
  "tilt_up",
  "tilt_down",
] as const;

export type VideoStudioMotion = (typeof VIDEO_STUDIO_MOTIONS)[number];

export type VideoStudioCrop = {
  x: number;
  y: number;
  scale: number;
};

export type VideoStudioShotPlan = {
  candidateIndex: number;
  candidateLabel: string;
  order: number;
  durationSeconds: number;
  motionType: VideoStudioMotion;
  startCrop: VideoStudioCrop;
  endCrop: VideoStudioCrop;
  caption: string;
  promptNote?: string;
  brokerPrompt?: string;
  brokerEnabled?: boolean;
  source?: string;
};

export type VideoStudioShot = VideoStudioShotPlan & {
  imageId: string;
  imageUrl: string;
  filename: string | null;
  roomLabel: string | null;
  altText: string | null;
};

export type VideoStudioJob = {
  id: string;
  jobId: string;
  projectName: string;
  propertyAddress: string | null;
  candidateIndex: number;
  candidateLabel: string;
  durationSeconds: number;
  shots: VideoStudioShot[];
};

export type DemoCandidate = (typeof demoCandidates.candidates)[number];

export const motionLabels: Record<VideoStudioMotion, string> = {
  still: "Standbild",
  push_in: "Langsam hinein",
  pull_back: "Langsam heraus",
  pan_left: "Nach links",
  pan_right: "Nach rechts",
  tilt_up: "Nach oben",
  tilt_down: "Nach unten",
};

export function isVideoStudioMotion(value: unknown): value is VideoStudioMotion {
  return typeof value === "string" && (VIDEO_STUDIO_MOTIONS as readonly string[]).includes(value);
}

export function normalizeCrop(value: unknown, fallback: VideoStudioCrop): VideoStudioCrop {
  if (!value || typeof value !== "object" || Array.isArray(value)) return fallback;
  const source = value as Record<string, unknown>;
  return {
    x: asFiniteNumber(source.x, fallback.x),
    y: asFiniteNumber(source.y, fallback.y),
    scale: clamp(asFiniteNumber(source.scale, fallback.scale), 1, 1.6),
  };
}

export function defaultStartCrop(): VideoStudioCrop {
  return { x: 8, y: 8, scale: 1 };
}

export function defaultEndCrop(motionType: VideoStudioMotion): VideoStudioCrop {
  switch (motionType) {
    case "push_in":
      return { x: 8, y: 8, scale: 1.12 };
    case "pull_back":
      return { x: 8, y: 8, scale: 1 };
    case "pan_left":
      return { x: 4, y: 8, scale: 1.08 };
    case "pan_right":
      return { x: 12, y: 8, scale: 1.08 };
    case "tilt_up":
      return { x: 8, y: 4, scale: 1.08 };
    case "tilt_down":
      return { x: 8, y: 12, scale: 1.08 };
    case "still":
    default:
      return { x: 8, y: 8, scale: 1 };
  }
}

export function parseShotPlan(value: unknown): VideoStudioShotPlan | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const root = value as Record<string, unknown>;
  const raw = root[VIDEO_STUDIO_METADATA_KEY];
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const source = raw as Record<string, unknown>;
  const candidateIndex = asFiniteNumber(source.candidateIndex, 0);
  const order = asFiniteNumber(source.order, 0);
  const motionType = isVideoStudioMotion(source.motionType) ? source.motionType : "still";
  if (!candidateIndex || !order) return null;

  return {
    candidateIndex,
    candidateLabel: typeof source.candidateLabel === "string" ? source.candidateLabel : `Motiv ${candidateIndex}`,
    order,
    durationSeconds: clamp(asFiniteNumber(source.durationSeconds, 3), 0.5, 8),
    motionType,
    startCrop: normalizeCrop(source.startCrop, defaultStartCrop()),
    endCrop: normalizeCrop(source.endCrop, defaultEndCrop(motionType)),
    caption: typeof source.caption === "string" ? source.caption : "",
    promptNote: typeof source.promptNote === "string" ? source.promptNote : "",
    brokerPrompt: typeof source.brokerPrompt === "string" ? source.brokerPrompt : "",
    brokerEnabled: source.brokerEnabled === true,
    source: typeof source.source === "string" ? source.source : "piximmo-video-studio",
  };
}

export function mergeShotPlanMetadata(existing: Prisma.JsonValue | null | undefined, patch: Partial<VideoStudioShotPlan>) {
  const base = existing && typeof existing === "object" && !Array.isArray(existing)
    ? { ...(existing as Record<string, unknown>) }
    : {};
  const current = parseShotPlan(base);
  const motionType = patch.motionType ?? current?.motionType ?? "still";
  const nextPlan: VideoStudioShotPlan = {
    candidateIndex: patch.candidateIndex ?? current?.candidateIndex ?? 0,
    candidateLabel: patch.candidateLabel ?? current?.candidateLabel ?? "Motiv",
    order: patch.order ?? current?.order ?? 1,
    durationSeconds: patch.durationSeconds ?? current?.durationSeconds ?? 3,
    motionType,
    startCrop: patch.startCrop ?? current?.startCrop ?? defaultStartCrop(),
    endCrop: patch.endCrop ?? current?.endCrop ?? defaultEndCrop(motionType),
    caption: patch.caption ?? current?.caption ?? "",
    promptNote: patch.promptNote ?? current?.promptNote ?? "",
    brokerPrompt: patch.brokerPrompt ?? current?.brokerPrompt ?? "",
    brokerEnabled: patch.brokerEnabled ?? current?.brokerEnabled ?? false,
    source: patch.source ?? current?.source ?? "piximmo-video-studio",
  };
  return {
    ...base,
    [VIDEO_STUDIO_METADATA_KEY]: nextPlan,
  } satisfies Prisma.JsonObject;
}

export function buildBrokerPrompt(input: {
  candidateLabel: string;
  shotCaption: string;
  motionLabel: string;
  customPrompt?: string | null;
}) {
  const custom = input.customPrompt?.trim();
  if (custom) return custom;
  return [
    `Eine sympathische Immobilienmaklerin praesentiert ${input.candidateLabel}.`,
    `Sie steht natuerlich im Bild, spricht ruhig und einladend, passend zu: ${input.shotCaption || "hochwertige Immobilienaufnahme"}.`,
    `Kamerabewegung: ${input.motionLabel}.`,
    "Stil: professionelles Immobilienvideo, realistisch, hell, vertrauenswuerdig, ohne uebertriebene Werbung.",
  ].join(" ");
}

export function demoCandidateByIndex(candidateIndex: number) {
  return demoCandidates.candidates.find((candidate) => candidate.candidateIndex === candidateIndex) ?? null;
}

function asFiniteNumber(value: unknown, fallback: number) {
  const numberValue = typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
