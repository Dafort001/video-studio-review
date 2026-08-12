import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { logApiUsage } from "@/lib/cost-tracking";
import {
  DEFAULT_VIDEO_WORKBENCH_PROJECT_ID,
  estimateVideoGenerationCost,
  readVideoWorkbenchProviderJob,
  resolveVideoQualityPreset,
  upsertVideoWorkbenchProviderJob,
  type VideoProvider,
  type VideoResolution,
} from "@/lib/video-workbench-costs";

const DEFAULT_FAL_MODEL = "fal-ai/veo3.1/fast/image-to-video";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const provider = (url.searchParams.get("provider") || "google") as VideoProvider;
  const projectId = url.searchParams.get("projectId") || DEFAULT_VIDEO_WORKBENCH_PROJECT_ID;

  if (provider === "fal") {
    return getFalStatus(url, projectId, userIdFromSession(session));
  }

  return getGoogleStatus(url, projectId, userIdFromSession(session));
}

async function getGoogleStatus(url: URL, projectId: string, userId?: string | null) {
  const operationName = url.searchParams.get("operationName") || url.searchParams.get("requestId");
  const qualityPreset = resolveVideoQualityPreset(url.searchParams.get("qualityPreset"));
  const model = url.searchParams.get("model") || qualityPreset.model;
  const durationSeconds = url.searchParams.has("durationSeconds")
    ? parseDurationSeconds(url.searchParams.get("durationSeconds"))
    : qualityPreset.durationSeconds;
  const resolution = parseResolution(url.searchParams.get("resolution") || qualityPreset.resolution);
  const generateAudio = url.searchParams.has("generateAudio")
    ? url.searchParams.get("generateAudio") !== "false"
    : qualityPreset.generateAudio;

  if (!operationName) {
    return NextResponse.json({ error: "Google-Operation fehlt." }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      error: "GOOGLE_GEMINI_API_KEY fehlt auf dem Server.",
      missingKey: true,
      model,
    }, { status: 503 });
  }

  const costEstimate = estimateVideoGenerationCost({
    provider: "google",
    model,
    durationSeconds,
    resolution,
    generateAudio,
  });
  try {
    const operationResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${operationName}?key=${encodeURIComponent(apiKey)}`,
      { cache: "no-store" },
    );
    const operation = await operationResponse.json().catch(async () => ({
      raw: await operationResponse.text().catch(() => ""),
    })) as {
      name?: string;
      done?: boolean;
      error?: unknown;
      response?: {
        generateVideoResponse?: {
          generatedSamples?: Array<{
            video?: {
              uri?: string;
              mimeType?: string;
            };
          }>;
          generatedVideos?: Array<{
            video?: {
              uri?: string;
              mimeType?: string;
            };
          }>;
          raiMediaFilteredCount?: number;
          raiMediaFilteredReasons?: string[];
        };
        generatedVideos?: Array<{
          video?: {
            uri?: string;
            mimeType?: string;
          };
        }>;
      };
    };

    if (!operationResponse.ok) {
      return NextResponse.json({
        error: "Google-Veo-Status konnte nicht geladen werden.",
        status: operationResponse.status,
        details: operation,
      }, { status: operationResponse.status });
    }

    const now = new Date().toISOString();
    const videoResponse = operation.response?.generateVideoResponse;
    const video = (
      operation.response?.generatedVideos?.[0]?.video
      ?? videoResponse?.generatedVideos?.[0]?.video
      ?? videoResponse?.generatedSamples?.[0]?.video
    );
    const videoUri = video?.uri ?? null;
    const filteredReason = videoResponse?.raiMediaFilteredReasons?.join(" ") || null;
    const filtered = Number(videoResponse?.raiMediaFilteredCount ?? 0) > 0 && !videoUri;
    const failed = Boolean(operation.error) || filtered;
    const complete = Boolean(operation.done);
    const errorMessage = operation.error
      ? JSON.stringify(operation.error).slice(0, 500)
      : filteredReason;

    const previousJob = await readVideoWorkbenchProviderJob(projectId, operationName);
    await upsertVideoWorkbenchProviderJob(projectId, {
      id: operationName,
      provider: "google",
      model,
      status: failed ? "failed" : complete ? "completed" : "running",
      operationName,
      requestId: operationName.split("/").pop() ?? operationName,
      updatedAt: now,
      completedAt: complete ? now : null,
      durationSeconds,
      resolution,
      generateAudio,
      estimatedCostUsd: costEstimate.estimatedCostUsd,
      billedCostUsd: complete && !failed ? costEstimate.estimatedCostUsd : null,
      costEstimated: true,
      videoUri,
      errorMessage: failed ? errorMessage : null,
      raw: operation,
    });

    if (complete && previousJob?.status !== "completed" && previousJob?.status !== "failed") {
      await logApiUsage({
        userId,
        provider: "google",
        model,
        operation: "video_generation_completed",
        inputImages: previousJob?.imageUrl ? 1 : 0,
        outputImages: failed ? 0 : 1,
        status: failed ? "error" : "success",
        errorMessage: failed ? errorMessage ?? undefined : undefined,
        manualCostCents: failed ? 0 : costEstimate.estimatedCostCents,
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
          videoUri,
        },
      });
    }

    return NextResponse.json({
      success: true,
      provider: "google",
      complete,
      status: {
        status: failed ? "FAILED" : complete ? "COMPLETED" : "IN_PROGRESS",
        operationName,
        filtered,
        filteredReason,
      },
      result: videoUri ? { video: { url: videoUri, uri: videoUri, mimeType: video?.mimeType ?? "video/mp4" } } : null,
      raw: operation,
    });
  } catch (error) {
    return NextResponse.json({
      error: "Google-Veo-Status konnte nicht geladen werden.",
      details: error instanceof Error ? error.message : String(error),
    }, { status: 502 });
  }
}

async function getFalStatus(url: URL, projectId: string, userId?: string | null) {
  const requestId = url.searchParams.get("requestId");
  const statusUrl = url.searchParams.get("statusUrl");
  const responseUrl = url.searchParams.get("responseUrl");
  const model = url.searchParams.get("model") || DEFAULT_FAL_MODEL;
  const durationSeconds = parseDurationSeconds(url.searchParams.get("durationSeconds"));
  const resolution = parseResolution(url.searchParams.get("resolution"));
  const generateAudio = url.searchParams.get("generateAudio") !== "false";
  const falKey = process.env.FAL_KEY || process.env.FAL_API_KEY;

  if (!falKey) {
    return NextResponse.json({
      error: "FAL_KEY fehlt auf dem Server.",
      missingKey: true,
      model,
    }, { status: 503 });
  }

  if (!requestId && !statusUrl) {
    return NextResponse.json({ error: "Request-ID fehlt." }, { status: 400 });
  }

  const queueModel = model.replace(/\/image-to-video$/, "");
  const resolvedStatusUrl = statusUrl || `https://queue.fal.run/${queueModel}/requests/${requestId}/status?logs=1`;
  const statusResponse = await fetch(resolvedStatusUrl, {
    headers: { "Authorization": `Key ${falKey}` },
  });
  const statusPayload = await statusResponse.json().catch(async () => ({ raw: await statusResponse.text().catch(() => "") }));

  if (!statusResponse.ok) {
    return NextResponse.json({
      error: "Veo-Status konnte nicht geladen werden.",
      status: statusResponse.status,
      details: statusPayload,
    }, { status: statusResponse.status });
  }

  const status = typeof statusPayload.status === "string" ? statusPayload.status : "";
  const complete = ["COMPLETED", "OK", "SUCCESS"].includes(status.toUpperCase());
  let resultPayload: unknown = null;
  let videoUrl: string | null = null;

  if (complete) {
    const resolvedResponseUrl = responseUrl || `https://queue.fal.run/${queueModel}/requests/${requestId}`;
    const resultResponse = await fetch(resolvedResponseUrl, {
      headers: { "Authorization": `Key ${falKey}` },
    });
    resultPayload = await resultResponse.json().catch(async () => ({ raw: await resultResponse.text().catch(() => "") }));
    videoUrl = typeof (resultPayload as { video?: { url?: unknown } })?.video?.url === "string"
      ? (resultPayload as { video: { url: string } }).video.url
      : null;
  }

  const costEstimate = estimateVideoGenerationCost({
    provider: "fal",
    model,
    durationSeconds,
    resolution,
    generateAudio,
  });
  const now = new Date().toISOString();
  const previousJob = requestId ? await readVideoWorkbenchProviderJob(projectId, requestId) : null;

  if (requestId) {
    await upsertVideoWorkbenchProviderJob(projectId, {
      id: requestId,
      provider: "fal",
      model,
      status: complete ? "completed" : "running",
      requestId,
      updatedAt: now,
      completedAt: complete ? now : null,
      durationSeconds,
      resolution,
      generateAudio,
      estimatedCostUsd: costEstimate.estimatedCostUsd,
      billedCostUsd: complete ? costEstimate.estimatedCostUsd : null,
      costEstimated: true,
      videoUri: videoUrl,
      raw: complete ? resultPayload : statusPayload,
    });
  }

  if (complete && previousJob?.status !== "completed") {
    await logApiUsage({
      userId,
      provider: "fal",
      model,
      operation: "video_generation_completed",
      inputImages: 1,
      outputImages: 1,
      status: "success",
      manualCostCents: costEstimate.estimatedCostCents,
      currency: "USD",
      metadata: {
        videoProjectId: projectId,
        providerJobId: requestId,
        durationSeconds,
        resolution,
        generateAudio,
        estimatedCostUsd: costEstimate.estimatedCostUsd,
        unitPriceUsd: costEstimate.unitPriceUsd,
        videoUrl,
      },
    });
  }

  return NextResponse.json({
    success: true,
    provider: "fal",
    complete,
    status: statusPayload,
    result: resultPayload,
  });
}

function parseDurationSeconds(value: string | null) {
  const parsed = Number(String(value || "4").replace(/s$/, ""));
  if ([4, 5, 6, 7, 8].includes(parsed)) return parsed;
  return 4;
}

function parseResolution(value: string | null): VideoResolution {
  if (value === "720p" || value === "1080p" || value === "4k") return value;
  return "1080p";
}

function userIdFromSession(session: Awaited<ReturnType<typeof auth>>) {
  const user = session?.user as { id?: string | null; email?: string | null } | undefined;
  return user?.id ?? user?.email ?? null;
}
