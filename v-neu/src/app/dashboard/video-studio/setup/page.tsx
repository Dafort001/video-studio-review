import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getVideoStudioSetupJobs } from "@/lib/video-studio-server";
import {
  defaultVideoProjectBriefing,
  normalizeVideoProjectBriefing,
  videoProjectIdForJob,
} from "@/lib/video-project-briefing";
import { readVideoWorkbenchProject } from "@/lib/video-workbench-projects";
import { VideoStudioSetupClient } from "./VideoStudioSetupClient";

export const dynamic = "force-dynamic";

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function VideoStudioSetupPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  const jobs = await getVideoStudioSetupJobs({
    userId: session.user.id,
    email: session.user.email,
    isAdmin: session.user.role === "admin",
  });
  const params = await searchParams;
  const requestedReference = single(params?.jobId);
  const activeJob = jobs.find((job) => (
    job.reference === requestedReference || job.id === requestedReference || job.jobId === requestedReference
  )) ?? jobs.find((job) => job.readyImageCount > 0) ?? jobs[0] ?? null;
  let initialBriefing = activeJob
    ? defaultVideoProjectBriefing({
        jobId: activeJob.reference,
        projectName: activeJob.projectName,
        locationLabel: activeJob.propertyAddress,
        images: activeJob.images,
      })
    : null;
  if (activeJob && initialBriefing) {
    const project = await readVideoWorkbenchProject(videoProjectIdForJob(activeJob.reference));
    const saved = project.sections.briefing as { data?: unknown } | undefined;
    initialBriefing = normalizeVideoProjectBriefing(saved?.data, initialBriefing);
  }

  return (
    <VideoStudioSetupClient
      jobs={jobs}
      initialJobReference={activeJob?.reference ?? null}
      initialBriefing={initialBriefing}
      isAdmin={session.user.role === "admin"}
    />
  );
}
