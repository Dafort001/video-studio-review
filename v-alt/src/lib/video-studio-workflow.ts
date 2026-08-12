import type {
  SharedStudioSceneLayer,
  SharedStudioTake,
  SharedStudioTypographyElement,
} from "@/lib/shared-video-studio";

export const VIDEO_STUDIO_WORKFLOW_STEPS = [
  "brand",
  "gallery",
  "timeline",
  "scene",
  "preview_ai",
] as const;

export type VideoStudioWorkflowStep = (typeof VIDEO_STUDIO_WORKFLOW_STEPS)[number];

export type MotionClass = "2D" | "DEPTH_3D" | "GENERATIVE_3D";
export type MotionSafety = "SAFE" | "DEPTH_APPROXIMATION" | "GENERATIVE";
export type MotionSourceGroup = "source_based" | "generative_ai";

export type StudioMotionDefinition = {
  id: string;
  label: string;
  motionClass: MotionClass;
  safety: MotionSafety;
  sourceGroup: MotionSourceGroup;
  family: "classic" | "depth" | "perspective" | "outpainting" | "focus";
  phase: 1 | 2 | 3 | 4;
  sharedMotion?: SharedStudioTake["motion"];
};

const classic = (
  id: string,
  label: string,
  sharedMotion?: SharedStudioTake["motion"],
): StudioMotionDefinition => ({
  id,
  label,
  motionClass: "2D",
  safety: "SAFE",
  sourceGroup: "source_based",
  family: "classic",
  phase: 1,
  sharedMotion,
});

const depth = (id: string, label: string): StudioMotionDefinition => ({
  id,
  label,
  motionClass: "DEPTH_3D",
  safety: "DEPTH_APPROXIMATION",
  sourceGroup: "source_based",
  family: "depth",
  phase: 2,
});

const generative = (
  id: string,
  label: string,
  family: StudioMotionDefinition["family"] = "perspective",
  phase: 3 | 4 = 3,
): StudioMotionDefinition => ({
  id,
  label,
  motionClass: "GENERATIVE_3D",
  safety: "GENERATIVE",
  sourceGroup: "generative_ai",
  family,
  phase,
});

export const VIDEO_STUDIO_MOTION_CATALOG: readonly StudioMotionDefinition[] = [
  classic("PAN_LEFT", "Pan nach links", "glide_left"),
  classic("PAN_RIGHT", "Pan nach rechts", "glide_right"),
  classic("TILT_UP", "Tilt nach oben", "look_up"),
  classic("TILT_DOWN", "Tilt nach unten", "look_down"),
  classic("DIAGONAL_UP_LEFT", "Diagonal links oben"),
  classic("DIAGONAL_UP_RIGHT", "Diagonal rechts oben"),
  classic("DIAGONAL_DOWN_LEFT", "Diagonal links unten"),
  classic("DIAGONAL_DOWN_RIGHT", "Diagonal rechts unten"),
  classic("ZOOM_IN", "Zoom hinein", "move_closer"),
  classic("ZOOM_OUT", "Zoom heraus", "move_away"),
  classic("PUSH_IN_2D", "Ruhiger Push-in", "move_closer"),
  classic("PULL_OUT_2D", "Ruhiger Pull-out", "move_away"),
  classic("CRASH_ZOOM_IN", "Schneller Zoom hinein"),
  classic("CRASH_ZOOM_OUT", "Schneller Zoom heraus"),
  classic("KEN_BURNS", "Ken Burns", "detail_drift"),
  classic("ROLL_CLOCKWISE", "Drehung im Uhrzeigersinn"),
  classic("ROLL_COUNTERCLOCKWISE", "Drehung gegen den Uhrzeigersinn"),
  classic("DUTCH_ANGLE_IN", "In den Dutch Angle"),
  classic("DUTCH_ANGLE_OUT", "Aus dem Dutch Angle"),
  classic("DRIFT", "Sehr ruhiger Drift", "detail_drift"),
  classic("FLOAT", "Leichtes Schweben", "detail_drift"),
  classic("WHIP_PAN_LEFT", "Whip-Pan links"),
  classic("WHIP_PAN_RIGHT", "Whip-Pan rechts"),
  depth("TRUCK_LEFT", "Truck links"),
  depth("TRUCK_RIGHT", "Truck rechts"),
  depth("PEDESTAL_UP", "Pedestal hoch"),
  depth("PEDESTAL_DOWN", "Pedestal runter"),
  depth("DOLLY_IN", "Dolly hinein"),
  depth("DOLLY_OUT", "Dolly heraus"),
  depth("DOLLY_DIAGONAL_LEFT", "Dolly diagonal links"),
  depth("DOLLY_DIAGONAL_RIGHT", "Dolly diagonal rechts"),
  depth("CRANE_UP", "Crane hoch"),
  depth("CRANE_DOWN", "Crane runter"),
  depth("JIB_IN", "Jib hinein"),
  depth("JIB_OUT", "Jib heraus"),
  depth("ARC_LEFT", "Bogen links"),
  depth("ARC_RIGHT", "Bogen rechts"),
  depth("ORBIT_LEFT", "Orbit links"),
  depth("ORBIT_RIGHT", "Orbit rechts"),
  depth("PARALLAX_LEFT", "Parallaxe links"),
  depth("PARALLAX_RIGHT", "Parallaxe rechts"),
  depth("PARALLAX_UP", "Parallaxe hoch"),
  depth("PARALLAX_DOWN", "Parallaxe runter"),
  depth("FOREGROUND_REVEAL_LEFT", "Vordergrund-Reveal links"),
  depth("FOREGROUND_REVEAL_RIGHT", "Vordergrund-Reveal rechts"),
  depth("PUSH_THROUGH", "Durch den Vordergrund fahren"),
  depth("PULL_BACK_REVEAL", "Vom Detail zum Raum öffnen"),
  depth("DOLLY_ZOOM_IN", "Dolly-Zoom hinein"),
  depth("DOLLY_ZOOM_OUT", "Dolly-Zoom heraus"),
  generative("VIEW_YAW_LEFT", "Perspektive nach links drehen"),
  generative("VIEW_YAW_RIGHT", "Perspektive nach rechts drehen"),
  generative("VIEW_PITCH_UP", "Perspektive nach oben"),
  generative("VIEW_PITCH_DOWN", "Perspektive nach unten"),
  generative("HIGH_ANGLE_VIEW", "Höherer Kamerastandpunkt"),
  generative("LOW_ANGLE_VIEW", "Niedriger Kamerastandpunkt"),
  generative("BIRD_EYE_VIEW", "Vogelperspektive"),
  generative("TOP_DOWN_VIEW", "Senkrechte Draufsicht"),
  generative("WORM_EYE_VIEW", "Froschperspektive"),
  generative("ORBIT_GENERATIVE_LEFT", "Generativer Orbit links"),
  generative("ORBIT_GENERATIVE_RIGHT", "Generativer Orbit rechts"),
  generative("SIDE_VIEW_45", "Neue 45°-Seitenansicht"),
  generative("SIDE_VIEW_90", "Neue 90°-Seitenansicht"),
  generative("REAR_VIEW_180", "Neue gegenüberliegende Ansicht"),
  generative("CAMERA_POSITION_LEFT", "Aufnahmeort nach links"),
  generative("CAMERA_POSITION_RIGHT", "Aufnahmeort nach rechts"),
  generative("CAMERA_POSITION_FORWARD", "Aufnahmeort nach vorn"),
  generative("CAMERA_POSITION_BACKWARD", "Aufnahmeort nach hinten"),
  generative("CAMERA_POSITION_HIGHER", "Aufnahmeort höher"),
  generative("CAMERA_POSITION_LOWER", "Aufnahmeort niedriger"),
  generative("CORNER_TO_CORNER", "Von Ecke zu Ecke"),
  generative("GENERATIVE_DOLLY_IN", "Generativer Dolly hinein", "perspective", 4),
  generative("GENERATIVE_DOLLY_OUT", "Generativer Dolly heraus", "perspective", 4),
  generative("GENERATIVE_WALK_IN", "Generativ in den Raum gehen", "perspective", 4),
  generative("GENERATIVE_WALK_THROUGH", "Generativer Walk-through", "perspective", 4),
  generative("GENERATIVE_CRANE_UP", "Generativer Crane hoch", "perspective", 4),
  generative("GENERATIVE_CRANE_DOWN", "Generativer Crane runter", "perspective", 4),
  generative("OUTPAINT_LEFT", "Links erweitern", "outpainting"),
  generative("OUTPAINT_RIGHT", "Rechts erweitern", "outpainting"),
  generative("OUTPAINT_UP", "Oben erweitern", "outpainting"),
  generative("OUTPAINT_DOWN", "Unten erweitern", "outpainting"),
  generative("OUTPAINT_ALL", "Rundherum erweitern", "outpainting"),
  generative("GENERATIVE_ZOOM_OUT", "Generativer Zoom-out", "outpainting"),
  generative("EXTENDED_PAN_LEFT", "Erweiterter Pan links", "outpainting"),
  generative("EXTENDED_PAN_RIGHT", "Erweiterter Pan rechts", "outpainting"),
  { ...depth("RACK_FOCUS_NEAR_TO_FAR", "Fokus nah zu fern"), family: "focus" },
  { ...depth("RACK_FOCUS_FAR_TO_NEAR", "Fokus fern zu nah"), family: "focus" },
  { ...depth("SUBJECT_LOCK", "Motivposition halten"), family: "focus" },
  { ...depth("BACKGROUND_DRIFT", "Hintergrund-Drift"), family: "focus" },
  { ...depth("FOREGROUND_DRIFT", "Vordergrund-Drift"), family: "focus" },
  { ...classic("CAMERA_BREATH", "Leichte Kamerabewegung", "detail_drift"), family: "focus" },
  { ...classic("HANDHELD_SUBTLE", "Sehr dezente Handkamera"), family: "focus" },
] as const;

export const VIDEO_STUDIO_MOTION_PARAMETERS = [
  "direction", "duration", "strength", "start_position", "end_position",
  "start_scale", "end_scale", "rotation", "camera_angle", "camera_height",
  "viewpoint_change", "parallax_strength", "depth_strength", "focus_start",
  "focus_end", "anchor_point", "subject_lock", "motion_blur", "easing",
  "hold_start", "hold_end", "seed", "generative_model", "preserve_geometry",
  "allow_outpainting",
] as const;

export const VIDEO_STUDIO_EASINGS = [
  "linear", "ease_in", "ease_out", "ease_in_out", "smooth",
  "cinematic_slow", "cinematic_accelerate", "cinematic_decelerate",
] as const;

export const RENDERABLE_SOURCE_MOTION_IDS = new Set([
  "PAN_LEFT", "PAN_RIGHT", "TILT_UP", "TILT_DOWN",
  "DIAGONAL_UP_LEFT", "DIAGONAL_UP_RIGHT", "DIAGONAL_DOWN_LEFT", "DIAGONAL_DOWN_RIGHT",
  "ZOOM_IN", "ZOOM_OUT", "PUSH_IN_2D", "PULL_OUT_2D",
  "CRASH_ZOOM_IN", "CRASH_ZOOM_OUT", "KEN_BURNS",
  "ROLL_CLOCKWISE", "ROLL_COUNTERCLOCKWISE", "DUTCH_ANGLE_IN", "DUTCH_ANGLE_OUT",
  "DRIFT", "FLOAT",
]);

export function sourceMotionPatch(
  definition: StudioMotionDefinition,
  take: Pick<SharedStudioTake, "startFrame" | "endFrame">,
  maximumScale = 1.3,
): (Pick<SharedStudioTake, "motion" | "startFrame" | "endFrame"> & { motionSpec: NonNullable<SharedStudioTake["motionSpec"]> }) | null {
  const limit = Math.max(1, Math.min(3, maximumScale));
  const scale = (value: number) => Math.min(limit, value);
  if (definition.sourceGroup !== "source_based" || definition.safety !== "SAFE" || !RENDERABLE_SOURCE_MOTION_IDS.has(definition.id)) return null;
  const motionSpec = {
    motionId: definition.id,
    sourceKind: "source_based" as const,
    motionClass: "2d" as const,
    capabilityId: "render.timeline",
    supportStatus: "renderable" as const,
  };
  const fixed = { centerX: 0.5, centerY: 0.5, scale: 1.12 };
  const directionalFrames: Record<string, [number, number, number, number]> = {
    DIAGONAL_UP_LEFT: [0.58, 0.58, 0.42, 0.42],
    DIAGONAL_UP_RIGHT: [0.42, 0.58, 0.58, 0.42],
    DIAGONAL_DOWN_LEFT: [0.58, 0.42, 0.42, 0.58],
    DIAGONAL_DOWN_RIGHT: [0.42, 0.42, 0.58, 0.58],
  };
  const diagonal = directionalFrames[definition.id];
  if (diagonal) {
    return {
      motion: "detail_drift",
      motionSpec,
      startFrame: { centerX: diagonal[0], centerY: diagonal[1], scale: scale(1.18) },
      endFrame: { centerX: diagonal[2], centerY: diagonal[3], scale: scale(1.18) },
    };
  }
  if (["CRASH_ZOOM_IN"].includes(definition.id)) {
    return { motion: "move_closer", motionSpec, startFrame: { ...fixed, scale: 1 }, endFrame: { ...fixed, scale: scale(1.55) } };
  }
  if (["CRASH_ZOOM_OUT"].includes(definition.id)) {
    return { motion: "move_away", motionSpec, startFrame: { ...fixed, scale: scale(1.55) }, endFrame: { ...fixed, scale: 1 } };
  }
  const rotations: Record<string, [number, number]> = {
    ROLL_CLOCKWISE: [0, 6],
    ROLL_COUNTERCLOCKWISE: [0, -6],
    DUTCH_ANGLE_IN: [0, -5],
    DUTCH_ANGLE_OUT: [-5, 0],
  };
  const rotation = rotations[definition.id];
  if (rotation) {
    return {
      motion: "still",
      motionSpec: {
        ...motionSpec,
        parameters: {
          rotationStartDeg: rotation[0],
          rotationEndDeg: rotation[1],
          easing: "cinematic_slow",
          holdStartSeconds: 0,
          holdEndSeconds: 0,
          strength: 1,
        },
      },
      startFrame: { ...fixed, scale: scale(1.12) },
      endFrame: { ...fixed, scale: scale(1.12) },
    };
  }
  if (definition.sharedMotion) {
    const framesByMotion: Partial<Record<SharedStudioTake["motion"], [number, number, number, number, number, number]>> = {
      glide_left: [0.58, 0.5, 1.16, 0.42, 0.5, 1.16],
      glide_right: [0.42, 0.5, 1.16, 0.58, 0.5, 1.16],
      look_up: [0.5, 0.58, 1.16, 0.5, 0.42, 1.16],
      look_down: [0.5, 0.42, 1.16, 0.5, 0.58, 1.16],
      move_closer: [0.5, 0.5, 1, 0.5, 0.5, 1.28],
      move_away: [0.5, 0.5, 1.28, 0.5, 0.5, 1],
      detail_drift: [0.47, 0.48, 1.14, 0.53, 0.52, 1.2],
    };
    const frames = framesByMotion[definition.sharedMotion];
    return frames
      ? {
          motion: definition.sharedMotion,
          motionSpec,
          startFrame: { centerX: frames[0], centerY: frames[1], scale: scale(frames[2]) },
          endFrame: { centerX: frames[3], centerY: frames[4], scale: scale(frames[5]) },
        }
      : { motion: definition.sharedMotion, motionSpec, startFrame: take.startFrame, endFrame: take.endFrame };
  }
  return null;
}

export type TimelineHistory = { past: string[][]; present: string[]; future: string[][] };

export function createTimelineHistory(assetIds: string[] = []): TimelineHistory {
  return { past: [], present: [...assetIds], future: [] };
}

export function commitTimeline(history: TimelineHistory, next: string[]): TimelineHistory {
  if (arraysEqual(history.present, next)) return history;
  return { past: [...history.past.slice(-49), history.present], present: [...next], future: [] };
}

export function reorderTimeline(history: TimelineHistory, assetId: string, targetIndex: number) {
  const sourceIndex = history.present.indexOf(assetId);
  if (sourceIndex < 0) return history;
  const next = [...history.present];
  next.splice(sourceIndex, 1);
  next.splice(Math.max(0, Math.min(targetIndex, next.length)), 0, assetId);
  return commitTimeline(history, next);
}

export function removeTimelineAsset(
  assetIds: string[],
  assetId: string,
  minimumRemaining = 1,
) {
  if (assetIds.length <= minimumRemaining || !assetIds.includes(assetId)) {
    return assetIds;
  }
  return assetIds.filter((current) => current !== assetId);
}

export function undoTimeline(history: TimelineHistory): TimelineHistory {
  const previous = history.past.at(-1);
  if (!previous) return history;
  return { past: history.past.slice(0, -1), present: previous, future: [history.present, ...history.future] };
}

export function redoTimeline(history: TimelineHistory): TimelineHistory {
  const next = history.future[0];
  if (!next) return history;
  return { past: [...history.past, history.present], present: next, future: history.future.slice(1) };
}

export function clampStillDuration(seconds: number) {
  if (!Number.isFinite(seconds)) return 0.6;
  return Math.round(Math.max(0.6, Math.min(10, seconds)) * 100) / 100;
}

const NATIVE_SCALE_TOLERANCE = 0.001;

export function portraitScaleBudget(width?: number | null, height?: number | null) {
  if (!width || !height || width <= 0 || height <= 0) {
    return { maximumScale: 1, motionAllowed: false };
  }
  const nativeScale = Math.min(width / 1080, height / 1920);
  return {
    maximumScale: Math.max(1, Math.min(3, nativeScale)),
    motionAllowed: nativeScale + NATIVE_SCALE_TOLERANCE >= 1,
  };
}

export function sourceFrameQuality(
  width: number | null | undefined,
  height: number | null | undefined,
  startScale: number,
  endScale: number,
) {
  if (!width || !height || width <= 0 || height <= 0) {
    return { rating: "ungeeignet" as const, rNative: 0 };
  }
  const nativeScale = Math.min(width / 1080, height / 1920);
  const requestedScale = Math.max(1, startScale, endScale);
  const rNative = nativeScale / requestedScale;
  const rating: "sicher" | "eingeschränkt" | "ungeeignet" =
    rNative + NATIVE_SCALE_TOLERANCE >= 1.3
      ? "sicher"
      : rNative + NATIVE_SCALE_TOLERANCE >= 1
        ? "eingeschränkt"
        : "ungeeignet";
  return { rating, rNative };
}

export function clampInteractiveFrame(input: {
  centerX: number;
  centerY: number;
  scale: number;
  maximumScale: number;
  sourceWidth: number;
  sourceHeight: number;
}): SharedStudioTake["startFrame"] {
  const maximumScale = Math.max(1, input.maximumScale);
  const requestedScale = Math.max(1, Math.min(maximumScale, input.scale));
  // Never round a valid native cap upwards (for example 1.04166 to 1.042).
  const scale = Math.min(maximumScale, Math.round(requestedScale * 1000) / 1000);
  const cropHeight = Math.min(1, 1 / scale);
  const cropWidth = Math.min(1, (input.sourceHeight * cropHeight * (9 / 16)) / input.sourceWidth);
  return {
    centerX: Math.max(cropWidth / 2, Math.min(1 - cropWidth / 2, input.centerX)),
    centerY: Math.max(cropHeight / 2, Math.min(1 - cropHeight / 2, input.centerY)),
    scale,
  };
}

export function normalizeInteractiveFrame(
  frame: SharedStudioTake["startFrame"],
  sourceWidth?: number | null,
  sourceHeight?: number | null,
) {
  const budget = portraitScaleBudget(sourceWidth, sourceHeight);
  if (!sourceWidth || !sourceHeight || sourceWidth <= 0 || sourceHeight <= 0) {
    return {
      centerX: Math.max(0, Math.min(1, frame.centerX)),
      centerY: Math.max(0, Math.min(1, frame.centerY)),
      scale: 1,
    };
  }
  return clampInteractiveFrame({
    ...frame,
    maximumScale: budget.maximumScale,
    sourceWidth,
    sourceHeight,
  });
}

export function softTargetStatus(actualSeconds: number, targetSeconds: number) {
  const differenceSeconds = Math.round((actualSeconds - targetSeconds) * 10) / 10;
  const toleranceSeconds = Math.max(2, targetSeconds * 0.1);
  return {
    actualSeconds,
    targetSeconds,
    differenceSeconds,
    withinTolerance: Math.abs(differenceSeconds) <= toleranceSeconds,
    mustAutoTrim: false as const,
  };
}

export type StudioTypographyElement = SharedStudioTypographyElement;

export function createTypographyElement(id: string, index = 0): StudioTypographyElement {
  return {
    id,
    text: index === 0 ? "Neuer Text" : `Text ${index + 1}`,
    fontFamily: "Inter",
    fontWeight: 600,
    fontSizeRel: 0.06,
    colorHex: "#ffffff",
    opacity: 1,
    letterSpacing: 0,
    lineHeight: 1.1,
    geometry: {
      x: 0.12,
      y: Math.min(0.78, 0.18 + index * 0.1),
      widthRel: 0.72,
      rotationDeg: 0,
      scaleX: 1,
      scaleY: 1,
      align: "left",
    },
    animation: {
      type: "fade",
      durationMs: 500,
      enter: { animationId: "fade", durationMs: 500, delayMs: 0 },
      during: { animationId: "none", easing: "linear", holdStartMs: 0, holdEndMs: 0 },
      exit: { animationId: "fade-out", durationMs: 400, delayMs: 0 },
    },
    startSeconds: 0,
    endSeconds: 1.2,
    layer: { mode: "foreground" },
    fontFallbackMode: "pinned",
  };
}

export function resizeTypographyGeometry(
  geometry: StudioTypographyElement["geometry"],
  deltaXRel: number,
) {
  return {
    ...geometry,
    widthRel: Math.max(0.1, Math.min(1 - geometry.x, geometry.widthRel + deltaXRel)),
  };
}

export function scaleTypographyGeometry(
  geometry: StudioTypographyElement["geometry"],
  delta: number,
) {
  const factor = Math.max(0.25, Math.min(4, geometry.scaleX + delta));
  return { ...geometry, scaleX: factor, scaleY: factor };
}

export function normalizeTypographyElement(
  element: StudioTypographyElement,
  durationSeconds: number,
) {
  const sceneDuration = Math.max(0.1, durationSeconds);
  const startSeconds = Math.max(0, Math.min(sceneDuration - 0.1, element.startSeconds));
  const endSeconds = Math.max(startSeconds + 0.1, Math.min(sceneDuration, element.endSeconds));
  const enter = {
    ...element.animation.enter,
    durationMs: Math.round(Math.max(0, Math.min(4_000, element.animation.enter.durationMs))),
    delayMs: Math.round(Math.max(0, Math.min(10_000, element.animation.enter.delayMs))),
  };
  const exit = element.animation.exit ? {
    ...element.animation.exit,
    durationMs: Math.round(Math.max(0, Math.min(4_000, element.animation.exit.durationMs))),
    delayMs: Math.round(Math.max(0, Math.min(10_000, element.animation.exit.delayMs))),
  } : undefined;
  const rawDuring = element.animation.during;
  let during = rawDuring ? {
    ...rawDuring,
    holdStartMs: Math.round(Math.max(0, Math.min(10_000, rawDuring.holdStartMs))),
    holdEndMs: Math.round(Math.max(0, Math.min(10_000, rawDuring.holdEndMs))),
  } : undefined;
  if (during?.animationId === "none") {
    during = { animationId: "none", easing: "linear", holdStartMs: 0, holdEndMs: 0 };
  } else if (during) {
    const availableMs = (endSeconds - startSeconds) * 1_000
      - enter.delayMs - enter.durationMs
      - (exit?.delayMs ?? 0) - (exit?.durationMs ?? 0);
    if (availableMs <= 0) {
      during = { animationId: "none", easing: "linear", holdStartMs: 0, holdEndMs: 0 };
    } else {
      const holdStartMs = Math.min(during.holdStartMs, Math.max(0, Math.floor(availableMs - 1)));
      const holdEndMs = Math.min(during.holdEndMs, Math.max(0, Math.floor(availableMs - holdStartMs - 1)));
      during = { ...during, holdStartMs, holdEndMs };
    }
  }
  const x = Math.max(0, Math.min(0.95, element.geometry.x));
  return {
    ...element,
    startSeconds,
    endSeconds,
    fontWeight: Math.round(Math.max(100, Math.min(900, element.fontWeight))),
    fontSizeRel: Math.max(0.005, Math.min(0.3, element.fontSizeRel)),
    letterSpacing: Math.max(-0.1, Math.min(0.3, element.letterSpacing)),
    lineHeight: Math.max(0.8, Math.min(2, element.lineHeight)),
    opacity: Math.max(0, Math.min(1, element.opacity)),
    geometry: {
      ...element.geometry,
      x,
      y: Math.max(0, Math.min(1, element.geometry.y)),
      widthRel: Math.max(0.05, Math.min(1 - x, element.geometry.widthRel)),
      rotationDeg: Math.max(-180, Math.min(180, element.geometry.rotationDeg)),
      scaleX: Math.max(0.25, Math.min(4, element.geometry.scaleX)),
      scaleY: Math.max(0.25, Math.min(4, element.geometry.scaleY)),
    },
    animation: {
      ...element.animation,
      type: enter.animationId,
      durationMs: enter.durationMs,
      enter,
      during,
      exit,
    },
  } satisfies StudioTypographyElement;
}

export function typographyExitWindowMs(
  intervalMs: number,
  exit: NonNullable<StudioTypographyElement["animation"]["exit"]>,
) {
  const endMs = Math.max(0, intervalMs - exit.delayMs);
  return {
    startMs: Math.max(0, endMs - exit.durationMs),
    endMs,
  };
}

export function snapTypographyPosition(input: {
  x: number;
  y: number;
  visibleWidthRel: number;
  visibleHeightRel: number;
  horizontalGuides: number[];
  verticalGuides: number[];
  enabled: boolean;
  threshold?: number;
}) {
  const width = Math.max(0, Math.min(1, input.visibleWidthRel));
  const height = Math.max(0, Math.min(1, input.visibleHeightRel));
  let x = Math.max(0, Math.min(1 - width, input.x));
  let y = Math.max(0, Math.min(1 - height, input.y));
  if (!input.enabled) return { x, y };
  const threshold = input.threshold ?? 0.018;
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  const vertical = input.verticalGuides.find((guide) => Math.abs(centerX - guide) <= threshold);
  const horizontal = input.horizontalGuides.find((guide) => Math.abs(centerY - guide) <= threshold);
  if (vertical !== undefined) x = Math.max(0, Math.min(1 - width, vertical - width / 2));
  if (horizontal !== undefined) y = Math.max(0, Math.min(1 - height, horizontal - height / 2));
  return { x, y };
}

export type AiStudioProposal = {
  id: string;
  name: string;
  suitableSourceMotif: string;
  sourceExampleUrl: string | null;
  resultExampleUrl: string | null;
  resultExampleKind: "clip" | "loop" | null;
  durationSeconds: number | null;
  provenance: string | null;
  prerequisites: string[];
  motionId: string;
  demoNumber: number;
  available: boolean;
};

export const AI_STUDIO_PROPOSALS: readonly AiStudioProposal[] = [
  {
    id: "walk-through-interior",
    name: "Ruhiger Raum-Walk-through",
    suitableSourceMotif: "Breite Innenaufnahme mit freiem Laufweg",
    sourceExampleUrl: null,
    resultExampleUrl: null,
    resultExampleKind: null,
    durationSeconds: null,
    provenance: null,
    prerequisites: ["Geometrieprüfung", "Ergebnisclip als Referenz fehlt noch"],
    motionId: "GENERATIVE_WALK_THROUGH",
    demoNumber: 16,
    available: false,
  },
  {
    id: "outpaint-exterior",
    name: "Außenmotiv seitlich erweitern",
    suitableSourceMotif: "Gerade Außenansicht mit Platz an einer Bildkante",
    sourceExampleUrl: null,
    resultExampleUrl: null,
    resultExampleKind: null,
    durationSeconds: null,
    provenance: null,
    prerequisites: ["Architekturprüfung", "Ergebnisloop als Referenz fehlt noch"],
    motionId: "OUTPAINT_LEFT",
    demoNumber: 17,
    available: false,
  },
] as const;

export function isSelectableAiStudioProposal(proposal: AiStudioProposal) {
  return Boolean(
    proposal.available &&
      proposal.name.trim() &&
      proposal.suitableSourceMotif.trim() &&
      proposal.sourceExampleUrl &&
      proposal.resultExampleUrl &&
      proposal.resultExampleKind &&
      proposal.durationSeconds &&
      proposal.durationSeconds > 0 &&
      proposal.provenance?.trim() &&
      proposal.prerequisites.length,
  );
}

export function typographyRotationDegrees(input: {
  centerX: number;
  centerY: number;
  pointerX: number;
  pointerY: number;
  offsetDegrees?: number;
}) {
  const degrees = Math.atan2(input.pointerY - input.centerY, input.pointerX - input.centerX) * 180 / Math.PI + 90;
  const adjusted = degrees - (input.offsetDegrees ?? 0);
  return Math.max(-180, Math.min(180, Math.round(adjusted * 10) / 10));
}

export type StudioSceneLayer = SharedStudioSceneLayer;

export type StudioAiDraft = {
  id: string;
  selection: { sourceAssetId: string; demoNumber: number };
  motion: NonNullable<SharedStudioTake["motionSpec"]> & { sourceKind: "generative_ai" };
  timelineActivation: { mode: "replace_take" | "insert_after_take"; takeId: string };
  status: "draft" | "selected" | "generating" | "generated" | "approved" | "rejected" | "failed";
  storyboard: { title: string; summary?: string; beats: Array<{ order: number; description: string }> };
  preparedAssetId?: string;
  approvedClip?: { assetId: string; kind: "video"; frozenDurationSeconds: number; audioPolicy: "reject" };
};

export function createAiDraft(
  id: string,
  sourceAssetId: string,
  demoNumber: number,
  takeId: string,
  motionId = "GENERATIVE_WALK_THROUGH",
): StudioAiDraft {
  const technicalDemoNumber = VIDEO_STUDIO_MOTION_CATALOG.findIndex((motion) => motion.id === motionId) + 1;
  return {
    id,
    selection: { sourceAssetId, demoNumber },
    motion: {
      motionId,
      sourceKind: "generative_ai",
      motionClass: "generative_3d",
      capabilityId: "prepare.perspective_shift",
      supportStatus: "generation_draft",
      demoNumber: technicalDemoNumber,
    },
    timelineActivation: { mode: "replace_take", takeId },
    status: "draft",
    storyboard: {
      title: `Bild + Demo ${demoNumber}`,
      beats: ["Originalmotiv sichern", `Bewegung aus Demo ${demoNumber} übertragen`, "Geometrie prüfen"].map((description, index) => ({ order: index + 1, description })),
    },
  };
}

export function markAiGenerationFailed(draft: StudioAiDraft): StudioAiDraft {
  return { ...draft, status: "failed" };
}

export function approveAiDraft(draft: StudioAiDraft, assetId: string, serverFrozenDurationSeconds: number): StudioAiDraft {
  if (draft.status !== "generated" || !draft.preparedAssetId) throw new Error("Only a generated prepared asset can be approved");
  return {
    ...draft,
    status: "approved",
    approvedClip: {
      assetId,
      kind: "video",
      frozenDurationSeconds: Math.max(0.01, serverFrozenDurationSeconds),
      audioPolicy: "reject",
    },
  };
}

export type StudioTimelineSlot = {
  id: string;
  kind: "still" | "generated_clip";
  durationSeconds: number;
};

export function replaceTimelineSlotWithApprovedClip(
  slots: StudioTimelineSlot[],
  slotId: string,
  draft: StudioAiDraft,
) {
  if (!draft.approvedClip) throw new Error("The AI draft has no approved clip");
  return slots.map((slot) => slot.id === slotId
    ? { id: draft.approvedClip!.assetId, kind: "generated_clip" as const, durationSeconds: draft.approvedClip!.frozenDurationSeconds }
    : slot);
}

export function insertApprovedClipSlot(
  slots: StudioTimelineSlot[],
  targetIndex: number,
  draft: StudioAiDraft,
) {
  if (!draft.approvedClip) throw new Error("The AI draft has no approved clip");
  const next = [...slots];
  next.splice(Math.max(0, Math.min(targetIndex, next.length)), 0, {
    id: draft.approvedClip.assetId,
    kind: "generated_clip",
    durationSeconds: draft.approvedClip.frozenDurationSeconds,
  });
  return next;
}

export function timelineDurationFromSlots(slots: StudioTimelineSlot[]) {
  return slots.reduce((sum, slot) => sum + slot.durationSeconds, 0);
}

export function logoCollidesWithReservedZone(input: { x: number; y: number; width: number }) {
  const logoRight = input.x + input.width;
  const overlapsHorizontal = logoRight > 0.58 && input.x < 0.94;
  const overlapsVertical = input.y > 0.72;
  return overlapsHorizontal && overlapsVertical;
}

export function logoSafeZone(input: {
  x: number;
  y: number;
  widthRel: number;
  assetWidth: number;
  assetHeight: number;
  rotationDeg: number;
  padding?: number;
}) {
  const padding = input.padding ?? 0.025;
  const heightRel = input.widthRel * (input.assetHeight / input.assetWidth) * (9 / 16);
  const radians = (input.rotationDeg * Math.PI) / 180;
  const cosine = Math.abs(Math.cos(radians));
  const sine = Math.abs(Math.sin(radians));
  const boundingWidth = cosine * input.widthRel + sine * heightRel * (16 / 9);
  const boundingHeight = sine * input.widthRel * (9 / 16) + cosine * heightRel;
  const centerX = input.x + input.widthRel / 2;
  const centerY = input.y + heightRel / 2;
  const x = Math.max(0, centerX - boundingWidth / 2 - padding);
  const y = Math.max(0, centerY - boundingHeight / 2 - padding);
  const right = Math.min(1, centerX + boundingWidth / 2 + padding);
  const bottom = Math.min(1, centerY + boundingHeight / 2 + padding);
  return { x, y, w: Math.max(0, right - x), h: Math.max(0, bottom - y) };
}

export function videoMaskCandidatesForHandoff(images: Array<{ id: string; aiOverlays: unknown }>) {
  const seenMaskKeys = new Set<string>();
  return images.flatMap((image) =>
    storedVideoMasks(image.aiOverlays).slice(0, 16).map((mask) => ({
      sourceAssetId: image.id,
      maskKey: mask.maskKey,
      label: mask.label,
    })),
  ).filter(({ maskKey }) => {
    if (seenMaskKeys.has(maskKey)) return false;
    seenMaskKeys.add(maskKey);
    return true;
  }).slice(0, 128);
}

function storedVideoMasks(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  const overlays = value as Record<string, unknown>;
  const sam3 = overlays.sam3 && typeof overlays.sam3 === "object" && !Array.isArray(overlays.sam3)
    ? overlays.sam3 as Record<string, unknown>
    : null;
  const candidates = Array.isArray(sam3?.masks)
    ? sam3.masks
    : Array.isArray(overlays.masks)
      ? overlays.masks
      : [];
  return candidates.flatMap((value, index) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) return [];
    const mask = value as Record<string, unknown>;
    if (mask.technical === true || typeof mask.maskKey !== "string" || !mask.maskKey.trim()) return [];
    const labelValue = typeof mask.labelDe === "string" ? mask.labelDe : typeof mask.label === "string" ? mask.label : `Ebene ${index + 1}`;
    const label = labelValue.trim().replace(/\s+/g, " ").slice(0, 80);
    if (!label || /^(__|technical|technik)/i.test(label)) return [];
    return [{ maskKey: mask.maskKey.trim(), label }];
  });
}

function arraysEqual(left: string[], right: string[]) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}
