"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  CircleDot,
  GripVertical,
  Maximize2,
  Minimize2,
  Play,
  Redo2,
  RotateCw,
  Search,
  Sparkles,
  Trash2,
  Undo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StudioSourceImage } from "@/lib/central-video-studio";
import type { SharedStudioProject, SharedStudioTake } from "@/lib/shared-video-studio";
import {
  VIDEO_STUDIO_MOTION_CATALOG,
  RENDERABLE_SOURCE_MOTION_IDS,
  AI_STUDIO_PROPOSALS,
  createTypographyElement,
  isSelectableAiStudioProposal,
  normalizeTypographyElement,
  scaleTypographyGeometry,
  snapTypographyPosition,
  softTargetStatus,
  typographyExitWindowMs,
  typographyRotationDegrees,
  type StudioSceneLayer,
  type StudioMotionDefinition,
  type StudioTypographyElement,
} from "@/lib/video-studio-workflow";

export function GalleryStage({
  images,
  orderedAssetIds,
  onToggle,
  onContinue,
}: {
  images: StudioSourceImage[];
  orderedAssetIds: string[];
  onToggle: (assetId: string) => void;
  onContinue: () => void;
}) {
  const [role, setRole] = useState<StudioSourceImage["role"] | "all">("all");
  const visible = role === "all" ? images : images.filter((image) => image.role === role);
  const selectedIndex = useMemo(
    () => new Map(orderedAssetIds.map((assetId, index) => [assetId, index + 1])),
    [orderedAssetIds],
  );
  return (
    <section data-workflow-stage="gallery" className="space-y-5">
      <div className="flex flex-col gap-4 border-b border-border/70 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">2 · Bildbank</p>
          <h2 className="mt-2 text-2xl font-semibold">Alle Originalmotive des Auftrags</h2>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Hier wird nur ausgewählt. Reihenfolge, Zuschnitt, Dauer und Bewegung folgen erst in den nächsten Bereichen.
          </p>
        </div>
        <Button disabled={!orderedAssetIds.length} onClick={onContinue}>
          {orderedAssetIds.length} Bilder in die Timeline
        </Button>
      </div>
      <div className="flex flex-wrap gap-2" aria-label="Galerie filtern">
        {(["all", "exterior", "interior", "detail"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setRole(value)}
            className={`border px-3 py-1.5 text-xs font-semibold ${role === value ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}
          >
            {value === "all" ? "Alle" : roleLabel(value)}
          </button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visible.map((image) => {
          const position = selectedIndex.get(image.id);
          return (
            <button
              key={image.id}
              type="button"
              aria-pressed={Boolean(position)}
              onClick={() => onToggle(image.id)}
              className={`group overflow-hidden border bg-card text-left ${position ? "border-primary ring-2 ring-primary/15" : "border-border hover:border-primary/50"}`}
            >
              <div className="relative flex aspect-[4/3] items-center justify-center bg-black/95">
                <img src={image.previewUrl} alt={image.roomLabel ?? image.filename} className="h-full w-full object-contain" />
                {position && (
                  <span className="absolute left-3 top-3 flex h-8 min-w-8 items-center justify-center rounded-full bg-primary px-2 text-sm font-bold text-primary-foreground">
                    {position}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-3 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{image.roomLabel ?? image.filename}</p>
                  <p className="text-xs text-muted-foreground">{roleLabel(image.role)}</p>
                </div>
                {position && <Check className="h-5 w-5 shrink-0 text-primary" />}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function SortingTimelineStage({
  imagesById,
  orderedAssetIds,
  actualSeconds,
  targetSeconds,
  canUndo,
  canRedo,
  onMoveTo,
  onRemove,
  onUndo,
  onRedo,
  onBack,
  onContinue,
}: {
  imagesById: Map<string, StudioSourceImage>;
  orderedAssetIds: string[];
  actualSeconds: number;
  targetSeconds: number;
  canUndo: boolean;
  canRedo: boolean;
  onMoveTo: (assetId: string, index: number) => void;
  onRemove: (assetId: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const target = softTargetStatus(actualSeconds, targetSeconds);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const pointerDrag = useRef<{ assetId: string; targetIndex: number } | null>(null);
  return (
    <section data-workflow-stage="timeline" className="space-y-5">
      <div className="flex flex-col gap-4 border-b border-border/70 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">3 · Sortier-Timeline</p>
          <h2 className="mt-2 text-2xl font-semibold">Bildgeschichte festlegen</h2>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Nur Reihenfolge: vollständige Originalmotive ziehen oder über die Positionsnummer verschieben. Noch kein 9:16, kein Crop und keine Bewegung.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={onBack}>Bilder ändern</Button>
          <Button variant="outline" disabled={!canUndo} onClick={onUndo}><Undo2 className="mr-2 h-4 w-4" />Rückgängig</Button>
          <Button variant="outline" disabled={!canRedo} onClick={onRedo}><Redo2 className="mr-2 h-4 w-4" />Wiederholen</Button>
          <Button disabled={!orderedAssetIds.length} onClick={onContinue}>Szenen bearbeiten</Button>
        </div>
      </div>
      <div className={`border p-4 text-sm ${target.withinTolerance ? "border-emerald-300 bg-emerald-50 text-emerald-950" : "border-amber-300 bg-amber-50 text-amber-950"}`}>
        Aktuell {actualSeconds.toFixed(1)} s · weiches Ziel {targetSeconds.toFixed(0)} s · Abweichung {target.differenceSeconds > 0 ? "+" : ""}{target.differenceSeconds.toFixed(1)} s.
        <strong className="ml-1">Die Werkstatt kürzt niemals automatisch.</strong>
      </div>
      <ol className="flex min-h-64 gap-3 overflow-x-auto border-y border-border/70 py-5">
        {!orderedAssetIds.length && (
          <li className="flex w-full items-center justify-center border border-dashed border-border p-8 text-sm text-muted-foreground">
            Die Timeline ist leer. Wähle in der Bildbank mindestens ein Motiv aus.
          </li>
        )}
        {orderedAssetIds.map((assetId, index) => {
          const image = imagesById.get(assetId);
          if (!image) return null;
          return (
            <li
              key={assetId}
              data-timeline-index={index}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                const assetIdToMove = draggedId ?? event.dataTransfer.getData("text/plain");
                if (assetIdToMove) onMoveTo(assetIdToMove, index);
                setDraggedId(null);
              }}
              className={`w-52 shrink-0 border bg-card ${draggedId === assetId ? "opacity-50" : ""}`}
            >
              <div className="flex h-10 items-center justify-between border-b border-border px-3">
                <label className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
                  Pos.
                  <select
                    aria-label={`Position von ${image.roomLabel ?? image.filename}`}
                    value={index + 1}
                    onChange={(event) => onMoveTo(assetId, Number(event.target.value) - 1)}
                    className="border border-border bg-background px-1.5 py-1 text-xs font-bold text-foreground"
                  >
                    {orderedAssetIds.map((_, optionIndex) => <option key={optionIndex} value={optionIndex + 1}>{optionIndex + 1}</option>)}
                  </select>
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    draggable
                    aria-grabbed={draggedId === assetId}
                    aria-label={`Motiv ${index + 1} ziehen`}
                    className="cursor-grab touch-none p-1 text-muted-foreground active:cursor-grabbing"
                    onDragStart={(event) => {
                      setDraggedId(assetId);
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData("text/plain", assetId);
                    }}
                    onDragEnd={() => setDraggedId(null)}
                    onPointerDown={(event) => {
                      if (event.pointerType === "mouse") return;
                      pointerDrag.current = { assetId, targetIndex: index };
                      setDraggedId(assetId);
                      event.currentTarget.setPointerCapture(event.pointerId);
                    }}
                    onPointerMove={(event) => {
                      if (!pointerDrag.current || event.pointerType === "mouse") return;
                      const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-timeline-index]");
                      const targetIndex = Number(target?.dataset.timelineIndex);
                      if (Number.isInteger(targetIndex)) pointerDrag.current.targetIndex = targetIndex;
                    }}
                    onPointerUp={(event) => {
                      const gesture = pointerDrag.current;
                      if (!gesture || event.pointerType === "mouse") return;
                      pointerDrag.current = null;
                      setDraggedId(null);
                      onMoveTo(gesture.assetId, gesture.targetIndex);
                    }}
                    onPointerCancel={() => {
                      pointerDrag.current = null;
                      setDraggedId(null);
                    }}
                    onKeyDown={(event) => {
                      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
                      event.preventDefault();
                      onMoveTo(assetId, index + (event.key === "ArrowLeft" ? -1 : 1));
                    }}
                  >
                    <GripVertical className="h-4 w-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    aria-label={`Motiv ${index + 1} aus der Timeline entfernen`}
                    disabled={orderedAssetIds.length <= 1}
                    title={orderedAssetIds.length <= 1 ? "Mindestens ein Motiv bleibt in der Timeline." : "Motiv entfernen"}
                    className="p-1 text-muted-foreground hover:text-destructive disabled:cursor-not-allowed disabled:opacity-30"
                    onClick={() => {
                      if (window.confirm("Dieses Motiv aus der Timeline entfernen? Du kannst die Änderung anschließend rückgängig machen.")) {
                        onRemove(assetId);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </div>
              <div className="flex aspect-[4/3] items-center justify-center bg-black/95">
                <img src={image.previewUrl} alt={image.roomLabel ?? image.filename} className="h-full w-full object-contain" />
              </div>
              <p className="truncate p-3 text-xs font-semibold">{image.roomLabel ?? image.filename}</p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function MotionCatalogPanel({
  selectedMotionId,
  isSelectable,
  onPreview,
  onSelect,
}: {
  selectedMotionId?: string;
  isSelectable?: (motion: StudioMotionDefinition) => boolean;
  onPreview?: (motion?: StudioMotionDefinition) => void;
  onSelect: (motion: StudioMotionDefinition) => void;
}) {
  const [group, setGroup] = useState<StudioMotionDefinition["sourceGroup"]>("source_based");
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState<StudioMotionDefinition["family"] | "all">("all");
  const [showAllMotions, setShowAllMotions] = useState(false);
  const [focusedMotionId, setFocusedMotionId] = useState(selectedMotionId);
  const effectiveFocusedMotionId = focusedMotionId ?? selectedMotionId;
  const motions = VIDEO_STUDIO_MOTION_CATALOG.filter(
    (motion) =>
      motion.sourceGroup === group &&
      (family === "all" || motion.family === family) &&
      `${motionPresentation(motion).label} ${motion.label} ${motion.id}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const focusedMotion = VIDEO_STUDIO_MOTION_CATALOG.find(
    (motion) => motion.id === effectiveFocusedMotionId && motion.sourceGroup === group,
  );
  const familyOptions = motionFamilyOptions(group);
  const visibleMotions = query.trim() || showAllMotions ? motions : motions.slice(0, 6);

  return (
    <section data-scene-tool="motion" className="space-y-5 border border-border/70 bg-card p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Kamera bewegen</p>
        <h3 className="mt-1 text-lg font-semibold">Absicht wählen, am Motiv ansehen, dann anwenden</h3>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Zuerst erscheinen höchstens sechs passende Vorschläge. Ein Klick spielt
          die Wirkung sofort am aktuellen Motiv ab; gespeichert wird erst über
          „Auf diese Szene anwenden“.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button type="button" variant={group === "source_based" ? "default" : "outline"} onClick={() => { setGroup("source_based"); setFamily("all"); setShowAllMotions(false); setFocusedMotionId(undefined); onPreview?.(); }}>Original erhalten · ★</Button>
        <Button type="button" variant={group === "generative_ai" ? "default" : "outline"} onClick={() => { setGroup("generative_ai"); setFamily("all"); setShowAllMotions(false); setFocusedMotionId(undefined); onPreview?.(); }}>Neuen Bildraum vorbereiten · ★★★</Button>
      </div>
      <div className="flex flex-wrap gap-2" aria-label="Bewegungsgruppen">
        {familyOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={family === option.value}
            onClick={() => { setFamily(option.value); setShowAllMotions(false); }}
            className={`border px-2.5 py-1.5 text-[11px] font-semibold ${family === option.value ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"}`}
          >
            {option.label}
          </button>
        ))}
      </div>
      <label className="relative block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Bewegung suchen" className="w-full border border-border bg-background py-2 pl-9 pr-3 text-sm" />
      </label>

      {focusedMotion && (
        <MotionSelectionSummary
          motion={focusedMotion}
          applied={selectedMotionId === focusedMotion.id}
          selectable={isSelectable ? isSelectable(focusedMotion) : true}
          onApply={() => onSelect(focusedMotion)}
        />
      )}

      <div className="max-h-[680px] overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-3">
          {visibleMotions.map((motion) => (
            <MotionDemoCard
              key={motion.id}
              motion={motion}
              focused={effectiveFocusedMotionId === motion.id}
              applied={selectedMotionId === motion.id}
              selectable={isSelectable ? isSelectable(motion) : true}
              onFocus={() => {
                setFocusedMotionId(motion.id);
                onPreview?.(motion);
              }}
            />
          ))}
        </div>
        {!motions.length && (
          <p className="border border-dashed border-border p-5 text-center text-xs text-muted-foreground">
            Keine Bewegung passt zu dieser Suche.
          </p>
        )}
        {!query.trim() && motions.length > visibleMotions.length && (
          <Button type="button" variant="outline" className="mt-3 w-full" onClick={() => setShowAllMotions(true)}>
            Weitere {motions.length - visibleMotions.length} Bewegungen anzeigen
          </Button>
        )}
        {!query.trim() && showAllMotions && motions.length > 6 && (
          <Button type="button" variant="ghost" className="mt-2 w-full" onClick={() => setShowAllMotions(false)}>
            Wieder auf sechs Vorschläge reduzieren
          </Button>
        )}
      </div>
    </section>
  );
}

type MotionPresentation = {
  label: string;
  effect: string;
  suitableFor: string;
  duration: string;
  direction: "left" | "right" | "up" | "down" | "in" | "out" | "rotate" | "drift" | "depth" | "generative";
  demoVideoUrl?: string;
};

const motionPresentationOverrides: Record<string, Partial<MotionPresentation>> = {
  PAN_LEFT: { label: "Pan rechts → links", effect: "Der Ausschnitt wandert ruhig von der rechten zur linken Bildzone.", suitableFor: "Breite Räume mit einem Zielpunkt auf der linken Seite.", duration: "2–4 Sekunden", direction: "left" },
  PAN_RIGHT: { label: "Pan links → rechts", effect: "Der Ausschnitt wandert ruhig von der linken zur rechten Bildzone.", suitableFor: "Breite Räume mit einem Zielpunkt auf der rechten Seite.", duration: "2–4 Sekunden", direction: "right" },
  TILT_UP: { label: "Tilt unten → oben", effect: "Der Blick steigt im Motiv von unten nach oben.", suitableFor: "Fassaden, Treppen, hohe Fenster und vertikale Architektur.", duration: "2–4 Sekunden", direction: "up" },
  TILT_DOWN: { label: "Tilt oben → unten", effect: "Der Blick sinkt im Motiv von oben nach unten.", suitableFor: "Hohe Räume und Motive mit einem Zielpunkt im unteren Bildbereich.", duration: "2–4 Sekunden", direction: "down" },
  ZOOM_IN: { label: "Zoom hinein", effect: "Der Bildausschnitt wird enger und lenkt den Blick auf ein Detail.", suitableFor: "Zentrale Blickachsen und klar erkennbare Verkaufsmerkmale.", duration: "2–4 Sekunden", direction: "in" },
  PUSH_IN_2D: { label: "Ruhiger Push-in", effect: "Der Blick nähert sich langsam einem bewusst gewählten Raumpunkt.", suitableFor: "Räume mit Tiefe, klarer Achse oder einem starken Hero-Punkt.", duration: "2,5–5 Sekunden", direction: "in" },
  ZOOM_OUT: { label: "Zoom heraus", effect: "Der Ausschnitt öffnet sich und zeigt mehr räumlichen Zusammenhang.", suitableFor: "Motive, die von einem Detail in den ganzen Raum führen.", duration: "2–4 Sekunden", direction: "out" },
  PULL_OUT_2D: { label: "Ruhiger Pull-out", effect: "Die Szene beginnt nah und öffnet sich langsam zum Raumkontext.", suitableFor: "Kamin, Materialdetail, Einrichtung oder andere starke Startanker.", duration: "2,5–5 Sekunden", direction: "out" },
  KEN_BURNS: { effect: "Ein sanfter kombinierter Schwenk und Zoom führt durch das Motiv.", suitableFor: "Ruhige Immobilienbilder mit klarer Start- und Zielzone.", duration: "3–6 Sekunden", direction: "drift" },
  DRIFT: { effect: "Eine sehr kleine, fast unmerkliche Bewegung hält das Bild lebendig.", suitableFor: "Ruhige Zwischenszenen und hochwertige Materialdetails.", duration: "2–5 Sekunden", direction: "drift" },
  FLOAT: { effect: "Der Ausschnitt schwebt leicht und gleichmäßig durch das Motiv.", suitableFor: "Weiche, atmosphärische Szenen ohne harte Blickrichtung.", duration: "2–5 Sekunden", direction: "drift" },
  CRASH_ZOOM_IN: { effect: "Ein schneller Zoom setzt einen starken visuellen Akzent.", suitableFor: "Kurze Hooks; sparsam verwenden.", duration: "0,6–1,5 Sekunden", direction: "in" },
  CRASH_ZOOM_OUT: { effect: "Ein schneller Rückzug öffnet den Raum als kurzen Akzent.", suitableFor: "Kurze Hooks oder überraschende Raumauflösungen.", duration: "0,6–1,5 Sekunden", direction: "out" },
};

function motionPresentation(motion: StudioMotionDefinition): MotionPresentation {
  const defaults: MotionPresentation = motion.sourceGroup === "generative_ai"
    ? {
        label: motion.label,
        effect: "Die Perspektive oder der sichtbare Bildraum wird neu erzeugt.",
        suitableFor: "Nur nach einem sichtbaren Storyboard und bewusster Freigabe.",
        duration: "nach Storyboard",
        direction: "generative",
      }
    : motion.family === "depth"
      ? {
          label: motion.label,
          effect: "Vorder- und Hintergrund bewegen sich räumlich gegeneinander.",
          suitableFor: "Motive mit klar trennbarem Vorder- und Hintergrund.",
          duration: "2–5 Sekunden",
          direction: "depth",
        }
      : motion.family === "focus"
        ? {
            label: motion.label,
            effect: "Die Aufmerksamkeit wird kontrolliert innerhalb des Motivs verlagert.",
            suitableFor: "Details oder Motive mit einem eindeutig lesbaren Fokuspunkt.",
            duration: "2–4 Sekunden",
            direction: "drift",
          }
        : {
            label: motion.label,
            effect: "Der vorhandene Ausschnitt wird als kontrollierte 2D-Bewegung animiert.",
            suitableFor: "Das Originalbild bleibt unverändert; Start und Ende werden danach geprüft.",
            duration: "2–4 Sekunden",
            direction: inferMotionDirection(motion.id),
          };
  const presentation = { ...defaults, ...motionPresentationOverrides[motion.id] };
  if (!RENDERABLE_SOURCE_MOTION_IDS.has(motion.id)) return presentation;
  return {
    ...presentation,
    duration: "1,5 Sekunden",
    demoVideoUrl: `/video-studio/motion-demos/v1/${motion.id.toLowerCase().replaceAll("_", "-")}.mp4`,
  };
}

function inferMotionDirection(id: string): MotionPresentation["direction"] {
  if (id.includes("LEFT")) return "left";
  if (id.includes("RIGHT")) return "right";
  if (id.includes("UP") || id.includes("HIGH")) return "up";
  if (id.includes("DOWN") || id.includes("LOW")) return "down";
  if (id.includes("OUT") || id.includes("BACK")) return "out";
  if (id.includes("IN") || id.includes("FORWARD")) return "in";
  if (id.includes("ROLL") || id.includes("ANGLE")) return "rotate";
  return "drift";
}

function motionFamilyOptions(group: StudioMotionDefinition["sourceGroup"]): Array<{
  value: StudioMotionDefinition["family"] | "all";
  label: string;
}> {
  return group === "source_based"
    ? [
        { value: "all", label: "Alle" },
        { value: "classic", label: "Sanft führen" },
        { value: "depth", label: "Räumliche Tiefe" },
        { value: "focus", label: "Blick lenken" },
      ]
    : [
        { value: "all", label: "Alle" },
        { value: "perspective", label: "Perspektive vorbereiten" },
        { value: "outpainting", label: "Bildraum vorbereiten" },
      ];
}

function MotionDemoCard({
  motion,
  focused,
  applied,
  selectable,
  onFocus,
}: {
  motion: StudioMotionDefinition;
  focused: boolean;
  applied: boolean;
  selectable: boolean;
  onFocus: () => void;
}) {
  const presentation = motionPresentation(motion);
  const demoVideoRef = useRef<HTMLVideoElement>(null);
  const setDemoPlayback = (playing: boolean) => {
    const video = demoVideoRef.current;
    if (!video) return;
    if (playing) {
      void video.play().catch(() => undefined);
      return;
    }
    video.pause();
    video.currentTime = 0;
  };
  return (
    <button
      type="button"
      aria-pressed={focused}
      onClick={onFocus}
      onPointerEnter={() => setDemoPlayback(true)}
      onPointerLeave={() => setDemoPlayback(false)}
      onFocus={() => setDemoPlayback(true)}
      onBlur={() => setDemoPlayback(false)}
      className={`group overflow-hidden border bg-background text-left transition ${focused ? "border-primary ring-2 ring-primary/15" : "border-border hover:border-primary/60"}`}
    >
      <div data-motion-demo-slot={motion.id} className="relative flex h-36 items-center justify-center overflow-hidden bg-[#111]">
        {presentation.demoVideoUrl ? (
          <video ref={demoVideoRef} src={presentation.demoVideoUrl} muted loop playsInline preload="metadata" className="h-full aspect-[9/16] object-cover" />
        ) : (
          <MotionDirectionPreview direction={presentation.direction} />
        )}
        <span className="absolute bottom-2 left-2 bg-black/75 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/85">
          {presentation.demoVideoUrl ? "Hover oder Klick" : "Demo-Platz"}
        </span>
        {applied && (
          <span className="absolute right-2 top-2 flex items-center gap-1 bg-emerald-500 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-white">
            <Check className="h-3 w-3" /> aktiv
          </span>
        )}
      </div>
      <div className="p-3">
        <span className="block text-sm font-semibold leading-tight">{presentation.label}</span>
        <span className="mt-1 block text-[11px] leading-snug text-muted-foreground">{presentation.duration}</span>
        {!selectable && (
          <span className="mt-2 block text-[10px] font-semibold uppercase tracking-wide text-amber-700">Noch nicht anwendbar</span>
        )}
      </div>
    </button>
  );
}

function MotionSelectionSummary({
  motion,
  applied,
  selectable,
  onApply,
}: {
  motion: StudioMotionDefinition;
  applied: boolean;
  selectable: boolean;
  onApply: () => void;
}) {
  const presentation = motionPresentation(motion);
  return (
    <div className="border border-primary/35 bg-primary/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Ausgewählte Bewegung</p>
          <h4 className="mt-1 text-base font-semibold">{presentation.label}</h4>
        </div>
        <span className="shrink-0 border border-primary/25 bg-background px-2 py-1 text-[10px] font-semibold text-muted-foreground">{presentation.duration}</span>
      </div>
      <p className="mt-3 text-xs leading-relaxed">{presentation.effect}</p>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground"><strong className="text-foreground">Geeignet für:</strong> {presentation.suitableFor}</p>
      <Button type="button" className="mt-4 w-full" disabled={!selectable || applied} onClick={onApply}>
        {applied ? <><Check className="mr-2 h-4 w-4" />Auf dieser Szene aktiv</> : motion.sourceGroup === "generative_ai" ? <><Sparkles className="mr-2 h-4 w-4" />Storyboard dafür vorbereiten</> : <><Play className="mr-2 h-4 w-4" />Auf diese Szene anwenden</>}
      </Button>
      {!selectable && (
        <p className="mt-2 text-[11px] leading-relaxed text-amber-800">Für dieses Motiv fehlt noch die nötige Auflösung oder Renderer-Unterstützung. Die Auswahl verändert das Original nicht.</p>
      )}
      {selectable && !applied && motion.sourceGroup === "source_based" && (
        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">Danach erscheinen die passenden Start- und Endrahmen links am Originalbild und können direkt korrigiert werden.</p>
      )}
    </div>
  );
}

function MotionDirectionPreview({ direction }: { direction: MotionPresentation["direction"] }) {
  const Icon = direction === "left"
    ? ArrowLeft
    : direction === "right"
      ? ArrowRight
      : direction === "up"
        ? ArrowUp
        : direction === "down"
          ? ArrowDown
          : direction === "in"
            ? Maximize2
            : direction === "out"
              ? Minimize2
              : direction === "rotate"
                ? RotateCw
                : direction === "generative"
                  ? Sparkles
                  : direction === "depth"
                    ? CircleDot
                    : CircleDot;
  return (
    <div className="relative flex h-full aspect-[9/16] items-center justify-center border-x border-white/10 bg-[radial-gradient(circle_at_50%_40%,#4b5563_0%,#1f2937_45%,#09090b_100%)] text-white">
      <div className="absolute inset-[12%] border border-white/20" />
      <div className="absolute inset-x-[23%] inset-y-[20%] border border-dashed border-white/25" />
      <Icon className="relative h-9 w-9" strokeWidth={1.5} />
    </div>
  );
}

const enterAnimations = [
  "none", "fade", "slide-up", "slide-in", "wipe", "letter-by-letter",
  "blur-in", "scale-in", "word-by-word", "line-by-line",
] as const;
const exitAnimations = ["none", "fade-out", "blur-out", "scale-out", "slide-out"] as const;

const enterAnimationLabels: Record<(typeof enterAnimations)[number], string> = {
  none: "Sofort sichtbar", fade: "Sanft einblenden", "slide-up": "Von unten einschieben",
  "slide-in": "Von links einschieben", wipe: "Aufdecken", "letter-by-letter": "Buchstabe für Buchstabe",
  "blur-in": "Aus der Unschärfe", "scale-in": "Aus der Mitte vergrößern",
  "word-by-word": "Wort für Wort", "line-by-line": "Zeile für Zeile",
};
const exitAnimationLabels: Record<(typeof exitAnimations)[number], string> = {
  none: "Bleibt bis zum Szenenende", "fade-out": "Sanft ausblenden",
  "blur-out": "In Unschärfe verschwinden", "scale-out": "Zur Mitte verkleinern",
  "slide-out": "Nach rechts hinausschieben",
};
const duringAnimations = ["none", "left_to_right", "right_to_left", "up_to_down", "down_to_up"] as const;
const duringAnimationLabels: Record<(typeof duringAnimations)[number], string> = {
  none: "Nein · bleibt an seiner Position", left_to_right: "Einmal von links nach rechts",
  right_to_left: "Einmal von rechts nach links", up_to_down: "Einmal von oben nach unten",
  down_to_up: "Einmal von unten nach oben",
};

export function SceneCreativePanels({
  durationSeconds,
  fontFamilies,
  accountFonts,
  selectedFontAssetIds,
  projectId,
  image,
  take,
  brandOverlay,
  brandPreviewUrl,
  initialElements,
  initialLayers,
  maskAssets,
  onSave,
  onProject,
  onNotice,
  onDirty,
  onDraftElements,
}: {
  durationSeconds: number;
  fontFamilies: string[];
  accountFonts: Array<{ assetId: string; displayName: string; filename: string }>;
  selectedFontAssetIds: string[];
  projectId: string;
  image: StudioSourceImage;
  take: SharedStudioTake;
  brandOverlay?: SharedStudioProject["brandOverlay"];
  brandPreviewUrl?: string;
  initialElements?: StudioTypographyElement[];
  initialLayers?: StudioSceneLayer[];
  maskAssets: Array<{ assetId: string; displayName: string; sourceAssetId?: string }>;
  onSave: (patch: { typographyElements: StudioTypographyElement[]; sceneLayers: StudioSceneLayer[] }) => Promise<void>;
  onProject: (project: SharedStudioProject) => void;
  onNotice: (notice: { kind: "success" | "error"; text: string }) => void;
  onDirty: () => void;
  onDraftElements?: (elements: StudioTypographyElement[]) => void;
}) {
  const [layers, setLayers] = useState<StudioSceneLayer[]>(initialLayers ?? [
    { id: "avatar-reserve", type: "avatar_reserved", source: "reserved", status: "reserved", order: 99, visible: false },
  ]);
  const [elements, setElements] = useState<StudioTypographyElement[]>(initialElements ?? []);
  const [activeId, setActiveId] = useState(initialElements?.[0]?.id ?? "");
  const [fontRightsConfirmed, setFontRightsConfirmed] = useState(false);
  const [fontLicenseReference, setFontLicenseReference] = useState("");
  const [availableAccountFonts, setAvailableAccountFonts] = useState(accountFonts);
  const [selectedFontIds, setSelectedFontIds] = useState(selectedFontAssetIds);
  const [fontLoadFailures, setFontLoadFailures] = useState<string[]>([]);
  const [fontBusy, setFontBusy] = useState(false);
  const [showVerticalCenter, setShowVerticalCenter] = useState(true);
  const [showHorizontalCenter, setShowHorizontalCenter] = useState(true);
  const [showGoldenGuides, setShowGoldenGuides] = useState(false);
  const [snappingEnabled, setSnappingEnabled] = useState(true);
  const [saveFailed, setSaveFailed] = useState(false);
  const [saveRetryNonce, setSaveRetryNonce] = useState(0);
  const [previewVersion, setPreviewVersion] = useState(0);
  const draftVersion = useRef(0);
  const dragGesture = useRef<{ pointerId: number; elementId: string; offsetXRel: number; offsetYRel: number } | null>(null);
  const resizeGesture = useRef<{ pointerId: number; startX: number; geometry: StudioTypographyElement["geometry"] } | null>(null);
  const rotationGesture = useRef<{ pointerId: number; centerX: number; centerY: number; offsetDegrees: number } | null>(null);
  const active = elements.find((element) => element.id === activeId) ?? elements[0];
  const unavailableUsedFonts = fontLoadFailures.filter((assetId) => elements.some((element) => element.fontAssetId === assetId));
  const didMount = useRef(false);
  const onSaveRef = useRef(onSave);
  const onDirtyRef = useRef(onDirty);
  useEffect(() => { onSaveRef.current = onSave; }, [onSave]);
  useEffect(() => { onDirtyRef.current = onDirty; }, [onDirty]);
  useEffect(() => { onDraftElements?.(elements); }, [elements, onDraftElements]);
  useEffect(() => {
    let cancelled = false;
    const loadedFaces: FontFace[] = [];
    void Promise.all(availableAccountFonts
      .filter((font) => selectedFontIds.includes(font.assetId))
      .map(async (font) => {
        const source = `/api/video-studio/shared/projects/${encodeURIComponent(projectId)}/creative/font-assets/${encodeURIComponent(font.assetId)}`;
        const face = new FontFace(font.displayName, `url("${source}")`);
        try {
          await face.load();
          if (cancelled) return;
          document.fonts.add(face);
          loadedFaces.push(face);
          setFontLoadFailures((current) => current.filter((id) => id !== font.assetId));
        } catch {
          if (!cancelled) setFontLoadFailures((current) => current.includes(font.assetId) ? current : [...current, font.assetId]);
        }
      }));
    return () => {
      cancelled = true;
      loadedFaces.forEach((face) => document.fonts.delete(face));
    };
  }, [availableAccountFonts, projectId, selectedFontIds]);
  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    onDirtyRef.current();
    if (unavailableUsedFonts.length) return;
    const version = draftVersion.current;
    const timer = window.setTimeout(async () => {
      try {
        await onSaveRef.current({ typographyElements: elements, sceneLayers: layers });
        if (draftVersion.current === version) setSaveFailed(false);
      } catch {
        if (draftVersion.current === version) setSaveFailed(true);
      }
    }, 650);
    return () => window.clearTimeout(timer);
  }, [elements, layers, saveRetryNonce, unavailableUsedFonts.length]);

  function updateElement(patch: (element: StudioTypographyElement) => StudioTypographyElement) {
    if (!activeId) return;
    draftVersion.current += 1;
    setElements((current) => current.map((element) => element.id === activeId ? normalizeTypographyElement(patch(element), durationSeconds) : element));
    setPreviewVersion((current) => current + 1);
    onDirty();
  }
  function updateLayer(layerId: string, visible: boolean) {
    draftVersion.current += 1;
    setLayers((current) => current.map((layer) => layer.id === layerId ? { ...layer, visible } : layer));
    onDirty();
  }
  function field<K extends keyof StudioTypographyElement>(key: K, value: StudioTypographyElement[K]) {
    updateElement((element) => ({ ...element, [key]: value }));
  }
  async function uploadFont(file: File | undefined) {
    if (!file || !fontRightsConfirmed) return;
    setFontBusy(true);
    try {
      const form = new FormData();
      form.set("file", file);
      form.set("rightsConfirmed", "true");
      form.set("licenseReference", fontLicenseReference);
      const response = await fetch(`/api/video-studio/shared/projects/${encodeURIComponent(projectId)}/creative/font-assets`, { method: "POST", body: form });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error ?? "Schrift konnte nicht gespeichert werden.");
      if (!payload.project) throw new Error("Die neue Projektrevision fehlt.");
      onProject(payload.project as SharedStudioProject);
      const family = payload.fontAsset.displayName as string;
      setAvailableAccountFonts((current) => [payload.fontAsset, ...current.filter((font) => font.assetId !== payload.fontAsset.assetId)]);
      setSelectedFontIds((current) => [...current, payload.fontAsset.assetId].filter((id, index, all) => all.indexOf(id) === index));
      updateElement((element) => ({ ...element, fontFamily: family, fontAssetId: payload.fontAsset.assetId, fontFallbackMode: "fail" }));
      setFontRightsConfirmed(false);
      onNotice({ kind: "success", text: `„${family}“ wurde im Kundenkonto gespeichert und sicher diesem Projekt zugeordnet.` });
    } catch (error) {
      onNotice({ kind: "error", text: error instanceof Error ? error.message : "Schrift konnte nicht gespeichert werden." });
    } finally {
      setFontBusy(false);
    }
  }
  function chooseCatalogFont(fontFamily: string) {
    updateElement((element) => ({ ...element, fontFamily, fontAssetId: undefined, fontFallbackMode: "pinned" }));
  }
  async function chooseAccountFont(selected: { assetId: string; displayName: string }) {
    const fontFamily = selected.displayName;
    if (selectedFontIds.includes(selected.assetId)) {
      updateElement((element) => ({ ...element, fontFamily, fontAssetId: selected.assetId, fontFallbackMode: "fail" }));
      return;
    }
    setFontBusy(true);
    try {
      const response = await fetch(`/api/video-studio/shared/projects/${encodeURIComponent(projectId)}/creative/font-assets/${encodeURIComponent(selected.assetId)}`, { method: "POST" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error ?? "Die Firmenschrift konnte nicht zugeordnet werden.");
      if (!payload.project) throw new Error("Die neue Projektrevision fehlt.");
      onProject(payload.project as SharedStudioProject);
      setSelectedFontIds((current) => [...current, selected.assetId]);
      updateElement((element) => ({ ...element, fontFamily, fontAssetId: selected.assetId, fontFallbackMode: "fail" }));
      onNotice({ kind: "success", text: `„${fontFamily}“ wurde sicher diesem Projekt zugeordnet.` });
    } catch (error) {
      onNotice({ kind: "error", text: error instanceof Error ? error.message : "Die Firmenschrift konnte nicht zugeordnet werden." });
    } finally {
      setFontBusy(false);
    }
  }
  const verticalGuides = [showVerticalCenter ? 0.5 : null, ...(showGoldenGuides ? [0.382, 0.618] : [])]
    .filter((value): value is number => value !== null);
  const horizontalGuides = [showHorizontalCenter ? 0.5 : null, ...(showGoldenGuides ? [0.382, 0.618] : [])]
    .filter((value): value is number => value !== null);
  const activeMotionWindowMs = active
    ? Math.max(0, (Math.min(durationSeconds, active.endSeconds) - active.startSeconds) * 1000
      - active.animation.enter.delayMs - active.animation.enter.durationMs
      - (active.animation.exit?.delayMs ?? 0) - (active.animation.exit?.durationMs ?? 0))
    : 0;
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,.9fr)]">
      <section data-scene-tool="typography" className="space-y-5 border border-border/70 bg-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Typografie-Ebenen</p>
            <h3 className="mt-1 text-lg font-semibold">Bis zu 32 Texte pro Szene</h3>
            <p className="mt-1 text-xs text-muted-foreground">Jedes Element hat eigene Schrift, Geometrie, Zeit, Ein-/Ausbewegung und Tiefe.</p>
          </div>
          <Button type="button" variant="outline" disabled={elements.length >= 32} onClick={() => {
            const next = createTypographyElement(`text-${crypto.randomUUID()}`, elements.length);
            draftVersion.current += 1;
            setElements((current) => [...current, next]);
            setActiveId(next.id);
            setPreviewVersion((current) => current + 1);
            onDirty();
          }}>+ Text</Button>
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {elements.map((element, index) => (
            <button key={element.id} type="button" onClick={() => setActiveId(element.id)} className={`shrink-0 border px-3 py-2 text-xs font-semibold ${element.id === activeId ? "border-primary bg-primary/5" : "border-border"}`}>
              {index + 1} · {element.text || "Ohne Text"}
            </button>
          ))}
        </div>
        {!active && <div className="border border-dashed border-border p-8 text-center"><p className="font-semibold">Diese Szene hat noch keinen Text.</p><p className="mt-1 text-xs text-muted-foreground">Mit „+ Text“ legst du das erste von bis zu 32 unabhängigen Textelementen an.</p></div>}
        {active && (
          <>
            <style jsx global>{`
              @keyframes studio-guided-scene-motion { from { transform: var(--scene-motion-from); object-position: var(--scene-position-from) } to { transform: var(--scene-motion-to); object-position: var(--scene-position-to) } }
              @keyframes studio-type-fade-in { from { opacity: 0 } to { opacity: 1 } }
              @keyframes studio-type-slide-up { from { opacity: 0; transform: translateY(40%) } to { opacity: 1; transform: translateY(0) } }
              @keyframes studio-type-slide-in { from { opacity: 0; transform: translateX(-40%) } to { opacity: 1; transform: translateX(0) } }
              @keyframes studio-type-reveal { from { clip-path: inset(0 100% 0 0) } to { clip-path: inset(0 0 0 0) } }
              @keyframes studio-type-reveal-lines { from { clip-path: inset(0 0 100% 0) } to { clip-path: inset(0 0 0 0) } }
              @keyframes studio-type-blur-in { from { opacity: 0; filter: blur(12px) } to { opacity: 1; filter: blur(0) } }
              @keyframes studio-type-scale-in { from { opacity: 0; transform: scale(.7) } to { opacity: 1; transform: scale(1) } }
              @keyframes studio-type-left-right { from { transform: translateX(-100cqw) } to { transform: translateX(100cqw) } }
              @keyframes studio-type-right-left { from { transform: translateX(100cqw) } to { transform: translateX(-100cqw) } }
              @keyframes studio-type-top-bottom { from { transform: translateY(-100cqh) } to { transform: translateY(100cqh) } }
              @keyframes studio-type-bottom-top { from { transform: translateY(100cqh) } to { transform: translateY(-100cqh) } }
              @keyframes studio-type-fade-out { from { opacity: 1 } to { opacity: 0 } }
              @keyframes studio-type-blur-out { from { opacity: 1; filter: blur(0) } to { opacity: 0; filter: blur(12px) } }
              @keyframes studio-type-scale-out { from { opacity: 1; transform: scale(1) } to { opacity: 0; transform: scale(.7) } }
              @keyframes studio-type-slide-out { from { opacity: 1; transform: translateX(0) } to { opacity: 0; transform: translateX(40%) } }
              @media (prefers-reduced-motion: reduce) { [data-typography-canvas] [data-type-preview], [data-typography-canvas] [data-scene-motion-preview] { animation: none !important } }
            `}</style>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border border-border/70 bg-muted/20 p-3 text-xs">
              <strong>Hilfslinien</strong>
              <label className="flex items-center gap-2"><input type="checkbox" checked={showVerticalCenter} onChange={(event) => setShowVerticalCenter(event.target.checked)} /> Vertikale Mitte</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={showHorizontalCenter} onChange={(event) => setShowHorizontalCenter(event.target.checked)} /> Horizontale Mitte</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={showGoldenGuides} onChange={(event) => setShowGoldenGuides(event.target.checked)} /> Goldener Schnitt 38,2 / 61,8 %</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={snappingEnabled} onChange={(event) => setSnappingEnabled(event.target.checked)} /> Einrasten</label>
            </div>
            <div
              data-typography-canvas
              className="relative aspect-[9/16] max-h-[620px] touch-none overflow-hidden bg-neutral-950 text-white"
              style={{ containerType: "size" }}
            >
              <img data-scene-motion-preview src={image.previewUrl} alt={image.roomLabel ?? image.filename} className="absolute inset-0 h-full w-full object-cover" style={guidedSceneMotionPreviewStyle(take)} />
              <div className="absolute inset-[7%] border border-dashed border-white/25" />
              {verticalGuides.map((guide) => <span key={`v-${guide}`} className="pointer-events-none absolute inset-y-0 z-10 border-l border-dashed border-cyan-200/65" style={{ left: `${guide * 100}%` }} />)}
              {horizontalGuides.map((guide) => <span key={`h-${guide}`} className="pointer-events-none absolute inset-x-0 z-10 border-t border-dashed border-cyan-200/65" style={{ top: `${guide * 100}%` }} />)}
              {elements.map((element) => (
                <div
                  key={`${element.id}:${element.id === activeId ? previewVersion : 0}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`Textelement ${element.text || "ohne Inhalt"} positionieren`}
                  onPointerDown={(event) => {
                    event.stopPropagation();
                    setActiveId(element.id);
                    const canvas = event.currentTarget.parentElement?.getBoundingClientRect();
                    const box = event.currentTarget.getBoundingClientRect();
                    if (!canvas) return;
                    dragGesture.current = { pointerId: event.pointerId, elementId: element.id, offsetXRel: (event.clientX - box.left) / canvas.width, offsetYRel: (event.clientY - box.top) / canvas.height };
                    event.currentTarget.setPointerCapture(event.pointerId);
                  }}
                  onPointerMove={(event) => {
                    const gesture = dragGesture.current;
                    if (!gesture || gesture.pointerId !== event.pointerId || gesture.elementId !== element.id) return;
                    const canvas = event.currentTarget.parentElement?.getBoundingClientRect();
                    const box = event.currentTarget.getBoundingClientRect();
                    if (!canvas) return;
                    const next = snapTypographyPosition({ x: (event.clientX - canvas.left) / canvas.width - gesture.offsetXRel, y: (event.clientY - canvas.top) / canvas.height - gesture.offsetYRel, visibleWidthRel: box.width / canvas.width, visibleHeightRel: box.height / canvas.height, horizontalGuides, verticalGuides, enabled: snappingEnabled });
                    draftVersion.current += 1;
                    setElements((current) => current.map((item) => {
                      if (item.id !== element.id) return item;
                      const x = Math.min(0.9, next.x);
                      return { ...item, geometry: { ...item.geometry, x, y: next.y, widthRel: Math.max(0.1, Math.min(item.geometry.widthRel, 1 - x)) } };
                    }));
                    onDirty();
                  }}
                  onPointerUp={() => { dragGesture.current = null; }}
                  onPointerCancel={() => { dragGesture.current = null; }}
                  onKeyDown={(event) => {
                    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
                    event.preventDefault();
                    const step = event.shiftKey ? 0.02 : 0.005;
                    setActiveId(element.id);
                    draftVersion.current += 1;
                    setElements((current) => current.map((item) => {
                      if (item.id !== element.id) return item;
                      const x = Math.max(0, Math.min(1 - item.geometry.widthRel, item.geometry.x + (event.key === "ArrowLeft" ? -step : event.key === "ArrowRight" ? step : 0)));
                      return { ...item, geometry: { ...item.geometry, x, y: Math.max(0, Math.min(1, item.geometry.y + (event.key === "ArrowUp" ? -step : event.key === "ArrowDown" ? step : 0))) } };
                    }));
                    onDirty();
                  }}
                  className={`absolute z-20 w-fit max-w-full cursor-move border border-dashed px-2 py-1 text-left outline-none ${element.id === activeId ? "border-cyan-300 ring-1 ring-cyan-300" : "border-white/35"}`}
                  style={{
                    left: `${element.geometry.x * 100}%`,
                    top: `${element.geometry.y * 100}%`,
                    maxWidth: `${element.geometry.widthRel * 100}%`,
                    color: element.colorHex,
                    opacity: element.opacity,
                    fontFamily: element.fontFamily,
                    fontWeight: element.fontWeight,
                    fontSize: `${element.fontSizeRel * 100}cqw`,
                    letterSpacing: `${element.letterSpacing}em`,
                    lineHeight: element.lineHeight,
                    textAlign: element.geometry.align,
                    transform: `rotate(${element.geometry.rotationDeg}deg) scale(${element.geometry.scaleX}, ${element.geometry.scaleY})`,
                    transformOrigin: "center",
                    overflowWrap: "anywhere",
                  }}
                >
                  <TypographyPreviewContent element={element} durationSeconds={durationSeconds} animate={false} />
                  {element.id === activeId && <>
                    <button
                      type="button"
                      className="absolute -bottom-2 -right-2 h-5 w-5 cursor-nwse-resize bg-cyan-300 outline-none focus:ring-2 focus:ring-cyan-100"
                      aria-label="Text symmetrisch skalieren"
                      onPointerDown={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        resizeGesture.current = { pointerId: event.pointerId, startX: event.clientX, geometry: element.geometry };
                        event.currentTarget.setPointerCapture(event.pointerId);
                      }}
                      onPointerMove={(event) => {
                        const gesture = resizeGesture.current;
                        if (!gesture || gesture.pointerId !== event.pointerId) return;
                        event.stopPropagation();
                        const canvas = event.currentTarget.closest("[data-typography-canvas]")?.getBoundingClientRect();
                        if (!canvas) return;
                        draftVersion.current += 1;
                        setElements((current) => current.map((item) => item.id === element.id
                          ? { ...item, geometry: scaleTypographyGeometry(gesture.geometry, (event.clientX - gesture.startX) / canvas.width * 2) }
                          : item));
                        onDirty();
                      }}
                      onKeyDown={(event) => {
                        if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
                        event.preventDefault();
                        updateElement((item) => ({ ...item, geometry: scaleTypographyGeometry(item.geometry, event.key === "ArrowUp" ? 0.05 : -0.05) }));
                      }}
                      onPointerUp={() => { resizeGesture.current = null; }}
                      onPointerCancel={() => { resizeGesture.current = null; }}
                    />
                    <button
                      type="button"
                      className="absolute -top-7 left-1/2 h-5 w-5 -translate-x-1/2 cursor-grab rounded-full bg-cyan-300 outline-none focus:ring-2 focus:ring-cyan-100"
                      aria-label="Textdrehung ziehen"
                      onPointerDown={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        const box = event.currentTarget.parentElement?.getBoundingClientRect();
                        if (!box) return;
                        const centerX = box.left + box.width / 2;
                        const centerY = box.top + box.height / 2;
                        const pointerDegrees = typographyRotationDegrees({ centerX, centerY, pointerX: event.clientX, pointerY: event.clientY });
                        rotationGesture.current = { pointerId: event.pointerId, centerX, centerY, offsetDegrees: pointerDegrees - element.geometry.rotationDeg };
                        event.currentTarget.setPointerCapture(event.pointerId);
                      }}
                      onPointerMove={(event) => {
                        const gesture = rotationGesture.current;
                        if (!gesture || gesture.pointerId !== event.pointerId) return;
                        event.stopPropagation();
                        const rotationDeg = typographyRotationDegrees({ ...gesture, pointerX: event.clientX, pointerY: event.clientY });
                        draftVersion.current += 1;
                        setElements((current) => current.map((item) => item.id === element.id
                          ? { ...item, geometry: { ...item.geometry, rotationDeg } }
                          : item));
                        onDirty();
                      }}
                      onKeyDown={(event) => {
                        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
                        event.preventDefault();
                        updateElement((item) => ({ ...item, geometry: { ...item.geometry, rotationDeg: Math.max(-180, Math.min(180, item.geometry.rotationDeg + (event.key === "ArrowLeft" ? -1 : 1))) } }));
                      }}
                      onPointerUp={() => { rotationGesture.current = null; }}
                      onPointerCancel={() => { rotationGesture.current = null; }}
                    />
                  </>}
                </div>
              ))}
              {brandOverlay?.enabled && brandPreviewUrl && <img src={brandPreviewUrl} alt="Globales Logo über der Typografie" draggable={false} className="pointer-events-none absolute z-50 h-auto object-contain drop-shadow-md" style={{ left: `${brandOverlay.position.x * 100}%`, top: `${brandOverlay.position.y * 100}%`, width: `${brandOverlay.widthRel * 100}%`, opacity: brandOverlay.opacity, transform: `rotate(${brandOverlay.rotationDeg ?? 0}deg)`, transformOrigin: "center" }} />}
            </div>
            <p className="text-xs text-muted-foreground">Die Vorschau reagiert sofort. Das globale Logo wird im Film immer als oberste Ebene gerendert; Text darf bewusst darunter hindurchlaufen.</p>
            {saveFailed && <div className="flex items-center justify-between gap-3 border border-red-300 bg-red-50 p-3 text-xs text-red-950"><span>Speichern fehlgeschlagen. Dein lokaler Entwurf bleibt erhalten.</span><Button type="button" size="sm" variant="outline" onClick={() => setSaveRetryNonce((current) => current + 1)}>Erneut speichern</Button></div>}
            <section className="space-y-4 border border-border p-4">
              <h4 className="font-semibold">Gestaltung</h4>
              <div className="grid gap-3 sm:grid-cols-2"><Control label="Text"><input value={active.text} onChange={(event) => field("text", event.target.value)} /></Control><Control label="Unterzeile"><input value={active.secondaryText ?? ""} onChange={(event) => field("secondaryText", event.target.value)} /></Control></div>
              <div><p className="mb-2 text-xs font-semibold">Katalogschriften · direkt verwendbar</p><div role="listbox" aria-label="Katalogschrift wählen" className="grid max-h-64 gap-2 overflow-y-auto sm:grid-cols-2">{["Inter", ...fontFamilies].filter((value, index, all) => all.indexOf(value) === index).map((font) => <button key={font} type="button" role="option" aria-selected={!active.fontAssetId && active.fontFamily === font} disabled={fontBusy} onClick={() => chooseCatalogFont(font)} className={`border p-3 text-left ${!active.fontAssetId && active.fontFamily === font ? "border-primary bg-primary/5" : "border-border"}`} style={{ fontFamily: font }}><span className="block text-base">{font}</span><span className="block text-xs opacity-70">Immobilie · Aa 123</span></button>)}</div></div>
              {availableAccountFonts.length > 0 && <div><p className="mb-2 text-xs font-semibold">Bereits vorhandene Corporate-Schriften</p><div role="listbox" aria-label="Corporate-Schrift wählen" className="grid gap-2 sm:grid-cols-2">{availableAccountFonts.map((font) => { const attached = selectedFontIds.includes(font.assetId); return <button key={font.assetId} type="button" role="option" aria-selected={active.fontAssetId === font.assetId} disabled={fontBusy} onClick={() => void chooseAccountFont(font)} className={`border p-3 text-left ${active.fontAssetId === font.assetId ? "border-primary bg-primary/5" : "border-border"}`} style={attached ? { fontFamily: font.displayName } : undefined}><span className="block text-base">{font.displayName}</span><span className="block text-[11px] opacity-70">{attached ? "Projektgebunden · echte Vorschau" : "Aus Konto wählen · Vorschau wird sicher geladen"}</span></button>; })}</div></div>}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Control label="Gewicht"><input type="number" min={100} max={900} step={100} value={active.fontWeight} onChange={(event) => field("fontWeight", Math.round(Math.max(100, Math.min(900, Number(event.target.value))))) } /></Control><Control label="Größe"><input type="range" min={0.02} max={0.2} step={0.005} value={active.fontSizeRel} onChange={(event) => field("fontSizeRel", Number(event.target.value))} /></Control><Control label="Farbe"><span className="flex gap-2"><input type="color" value={active.colorHex} onChange={(event) => field("colorHex", event.target.value)} /><input value={active.colorHex} onChange={(event) => field("colorHex", event.target.value)} /></span></Control><Control label="Deckkraft"><input type="range" min={0} max={1} step={0.05} value={active.opacity} onChange={(event) => field("opacity", Number(event.target.value))} /></Control></div>
            </section>
            <section className="grid gap-4 border border-border p-4 lg:grid-cols-3">
              <Control label="Wie erscheint?"><select value={active.animation.enter.animationId} onChange={(event) => field("animation", { ...active.animation, type: event.target.value, durationMs: active.animation.enter.durationMs, enter: { ...active.animation.enter, animationId: event.target.value } })}>{enterAnimations.map((animation) => <option key={animation} value={animation}>{enterAnimationLabels[animation]}</option>)}</select></Control>
              <Control label="Bewegt sich während der Anzeige?"><select value={active.animation.during?.animationId ?? "none"} onChange={(event) => { const animationId = event.target.value as (typeof duringAnimations)[number]; field("animation", { ...active.animation, during: { animationId, easing: animationId === "none" ? "linear" : (active.animation.during?.easing ?? "smooth"), holdStartMs: animationId === "none" ? 0 : Math.min(active.animation.during?.holdStartMs ?? 0, Math.max(0, activeMotionWindowMs - 1)), holdEndMs: animationId === "none" ? 0 : Math.min(active.animation.during?.holdEndMs ?? 0, Math.max(0, activeMotionWindowMs - 1)) } }); }}>{duringAnimations.map((animation) => <option key={animation} value={animation} disabled={animation !== "none" && activeMotionWindowMs < 1}>{duringAnimationLabels[animation]}</option>)}</select></Control>
              <Control label="Wie verschwindet?"><select value={active.animation.exit?.animationId ?? "none"} onChange={(event) => field("animation", { ...active.animation, exit: { animationId: event.target.value, durationMs: active.animation.exit?.durationMs ?? 400, delayMs: active.animation.exit?.delayMs ?? 0 } })}>{exitAnimations.map((animation) => <option key={animation} value={animation}>{exitAnimationLabels[animation]}</option>)}</select></Control>
              <p className="text-xs text-muted-foreground lg:col-span-3">Richtungsbewegungen laufen genau einmal über die Anzeigedauer. Es gibt kein automatisches Zurückpendeln.</p>
            </section>
            <section className="space-y-3 border border-border p-4"><h4 className="font-semibold">Wann?</h4><div className="relative h-10 rounded bg-muted"><div className="absolute inset-y-2 rounded bg-primary/35" style={{ left: `${durationSeconds ? active.startSeconds / durationSeconds * 100 : 0}%`, right: `${durationSeconds ? (1 - Math.min(active.endSeconds, durationSeconds) / durationSeconds) * 100 : 0}%` }} /><input aria-label="Text startet" type="range" min={0} max={durationSeconds} step={0.1} value={active.startSeconds} onChange={(event) => field("startSeconds", Math.min(Number(event.target.value), active.endSeconds - 0.1))} className="pointer-events-none absolute inset-0 h-full w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto" /><input aria-label="Text endet" type="range" min={0} max={durationSeconds} step={0.1} value={Math.min(active.endSeconds, durationSeconds)} onChange={(event) => field("endSeconds", Math.max(Number(event.target.value), active.startSeconds + 0.1))} className="pointer-events-none absolute inset-0 h-full w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto" /></div><p className="text-xs font-semibold">{active.startSeconds.toFixed(1)} s bis {Math.min(active.endSeconds, durationSeconds).toFixed(1)} s · Szene {durationSeconds.toFixed(1)} s</p></section>
            <details className="border border-border p-4"><summary className="cursor-pointer font-semibold">Feineinstellungen</summary><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Control label="Laufweite"><input type="number" min={-0.1} max={0.3} step={0.01} value={active.letterSpacing} onChange={(event) => field("letterSpacing", Math.max(-0.1, Math.min(0.3, Number(event.target.value))))} /></Control><Control label="Zeilenhöhe"><input type="number" min={0.8} max={2} step={0.05} value={active.lineHeight} onChange={(event) => field("lineHeight", Math.max(0.8, Math.min(2, Number(event.target.value))))} /></Control><Control label="X"><input type="number" min={0} max={1 - active.geometry.widthRel} step={0.01} value={active.geometry.x} onChange={(event) => field("geometry", { ...active.geometry, x: Math.max(0, Math.min(1 - active.geometry.widthRel, Number(event.target.value))) })} /></Control><Control label="Y"><input type="number" min={0} max={1} step={0.01} value={active.geometry.y} onChange={(event) => field("geometry", { ...active.geometry, y: Math.max(0, Math.min(1, Number(event.target.value))) })} /></Control><Control label="Maximale Zeilenbreite"><input type="number" min={0.1} max={1 - active.geometry.x} step={0.01} value={active.geometry.widthRel} onChange={(event) => field("geometry", { ...active.geometry, widthRel: Math.max(0.1, Math.min(1 - active.geometry.x, Number(event.target.value))) })} /></Control><Control label="Drehung"><input type="number" min={-180} max={180} value={active.geometry.rotationDeg} onChange={(event) => field("geometry", { ...active.geometry, rotationDeg: Math.max(-180, Math.min(180, Number(event.target.value))) })} /></Control><Control label="Skalierung X"><input type="number" min={0.25} max={4} step={0.05} value={active.geometry.scaleX} onChange={(event) => field("geometry", { ...active.geometry, scaleX: Math.max(0.25, Math.min(4, Number(event.target.value))) })} /></Control><Control label="Skalierung Y"><input type="number" min={0.25} max={4} step={0.05} value={active.geometry.scaleY} onChange={(event) => field("geometry", { ...active.geometry, scaleY: Math.max(0.25, Math.min(4, Number(event.target.value))) })} /></Control><Control label="Ausrichtung"><select value={active.geometry.align} onChange={(event) => field("geometry", { ...active.geometry, align: event.target.value as "left" | "center" | "right" })}><option value="left">Links</option><option value="center">Mitte</option><option value="right">Rechts</option></select></Control><Control label="Einblend-Dauer ms"><input type="number" min={0} max={4000} value={active.animation.enter.durationMs} onChange={(event) => { const durationMs = Math.round(Math.max(0, Math.min(4000, Number(event.target.value)))); field("animation", { ...active.animation, durationMs, enter: { ...active.animation.enter, durationMs } }); }} /></Control><Control label="Einblend-Verzögerung ms"><input type="number" min={0} max={10000} value={active.animation.enter.delayMs} onChange={(event) => field("animation", { ...active.animation, enter: { ...active.animation.enter, delayMs: Math.round(Math.max(0, Math.min(10000, Number(event.target.value)))) } })} /></Control><Control label="Ausblend-Dauer ms"><input type="number" min={0} max={4000} value={active.animation.exit?.durationMs ?? 0} onChange={(event) => field("animation", { ...active.animation, exit: { animationId: active.animation.exit?.animationId ?? "none", durationMs: Math.round(Math.max(0, Math.min(4000, Number(event.target.value)))), delayMs: active.animation.exit?.delayMs ?? 0 } })} /></Control>
              {(active.animation.during?.animationId ?? "none") !== "none" && <><Control label="Halt am Anfang ms"><input type="number" min={0} max={Math.min(10000, Math.max(0, activeMotionWindowMs - (active.animation.during?.holdEndMs ?? 0) - 1))} value={active.animation.during?.holdStartMs ?? 0} onChange={(event) => field("animation", { ...active.animation, during: { ...(active.animation.during ?? { animationId: "left_to_right", easing: "smooth", holdStartMs: 0, holdEndMs: 0 }), holdStartMs: Math.round(Math.max(0, Math.min(Number(event.target.value), activeMotionWindowMs - (active.animation.during?.holdEndMs ?? 0) - 1))) } })} /></Control><Control label="Halt am Ende ms"><input type="number" min={0} max={Math.min(10000, Math.max(0, activeMotionWindowMs - (active.animation.during?.holdStartMs ?? 0) - 1))} value={active.animation.during?.holdEndMs ?? 0} onChange={(event) => field("animation", { ...active.animation, during: { ...(active.animation.during ?? { animationId: "left_to_right", easing: "smooth", holdStartMs: 0, holdEndMs: 0 }), holdEndMs: Math.round(Math.max(0, Math.min(Number(event.target.value), activeMotionWindowMs - (active.animation.during?.holdStartMs ?? 0) - 1))) } })} /></Control></>}
              <Control label="Tiefe"><select value={active.layer.mode} onChange={(event) => { const mode = event.target.value as "foreground" | "behind-object"; field("layer", mode === "foreground" ? { mode } : { mode, maskAssetId: maskAssets[0]?.assetId }); }}><option value="foreground">Vor Objekt</option><option value="behind-object" disabled={!maskAssets.length}>Hinter geprüftem Objekt</option></select></Control>{active.layer.mode === "behind-object" && <Control label="Objektmaske"><select value={active.layer.maskAssetId ?? ""} onChange={(event) => field("layer", { mode: "behind-object", maskAssetId: event.target.value })}>{maskAssets.map((mask) => <option key={mask.assetId} value={mask.assetId}>{mask.displayName}</option>)}</select></Control>}
            </div></details>
            <details className="border border-border p-4"><summary className="cursor-pointer font-semibold">Eigene Corporate-Schrift hinzufügen</summary><div className="mt-4 flex flex-wrap gap-3"><label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={fontRightsConfirmed} onChange={(event) => setFontRightsConfirmed(event.target.checked)} /> Ich bestätige die Nutzungsrechte an dieser eigenen Schriftdatei.</label><input value={fontLicenseReference} onChange={(event) => setFontLicenseReference(event.target.value)} placeholder="Lizenz/Quelle (optional)" className="border border-border bg-background px-2 py-1.5 text-xs" /><input type="file" accept=".ttf,.otf,.woff2,font/ttf,font/otf,font/woff2" disabled={!fontRightsConfirmed || fontBusy || selectedFontIds.length >= 8} onChange={(event) => void uploadFont(event.target.files?.[0])} title="Upload wird erst nach Rechtebestätigung freigegeben" /><span className="text-xs text-muted-foreground">{availableAccountFonts.length} im Konto · {selectedFontIds.length} / 8 in diesem Projekt · maximal 5 MB</span></div></details>
            {unavailableUsedFonts.length > 0 && <span className="text-xs font-semibold text-destructive">{unavailableUsedFonts.length} verwendete Schrift(en) konnten nicht geladen werden; Speicherung bleibt gesperrt, bis die Kontoverbindung wieder verfügbar ist.</span>}
            <Button type="button" variant="outline" onClick={() => { if (!window.confirm("Dieses Textelement löschen? Die Änderung wird gespeichert; ein fehlgeschlagenes Speichern lässt den lokalen Entwurf bestehen.")) return; draftVersion.current += 1; const remaining = elements.filter((element) => element.id !== active.id); setElements(remaining); setActiveId(remaining[0]?.id ?? ""); onDirty(); }}>Text löschen</Button>
          </>
        )}
      </section>
      <section data-scene-tool="layers" className="space-y-4 border border-border/70 bg-card p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Szenenebenen</p>
          <h3 className="mt-1 text-lg font-semibold">Architektur, Objekte und Reserve</h3>
          <p className="mt-1 text-xs text-muted-foreground">Bis zu 16 geprüfte Masken pro Bild. Analyseebenen bleiben quellengebunden; die Avatar-Zone ist nur reserviert und wird nicht gerendert.</p>
        </div>
        {layers.map((layer) => (
          <label key={layer.id} className="flex items-center justify-between gap-4 border border-border p-4">
            <span>
              <span className="block text-sm font-semibold">{layer.type === "architecture" ? "Architektur" : layer.type === "object" ? (maskAssets.find((asset) => asset.assetId === layer.maskAssetId)?.displayName ?? "Geprüftes Objekt") : "Avatar-Reserve"}</span>
              <span className="text-xs text-muted-foreground">{layer.type === "avatar_reserved" ? "Reserviert · nicht renderbar" : layer.status === "ready" ? "Maske bereit" : "Analyse ausstehend"}</span>
            </span>
            <input type="checkbox" checked={layer.visible} disabled={layer.type === "avatar_reserved"} onChange={(event) => updateLayer(layer.id, event.target.checked)} />
          </label>
        ))}
        {maskAssets.length === 0 && <div className="border border-dashed border-border p-4 text-xs text-muted-foreground">Für dieses Bild liegt keine geprüfte Objekt- oder Architekturebene vor. Es wird keine Ebene simuliert.</div>}
        {maskAssets.length > 0 && <div className="border border-dashed border-border p-4 text-xs text-muted-foreground">Nur redigierte, an dieses Original gebundene Masken sind auswählbar. Interne Speicherpfade bleiben serverseitig.</div>}
      </section>
    </div>
  );
}

export function AiStudioPanel({
  projectId,
  images,
  takeIdByAssetId,
  selectedMotionId,
  onBack,
  onNotice,
  onProject,
}: {
  projectId: string;
  images: StudioSourceImage[];
  takeIdByAssetId: Map<string, string>;
  selectedMotionId?: string;
  onBack: () => void;
  onNotice: (notice: { kind: "success" | "error"; text: string }) => void;
  onProject: (project: SharedStudioProject) => void;
}) {
  const [sourceAssetId, setSourceAssetId] = useState(images[0]?.id ?? "");
  const initiallyMatchingProposal = AI_STUDIO_PROPOSALS.find((proposal) => proposal.motionId === selectedMotionId);
  const [proposalId, setProposalId] = useState(initiallyMatchingProposal?.id ?? "");
  const [activationMode, setActivationMode] = useState<"replace_take" | "insert_after_take">("replace_take");
  const [storyboard, setStoryboard] = useState([
    "Originalmotiv und Architektur unverändert sichern",
    "Kamerabewegung der gewählten Demo als Entwurf übertragen",
    "Geometrie, Fenster, Wände und Objektkanten vor Freigabe prüfen",
  ]);
  const [status, setStatus] = useState<"draft" | "selected" | "generating" | "generated" | "approved" | "rejected" | "failed">("draft");
  const [busy, setBusy] = useState(false);
  const [ideasOpen, setIdeasOpen] = useState(Boolean(selectedMotionId));
  const selectedProposal = AI_STUDIO_PROPOSALS.find((proposal) => proposal.id === proposalId);
  const generativeMotion = selectedProposal
    ? VIDEO_STUDIO_MOTION_CATALOG.find((motion) => motion.id === selectedProposal.motionId)
    : undefined;

  async function saveDraft() {
    if (!selectedProposal || !isSelectableAiStudioProposal(selectedProposal) || !generativeMotion) {
      return onNotice({ kind: "error", text: "Für diese Idee fehlt noch ein freigegebenes Ergebnisbeispiel. Sie kann nicht als Storyboard-Vorlage gewählt werden." });
    }
    const takeId = takeIdByAssetId.get(sourceAssetId);
    if (!takeId) return onNotice({ kind: "error", text: "Das gewählte Bild ist noch nicht als Szene gespeichert." });
    setBusy(true);
    try {
      const response = await fetch(`/api/video-studio/shared/projects/${encodeURIComponent(projectId)}/creative/ai-storyboards`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          selection: { sourceAssetId, demoNumber: selectedProposal.demoNumber },
          motion: {
            motionId: generativeMotion.id,
            sourceKind: "generative_ai",
            motionClass: "generative_3d",
            capabilityId: "prepare.perspective_shift",
            supportStatus: "generation_draft",
          },
          timelineActivation: { mode: activationMode, takeId },
          storyboard: {
            title: `Bild ${images.findIndex((image) => image.id === sourceAssetId) + 1} + Demo ${selectedProposal.demoNumber}`,
            summary: `${generativeMotion.label} als prüfbarer Entwurf auf dem unveränderten Originalmotiv.`,
            beats: storyboard.map((description, index) => ({ order: index + 1, description })),
          },
          status: "selected",
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error ?? "Storyboard konnte nicht gespeichert werden.");
      if (!payload.project) throw new Error("Die neue Projektrevision fehlt.");
      onProject(payload.project as SharedStudioProject);
      setStatus(payload.draft?.status ?? "selected");
      onNotice({ kind: "success", text: "Storyboard-Entwurf gespeichert. Es wurde kein Providerjob gestartet." });
    } catch (error) {
      onNotice({ kind: "error", text: error instanceof Error ? error.message : "Storyboard konnte nicht gespeichert werden." });
    } finally {
      setBusy(false);
    }
  }
  return (
    <section data-workflow-stage="preview_ai" className="space-y-5">
      <div className="flex flex-col gap-4 border-b border-border/70 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Optional · Kreative Idee vorbereiten</p>
          <h2 className="mt-2 text-2xl font-semibold">Ergebnis beschreiben, noch nichts erzeugen</h2>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Dieser Bereich speichert ausschließlich ein prüfbares Storyboard. Es
            gibt hier keine Providerwahl und keinen Erzeugungsstart. Kosten,
            Herkunft und notwendige Freigaben werden erst an einem belegten
            Ergebnisweg sichtbar entschieden.
          </p>
        </div>
        <Button variant="outline" onClick={onBack}>Zur Szenenbearbeitung</Button>
      </div>
      <details className="border border-border/70 bg-card" open={ideasOpen} onToggle={(event) => setIdeasOpen(event.currentTarget.open)}>
        <summary className="cursor-pointer p-5 font-semibold">Optionale KI-Ideen ansehen</summary>
        <div className="space-y-6 border-t border-border/70 p-5">
          <div className="grid gap-6 xl:grid-cols-[minmax(300px,.75fr)_minmax(0,1.25fr)]">
            <section className="space-y-4 border border-border/70 bg-background p-5">
              <Control label="Auftragsbild"><select value={sourceAssetId} onChange={(event) => setSourceAssetId(event.target.value)}>{images.map((image, index) => <option key={image.id} value={image.id}>Bild {index + 1} · {image.roomLabel ?? image.filename}</option>)}</select></Control>
              <div className="flex aspect-[4/3] items-center justify-center bg-black/95">
                {images.find((image) => image.id === sourceAssetId) && <img src={images.find((image) => image.id === sourceAssetId)!.previewUrl} alt="Gewähltes Auftragsbild" className="h-full w-full object-contain" />}
              </div>
              <p className="text-sm font-semibold">{selectedProposal ? `+ Idee ${selectedProposal.demoNumber} · ${selectedProposal.name}` : "+ Noch keine belegte Idee gewählt"}</p>
              <Control label="Spätere Timeline-Wirkung"><select value={activationMode} onChange={(event) => setActivationMode(event.target.value as typeof activationMode)}><option value="replace_take">Diesen Standbild-Slot ersetzen</option><option value="insert_after_take">Als neuen Clip dahinter einfügen</option></select></Control>
              <p className="border border-blue-300 bg-blue-50 p-3 text-xs text-blue-950">Ein später freigegebener Clip erhält ausschließlich serverseitig seine echte Dauer. Hier wird nur die beabsichtigte Einordnung gespeichert.</p>
            </section>
            <section className="space-y-4 border border-border/70 bg-background p-5">
              <h3 className="font-semibold">Belegte Ideenvorlagen</h3>
              <p className="border border-amber-300 bg-amber-50 p-3 text-xs text-amber-950">Eine Idee ist erst auswählbar, wenn Quellbeispiel, echtes Ergebnis, Dauer, Herkunft und Voraussetzungen belegt sind. Auftragsfotos werden niemals als KI-Ergebnisse ausgegeben.</p>
              <div className="grid max-h-[620px] gap-3 overflow-y-auto pr-1 md:grid-cols-2">
                {AI_STUDIO_PROPOSALS.map((proposal) => {
                  const selectable = isSelectableAiStudioProposal(proposal);
                  return <button key={proposal.id} type="button" disabled={!selectable} onClick={() => setProposalId(proposal.id)} className={`border p-4 text-left disabled:cursor-not-allowed disabled:opacity-65 ${proposalId === proposal.id ? "border-primary ring-2 ring-primary/20" : "border-border"}`}>
                    <span className="block text-sm font-semibold">Idee {proposal.demoNumber} · {proposal.name}</span>
                    <span className="mt-2 block text-xs">Geeignet für: {proposal.suitableSourceMotif}</span>
                    {(proposal.sourceExampleUrl || proposal.resultExampleUrl) && <span className="mt-3 grid grid-cols-2 gap-2">
                      {proposal.sourceExampleUrl && <span><span className="mb-1 block text-[10px] font-semibold uppercase">Quellbeispiel</span><img src={proposal.sourceExampleUrl} alt={`Quellbeispiel für ${proposal.name}`} className="aspect-video w-full object-cover" /></span>}
                      {proposal.resultExampleUrl && <span><span className="mb-1 block text-[10px] font-semibold uppercase">Echtes Ergebnis</span><video src={proposal.resultExampleUrl} aria-label={`Ergebnisbeispiel für ${proposal.name}`} className="aspect-video w-full object-cover" autoPlay loop muted playsInline /></span>}
                    </span>}
                    <span className="mt-2 block text-xs text-muted-foreground">Quelle: {proposal.sourceExampleUrl ? "belegt" : "fehlt"} · Ergebnis: {proposal.resultExampleUrl ? `${proposal.durationSeconds?.toFixed(1)} s` : "fehlt"} · Herkunft: {proposal.provenance ?? "nicht belegt"}</span>
                    <span className="mt-2 block text-[11px] font-semibold uppercase tracking-wide text-amber-700">{selectable ? "Als Storyboard-Vorlage auswählbar" : "Noch nicht verfügbar"}</span>
                    <span className="mt-1 block text-[11px] text-muted-foreground">Voraussetzungen: {proposal.prerequisites.join(" · ")}</span>
                  </button>;
                })}
              </div>
            </section>
          </div>
          <section className="space-y-4 border border-border/70 bg-background p-5">
            <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-semibold">Storyboard-Entwurf</h3><span className="border border-border px-2 py-1 text-xs font-semibold">Status: {status}</span></div>
            {storyboard.map((line, index) => <input key={index} value={line} onChange={(event) => setStoryboard((current) => current.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} className="w-full border border-border bg-background px-3 py-2 text-sm" />)}
            <div className="flex flex-wrap gap-3"><Button disabled={busy || !sourceAssetId || !selectedProposal || !isSelectableAiStudioProposal(selectedProposal)} onClick={saveDraft}>Storyboard speichern · keine Erzeugung</Button></div>
            <p className="text-xs text-muted-foreground">Dieser Knopf persistiert ausschließlich Text, Bildbezug und spätere Timeline-Absicht. Es wird kein Qwen-, Google-, Kling-, MiniMax- oder anderer Providerjob gestartet.</p>
          </section>
        </div>
      </details>
    </section>
  );
}

export function SceneNeighbor({ image, label, onClick }: { image?: StudioSourceImage; label: string; onClick: () => void }) {
  if (!image) return <div aria-hidden />;
  return <button type="button" onClick={onClick} className="overflow-hidden border border-border bg-card opacity-55 transition hover:opacity-90"><div className="flex aspect-[3/4] items-center justify-center bg-black"><img src={image.previewUrl} alt={`${label}: ${image.roomLabel ?? image.filename}`} className="h-full w-full object-contain" /></div><span className="block p-2 text-xs font-semibold">{label}</span></button>;
}

export function TypographyPreviewContent({
  element,
  durationSeconds,
  animate = true,
}: {
  element: StudioTypographyElement;
  durationSeconds: number;
  animate?: boolean;
}) {
  if (!animate) {
    return <span data-type-preview className="block">{element.text}{element.secondaryText && <small className="block opacity-80">{element.secondaryText}</small>}</span>;
  }
  const styles = typographyAnimationPreviewStyles(element, durationSeconds);
  return <span data-type-preview className="block" style={styles.exit}>
    <span className="block" style={styles.during}>
      <span className="block" style={styles.enter}>{element.text}{element.secondaryText && <small className="block opacity-80">{element.secondaryText}</small>}</span>
    </span>
  </span>;
}

export function typographyAnimationPreviewStyles(element: StudioTypographyElement, durationSeconds: number) {
  const intervalMs = Math.max(100, (Math.min(durationSeconds, element.endSeconds) - element.startSeconds) * 1000);
  const enter = element.animation.enter;
  const exit = element.animation.exit;
  const during = element.animation.during;
  const resolvedEnterName = ({
    none: null,
    fade: "studio-type-fade-in",
    "slide-up": "studio-type-slide-up",
    "slide-in": "studio-type-slide-in",
    wipe: "studio-type-reveal",
    "letter-by-letter": "studio-type-reveal",
    "blur-in": "studio-type-blur-in",
    "scale-in": "studio-type-scale-in",
    "word-by-word": "studio-type-reveal",
    "line-by-line": "studio-type-reveal-lines",
  } as Record<string, string | null>)[enter.animationId];
  const enterName = resolvedEnterName === undefined ? "studio-type-fade-in" : resolvedEnterName;
  const duringName = ({
    left_to_right: "studio-type-left-right",
    right_to_left: "studio-type-right-left",
    up_to_down: "studio-type-top-bottom",
    down_to_up: "studio-type-bottom-top",
  } as Record<string, string | undefined>)[during?.animationId ?? "none"];
  const exitName = ({
    "fade-out": "studio-type-fade-out",
    "blur-out": "studio-type-blur-out",
    "scale-out": "studio-type-scale-out",
    "slide-out": "studio-type-slide-out",
  } as Record<string, string | undefined>)[exit?.animationId ?? "none"];
  const enterTotal = enter.delayMs + enter.durationMs;
  const exitTotal = exit ? exit.delayMs + exit.durationMs : 0;
  const exitWindow = exit ? typographyExitWindowMs(intervalMs, exit) : undefined;
  const movementMs = Math.max(1, intervalMs - enterTotal - exitTotal - (during?.holdStartMs ?? 0) - (during?.holdEndMs ?? 0));
  const revealSteps = enter.animationId === "letter-by-letter"
    ? Math.max(1, element.text.length)
    : enter.animationId === "word-by-word"
      ? Math.max(1, element.text.trim().split(/\s+/).length)
      : enter.animationId === "line-by-line"
        ? Math.max(1, element.text.split(/\n/).length)
        : null;
  return {
    enter: enterName ? {
      animation: `${enterName} ${Math.max(1, enter.durationMs)}ms ${revealSteps ? `steps(${revealSteps}, end)` : "ease-out"} ${Math.max(0, enter.delayMs)}ms 1 normal both`,
    } : undefined,
    during: duringName ? {
      transform: typographyDuringStartTransform(during?.animationId),
      animation: `${duringName} ${movementMs}ms ${cssTypographyEasing(during?.easing)} ${Math.max(0, enterTotal + (during?.holdStartMs ?? 0))}ms 1 normal forwards`,
    } : undefined,
    exit: exitName && exit ? {
      animation: `${exitName} ${Math.max(1, exit.durationMs)}ms ease-in ${exitWindow?.startMs ?? 0}ms 1 normal forwards`,
    } : undefined,
  };
}

function typographyDuringStartTransform(animationId: NonNullable<StudioTypographyElement["animation"]["during"]>["animationId"] | undefined) {
  if (animationId === "left_to_right") return "translateX(-100cqw)";
  if (animationId === "right_to_left") return "translateX(100cqw)";
  if (animationId === "up_to_down") return "translateY(-100cqh)";
  if (animationId === "down_to_up") return "translateY(100cqh)";
  return undefined;
}

function guidedSceneMotionPreviewStyle(take: SharedStudioTake) {
  const parameters = take.motionSpec?.parameters;
  const holdStartSeconds = Math.max(0, parameters?.holdStartSeconds ?? 0);
  const holdEndSeconds = Math.max(0, parameters?.holdEndSeconds ?? 0);
  const movementSeconds = Math.max(0.001, take.durationSeconds - holdStartSeconds - holdEndSeconds);
  return {
    "--scene-motion-from": `scale(${take.startFrame.scale}) rotate(${parameters?.rotationStartDeg ?? 0}deg)`,
    "--scene-motion-to": `scale(${take.endFrame.scale}) rotate(${parameters?.rotationEndDeg ?? parameters?.rotationStartDeg ?? 0}deg)`,
    "--scene-position-from": `${take.startFrame.centerX * 100}% ${take.startFrame.centerY * 100}%`,
    "--scene-position-to": `${take.endFrame.centerX * 100}% ${take.endFrame.centerY * 100}%`,
    transform: `scale(${take.startFrame.scale}) rotate(${parameters?.rotationStartDeg ?? 0}deg)`,
    objectPosition: `${take.startFrame.centerX * 100}% ${take.startFrame.centerY * 100}%`,
    animation: `studio-guided-scene-motion ${movementSeconds}s ${cssSceneMotionEasing(parameters?.easing)} ${holdStartSeconds}s 1 normal forwards`,
  } as React.CSSProperties;
}

function cssSceneMotionEasing(
  easing: NonNullable<NonNullable<SharedStudioTake["motionSpec"]>["parameters"]>["easing"] | undefined,
) {
  if (easing === "linear") return "linear";
  if (easing === "ease_in") return "cubic-bezier(.42,0,1,1)";
  if (easing === "ease_out") return "cubic-bezier(0,0,.58,1)";
  if (easing === "cinematic_accelerate") return "cubic-bezier(.55,.05,.9,.35)";
  if (easing === "cinematic_decelerate") return "cubic-bezier(.1,.65,.25,1)";
  if (easing === "cinematic_slow") return "cubic-bezier(.35,0,.25,1)";
  return "ease-in-out";
}

function cssTypographyEasing(easing: NonNullable<StudioTypographyElement["animation"]["during"]>["easing"] | undefined) {
  if (easing === "linear") return "linear";
  if (easing === "ease_in") return "cubic-bezier(.42,0,1,1)";
  if (easing === "ease_out") return "cubic-bezier(0,0,.58,1)";
  if (easing === "ease_in_out") return "ease-in-out";
  return "cubic-bezier(.35,0,.25,1)";
}

function Control({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="space-y-1 text-xs font-semibold [&_input]:w-full [&_input]:border [&_input]:border-border [&_input]:bg-background [&_input]:px-2 [&_input]:py-1.5 [&_select]:w-full [&_select]:border [&_select]:border-border [&_select]:bg-background [&_select]:px-2 [&_select]:py-1.5">{label}{children}</label>;
}

function roleLabel(role: StudioSourceImage["role"]) {
  return ({ exterior: "Außen", interior: "Innen", detail: "Detail" } as const)[role];
}
