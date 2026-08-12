"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { CircleDot, Loader2, Play, Upload, WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StudioSourceImage } from "@/lib/central-video-studio";

type Focus = { x: number; y: number };
type Notice = { kind: "success" | "error"; text: string };
type GenerationStatus = "idle" | "starting" | "running" | "completed" | "failed";
type PerspectiveStage = { horizontalAngle: number; verticalAngle: number; zoom: number };

const DEFAULT_PROMPT = "One smooth subject-locked crane move. The camera rises and glides slightly forward while tilting down. Keep the selected target continuously centered. Move steadily from the first frame to the last without looking away, reversing, pausing or correcting. Reach the supplied final frame directly. Only the camera moves; the room, geometry and all objects remain completely unchanged.";

export function PerspectiveVideoPanel({
  projectId,
  images,
  sourceAssetId,
  onSourceAssetId,
  onNotice,
}: {
  projectId: string;
  images: StudioSourceImage[];
  sourceAssetId: string;
  onSourceAssetId: (assetId: string) => void;
  onNotice: (notice: Notice) => void;
}) {
  const [endAssetId, setEndAssetId] = useState(images.find((image) => image.id !== sourceAssetId)?.id ?? "");
  const [manualStartDataUrl, setManualStartDataUrl] = useState("");
  const [manualEndDataUrl, setManualEndDataUrl] = useState("");
  const [startFocus, setStartFocus] = useState<Focus>({ x: 0.5, y: 0.5 });
  const [endFocus, setEndFocus] = useState<Focus>({ x: 0.5, y: 0.5 });
  const [horizontalAngle, setHorizontalAngle] = useState(0);
  const [verticalAngle, setVerticalAngle] = useState(30);
  const [zoom, setZoom] = useState(0);
  const [stageCountOverride, setStageCountOverride] = useState<"auto" | "1" | "2" | "3" | "4">("auto");
  const [stageOutputs, setStageOutputs] = useState<Record<number, string>>({});
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [operationName, setOperationName] = useState("");
  const [fastPreview, setFastPreview] = useState(true);
  const source = images.find((image) => image.id === sourceAssetId) ?? images[0];
  const startUrl = manualStartDataUrl || source?.previewUrl || "";
  const selectedEnd = images.find((image) => image.id === endAssetId);
  const endUrl = manualEndDataUrl || selectedEnd?.previewUrl || "";
  const qwenStartPrompt = useMemo(() => buildAlignedStartPrompt(), []);
  const perspectiveStages = useMemo(
    () => buildPerspectiveStages({
      horizontalAngle,
      verticalAngle,
      zoom,
      stageCount: stageCountOverride === "auto" ? undefined : Number(stageCountOverride),
    }),
    [horizontalAngle, stageCountOverride, verticalAngle, zoom],
  );
  const rawDelta = Math.hypot(endFocus.x - startFocus.x, endFocus.y - startFocus.y);
  const startCenterDelta = Math.hypot(startFocus.x - 0.5, startFocus.y - 0.5);
  const endCenterDelta = Math.hypot(endFocus.x - 0.5, endFocus.y - 0.5);
  const axesAligned = startCenterDelta <= 0.06 && endCenterDelta <= 0.06;
  const resultUrl = operationName
    ? `/api/video-studio/veo/download?operationName=${encodeURIComponent(operationName)}`
    : "";

  useEffect(() => {
    if (!manualEndDataUrl && (!endAssetId || endAssetId === sourceAssetId)) {
      setEndAssetId(images.find((image) => image.id !== sourceAssetId)?.id ?? "");
    }
  }, [endAssetId, images, manualEndDataUrl, sourceAssetId]);

  function resetPerspectiveStages() {
    setStageOutputs({});
    setManualEndDataUrl("");
    setStatus("idle");
  }

  async function readManualFrame(kind: "start" | "end", file?: File) {
    if (!file) return;
    if (!/^image\/(png|jpeg|webp)$/.test(file.type) || file.size > 2.5 * 1024 * 1024) {
      onNotice({ kind: "error", text: "Das Bild muss PNG, JPEG oder WebP und höchstens 2,5 MB groß sein." });
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    if (kind === "start") setManualStartDataUrl(dataUrl);
    else setManualEndDataUrl(dataUrl);
    setStatus("idle");
    onNotice({ kind: "success", text: `Der manuell erzeugte ${kind === "start" ? "Startstand" : "Endstand"} ist geladen. Markiere jetzt das Zielobjekt.` });
  }

  async function readStageOutput(stageIndex: number, file?: File) {
    if (!file) return;
    if (!/^image\/(png|jpeg|webp)$/.test(file.type) || file.size > 2.5 * 1024 * 1024) {
      onNotice({ kind: "error", text: "Das Etappenbild muss PNG, JPEG oder WebP und höchstens 2,5 MB groß sein." });
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    setStageOutputs((current) => ({ ...current, [stageIndex]: dataUrl }));
    if (stageIndex === perspectiveStages.length - 1) setManualEndDataUrl(dataUrl);
    setStatus("idle");
    onNotice({ kind: "success", text: `Qwen-Etappe ${stageIndex + 1} ist geladen${stageIndex === perspectiveStages.length - 1 ? " und als Endstand übernommen" : ". Sie ist die Referenz für die nächste Etappe"}.` });
  }

  async function startGeneration() {
    if (!startUrl || !endUrl) {
      onNotice({ kind: "error", text: "Startbild und Endperspektive werden benötigt." });
      return;
    }
    if (!axesAligned) {
      onNotice({ kind: "error", text: "Das Zielobjekt muss in Start- und Endstand auf der zentralen Achse liegen. Erzeuge zuerst die entsprechend ausgerichteten Qwen-Perspektiven." });
      return;
    }
    setStatus("starting");
    setOperationName("");
    try {
      const response = await fetch("/api/video-studio/veo/start", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          projectId,
          provider: "google",
          model: "veo-3.1-fast-generate-preview",
          qualityPreset: "product_fast_720p",
          duration: "8s",
          resolution: "720p",
          imageUrl: startUrl,
          lastFrameUrl: endUrl,
          startFocus,
          endFocus,
          prompt,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.operationName) throw new Error(payload.error ?? payload.details ?? "Google-Auftrag konnte nicht gestartet werden.");
      setOperationName(payload.operationName);
      setStatus("running");
      onNotice({ kind: "success", text: "Google hat genau einen ★★★-Auftrag angenommen. Die Endperspektive bleibt auf das Zielobjekt ausgerichtet." });
      await pollUntilComplete(payload.operationName);
    } catch (error) {
      setStatus("failed");
      onNotice({ kind: "error", text: error instanceof Error ? error.message : "Google-Auftrag ist fehlgeschlagen." });
    }
  }

  async function pollUntilComplete(name: string) {
    const deadline = Date.now() + 8 * 60 * 1000;
    while (Date.now() < deadline) {
      await new Promise((resolve) => window.setTimeout(resolve, 10_000));
      const params = new URLSearchParams({
        provider: "google",
        operationName: name,
        projectId,
        model: "veo-3.1-fast-generate-preview",
        durationSeconds: "8",
        resolution: "720p",
        generateAudio: "true",
      });
      const response = await fetch(`/api/video-studio/veo/status?${params.toString()}`, { cache: "no-store" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error ?? "Google-Status konnte nicht geladen werden.");
      if (payload.status?.status === "FAILED") throw new Error(payload.status.errorMessage ?? "Google hat den Auftrag abgelehnt.");
      if (payload.complete) {
        setStatus("completed");
        onNotice({ kind: "success", text: "Der API-Clip ist fertig und kann normal oder als vollständige 1,5-Sekunden-Demo geprüft werden." });
        return;
      }
    }
    throw new Error("Google benötigt länger als acht Minuten. Der Auftrag bleibt über seine Operation-ID nachvollziehbar.");
  }

  return (
    <section className="space-y-5 border border-border/70 bg-card p-5" data-ai-tool="perspective-video">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Perspektive → Bewegung</p>
          <h3 className="mt-1 text-xl font-semibold">Ein Zielobjekt, eine gemeinsame Bildachse</h3>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">Markiere in beiden vollständigen Bildern dasselbe Objekt. Die Markierungen beschreiben die gemeinsame Bewegungsachse, ohne das Motiv zu beschneiden oder bereits ein Ausgabeformat festzulegen.</p>
        </div>
        <div className="shrink-0 border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950"><strong>★★★</strong><br />Qwen + Google + Verarbeitung</div>
      </div>

      <div className="border border-border bg-muted/20 p-4">
        <label className="text-sm font-semibold">Original als räumliche Referenz<select value={sourceAssetId} onChange={(event) => { onSourceAssetId(event.target.value); setManualStartDataUrl(""); setStatus("idle"); }} className="mt-2 w-full border border-border bg-background px-3 py-2 text-sm">{images.map((image, index) => <option key={image.id} value={image.id}>Bild {index + 1} · {image.roomLabel ?? image.filename}</option>)}</select></label>
        {source?.previewUrl && <img src={source.previewUrl} alt="Unbeschnittenes Originalmotiv" className="mt-3 max-h-64 max-w-full object-contain" />}
        <p className="mt-2 text-xs text-muted-foreground">Dieses Bild belegt Raum, Geometrie und Ausstattung. Wenn das Zielobjekt darin nicht mittig steht, wird daraus zuerst ein physisch seitlich versetzter Startstand erzeugt.</p>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <FrameAxisEditor
          title="1 · Ausgerichteter Startstand"
          imageUrl={startUrl}
          focus={startFocus}
          onFocus={setStartFocus}
          selector={<div className="space-y-2"><div className="border border-border bg-muted/30 px-3 py-2 text-xs">{manualStartDataUrl ? "Manuell geladenes Qwen-Startbild" : "Noch das Originalmotiv"}</div><label className="flex cursor-pointer items-center justify-center gap-2 border border-dashed border-border px-3 py-2 text-sm font-semibold hover:border-primary"><Upload className="h-4 w-4" />Ausgerichteten Qwen-Startstand laden<input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => void readManualFrame("start", event.target.files?.[0])} /></label></div>}
        />
        <FrameAxisEditor
          title="2 · Endperspektive"
          imageUrl={endUrl}
          focus={endFocus}
          onFocus={setEndFocus}
          selector={<div className="space-y-2"><select value={manualEndDataUrl ? "manual" : endAssetId} onChange={(event) => { setManualEndDataUrl(""); setEndAssetId(event.target.value); setStatus("idle"); }} className="w-full border border-border bg-background px-3 py-2 text-sm"><option value="">Endbild wählen</option>{images.filter((image) => image.id !== sourceAssetId).map((image, index) => <option key={image.id} value={image.id}>Projektbild {index + 1} · {image.roomLabel ?? image.filename}</option>)}{manualEndDataUrl && <option value="manual">Manuell geladenes Qwen-Bild</option>}</select><label className="flex cursor-pointer items-center justify-center gap-2 border border-dashed border-border px-3 py-2 text-sm font-semibold hover:border-primary"><Upload className="h-4 w-4" />Qwen-/Endbild manuell laden<input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => void readManualFrame("end", event.target.files?.[0])} /></label></div>}
        />
      </div>

      <div className={`border p-4 text-sm ${axesAligned ? "border-emerald-300 bg-emerald-50 text-emerald-950" : "border-amber-300 bg-amber-50 text-amber-950"}`}>
        <CircleDot className="mr-2 inline h-4 w-4" />Zielachse: Start {(startCenterDelta * 100).toFixed(1)} % und Ende {(endCenterDelta * 100).toFixed(1)} % von der Bildmitte entfernt; Differenz {(rawDelta * 100).toFixed(1)} %. {axesAligned ? "Beide Stände liegen auf derselben zentralen Achse." : "Vor Google müssen beide Perspektiven das Zielobjekt mittig zeigen."}
      </div>

      <details className="border border-border p-4" open>
        <summary className="cursor-pointer font-semibold">Qwen-Endperspektive vorbereiten</summary>
        <p className="mt-3 text-xs text-muted-foreground">Qwen veröffentlicht keine belastbare Gradgrenze für einen einzelnen Perspektivsprung. Die Werkstatt teilt große Änderungen deshalb konservativ in prüfbare Etappen. Jede freigegebene Ausgabe wird zur Eingabe der nächsten Etappe.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <RangeField label={`Seitlicher Winkel ${horizontalAngle}°`} min={-90} max={90} value={horizontalAngle} onChange={(value) => { setHorizontalAngle(value); resetPerspectiveStages(); }} />
          <RangeField label={`Höhenwinkel ${verticalAngle}°`} min={-60} max={60} value={verticalAngle} onChange={(value) => { setVerticalAngle(value); resetPerspectiveStages(); }} />
          <RangeField label={`Zoom ${zoom}%`} min={-30} max={30} value={zoom} onChange={(value) => { setZoom(value); resetPerspectiveStages(); }} />
          <label className="text-xs font-semibold">Etappen<select value={stageCountOverride} onChange={(event) => { setStageCountOverride(event.target.value as typeof stageCountOverride); resetPerspectiveStages(); }} className="mt-2 w-full border border-border bg-background px-3 py-2 text-sm"><option value="auto">Automatisch · {perspectiveStages.length}</option><option value="1">1 · direkter Versuch</option><option value="2">2 · ein Zwischenstand</option><option value="3">3 · zwei Zwischenstände</option><option value="4">4 · sehr vorsichtig</option></select></label>
        </div>
        <label className="mt-4 block text-xs font-semibold">A · Startstand seitlich ausrichten<textarea value={qwenStartPrompt} readOnly rows={5} className="mt-2 w-full border border-border bg-muted/40 px-3 py-2 text-xs font-normal leading-relaxed" /></label>
        <div className="mt-4 space-y-3">
          <p className="text-xs font-semibold">B · Endperspektive in {perspectiveStages.length} Etappe{perspectiveStages.length === 1 ? "" : "n"}</p>
          {perspectiveStages.map((stage, index) => <section key={`${perspectiveStages.length}-${index}`} className="border border-border bg-muted/20 p-3"><div className="flex flex-wrap items-center justify-between gap-2"><strong className="text-sm">Etappe {index + 1} von {perspectiveStages.length}</strong><span className="text-xs text-muted-foreground">Eingabe: {index === 0 ? "ausgerichteter Startstand" : `freigegebene Etappe ${index}`}</span></div><p className="mt-2 text-xs">Δ seitlich {formatSigned(stage.horizontalAngle)}° · Δ Höhe {formatSigned(stage.verticalAngle)}° · Δ Zoom {formatSigned(stage.zoom)} %</p><textarea value={buildPerspectivePrompt(stage)} readOnly rows={5} className="mt-2 w-full border border-border bg-background px-3 py-2 text-xs leading-relaxed" /><div className="mt-2 flex flex-wrap items-center gap-2"><label className="flex cursor-pointer items-center gap-2 border border-dashed border-border px-3 py-2 text-xs font-semibold hover:border-primary"><Upload className="h-4 w-4" />{index === perspectiveStages.length - 1 ? "Endstand" : "Zwischenstand"} laden<input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => void readStageOutput(index, event.target.files?.[0])} /></label><span className={`text-xs font-semibold ${stageOutputs[index] ? "text-emerald-700" : "text-muted-foreground"}`}>{stageOutputs[index] ? "Geladen · Geometrie jetzt prüfen" : "Noch kein Ergebnis geladen"}</span></div></section>)}
        </div>
        <div className="mt-3 flex flex-wrap gap-2"><Button type="button" disabled variant="outline"><WandSparkles className="mr-2 h-4 w-4" />Mit Qwen erzeugen · Shared-Providerjob folgt</Button><span className="self-center text-xs text-muted-foreground">Bis dieser Job zentral persistiert wird, kann der User das erzeugte Endbild oben manuell laden.</span></div>
      </details>

      <div className="space-y-3">
        <label className="text-sm font-semibold">Google-Bewegungsanweisung<textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={5} className="mt-2 w-full border border-border bg-background px-3 py-2 text-sm leading-relaxed" /></label>
        <div className="flex flex-wrap items-center gap-3"><Button type="button" disabled={!startUrl || !endUrl || !axesAligned || status === "starting" || status === "running"} onClick={() => void startGeneration()}>{status === "starting" || status === "running" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}Google Fast erzeugen · ca. 0,80 USD</Button><span className="text-xs text-muted-foreground">Ein Auftrag · 8 s · 720p · erwartete Demo 1,5 s. Das Ausgabeformat wird separat festgelegt.</span></div>
      </div>

      {status === "completed" && resultUrl && <div className="space-y-3 border border-emerald-300 bg-emerald-50 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><strong>Ergebnis</strong><label className="flex items-center gap-2 text-xs font-semibold"><input type="checkbox" checked={fastPreview} onChange={(event) => setFastPreview(event.target.checked)} />Als vollständige 1,5-s-Demo abspielen</label></div><video key={`${resultUrl}-${fastPreview}`} src={resultUrl} controls autoPlay muted playsInline className="mx-auto max-h-[640px] bg-black" onLoadedMetadata={(event) => { event.currentTarget.playbackRate = fastPreview ? 8 / 1.5 : 1; }} onPlay={(event) => { event.currentTarget.playbackRate = fastPreview ? 8 / 1.5 : 1; }} /></div>}
    </section>
  );
}

function FrameAxisEditor({ title, imageUrl, focus, onFocus, selector }: { title: string; imageUrl: string; focus: Focus; onFocus: (focus: Focus) => void; selector: ReactNode }) {
  return <section className="space-y-3 border border-border p-4"><h4 className="font-semibold">{title}</h4>{selector}{imageUrl ? <div className="relative mx-auto w-fit max-w-full cursor-crosshair overflow-hidden bg-black" onClick={(event) => { const box = event.currentTarget.getBoundingClientRect(); onFocus({ x: Math.max(0, Math.min(1, (event.clientX - box.left) / box.width)), y: Math.max(0, Math.min(1, (event.clientY - box.top) / box.height)) }); }}><img src={imageUrl} alt={title} className="block max-h-[440px] max-w-full object-contain" /><span className="pointer-events-none absolute h-px bg-amber-300" style={{ left: 0, right: 0, top: `${focus.y * 100}%` }} /><span className="pointer-events-none absolute w-px bg-amber-300" style={{ top: 0, bottom: 0, left: `${focus.x * 100}%` }} /><span className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-amber-500 shadow" style={{ left: `${focus.x * 100}%`, top: `${focus.y * 100}%` }} /></div> : <div className="flex min-h-72 items-center justify-center border border-dashed border-border text-sm text-muted-foreground">Endperspektive wählen oder laden</div>}<p className="text-xs text-muted-foreground">Zielpunkt X {(focus.x * 100).toFixed(0)} % · Y {(focus.y * 100).toFixed(0)} % · vollständiges Motiv</p></section>;
}

function RangeField({ label, min, max, value, onChange }: { label: string; min: number; max: number; value: number; onChange: (value: number) => void }) {
  return <label className="text-xs font-semibold">{label}<input type="range" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} className="mt-2 w-full" /></label>;
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Bild konnte nicht gelesen werden."));
    reader.onerror = () => reject(reader.error ?? new Error("Bild konnte nicht gelesen werden."));
    reader.readAsDataURL(file);
  });
}

function buildPerspectivePrompt({ horizontalAngle, verticalAngle, zoom }: { horizontalAngle: number; verticalAngle: number; zoom: number }) {
  const horizontal = horizontalAngle === 0 ? "no horizontal camera rotation" : `${Math.abs(horizontalAngle)} degrees ${horizontalAngle < 0 ? "to the left" : "to the right"}`;
  const vertical = verticalAngle === 0 ? "the same camera height" : `${Math.abs(verticalAngle)} degrees ${verticalAngle > 0 ? "higher with a downward view" : "lower with an upward view"}`;
  const zoomText = zoom === 0 ? "no digital zoom" : `${Math.abs(zoom)} percent ${zoom > 0 ? "closer" : "wider"}`;
  return `Create only the next small photorealistic camera-perspective step of this exact real-estate room: ${horizontal}, ${vertical}, ${zoomText}. Use the supplied image as the exact previous approved stage. Keep the selected target object on the optical center axis and retain the complete composition. Preserve the exact room geometry, walls, windows, doors, furniture, materials, lighting, colors, object count and object positions. Do not add, remove, move, duplicate, reshape or redesign anything. This is a physical camera-position change, not a crop-only transformation. Do not jump beyond this one step, crop the image or choose a delivery format.`;
}

function buildAlignedStartPrompt() {
  return "Create an aligned starting camera view of this exact real-estate room. Physically move the camera sideways just enough to place the selected target object exactly on the optical center axis, while keeping the camera height and viewing direction otherwise unchanged. Preserve the complete composition and the exact room geometry, walls, windows, doors, furniture, materials, lighting, colors, object count and object positions. Do not add, remove, move, duplicate, reshape or redesign anything. Do not crop, zoom or choose a new delivery format.";
}

function buildPerspectiveStages({ horizontalAngle, verticalAngle, zoom, stageCount }: { horizontalAngle: number; verticalAngle: number; zoom: number; stageCount?: number }): PerspectiveStage[] {
  const conservativeCount = Math.max(
    1,
    Math.ceil(Math.abs(horizontalAngle) / 30),
    Math.ceil(Math.abs(verticalAngle) / 20),
    Math.ceil(Math.abs(zoom) / 15),
  );
  const count = Math.max(1, Math.min(4, stageCount ?? conservativeCount));
  return Array.from({ length: count }, () => ({
    horizontalAngle: roundStageValue(horizontalAngle / count),
    verticalAngle: roundStageValue(verticalAngle / count),
    zoom: roundStageValue(zoom / count),
  }));
}

function roundStageValue(value: number) {
  return Math.round(value * 10) / 10;
}

function formatSigned(value: number) {
  return `${value > 0 ? "+" : ""}${value}`;
}
