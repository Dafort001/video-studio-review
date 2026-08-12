import { readFile } from "node:fs/promises";
import path from "node:path";
import { auth } from "@/auth";
import { getVideoStudioSetupJob, type VideoStudioSetupJob } from "@/lib/video-studio-server";
import { readVideoWorkbenchProject } from "@/lib/video-workbench-projects";
import {
  videoCandidateIndexForJob,
  videoProjectIdForJob,
  type VideoTimelinePlan,
} from "@/lib/video-project-briefing";

const WORKBENCH_FILES = {
  timeline: "timeline/index.html",
  motion: "motion/index.html",
  maklerin: "maklerin/index.html",
} as const;

type WorkbenchPage = keyof typeof WORKBENCH_FILES;

function inlineJson(value: unknown) {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

function candidateIndexFromRequest(request: Request) {
  const url = new URL(request.url);
  const candidate = Number(url.searchParams.get("candidate"));
  if (Number.isInteger(candidate) && candidate > 0) return candidate;
  return 7;
}

function jobReferenceFromRequest(request: Request) {
  return new URL(request.url).searchParams.get("jobId")?.trim() || null;
}

function projectIdForCandidate(candidateIndex: number) {
  return `candidate-${candidateIndex}-shared-video-project-v1`;
}

function withWorkbenchRuntimeConfig(
  html: string,
  sourceProduct: "piximmo" | "pixcapture",
  projectId: string,
  bootstrap?: Record<string, unknown> | null,
) {
  const bootstrapScript = bootstrap
    ? `<script>window.__PIX_VIDEO_BOOTSTRAP__=${inlineJson(bootstrap)};</script>\n  `
    : "";
  return html.replace(
    '<script src="/video-workbench/shared/project-store.js"></script>',
    `${bootstrapScript}<script src="/video-workbench/shared/project-store.js" data-source-product="${sourceProduct}" data-project-id="${projectId}"></script>`,
  );
}

type TimelineManifestFile = {
  filename: string;
  image_src: string;
  working_file?: string;
  source_file?: string;
  width?: number;
  height?: number;
  qwen_alt_text_de?: string;
  room_label_de?: string;
  scene_type?: string;
  qwen_item_id?: string;
};

type TimelineManifestCandidate = {
  index: number;
  label: string;
  files: TimelineManifestFile[];
};

function embeddedJson<T>(html: string, variableName: string): T | null {
  const match = html.match(new RegExp(`\\bconst ${variableName} = ([^\\n]+);`));
  if (!match?.[1]) return null;
  try {
    return JSON.parse(match[1]) as T;
  } catch {
    return null;
  }
}

export function withCandidateMotionData(html: string, timelineHtml: string, candidateIndex: number) {
  const manifest = embeddedJson<{ items?: TimelineManifestCandidate[] }>(timelineHtml, "manifest");
  const selections = embeddedJson<Record<string, string[]>>(timelineHtml, "initialTimelineByCandidate");
  const slotLayouts = embeddedJson<Record<string, Array<{ duration?: number; role?: string }>>>(
    timelineHtml,
    "initialSlotLayoutByCandidate",
  );
  const candidate = manifest?.items?.find((item) => item.index === candidateIndex);
  const selectedFilenames = selections?.[String(candidateIndex)];
  if (!candidate || !selectedFilenames?.length) return html;

  const filesByName = new Map(candidate.files.map((file) => [file.filename, file]));
  const slots = slotLayouts?.[String(candidateIndex)] ?? [];
  const items = selectedFilenames.flatMap((filename, index) => {
    const file = filesByName.get(filename);
    if (!file) return [];
    const slot = slots[index];
    const role = slot?.role || (index === 0 ? "Startbild" : index === selectedFilenames.length - 1 ? "Schlussbild" : "Take");
    const duration = Number(slot?.duration || (index === 0 ? 3 : index === selectedFilenames.length - 1 ? 2.5 : 1.5));
    const stem = filename.match(/DSF\d+/i)?.[0]?.toUpperCase() || String(index + 1).padStart(2, "0");
    const assetPath = file.image_src.replace(/^\.\.\//, "");
    return [{
      id: `candidate_${candidateIndex}_take_${String(index + 1).padStart(2, "0")}_${stem}`,
      index: index + 1,
      filename: `${String(index + 1).padStart(2, "0")} · ${role} · ${filename}`,
      copied_filename: filename,
      thumb: file.image_src,
      large: file.image_src,
      original_path: file.source_file || "",
      copied_path: file.working_file || file.image_src,
      render_source_r2_key: `video-workbench/source-assets/${assetPath}`,
      qwen_item_id: file.qwen_item_id || `candidate${candidateIndex}_${stem}`,
      quality_flags: `Kandidat ${candidateIndex}; ${role}; ${file.room_label_de || "-"}; ${duration}s`,
      alt_text_de: file.qwen_alt_text_de || "",
      width: Number(file.width || 6000),
      height: Number(file.height || 4000),
      duration_seconds: duration,
      cutplan: {
        candidate_index: candidateIndex,
        candidate_label: candidate.label,
        order: index + 1,
        slot_role: role,
        duration_seconds: duration,
        room_label_de: file.room_label_de || "",
        scene_type: file.scene_type || "",
      },
      avatar_demo: {
        selected: false,
        suggested: false,
        suitability: "nicht geprueft",
        note: "",
        footpoint: { x: 0.5, y: 0.78 },
      },
    }];
  });

  if (!items.length) return html;
  return html
    .replace(/\bconst items = \[[^\n]+\];/, `const items = ${inlineJson(items)};`)
    .replace(/let activeCandidateLabel = "[^"]*";/, `let activeCandidateLabel = ${inlineJson(candidate.label)};`);
}

function sectionData<T>(section: unknown): T | null {
  if (!section || typeof section !== "object" || Array.isArray(section)) return null;
  return ((section as { data?: unknown }).data ?? null) as T | null;
}

export function withJobTimelineData(
  html: string,
  job: VideoStudioSetupJob,
  plan: VideoTimelinePlan,
  candidateIndex: number,
) {
  const takeByImageId = new Map(plan.timeline.map((take) => [take.imageId, take]));
  const files = job.images.map((image) => {
    const take = takeByImageId.get(image.id);
    const role = take?.scene_type ?? image.inferredRole;
    return {
      filename: image.filename,
      working_file: image.imageUrl,
      image_src: image.imageUrl,
      source_file: "",
      width: image.width ?? 3000,
      height: image.height ?? 2000,
      bytes: 0,
      dsf_stem: image.id.slice(-8).toUpperCase(),
      room_label_de: image.roomLabel ?? role,
      room_key: role === "exterior" ? "aussenansicht" : role === "interior" ? "wohnzimmer" : "sonstiges_unklar",
      scene_type: role,
      qwen_alt_text_de: image.altText ?? "",
      qwen_reason_de: "",
      quality_flags: "",
      needs_review: "False",
      alt_source: image.altText ? "qwen" : "fallback",
      qwen_item_id: image.id,
      qwen_source_rel_path: "",
      user_text_override: "",
      title_line: plan.text_by_filename[image.filename]?.title ?? "",
      subtitle_line: plan.text_by_filename[image.filename]?.subtitle ?? "",
      font_notes: "",
      motion_notes: "",
      candidate_video_role: take?.slot_role ?? "Reserve",
    };
  });
  const manifest = {
    version: "piximmo_video_job_manifest_v1",
    created_from: job.reference,
    qwen_csvs: [],
    summary: {
      candidate_count: 1,
      image_count: files.length,
      qwen_alt_text_matches: files.filter((file) => file.alt_source === "qwen").length,
      filename_fallbacks: files.filter((file) => file.alt_source === "fallback").length,
    },
    items: [{
      index: candidateIndex,
      id: job.id,
      label: job.projectName,
      source_dir: job.reference,
      working_dir: "piximmo-delivery",
      jpg_count: files.length,
      min_width: Math.min(...files.map((file) => file.width)),
      max_width: Math.max(...files.map((file) => file.width)),
      min_height: Math.min(...files.map((file) => file.height)),
      max_height: Math.max(...files.map((file) => file.height)),
      files,
    }],
  };
  const selected = { [String(candidateIndex)]: plan.timeline.map((take) => take.filename) };
  const slots = {
    [String(candidateIndex)]: plan.timeline.map((take) => ({
      duration: take.duration_seconds,
      role: take.slot_role,
      hint: take.slot_role === "Startbild" ? "Startbild / Opening" : take.slot_role === "Schlussbild" ? "Schlussbild / Ending" : "Take",
      preferredRooms: [],
    })),
  };
  return html
    .replace(/\bconst manifest = [^\n]+;/, `const manifest = ${inlineJson(manifest)};`)
    .replace(/\bconst initialTimelineByCandidate = [^\n]+;/, `const initialTimelineByCandidate = ${inlineJson(selected)};`)
    .replace(/\bconst initialSlotLayoutByCandidate = [^\n]+;/, `const initialSlotLayoutByCandidate = ${inlineJson(slots)};`);
}

export async function serveVideoWorkbenchPage(request: Request, page: WorkbenchPage) {
  const session = await auth();
  if (!session?.user) {
    return Response.redirect(new URL("/auth/signin", request.url));
  }

  const workbenchRoot = path.join(process.cwd(), "public", "video-workbench");
  const filePath = path.join(workbenchRoot, WORKBENCH_FILES[page]);
  const jobReference = jobReferenceFromRequest(request);
  if (!jobReference && !new URL(request.url).searchParams.has("candidate")) {
    return Response.redirect(new URL("/dashboard/video-studio/setup", request.url));
  }
  const job = jobReference
    ? await getVideoStudioSetupJob({
        userId: session.user.id,
        email: session.user.email,
        isAdmin: session.user.role === "admin",
      }, jobReference)
    : null;
  if (jobReference && !job) {
    return Response.redirect(new URL(`/dashboard/video-studio/setup?jobId=${encodeURIComponent(jobReference)}`, request.url));
  }
  const candidateIndex = job ? videoCandidateIndexForJob(job.reference) : candidateIndexFromRequest(request);
  const projectId = job ? videoProjectIdForJob(job.reference) : projectIdForCandidate(candidateIndex);
  const project = job ? await readVideoWorkbenchProject(projectId) : null;
  const timelinePlan = project ? sectionData<VideoTimelinePlan>(project.sections.timeline) : null;
  if (job && !timelinePlan) {
    return Response.redirect(new URL(`/dashboard/video-studio/setup?jobId=${encodeURIComponent(job.reference)}`, request.url));
  }
  const [pageHtml, timelineHtml] = await Promise.all([
    readFile(filePath, "utf8"),
    page === "motion" ? readFile(path.join(workbenchRoot, WORKBENCH_FILES.timeline), "utf8") : Promise.resolve(""),
  ]);
  const hydratedTimelineHtml = job && timelinePlan
    ? withJobTimelineData(page === "timeline" ? pageHtml : timelineHtml, job, timelinePlan, candidateIndex)
    : timelineHtml;
  const candidateHtml = page === "motion"
    ? withCandidateMotionData(pageHtml, hydratedTimelineHtml, candidateIndex)
    : job && timelinePlan
      ? hydratedTimelineHtml
      : pageHtml;
  const motionSection = project ? sectionData<{ editor_state?: unknown }>(project.sections.motion) : null;
  const bootstrap = job && timelinePlan ? {
    jobMode: true,
    jobReference: job.reference,
    projectTitle: job.projectName,
    candidateIndex,
    textByFilename: timelinePlan.text_by_filename,
    motionEditorState: motionSection?.editor_state ?? null,
  } : null;
  const html = withWorkbenchRuntimeConfig(
    candidateHtml,
    "piximmo",
    projectId,
    bootstrap,
  );

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
