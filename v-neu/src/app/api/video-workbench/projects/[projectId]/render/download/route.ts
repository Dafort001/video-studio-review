import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSignedDownloadUrl } from "@/lib/r2";
import { readVideoWorkbenchProject } from "@/lib/video-workbench-projects";
import type { VideoWorkbenchRenderJob } from "@/lib/video-workbench-renderer";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ExportStore = {
  activeJobId?: string;
  jobs?: VideoWorkbenchRenderJob[];
};

async function requireSession() {
  const session = await auth();
  return Boolean(session?.user);
}

function exportsFromSection(section: unknown): ExportStore {
  if (!section || typeof section !== "object") return { jobs: [] };
  const maybeWrapped = section as { data?: unknown };
  const data = maybeWrapped.data && typeof maybeWrapped.data === "object"
    ? maybeWrapped.data as ExportStore
    : section as ExportStore;
  return {
    activeJobId: data.activeJobId,
    jobs: Array.isArray(data.jobs) ? data.jobs : [],
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  if (!(await requireSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;
  const url = new URL(request.url);
  const jobId = url.searchParams.get("jobId");
  const project = await readVideoWorkbenchProject(projectId);
  const store = exportsFromSection(project.sections.exports);
  const job = jobId
    ? store.jobs?.find((entry) => entry.id === jobId)
    : store.jobs?.find((entry) => entry.id === store.activeJobId) ?? store.jobs?.[0];

  if (!job?.outputKey || job.status !== "completed") {
    return NextResponse.json({ error: "Kein fertiges Render-Video vorhanden." }, { status: 404 });
  }

  const signedUrl = await getSignedDownloadUrl(job.outputKey, 3600);
  return NextResponse.redirect(signedUrl);
}
