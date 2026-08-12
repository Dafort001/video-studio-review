import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { readVideoWorkbenchProject } from "@/lib/video-workbench-projects";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;
  const project = await readVideoWorkbenchProject(projectId);
  const providerJobs = project.sections.providerJobs as { data?: unknown } | undefined;
  const data = providerJobs?.data && typeof providerJobs.data === "object"
    ? providerJobs.data as Record<string, unknown>
    : {};

  return NextResponse.json({
    success: true,
    projectId: project.id,
    costs: data.costs ?? {
      currency: "USD",
      estimatedTotalUsd: 0,
      billedTotalUsd: 0,
      jobCount: 0,
      completedJobCount: 0,
      updatedAt: project.updatedAt,
    },
    jobs: data.jobs ?? [],
  });
}
