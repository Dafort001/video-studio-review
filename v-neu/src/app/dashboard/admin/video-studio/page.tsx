import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getVideoStudioSetupJobs } from "@/lib/video-studio-server";
import { VideoStudioSetupClient } from "@/app/dashboard/video-studio/setup/VideoStudioSetupClient";
import Link from "next/link";

export const dynamic = "force-dynamic";

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminVideoStudioPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/auth/signin");
  }

  const jobs = await getVideoStudioSetupJobs({
    userId: session.user.id,
    email: session.user.email,
    isAdmin: true,
  });
  const query = await searchParams;
  const requestedReference = single(query?.jobId);
  const activeJob = jobs.find((job) => (
    job.reference === requestedReference || job.id === requestedReference || job.jobId === requestedReference
  )) ?? jobs.find((job) => job.readyImageCount > 0) ?? jobs[0] ?? null;

  return (
    <>
      <div className="mx-auto mb-5 flex max-w-7xl justify-end"><Link href="/dashboard/admin/video-studio/fonts" className="border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-muted">Schriftmenü verwalten</Link></div>
      <VideoStudioSetupClient
      jobs={jobs}
      initialJobReference={activeJob?.reference ?? null}
      initialBriefing={null}
      isAdmin
      workbenchArea="admin"
      />
    </>
  );
}
