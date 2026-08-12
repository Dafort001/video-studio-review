import fs from "node:fs/promises";
import { GoogleGenAI, type Image } from "@google/genai";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { logApiUsage } from "@/lib/cost-tracking";
import {
  assertAllowedRemoteImageUrl,
  fetchAllowedRemoteImage,
  resolveSafePublicImagePath,
} from "@/lib/image-input-guard";
import {
  DEFAULT_VIDEO_WORKBENCH_PROJECT_ID,
  estimateVideoGenerationCost,
  resolveVideoQualityPreset,
  upsertVideoWorkbenchProviderJob,
  type VideoProvider,
  type VideoResolution,
} from "@/lib/video-workbench-costs";

const DEFAULT_FAL_MODEL = "fal-ai/veo3.1/fast/image-to-video";

type StartBody = {
  prompt?: string;
  imageUrl?: string;
  lastFrameUrl?: string;
  startFocus?: { x?: number; y?: number };
  endFocus?: { x?: number; y?: number };
  negativePrompt?: string;
  provider?: VideoProvider;
  projectId?: string;
  qualityPreset?: string;
  model?: string;
  duration?: "4s" | "5s" | "6s" | "7s" | "8s";
  resolution?: VideoResolution;
  aspectRatio?: "9:16" | "16:9";
  generateAudio?: boolean;
  dryRun?: boolean;
};

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({})) as StartBody;
  const prompt = body.prompt?.trim();
  const imageUrl = body.imageUrl?.trim();
  const lastFrameUrl = body.lastFrameUrl?.trim();
  const startFocus = normalizeFocus(body.startFocus);
  const endFocus = normalizeFocus(body.endFocus);
  const qualityPreset = resolveVideoQualityPreset(body.qualityPreset);
  const provider = body.provider ?? qualityPreset.provider;
  const projectId = body.projectId?.trim() || DEFAULT_VIDEO_WORKBENCH_PROJECT_ID;
  const durationSeconds = body.duration ? parseDurationSeconds(body.duration) : qualityPreset.durationSeconds;
  const resolution = body.resolution ?? qualityPreset.resolution;
  const generateAudio = body.generateAudio ?? qualityPreset.generateAudio;
  const model = body.model?.trim() || (provider === "google" ? qualityPreset.model : DEFAULT_FAL_MODEL);

  if (!prompt) {
    return NextResponse.json({ error: "Beschreibung wird benoetigt." }, { status: 400 });
  }

  const costEstimate = estimateVideoGenerationCost({
    provider,
    model,
    durationSeconds,
    resolution,
    generateAudio,
  });

  if (body.dryRun) {
    return NextResponse.json({
      success: true,
      dryRun: true,
      provider,
      model,
      projectId,
      qualityPreset: qualityPreset.id,
      qualityLabel: qualityPreset.label,
      durationSeconds,
      resolution,
      aspectRatio: body.aspectRatio ?? null,
      generateAudio,
      promptLength: prompt.length,
      imageUrl: imageUrl ?? null,
      lastFrameUrl: lastFrameUrl ?? null,
      startFocus,
      endFocus,
      costEstimate,
    });
  }

  if (provider === "fal") {
    if (!imageUrl) {
      return NextResponse.json({
        error: "FAL ist hier als Image-to-Video-Fallback verdrahtet und benoetigt ein Bild.",
        missingImage: true,
        model,
      }, { status: 400 });
    }

    return startFalVideo({
      prompt,
      imageUrl,
      model,
      projectId,
      durationSeconds,
      resolution,
      generateAudio,
      costEstimate,
      userId: userIdFromSession(session),
    });
  }

  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      error: "GOOGLE_GEMINI_API_KEY fehlt auf dem Server.",
      missingKey: true,
      model,
    }, { status: 503 });
  }

  const startedAt = Date.now();
  const ai = new GoogleGenAI({ apiKey });
  const effectivePrompt = body.negativePrompt?.trim()
    ? `${prompt}\n\nNegative instructions:\n${body.negativePrompt.trim()}`
    : prompt;

  try {
    const firstFrame = imageUrl
      ? await resolveGoogleImageInput(imageUrl)
      : undefined;
    const lastFrame = lastFrameUrl
      ? await resolveGoogleImageInput(lastFrameUrl)
      : undefined;
    const operation = await ai.models.generateVideos({
      model,
      prompt: effectivePrompt,
      ...(firstFrame ? { image: firstFrame } : {}),
      config: {
        durationSeconds,
        resolution,
        ...(body.aspectRatio ? { aspectRatio: body.aspectRatio } : {}),
        numberOfVideos: 1,
        ...(lastFrame ? { lastFrame } : {}),
        ...(firstFrame ? { personGeneration: "allow_adult" } : {}),
      },
    });

    const durationMs = Date.now() - startedAt;
    const operationName = operation.name ?? null;
    const requestId = operationName?.split("/").pop() ?? operationName;
    const now = new Date().toISOString();

    if (operationName) {
      await upsertVideoWorkbenchProviderJob(projectId, {
        id: operationName,
        provider: "google",
        model,
        status: "queued",
        operationName,
        requestId,
        startedAt: now,
        updatedAt: now,
        durationSeconds,
        resolution,
        generateAudio,
        qualityPreset: qualityPreset.id,
        qualityLabel: qualityPreset.label,
        estimatedCostUsd: costEstimate.estimatedCostUsd,
        billedCostUsd: null,
        costEstimated: true,
        promptLength: effectivePrompt.length,
        imageUrl: summarizeImageReference(imageUrl),
        lastFrameUrl: summarizeImageReference(lastFrameUrl),
        startFocus,
        endFocus,
        raw: operation,
      });
    }

    await logApiUsage({
      userId: userIdFromSession(session),
      provider: "google",
      model,
      operation: "video_generation_start",
      inputImages: Number(Boolean(imageUrl)) + Number(Boolean(lastFrameUrl)),
      durationMs,
      status: "partial",
      manualCostCents: 0,
      currency: "USD",
      metadata: {
        videoProjectId: projectId,
        providerJobId: operationName,
        durationSeconds,
        resolution,
        generateAudio,
        qualityPreset: qualityPreset.id,
        qualityLabel: qualityPreset.label,
        estimatedCostUsd: costEstimate.estimatedCostUsd,
        unitPriceUsd: costEstimate.unitPriceUsd,
        promptLength: effectivePrompt.length,
      },
    });

    return NextResponse.json({
      success: true,
      provider: "google",
      model,
      requestId,
      operationName,
      costEstimate,
      raw: operation,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await logApiUsage({
      userId: userIdFromSession(session),
      provider: "google",
      model,
      operation: "video_generation_start",
      inputImages: Number(Boolean(imageUrl)) + Number(Boolean(lastFrameUrl)),
      durationMs: Date.now() - startedAt,
      status: "error",
      errorMessage: message,
      manualCostCents: 0,
      currency: "USD",
      metadata: {
        videoProjectId: projectId,
        durationSeconds,
        resolution,
        generateAudio,
        qualityPreset: qualityPreset.id,
        qualityLabel: qualityPreset.label,
        estimatedCostUsd: costEstimate.estimatedCostUsd,
        promptLength: effectivePrompt.length,
      },
    });

    return NextResponse.json({
      error: "Veo-Start ueber Google ist fehlgeschlagen.",
      details: message,
      model,
    }, { status: 502 });
  }
}

async function startFalVideo(input: {
  prompt: string;
  imageUrl: string;
  model: string;
  projectId: string;
  durationSeconds: number;
  resolution: VideoResolution;
  generateAudio: boolean;
  costEstimate: ReturnType<typeof estimateVideoGenerationCost>;
  userId?: string | null;
}) {
  const falEndpoint = `https://queue.fal.run/${input.model}`;

  const falKey = process.env.FAL_KEY || process.env.FAL_API_KEY;
  if (!falKey) {
    return NextResponse.json({
      error: "FAL_KEY fehlt auf dem Server. Die Verbindung ist eingebaut, aber noch nicht freigeschaltet.",
      missingKey: true,
      model: input.model,
    }, { status: 503 });
  }

  const duration = `${input.durationSeconds}s`;
  const resolvedImageUrl = await resolveFalImageInput(input.imageUrl);
  const startedAt = Date.now();

  const response = await fetch(falEndpoint, {
    method: "POST",
    headers: {
      "Authorization": `Key ${falKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: input.prompt,
      image_url: resolvedImageUrl,
      duration,
      resolution: input.resolution,
      generate_audio: input.generateAudio,
    }),
  });

  const payload = await response.json().catch(async () => ({ raw: await response.text().catch(() => "") }));
  const durationMs = Date.now() - startedAt;

  await logApiUsage({
    userId: input.userId,
    provider: "fal",
    model: input.model,
    operation: "video_generation_start",
    inputImages: 1,
    outputImages: 0,
    durationMs,
    status: response.ok ? "partial" : "error",
    errorMessage: response.ok ? undefined : JSON.stringify(payload).slice(0, 500),
    manualCostCents: 0,
    currency: "USD",
    metadata: {
      videoProjectId: input.projectId,
      duration,
      durationSeconds: input.durationSeconds,
      resolution: input.resolution,
      generateAudio: input.generateAudio,
      estimatedCostUsd: input.costEstimate.estimatedCostUsd,
      unitPriceUsd: input.costEstimate.unitPriceUsd,
      promptLength: input.prompt.length,
      requestId: typeof payload?.request_id === "string" ? payload.request_id : null,
    },
  });

  if (!response.ok) {
    return NextResponse.json({
      error: "Veo-Start ueber FAL ist fehlgeschlagen.",
      status: response.status,
      details: payload,
    }, { status: response.status });
  }

  const requestId = payload.request_id ?? payload.requestId ?? null;
  const now = new Date().toISOString();
  if (requestId) {
    await upsertVideoWorkbenchProviderJob(input.projectId, {
      id: String(requestId),
      provider: "fal",
      model: input.model,
      status: "queued",
      requestId: String(requestId),
      startedAt: now,
      updatedAt: now,
      durationSeconds: input.durationSeconds,
      resolution: input.resolution,
      generateAudio: input.generateAudio,
      estimatedCostUsd: input.costEstimate.estimatedCostUsd,
      billedCostUsd: null,
      costEstimated: true,
      promptLength: input.prompt.length,
      imageUrl: input.imageUrl ?? null,
      raw: payload,
    });
  }

  return NextResponse.json({
    success: true,
    provider: "fal",
    model: input.model,
    requestId,
    statusUrl: payload.status_url ?? payload.statusUrl ?? null,
    responseUrl: payload.response_url ?? payload.responseUrl ?? null,
    cancelUrl: payload.cancel_url ?? payload.cancelUrl ?? null,
    costEstimate: input.costEstimate,
    raw: payload,
  });
}

function parseDurationSeconds(duration: StartBody["duration"]) {
  const parsed = Number(String(duration || "4s").replace(/s$/, ""));
  if ([4, 5, 6, 7, 8].includes(parsed)) return parsed;
  return 4;
}

function userIdFromSession(session: Awaited<ReturnType<typeof auth>>) {
  const user = session?.user as { id?: string | null; email?: string | null } | undefined;
  return user?.id ?? user?.email ?? null;
}

async function resolveGoogleImageInput(imageUrl: string): Promise<Image> {
  let mimeType: string;
  let bytes: Buffer;
  if (imageUrl.startsWith("data:")) {
    const match = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) throw new Error("Ungueltige Data-URL fuer Bildinput.");
    mimeType = match[1];
    if (!/^image\/(png|jpeg|webp)$/.test(mimeType)) throw new Error("Nicht unterstuetzter Bildtyp.");
    bytes = Buffer.from(match[2], "base64");
    if (bytes.length > 2.5 * 1024 * 1024) throw new Error("Bildinput ist groesser als 2,5 MB.");
  } else if (imageUrl.startsWith("/")) {
    const publicPath = resolveSafePublicImagePath(imageUrl);
    bytes = await fs.readFile(publicPath);
    mimeType = mimeTypeFromPath(imageUrl);
  } else if (/^https?:\/\//i.test(imageUrl)) {
    const response = await fetchAllowedRemoteImage(imageUrl);
    bytes = response.bytes;
    mimeType = response.contentType || mimeTypeFromPath(imageUrl);
  } else {
    throw new Error("Nicht unterstuetzte Bildquelle fuer Google Veo.");
  }
  if (!/^image\/(png|jpeg|webp)/.test(mimeType)) throw new Error("Nicht unterstuetzter Bildtyp.");
  return { mimeType, imageBytes: bytes.toString("base64") };
}

function normalizeFocus(value: StartBody["startFocus"]) {
  const x = Number(value?.x);
  const y = Number(value?.y);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return undefined;
  return {
    x: Math.max(0, Math.min(1, x)),
    y: Math.max(0, Math.min(1, y)),
  };
}

function summarizeImageReference(value?: string) {
  if (!value) return null;
  if (value.startsWith("data:")) return "inline:image";
  return value;
}

function mimeTypeFromPath(value: string) {
  const lower = value.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

async function resolveFalImageInput(imageUrl: string) {
  if (imageUrl.startsWith("/demo/video-studio/")) {
    const publicPath = resolveSafePublicImagePath(imageUrl);
    const file = await fs.readFile(publicPath);
    const mime = imageUrl.endsWith(".png") ? "image/png" : "image/jpeg";
    return `data:${mime};base64,${file.toString("base64")}`;
  }
  return assertAllowedRemoteImageUrl(imageUrl).toString();
}
