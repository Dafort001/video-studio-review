export const VIDEO_LENGTH_PRESETS = ["short", "standard", "long", "custom"] as const;
export const VIDEO_PACE_PRESETS = ["calm", "balanced", "dynamic"] as const;
export const VIDEO_FOCUS_PRESETS = ["balanced", "exterior", "interior"] as const;
export const VIDEO_TEXT_STRATEGIES = ["minimal", "chapters", "story"] as const;
export const VIDEO_TYPOGRAPHY_PRESETS = ["quiet", "editorial", "architecture", "warm"] as const;
export const VIDEO_IMAGE_ROLES = ["exterior", "interior", "detail"] as const;

export type VideoLengthPreset = (typeof VIDEO_LENGTH_PRESETS)[number];
export type VideoPacePreset = (typeof VIDEO_PACE_PRESETS)[number];
export type VideoFocusPreset = (typeof VIDEO_FOCUS_PRESETS)[number];
export type VideoTextStrategy = (typeof VIDEO_TEXT_STRATEGIES)[number];
export type VideoTypographyPreset = (typeof VIDEO_TYPOGRAPHY_PRESETS)[number];
export type VideoImageRole = (typeof VIDEO_IMAGE_ROLES)[number];

export type VideoProjectTextBlock = {
  title: string;
  subtitle: string;
};

export type VideoProjectBriefing = {
  schemaVersion: "piximmo_video_briefing_v1";
  jobId: string;
  targetDurationSeconds: number;
  lengthPreset: VideoLengthPreset;
  pace: VideoPacePreset;
  focus: VideoFocusPreset;
  exteriorShare: number;
  textStrategy: VideoTextStrategy;
  typographyPreset: VideoTypographyPreset;
  imageRoles: Record<string, VideoImageRole>;
  texts: {
    opening: VideoProjectTextBlock;
    exterior: VideoProjectTextBlock;
    interior: VideoProjectTextBlock;
    closing: VideoProjectTextBlock;
  };
};

export type VideoProjectSourceImage = {
  id: string;
  filename: string;
  imageUrl: string;
  roomLabel: string | null;
  roomType?: string | null;
  floor?: string | null;
  motifName?: string | null;
  altText: string | null;
  width: number | null;
  height: number | null;
  order: number;
};

export type VideoTimelineTake = {
  order: number;
  imageId: string;
  filename: string;
  image_src: string;
  working_file: string;
  source_file: string;
  width: number;
  height: number;
  slot_role: "Startbild" | "Take" | "Schlussbild";
  slot_kind: "hook" | "anchor" | "info" | "pulse" | "end";
  duration_seconds: number;
  room_label_de: string;
  scene_type: "exterior" | "interior" | "detail";
  qwen_alt_text_de: string;
};

export type VideoTimelinePlan = {
  version: "piximmo_video_timeline_v1";
  saved_at: string;
  candidate_index: number;
  candidate_label: string;
  estimated_duration_hint: string;
  selected_count: number;
  selected_files: Array<{ filename: string; imageId: string }>;
  block_selection: number[];
  timeline: VideoTimelineTake[];
  text_by_filename: Record<string, VideoProjectTextBlock & {
    enabled: boolean;
    presetId: VideoTypographyPreset;
  }>;
};

const EXTERIOR_WORDS = [
  "aussen", "außen", "fassade", "garten", "balkon", "terrasse", "hof", "park",
  "see", "wasser", "ufer", "grundstueck", "grundstück", "einfahrt", "strasse", "straße",
];

const INTERIOR_WORDS = [
  "wohn", "kueche", "küche", "schlaf", "bad", "flur", "diele", "zimmer", "innen",
  "treppe", "dachboden", "buero", "büro", "essen",
];

export function inferVideoImageRole(image: Pick<VideoProjectSourceImage, "filename" | "roomLabel" | "roomType" | "altText">): VideoImageRole {
  const haystack = `${image.filename} ${image.roomLabel ?? ""} ${image.roomType ?? ""} ${image.altText ?? ""}`.toLowerCase();
  if (EXTERIOR_WORDS.some((word) => haystack.includes(word))) return "exterior";
  if (INTERIOR_WORDS.some((word) => haystack.includes(word))) return "interior";
  return "detail";
}

export function defaultDurationForPreset(preset: VideoLengthPreset) {
  if (preset === "short") return 30;
  if (preset === "long") return 70;
  return 45;
}

export function defaultExteriorShare(focus: VideoFocusPreset) {
  if (focus === "exterior") return 0.6;
  if (focus === "interior") return 0.25;
  return 0.4;
}

export function videoProjectIdForJob(reference: string) {
  return `job-${reference.toLowerCase().replace(/[^a-z0-9_-]/g, "-")}-shared-video-project-v1`;
}

export function videoCandidateIndexForJob(reference: string) {
  let hash = 0;
  for (const character of reference) hash = (hash * 31 + character.charCodeAt(0)) % 900000;
  return hash + 100000;
}

export function defaultVideoProjectBriefing(input: {
  jobId: string;
  projectName: string;
  locationLabel?: string | null;
  images: VideoProjectSourceImage[];
}): VideoProjectBriefing {
  return {
    schemaVersion: "piximmo_video_briefing_v1",
    jobId: input.jobId,
    targetDurationSeconds: 45,
    lengthPreset: "standard",
    pace: "balanced",
    focus: "balanced",
    exteriorShare: 0.4,
    textStrategy: "chapters",
    typographyPreset: "editorial",
    imageRoles: Object.fromEntries(input.images.map((image) => [image.id, inferVideoImageRole(image)])),
    texts: {
      opening: { title: input.projectName, subtitle: input.locationLabel?.trim() ?? "" },
      exterior: { title: "Außenraum & Lage", subtitle: "" },
      interior: { title: "Räume entdecken", subtitle: "" },
      closing: { title: "Interesse geweckt?", subtitle: "Jetzt Besichtigung vereinbaren" },
    },
  };
}

export function normalizeVideoProjectBriefing(value: unknown, fallback: VideoProjectBriefing): VideoProjectBriefing {
  if (!value || typeof value !== "object" || Array.isArray(value)) return fallback;
  const raw = value as Record<string, unknown>;
  const texts = raw.texts && typeof raw.texts === "object" && !Array.isArray(raw.texts)
    ? raw.texts as Record<string, unknown>
    : {};
  const imageRoles = raw.imageRoles && typeof raw.imageRoles === "object" && !Array.isArray(raw.imageRoles)
    ? Object.fromEntries(Object.entries(raw.imageRoles).flatMap(([key, role]) => (
      isOneOf(role, VIDEO_IMAGE_ROLES) ? [[key, role]] : []
    )))
    : fallback.imageRoles;

  return {
    ...fallback,
    schemaVersion: "piximmo_video_briefing_v1",
    jobId: cleanText(raw.jobId, 32) || fallback.jobId,
    targetDurationSeconds: clamp(asNumber(raw.targetDurationSeconds, fallback.targetDurationSeconds), 15, 120),
    lengthPreset: isOneOf(raw.lengthPreset, VIDEO_LENGTH_PRESETS) ? raw.lengthPreset : fallback.lengthPreset,
    pace: isOneOf(raw.pace, VIDEO_PACE_PRESETS) ? raw.pace : fallback.pace,
    focus: isOneOf(raw.focus, VIDEO_FOCUS_PRESETS) ? raw.focus : fallback.focus,
    exteriorShare: clamp(asNumber(raw.exteriorShare, fallback.exteriorShare), 0.1, 0.9),
    textStrategy: isOneOf(raw.textStrategy, VIDEO_TEXT_STRATEGIES) ? raw.textStrategy : fallback.textStrategy,
    typographyPreset: isOneOf(raw.typographyPreset, VIDEO_TYPOGRAPHY_PRESETS) ? raw.typographyPreset : fallback.typographyPreset,
    imageRoles: { ...fallback.imageRoles, ...imageRoles },
    texts: {
      opening: normalizeTextBlock(texts.opening, fallback.texts.opening),
      exterior: normalizeTextBlock(texts.exterior, fallback.texts.exterior),
      interior: normalizeTextBlock(texts.interior, fallback.texts.interior),
      closing: normalizeTextBlock(texts.closing, fallback.texts.closing),
    },
  };
}

export function buildVideoTimelinePlan(input: {
  projectName: string;
  candidateIndex: number;
  images: VideoProjectSourceImage[];
  briefing: VideoProjectBriefing;
  now?: string;
}): VideoTimelinePlan {
  const { briefing } = input;
  if (input.images.length === 0) throw new Error("Mindestens ein freigegebenes Bild ist erforderlich.");

  const images = input.images.map((image) => ({
    ...image,
    role: briefing.imageRoles[image.id] ?? inferVideoImageRole(image),
  }));
  const averageDuration = briefing.pace === "calm" ? 3.6 : briefing.pace === "dynamic" ? 2.2 : 2.9;
  const desiredCount = clamp(Math.round(briefing.targetDurationSeconds / averageDuration), Math.min(6, images.length), images.length);
  const exterior = images.filter((image) => image.role === "exterior");
  const interior = images.filter((image) => image.role === "interior");
  const detail = images.filter((image) => image.role === "detail");
  const exteriorTarget = Math.min(exterior.length, Math.round(desiredCount * briefing.exteriorShare));
  const remainingTarget = desiredCount - exteriorTarget;
  const selectedExterior = exterior.slice(0, exteriorTarget);
  const selectedOther = [...interior, ...detail].slice(0, remainingTarget);
  const remaining = images.filter((image) => !selectedExterior.includes(image) && !selectedOther.includes(image));
  const selected = [...selectedExterior, ...selectedOther, ...remaining].slice(0, desiredCount);
  const ordered = storyOrder(selected);
  const durations = distributeDurations(ordered.map((image) => image.role), briefing.targetDurationSeconds, briefing.pace, briefing.focus);
  const textByFilename: VideoTimelinePlan["text_by_filename"] = {};
  const firstExterior = ordered.findIndex((image, index) => index > 0 && image.role === "exterior");
  const firstInterior = ordered.findIndex((image, index) => index > 0 && image.role === "interior");

  const timeline = ordered.map<VideoTimelineTake>((image, index) => {
    const isFirst = index === 0;
    const isLast = index === ordered.length - 1;
    const duration = durations[index];
    const take: VideoTimelineTake = {
      order: index + 1,
      imageId: image.id,
      filename: image.filename,
      image_src: image.imageUrl,
      working_file: image.imageUrl,
      source_file: "",
      width: image.width ?? 3000,
      height: image.height ?? 2000,
      slot_role: isFirst ? "Startbild" : isLast ? "Schlussbild" : "Take",
      slot_kind: isFirst ? "hook" : isLast ? "end" : duration >= 3.4 ? "anchor" : duration <= 2.2 ? "pulse" : "info",
      duration_seconds: duration,
      room_label_de: image.roomLabel ?? image.role,
      scene_type: image.role,
      qwen_alt_text_de: image.altText ?? "",
    };
    const text = textForTake({
      index,
      isLast,
      firstExterior,
      firstInterior,
      strategy: briefing.textStrategy,
      texts: briefing.texts,
    });
    if (text && (text.title || text.subtitle)) {
      textByFilename[image.filename] = {
        enabled: true,
        presetId: briefing.typographyPreset,
        ...text,
      };
    }
    return take;
  });

  return {
    version: "piximmo_video_timeline_v1",
    saved_at: input.now ?? new Date().toISOString(),
    candidate_index: input.candidateIndex,
    candidate_label: input.projectName,
    estimated_duration_hint: `${briefing.targetDurationSeconds} Sekunden`,
    selected_count: timeline.length,
    selected_files: timeline.map((take) => ({ filename: take.filename, imageId: take.imageId })),
    block_selection: [],
    timeline,
    text_by_filename: textByFilename,
  };
}

function storyOrder<T extends { role: VideoImageRole; order: number }>(selected: T[]) {
  const exterior = selected.filter((image) => image.role === "exterior");
  const interior = selected.filter((image) => image.role !== "exterior");
  if (exterior.length === 0) return selected.slice().sort((a, b) => a.order - b.order);
  const opening = exterior.shift()!;
  const closing = exterior.length > 0 ? exterior.pop()! : opening;
  const result: T[] = [opening];
  let exteriorIndex = 0;
  interior.forEach((image, index) => {
    if (index > 0 && index % 3 === 0 && exteriorIndex < exterior.length) {
      result.push(exterior[exteriorIndex++]);
    }
    result.push(image);
  });
  while (exteriorIndex < exterior.length) result.push(exterior[exteriorIndex++]);
  if (closing !== opening) result.push(closing);
  return result;
}

function distributeDurations(
  roles: VideoImageRole[],
  target: number,
  pace: VideoPacePreset,
  focus: VideoFocusPreset,
) {
  const base = pace === "calm" ? 1.12 : pace === "dynamic" ? 0.88 : 1;
  const weights = roles.map((role, index) => {
    let value = base;
    if (index === 0) value += 0.35;
    if (index === roles.length - 1) value += 0.25;
    if (focus === "exterior" && role === "exterior") value += 0.35;
    if (focus === "interior" && role === "interior") value += 0.25;
    return value;
  });
  const weightSum = weights.reduce((sum, weight) => sum + weight, 0);
  const raw = weights.map((weight) => Math.max(1.5, target * weight / weightSum));
  const rawSum = raw.reduce((sum, duration) => sum + duration, 0);
  const normalized = raw.map((duration) => roundQuarter(duration * target / rawSum));
  const difference = roundQuarter(target - normalized.reduce((sum, duration) => sum + duration, 0));
  normalized[normalized.length - 1] = roundQuarter(Math.max(1.5, normalized[normalized.length - 1] + difference));
  return normalized;
}

function textForTake(input: {
  index: number;
  isLast: boolean;
  firstExterior: number;
  firstInterior: number;
  strategy: VideoTextStrategy;
  texts: VideoProjectBriefing["texts"];
}) {
  if (input.index === 0) return input.texts.opening;
  if (input.isLast) return input.texts.closing;
  if (input.strategy === "minimal") return null;
  if (input.index === input.firstExterior) return input.texts.exterior;
  if (input.index === input.firstInterior) return input.texts.interior;
  return null;
}

function normalizeTextBlock(value: unknown, fallback: VideoProjectTextBlock): VideoProjectTextBlock {
  if (!value || typeof value !== "object" || Array.isArray(value)) return fallback;
  const raw = value as Record<string, unknown>;
  return {
    title: cleanText(raw.title, 42),
    subtitle: cleanText(raw.subtitle, 64),
  };
}

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, maxLength) : "";
}

function asNumber(value: unknown, fallback: number) {
  const numberValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function isOneOf<T extends readonly string[]>(value: unknown, values: T): value is T[number] {
  return typeof value === "string" && values.includes(value);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function roundQuarter(value: number) {
  return Math.round(value * 4) / 4;
}
