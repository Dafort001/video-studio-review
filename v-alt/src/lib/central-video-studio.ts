import type { SharedStudioProject } from "@/lib/shared-video-studio";

export type StudioSourceImage = {
  id: string;
  filename: string;
  previewUrl: string;
  roomLabel: string | null;
  role: "exterior" | "interior" | "detail";
  width: number | null;
  height: number | null;
  description: string | null;
};

export const SHARED_VIDEO_STUDIO_SOURCE_PREVIEW_TTL_SECONDS = 600;

export function sharedVideoStudioSourcePreviewExpiresAt(now = Date.now()) {
  return new Date(
    now + SHARED_VIDEO_STUDIO_SOURCE_PREVIEW_TTL_SECONDS * 1000,
  ).toISOString();
}

export function studioSourceImagesFromProject(
  project: SharedStudioProject,
): StudioSourceImage[] {
  return project.assets.flatMap((asset) => {
    if (!asset.sourcePreviewUrl) return [];
    return [
      {
        id: asset.id,
        filename: asset.filename ?? "Motiv",
        previewUrl: asset.sourcePreviewUrl,
        roomLabel: asset.motif ?? null,
        role: studioImageRole(asset.motif),
        width: asset.width ?? null,
        height: asset.height ?? null,
        description: asset.description ?? null,
      },
    ];
  });
}

function studioImageRole(motif: string | undefined): StudioSourceImage["role"] {
  const value = motif?.toLowerCase() ?? "";
  if (/detail|nahaufnahme/.test(value)) return "detail";
  if (
    /außen|aussen|exterior|entrance|balcony|terrace|garden|view|fassade|garten|see|terrasse/.test(
      value,
    )
  ) {
    return "exterior";
  }
  return "interior";
}

export function videoStudioProductLabel(
  product: SharedStudioProject["product"],
) {
  return product === "pixcapture" ? "PixCapture" : "PixImmo";
}

export function resolveVideoStudioReturnUrl(
  project: Pick<SharedStudioProject, "product" | "returnUrl">,
  portalBaseUrl: string,
) {
  const base = new URL(portalBaseUrl);
  if (
    base.protocol !== "https:" &&
    !(base.protocol === "http:" && ["localhost", "127.0.0.1"].includes(base.hostname))
  ) {
    throw new Error("Invalid portal base URL");
  }
  const returnUrl = project.returnUrl;
  if (!returnUrl || !returnUrl.startsWith("/") || returnUrl.startsWith("//")) {
    throw new Error(`Invalid ${project.product} return path`);
  }
  return new URL(returnUrl, base).toString();
}

export function centralVideoStudioStarterUrl(requestUrl: string) {
  const source = new URL(requestUrl);
  const target = new URL("/dashboard/video-studio/setup", source.origin);
  const jobReference = source.searchParams.get("jobId")?.trim();
  if (jobReference) target.searchParams.set("jobId", jobReference);
  target.searchParams.set("studioSession", "central");
  return target;
}
