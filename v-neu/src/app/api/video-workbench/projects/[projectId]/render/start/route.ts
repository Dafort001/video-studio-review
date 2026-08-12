import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  readVideoWorkbenchProject,
  updateVideoWorkbenchProjectSection,
} from "@/lib/video-workbench-projects";
import {
  createRenderJob,
  startVideoWorkbenchRenderJob,
  type MotionPlan,
  type VideoWorkbenchRenderJob,
} from "@/lib/video-workbench-renderer";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RenderStartBody = {
  motionPlan?: MotionPlan;
  sourceProduct?: "piximmo" | "pixcapture" | "workbench" | null;
};

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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  if (!(await requireSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;
  const body = await request.json().catch(() => ({})) as RenderStartBody;
  const project = await readVideoWorkbenchProject(projectId);
  const motionSection = project.sections.motion as { data?: MotionPlan } | undefined;
  const motionPlan = body.motionPlan ?? motionSection?.data;
  if (!motionPlan?.items?.length) {
    return NextResponse.json(
      { error: "Kein Motion-Plan vorhanden. Bitte zuerst den Plan speichern." },
      { status: 400 },
    );
  }

  let store = exportsFromSection(project.sections.exports);
  let job = createRenderJob({
    projectId,
    sourceProduct: body.sourceProduct ?? project.lastWriter?.sourceProduct ?? "workbench",
  });
  store = await saveJob(projectId, store, job);

  try {
    job = await startVideoWorkbenchRenderJob({ job, motionPlan });
    await saveJob(projectId, store, job);
    return NextResponse.json({ success: true, job });
  } catch (error) {
    job = {
      ...job,
      status: "failed",
      updatedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Render fehlgeschlagen.",
    };
    await saveJob(projectId, store, job);
    return NextResponse.json({ success: false, job, error: job.error }, { status: 500 });
  }
}
