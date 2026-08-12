"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Flag,
  GripVertical,
  Images,
  Loader2,
  Play,
  Redo2,
  Save,
  Sparkles,
  Trash2,
  Type,
  Undo2,
  WandSparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import type {
  SharedAssetAnalysis,
  SharedSceneSpec,
  SharedStudioProject,
  SharedStudioTake,
} from "@/lib/shared-video-studio";
import type { VideoStudioFont } from "@/lib/video-studio-font-catalog";
import {
  videoStudioProductLabel,
  type StudioSourceImage,
} from "@/lib/central-video-studio";
import fontStyles from "./videoStudioFonts.module.css";
import {
  AiStudioPanel,
  GalleryStage,
  MotionCatalogPanel,
  SceneCreativePanels,
  SceneNeighbor,
  SortingTimelineStage,
} from "./GuidedStudioStages";
import {
  VIDEO_STUDIO_WORKFLOW_STEPS,
  clampStillDuration,
  clampInteractiveFrame,
  logoSafeZone,
  normalizeInteractiveFrame,
  portraitScaleBudget,
  removeTimelineAsset,
  sourceFrameQuality,
  sourceMotionPatch,
  type VideoStudioWorkflowStep,
} from "@/lib/video-studio-workflow";

type ImageRole = StudioSourceImage["role"];
type ImageItem = StudioSourceImage;
type Notice = { kind: "success" | "error"; text: string } | null;
type Stage = VideoStudioWorkflowStep;
type Filter = "all" | ImageRole;
type SaveStatus = "saved" | "pending" | "saving" | "error";
type RhythmPatternId = SharedStudioProject["rhythmPatternId"];

const rhythmPatterns: Record<
  RhythmPatternId,
  { label: string; durations: number[]; cycleSeconds: number }
> = {
  puls: { label: "Puls", durations: [3, 0.8, 0.8, 0.8, 2], cycleSeconds: 7.4 },
  ruhig: { label: "Ruhig", durations: [3, 2, 2.5, 2], cycleSeconds: 9.5 },
  zweier: { label: "Zweier", durations: [2.4, 0.8], cycleSeconds: 3.2 },
  auftakt: {
    label: "Auftakt",
    durations: [3.5, 1.6, 1, 0.8, 0.8],
    cycleSeconds: 7.7,
  },
  ausklang: {
    label: "Ausklang",
    durations: [0.8, 0.8, 1.6, 3.5],
    cycleSeconds: 6.7,
  },
};

const motionOptions: Array<[SharedStudioTake["motion"], string]> = [
  ["still", "Ruhig stehen"],
  ["move_closer", "Sanft näher kommen"],
  ["move_away", "Sanft öffnen"],
  ["glide_left", "Nach links gleiten"],
  ["glide_right", "Nach rechts gleiten"],
  ["look_up", "Blick anheben"],
  ["look_down", "Blick senken"],
  ["detail_drift", "Detailbewegung"],
];

type TextStyleId = NonNullable<SharedStudioTake["text"]["styleId"]>;
const textStyleOptions: Array<{
  id: TextStyleId;
  label: string;
  description: string;
  fontFamily: string;
  subtitleFontFamily?: string;
  titleWeight: number;
  titleLimit: number;
  subtitleLimit: number;
  maxWidthRel: number;
  titleSizeRel: number;
  subtitleSizeRel?: number;
  color: string;
  titleUppercase?: boolean;
  subtitleUppercase?: boolean;
}> = [
  {
    id: 1,
    label: "Klar",
    description: "Neutraler Standard",
    fontFamily: "Inter, 'Noto Sans', sans-serif",
    titleWeight: 600,
    titleLimit: 28,
    subtitleLimit: 40,
    maxWidthRel: 0.78,
    titleSizeRel: 0.072,
    subtitleSizeRel: 0.03,
    color: "#FFFFFF",
  },
  {
    id: 2,
    label: "Redaktion",
    description: "Warm und gehoben",
    fontFamily: "Fraunces, Georgia, serif",
    subtitleFontFamily: "Inter, 'Noto Sans', sans-serif",
    titleWeight: 500,
    titleLimit: 24,
    subtitleLimit: 36,
    maxWidthRel: 0.76,
    titleSizeRel: 0.068,
    subtitleSizeRel: 0.028,
    color: "#F5F1E8",
  },
  {
    id: 3,
    label: "Bogen",
    description: "Architektonisch und kühl",
    fontFamily: "Outfit, 'Noto Sans', sans-serif",
    titleWeight: 300,
    titleLimit: 20,
    subtitleLimit: 16,
    maxWidthRel: 0.76,
    titleSizeRel: 0.06,
    subtitleSizeRel: 0.024,
    color: "#FFFFFF",
    subtitleUppercase: true,
  },
  {
    id: 4,
    label: "Journal",
    description: "Plakativ für Fakten",
    fontFamily: "'Archivo Narrow', 'Noto Sans', sans-serif",
    subtitleFontFamily: "Inter, 'Noto Sans', sans-serif",
    titleWeight: 700,
    titleLimit: 18,
    subtitleLimit: 44,
    maxWidthRel: 0.82,
    titleSizeRel: 0.046,
    subtitleSizeRel: 0.03,
    color: "#FFFFFF",
    titleUppercase: true,
  },
  {
    id: 5,
    label: "Ruhe",
    description: "Leise und emotional",
    fontFamily: "Newsreader, Georgia, serif",
    titleWeight: 300,
    titleLimit: 32,
    subtitleLimit: 0,
    maxWidthRel: 0.62,
    titleSizeRel: 0.048,
    color: "#FFFFFF",
  },
  {
    id: 6,
    label: "Schlag",
    description: "Ein Wort im kurzen Takt",
    fontFamily: "Archivo, 'Noto Sans', sans-serif",
    titleWeight: 700,
    titleLimit: 12,
    subtitleLimit: 0,
    maxWidthRel: 0.72,
    titleSizeRel: 0.055,
    color: "#FFFFFF",
    titleUppercase: true,
  },
];

export function SharedVideoStudioWorkbench({
  initialProject,
  images,
  returnUrl,
  fontMenu,
  userLibrary,
  accountLibraryAvailable = true,
}: {
  initialProject: SharedStudioProject;
  images: ImageItem[];
  returnUrl: string;
  fontMenu: VideoStudioFont[];
  userLibrary: {
    brandAssets: Array<{
      id: string;
      filename: string;
      mimeType: string;
      width: number;
      height: number;
      sizeBytes: number;
      isActive: boolean;
      previewUrl: string;
    }>;
    presets: Array<{
      id: string;
      name: string;
      kind: "rhythm" | "cut_sequence";
      definition: unknown;
    }>;
    fontAssets: Array<{
      assetId: string;
      displayName: string;
      filename: string;
      mimeType: "font/ttf" | "font/otf" | "font/woff2";
      sizeBytes: number;
      rightsConfirmedAt: string;
      licenseReference?: string;
    }>;
  };
  accountLibraryAvailable?: boolean;
}) {
  const [project, setProject] = useState(initialProject);
  const [orderedAssetIds, setOrderedAssetIds] = useState(() =>
    initialSelection(initialProject),
  );
  const [stage, setStage] = useState<Stage>("brand");
  const [targetDuration] = useState(
    initialProject.desiredDurationSeconds || 30,
  );
  const [activeAssetId, setActiveAssetId] = useState(
    () => initialSelection(initialProject)[0] ?? "",
  );
  const [busy, setBusy] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [autosaveCycle, setAutosaveCycle] = useState(0);
  const [notice, setNotice] = useState<Notice>(null);
  const [shortClipConfirmed, setShortClipConfirmed] = useState(false);
  const [selectedCatalogMotionId, setSelectedCatalogMotionId] = useState<string>();
  const [selectionAvailability, setSelectionAvailability] = useState({
    canUndo: false,
    canRedo: false,
  });
  const [brandPreviewById, setBrandPreviewById] = useState<
    Record<string, string>
  >(() =>
    Object.fromEntries(
      userLibrary.brandAssets.map((asset) => [asset.id, asset.previewUrl]),
    ),
  );
  const [analysisByAssetId, setAnalysisByAssetId] = useState<
    Record<string, SharedAssetAnalysis>
  >({});
  const [sceneSpec, setSceneSpec] = useState<SharedSceneSpec | null>(null);
  const [previewVersionSceneSpec, setPreviewVersionSceneSpec] =
    useState<SharedSceneSpec | null>(null);
  const [previewCursorSeconds, setPreviewCursorSeconds] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [finalUrl, setFinalUrl] = useState<string | null>(null);
  const selectionRef = useRef(orderedAssetIds);
  const targetDurationRef = useRef(targetDuration);
  const autosaveInFlight = useRef(false);
  const projectRef = useRef(project);
  const takeSaveQueue = useRef<Promise<void>>(Promise.resolve());
  const sceneEditorRef = useRef<HTMLElement>(null);
  const selectionHistory = useRef<{ past: string[][]; future: string[][] }>({
    past: [],
    future: [],
  });
  const imageById = useMemo(
    () => new Map(images.map((image) => [image.id, image])),
    [images],
  );
  const takeByAssetId = useMemo(
    () => new Map(project.takes.map((take) => [take.sourceAssetId, take])),
    [project.takes],
  );
  const persistedIds = orderedTakes(project).map((take) => take.sourceAssetId);
  const selectionDirty =
    JSON.stringify(orderedAssetIds) !== JSON.stringify(persistedIds);
  const compositionDirty =
    selectionDirty || targetDuration !== project.desiredDurationSeconds;
  const activeIndex = Math.max(0, orderedAssetIds.indexOf(activeAssetId));
  const activeImage = imageById.get(orderedAssetIds[activeIndex] ?? "") ?? null;
  const activeTake =
    takeByAssetId.get(orderedAssetIds[activeIndex] ?? "") ?? null;
  const selectedTakes = orderedAssetIds.flatMap((assetId) => {
    const take = takeByAssetId.get(assetId);
    return take ? [take] : [];
  });
  const duration = timelineDuration(selectedTakes);
  const accidentalShortClip = selectedTakes.length >= 2 && duration < 5;

  useEffect(() => {
    if (!accidentalShortClip) setShortClipConfirmed(false);
  }, [accidentalShortClip]);

  useEffect(() => {
    selectionRef.current = orderedAssetIds;
    targetDurationRef.current = targetDuration;
  }, [orderedAssetIds, targetDuration]);

  useEffect(() => {
    projectRef.current = project;
  }, [project]);

  useEffect(() => {
    if (stage !== "scene" || !activeAssetId || analysisByAssetId[activeAssetId])
      return;
    let cancelled = false;
    studioFetch<{ analysis: SharedAssetAnalysis }>(
      project.id,
      `/assets/${encodeURIComponent(activeAssetId)}/analysis`,
      { method: "GET" },
    )
      .then((result) => {
        if (!cancelled)
          setAnalysisByAssetId((current) => ({
            ...current,
            [activeAssetId]: result.analysis,
          }));
      })
      .catch((error) => {
        if (
          !cancelled &&
          (!(error instanceof StudioClientError) || error.status !== 404)
        )
          setNotice({ kind: "error", text: message(error) });
      });
    return () => {
      cancelled = true;
    };
  }, [activeAssetId, analysisByAssetId, project.id, stage]);

  useEffect(() => {
    if (stage !== "scene" || saveStatus !== "saved") return;
    let cancelled = false;
    studioFetch<{ sceneSpec: SharedSceneSpec }>(
      project.id,
      "/scene-spec?purpose=preview",
      { method: "GET" },
    )
      .then((result) => {
        if (!cancelled) setSceneSpec(result.sceneSpec);
      })
      .catch((error) => {
        if (!cancelled) setNotice({ kind: "error", text: message(error) });
      });
    return () => {
      cancelled = true;
    };
  }, [project.id, project.revision, saveStatus, stage]);

  useEffect(() => {
    const versionId = finalUrl
      ? project.approvedVersionId
      : project.latestPreviewVersionId;
    if (!versionId) {
      setPreviewVersionSceneSpec(null);
      return;
    }
    let cancelled = false;
    studioFetch<{ sceneSpec: SharedSceneSpec }>(
      project.id,
      `/versions/${encodeURIComponent(versionId)}/scene-spec?purpose=${finalUrl ? "final" : "preview"}`,
      { method: "GET" },
    )
      .then(({ sceneSpec: frozenSpec }) => {
        if (!cancelled) setPreviewVersionSceneSpec(frozenSpec);
      })
      .catch((error) => {
        if (!cancelled) setNotice({ kind: "error", text: message(error) });
      });
    return () => {
      cancelled = true;
    };
  }, [
    finalUrl,
    project.approvedVersionId,
    project.id,
    project.latestPreviewVersionId,
  ]);

  useEffect(() => {
    const jobId =
      project.status === "preview_rendering"
        ? project.latestPreviewJobId
        : project.status === "final_rendering"
          ? project.finalJobId
          : undefined;
    if (!jobId) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const result = await studioFetch<{
          job: { status: string; purpose: string; resultUrl?: string };
        }>(project.id, `/jobs/${encodeURIComponent(jobId)}`, { method: "GET" });
        if (cancelled) return;
        if (
          result.job.status === "succeeded" ||
          result.job.status === "failed"
        ) {
          if (result.job.status === "succeeded" && result.job.resultUrl) {
            if (result.job.purpose === "preview")
              setPreviewUrl(result.job.resultUrl);
            if (result.job.purpose === "final")
              setFinalUrl(result.job.resultUrl);
          }
          const latest = await reloadLatestProject();
          setNotice({
            kind: result.job.status === "succeeded" ? "success" : "error",
            text:
              result.job.status === "succeeded"
                ? result.job.purpose === "preview"
                  ? "Die Preview ist fertig und kann nach bestätigten Szenen freigegeben werden."
                  : "Die Endfassung ist fertig."
                : "Die Videoausgabe ist fehlgeschlagen und kann erneut gestartet werden.",
          });
          setProject(latest);
        } else {
          setAutosaveCycle((current) => current + 1);
        }
      } catch (error) {
        if (!cancelled) setNotice({ kind: "error", text: message(error) });
      }
    }, 2000);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [
    autosaveCycle,
    project.finalJobId,
    project.id,
    project.latestPreviewJobId,
    project.status,
  ]);

  useEffect(() => {
    const jobId =
      project.status === "preview_ready"
        ? project.latestPreviewJobId
        : project.status === "final_ready"
          ? project.finalJobId
          : undefined;
    if (!jobId || (project.status === "preview_ready" ? previewUrl : finalUrl))
      return;
    let cancelled = false;
    studioFetch<{
      job: { status: string; purpose: string; resultUrl?: string };
    }>(project.id, `/jobs/${encodeURIComponent(jobId)}`, { method: "GET" })
      .then(({ job }) => {
        if (cancelled || job.status !== "succeeded" || !job.resultUrl) return;
        if (job.purpose === "preview") setPreviewUrl(job.resultUrl);
        if (job.purpose === "final") setFinalUrl(job.resultUrl);
      })
      .catch((error) => {
        if (!cancelled) setNotice({ kind: "error", text: message(error) });
      });
    return () => {
      cancelled = true;
    };
  }, [
    finalUrl,
    previewUrl,
    project.finalJobId,
    project.id,
    project.latestPreviewJobId,
    project.status,
  ]);

  useEffect(() => {
    if (!compositionDirty) {
      if (!autosaveInFlight.current) setSaveStatus("saved");
      return;
    }
    setSaveStatus("pending");
    if (autosaveInFlight.current) return;
    const pendingIds = [...orderedAssetIds];
    const pendingTargetDuration = targetDuration;
    const expectedRevision = project.revision;
    const timer = window.setTimeout(async () => {
      autosaveInFlight.current = true;
      setSaveStatus("saving");
      try {
        const result = await studioFetch<{ project: SharedStudioProject }>(
          project.id,
          "/selection",
          {
            method: "PUT",
            body: JSON.stringify({
              expectedRevision,
              orderedAssetIds: pendingIds,
              desiredDurationSeconds: pendingTargetDuration,
            }),
          },
        );
        projectRef.current = result.project;
        setProject(result.project);
        setSaveStatus(
          arraysEqual(selectionRef.current, pendingIds) &&
            targetDurationRef.current === pendingTargetDuration
            ? "saved"
            : "pending",
        );
      } catch (error) {
        setSaveStatus("error");
        if (isRevisionConflict(error)) {
          await reloadLatestProject();
          setNotice({
            kind: "error",
            text: "Der Entwurf wurde parallel geändert. Der aktuelle Serverstand wurde geladen; deine lokale Auswahl bleibt sichtbar und wird mit der neuen Revision erneut gespeichert.",
          });
        } else {
          setNotice({ kind: "error", text: message(error) });
        }
      } finally {
        autosaveInFlight.current = false;
        setAutosaveCycle((current) => current + 1);
      }
    }, 800);
    return () => window.clearTimeout(timer);
  }, [
    autosaveCycle,
    compositionDirty,
    orderedAssetIds,
    project.id,
    project.revision,
    targetDuration,
  ]);

  function updateSelection(change: (current: string[]) => string[]) {
    const next = change(orderedAssetIds);
    if (arraysEqual(orderedAssetIds, next)) return;
    selectionHistory.current.past = [
      ...selectionHistory.current.past.slice(-49),
      orderedAssetIds,
    ];
    selectionHistory.current.future = [];
    setSelectionAvailability({ canUndo: true, canRedo: false });
    setOrderedAssetIds(next);
  }

  function undoSelection() {
    const previous = selectionHistory.current.past.pop();
    if (!previous) return;
    selectionHistory.current.future.push(orderedAssetIds);
    setSelectionAvailability({
      canUndo: selectionHistory.current.past.length > 0,
      canRedo: true,
    });
    setOrderedAssetIds(previous);
  }

  function redoSelection() {
    const next = selectionHistory.current.future.pop();
    if (!next) return;
    selectionHistory.current.past.push(orderedAssetIds);
    setSelectionAvailability({
      canUndo: true,
      canRedo: selectionHistory.current.future.length > 0,
    });
    setOrderedAssetIds(next);
  }

  function toggleImage(imageId: string) {
    setNotice(null);
    updateSelection((current) =>
      current.includes(imageId)
        ? removeTimelineAsset(current, imageId)
        : [...current, imageId],
    );
  }

  function moveImageTo(imageId: string, targetIndex: number) {
    updateSelection((current) => {
      const sourceIndex = current.indexOf(imageId);
      if (sourceIndex < 0) return current;
      const next = [...current];
      next.splice(sourceIndex, 1);
      next.splice(Math.max(0, Math.min(targetIndex, next.length)), 0, imageId);
      return next;
    });
  }

  async function reloadLatestProject() {
    const current = await studioFetch<{ project: SharedStudioProject }>(
      projectRef.current.id,
      "",
      { method: "GET" },
    );
    projectRef.current = current.project;
    setProject(current.project);
    return current.project;
  }

  function saveTake(takeId: string, patch: Record<string, unknown>) {
    setSaveStatus("saving");
    const request = takeSaveQueue.current.then(async () => {
      try {
        const current = projectRef.current;
        const result = await studioFetch<{ project: SharedStudioProject }>(
          current.id,
          `/takes/${encodeURIComponent(takeId)}`,
          {
            method: "PATCH",
            body: JSON.stringify({ expectedRevision: current.revision, patch }),
          },
        );
        projectRef.current = result.project;
        setProject(result.project);
        setSaveStatus("saved");
      } catch (error) {
        setSaveStatus("error");
        if (isRevisionConflict(error)) {
          await reloadLatestProject();
          setNotice({
            kind: "error",
            text: "Diese Szene wurde parallel geändert. Der aktuelle Serverstand ist geladen; deine Eingaben bleiben im Editor und können nach Prüfung erneut gespeichert werden.",
          });
        } else {
          setNotice({ kind: "error", text: message(error) });
        }
        throw error;
      }
    });
    takeSaveQueue.current = request.catch(() => undefined);
    return request;
  }

  async function createSnapshot() {
    await act(async () => {
      const current = projectRef.current;
      const result = await studioFetch<{
        project: SharedStudioProject;
        version: { id: string };
      }>(current.id, "/versions", {
        method: "POST",
        body: JSON.stringify({ expectedRevision: current.revision }),
      });
      projectRef.current = result.project;
      setProject(result.project);
      setNotice({
        kind: "success",
        text: `Version ${result.project.versions.length} wurde unveränderlich festgehalten.`,
      });
    });
  }

  async function reviewTake(takeId: string) {
    await act(async () => {
      const current = projectRef.current;
      const result = await studioFetch<{ project: SharedStudioProject }>(
        current.id,
        `/takes/${encodeURIComponent(takeId)}/review`,
        {
          method: "POST",
          body: JSON.stringify({ expectedRevision: current.revision }),
        },
      );
      projectRef.current = result.project;
      setProject(result.project);
      setNotice({
        kind: "success",
        text: "Die Szene wurde in diesem Stand bestätigt.",
      });
    });
  }

  async function startPreview() {
    await act(async () => {
      const current = projectRef.current;
      const result = await studioFetch<{ job: { status: string } }>(
        current.id,
        "/renders",
        {
          method: "POST",
          body: JSON.stringify({
            expectedRevision: current.revision,
            purpose: "preview",
          }),
        },
      );
      await reloadLatestProject();
      setNotice({
        kind: "success",
        text: `Vorschau gestartet · ${result.job.status}`,
      });
    });
  }

  async function approvePreview() {
    if (!project.latestPreviewVersionId) return;
    await act(async () => {
      const current = projectRef.current;
      const result = await studioFetch<{ project: SharedStudioProject }>(
        current.id,
        "/approve",
        {
          method: "POST",
          body: JSON.stringify({
            expectedRevision: current.revision,
            versionId: current.latestPreviewVersionId,
          }),
        },
      );
      projectRef.current = result.project;
      setProject(result.project);
      setNotice({
        kind: "success",
        text: "Die geprüfte Preview ist für die Endfassung freigegeben.",
      });
    });
  }

  async function startFinal() {
    await act(async () => {
      const current = projectRef.current;
      await studioFetch<{ job: { status: string } }>(current.id, "/renders", {
        method: "POST",
        body: JSON.stringify({
          expectedRevision: current.revision,
          purpose: "final",
        }),
      });
      await reloadLatestProject();
      setNotice({
        kind: "success",
        text: "Die Endfassung wurde aus der freigegebenen Version gestartet.",
      });
    });
  }

  async function act(action: () => Promise<void>) {
    setBusy(true);
    setNotice(null);
    try {
      await action();
    } catch (error) {
      if (isRevisionConflict(error)) {
        try {
          await reloadLatestProject();
          setNotice({
            kind: "error",
            text: "Der Entwurf wurde parallel geändert. Der aktuelle Stand wurde neu geladen; bitte prüfe die Änderung und führe die Aktion erneut aus.",
          });
        } catch (reloadError) {
          setNotice({ kind: "error", text: message(reloadError) });
        }
      } else {
        setNotice({ kind: "error", text: message(error) });
      }
    } finally {
      setBusy(false);
    }
  }

  function selectNeighbor(direction: -1 | 1) {
    const next = activeIndex + direction;
    if (next >= 0 && next < orderedAssetIds.length)
      setActiveAssetId(orderedAssetIds[next]);
  }

  function openPreviewSceneAt(seconds: number) {
    if (!previewVersionSceneSpec) return;
    const scene = sceneAtSeconds(previewVersionSceneSpec.scenes, seconds);
    const take = scene
      ? project.takes.find((candidate) => candidate.id === scene.clientSceneId)
      : undefined;
    if (!take) {
      setNotice({
        kind: "error",
        text: "Diese eingefrorene Preview-Szene ist im aktuellen Entwurf nicht mehr enthalten.",
      });
      return;
    }
    setActiveAssetId(take.sourceAssetId);
    setStage("scene");
    window.setTimeout(
      () => sceneEditorRef.current?.scrollIntoView({ behavior: "smooth" }),
      0,
    );
  }

  return (
    <div
      className={`${fontStyles.scope} mx-auto max-w-[1480px] space-y-7 pb-24`}
    >
      <header className="flex flex-col gap-5 border-b border-border/70 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link
            href={returnUrl}
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Zurück zum Auftrag
          </Link>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {videoStudioProductLabel(project.product)} · Video-Werkstatt
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.025em] text-foreground md:text-4xl">
            {project.name}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {stage === "gallery"
              ? `${orderedAssetIds.length} von ${images.length} Bildern ausgewählt`
              : `${orderedAssetIds.length} Szenen · ${duration.toFixed(1)} Sekunden`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            disabled={busy || compositionDirty || saveStatus !== "saved"}
            onClick={createSnapshot}
          >
            <Save className="mr-2 h-4 w-4" /> Version festhalten
          </Button>
          <span className="inline-flex items-center border border-border bg-muted/40 px-3 py-2 text-xs font-semibold text-muted-foreground">
            KI-Generierung bis zur Abnahme gesperrt
          </span>
        </div>
      </header>

      <nav aria-label="Bereiche der Video-Werkstatt" className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-5">
        {VIDEO_STUDIO_WORKFLOW_STEPS.map((step, index) => {
          const labels: Record<Stage, string> = {
            brand: "Logo",
            gallery: "Galerie",
            timeline: "Timeline",
            scene: "Szenenbearbeitung",
            preview_ai: "Vorschau & KI",
          };
          return (
            <button
              key={step}
              type="button"
              onClick={() => setStage(step)}
              disabled={step !== "brand" && !orderedAssetIds.length}
              className={`bg-card px-3 py-3 text-left text-xs font-semibold ${stage === step ? "text-primary ring-2 ring-inset ring-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              <span className="mr-2 text-[10px] opacity-70">{index + 1}</span>{labels[step]}
            </button>
          );
        })}
      </nav>

      <section className="grid gap-px overflow-hidden border border-border/70 bg-border sm:grid-cols-4">
        {[
          ["Szenen", String(orderedAssetIds.length)],
          ["Aktuell", `${duration.toFixed(1)} s`],
          ["Ziel", `${targetDuration.toFixed(0)} s`],
          [
            "Abweichung",
            `${duration - targetDuration >= 0 ? "+" : ""}${(duration - targetDuration).toFixed(1)} s`,
          ],
        ].map(([label, value]) => (
          <div key={label} className="bg-card px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {label}
            </p>
            <p className="mt-1 text-lg font-semibold">{value}</p>
          </div>
        ))}
      </section>
      {accidentalShortClip && (
        <label className="flex items-start gap-3 border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4"
            checked={shortClipConfirmed}
            onChange={(event) => setShortClipConfirmed(event.target.checked)}
          />
          <span>
            <strong>Sehr kurzer Clip: {duration.toFixed(1)} Sekunden.</strong>{" "}
            Eine Vorschau kann erst nach bewusster Bestätigung gestartet werden.
          </span>
        </label>
      )}

      {(previewUrl || finalUrl) && (
        <section className="grid gap-5 border border-border/70 bg-card p-5 shadow-sm lg:grid-cols-[minmax(260px,420px)_1fr] lg:items-center">
          <div>
            <video
              key={finalUrl ?? previewUrl ?? undefined}
              controls
              playsInline
              className="aspect-[9/16] max-h-[70vh] w-full bg-black"
              src={finalUrl ?? previewUrl ?? undefined}
              onTimeUpdate={(event) =>
                setPreviewCursorSeconds(event.currentTarget.currentTime)
              }
              onSeeked={(event) =>
                openPreviewSceneAt(event.currentTarget.currentTime)
              }
              onClick={(event) =>
                openPreviewSceneAt(event.currentTarget.currentTime)
              }
            />
            {previewVersionSceneSpec && (
              <p className="mt-2 text-xs text-muted-foreground">
                {formatSeconds(previewCursorSeconds)} · Szene{" "}
                {previewSceneNumber(
                  previewVersionSceneSpec.scenes,
                  previewCursorSeconds,
                )}
                . Klicken oder scrubben öffnet sie im Editor.
              </p>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              {finalUrl ? "Endfassung" : "Gesamtpreview"}
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              {finalUrl
                ? "Die Endfassung ist fertig"
                : "Die gerenderte Preview ist bereit"}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Diese Datei stammt aus der eingefrorenen Version und verwendet
              dieselbe Scene-Spec wie der Renderer. Änderungen am aktuellen
              Entwurf verändern sie nicht.
            </p>
          </div>
        </section>
      )}

      {notice && (
        <p
          className={`border px-4 py-3 text-sm ${
            notice.kind === "success"
              ? "border-emerald-300 bg-emerald-50 text-emerald-900"
              : "border-destructive/40 bg-destructive/5 text-destructive"
          }`}
        >
          {notice.text}
        </p>
      )}
      {!notice && project.status === "failed" && (
        <p
          data-video-render-failure
          className="border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          Die letzte Videoausgabe ist fehlgeschlagen. Dein vollständiger
          Entwurf und die eingefrorene Version bleiben erhalten; du kannst die
          Vorschau nach Prüfung erneut starten.
        </p>
      )}

      {stage === "brand" ? (
        <BrandAndPresetPanel
          project={project}
          initialLibrary={userLibrary}
          accountLibraryAvailable={accountLibraryAvailable}
          previewImageUrl={activeImage?.previewUrl ?? images[0]?.previewUrl}
          startMode
          onContinue={() => setStage("gallery")}
          onBrandPreview={(assetId, previewUrl) =>
            setBrandPreviewById((current) => ({ ...current, [assetId]: previewUrl }))
          }
          onProject={(nextProject) => {
            projectRef.current = nextProject;
            setProject(nextProject);
          }}
          onNotice={setNotice}
        />
      ) : stage === "gallery" ? (
        <GalleryStage
          images={images}
          orderedAssetIds={orderedAssetIds}
          onToggle={toggleImage}
          onContinue={() => setStage("timeline")}
        />
      ) : stage === "timeline" ? (
        <SortingTimelineStage
          imagesById={imageById}
          orderedAssetIds={orderedAssetIds}
          actualSeconds={duration}
          targetSeconds={targetDuration}
          canUndo={selectionAvailability.canUndo}
          canRedo={selectionAvailability.canRedo}
          onMoveTo={moveImageTo}
          onRemove={(assetId) => {
            updateSelection((current) => removeTimelineAsset(current, assetId));
          }}
          onUndo={undoSelection}
          onRedo={redoSelection}
          onBack={() => setStage("gallery")}
          onContinue={() => {
            setActiveAssetId(orderedAssetIds[0] ?? "");
            setStage("scene");
          }}
        />
      ) : stage === "scene" && activeTake && activeImage ? (
        <section ref={sceneEditorRef} className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                4 · Szenenbearbeitung
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em]">
                Eine Szene im Fokus
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Den Vorschlag am echten 9:16-Ausschnitt prüfen und nur bei
                Bedarf verändern.
              </p>
            </div>
            <p className="hidden text-sm font-medium text-muted-foreground sm:block">
              {activeIndex + 1} / {orderedAssetIds.length}
            </p>
          </div>

          <div className="flex gap-3 overflow-x-auto border-y border-border/70 py-4">
            {orderedAssetIds.map((assetId, index) => {
              const image = imageById.get(assetId);
              if (!image) return null;
              const active = assetId === activeImage.id;
              return (
                <button
                  key={assetId}
                  type="button"
                  onClick={() => setActiveAssetId(assetId)}
                  className={`w-36 shrink-0 overflow-hidden border bg-background text-left transition ${active ? "border-primary ring-2 ring-primary/15" : "border-border hover:border-primary/50"}`}
                >
                  <div className="relative">
                    <img
                      src={image.previewUrl}
                      alt={image.roomLabel ?? image.filename}
                      className="aspect-[4/3] w-full object-cover"
                    />
                    <span
                      className={`absolute left-2 top-2 px-2 py-1 text-[11px] font-bold ${active ? "bg-primary text-primary-foreground" : "bg-black/70 text-white"}`}
                    >
                      {index === 0
                        ? "Start"
                        : index === orderedAssetIds.length - 1
                          ? "Ende"
                          : index + 1}
                    </span>
                  </div>
                  <p className="truncate px-2 py-2 text-xs font-medium">
                    {image.roomLabel ?? image.filename}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="grid items-center gap-3 xl:grid-cols-[110px_minmax(0,1fr)_110px]">
            <SceneNeighbor image={imageById.get(orderedAssetIds[activeIndex - 1] ?? "")} label="Vorher" onClick={() => selectNeighbor(-1)} />
            <TakeEditor
            key={`${activeTake.id}:${selectedCatalogMotionId ?? ""}`}
            take={activeTake}
            image={activeImage}
            analysis={analysisByAssetId[activeImage.id]}
            sceneSpecScene={
              sceneSpec?.projectRevision === project.revision
                ? sceneSpec.scenes.find(
                    (scene) => scene.clientSceneId === activeTake.id,
                  )
                : undefined
            }
            index={activeIndex}
            total={orderedAssetIds.length}
            saveStatus={saveStatus}
            onPrevious={() => selectNeighbor(-1)}
            onNext={() => selectNeighbor(1)}
            onSave={saveTake}
            onReview={reviewTake}
            onPending={() => setSaveStatus("pending")}
            fontMenu={fontMenu}
            brandOverlay={project.brandOverlay}
            brandPreviewUrl={
              project.brandOverlay?.asset?.id
                ? brandPreviewById[project.brandOverlay.asset.id]
                : undefined
            }
            motionPanel={
              <MotionCatalogPanel
                selectedMotionId={selectedCatalogMotionId}
                isSelectable={(motion) => motion.sourceGroup === "generative_ai" || (portraitScaleBudget(activeImage.width, activeImage.height).motionAllowed && Boolean(sourceMotionPatch(motion, activeTake, portraitScaleBudget(activeImage.width, activeImage.height).maximumScale)))}
                onSelect={async (motion) => {
                  const budget = portraitScaleBudget(activeImage.width, activeImage.height);
                  const patch = budget.motionAllowed ? sourceMotionPatch(motion, activeTake, budget.maximumScale) : null;
                  if (patch) {
                    try {
                      await saveTake(activeTake.id, patch);
                    } catch {
                      return;
                    }
                    setSelectedCatalogMotionId(motion.id);
                    setNotice({ kind: "success", text: `„${motion.label}“ wird quellenbasiert auf dem festen Original angewendet.` });
                  } else if (motion.sourceGroup === "generative_ai") {
                    setSelectedCatalogMotionId(motion.id);
                    setNotice({ kind: "success", text: `„${motion.label}“ ist für einen KI-Storyboard-Entwurf ausgewählt. Es wurde kein Providerjob gestartet.` });
                    setStage("preview_ai");
                  } else {
                    setNotice({ kind: "error", text: `„${motion.label}“ benötigt zuerst eine Tiefenanalyse. Das Original wird bis dahin unverändert gelassen.` });
                  }
                }}
              />
            }
            />
            <SceneNeighbor image={imageById.get(orderedAssetIds[activeIndex + 1] ?? "")} label="Danach" onClick={() => selectNeighbor(1)} />
          </div>
          <div className="space-y-5">
            <SceneCreativePanels
              key={activeTake.id}
              durationSeconds={clampStillDuration(activeTake.durationSeconds)}
              fontFamilies={fontMenu.map((font) => font.family)}
              accountFonts={userLibrary.fontAssets}
              selectedFontAssetIds={(project.fontAssets ?? []).map((font) => font.assetId)}
              projectId={project.id}
              image={activeImage}
              take={activeTake}
              brandOverlay={project.brandOverlay}
              brandPreviewUrl={project.brandOverlay?.asset?.id ? brandPreviewById[project.brandOverlay.asset.id] : undefined}
              initialElements={activeTake.typographyElements}
              maskAssets={(project.creativeAssets ?? []).filter((asset) => asset.kind === "occlusion_mask" && asset.sourceAssetId === activeImage.id)}
              initialLayers={activeTake.sceneLayers?.length ? activeTake.sceneLayers : [
                ...(project.creativeAssets ?? []).filter((asset) => asset.kind === "occlusion_mask" && asset.sourceAssetId === activeImage.id).slice(0, 16).map((asset, index) => ({
                  id: `layer-${asset.assetId}`,
                  type: "object" as const,
                  source: "analysis" as const,
                  status: "ready" as const,
                  order: index + 1,
                  visible: true,
                  maskAssetId: asset.assetId,
                })),
                { id: "avatar-reserve", type: "avatar_reserved" as const, source: "reserved" as const, status: "reserved" as const, order: 99, visible: false },
              ]}
              onSave={(patch) => saveTake(activeTake.id, patch)}
              onProject={(nextProject) => {
                projectRef.current = nextProject;
                setProject(nextProject);
              }}
              onNotice={setNotice}
              onDirty={() => setSaveStatus("pending")}
            />
          </div>
        </section>
      ) : stage === "preview_ai" ? (
        <div className="space-y-6">
          <section className="flex flex-col gap-4 border border-border/70 bg-card p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Normale Werkstatt-Vorschau</p>
              <h2 className="mt-1 text-xl font-semibold">Film prüfen und freigeben</h2>
              <p className="mt-1 text-sm text-muted-foreground">Diese bestehende Vorschau bleibt unabhängig vom optionalen KI-Studio vollständig verfügbar.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled={busy || compositionDirty || saveStatus !== "saved" || orderedAssetIds.length < 2 || (accidentalShortClip && !shortClipConfirmed)} onClick={startPreview}><Play className="mr-2 h-4 w-4" />Vorschau erstellen</Button>
              {project.status === "preview_ready" && <Button disabled={busy || saveStatus !== "saved" || !project.takes.length || project.takes.some((take) => !take.reviewedAt)} onClick={approvePreview}><Check className="mr-2 h-4 w-4" />Preview freigeben</Button>}
              {project.status === "approved" && <Button disabled={busy || saveStatus !== "saved"} onClick={startFinal}><Play className="mr-2 h-4 w-4" />Endfassung erstellen</Button>}
            </div>
          </section>
          <AiStudioPanel
            projectId={project.id}
            images={orderedAssetIds.flatMap((assetId) => imageById.get(assetId) ? [imageById.get(assetId)!] : [])}
            takeIdByAssetId={new Map(project.takes.map((take) => [take.sourceAssetId, take.id]))}
            selectedMotionId={selectedCatalogMotionId}
            onBack={() => setStage("scene")}
            onNotice={setNotice}
            onProject={(nextProject) => {
              projectRef.current = nextProject;
              setProject(nextProject);
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

function BrandAndPresetPanel({
  project,
  initialLibrary,
  accountLibraryAvailable,
  previewImageUrl,
  startMode = false,
  onContinue,
  onBrandPreview,
  onProject,
  onNotice,
}: {
  project: SharedStudioProject;
  initialLibrary: {
    brandAssets: Array<{
      id: string;
      filename: string;
      mimeType: string;
      width: number;
      height: number;
      sizeBytes: number;
      isActive: boolean;
      previewUrl: string;
    }>;
    presets: Array<{
      id: string;
      name: string;
      kind: "rhythm" | "cut_sequence";
      definition: unknown;
    }>;
  };
  accountLibraryAvailable: boolean;
  previewImageUrl?: string;
  startMode?: boolean;
  onContinue?: () => void;
  onBrandPreview: (assetId: string, previewUrl: string) => void;
  onProject: (project: SharedStudioProject) => void;
  onNotice: (notice: Notice) => void;
}) {
  const [assets, setAssets] = useState(initialLibrary.brandAssets);
  const [presets, setPresets] = useState(initialLibrary.presets);
  const [assetId, setAssetId] = useState(
    project.brandOverlay?.asset?.id ??
      initialLibrary.brandAssets.find((asset) => asset.isActive)?.id ??
      "",
  );
  const [logoEnabled, setLogoEnabled] = useState(
    project.brandOverlay?.enabled ?? false,
  );
  const [logoX, setLogoX] = useState(project.brandOverlay?.position.x ?? 0.08);
  const [logoY, setLogoY] = useState(project.brandOverlay?.position.y ?? 0.08);
  const [logoWidth, setLogoWidth] = useState(
    project.brandOverlay?.widthRel ?? 0.18,
  );
  const [logoOpacity, setLogoOpacity] = useState(
    project.brandOverlay?.opacity ?? 1,
  );
  const [logoRotation, setLogoRotation] = useState(
    project.brandOverlay?.rotationDeg ?? 0,
  );
  const [logoDragging, setLogoDragging] = useState(false);
  const logoCanvasRef = useRef<HTMLDivElement>(null);
  const [templateName, setTemplateName] = useState("");
  const [templateKind, setTemplateKind] = useState<"rhythm" | "cut_sequence">(
    "cut_sequence",
  );
  const [busy, setBusy] = useState(false);

  async function uploadLogo(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const form = new FormData();
      form.set("file", file);
      const response = await fetch(
        `/api/video-studio/shared/projects/${encodeURIComponent(project.id)}/account-library/brand-assets`,
        {
          method: "POST",
          body: form,
        },
      );
      const payload = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(payload.error ?? "Logo-Upload fehlgeschlagen.");
      const asset = {
        ...payload.asset,
        isActive: true,
        previewUrl: payload.asset.previewUrl,
      };
      setAssets((current) => [
        asset,
        ...current.map((item) => ({ ...item, isActive: false })),
      ]);
      setAssetId(asset.id);
      onBrandPreview(asset.id, asset.previewUrl);
      setLogoEnabled(true);
      onNotice({
        kind: "success",
        text: "Logo hochgeladen. Position und Größe können jetzt eingestellt werden.",
      });
    } catch (error) {
      onNotice({ kind: "error", text: message(error) });
    } finally {
      setBusy(false);
    }
  }

  async function saveBrand() {
    if (logoEnabled && !assetId) {
      onNotice({ kind: "error", text: "Bitte zuerst ein Logo hochladen." });
      return false;
    }
    setBusy(true);
    try {
      const result = await studioFetch<{ project: SharedStudioProject }>(
        project.id,
        "/brand-overlay",
        {
          method: "PUT",
          body: JSON.stringify({
            expectedRevision: project.revision,
            enabled: logoEnabled,
            assetId,
            position: { x: logoX, y: logoY },
            widthRel: logoWidth,
            opacity: logoOpacity,
            rotationDeg: logoRotation,
            scope: "global",
            safeZone: selectedAsset
              ? logoSafeZone({
                  x: logoX,
                  y: logoY,
                  widthRel: logoWidth,
                  assetWidth: selectedAsset.width,
                  assetHeight: selectedAsset.height,
                  rotationDeg: logoRotation,
                })
              : { x: 0, y: 0, w: 0, h: 0 },
          }),
        },
      );
      onProject(result.project);
      onNotice({ kind: "success", text: "Logo-Einblendung gespeichert." });
      return true;
    } catch (error) {
      onNotice({ kind: "error", text: message(error) });
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function saveTemplate() {
    const name = templateName.trim();
    if (!name) {
      onNotice({ kind: "error", text: "Bitte der Vorlage einen Namen geben." });
      return;
    }
    const definition =
      templateKind === "rhythm"
        ? {
            rhythmPatternId: project.rhythmPatternId,
            durations: orderedTakes(project).map(
              (take) => take.durationSeconds,
            ),
          }
        : {
            rhythmPatternId: project.rhythmPatternId,
            takes: orderedTakes(project).map(
              ({
                role,
                durationSeconds,
                motion,
                transitionIn,
                transitionInSeconds,
              }) => ({
                role,
                durationSeconds,
                motion,
                transitionIn,
                transitionInSeconds,
              }),
            ),
          };
    setBusy(true);
    try {
      const response = await fetch(
        `/api/video-studio/shared/projects/${encodeURIComponent(project.id)}/account-library/presets`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ name, kind: templateKind, definition }),
        },
      );
      const payload = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(
          payload.error ?? "Vorlage konnte nicht gespeichert werden.",
        );
      setPresets((current) => [
        payload.preset,
        ...current.filter((item) => item.id !== payload.preset.id),
      ]);
      setTemplateName("");
      onNotice({
        kind: "success",
        text: "Persönliche Videovorlage im Kundenkonto gespeichert.",
      });
    } catch (error) {
      onNotice({ kind: "error", text: message(error) });
    } finally {
      setBusy(false);
    }
  }

  async function applyTemplate(preset: (typeof presets)[number]) {
    setBusy(true);
    try {
      const result = await studioFetch<{ project: SharedStudioProject }>(
        project.id,
        "/apply-template",
        {
          method: "POST",
          body: JSON.stringify({
            expectedRevision: project.revision,
            kind: preset.kind,
            definition: preset.definition,
          }),
        },
      );
      onProject(result.project);
      onNotice({
        kind: "success",
        text: `Vorlage „${preset.name}“ auf die aktuelle Bildfolge angewendet.`,
      });
    } catch (error) {
      onNotice({ kind: "error", text: message(error) });
    } finally {
      setBusy(false);
    }
  }

  const selectedAsset = assets.find((asset) => asset.id === assetId);
  return (
    <details open={startMode} className="border border-border/70 bg-card p-5 shadow-sm">
      <summary className="cursor-pointer text-base font-semibold">
        {startMode ? "1 · Startentscheidung · Logo im gesamten Film" : "Marke & persönliche Schnittvorlagen"}
      </summary>
      {!accountLibraryAvailable && (
        <p className="mt-4 border border-amber-300 bg-amber-50 p-3 text-xs leading-relaxed text-amber-950">
          Persönliche Logos und Vorlagen sind vorübergehend nicht erreichbar.
          Bildgeschichte und Szenenbearbeitung funktionieren weiter; bestehende
          Kontoinhalte werden nicht verändert.
        </p>
      )}
      <div className="mt-5 grid gap-7 xl:grid-cols-2">
        <section className="space-y-4">
          <div>
            <h2 className="font-semibold">Eigenes Logo</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              PNG oder JPG, 64–4096 px, maximal 5 MB. Empfohlen: transparentes
              PNG mit mindestens 512 px Kantenlänge. Diese Grenze gilt nur für
              das Logo; die Objektbilder bleiben in ihrer gelieferten
              Originalauflösung erhalten.
            </p>
          </div>
          <input
            type="file"
            accept="image/png,image/jpeg,.png,.jpg,.jpeg"
            disabled={busy || !accountLibraryAvailable}
            onChange={(event) => uploadLogo(event.target.files?.[0])}
            className="block w-full text-sm"
          />
          {assets.length > 0 && (
            <label className="space-y-2 text-sm font-medium">
              Gespeichertes Logo
              <select
                value={assetId}
                onChange={(event) => setAssetId(event.target.value)}
                className="block w-full border border-border bg-background px-3 py-2"
              >
                {assets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.filename}
                  </option>
                ))}
              </select>
            </label>
          )}
          {selectedAsset && (
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Logo im Bild direkt positionieren
              </p>
              <div
                ref={logoCanvasRef}
                data-logo-canvas
                className="relative aspect-[9/16] w-full max-w-[260px] touch-none overflow-hidden bg-black shadow-inner"
                onPointerDown={(event) => {
                  setLogoDragging(true);
                  event.currentTarget.setPointerCapture(event.pointerId);
                  const rect = event.currentTarget.getBoundingClientRect();
                  setLogoX(
                    Math.max(
                      0,
                      Math.min(
                        1 - logoWidth,
                        (event.clientX - rect.left) / rect.width -
                          logoWidth / 2,
                      ),
                    ),
                  );
                  setLogoY(
                    Math.max(
                      0,
                      Math.min(
                        0.94,
                        (event.clientY - rect.top) / rect.height - 0.03,
                      ),
                    ),
                  );
                }}
                onPointerMove={(event) => {
                  if (!event.currentTarget.hasPointerCapture(event.pointerId))
                    return;
                  const rect = event.currentTarget.getBoundingClientRect();
                  setLogoX(
                    Math.max(
                      0,
                      Math.min(
                        1 - logoWidth,
                        (event.clientX - rect.left) / rect.width -
                          logoWidth / 2,
                      ),
                    ),
                  );
                  setLogoY(
                    Math.max(
                      0,
                      Math.min(
                        0.94,
                        (event.clientY - rect.top) / rect.height - 0.03,
                      ),
                    ),
                  );
                }}
                onPointerUp={() => setLogoDragging(false)}
                onPointerCancel={() => setLogoDragging(false)}
              >
                {previewImageUrl && (
                  <img
                    src={previewImageUrl}
                    alt="Aktuelle Szene als Logo-Vorschau"
                    className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                  />
                )}
                {logoDragging && (
                  <>
                    <span
                      className="pointer-events-none absolute inset-y-0 border-l border-dashed border-white/80"
                      style={{ left: `${(logoX + logoWidth / 2) * 100}%` }}
                    />
                    <span
                      className="pointer-events-none absolute inset-x-0 border-t border-dashed border-white/80"
                      style={{ top: `${(logoY + 0.03) * 100}%` }}
                    />
                  </>
                )}
                <div
                  className="pointer-events-none absolute border border-dashed border-white/90"
                  style={{
                    left: `${logoX * 100}%`,
                    top: `${logoY * 100}%`,
                    width: `${logoWidth * 100}%`,
                    transform: `rotate(${logoRotation}deg)`,
                    transformOrigin: "center",
                    opacity: logoOpacity,
                  }}
                >
                  <img
                    src={selectedAsset.previewUrl}
                    alt={selectedAsset.filename}
                    draggable={false}
                    className="h-auto w-full object-contain drop-shadow-md"
                  />
                  <button
                    type="button"
                    aria-label="Logo drehen"
                    className="pointer-events-auto absolute -top-7 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full border border-black bg-white shadow"
                    onPointerDown={(event) => {
                      event.stopPropagation();
                      event.currentTarget.setPointerCapture(event.pointerId);
                    }}
                    onPointerMove={(event) => {
                      if (
                        !event.currentTarget.hasPointerCapture(event.pointerId)
                      )
                        return;
                      const rect =
                        logoCanvasRef.current?.getBoundingClientRect();
                      if (!rect) return;
                      const centerX =
                        rect.left + (logoX + logoWidth / 2) * rect.width;
                      const centerY = rect.top + logoY * rect.height;
                      const angle =
                        (Math.atan2(
                          event.clientY - centerY,
                          event.clientX - centerX,
                        ) *
                          180) /
                          Math.PI +
                        90;
                      setLogoRotation(Math.max(-180, Math.min(180, angle)));
                    }}
                  />
                  <button
                    type="button"
                    aria-label="Logo vergrößern oder verkleinern"
                    className="pointer-events-auto absolute -bottom-2 -right-2 h-4 w-4 border border-black bg-white shadow"
                    onPointerDown={(event) => {
                      event.stopPropagation();
                      event.currentTarget.setPointerCapture(event.pointerId);
                    }}
                    onPointerMove={(event) => {
                      if (
                        !event.currentTarget.hasPointerCapture(event.pointerId)
                      )
                        return;
                      const rect =
                        logoCanvasRef.current?.getBoundingClientRect();
                      if (!rect) return;
                      setLogoWidth(
                        Math.max(
                          0.05,
                          Math.min(
                            0.5,
                            (event.clientX - rect.left) / rect.width - logoX,
                          ),
                        ),
                      );
                    }}
                  />
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Das Logo bleibt im gesamten Film immer die oberste Ebene. Texte dürfen bewusst darunter hindurchlaufen.</p>
              <p className="mt-2 text-xs text-muted-foreground">
                In die Vorschau klicken oder das Logo ziehen. Zahlen bleiben
                unten für exakte Werte verfügbar.
              </p>
            </div>
          )}
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={logoEnabled}
              onChange={(event) => setLogoEnabled(event.target.checked)}
            />{" "}
            Logo im Video zeigen
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium">
              Größe
              <input
                type="range"
                min={0.05}
                max={0.5}
                step={0.01}
                value={logoWidth}
                onChange={(event) => setLogoWidth(Number(event.target.value))}
                className="block w-full"
              />
            </label>
            <label className="space-y-2 text-sm font-medium">
              Drehung · {logoRotation.toFixed(0)}°
              <input
                type="range"
                min={-180}
                max={180}
                step={1}
                value={logoRotation}
                onChange={(event) =>
                  setLogoRotation(Number(event.target.value))
                }
                className="block w-full"
              />
            </label>
          </div>
          <details className="border border-border bg-muted/35 p-4">
            <summary className="cursor-pointer text-sm font-semibold">
              Feineinstellungen · Logo-Geometrie
            </summary>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Input
                label="Logo horizontal (0–1)"
                type="number"
                min={0}
                max={1}
                step={0.01}
                value={logoX}
                onChange={(event) => setLogoX(Number(event.target.value))}
              />
              <Input
                label="Logo vertikal (0–1)"
                type="number"
                min={0}
                max={1}
                step={0.01}
                value={logoY}
                onChange={(event) => setLogoY(Number(event.target.value))}
              />
              <Input
                label="Logo-Breite"
                type="number"
                min={0.05}
                max={0.5}
                step={0.01}
                value={logoWidth}
                onChange={(event) => setLogoWidth(Number(event.target.value))}
              />
              <Input
                label="Deckkraft"
                type="number"
                min={0.1}
                max={1}
                step={0.05}
                value={logoOpacity}
                onChange={(event) => setLogoOpacity(Number(event.target.value))}
              />
              <Input
                label="Drehung in Grad"
                type="number"
                min={-180}
                max={180}
                step={1}
                value={logoRotation}
                onChange={(event) =>
                  setLogoRotation(Number(event.target.value))
                }
              />
              <p className="self-end border border-border bg-muted/35 p-3 text-xs font-medium">Dauerhafte globale Ebene · im gesamten Film</p>
            </div>
          </details>
          <Button
            type="button"
            variant="outline"
            disabled={busy || !accountLibraryAvailable}
            onClick={saveBrand}
          >
            <Save className="mr-2 h-4 w-4" /> Logo-Einstellung speichern
          </Button>
          {startMode && (
            <Button
              type="button"
              disabled={busy}
              onClick={async () => {
                const saved = await saveBrand();
                if (saved) onContinue?.();
              }}
            >
              {logoEnabled ? "Logo speichern & zur Galerie" : "Ohne Logo zur Galerie"}
            </Button>
          )}
        </section>
        {!startMode && <section className="space-y-4">
          <div>
            <h2 className="font-semibold">Schnitt wiederverwenden</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Rhythmus speichert nur die Szenendauern. Schnittfolge speichert
              zusätzlich Bewegung, Übergänge und Szenenrollen – ohne Bilder oder
              Texte.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
            <Input
              label="Name der Vorlage"
              maxLength={60}
              value={templateName}
              onChange={(event) => setTemplateName(event.target.value)}
            />
            <label className="space-y-2 text-sm font-medium">
              Vorlagentyp
              <select
                value={templateKind}
                onChange={(event) =>
                  setTemplateKind(event.target.value as typeof templateKind)
                }
                className="block w-full border border-border bg-background px-3 py-2"
              >
                <option value="cut_sequence">Schnittfolge</option>
                <option value="rhythm">Rhythmus</option>
              </select>
            </label>
          </div>
          <Button
            type="button"
            variant="outline"
            disabled={
              busy || !accountLibraryAvailable || !project.takes.length
            }
            onClick={saveTemplate}
          >
            <Save className="mr-2 h-4 w-4" /> Im Kundenkonto speichern
          </Button>
          {presets.length > 0 && (
            <div className="space-y-2 border-t border-border pt-4">
              {presets.map((preset) => (
                <div
                  key={preset.id}
                  className="flex items-center justify-between gap-3 bg-muted/45 p-3"
                >
                  <div>
                    <p className="text-sm font-semibold">{preset.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {preset.kind === "rhythm" ? "Rhythmus" : "Schnittfolge"}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={busy || !project.takes.length}
                    onClick={() => applyTemplate(preset)}
                  >
                    Anwenden
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>}
      </div>
    </details>
  );
}

// Historical component retained only as a migration reference for the split gallery/timeline flow.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function SelectionStage({
  project,
  images,
  visibleImages,
  imageById,
  orderedAssetIds,
  filter,
  busy,
  targetDuration,
  saveStatus,
  rhythmPatternId,
  onFilter,
  onTargetDuration,
  onApplyPattern,
  onFitToTarget,
  onToggle,
  onMove,
  onMoveTo,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClear,
  onSelectScene,
  onSaveTake,
}: {
  project: SharedStudioProject;
  images: ImageItem[];
  visibleImages: ImageItem[];
  imageById: Map<string, ImageItem>;
  orderedAssetIds: string[];
  filter: Filter;
  busy: boolean;
  targetDuration: number;
  saveStatus: SaveStatus;
  rhythmPatternId: RhythmPatternId;
  onFilter: (filter: Filter) => void;
  onTargetDuration: (seconds: number) => void;
  onApplyPattern: (rhythmPatternId: RhythmPatternId) => Promise<void>;
  onFitToTarget: () => Promise<void>;
  onToggle: (id: string) => void;
  onMove: (id: string, direction: -1 | 1) => void;
  onMoveTo: (id: string, targetIndex: number) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onSelectScene: (id: string) => void;
  onSaveTake: (takeId: string, patch: Record<string, unknown>) => Promise<void>;
}) {
  const filters: Array<[Filter, string]> = [
    ["all", "Alle"],
    ["exterior", "Außen"],
    ["interior", "Innen"],
    ["detail", "Detail"],
  ];
  const rhythm = rhythmPatterns[rhythmPatternId];
  const recommendedImages = Math.round(
    (targetDuration / rhythm.cycleSeconds) * rhythm.durations.length,
  );
  const [search, setSearch] = useState("");
  const [hideUsed, setHideUsed] = useState(false);
  const bankImages = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return visibleImages.filter((image) => {
      if (hideUsed && orderedAssetIds.includes(image.id)) return false;
      if (!needle) return true;
      return `${image.roomLabel ?? ""} ${image.filename} ${image.description ?? ""}`
        .toLowerCase()
        .includes(needle);
    });
  }, [hideUsed, orderedAssetIds, search, visibleImages]);
  return (
    <section className="space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Material und Timeline
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em]">
            Bilder auswählen und direkt in die Reihenfolge bringen
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Jedes ausgewählte Bild erscheint sofort unten in der Timeline. Dort
            legst du Start, Ende, Reihenfolge und Dauer fest.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" disabled={!canUndo} onClick={onUndo}>
            <Undo2 className="mr-2 h-4 w-4" /> Rückgängig
          </Button>
          <Button variant="outline" disabled={!canRedo} onClick={onRedo}>
            <Redo2 className="mr-2 h-4 w-4" /> Wiederholen
          </Button>
          <Button
            variant="outline"
            disabled={orderedAssetIds.length === 0}
            onClick={onClear}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Auswahl leeren
          </Button>
        </div>
      </div>

      <div className="grid gap-4 border-y border-border/70 py-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <div>
          <p className="text-sm font-semibold">
            Wie lang soll der Clip werden?
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Für {targetDuration} Sekunden empfiehlt {rhythm.label} etwa{" "}
            {recommendedImages} Motive. Das ist eine Orientierung, keine
            automatische Auswahl.
          </p>
        </div>
        <div className="flex gap-2">
          {[30, 45, 60].map((seconds) => (
            <button
              key={seconds}
              type="button"
              onClick={() => onTargetDuration(seconds)}
              className={`min-w-24 px-4 py-3 text-sm font-semibold transition ${targetDuration === seconds ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"}`}
            >
              {seconds} Sekunden
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 border-b border-border/70 pb-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <p className="text-sm font-semibold">Rhythmusmuster</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Ein Musterwechsel verteilt nur automatisch gesetzte Dauern neu.
            Manuelle Szenen bleiben unverändert.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(Object.keys(rhythmPatterns) as RhythmPatternId[]).map((id) => (
              <button
                key={id}
                type="button"
                disabled={busy || saveStatus !== "saved"}
                onClick={() => onApplyPattern(id)}
                className={`px-3 py-2 text-xs font-semibold transition disabled:opacity-40 ${rhythmPatternId === id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
              >
                {rhythmPatterns[id].label} ·{" "}
                {rhythmPatterns[id].durations.map(formatSeconds).join(" / ")}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            disabled={
              busy || saveStatus !== "saved" || orderedAssetIds.length === 0
            }
            onClick={() => onApplyPattern(rhythmPatternId)}
          >
            Muster neu anwenden
          </Button>
          <Button
            disabled={
              busy || saveStatus !== "saved" || orderedAssetIds.length === 0
            }
            onClick={onFitToTarget}
          >
            Auf Zielzeit anpassen
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(330px,0.65fr)] xl:items-start">
        <div className="min-w-0 space-y-5">
          {orderedAssetIds.length > 0 ? (
            <>
              <StorySequence
                imageById={imageById}
                orderedAssetIds={orderedAssetIds}
                onMove={onMove}
                onMoveTo={onMoveTo}
                onSelectScene={onSelectScene}
              />
              <TimelineStage
                project={project}
                imageById={imageById}
                orderedAssetIds={orderedAssetIds}
                busy={busy}
                targetDuration={targetDuration}
                saveStatus={saveStatus}
                rhythmPatternId={rhythmPatternId}
                onMove={onMove}
                onMoveTo={onMoveTo}
                onSelectScene={onSelectScene}
                onSaveTake={onSaveTake}
              />
            </>
          ) : (
            <div className="border border-dashed border-border bg-muted/25 px-6 py-16 text-center">
              <Images className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-3 font-semibold">Die Bildgeschichte ist noch leer</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Wähle rechts das erste Motiv. Es erscheint sofort hier und in
                der Timeline.
              </p>
            </div>
          )}
        </div>

        <aside className="border border-border/70 bg-card p-4 shadow-sm xl:sticky xl:top-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Bildbank
            </p>
            <h3 className="mt-1 font-semibold">Motive dieses Auftrags</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Anklicken fügt ein Motiv hinzu oder entfernt es wieder.
            </p>
          </div>
          <label className="mt-4 block text-xs font-medium">
            Motive suchen
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Raum, Motiv oder Dateiname"
              className="mt-2 block w-full border border-border bg-background px-3 py-2.5 text-sm"
            />
          </label>
          <label className="mt-3 flex items-center gap-2 text-xs font-medium">
            <input
              type="checkbox"
              checked={hideUsed}
              onChange={(event) => setHideUsed(event.target.checked)}
            />
            Verwendete Motive ausblenden
          </label>
          <div className="mt-4 flex flex-wrap gap-2">
            {filters.map(([id, label]) => {
              const count =
                id === "all"
                  ? images.length
                  : images.filter((image) => image.role === id).length;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onFilter(id)}
                  className={`px-2.5 py-2 text-xs font-semibold transition ${filter === id ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"}`}
                >
                  {label} · {count}
                </button>
              );
            })}
          </div>
          <div className="mt-4 grid max-h-[72vh] gap-3 overflow-y-auto pr-1 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            {bankImages.map((image) => {
              const selectedIndex = orderedAssetIds.indexOf(image.id);
              const selected = selectedIndex >= 0;
              return (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => onToggle(image.id)}
                  className={`overflow-hidden border bg-background text-left transition ${selected ? "border-primary ring-2 ring-primary/15" : "border-border hover:border-primary/45"}`}
                >
                  <div className="relative">
                    <img
                      src={image.previewUrl}
                      alt={image.roomLabel ?? image.filename}
                      className="aspect-[4/3] w-full object-cover"
                    />
                    <span
                      className={`absolute left-2 top-2 flex h-7 min-w-7 items-center justify-center px-2 text-xs font-bold ${selected ? "bg-primary text-primary-foreground" : "bg-background/90 text-foreground shadow"}`}
                    >
                      {selected ? selectedIndex + 1 : "+"}
                    </span>
                    {selected && (
                      <Check className="absolute right-2 top-2 h-7 w-7 bg-primary p-1.5 text-primary-foreground" />
                    )}
                  </div>
                  <span className="block truncate px-2.5 pt-2 text-xs font-semibold">
                    {image.roomLabel ?? image.filename}
                  </span>
                  <span className="block truncate px-2.5 pb-2 text-[11px] text-muted-foreground">
                    {selected ? `Position ${selectedIndex + 1}` : image.filename}
                  </span>
                </button>
              );
            })}
          </div>
          {bankImages.length === 0 && (
            <p className="mt-4 border border-dashed border-border p-5 text-center text-xs text-muted-foreground">
              Für diese Suche sind keine weiteren Motive sichtbar.
            </p>
          )}
        </aside>
      </div>
    </section>
  );
}

function StorySequence({
  imageById,
  orderedAssetIds,
  onMove,
  onMoveTo,
  onSelectScene,
}: {
  imageById: Map<string, ImageItem>;
  orderedAssetIds: string[];
  onMove: (assetId: string, direction: -1 | 1) => void;
  onMoveTo: (assetId: string, targetIndex: number) => void;
  onSelectScene: (assetId: string) => void;
}) {
  return (
    <section className="space-y-3 border border-primary/20 bg-primary/[0.035] p-4 md:p-5">
      <div>
        <h3 className="font-semibold">Ihre Bildfolge</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Die Geschichte bleibt visuell im Mittelpunkt. Pfeile ändern die
          Reihenfolge; Start und Ende lassen sich direkt setzen. Ein Bild öffnet
          seine Szene.
        </p>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {orderedAssetIds.map((assetId, index) => {
          const image = imageById.get(assetId);
          if (!image) return null;
          const isLast = index === orderedAssetIds.length - 1;
          return (
            <article
              key={`story-${assetId}`}
              className="w-44 shrink-0 overflow-hidden border border-primary/40 bg-background shadow-sm"
            >
              <button
                type="button"
                className="block w-full text-left"
                onClick={() => onSelectScene(assetId)}
              >
                <div className="relative">
                  <img
                    src={image.previewUrl}
                    alt={image.roomLabel ?? image.filename}
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <span className="absolute left-2 top-2 bg-primary px-2 py-1 text-[11px] font-bold text-primary-foreground">
                    {index === 0 ? "Start" : isLast ? "Ende" : index + 1}
                  </span>
                </div>
                <p className="truncate px-3 pt-2 text-xs font-semibold">
                  {image.roomLabel ?? image.filename}
                </p>
              </button>
              <div className="grid grid-cols-4 gap-px bg-border p-px">
                <button
                  type="button"
                  title="Nach vorne"
                  disabled={index === 0}
                  onClick={() => onMove(assetId, -1)}
                  className="bg-background py-2 disabled:opacity-25"
                >
                  <ArrowLeft className="mx-auto h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  title="Nach hinten"
                  disabled={isLast}
                  onClick={() => onMove(assetId, 1)}
                  className="bg-background py-2 disabled:opacity-25"
                >
                  <ArrowRight className="mx-auto h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  title="Als Start setzen"
                  disabled={index === 0}
                  onClick={() => onMoveTo(assetId, 0)}
                  className="bg-background py-2 text-[10px] font-semibold disabled:opacity-25"
                >
                  Start
                </button>
                <button
                  type="button"
                  title="Als Ende setzen"
                  disabled={isLast}
                  onClick={() => onMoveTo(assetId, orderedAssetIds.length - 1)}
                  className="bg-background py-2 text-[10px] font-semibold disabled:opacity-25"
                >
                  Ende
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function TimelineStage({
  project,
  imageById,
  orderedAssetIds,
  busy,
  targetDuration,
  saveStatus,
  rhythmPatternId,
  onMove,
  onMoveTo,
  onSelectScene,
  onSaveTake,
}: {
  project: SharedStudioProject;
  imageById: Map<string, ImageItem>;
  orderedAssetIds: string[];
  busy: boolean;
  targetDuration: number;
  saveStatus: SaveStatus;
  rhythmPatternId: RhythmPatternId;
  onMove: (assetId: string, direction: -1 | 1) => void;
  onMoveTo: (assetId: string, targetIndex: number) => void;
  onSelectScene: (assetId: string) => void;
  onSaveTake: (takeId: string, patch: Record<string, unknown>) => Promise<void>;
}) {
  const takeByAssetId = new Map(
    project.takes.map((take) => [take.sourceAssetId, take]),
  );
  const takes = orderedAssetIds.map(
    (assetId, index) =>
      takeByAssetId.get(assetId) ??
      draftTake(assetId, index, orderedAssetIds.length, rhythmPatternId),
  );
  const totalDuration = timelineDuration(takes);
  const pixelsPerSecond = 120;
  const rulerDuration = Math.max(targetDuration, Math.ceil(totalDuration));
  const trackWidth = Math.max(720, rulerDuration * pixelsPerSecond);
  return (
    <section className="space-y-7">
      <div className="flex flex-col gap-4 border-b border-border/70 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Timeline
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em]">
            Rhythmus und Bewegung festlegen
          </h2>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {rhythmPatterns[rhythmPatternId].label} ist aktiv. Manuelle Dauern
            und Übergänge bleiben sichtbar; Crossfades zählen als Überlappung
            nur bei zwei Szenen ab 1,5 Sekunden.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-px bg-border text-center">
          <div className="bg-background px-5 py-3">
            <p className="text-xs text-muted-foreground">Timeline</p>
            <p className="font-semibold">{totalDuration.toFixed(1)} s</p>
          </div>
          <div className="bg-background px-5 py-3">
            <p className="text-xs text-muted-foreground">Ziel</p>
            <p className="font-semibold">{targetDuration} s</p>
          </div>
        </div>
      </div>

      <div className="border border-border bg-[#17191d] text-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-white/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <GripVertical className="h-4 w-4 text-white/45" />
            <div>
              <p className="text-sm font-semibold">Bildspur</p>
              <p className="text-[11px] text-white/55">
                Clips ziehen, um die Reihenfolge zu ändern. Die Breite
                entspricht der Dauer.
              </p>
            </div>
          </div>
          <SaveIndicator status={saveStatus} dark />
        </div>

        <div className="overflow-x-auto pb-4">
          <div
            style={{ width: `${trackWidth}px` }}
            className="relative min-w-full"
          >
            <div className="relative h-10 border-b border-white/15 bg-[#111317]">
              {Array.from(
                { length: Math.floor(rulerDuration / 5) + 1 },
                (_, index) => index * 5,
              ).map((second) => (
                <div
                  key={second}
                  className="absolute inset-y-0 border-l border-white/25"
                  style={{ left: `${second * pixelsPerSecond}px` }}
                >
                  <span className="absolute left-2 top-2 text-[10px] font-medium text-white/60">
                    {second}s
                  </span>
                </div>
              ))}
            </div>

            <div
              className="relative flex min-h-[238px] items-start bg-[repeating-linear-gradient(to_right,transparent_0,transparent_119px,rgba(255,255,255,0.055)_120px)] p-3"
              style={{ backgroundSize: `${pixelsPerSecond}px 100%` }}
            >
              <div
                className="absolute bottom-0 left-3 top-0 z-20 w-px bg-[#e26445]"
                aria-label="Abspielkopf bei 0 Sekunden"
              >
                <span className="absolute -left-1.5 top-0 h-3 w-3 rotate-45 bg-[#e26445]" />
              </div>
              {takes.map((take, index) => {
                const image = imageById.get(take.sourceAssetId);
                if (!image) return null;
                const persisted = takeByAssetId.has(take.sourceAssetId);
                const suggestion = motionSuggestion(image, index, takes.length);
                const startAt = timelineStart(takes, index);
                const endAt = startAt + take.durationSeconds;
                const previousTake = takes[index - 1];
                const crossfadeAllowed = Boolean(
                  previousTake &&
                  previousTake.durationSeconds >= 1.5 &&
                  take.durationSeconds >= 1.5,
                );
                const endpoint =
                  index === 0
                    ? "START"
                    : index === takes.length - 1
                      ? "ENDE"
                      : `CLIP ${index + 1}`;
                return (
                  <article
                    key={take.id}
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData(
                        "text/plain",
                        take.sourceAssetId,
                      );
                    }}
                    onDragOver={(event) => {
                      event.preventDefault();
                      event.dataTransfer.dropEffect = "move";
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      onMoveTo(event.dataTransfer.getData("text/plain"), index);
                    }}
                    className="group relative shrink-0 cursor-grab border-r-2 border-[#17191d] bg-[#2a3f68] active:cursor-grabbing"
                    style={{
                      width: `${Math.max(0.5, take.durationSeconds) * pixelsPerSecond}px`,
                      marginLeft:
                        index === 0
                          ? undefined
                          : `${-effectiveTransitionSeconds(previousTake, take) * pixelsPerSecond}px`,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => onSelectScene(take.sourceAssetId)}
                      className="relative block h-[118px] w-full overflow-hidden text-left"
                    >
                      <img
                        src={image.previewUrl}
                        alt={image.roomLabel ?? image.filename}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                      />
                      <span className="absolute left-2 top-2 bg-black/75 px-2 py-1 text-[9px] font-bold tracking-[0.12em]">
                        {endpoint}
                      </span>
                      <span className="absolute bottom-2 left-2 bg-black/75 px-2 py-1 text-[10px] font-semibold">
                        {startAt.toFixed(1)}–{endAt.toFixed(1)}s
                      </span>
                    </button>
                    <div className="space-y-2 p-2.5">
                      <button
                        type="button"
                        onClick={() => onSelectScene(take.sourceAssetId)}
                        className="block w-full text-left"
                      >
                        <span className="block truncate text-xs font-semibold">
                          {image.roomLabel ?? image.filename}
                        </span>
                        <span className="mt-0.5 block truncate text-[10px] text-white/65">
                          {motionLabel(take.motion)}
                        </span>
                      </button>
                      <div className="flex items-center gap-1">
                        {[0.8, 1, 2, 3].map((seconds) => (
                          <button
                            key={seconds}
                            type="button"
                            disabled={busy || !persisted}
                            onClick={() =>
                              onSaveTake(take.id, {
                                durationSeconds: seconds,
                                durationSource: "manual",
                              })
                            }
                            className={`h-7 flex-1 text-[10px] font-bold ${Math.abs(take.durationSeconds - seconds) < 0.01 ? "bg-white text-[#17191d]" : "bg-white/10 text-white/70 hover:bg-white/20"}`}
                          >
                            {String(seconds).replace(".", ",")}s
                          </button>
                        ))}
                      </div>
                      <select
                        aria-label={`Übergang vor Szene ${index + 1}`}
                        value={take.transitionIn}
                        disabled={busy || !persisted || index === 0}
                        onChange={(event) =>
                          onSaveTake(take.id, {
                            transitionIn: event.target.value,
                          })
                        }
                        className="h-7 w-full border-0 bg-white/10 px-2 text-[10px] font-semibold text-white disabled:opacity-35"
                      >
                        <option value="cut">Harter Schnitt</option>
                        <option value="crossfade" disabled={!crossfadeAllowed}>
                          Crossfade 0,3 s
                          {crossfadeAllowed ? "" : " · erst ab 1,5 s"}
                        </option>
                        <option value="fadeFromBlack">
                          Einblende von Schwarz
                        </option>
                      </select>
                      <p className="truncate text-[9px] text-white/55">
                        {take.durationSource === "manual"
                          ? "Dauer manuell"
                          : `Dauer aus ${rhythmPatterns[rhythmPatternId].label}`}
                      </p>
                      <div className="grid grid-cols-4 gap-1 text-[9px] font-bold">
                        <button
                          type="button"
                          aria-label="Nach links"
                          disabled={index === 0}
                          onClick={() => onMove(take.sourceAssetId, -1)}
                          className="bg-white/10 px-1 py-1.5 disabled:opacity-25"
                        >
                          <ArrowLeft className="mx-auto h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          aria-label="Nach rechts"
                          disabled={index === takes.length - 1}
                          onClick={() => onMove(take.sourceAssetId, 1)}
                          className="bg-white/10 px-1 py-1.5 disabled:opacity-25"
                        >
                          <ArrowRight className="mx-auto h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          title="Als Startbild setzen"
                          onClick={() => onMoveTo(take.sourceAssetId, 0)}
                          className="bg-white/10 px-1 py-1.5"
                        >
                          <Flag className="mx-auto h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          title="Als Endbild setzen"
                          onClick={() =>
                            onMoveTo(take.sourceAssetId, takes.length - 1)
                          }
                          className="bg-white/10 px-1 py-1.5"
                        >
                          <Flag className="mx-auto h-3 w-3 rotate-180" />
                        </button>
                      </div>
                      {take.motion !== suggestion.motion && (
                        <button
                          type="button"
                          disabled={busy || !persisted}
                          onClick={() =>
                            onSaveTake(take.id, { motion: suggestion.motion })
                          }
                          className="flex w-full items-center gap-1 truncate text-left text-[9px] font-semibold text-[#f0b6a7] hover:text-white disabled:opacity-40"
                          title={suggestion.reason}
                        >
                          <Sparkles className="h-3 w-3 shrink-0" />{" "}
                          {motionLabel(suggestion.motion)} vorschlagen
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
              {totalDuration < targetDuration && (
                <div
                  className="flex h-[214px] items-center justify-center border border-dashed border-white/15 text-xs text-white/35"
                  style={{
                    width: `${(targetDuration - totalDuration) * pixelsPerSecond}px`,
                  }}
                >
                  Noch {(targetDuration - totalDuration).toFixed(1)}s bis zum
                  Ziel
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        Die Timeline läuft von links nach rechts. Ziehen oder die Pfeile ändern
        die Reihenfolge; die Flaggen setzen Start und Ende. Ein Klick auf einen
        Clip öffnet den 9:16-Ausschnitt, Bewegung und Text. Änderungen werden
        automatisch gespeichert.
      </p>

      <div className="grid gap-4 border-t border-border/70 pt-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="flex gap-3">
          <WandSparkles className="mt-0.5 h-5 w-5 text-primary" />
          <div>
            <p className="font-semibold">
              Erweiterte Bildbewegungen kommen danach
            </p>
            <p className="mt-1 max-w-3xl text-xs leading-relaxed text-muted-foreground">
              Fließendes Wasser, vorbeifahrende Autos, Fake-Drone,
              Perspektivwechsel oder Text hinter Gebäudeteilen werden separat
              vorgeschlagen. Sie verursachen zusätzliche Generierung, Kosten und
              Prüfbedarf und werden niemals automatisch angewendet.
            </p>
          </div>
        </div>
        <Button
          disabled={takes.length === 0}
          onClick={() => takes[0] && onSelectScene(takes[0].sourceAssetId)}
        >
          <Play className="mr-2 h-4 w-4" /> Bewegungen prüfen
        </Button>
      </div>
    </section>
  );
}

function TakeEditor({
  take,
  image,
  analysis,
  sceneSpecScene,
  index,
  total,
  saveStatus,
  onPrevious,
  onNext,
  onSave,
  onReview,
  onPending,
  fontMenu,
  brandOverlay,
  brandPreviewUrl,
  motionPanel,
}: {
  take: SharedStudioTake;
  image: ImageItem;
  analysis?: SharedAssetAnalysis;
  sceneSpecScene?: SharedSceneSpec["scenes"][number];
  index: number;
  total: number;
  saveStatus: SaveStatus;
  onPrevious: () => void;
  onNext: () => void;
  onSave: (takeId: string, patch: Record<string, unknown>) => Promise<void>;
  onReview: (takeId: string) => Promise<void>;
  onPending: () => void;
  fontMenu: VideoStudioFont[];
  brandOverlay?: SharedStudioProject["brandOverlay"];
  brandPreviewUrl?: string;
  motionPanel?: ReactNode;
}) {
  const scaleBudget = portraitScaleBudget(image.width, image.height);
  const initialStyleId =
    take.text.styleId ?? legacyTextStyleId(take.text.typography?.preset);
  const [durationSeconds, setDurationSeconds] = useState(clampStillDuration(take.durationSeconds));
  const [motion, setMotion] = useState(take.motion);
  const [transitionIn, setTransitionIn] = useState(take.transitionIn);
  const [textEnabled, setTextEnabled] = useState(take.text.enabled);
  const legacyTextEditingEnabled = false;
  const [title, setTitle] = useState(take.text.title ?? "");
  const [subtitle, setSubtitle] = useState(take.text.subtitle ?? "");
  const [styleId, setStyleId] = useState<TextStyleId>(initialStyleId);
  const initialStyle = textStyleOptions.find(
    (style) => style.id === initialStyleId,
  )!;
  const canonicalFonts = fontMenu.length
    ? fontMenu
    : [
        {
          family: "Inter",
          label: "Inter",
          group: "ruhig",
          fileBase: "Inter",
          fallback: "sans-serif",
          active: true,
          order: 0,
        } satisfies VideoStudioFont,
      ];
  const [fontFamily, setFontFamily] = useState(
    take.text.fontFamily ?? canonicalFont(initialStyle.fontFamily),
  );
  const [subtitleFontFamily, setSubtitleFontFamily] = useState(
    take.text.subtitleFontFamily ??
      canonicalFont(initialStyle.subtitleFontFamily ?? initialStyle.fontFamily),
  );
  const [titleColor, setTitleColor] = useState(
    take.text.titleColorHex ??
      take.text.colorHex ??
      take.text.typography?.color ??
      initialStyle.color,
  );
  const [subtitleColor, setSubtitleColor] = useState(
    take.text.subtitleColorHex ??
      take.text.colorHex ??
      take.text.typography?.color ??
      initialStyle.color,
  );
  const [titleSizeRel, setTitleSizeRel] = useState(
    take.text.titleSizeRel ?? initialStyle.titleSizeRel,
  );
  const [subtitleSizeRel, setSubtitleSizeRel] = useState(
    take.text.subtitleSizeRel ?? initialStyle.subtitleSizeRel ?? 0.028,
  );
  const [titleWeight, setTitleWeight] = useState(
    take.text.titleWeight ?? initialStyle.titleWeight,
  );
  const [subtitleWeight, setSubtitleWeight] = useState(
    take.text.subtitleWeight ?? 400,
  );
  const [titleTracking, setTitleTracking] = useState(
    take.text.titleLetterSpacing ?? take.text.letterSpacing ?? 0,
  );
  const [subtitleTracking, setSubtitleTracking] = useState(
    take.text.subtitleLetterSpacing ?? take.text.letterSpacing ?? 0,
  );
  const [titleScaleX, setTitleScaleX] = useState(take.text.titleScaleX ?? 1);
  const [subtitleScaleX, setSubtitleScaleX] = useState(
    take.text.subtitleScaleX ?? 1,
  );
  const [titleLineHeight, setTitleLineHeight] = useState(
    take.text.titleLineHeight ?? take.text.lineHeight ?? 1.15,
  );
  const [subtitleLineHeight, setSubtitleLineHeight] = useState(
    take.text.subtitleLineHeight ?? take.text.lineHeight ?? 1.15,
  );
  const [maxWidthRel, setMaxWidthRel] = useState(
    take.text.maxWidthRel ?? initialStyle.maxWidthRel,
  );
  const [align, setAlign] = useState(
    take.text.align ?? take.text.typography?.align ?? "left",
  );
  const [opacity, setOpacity] = useState(take.text.opacity ?? 1);
  const [safeAreaLock, setSafeAreaLock] = useState(
    take.text.safeAreaLock ?? true,
  );
  const [x, setX] = useState(take.text.position?.x ?? 0.08);
  const [y, setY] = useState(take.text.position?.y ?? 0.72);
  const [rotationDeg, setRotationDeg] = useState(take.text.rotationDeg ?? 0);
  const [textDragging, setTextDragging] = useState(false);
  const textCanvasRef = useRef<HTMLDivElement>(null);
  const [startFrame, setStartFrame] = useState(() =>
    normalizeInteractiveFrame(take.startFrame, image.width, image.height),
  );
  const [endFrame, setEndFrame] = useState(() =>
    normalizeInteractiveFrame(take.endFrame, image.width, image.height),
  );
  const [showSafeArea, setShowSafeArea] = useState(true);
  const sceneSnapshot = {
    durationSeconds,
    motion,
    transitionIn,
    textEnabled,
    title,
    subtitle,
    styleId,
    fontFamily,
    subtitleFontFamily,
    titleColor,
    subtitleColor,
    titleSizeRel,
    subtitleSizeRel,
    titleWeight,
    subtitleWeight,
    titleTracking,
    subtitleTracking,
    titleScaleX,
    subtitleScaleX,
    titleLineHeight,
    subtitleLineHeight,
    maxWidthRel,
    align,
    opacity,
    safeAreaLock,
    x,
    y,
    rotationDeg,
    startFrame,
    endFrame,
  };
  const sceneHistory = useEditorHistory(sceneSnapshot, applySceneSnapshot);

  function applySceneSnapshot(snapshot: typeof sceneSnapshot) {
    setDurationSeconds(snapshot.durationSeconds);
    setMotion(snapshot.motion);
    setTransitionIn(snapshot.transitionIn);
    setTextEnabled(snapshot.textEnabled);
    setTitle(snapshot.title);
    setSubtitle(snapshot.subtitle);
    setStyleId(snapshot.styleId);
    setFontFamily(snapshot.fontFamily);
    setSubtitleFontFamily(snapshot.subtitleFontFamily);
    setTitleColor(snapshot.titleColor);
    setSubtitleColor(snapshot.subtitleColor);
    setTitleSizeRel(snapshot.titleSizeRel);
    setSubtitleSizeRel(snapshot.subtitleSizeRel);
    setTitleWeight(snapshot.titleWeight);
    setSubtitleWeight(snapshot.subtitleWeight);
    setTitleTracking(snapshot.titleTracking);
    setSubtitleTracking(snapshot.subtitleTracking);
    setTitleScaleX(snapshot.titleScaleX);
    setSubtitleScaleX(snapshot.subtitleScaleX);
    setTitleLineHeight(snapshot.titleLineHeight);
    setSubtitleLineHeight(snapshot.subtitleLineHeight);
    setMaxWidthRel(snapshot.maxWidthRel);
    setAlign(snapshot.align);
    setOpacity(snapshot.opacity);
    setSafeAreaLock(snapshot.safeAreaLock);
    setX(snapshot.x);
    setY(snapshot.y);
    setRotationDeg(snapshot.rotationDeg);
    setStartFrame(snapshot.startFrame);
    setEndFrame(snapshot.endFrame);
  }
  const onSaveRef = useRef(onSave);
  const onPendingRef = useRef(onPending);
  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);
  useEffect(() => {
    onPendingRef.current = onPending;
  }, [onPending]);
  const legacyAutosavePatch = useMemo(
    () => ({
      durationSeconds,
      durationSource:
        Math.abs(durationSeconds - take.durationSeconds) > 0.001
          ? "manual"
          : take.durationSource,
      motion,
      transitionIn,
      startFrame,
      endFrame,
      text: {
        enabled: textEnabled,
        styleId,
        title,
        subtitle,
        purpose:
          index === 0
            ? "hook"
            : index === total - 1
              ? "call_to_action"
              : "feature",
        position: { x, y, width: maxWidthRel },
        maxWidthRel,
        safeAreaLock,
        fontFamily,
        subtitleFontFamily,
        titleWeight,
        subtitleWeight,
        titleSizeRel,
        subtitleSizeRel,
        titleColorHex: titleColor,
        subtitleColorHex: subtitleColor,
        opacity,
        titleLetterSpacing: titleTracking,
        subtitleLetterSpacing: subtitleTracking,
        titleScaleX,
        subtitleScaleX,
        titleLineHeight,
        subtitleLineHeight,
        align,
        rotationDeg,
        typography: {
          preset: legacyPresetForTextStyle(styleId),
          color: titleColor,
          align,
        },
      },
    }),
    [
      align,
      durationSeconds,
      endFrame,
      fontFamily,
      index,
      maxWidthRel,
      motion,
      opacity,
      rotationDeg,
      safeAreaLock,
      startFrame,
      styleId,
      subtitle,
      subtitleColor,
      subtitleFontFamily,
      subtitleLineHeight,
      subtitleScaleX,
      subtitleSizeRel,
      subtitleTracking,
      subtitleWeight,
      take.durationSeconds,
      take.durationSource,
      textEnabled,
      title,
      titleColor,
      titleLineHeight,
      titleScaleX,
      titleSizeRel,
      titleTracking,
      titleWeight,
      total,
      transitionIn,
      x,
      y,
    ],
  );
  const autosavePatch = useMemo(() => ({
    durationSeconds: legacyAutosavePatch.durationSeconds,
    durationSource: legacyAutosavePatch.durationSource,
    motion: legacyAutosavePatch.motion,
    transitionIn: legacyAutosavePatch.transitionIn,
    startFrame: legacyAutosavePatch.startFrame,
    endFrame: legacyAutosavePatch.endFrame,
  }), [legacyAutosavePatch]);
  const autosaveSignature = JSON.stringify(autosavePatch);
  const savedSignature = useRef(autosaveSignature);

  useEffect(() => {
    if (autosaveSignature === savedSignature.current) return;
    onPendingRef.current();
    const timer = window.setTimeout(async () => {
      try {
        await onSaveRef.current(take.id, autosavePatch);
        savedSignature.current = autosaveSignature;
      } catch {
        // The parent keeps the concrete error visible; local editor state remains intact.
      }
    }, 800);
    return () => window.clearTimeout(timer);
  }, [autosavePatch, autosaveSignature, take.id]);
  const previewStyle: CSSProperties = {
    fontFamily: `"${fontFamily}", sans-serif`,
    fontWeight: titleWeight,
    letterSpacing: `${titleTracking}em`,
    textAlign: align,
    opacity,
  };
  const cutRisk = analysis
    ? analysisCutRisks(image, startFrame, endFrame, analysis)
    : (take.quality?.cutRisk ?? []);
  const qualityNote = sourceQualityNote(
    image,
    durationSeconds,
    startFrame.scale,
    endFrame.scale,
    cutRisk,
  );
  const maximumScale = scaleBudget.maximumScale;
  const motionLocked =
    durationSeconds < 1.2 || qualityNote.rating === "ungeeignet" || !scaleBudget.motionAllowed;
  const previewStartFrame =
    saveStatus === "saved" && sceneSpecScene
      ? normalizeInteractiveFrame(
          cropFrameFromSpec(sceneSpecScene.startCrop),
          image.width,
          image.height,
        )
      : startFrame;
  const previewEndFrame =
    saveStatus === "saved" && sceneSpecScene
      ? normalizeInteractiveFrame(
          cropFrameFromSpec(sceneSpecScene.endCrop),
          image.width,
          image.height,
        )
      : endFrame;
  function placeText(
    clientX: number,
    clientY: number,
    element: HTMLDivElement,
  ) {
    if (!textEnabled) return;
    const rect = element.getBoundingClientRect();
    const minX = safeAreaLock ? 0.08 : 0;
    const maxX = safeAreaLock
      ? Math.max(0.08, 0.92 - maxWidthRel)
      : Math.max(0, 1 - maxWidthRel);
    const minY = safeAreaLock ? 0.14 : 0;
    const maxY = safeAreaLock ? 0.8 : 0.96;
    setX(
      Math.max(
        minX,
        Math.min(maxX, (clientX - rect.left) / rect.width - maxWidthRel / 2),
      ),
    );
    setY(
      Math.max(minY, Math.min(maxY, (clientY - rect.top) / rect.height - 0.03)),
    );
  }

  return (
    <article className="grid overflow-hidden bg-card shadow-sm ring-1 ring-border/70 xl:grid-cols-[minmax(0,1.45fr)_minmax(380px,0.75fr)]">
      <style jsx>{`
        @keyframes studio-motion-preview {
          0% {
            transform: var(--motion-from);
            object-position: var(--position-from);
          }
          100% {
            transform: var(--motion-to);
            object-position: var(--position-to);
          }
        }
        .studio-motion-preview {
          animation: studio-motion-preview var(--motion-duration) var(--motion-easing)
            var(--motion-delay) 1 normal forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .studio-motion-preview {
            animation: none;
          }
        }
      `}</style>
      <div className="grid min-h-[620px] items-center gap-5 bg-[#101010] p-5 md:p-8 2xl:grid-cols-[minmax(280px,1fr)_minmax(260px,0.72fr)]">
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
              Originalbild
            </p>
            <p className="mt-1 text-sm text-white/80">
              Start- und Endrahmen bleiben neben dem fertigen Hochformat sichtbar.
            </p>
          </div>
          <SourceFramePreview
            label="Start"
            image={image}
            frame={startFrame}
            maximumScale={maximumScale}
            color="#22d3ee"
            onChange={setStartFrame}
          />
          <SourceFramePreview
            label="Ende"
            image={image}
            frame={endFrame}
            maximumScale={maximumScale}
            color="#f59e0b"
            onChange={setEndFrame}
          />
        </div>
        <div
          ref={textCanvasRef}
          className={`relative mx-auto aspect-[9/16] max-h-[76vh] w-full max-w-[440px] touch-none overflow-hidden bg-black shadow-2xl ${legacyTextEditingEnabled ? "cursor-crosshair" : ""}`}
          onPointerDown={(event) => {
            if (!legacyTextEditingEnabled) return;
            setTextDragging(true);
            event.currentTarget.setPointerCapture(event.pointerId);
            placeText(event.clientX, event.clientY, event.currentTarget);
          }}
          onPointerMove={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId))
              placeText(event.clientX, event.clientY, event.currentTarget);
          }}
          onPointerUp={() => setTextDragging(false)}
          onPointerCancel={() => setTextDragging(false)}
          title={
            legacyTextEditingEnabled
              ? "Klicken oder ziehen, um den Text zu positionieren"
              : undefined
          }
        >
          <img
            src={image.previewUrl}
            alt={image.roomLabel ?? image.filename}
            className="studio-motion-preview h-full w-full object-cover"
            style={cropMotionPreviewStyle(
              previewStartFrame,
              previewEndFrame,
              durationSeconds,
              motionLocked,
              take.motionSpec?.parameters,
            )}
          />
          {brandOverlay?.enabled && brandPreviewUrl && (
            <img
              src={brandPreviewUrl}
              alt="Logo im Video"
              draggable={false}
              className="pointer-events-none absolute z-50 h-auto object-contain drop-shadow-md"
              style={{
                left: `${brandOverlay.position.x * 100}%`,
                top: `${brandOverlay.position.y * 100}%`,
                width: `${brandOverlay.widthRel * 100}%`,
                opacity: brandOverlay.opacity,
                transform: `rotate(${brandOverlay.rotationDeg ?? 0}deg)`,
                transformOrigin: "center",
              }}
            />
          )}
          {showSafeArea && safeAreaLock && (
            <div
              className="pointer-events-none absolute border border-dashed border-white/70 shadow-[0_0_0_999px_rgba(0,0,0,0.08)]"
              style={{ top: "14%", bottom: "20%", left: "8%", right: "8%" }}
              aria-label="Sicherer Textbereich"
            />
          )}
          <span className="absolute left-4 top-4 bg-black/70 px-3 py-1.5 text-xs font-semibold text-white">
            {index === 0 ? "Startbild" : `Szene ${index + 1}`}
          </span>
          <span className="absolute bottom-4 left-4 bg-black/70 px-3 py-1.5 text-xs font-semibold text-white">
            {motionLabel(motion)} · {durationSeconds}s
            {take.motionSpec?.parameters && (take.motionSpec.parameters.holdStartSeconds > 0 || take.motionSpec.parameters.holdEndSeconds > 0)
              ? ` · Pause ${take.motionSpec.parameters.holdStartSeconds}s / ${take.motionSpec.parameters.holdEndSeconds}s`
              : ""}
          </span>
          {legacyTextEditingEnabled && (title || subtitle) && (
            <>
              {textDragging && (
                <>
                  <span
                    className="pointer-events-none absolute inset-y-0 border-l border-dashed border-white/80"
                    style={{ left: `${(x + maxWidthRel / 2) * 100}%` }}
                  />
                  <span
                    className="pointer-events-none absolute inset-x-0 border-t border-dashed border-white/80"
                    style={{ top: `${y * 100}%` }}
                  />
                </>
              )}
              <div
                className="pointer-events-none absolute border border-dashed border-white/85 p-1 [text-shadow:0_2px_12px_rgba(0,0,0,0.7)]"
                style={{
                  left: `${x * 100}%`,
                  top: `${y * 100}%`,
                  width: `${maxWidthRel * 100}%`,
                  color: titleColor,
                  ...previewStyle,
                  transform: `rotate(${rotationDeg}deg)`,
                  transformOrigin: "center",
                }}
              >
                <button
                  type="button"
                  aria-label="Textblock drehen"
                  className="pointer-events-auto absolute -top-7 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full border border-black bg-white shadow"
                  onPointerDown={(event) => {
                    event.stopPropagation();
                    event.currentTarget.setPointerCapture(event.pointerId);
                  }}
                  onPointerMove={(event) => {
                    if (!event.currentTarget.hasPointerCapture(event.pointerId))
                      return;
                    const rect = textCanvasRef.current?.getBoundingClientRect();
                    if (!rect) return;
                    const centerX =
                      rect.left + (x + maxWidthRel / 2) * rect.width;
                    const centerY = rect.top + y * rect.height;
                    const angle =
                      (Math.atan2(
                        event.clientY - centerY,
                        event.clientX - centerX,
                      ) *
                        180) /
                        Math.PI +
                      90;
                    setRotationDeg(Math.max(-180, Math.min(180, angle)));
                  }}
                />
                <button
                  type="button"
                  aria-label="Textblock verbreitern oder schmaler machen"
                  className="pointer-events-auto absolute -bottom-2 -right-2 h-4 w-4 border border-black bg-white shadow"
                  onPointerDown={(event) => {
                    event.stopPropagation();
                    event.currentTarget.setPointerCapture(event.pointerId);
                  }}
                  onPointerMove={(event) => {
                    if (!event.currentTarget.hasPointerCapture(event.pointerId))
                      return;
                    const rect = textCanvasRef.current?.getBoundingClientRect();
                    if (!rect) return;
                    setMaxWidthRel(
                      Math.max(
                        0.2,
                        Math.min(
                          1 - x,
                          (event.clientX - rect.left) / rect.width - x,
                        ),
                      ),
                    );
                  }}
                />
                {title && (
                  <p
                    style={{
                      fontSize: `${Math.max(8, titleSizeRel * 750)}px`,
                      lineHeight: titleLineHeight,
                      transform: `scaleX(${titleScaleX})`,
                      transformOrigin:
                        align === "right"
                          ? "right top"
                          : align === "center"
                            ? "center top"
                            : "left top",
                    }}
                  >
                    {take.text.titleUppercase ? title.toUpperCase() : title}
                  </p>
                )}
                {subtitle && (
                  <p
                    className="mt-2"
                    style={{
                      color: subtitleColor,
                      fontFamily: `"${subtitleFontFamily}", sans-serif`,
                      fontWeight: subtitleWeight,
                      fontSize: `${Math.max(7, subtitleSizeRel * 750)}px`,
                      lineHeight: subtitleLineHeight,
                      letterSpacing: `${subtitleTracking}em`,
                      transform: `scaleX(${subtitleScaleX})`,
                      transformOrigin:
                        align === "right"
                          ? "right top"
                          : align === "center"
                            ? "center top"
                            : "left top",
                    }}
                  >
                    {take.text.subtitleUppercase
                      ? subtitle.toUpperCase()
                      : subtitle}
                  </p>
                )}
              </div>
            </>
          )}
          {legacyTextEditingEnabled && (
            <span className="pointer-events-none absolute right-3 top-3 bg-white/90 px-2 py-1 text-[10px] font-semibold text-black shadow">
              Text im Bild ziehen
            </span>
          )}
          <span className="pointer-events-none absolute bottom-4 right-4 bg-white/90 px-2 py-1 text-[10px] font-semibold text-black shadow">
            9:16-Vorschau
          </span>
        </div>
      </div>

      <div className="space-y-7 p-5 md:p-7 xl:sticky xl:top-4 xl:max-h-[calc(100vh-2rem)] xl:self-start xl:overflow-y-auto">
        <div className="flex items-center justify-between gap-3 border-b border-border/70 pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              {index === 0
                ? "Opening"
                : index === total - 1
                  ? "Abschluss"
                  : `Szene ${index + 1}`}
            </p>
            <h3 className="mt-1 truncate text-xl font-semibold">
              {image.roomLabel ?? image.filename}
            </h3>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={index === 0}
              onClick={onPrevious}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={index === total - 1}
              onClick={onNext}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Dauer in Sekunden"
            type="number"
            min={0.6}
            max={10}
            step={0.1}
            value={durationSeconds}
            onChange={(event) => {
              const value = clampStillDuration(Number(event.target.value));
              setDurationSeconds(value);
              if (value < 1.2) setMotion("still");
            }}
          />
          <label className="space-y-2 text-sm font-medium">
            Übergang
            <select
              value={transitionIn}
              onChange={(event) =>
                setTransitionIn(
                  event.target.value as SharedStudioTake["transitionIn"],
                )
              }
              className="block w-full border border-border bg-background px-3 py-2.5"
            >
              <option value="cut">Harter Schnitt</option>
              <option value="crossfade">Crossfade 0,3 s</option>
              <option value="fadeFromBlack">Einblende von Schwarz</option>
            </select>
          </label>
        </div>

        <div
          className={`border px-4 py-3 text-xs leading-relaxed ${qualityNote.rating === "ungeeignet" ? "border-red-300 bg-red-50 text-red-900" : qualityNote.rating === "eingeschränkt" ? "border-amber-300 bg-amber-50 text-amber-900" : "border-emerald-200 bg-emerald-50 text-emerald-900"}`}
        >
          <span className="font-semibold">
            Qualitätscheck · {qualityNote.rating}:{" "}
          </span>
          {qualityNote.text}
        </div>

        {motionPanel}

        {analysis?.recommendation && (
          <div className="border border-primary/25 bg-primary/5 p-4 text-xs leading-relaxed">
            <p className="font-semibold">
              Analyse-Vorschlag · {analysis.taxonomy ?? "Motiv"}
            </p>
            <p className="mt-1 text-muted-foreground">
              {analysis.recommendation.reason}. {analysis.recommendation.detail}
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="mt-3"
              disabled={motionLocked || !analysis.recommendation.motion}
              onClick={() => {
                if (analysis.recommendation?.motion)
                  setMotion(analysis.recommendation.motion);
                const window = analysis.derived.safeCropWindows[0];
                if (window) {
                  const centerX = window.x + window.w / 2;
                  const centerY = window.y + window.h / 2;
                  setStartFrame({ ...startFrame, centerX, centerY });
                  setEndFrame({ ...endFrame, centerX, centerY });
                }
              }}
            >
              <Sparkles className="mr-2 h-4 w-4" /> Vorschlag einsetzen
            </Button>
          </div>
        )}

        <details className="hidden" aria-hidden="true">
          <summary className="cursor-pointer text-sm font-semibold">Vorhandenen Einzeltext übernehmen</summary>
          <p className="pt-3 text-xs text-muted-foreground">Nur für ältere Szenenstände. Neue Texte werden als unabhängige Typografie-Ebenen darunter angelegt.</p>
          <label className="flex items-center gap-3 text-sm font-semibold">
            <input
              type="checkbox"
              checked={textEnabled}
              onChange={(event) => setTextEnabled(event.target.checked)}
              className="h-4 w-4"
            />
            <Type className="h-4 w-4" /> Text direkt im Bild
          </label>
          {textEnabled && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Headline"
                  maxLength={120}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
                <Input
                  label="Unterzeile"
                  maxLength={180}
                  value={subtitle}
                  onChange={(event) => setSubtitle(event.target.value)}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Die Stilkarte setzt nur Ausgangswerte. Danach bleiben Schrift,
                Größe, Farbe, Laufweite, Breite und Position frei editierbar.
              </p>
              <div>
                <p className="mb-3 text-sm font-medium">Textstil</p>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {textStyleOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        setStyleId(option.id);
                        setTitleColor(option.color);
                        setSubtitleColor(option.color);
                        setFontFamily(canonicalFont(option.fontFamily));
                        setSubtitleFontFamily(
                          canonicalFont(
                            option.subtitleFontFamily ?? option.fontFamily,
                          ),
                        );
                        setTitleWeight(option.titleWeight);
                        setTitleSizeRel(option.titleSizeRel);
                        setSubtitleSizeRel(option.subtitleSizeRel ?? 0.028);
                        setMaxWidthRel(option.maxWidthRel);
                      }}
                      className={`p-3 text-left transition ${styleId === option.id ? "bg-foreground text-background ring-2 ring-primary/25" : "bg-muted/55 text-foreground hover:bg-muted"}`}
                    >
                      <span
                        className="block text-lg leading-tight"
                        style={typographyPreviewStyle(option.id)}
                      >
                        Aa · {option.label}
                      </span>
                      <span
                        className={`mt-1 block text-[11px] ${styleId === option.id ? "text-background/65" : "text-muted-foreground"}`}
                      >
                        {option.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-medium">
                  Textgröße
                  <input
                    type="range"
                    min={0.01}
                    max={0.2}
                    step={0.002}
                    value={titleSizeRel}
                    onChange={(event) =>
                      setTitleSizeRel(Number(event.target.value))
                    }
                    className="block w-full"
                  />
                </label>
                <label className="space-y-2 text-sm font-medium">
                  Textblock-Breite
                  <input
                    type="range"
                    min={0.2}
                    max={1}
                    step={0.01}
                    value={maxWidthRel}
                    onChange={(event) =>
                      setMaxWidthRel(Number(event.target.value))
                    }
                    className="block w-full"
                  />
                </label>
              </div>
              <details className="bg-muted/45 p-4">
                <summary className="cursor-pointer text-sm font-semibold">
                  Feineinstellungen · Typografie und Geometrie
                </summary>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <FontSelect
                    label="Schrift Headline"
                    value={fontFamily}
                    fonts={canonicalFonts}
                    onChange={setFontFamily}
                  />
                  <FontSelect
                    label="Schrift Unterzeile"
                    value={subtitleFontFamily}
                    fonts={canonicalFonts}
                    onChange={setSubtitleFontFamily}
                  />
                  <Input
                    label="Farbe Headline"
                    type="color"
                    value={titleColor}
                    onChange={(event) =>
                      setTitleColor(event.target.value.toUpperCase())
                    }
                  />
                  <Input
                    label="Farbe Unterzeile"
                    type="color"
                    value={subtitleColor}
                    onChange={(event) =>
                      setSubtitleColor(event.target.value.toUpperCase())
                    }
                  />
                  <Input
                    label="Headline Punktgröße (bei 1080 × 1920)"
                    type="number"
                    min={19}
                    max={384}
                    step={1}
                    value={Math.round(titleSizeRel * 1920)}
                    onChange={(event) =>
                      setTitleSizeRel(Number(event.target.value) / 1920)
                    }
                  />
                  <Input
                    label="Unterzeile Punktgröße (bei 1080 × 1920)"
                    type="number"
                    min={15}
                    max={288}
                    step={1}
                    value={Math.round(subtitleSizeRel * 1920)}
                    onChange={(event) =>
                      setSubtitleSizeRel(Number(event.target.value) / 1920)
                    }
                  />
                  <Input
                    label="Headline Stärke"
                    type="number"
                    min={100}
                    max={900}
                    step={100}
                    value={titleWeight}
                    onChange={(event) =>
                      setTitleWeight(Number(event.target.value))
                    }
                  />
                  <Input
                    label="Unterzeile Stärke"
                    type="number"
                    min={100}
                    max={900}
                    step={100}
                    value={subtitleWeight}
                    onChange={(event) =>
                      setSubtitleWeight(Number(event.target.value))
                    }
                  />
                  <Input
                    label="Laufweite Headline (em)"
                    type="number"
                    min={-0.1}
                    max={0.3}
                    step={0.01}
                    value={titleTracking}
                    onChange={(event) =>
                      setTitleTracking(Number(event.target.value))
                    }
                  />
                  <Input
                    label="Laufweite Unterzeile (em)"
                    type="number"
                    min={-0.1}
                    max={0.3}
                    step={0.01}
                    value={subtitleTracking}
                    onChange={(event) =>
                      setSubtitleTracking(Number(event.target.value))
                    }
                  />
                  <Input
                    label="Weite Headline"
                    type="number"
                    min={0.5}
                    max={2}
                    step={0.05}
                    value={titleScaleX}
                    onChange={(event) =>
                      setTitleScaleX(Number(event.target.value))
                    }
                  />
                  <Input
                    label="Weite Unterzeile"
                    type="number"
                    min={0.5}
                    max={2}
                    step={0.05}
                    value={subtitleScaleX}
                    onChange={(event) =>
                      setSubtitleScaleX(Number(event.target.value))
                    }
                  />
                  <Input
                    label="Zeilenhöhe Headline"
                    type="number"
                    min={0.8}
                    max={2}
                    step={0.05}
                    value={titleLineHeight}
                    onChange={(event) =>
                      setTitleLineHeight(Number(event.target.value))
                    }
                  />
                  <Input
                    label="Zeilenhöhe Unterzeile"
                    type="number"
                    min={0.8}
                    max={2}
                    step={0.05}
                    value={subtitleLineHeight}
                    onChange={(event) =>
                      setSubtitleLineHeight(Number(event.target.value))
                    }
                  />
                  <Input
                    label="Textblock-Breite"
                    type="number"
                    min={0.2}
                    max={1}
                    step={0.01}
                    value={maxWidthRel}
                    onChange={(event) =>
                      setMaxWidthRel(Number(event.target.value))
                    }
                  />
                  <Input
                    label="Deckkraft"
                    type="number"
                    min={0}
                    max={1}
                    step={0.05}
                    value={opacity}
                    onChange={(event) => setOpacity(Number(event.target.value))}
                  />
                  <Input
                    label="Drehung in Grad"
                    type="number"
                    min={-180}
                    max={180}
                    step={1}
                    value={rotationDeg}
                    onChange={(event) =>
                      setRotationDeg(Number(event.target.value))
                    }
                  />
                  <Input
                    label="Position horizontal (0–1)"
                    type="number"
                    min={safeAreaLock ? 0.08 : 0}
                    max={safeAreaLock ? Math.max(0.08, 0.92 - maxWidthRel) : 1}
                    step={0.01}
                    value={x}
                    onChange={(event) => setX(Number(event.target.value))}
                  />
                  <Input
                    label="Position vertikal, volle Höhe (0–1)"
                    type="number"
                    min={safeAreaLock ? 0.14 : 0}
                    max={safeAreaLock ? 0.8 : 1}
                    step={0.01}
                    value={y}
                    onChange={(event) => setY(Number(event.target.value))}
                  />
                  <label className="space-y-2 text-sm font-medium">
                    Ausrichtung
                    <select
                      value={align}
                      onChange={(event) =>
                        setAlign(event.target.value as typeof align)
                      }
                      className="block w-full border border-border bg-background px-3 py-2.5"
                    >
                      <option value="left">Links</option>
                      <option value="center">Zentriert</option>
                      <option value="right">Rechts</option>
                    </select>
                  </label>
                  <label className="flex items-center gap-2 self-end pb-2 text-sm font-medium">
                    <input
                      type="checkbox"
                      checked={safeAreaLock}
                      onChange={(event) => {
                        setSafeAreaLock(event.target.checked);
                        if (event.target.checked) {
                          setX((value) => safeTextX(value, maxWidthRel));
                          setY((value) => Math.min(0.8, Math.max(0.14, value)));
                        }
                      }}
                    />{" "}
                    Sicheren Bereich festhalten
                  </label>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  „Hinter Objekt“ wird erst angeboten, sobald ein geprüfter
                  Layer-/Maskenpfad verfügbar ist. Aktuell liegt Text bewusst im
                  Vordergrund.
                </p>
              </details>
            </>
          )}
        </details>

        <details className="border-t border-border/70 pt-5">
          <summary className="cursor-pointer text-sm font-semibold">
            Bildausschnitt fein einstellen
          </summary>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {(["centerX", "centerY", "scale"] as const).map((field) => (
              <Input
                key={`start-${field}`}
                label={`Start ${frameLabel(field)}`}
                type="number"
                min={field === "scale" ? 1 : 0}
                max={field === "scale" ? maximumScale : 1}
                step={0.01}
                value={startFrame[field]}
                onChange={(event) =>
                  setStartFrame({
                    ...startFrame,
                    [field]: Math.min(
                      field === "scale" ? maximumScale : 1,
                      Math.max(
                        field === "scale" ? 1 : 0,
                        Number(event.target.value),
                      ),
                    ),
                  })
                }
              />
            ))}
            {(["centerX", "centerY", "scale"] as const).map((field) => (
              <Input
                key={`end-${field}`}
                label={`Ende ${frameLabel(field)}`}
                type="number"
                min={field === "scale" ? 1 : 0}
                max={field === "scale" ? maximumScale : 1}
                step={0.01}
                value={endFrame[field]}
                onChange={(event) =>
                  setEndFrame({
                    ...endFrame,
                    [field]: Math.min(
                      field === "scale" ? maximumScale : 1,
                      Math.max(
                        field === "scale" ? 1 : 0,
                        Number(event.target.value),
                      ),
                    ),
                  })
                }
              />
            ))}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <CropPreview
              label="Startausschnitt"
              image={image}
              frame={startFrame}
              safeArea={showSafeArea}
            />
            <CropPreview
              label="Endausschnitt"
              image={image}
              frame={endFrame}
              safeArea={showSafeArea}
            />
          </div>
          <label className="mt-4 flex items-center gap-2 text-xs font-medium">
            <input
              type="checkbox"
              checked={showSafeArea}
              onChange={(event) => setShowSafeArea(event.target.checked)}
            />{" "}
            Sicheren Textbereich einblenden
          </label>
        </details>

        <div className="flex items-center justify-between border-t border-border/70 pt-5">
          <SaveIndicator status={saveStatus} />
          <div className="flex items-center gap-3">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!sceneHistory.canUndo}
              onClick={sceneHistory.undo}
            >
              <Undo2 className="mr-2 h-4 w-4" /> Rückgängig
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!sceneHistory.canRedo}
              onClick={sceneHistory.redo}
            >
              <Redo2 className="mr-2 h-4 w-4" /> Wiederholen
            </Button>
            <p className="text-xs text-muted-foreground">
              Änderungen werden nach 800 ms automatisch gespeichert.
            </p>
            <Button
              type="button"
              size="sm"
              variant={take.reviewedAt ? "outline" : "default"}
              disabled={saveStatus !== "saved"}
              onClick={() => onReview(take.id)}
            >
              <Check className="mr-2 h-4 w-4" />
              {take.reviewedAt ? "Bestätigt" : "Szene bestätigen"}
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

function typographyPreviewStyle(styleId: TextStyleId): CSSProperties {
  const style = textStyleOptions.find((candidate) => candidate.id === styleId)!;
  return {
    fontFamily: style.fontFamily,
    fontWeight: style.titleWeight,
    letterSpacing:
      styleId === 3
        ? "0.18em"
        : styleId === 4
          ? "0.04em"
          : styleId === 6
            ? "0.06em"
            : styleId === 1
              ? "-0.01em"
              : "0",
    textTransform: style.titleUppercase ? "uppercase" : undefined,
  };
}

function useEditorHistory<T>(snapshot: T, apply: (snapshot: T) => void) {
  const present = useRef(snapshot);
  const presentSignature = useRef(JSON.stringify(snapshot));
  const past = useRef<T[]>([]);
  const future = useRef<T[]>([]);
  const applying = useRef(false);
  const [availability, setAvailability] = useState({
    canUndo: false,
    canRedo: false,
  });
  const signature = JSON.stringify(snapshot);

  useEffect(() => {
    if (applying.current) {
      applying.current = false;
      present.current = snapshot;
      presentSignature.current = signature;
      return;
    }
    if (signature === presentSignature.current) return;
    const timer = window.setTimeout(() => {
      past.current = [...past.current.slice(-49), present.current];
      present.current = snapshot;
      presentSignature.current = signature;
      future.current = [];
      setAvailability({ canUndo: true, canRedo: false });
    }, 250);
    return () => window.clearTimeout(timer);
  }, [signature, snapshot]);

  function undo() {
    const previous = past.current.pop();
    if (!previous) return;
    future.current.push(present.current);
    present.current = previous;
    presentSignature.current = JSON.stringify(previous);
    applying.current = true;
    apply(previous);
    setAvailability({
      canUndo: past.current.length > 0,
      canRedo: true,
    });
  }

  function redo() {
    const next = future.current.pop();
    if (!next) return;
    past.current.push(present.current);
    present.current = next;
    presentSignature.current = JSON.stringify(next);
    applying.current = true;
    apply(next);
    setAvailability({
      canUndo: true,
      canRedo: future.current.length > 0,
    });
  }

  return {
    ...availability,
    undo,
    redo,
  };
}

function FontSelect({
  label,
  value,
  fonts,
  onChange,
}: {
  label: string;
  value: string;
  fonts: VideoStudioFont[];
  onChange: (value: string) => void;
}) {
  const groups = [...new Set(fonts.map((font) => font.group))];
  return (
    <label className="space-y-2 text-sm font-medium">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="block w-full border border-border bg-background px-3 py-2.5"
      >
        {groups.map((group) => (
          <optgroup key={group} label={group[0].toUpperCase() + group.slice(1)}>
            {fonts
              .filter((font) => font.group === group)
              .map((font) => (
                <option
                  key={font.family}
                  value={font.family}
                  style={{ fontFamily: `"${font.family}", ${font.fallback}` }}
                >
                  {font.label}
                </option>
              ))}
          </optgroup>
        ))}
      </select>
    </label>
  );
}

function canonicalFont(cssFamily: string) {
  return cssFamily
    .split(",")[0]
    .trim()
    .replace(/^['"]|['"]$/g, "");
}

function legacyTextStyleId(
  preset?: NonNullable<SharedStudioTake["text"]["typography"]>["preset"],
): TextStyleId {
  if (preset === "editorial") return 2;
  if (preset === "architecture") return 3;
  if (preset === "warm") return 5;
  return 1;
}

function legacyPresetForTextStyle(
  styleId: TextStyleId,
): NonNullable<SharedStudioTake["text"]["typography"]>["preset"] {
  if (styleId === 2) return "editorial";
  if (styleId === 3 || styleId === 4 || styleId === 6) return "architecture";
  if (styleId === 5) return "warm";
  return "quiet";
}

function safeTextX(value: number, maxWidthRel: number) {
  return Math.min(Math.max(0.08, 0.92 - maxWidthRel), Math.max(0.08, value));
}

function frameLabel(field: "centerX" | "centerY" | "scale") {
  if (field === "centerX") return "horizontal";
  if (field === "centerY") return "vertikal";
  return "Zoom";
}

function cropFrameFromSpec(crop: {
  cx: number;
  cy: number;
  zoom: number;
}): SharedStudioTake["startFrame"] {
  return { centerX: crop.cx, centerY: crop.cy, scale: crop.zoom };
}

function motionLabel(motion: SharedStudioTake["motion"]) {
  return motionOptions.find(([id]) => id === motion)?.[1] ?? motion;
}

function motionSuggestion(
  image: ImageItem,
  index: number,
  total: number,
): { motion: SharedStudioTake["motion"]; reason: string } {
  const context =
    `${image.roomLabel ?? ""} ${image.description ?? ""} ${image.filename}`.toLowerCase();
  if (index === 0)
    return {
      motion: "move_away",
      reason:
        "Das Startmotiv darf den Ort ruhig eröffnen und zunächst Orientierung geben.",
    };
  if (index === total - 1)
    return {
      motion: "move_closer",
      reason: "Ein sanftes Annähern gibt dem Abschluss einen klaren Zielpunkt.",
    };
  if (/fluss|wasser|see|ufer|bach/.test(context))
    return {
      motion: "glide_right",
      reason:
        "Die seitliche Bewegung folgt der natürlichen Richtung von Wasser und Ufer.",
    };
  if (/flur|diele|gang|treppe/.test(context))
    return {
      motion: "move_closer",
      reason:
        "Die Raumtiefe eignet sich für eine zurückhaltende Vorwärtsbewegung.",
    };
  if (/balkon|terrasse|aussicht|panorama/.test(context))
    return {
      motion: "glide_left",
      reason: "Eine seitliche Fahrt lässt Aussicht und Breite lesbar werden.",
    };
  if (image.role === "detail")
    return {
      motion: "detail_drift",
      reason:
        "Das Detail verträgt eine kurze, präzise Bewegung ohne starken Zuschnitt.",
    };
  if (image.role === "exterior")
    return {
      motion: "move_away",
      reason:
        "Das Außenmotiv gewinnt durch ein leichtes Öffnen, ohne Architektur zu verformen.",
    };
  if (image.width && image.height && image.width / image.height < 1.25)
    return {
      motion: "look_up",
      reason:
        "Der knappere Querformat-Spielraum spricht gegen starken Zoom; eine vertikale Fahrt bleibt qualitätsschonend.",
    };
  return {
    motion: index % 2 === 0 ? "glide_right" : "glide_left",
    reason:
      "Eine ruhige seitliche Fahrt nutzt die Bildbreite und vermeidet monotone Wiederholungen.",
  };
}

function cropMotionPreviewStyle(
  start: SharedStudioTake["startFrame"],
  end: SharedStudioTake["endFrame"],
  durationSeconds: number,
  locked: boolean,
  parameters?: NonNullable<SharedStudioTake["motionSpec"]>["parameters"],
) {
  const final = locked ? start : end;
  const rotationStart = locked ? 0 : (parameters?.rotationStartDeg ?? 0);
  const rotationEnd = locked ? rotationStart : (parameters?.rotationEndDeg ?? rotationStart);
  const holdStartSeconds = locked ? 0 : Math.max(0, parameters?.holdStartSeconds ?? 0);
  const holdEndSeconds = locked ? 0 : Math.max(0, parameters?.holdEndSeconds ?? 0);
  const movementSeconds = Math.max(0.001, durationSeconds - holdStartSeconds - holdEndSeconds);
  return {
    "--motion-from": `scale(${start.scale}) rotate(${rotationStart}deg)`,
    "--motion-to": `scale(${final.scale}) rotate(${rotationEnd}deg)`,
    "--position-from": `${start.centerX * 100}% ${start.centerY * 100}%`,
    "--position-to": `${final.centerX * 100}% ${final.centerY * 100}%`,
    "--motion-duration": `${movementSeconds}s`,
    "--motion-delay": `${holdStartSeconds}s`,
    "--motion-easing": cssMotionEasing(parameters?.easing),
    transform: `scale(${start.scale}) rotate(${rotationStart}deg)`,
    objectPosition: `${start.centerX * 100}% ${start.centerY * 100}%`,
  } as CSSProperties;
}

function cssMotionEasing(
  easing: NonNullable<NonNullable<SharedStudioTake["motionSpec"]>["parameters"]>["easing"] | undefined,
) {
  switch (easing) {
    case "linear": return "linear";
    case "ease_in": return "cubic-bezier(.42,0,1,1)";
    case "ease_out": return "cubic-bezier(0,0,.58,1)";
    case "cinematic_accelerate": return "cubic-bezier(.55,.05,.9,.35)";
    case "cinematic_decelerate": return "cubic-bezier(.1,.65,.25,1)";
    case "cinematic_slow": return "cubic-bezier(.35,0,.25,1)";
    case "smooth":
    case "ease_in_out":
    default: return "ease-in-out";
  }
}

function SourceFramePreview({
  label,
  image,
  frame,
  maximumScale,
  color,
  onChange,
}: {
  label: string;
  image: ImageItem;
  frame: SharedStudioTake["startFrame"];
  maximumScale: number;
  color: string;
  onChange: (frame: SharedStudioTake["startFrame"]) => void;
}) {
  const scaleStart = useRef<{ clientX: number; scale: number } | null>(null);
  const crop =
    image.width && image.height
      ? normalizedCrop(image.width, image.height, frame)
      : null;
  return (
    <div>
      <p className="mb-2 flex items-center justify-between text-xs font-semibold text-white"><span>{label}-Rahmen · im Original ziehen</span><span style={{ color }}>{frame.scale.toFixed(2)}×</span></p>
      <div
        className="relative max-h-[31vh] w-full touch-none overflow-hidden bg-black"
        style={{
          aspectRatio:
            image.width && image.height ? image.width / image.height : 4 / 3,
        }}
      >
        <img
          src={image.previewUrl}
          alt={`${label} im Original: ${image.roomLabel ?? image.filename}`}
          className="h-full w-full object-contain"
        />
        {crop && (
          <div
            className="absolute cursor-move border-2 shadow-[0_0_0_999px_rgba(0,0,0,0.4)]"
            style={{
              left: `${crop.x * 100}%`,
              top: `${crop.y * 100}%`,
              width: `${crop.w * 100}%`,
              height: `${crop.h * 100}%`,
              borderColor: color,
            }}
            aria-label={`${label}-Rahmen im Originalbild`}
            onPointerDown={(event) => {
              if ((event.target as HTMLElement).dataset.scaleHandle) return;
              event.stopPropagation();
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={(event) => {
              if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
              const canvas = event.currentTarget.parentElement?.getBoundingClientRect();
              if (!canvas || !image.width || !image.height) return;
              onChange(clampInteractiveFrame({
                centerX: (event.clientX - canvas.left) / canvas.width,
                centerY: (event.clientY - canvas.top) / canvas.height,
                scale: frame.scale,
                maximumScale,
                sourceWidth: image.width,
                sourceHeight: image.height,
              }));
            }}
          >
            <span className="pointer-events-none absolute left-1 top-1 px-1.5 py-0.5 text-[9px] font-bold text-black" style={{ backgroundColor: color }}>{label}</span>
            <button
              type="button"
              data-scale-handle="true"
              aria-label={`${label}-Rahmen vergrößern oder verkleinern`}
              className="absolute -bottom-2 -right-2 h-5 w-5 cursor-nwse-resize border-2 border-black"
              style={{ backgroundColor: color }}
              onPointerDown={(event) => {
                event.stopPropagation();
                scaleStart.current = { clientX: event.clientX, scale: frame.scale };
                event.currentTarget.setPointerCapture(event.pointerId);
              }}
              onPointerMove={(event) => {
                if (!event.currentTarget.hasPointerCapture(event.pointerId) || !scaleStart.current || !image.width || !image.height) return;
                const canvas = event.currentTarget.parentElement?.parentElement?.getBoundingClientRect();
                if (!canvas) return;
                const nextScale = scaleStart.current.scale - ((event.clientX - scaleStart.current.clientX) / canvas.width) * Math.max(1, maximumScale);
                onChange(clampInteractiveFrame({
                  centerX: frame.centerX,
                  centerY: frame.centerY,
                  scale: nextScale,
                  maximumScale,
                  sourceWidth: image.width,
                  sourceHeight: image.height,
                }));
              }}
              onPointerUp={() => { scaleStart.current = null; }}
              onPointerCancel={() => { scaleStart.current = null; }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function CropPreview({
  label,
  image,
  frame,
  safeArea,
}: {
  label: string;
  image: ImageItem;
  frame: SharedStudioTake["startFrame"];
  safeArea: boolean;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold">{label}</p>
      <div className="relative aspect-[9/16] max-h-64 overflow-hidden bg-black">
        <img
          src={image.previewUrl}
          alt={`${label}: ${image.roomLabel ?? image.filename}`}
          className="h-full w-full object-cover"
          style={{
            objectPosition: `${frame.centerX * 100}% ${frame.centerY * 100}%`,
            transform: `scale(${frame.scale})`,
          }}
        />
        {safeArea && (
          <div
            className="pointer-events-none absolute border border-dashed border-white/70"
            style={{ top: "14%", bottom: "20%", left: "8%", right: "8%" }}
          />
        )}
      </div>
    </div>
  );
}

function sourceQualityNote(
  image: ImageItem,
  durationSeconds: number,
  startScale: number,
  endScale: number,
  cutRisk: string[],
) {
  if (!image.width || !image.height)
    return {
      rating: "ungeeignet" as const,
      rNative: 0,
      text: "Die Quellauflösung fehlt; Bewegung bleibt gesperrt, bis die native Größe bekannt ist.",
    };
  const quality = sourceFrameQuality(
    image.width,
    image.height,
    startScale,
    endScale,
  );
  const { rNative } = quality;
  let { rating } = quality;
  if (cutRisk.length && rating === "sicher") rating = "eingeschränkt";
  const reasons = [
    `r = ${rNative.toFixed(2)} bei ${image.width} × ${image.height} Pixeln`,
    rating === "ungeeignet"
      ? "der Zoom unterschreitet die native Ausgabeauflösung und wird gedeckelt"
      : rating === "eingeschränkt"
        ? "zulässig, aber ohne sichere 30-%-Reserve"
        : "mindestens 30 % native Reserve",
    durationSeconds < 1.2
      ? "unter 1,2 s bleibt die Szene ruhig"
      : "Bewegung ist zeitlich zulässig",
    cutRisk.length
      ? `Anschnittrisiko: ${cutRisk.join(", ")}`
      : "kein bekanntes Anschnittrisiko",
  ];
  return { rating, rNative, text: reasons.join(" · ") };
}

function analysisCutRisks(
  image: ImageItem,
  start: SharedStudioTake["startFrame"],
  end: SharedStudioTake["endFrame"],
  analysis: SharedAssetAnalysis,
) {
  if (!image.width || !image.height) return [];
  const frames = [
    normalizedCrop(image.width, image.height, start),
    normalizedCrop(image.width, image.height, end),
  ];
  const candidates = [
    ...analysis.instances.map((instance) => ({
      label: instance.label,
      bbox: instance.bbox,
    })),
    ...analysis.derived.cutRiskEdges,
  ];
  return [
    ...new Set(
      candidates
        .filter((candidate) =>
          frames.some(
            (frame) =>
              rectanglesIntersect(frame, candidate.bbox) &&
              !rectangleContains(frame, candidate.bbox),
          ),
        )
        .map((candidate) => candidate.label),
    ),
  ];
}

function normalizedCrop(
  width: number,
  height: number,
  frame: SharedStudioTake["startFrame"],
) {
  const h = Math.min(1, 1 / frame.scale);
  const w = Math.min(1, (height * h * (9 / 16)) / width);
  return {
    x: Math.max(0, Math.min(1 - w, frame.centerX - w / 2)),
    y: Math.max(0, Math.min(1 - h, frame.centerY - h / 2)),
    w,
    h,
  };
}

function rectanglesIntersect(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
) {
  return (
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
  );
}

function rectangleContains(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
) {
  return (
    b.x >= a.x && b.y >= a.y && b.x + b.w <= a.x + a.w && b.y + b.h <= a.y + a.h
  );
}

function SaveIndicator({
  status,
  dark = false,
}: {
  status: SaveStatus;
  dark?: boolean;
}) {
  const label =
    status === "saved"
      ? "Gespeichert"
      : status === "pending"
        ? "Änderung vorgemerkt"
        : status === "saving"
          ? "Speichert …"
          : "Speichern fehlgeschlagen";
  const color =
    status === "error"
      ? "text-red-300"
      : dark
        ? "text-white/65"
        : "text-muted-foreground";
  return (
    <span
      className={`inline-flex items-center gap-2 text-xs font-semibold ${color}`}
      aria-live="polite"
    >
      {status === "saving" || status === "pending" ? (
        <Loader2
          className={`h-3.5 w-3.5 ${status === "saving" ? "animate-spin" : ""}`}
        />
      ) : (
        <Check className="h-3.5 w-3.5" />
      )}
      {label}
    </span>
  );
}

function draftTake(
  assetId: string,
  index: number,
  total: number,
  rhythmPatternId: RhythmPatternId,
): SharedStudioTake {
  const movesCloser = index % 2 === 0;
  const patternDurations = rhythmPatterns[rhythmPatternId].durations;
  const durationSeconds = patternDurations[index % patternDurations.length];
  return {
    id: `draft_${assetId}`,
    sourceAssetId: assetId,
    order: index + 1,
    role: index === 0 ? "intro" : index === total - 1 ? "outro" : "body",
    durationSeconds,
    durationSource: "pattern",
    transitionIn: "cut",
    transitionInSeconds: 0,
    motion:
      durationSeconds < 1.2
        ? "still"
        : movesCloser
          ? "move_closer"
          : "move_away",
    startFrame: { centerX: 0.5, centerY: 0.5, scale: movesCloser ? 1 : 1.1 },
    endFrame: { centerX: 0.5, centerY: 0.5, scale: movesCloser ? 1.1 : 1 },
    text: {
      enabled: false,
      typography: { preset: "editorial", align: "left" },
    },
  };
}

function effectiveTransitionSeconds(
  previous: SharedStudioTake | undefined,
  current: SharedStudioTake,
) {
  if (
    !previous ||
    current.transitionIn !== "crossfade" ||
    previous.durationSeconds < 1.5 ||
    current.durationSeconds < 1.5
  )
    return 0;
  return Math.min(
    0.3,
    current.transitionInSeconds || 0.3,
    0.25 * Math.min(previous.durationSeconds, current.durationSeconds),
  );
}

function timelineStart(takes: SharedStudioTake[], targetIndex: number) {
  let cursor = 0;
  for (let index = 0; index < takes.length; index += 1) {
    const start =
      cursor - effectiveTransitionSeconds(takes[index - 1], takes[index]);
    if (index === targetIndex) return start;
    cursor = start + takes[index].durationSeconds;
  }
  return cursor;
}

function timelineDuration(takes: SharedStudioTake[]) {
  if (!takes.length) return 0;
  const lastIndex = takes.length - 1;
  return timelineStart(takes, lastIndex) + takes[lastIndex].durationSeconds;
}

function sceneAtSeconds(scenes: SharedSceneSpec["scenes"], seconds: number) {
  let cursor = 0;
  let selected = scenes[0];
  for (const scene of scenes) {
    const overlap =
      scene.transitionIn === "crossfade" ? scene.transitionInSeconds : 0;
    const start = cursor - overlap;
    if (seconds + 0.0001 >= start) selected = scene;
    cursor = start + scene.durationSeconds;
  }
  return selected;
}

function previewSceneNumber(
  scenes: SharedSceneSpec["scenes"],
  seconds: number,
) {
  const scene = sceneAtSeconds(scenes, seconds);
  return Math.max(1, scenes.findIndex((candidate) => candidate === scene) + 1);
}

function formatSeconds(seconds: number) {
  return `${String(seconds).replace(".", ",")} s`;
}

function arraysEqual(left: string[], right: string[]) {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

function orderedTakes(project: SharedStudioProject) {
  return [...project.takes].sort((left, right) => left.order - right.order);
}

function initialSelection(project: SharedStudioProject) {
  const persisted = orderedTakes(project).map((take) => take.sourceAssetId);
  const untouchedSourceInitialization =
    project.revision === 2 && persisted.length === project.assets.length;
  const legacyAutomaticBriefing =
    project.revision === 3 &&
    persisted.length < project.assets.length &&
    project.takes.some((take) => take.text.enabled);
  return untouchedSourceInitialization || legacyAutomaticBriefing
    ? []
    : persisted;
}

async function studioFetch<T>(
  projectId: string,
  suffix: string,
  init: RequestInit,
) {
  const headers = new Headers(init.headers);
  if (init.body) headers.set("content-type", "application/json");
  const response = await fetch(
    `/api/video-studio/shared/projects/${encodeURIComponent(projectId)}${suffix}`,
    { ...init, headers },
  );
  const payload = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new StudioClientError(
      response.status,
      payload.error ?? "Die Änderung konnte nicht gespeichert werden.",
      payload.code,
    );
  return payload as T;
}

class StudioClientError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly code?: string,
  ) {
    super(message);
    this.name = "StudioClientError";
  }
}

function isRevisionConflict(error: unknown) {
  return (
    error instanceof StudioClientError &&
    error.status === 409 &&
    error.code === "revision_conflict"
  );
}

function message(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Die Änderung konnte nicht gespeichert werden.";
}
