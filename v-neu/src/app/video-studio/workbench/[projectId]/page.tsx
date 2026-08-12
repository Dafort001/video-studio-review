import { redirect } from "next/navigation";
import { SharedVideoStudioWorkbench } from "@/app/dashboard/video-studio/workbench/[projectId]/SharedVideoStudioWorkbench";
import { centralVideoStudioAccountLibrary } from "@/lib/central-video-studio-account-library.server";
import type {
  StudioAccountBrandAsset,
  StudioAccountFontAsset,
  StudioAccountPreset,
} from "@/lib/central-video-studio-account-library";
import {
  resolveVideoStudioReturnUrl,
  studioSourceImagesFromProject,
} from "@/lib/central-video-studio";
import { readCentralVideoStudioSession } from "@/lib/central-video-studio-session.server";
import { VIDEO_STUDIO_FONTS } from "@/lib/video-studio-font-catalog";

export const dynamic = "force-dynamic";

export default async function CentralVideoStudioPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  let current;
  try {
    current = await readCentralVideoStudioSession(projectId);
  } catch {
    redirect("/video-studio/launch");
  }

  const images = studioSourceImagesFromProject(current.project);
  if (images.length !== current.project.assets.length) {
    throw new Error(
      "Die freigegebenen Vorschaubilder dieses Projekts sind unvollständig.",
    );
  }
  const portalBaseUrl =
    current.project.product === "pixcapture"
      ? process.env.PIXCAPTURE_PORTAL_URL
      : process.env.PIXIMMO_PORTAL_URL;
  if (!portalBaseUrl) {
    throw new Error(
      `Die Rücksprungadresse für ${current.project.product} ist nicht konfiguriert.`,
    );
  }
  const returnUrl = resolveVideoStudioReturnUrl(
    current.project,
    portalBaseUrl,
  );
  let accountLibraryAvailable = true;
  let userLibrary: {
    brandAssets: StudioAccountBrandAsset[];
    presets: StudioAccountPreset[];
    fontAssets: StudioAccountFontAsset[];
  } = { brandAssets: [], presets: [], fontAssets: [] };
  try {
    userLibrary = await centralVideoStudioAccountLibrary.readLibrary(
      current.project.product,
      current.actorId,
    );
  } catch {
    accountLibraryAvailable = false;
  }

  return (
    <main className="min-h-screen bg-background px-4 py-6 md:px-7 lg:px-10">
      <SharedVideoStudioWorkbench
        initialProject={current.project}
        images={images}
        returnUrl={returnUrl}
        fontMenu={VIDEO_STUDIO_FONTS}
        userLibrary={userLibrary}
        accountLibraryAvailable={accountLibraryAvailable}
      />
    </main>
  );
}
