import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getVideoStudioSetupJob } from "@/lib/video-studio-server";
import {
  buildVideoTimelinePlan,
  defaultVideoProjectBriefing,
  normalizeVideoProjectBriefing,
  videoCandidateIndexForJob,
  videoProjectIdForJob,
} from "@/lib/video-project-briefing";
import { writeVideoWorkbenchProjectSections } from "@/lib/video-workbench-projects";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(
  request: Request,
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
  const job = await getVideoStudioSetupJob(scope, jobReference);
  if (!job) return NextResponse.json({ error: "Auftrag nicht gefunden." }, { status: 404 });
  if (job.images.length === 0) {
    return NextResponse.json({
      error: "Für diesen Auftrag sind noch keine freigegebenen Delivery-Bilder verfügbar. Bitte zuerst Editor-Intake und QC abschließen.",
    }, { status: 409 });
  }

  const body = await request.json().catch(() => null);
  const fallback = defaultVideoProjectBriefing({
    jobId: job.reference,
    projectName: job.projectName,
    locationLabel: job.propertyAddress,
    images: job.images,
  });
  const briefing = normalizeVideoProjectBriefing(body, fallback);
  briefing.jobId = job.reference;
  const candidateIndex = videoCandidateIndexForJob(job.reference);
  const timeline = buildVideoTimelinePlan({
    projectName: job.projectName,
    candidateIndex,
    images: job.images,
    briefing,
  });
  const projectId = videoProjectIdForJob(job.reference);
  const project = await writeVideoWorkbenchProjectSections({
    projectId,
    title: `${job.projectName} · Video`,
    candidateIndex,
    candidateLabel: job.projectName,
    sections: { briefing, timeline },
    page: "video-setup",
    sourceProduct: "piximmo",
  });

  return NextResponse.json({
    success: true,
    projectId,
    revision: project.revision,
    timelineUrl: `/dashboard/video-studio/setup?jobId=${encodeURIComponent(job.reference)}`,
    selectedCount: timeline.selected_count,
    durationSeconds: timeline.timeline.reduce((sum, take) => sum + take.duration_seconds, 0),
  });
}
