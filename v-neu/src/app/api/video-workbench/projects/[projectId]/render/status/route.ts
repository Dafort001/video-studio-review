import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  readVideoWorkbenchProject,
  updateVideoWorkbenchProjectSection,
} from "@/lib/video-workbench-projects";
import {
  refreshVideoWorkbenchRenderJob,
  type VideoWorkbenchRenderJob,
} from "@/lib/video-workbench-renderer";

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

function upsertJob(store: ExportStore, job: VideoWorkbenchRenderJob): ExportStore {
  const jobs = store.jobs ?? [];
  const existingIndex = jobs.findIndex((entry) => entry.id === job.id);
  const nextJobs = existingIndex >= 0
    ? jobs.map((entry, index) => index === existingIndex ? job : entry)
    : [job, ...jobs].slice(0, 20);
  return {
    activeJobId: job.id,
    jobs: nextJobs,
  };
}

async function saveJob(projectId: string, store: ExportStore, job: VideoWorkbenchRenderJob) {
  const nextStore = upsertJob(store, job);
  await updateVideoWorkbenchProjectSection({
    projectId,
    section: "exports",
    data: nextStore,
    page: "motion",
    sourceProduct: job.sourceProduct,
  });
  return nextStore;
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
  let store = exportsFromSection(project.sections.exports);
  let job = jobId
    ? store.jobs?.find((entry) => entry.id === jobId)
    : store.jobs?.find((entry) => entry.id === store.activeJobId) ?? store.jobs?.[0];

  if (!job) {
    return NextResponse.json({ success: true, job: null, jobs: [] });
  }

  const refreshed = await refreshVideoWorkbenchRenderJob(job);
  if (refreshed !== job) {
    store = await saveJob(projectId, store, refreshed);
    job = refreshed;
  }

  return NextResponse.json({ success: true, job, jobs: store.jobs ?? [] });
}
