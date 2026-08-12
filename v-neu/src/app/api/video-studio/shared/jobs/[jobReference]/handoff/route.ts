import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPiximmoSharedVideoStudioJob, resolveSessionUser } from "@/lib/video-studio-server";
import {
  exchangePiximmoVideoStudioHandoff,
  SharedVideoStudioError,
} from "@/lib/shared-video-studio";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ jobReference: string }> },
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { jobReference } = await params;
  const scope = {
    userId: session.user.id,
    email: session.user.email,
    isAdmin: session.user.role === "admin",
  };
  const [job, actor] = await Promise.all([
    getPiximmoSharedVideoStudioJob(scope, jobReference),
    resolveSessionUser(scope),
  ]);
  if (!job) return NextResponse.json({ error: "Auftrag nicht gefunden." }, { status: 404 });
  if (!actor) return NextResponse.json({ error: "Die Benutzersitzung ist unvollständig." }, { status: 401 });
  if (job.assets.length < 2) {
    return NextResponse.json({
      error: "Für ein Video werden mindestens zwei freigegebene Delivery-Bilder benötigt.",
    }, { status: 409 });
  }

  try {
    const exchanged = await exchangePiximmoVideoStudioHandoff({
      schemaVersion: "video_studio_handoff_v1",
      product: "piximmo",
      tenantId: job.tenantId,
      actorId: actor.id,
      sourceReference: { type: "job", id: job.sourceReferenceId },
      name: `${job.setup.projectName} · Video`,
      returnUrl: `/dashboard/video-studio/setup?jobId=${encodeURIComponent(job.setup.reference)}`,
      assets: job.assets,
      creativeAssets: job.creativeAssets,
    });
    const project = exchanged.project;

    if (!exchanged.workbenchUrl || !exchanged.launchCode) {
      throw new SharedVideoStudioError(
        502,
        "Die zentrale Video-Werkstatt hat keinen Startlink geliefert.",
      );
    }
    const workbenchUrl = exchanged.workbenchUrl;
    const response = NextResponse.json({
      success: true,
      project,
      workbenchUrl,
      selectedCount: project.revision === 2 ? 0 : project.takes.length,
      durationSeconds: project.revision === 2
        ? 0
        : project.takes.reduce((sum, take) => sum + take.durationSeconds, 0),
    });
    return response;
  } catch (error) {
    if (error instanceof SharedVideoStudioError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
    }
    console.error("[shared-video-studio] PixImmo handoff failed", error);
    return NextResponse.json({ error: "Die Video-Werkstatt konnte nicht geöffnet werden." }, { status: 500 });
  }
}
