import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import {
  CentralVideoStudioSessionError,
  readCentralVideoStudioSession,
} from "@/lib/central-video-studio-session.server";
import { VIDEO_STUDIO_MOTION_CATALOG } from "@/lib/video-studio-workflow";
import {
  SharedVideoStudioError,
  attestSharedStudioCreativeAssets,
  sharedStudioRequest,
  type SharedStudioProject,
} from "@/lib/shared-video-studio";
import { centralVideoStudioAccountLibrary } from "@/lib/central-video-studio-account-library.server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_DRAFT_BODY_BYTES = 48 * 1024;
const MAX_FONT_BYTES = 5 * 1024 * 1024;
const MAX_FONT_FORM_BYTES = MAX_FONT_BYTES + 128 * 1024;
type Context = { params: Promise<{ projectId: string; action?: string[] }> };

export async function GET(_request: Request, context: Context) {
  const { projectId, action = [] } = await context.params;
  const current = await session(projectId);
  if (current instanceof NextResponse) return current;
  if (action.length === 2 && action[0] === "font-assets") {
    const assetId = action[1];
    if (!current.project.fontAssets?.some((asset) => asset.assetId === assetId)) return notFound();
    try {
      const font = await centralVideoStudioAccountLibrary.readFontAsset(
        current.project.product,
        current.actorId,
        assetId,
      );
      if (!font) return notFound();
      return new NextResponse(Buffer.from(font.data), {
        status: 200,
        headers: {
          "content-type": font.mimeType,
          "content-length": String(font.sizeBytes),
          "cache-control": "private, no-store, max-age=0",
          "content-disposition": `inline; filename="${safeHeaderFilename(font.filename)}"`,
          "x-content-type-options": "nosniff",
          "cross-origin-resource-policy": "same-origin",
        },
      });
    } catch {
      return NextResponse.json({ error: "Die Firmenschrift ist derzeit nicht verfügbar." }, { status: 503 });
    }
  }
  if (action.length) return notFound();
  return NextResponse.json({
    schemaVersion: "pix_video_studio_creative_contract_v1",
    projectId: current.project.id,
    product: current.project.product,
    capabilities: {
      sceneLayerPersistence: true,
      typographyElementPersistence: true,
      accountFontUpload: true,
      aiStoryboardDraftPersistence: true,
      aiStoryboardProviderJobs: false,
      avatarRendering: false,
    },
    boundaries: {
      stillDurationSeconds: { minimum: 0.6, maximum: 10 },
      timelineAutoTrim: false,
      generatedAudioPolicy: "reject",
      avatarLayerStatus: "reserved_non_renderable",
    },
    motionCatalog: {
      version: "still-image-motion-library-v1",
      count: VIDEO_STUDIO_MOTION_CATALOG.length,
      sourceKinds: ["source_based", "generative_ai"],
    },
  });
}

export async function POST(request: Request, context: Context) {
  const { projectId, action = [] } = await context.params;
  if (!(
    action.length === 1 && ["ai-storyboards", "font-assets"].includes(action[0]) ||
    action.length === 2 && action[0] === "font-assets"
  )) {
    return notFound();
  }
  const current = await session(projectId);
  if (current instanceof NextResponse) return current;
  if (action.length === 2) return selectExistingFont(current, action[1]);
  if (action[0] === "font-assets") {
    return uploadFont(request, current);
  }
  if (!hasBoundedBody(request)) {
    return NextResponse.json(
      { error: "Die Entwurfsanfrage ist zu groß oder nicht sicher begrenzt.", code: "body_not_bounded" },
      { status: 413 },
    );
  }
  const payload = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!payload) return invalid("Die Entwurfsdaten fehlen.");

  const selection = payload.selection as Record<string, unknown> | undefined;
  const motion = payload.motion as Record<string, unknown> | undefined;
  const sourceAssetId = typeof selection?.sourceAssetId === "string" ? selection.sourceAssetId : "";
  const demoNumber = Number(selection?.demoNumber);
  const motionId = typeof motion?.motionId === "string" ? motion.motionId : "";
  const motionIndex = VIDEO_STUDIO_MOTION_CATALOG.findIndex((candidate) => candidate.id === motionId);
  const definition = motionIndex >= 0 ? VIDEO_STUDIO_MOTION_CATALOG[motionIndex] : undefined;
  const timelineActivation = payload.timelineActivation as Record<string, unknown> | undefined;
  const takeId = typeof timelineActivation?.takeId === "string" ? timelineActivation.takeId : "";
  const mode = timelineActivation?.mode;
  const targetTake = current.project.takes.find((take) => take.id === takeId);
  const storyboardInput = payload.storyboard && typeof payload.storyboard === "object" && !Array.isArray(payload.storyboard)
    ? payload.storyboard as Record<string, unknown>
    : null;
  const storyboardTitle = typeof storyboardInput?.title === "string" ? storyboardInput.title.trim() : "";
  const storyboardSummary = typeof storyboardInput?.summary === "string" ? storyboardInput.summary.trim() : undefined;
  const storyboardBeats = Array.isArray(storyboardInput?.beats)
    ? storyboardInput.beats.flatMap((beat) => {
        if (!beat || typeof beat !== "object" || Array.isArray(beat)) return [];
        const description = typeof (beat as Record<string, unknown>).description === "string"
          ? ((beat as Record<string, unknown>).description as string).trim()
          : "";
        const order = Number((beat as Record<string, unknown>).order);
        return description && Number.isSafeInteger(order) ? [{ order, description }] : [];
      })
    : [];
  if (
    !current.project.assets.some((asset) => asset.id === sourceAssetId) ||
    !targetTake || targetTake.sourceAssetId !== sourceAssetId ||
    (mode !== "replace_take" && mode !== "insert_after_take") ||
    !Number.isSafeInteger(demoNumber) || demoNumber < 1 || demoNumber > 999 ||
    !definition || definition.sourceGroup !== "generative_ai" ||
    !storyboardTitle || storyboardTitle.length > 120 || storyboardBeats.length < 1 || storyboardBeats.length > 12 ||
    storyboardBeats.some((beat) => beat.description.length > 500) || (storyboardSummary?.length ?? 0) > 1000
  ) {
    return invalid("Bild, Demo-Nummer oder generative Bewegung ist ungültig.");
  }
  try {
    const draftId = `vsad_${randomUUID()}`;
    const result = await sharedStudioRequest<{ project: unknown; draft: unknown }>(
      `/v1/video-projects/${encodeURIComponent(projectId)}/ai-studio-drafts/${encodeURIComponent(draftId)}`,
      current.accessToken,
      {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          expectedRevision: current.project.revision,
          draft: {
            id: draftId,
            selection: { sourceAssetId, demoNumber },
            motion: {
              motionId,
              sourceKind: "generative_ai",
              motionClass: "generative_3d",
              capabilityId: "prepare.perspective_shift",
              supportStatus: "generation_draft",
              demoNumber: motionIndex + 1,
            },
            timelineActivation: { mode, takeId },
            status: "selected",
            storyboard: {
              title: storyboardTitle,
              ...(storyboardSummary ? { summary: storyboardSummary } : {}),
              beats: storyboardBeats,
            },
          },
        }),
      },
    );
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof SharedVideoStudioError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
    }
    return NextResponse.json({ error: "Der Storyboard-Entwurf konnte nicht gespeichert werden." }, { status: 500 });
  }
}

async function uploadFont(
  request: Request,
  current: Awaited<ReturnType<typeof readCentralVideoStudioSession>>,
) {
  if ((current.project.fontAssets?.length ?? 0) >= 8) {
    return NextResponse.json({ error: "Dieses Projekt verwendet bereits acht Firmenschriften. Bitte zuerst eine Auswahl entfernen.", code: "font_selection_limit" }, { status: 409 });
  }
  const contentLength = Number(request.headers.get("content-length"));
  if (!Number.isSafeInteger(contentLength) || contentLength < 1 || contentLength > MAX_FONT_FORM_BYTES) {
    return NextResponse.json({ error: "Die Schriftdatei ist zu groß oder nicht sicher begrenzt.", code: "font_body_not_bounded" }, { status: 413 });
  }
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File) || form?.get("rightsConfirmed") !== "true") {
    return invalid("Eine eigene Schrift benötigt eine Datei und bestätigte Nutzungsrechte.");
  }
  const mimeType = normalizedFontMime(file);
  if (!mimeType || file.size < 1 || file.size > MAX_FONT_BYTES) {
    return NextResponse.json({ error: "Erlaubt sind TTF, OTF und WOFF2 bis 5 MB.", code: "invalid_font_file" }, { status: 415 });
  }
  const data = new Uint8Array(await file.arrayBuffer());
  if (!hasFontSignature(data, mimeType)) {
    return NextResponse.json({ error: "Die Schriftdatei hat keine gültige TTF-, OTF- oder WOFF2-Signatur.", code: "invalid_font_signature" }, { status: 415 });
  }
  const filename = file.name.replace(/[\\/\r\n\0]/g, "-").slice(0, 180) || "eigene-schrift";
  const displayName = filename.replace(/\.(ttf|otf|woff2)$/i, "").replace(/[-_]+/g, " ").trim().slice(0, 80) || "Eigene Schrift";
  const licenseReference = String(form?.get("licenseReference") ?? "").trim().slice(0, 500) || undefined;
  const assetId = `vsf_${randomUUID()}`;
  const rightsConfirmedAt = new Date();
  try {
    const internal = await centralVideoStudioAccountLibrary.registerFontAsset(
      current.project.product,
      current.actorId,
      { assetId, displayName, filename, mimeType, data, rightsConfirmedAt, licenseReference },
    );
    const attested = await attestSharedStudioCreativeAssets<{ project: { revision: number } }>(
      current.project.product,
      current.project.id,
      {
        schemaVersion: "video_studio_creative_asset_attestation_v1",
        product: current.project.product,
        projectId: current.project.id,
        tenantId: current.project.tenantId,
        actorId: current.actorId,
        expectedRevision: current.project.revision,
        creativeAssets: [{
          assetId: internal.assetId,
          kind: "account_font",
          storageKey: internal.storageKey,
          filename: internal.filename,
          mimeType: internal.mimeType,
          sizeBytes: internal.sizeBytes,
          displayName: internal.displayName,
          fontFamily: internal.displayName,
          rightsConfirmedAt: internal.rightsConfirmedAt,
          rightsConfirmedByActorId: current.actorId,
          ...(internal.licenseReference ? { licenseReference: internal.licenseReference } : {}),
        }],
      },
    );
    const selectedFontIds = [
      ...(current.project.fontAssets ?? []).map((asset) => asset.assetId),
      internal.assetId,
    ].filter((value, index, all) => all.indexOf(value) === index);
    const { project } = await sharedStudioRequest<{ project: SharedStudioProject }>(
      `/v1/video-projects/${encodeURIComponent(current.project.id)}/font-assets`,
      current.accessToken,
      {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ expectedRevision: attested.project.revision, fontAssetIds: selectedFontIds }),
      },
    );
    return NextResponse.json({
      project,
      fontAsset: {
        assetId: internal.assetId,
        displayName: internal.displayName,
        filename: internal.filename,
        mimeType: internal.mimeType,
        sizeBytes: internal.sizeBytes,
        rightsConfirmation: {
          confirmed: true,
          confirmedAt: internal.rightsConfirmedAt,
          ...(internal.licenseReference ? { licenseReference: internal.licenseReference } : {}),
        },
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof SharedVideoStudioError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
    }
    return NextResponse.json({ error: "Die Schrift konnte nicht sicher im Kundenkonto gespeichert werden." }, { status: 500 });
  }
}

async function selectExistingFont(
  current: Awaited<ReturnType<typeof readCentralVideoStudioSession>>,
  assetId: string,
) {
  if (current.project.fontAssets?.some((asset) => asset.assetId === assetId)) {
    return NextResponse.json({
      fontAsset: current.project.fontAssets.find((asset) => asset.assetId === assetId),
      project: current.project,
    });
  }
  if ((current.project.fontAssets?.length ?? 0) >= 8) {
    return NextResponse.json({ error: "Dieses Projekt verwendet bereits acht Firmenschriften.", code: "font_selection_limit" }, { status: 409 });
  }
  try {
    const internal = await centralVideoStudioAccountLibrary.resolveFontAsset(
      current.project.product,
      current.actorId,
      assetId,
    );
    if (!internal) return notFound();
    const attested = await attestSharedStudioCreativeAssets<{ project: { revision: number } }>(
      current.project.product,
      current.project.id,
      {
        schemaVersion: "video_studio_creative_asset_attestation_v1",
        product: current.project.product,
        projectId: current.project.id,
        tenantId: current.project.tenantId,
        actorId: current.actorId,
        expectedRevision: current.project.revision,
        creativeAssets: [{
          assetId: internal.assetId,
          kind: "account_font",
          storageKey: internal.storageKey,
          filename: internal.filename,
          mimeType: internal.mimeType,
          sizeBytes: internal.sizeBytes,
          displayName: internal.displayName,
          fontFamily: internal.displayName,
          rightsConfirmedAt: internal.rightsConfirmedAt,
          rightsConfirmedByActorId: current.actorId,
          ...(internal.licenseReference ? { licenseReference: internal.licenseReference } : {}),
        }],
      },
    );
    const selectedFontIds = [...(current.project.fontAssets ?? []).map((asset) => asset.assetId), internal.assetId];
    const { project } = await sharedStudioRequest<{ project: SharedStudioProject }>(
      `/v1/video-projects/${encodeURIComponent(current.project.id)}/font-assets`,
      current.accessToken,
      {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ expectedRevision: attested.project.revision, fontAssetIds: selectedFontIds }),
      },
    );
    return NextResponse.json({
      fontAsset: { assetId: internal.assetId, displayName: internal.displayName, filename: internal.filename },
      project,
    });
  } catch (error) {
    if (error instanceof SharedVideoStudioError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
    }
    return NextResponse.json({ error: "Die Firmenschrift konnte dem Projekt nicht sicher zugeordnet werden." }, { status: 500 });
  }
}

function normalizedFontMime(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension === "ttf" && ["font/ttf", "application/x-font-ttf", "application/octet-stream", ""].includes(file.type)) return "font/ttf" as const;
  if (extension === "otf" && ["font/otf", "application/x-font-opentype", "application/octet-stream", ""].includes(file.type)) return "font/otf" as const;
  if (extension === "woff2" && ["font/woff2", "application/font-woff2", "application/octet-stream", ""].includes(file.type)) return "font/woff2" as const;
  return null;
}

function hasFontSignature(data: Uint8Array, mimeType: "font/ttf" | "font/otf" | "font/woff2") {
  if (data.length < 4) return false;
  const signature = String.fromCharCode(...data.slice(0, 4));
  if (mimeType === "font/woff2") return signature === "wOF2";
  if (mimeType === "font/otf") return signature === "OTTO";
  return (data[0] === 0 && data[1] === 1 && data[2] === 0 && data[3] === 0) || signature === "true";
}

function hasBoundedBody(request: Request) {
  const contentLength = Number(request.headers.get("content-length"));
  return Number.isSafeInteger(contentLength) && contentLength >= 1 && contentLength <= MAX_DRAFT_BODY_BYTES;
}

function invalid(message: string) {
  return NextResponse.json({ error: message, code: "invalid_creative_draft" }, { status: 400 });
}

function notFound() {
  return NextResponse.json({ error: "Werkstatt-Route nicht gefunden." }, { status: 404 });
}

function safeHeaderFilename(value: string) {
  return value.replace(/[\"\\\r\n\0]/g, "-").slice(0, 180) || "firmenschrift";
}

async function session(projectId: string) {
  try {
    return await readCentralVideoStudioSession(projectId);
  } catch (error) {
    if (error instanceof CentralVideoStudioSessionError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: "Die Werkstatt-Sitzung konnte nicht geprüft werden." },
      { status: 500 },
    );
  }
}
