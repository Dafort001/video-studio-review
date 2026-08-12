import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  readVideoWorkbenchProject,
  updateVideoWorkbenchProjectSection,
  type VideoWorkbenchSection,
} from "@/lib/video-workbench-projects";
import { canAccessVideoStudioJob } from "@/lib/video-studio-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const VALID_SECTIONS = new Set<VideoWorkbenchSection>([
  "briefing",
  "timeline",
  "motion",
  "presenter",
  "promptPipeline",
  "providerJobs",
  "exports",
]);

type PatchBody = {
  section?: VideoWorkbenchSection;
  data?: unknown;
  page?: string | null;
  sourceProduct?: "piximmo" | "pixcapture" | "workbench" | null;
};

async function requireSession() {
  return auth();
}

function jobReferenceFromProjectId(projectId: string) {
  const match = projectId.match(/^job-(.+)-shared-video-project-v1$/i);
  return match?.[1]?.toUpperCase() ?? null;
}

async function mayAccessProject(projectId: string, session: Awaited<ReturnType<typeof auth>>) {
  if (!session?.user) return false;
  const jobReference = jobReferenceFromProjectId(projectId);
  if (!jobReference) return true;
  return canAccessVideoStudioJob({
    userId: session.user.id,
    email: session.user.email,
    isAdmin: session.user.role === "admin",
  }, jobReference);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const session = await requireSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;
  if (!(await mayAccessProject(projectId, session))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const project = await readVideoWorkbenchProject(projectId);
  return NextResponse.json({ success: true, project });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const session = await requireSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;
  if (!(await mayAccessProject(projectId, session))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await request.json().catch(() => ({})) as PatchBody;
  if (!body.section || !VALID_SECTIONS.has(body.section)) {
    return NextResponse.json({ error: "Ungueltiger Projektbereich." }, { status: 400 });
  }

  const project = await updateVideoWorkbenchProjectSection({
    projectId,
    section: body.section,
    data: body.data ?? null,
    page: body.page ?? null,
    sourceProduct: body.sourceProduct ?? "workbench",
  });

  return NextResponse.json({ success: true, project });
}
