import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";

export type VideoWorkbenchSection =
  | "briefing"
  | "timeline"
  | "motion"
  | "presenter"
  | "promptPipeline"
  | "providerJobs"
  | "exports";

export type VideoWorkbenchProject = {
  schemaVersion: "video_project_v1";
  id: string;
  title: string;
  candidateIndex: number | null;
  candidateLabel: string | null;
  ownerProducts: Array<"piximmo" | "pixcapture">;
  createdAt: string;
  updatedAt: string;
  revision: number;
  sections: Partial<Record<VideoWorkbenchSection, unknown>>;
  lastWriter?: {
    page?: string | null;
    sourceProduct?: "piximmo" | "pixcapture" | "workbench" | null;
    savedAt: string;
  };
};

const STORE_DIR = path.join(process.cwd(), ".video-workbench", "projects");

function safeProjectId(projectId: string) {
  return projectId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80) || "candidate-10";
}

function projectPath(projectId: string) {
  return path.join(STORE_DIR, `${safeProjectId(projectId)}.json`);
}

function nowIso() {
  return new Date().toISOString();
}

function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

type VideoWorkbenchProjectRow = {
  projectId: string;
  title: string;
  candidateIndex: number | null;
  candidateLabel: string | null;
  ownerProducts: unknown;
  sections: unknown;
  lastWriter: unknown | null;
  revision: number;
  createdAt: Date | string;
  updatedAt: Date | string;
};

function isoFromDbDate(value: Date | string) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function rowToProject(row: VideoWorkbenchProjectRow): VideoWorkbenchProject {
  return {
    schemaVersion: "video_project_v1",
    id: safeProjectId(row.projectId),
    title: row.title,
    candidateIndex: row.candidateIndex,
    candidateLabel: row.candidateLabel,
    ownerProducts: Array.isArray(row.ownerProducts)
      ? row.ownerProducts as Array<"piximmo" | "pixcapture">
      : ["piximmo", "pixcapture"],
    createdAt: isoFromDbDate(row.createdAt),
    updatedAt: isoFromDbDate(row.updatedAt),
    revision: row.revision,
    sections: row.sections && typeof row.sections === "object"
      ? row.sections as Partial<Record<VideoWorkbenchSection, unknown>>
      : {},
    lastWriter: row.lastWriter && typeof row.lastWriter === "object"
      ? row.lastWriter as VideoWorkbenchProject["lastWriter"]
      : undefined,
  };
}

async function readProjectFromDatabase(projectId: string) {
  if (!hasDatabase()) return null;
  const safeId = safeProjectId(projectId);
  try {
    const rows = await prisma.$queryRaw<VideoWorkbenchProjectRow[]>`
      SELECT "projectId", "title", "candidateIndex", "candidateLabel",
             "ownerProducts", "sections", "lastWriter", "revision",
             "createdAt", "updatedAt"
      FROM "VideoWorkbenchProject"
      WHERE "projectId" = ${safeId}
      LIMIT 1
    `;
    return rows[0] ? rowToProject(rows[0]) : null;
  } catch (error) {
    console.warn("[video-workbench] Could not read database project store", error);
    return null;
  }
}

async function writeProjectToDatabase(project: VideoWorkbenchProject) {
  if (!hasDatabase()) return false;
  try {
    await prisma.$executeRaw`
      INSERT INTO "VideoWorkbenchProject" (
        "id", "projectId", "title", "candidateIndex", "candidateLabel",
        "ownerProducts", "sections", "lastWriter", "revision", "createdAt", "updatedAt"
      )
      VALUES (
        ${randomUUID()}, ${project.id}, ${project.title}, ${project.candidateIndex},
        ${project.candidateLabel}, CAST(${JSON.stringify(project.ownerProducts)} AS jsonb),
        CAST(${JSON.stringify(project.sections)} AS jsonb),
        CAST(${JSON.stringify(project.lastWriter ?? null)} AS jsonb),
        ${project.revision}, ${new Date(project.createdAt)}, ${new Date(project.updatedAt)}
      )
      ON CONFLICT ("projectId") DO UPDATE SET
        "title" = EXCLUDED."title",
        "candidateIndex" = EXCLUDED."candidateIndex",
        "candidateLabel" = EXCLUDED."candidateLabel",
        "ownerProducts" = EXCLUDED."ownerProducts",
        "sections" = EXCLUDED."sections",
        "lastWriter" = EXCLUDED."lastWriter",
        "revision" = EXCLUDED."revision",
        "updatedAt" = EXCLUDED."updatedAt"
    `;
    return true;
  } catch (error) {
    console.warn("[video-workbench] Could not write database project store", error);
    return false;
  }
}

export function createDefaultVideoWorkbenchProject(projectId: string): VideoWorkbenchProject {
  const now = nowIso();
  return {
    schemaVersion: "video_project_v1",
    id: safeProjectId(projectId),
    title: "Kandidat 10 - gemeinsames Video-Projekt",
    candidateIndex: 10,
    candidateLabel: "Stadtfassade mit Strasse",
    ownerProducts: ["piximmo", "pixcapture"],
    createdAt: now,
    updatedAt: now,
    revision: 0,
    sections: {},
  };
}

export async function readVideoWorkbenchProject(projectId: string): Promise<VideoWorkbenchProject> {
  const databaseProject = await readProjectFromDatabase(projectId);
  if (databaseProject) return databaseProject;

  try {
    const raw = await fs.readFile(projectPath(projectId), "utf8");
    const parsed = JSON.parse(raw) as VideoWorkbenchProject;
    return {
      ...createDefaultVideoWorkbenchProject(projectId),
      ...parsed,
      id: safeProjectId(parsed.id || projectId),
      sections: parsed.sections && typeof parsed.sections === "object" ? parsed.sections : {},
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.warn("[video-workbench] Could not read project store", error);
    }
    return createDefaultVideoWorkbenchProject(projectId);
  }
}

export async function writeVideoWorkbenchProject(project: VideoWorkbenchProject) {
  if (await writeProjectToDatabase(project)) {
    return project;
  }

  await fs.mkdir(STORE_DIR, { recursive: true });
  await fs.writeFile(projectPath(project.id), `${JSON.stringify(project, null, 2)}\n`, "utf8");
  return project;
}

export async function updateVideoWorkbenchProjectSection(input: {
  projectId: string;
  section: VideoWorkbenchSection;
  data: unknown;
  page?: string | null;
  sourceProduct?: "piximmo" | "pixcapture" | "workbench" | null;
}) {
  const project = await readVideoWorkbenchProject(input.projectId);
  const savedAt = nowIso();
  const next: VideoWorkbenchProject = {
    ...project,
    updatedAt: savedAt,
    revision: Number(project.revision || 0) + 1,
    sections: {
      ...project.sections,
      [input.section]: {
        savedAt,
        data: input.data,
      },
    },
    lastWriter: {
      page: input.page ?? null,
      sourceProduct: input.sourceProduct ?? "workbench",
      savedAt,
    },
  };

  return writeVideoWorkbenchProject(next);
}

export async function writeVideoWorkbenchProjectSections(input: {
  projectId: string;
  title: string;
  candidateIndex?: number | null;
  candidateLabel?: string | null;
  sections: Partial<Record<VideoWorkbenchSection, unknown>>;
  page?: string | null;
  sourceProduct?: "piximmo" | "pixcapture" | "workbench" | null;
}) {
  const current = await readVideoWorkbenchProject(input.projectId);
  const savedAt = nowIso();
  const sectionEntries = Object.entries(input.sections).map(([section, data]) => [
    section,
    { savedAt, data },
  ]);
  const next: VideoWorkbenchProject = {
    ...current,
    id: safeProjectId(input.projectId),
    title: input.title,
    candidateIndex: input.candidateIndex ?? null,
    candidateLabel: input.candidateLabel ?? input.title,
    updatedAt: savedAt,
    revision: Number(current.revision || 0) + 1,
    sections: {
      ...current.sections,
      ...Object.fromEntries(sectionEntries),
    },
    lastWriter: {
      page: input.page ?? null,
      sourceProduct: input.sourceProduct ?? "workbench",
      savedAt,
    },
  };
  return writeVideoWorkbenchProject(next);
}
