import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import sharp from "sharp";
import {
  centralVideoStudioAccountLibrary,
} from "@/lib/central-video-studio-account-library.server";
import { StudioAccountLibraryInputError } from "@/lib/central-video-studio-account-library";
import {
  CentralVideoStudioSessionError,
  readCentralVideoStudioSession,
} from "@/lib/central-video-studio-session.server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_LOGO_BYTES = 5 * 1024 * 1024;
const MAX_MULTIPART_OVERHEAD_BYTES = 256 * 1024;
const MAX_PRESET_BODY_BYTES = 70 * 1024;
type Context = { params: Promise<{ projectId: string; action?: string[] }> };

export async function GET(_request: Request, context: Context) {
  const { projectId, action = [] } = await context.params;
  if (action.length) return notFound();
  return handle(async () => {
    const current = await readCentralVideoStudioSession(projectId);
    return NextResponse.json(
      await centralVideoStudioAccountLibrary.readLibrary(
        current.project.product,
        current.actorId,
      ),
    );
  });
}

export async function POST(request: Request, context: Context) {
  const { projectId, action = [] } = await context.params;
  if (action.length !== 1 || !["brand-assets", "presets"].includes(action[0])) {
    return notFound();
  }
  return handle(async () => {
    const current = await readCentralVideoStudioSession(projectId);
    if (action[0] === "presets") {
      requireBoundedContentLength(request, MAX_PRESET_BODY_BYTES);
      const value = await request.json().catch(() => null);
      const saved = await centralVideoStudioAccountLibrary.savePreset(
        current.project.product,
        current.actorId,
        value,
      );
      return NextResponse.json(
        { preset: saved.preset },
        { status: saved.created ? 201 : 200 },
      );
    }

    const input = await normalizedLogo(request);
    const asset = await centralVideoStudioAccountLibrary.registerBrandAsset(
      current.project.product,
      current.actorId,
      input,
    );
    return NextResponse.json({ asset }, { status: 201 });
  });
}

async function normalizedLogo(request: Request) {
  requireBoundedContentLength(
    request,
    MAX_LOGO_BYTES + MAX_MULTIPART_OVERHEAD_BYTES,
  );
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    throw new StudioAccountLibraryInputError(
      400,
      "Bitte eine Logo-Datei auswählen.",
    );
  }
  if (!["image/png", "image/jpeg"].includes(file.type)) {
    throw new StudioAccountLibraryInputError(
      415,
      "Erlaubt sind PNG und JPG. PNG mit transparentem Hintergrund wird empfohlen.",
    );
  }
  if (file.size < 1 || file.size > MAX_LOGO_BYTES) {
    throw new StudioAccountLibraryInputError(
      413,
      "Das Logo darf höchstens 5 MB groß sein.",
    );
  }
  const input = Buffer.from(await file.arrayBuffer());
  const metadata = await sharp(input).metadata();
  if (
    !metadata.width ||
    !metadata.height ||
    metadata.width < 64 ||
    metadata.height < 64 ||
    metadata.width > 4096 ||
    metadata.height > 4096
  ) {
    throw new StudioAccountLibraryInputError(
      400,
      "Das Logo muss zwischen 64 × 64 und 4096 × 4096 Pixel groß sein.",
    );
  }
  const normalized = await sharp(input)
    .rotate()
    .resize({
      width: 2048,
      height: 2048,
      fit: "inside",
      withoutEnlargement: true,
    })
    .png({ compressionLevel: 9 })
    .toBuffer({ resolveWithObject: true });
  if (normalized.data.byteLength > MAX_LOGO_BYTES) {
    throw new StudioAccountLibraryInputError(
      413,
      "Das normalisierte Logo überschreitet 5 MB.",
    );
  }
  const stem = file.name
    .replace(/[\\/\r\n\0]/g, "-")
    .replace(/\.[^.]+$/, "")
    .slice(0, 160);
  return {
    id: `vsb_${randomUUID()}`,
    filename: `${stem || "logo"}.png`,
    data: normalized.data,
    width: normalized.info.width,
    height: normalized.info.height,
  };
}

function requireBoundedContentLength(request: Request, maximumBytes: number) {
  const contentLength = Number(request.headers.get("content-length"));
  if (!Number.isSafeInteger(contentLength) || contentLength < 1) {
    throw new StudioAccountLibraryInputError(
      411,
      "Die Anfragegröße konnte nicht sicher geprüft werden.",
    );
  }
  if (contentLength > maximumBytes) {
    throw new StudioAccountLibraryInputError(
      413,
      "Die Anfrage ist zu groß.",
    );
  }
}

async function handle(action: () => Promise<NextResponse>) {
  try {
    return await action();
  } catch (error) {
    if (
      error instanceof CentralVideoStudioSessionError ||
      error instanceof StudioAccountLibraryInputError
    ) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[central-video-studio] Account library request failed", {
      errorName: error instanceof Error ? error.name : "UnknownError",
    });
    return NextResponse.json(
      { error: "Die persönlichen Werkstatt-Inhalte konnten nicht verarbeitet werden." },
      { status: 500 },
    );
  }
}

function notFound() {
  return NextResponse.json(
    { error: "Werkstatt-Route nicht gefunden." },
    { status: 404 },
  );
}
