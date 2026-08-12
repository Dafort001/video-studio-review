import { createHash, createHmac, randomUUID } from "node:crypto";

export type SharedStudioTake = {
  id: string;
  sourceAssetId: string;
  order: number;
  role: "intro" | "body" | "outro";
  durationSeconds: number;
  durationSource: "pattern" | "manual";
  transitionIn: "cut" | "crossfade" | "fadeFromBlack";
  transitionInSeconds: number;
  motion: "still" | "move_closer" | "move_away" | "glide_left" | "glide_right" | "look_up" | "look_down" | "detail_drift";
  startFrame: { centerX: number; centerY: number; scale: number };
  endFrame: { centerX: number; centerY: number; scale: number };
  motionSpec?: {
    motionId: string;
    sourceKind: "source_based" | "generative_ai";
    motionClass: "2d" | "depth_3d" | "generative_3d";
    capabilityId: string;
    demoNumber?: number;
    supportStatus?: "renderable" | "generation_draft" | "reserved";
    parameters?: {
      rotationStartDeg: number;
      rotationEndDeg: number;
      easing: "linear" | "ease_in" | "ease_out" | "ease_in_out" | "smooth" | "cinematic_slow" | "cinematic_accelerate" | "cinematic_decelerate";
      holdStartSeconds: number;
      holdEndSeconds: number;
      strength: number;
    };
  };
  sceneLayers?: SharedStudioSceneLayer[];
  typographyElements?: SharedStudioTypographyElement[];
  analysisVersion?: string;
  quality?: { rNative: number; rating: "sicher" | "eingeschränkt" | "ungeeignet"; cutRisk: string[]; reasons: string[]; maximumNativeScale: number };
  reviewedAt?: string;
  text: {
    enabled: boolean;
    styleId?: 1 | 2 | 3 | 4 | 5 | 6;
    title?: string;
    subtitle?: string;
    purpose?: "hook" | "feature" | "claim" | "call_to_action";
    position?: { x: number; y: number; width: number };
    maxWidthRel?: number;
    safeAreaLock?: boolean;
    fontFamily?: string;
    fallbackFamily?: string;
    titleWeight?: number;
    titleSizeRel?: number;
    subtitleWeight?: number;
    subtitleSizeRel?: number;
    subtitleFontFamily?: string;
    colorHex?: string;
    titleColorHex?: string;
    subtitleColorHex?: string;
    opacity?: number;
    letterSpacing?: number;
    titleLetterSpacing?: number;
    subtitleLetterSpacing?: number;
    titleScaleX?: number;
    subtitleScaleX?: number;
    lineHeight?: number;
    titleLineHeight?: number;
    subtitleLineHeight?: number;
    rotationDeg?: number;
    align?: "left" | "center" | "right";
    backdrop?: "none" | "shadow" | "scrim" | "box";
    backdropOpacity?: number;
    uppercase?: boolean;
    titleUppercase?: boolean;
    subtitleUppercase?: boolean;
    animation?: "slide-up" | "fade" | "wipe" | "slide-in" | "letter-by-letter" | "none";
    animationDurationMs?: number;
    typography?: {
      preset: "quiet" | "editorial" | "architecture" | "warm";
      color?: string;
      titleSize?: number;
      subtitleSize?: number;
      align?: "left" | "center" | "right";
    };
  };
};

export type SharedStudioSceneLayer = {
  id: string;
  type: "architecture" | "object" | "avatar_reserved";
  source: "manual" | "analysis" | "reserved";
  status: "pending" | "ready" | "reserved";
  order: number;
  visible: boolean;
  maskAssetId?: string;
};

export type SharedStudioTypographyElement = {
  id: string;
  text: string;
  secondaryText?: string;
  fontFamily: string;
  fontWeight: number;
  fontSizeRel: number;
  fontAssetId?: string;
  colorHex: string;
  opacity: number;
  letterSpacing: number;
  lineHeight: number;
  geometry: {
    x: number;
    y: number;
    widthRel: number;
    rotationDeg: number;
    scaleX: number;
    scaleY: number;
    align: "left" | "center" | "right";
  };
  startSeconds: number;
  endSeconds: number;
  animation: {
    type: string;
    durationMs: number;
    enter: { animationId: string; durationMs: number; delayMs: number };
    during?: {
      animationId: "none" | "left_to_right" | "right_to_left" | "up_to_down" | "down_to_up";
      easing: "linear" | "ease_in" | "ease_out" | "ease_in_out" | "smooth";
      holdStartMs: number;
      holdEndMs: number;
    };
    exit?: { animationId: string; durationMs: number; delayMs: number };
  };
  layer: { mode: "foreground" | "behind-object"; maskAssetId?: string };
  fontFallbackMode?: "fail" | "pinned";
};

export type SharedStudioAiDraft = {
  id: string;
  selection: { sourceAssetId: string; demoNumber: number };
  motion: NonNullable<SharedStudioTake["motionSpec"]> & { sourceKind: "generative_ai" };
  timelineActivation: { mode: "replace_take" | "insert_after_take"; takeId: string };
  status: "draft" | "selected" | "generating" | "generated" | "approved" | "rejected" | "failed";
  storyboard: {
    title: string;
    summary?: string;
    beats: Array<{ order: number; description: string }>;
  };
  preparedAssetId?: string;
  approvedClipAssetId?: string;
};

export type SharedAssetAnalysis = {
  assetId: string;
  analysisVersion: string;
  createdAt: string;
  nativeWidth: number;
  nativeHeight: number;
  taxonomy?: string;
  caption?: string;
  focusPoint?: { x: number; y: number };
  instances: Array<{ label: string; bbox: { x: number; y: number; w: number; h: number }; area: number; confidence: number }>;
  derived: {
    safeCropWindows: Array<{ x: number; y: number; w: number; h: number }>;
    quietTextRegions: Array<{ x: number; y: number; w: number; h: number }>;
    cutRiskEdges: Array<{ label: string; bbox: { x: number; y: number; w: number; h: number } }>;
  };
  recommendation?: {
    status: "recommended" | "optional" | "uncertain" | "not_recommended";
    reason: string;
    detail: string;
    motion?: SharedStudioTake["motion"];
    cropFocus?: string;
  };
};

export type SharedStudioProject = {
  id: string;
  revision: number;
  product: "piximmo" | "pixcapture";
  tenantId: string;
  sourceReference: { type: "property" | "gallery" | "job"; id: string };
  returnUrl?: string;
  name: string;
  mode: "guided" | "detailed";
  intent: string;
  status: string;
  startTakeId: string | null;
  desiredDurationSeconds: number;
  brandOverlay?: {
    enabled: boolean;
    scope?: "global";
    asset?: { id: string; filename: string; mimeType: "image/png" | "image/jpeg"; width: number; height: number; sizeBytes: number };
    position: { x: number; y: number };
    widthRel: number;
    opacity: number;
    rotationDeg: number;
    safeZone?: { x: number; y: number; w: number; h: number };
    /** Legacy read-only migration field. New writes always use scope=global. */
    placement?: "all" | "intro" | "outro";
  };
  rhythmPatternId: "puls" | "ruhig" | "zweier" | "auftakt" | "ausklang";
  assets: Array<{
    id: string;
    filename?: string;
    width?: number;
    height?: number;
    motif?: string;
    description?: string;
    sourcePreviewUrl?: string;
    sourcePreviewUrlExpiresAt?: string;
  }>;
  takes: SharedStudioTake[];
  aiStudioDrafts?: SharedStudioAiDraft[];
  fontAssets?: Array<{ assetId: string; displayName: string }>;
  creativeAssets?: Array<{
    assetId: string;
    kind: "account_font" | "occlusion_mask";
    displayName: string;
    sourceAssetId?: string;
  }>;
  versions: Array<{
    id: string;
    projectRevision: number;
    durationSeconds: number;
    createdAt: string;
  }>;
  activeVersionId?: string;
  latestPreviewVersionId?: string;
  approvedVersionId?: string;
  latestPreviewJobId?: string;
  finalJobId?: string;
};

export type SharedSceneSpec = {
  schemaVersion: "pix_video_scene_spec_v1";
  projectId: string;
  projectRevision: number;
  purpose: "preview" | "final";
  renderProfile: {
    aspect: "9:16";
    fps: number;
    outputWidth: number;
    outputHeight: number;
    geometryWidth: number;
    geometryHeight: number;
    workingWidth: number;
    workingHeight: number;
    supersampling: number;
    samplingFilter: "lanczos";
    coordinatePrecision: "subpixel";
    scalingLight: "linear";
    sourceTransfer: "srgb";
    outputTransfer: "bt709-converted";
    frameInterpolation: false;
    ffmpegRole: "encode-only";
    zoompanAllowed: false;
    fontManifestId: "google-fonts-038b637da7b3fd956a4ed93ffc607c3d5e4ce172";
  };
  timelineDurationSeconds: number;
  scenes: Array<{
    clientSceneId: string;
    sourceAssetId: string;
    startCrop: { cx: number; cy: number; zoom: number };
    endCrop: { cx: number; cy: number; zoom: number };
    durationSeconds: number;
    transitionIn: SharedStudioTake["transitionIn"];
    transitionInSeconds: number;
    textOverlay: Record<string, unknown>;
  }>;
};

type StudioExchange = {
  project: SharedStudioProject;
  accessToken: string;
  expiresInSeconds: number;
  launchCode?: string;
  workbenchUrl?: string;
  launchExpiresInSeconds?: number;
};

export class SharedVideoStudioError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "SharedVideoStudioError";
    this.status = status;
    this.code = code;
  }
}

export async function exchangePiximmoVideoStudioHandoff(payload: Record<string, unknown>) {
  const body = JSON.stringify(payload);
  const timestamp = Date.now();
  const nonce = randomUUID();
  const secret = requiredSecret("PIXIMMO_VIDEO_STUDIO_HANDOFF_SECRET");
  const signature = signPiximmoStudioHandoff(body, timestamp, nonce, secret);
  return studioFetch<StudioExchange>("/v1/handoffs/exchange", "", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-video-studio-product": "piximmo",
      "x-video-studio-timestamp": String(timestamp),
      "x-video-studio-nonce": nonce,
      "x-video-studio-signature": signature,
    },
    body,
  });
}

export async function sharedStudioRequest<T>(path: string, accessToken: string, init: RequestInit = {}) {
  return studioFetch<T>(path, accessToken, init);
}

export async function attestSharedStudioCreativeAssets<T>(
  product: SharedStudioProject["product"],
  projectId: string,
  payload: Record<string, unknown>,
) {
  const body = JSON.stringify(payload);
  const timestamp = Date.now();
  const nonce = randomUUID();
  const secretName = product === "piximmo"
    ? "PIXIMMO_VIDEO_STUDIO_HANDOFF_SECRET"
    : "PIXCAPTURE_VIDEO_STUDIO_HANDOFF_SECRET";
  const signature = signStudioProductRequest(product, body, timestamp, nonce, requiredSecret(secretName));
  return studioFetch<T>(`/v1/video-projects/${encodeURIComponent(projectId)}/creative-assets/attest`, "", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-video-studio-product": product,
      "x-video-studio-timestamp": String(timestamp),
      "x-video-studio-nonce": nonce,
      "x-video-studio-signature": signature,
    },
    body,
  });
}

export async function redeemSharedStudioLaunch(launchCode: string) {
  return studioFetch<StudioExchange>("/v1/workbench-launches/redeem", "", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ launchCode }),
  });
}

export function sharedWorkbenchCookieName(projectId: string) {
  return `shared_vs_${projectId.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 80)}`;
}

export function sharedStudioCookieName(projectId: string) {
  return `piximmo_vs_${projectId.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 80)}`;
}

export function signPiximmoStudioHandoff(body: string, timestamp: number, nonce: string, secret: string) {
  return signStudioProductRequest("piximmo", body, timestamp, nonce, secret);
}

export function signStudioProductRequest(product: SharedStudioProject["product"], body: string, timestamp: number, nonce: string, secret: string) {
  const bodyHash = createHash("sha256").update(body).digest("hex");
  return createHmac("sha256", secret)
    .update(`${product}\n${timestamp}\n${nonce}\n${bodyHash}`)
    .digest("base64url");
}

async function studioFetch<T>(path: string, accessToken: string, init: RequestInit) {
  const baseUrl = requiredUrl("VIDEO_STUDIO_INTERNAL_URL");
  if (!path.startsWith("/v1/") || path.includes("..")) throw new Error("Invalid Video Studio path");
  const headers = new Headers(init.headers);
  if (accessToken) headers.set("authorization", `Bearer ${accessToken}`);
  const response = await fetch(`${baseUrl}${path}`, { ...init, headers, cache: "no-store" });
  const payload = await response.json().catch(() => null) as { error?: { code?: string; message?: string } } | null;
  if (!response.ok) {
    throw new SharedVideoStudioError(
      response.status,
      payload?.error?.message ?? "Die Video-Werkstatt ist momentan nicht erreichbar.",
      payload?.error?.code,
    );
  }
  return payload as T;
}

function requiredSecret(name: string) {
  const value = process.env[name]?.trim();
  if (!value || value.length < 32) throw new SharedVideoStudioError(503, "Die Video-Werkstatt ist noch nicht vollständig konfiguriert.");
  return value;
}

function requiredUrl(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new SharedVideoStudioError(503, "Die Video-Werkstatt ist noch nicht vollständig konfiguriert.");
  const url = new URL(value);
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new SharedVideoStudioError(503, "Die Video-Werkstatt ist noch nicht vollständig konfiguriert.");
  return url.toString().replace(/\/+$/, "");
}
