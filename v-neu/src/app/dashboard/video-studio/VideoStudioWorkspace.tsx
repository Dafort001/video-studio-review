"use client";



import Link from "next/link";
import { useMemo, useState } from "react";
import { Camera, Check, Clapperboard, Loader2, Play, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/Input";
import { buildBrokerPrompt, motionLabels, VIDEO_STUDIO_MOTIONS, type VideoStudioCrop, type VideoStudioJob, type VideoStudioMotion } from "@/lib/video-studio";

type Mode = "timeline" | "motion" | "broker";

type Props = {
  jobs: VideoStudioJob[];
  activeJobId?: string;
  mode: Mode;
};

type SaveStatus = {
  busy: boolean;
  message: string | null;
  error: string | null;
};

export function VideoStudioWorkspace({ jobs, activeJobId, mode }: Props) {
  const [localJobs, setLocalJobs] = useState(jobs);
  const activeJob = localJobs.find((job) => job.jobId === activeJobId) ?? localJobs[0] ?? null;
  const [selectedImageId, setSelectedImageId] = useState(activeJob?.shots[0]?.imageId ?? "");
  const selectedShot = activeJob?.shots.find((shot) => shot.imageId === selectedImageId) ?? activeJob?.shots[0] ?? null;
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({ busy: false, message: null, error: null });
  const [renderStatus, setRenderStatus] = useState<SaveStatus & {
    requestId?: string | null;
    operationName?: string | null;
    statusUrl?: string | null;
    responseUrl?: string | null;
    model?: string | null;
    costEstimate?: { estimatedCostUsd?: number; currency?: string } | null;
    videoUrl?: string | null;
  }>({
    busy: false,
    message: null,
    error: null,
  });

  const centralHref = activeJob
    ? `/dashboard/video-studio/setup?jobId=${encodeURIComponent(activeJob.jobId)}`
    : "/dashboard/video-studio/setup";
  const totalDuration = useMemo(
    () => activeJob?.shots.reduce((sum, shot) => sum + shot.durationSeconds, 0) ?? 0,
    [activeJob],
  );

  if (localJobs.length === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
        <Clapperboard className="mb-4 h-12 w-12 text-muted-foreground/40" />
        <h1 className="text-2xl font-semibold text-foreground">Noch kein Video-Projekt bereit</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Sobald ein Video-Testmotiv freigegeben wurde, erscheint hier der Schnitt.
        </p>
      </div>
    );
  }

  if (!activeJob || !selectedShot) return null;

  const navigation = [
    {
      href: centralHref,
      label: "Zentrale Werkstatt",
      icon: Clapperboard,
      active: false,
    },
  ];

  async function saveShot(patch: Partial<typeof selectedShot>) {
    if (!selectedShot) return;
    const nextShot = { ...selectedShot, ...patch };
    setSaveStatus({ busy: true, message: null, error: null });

    const response = await fetch("/api/video-studio/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageId: nextShot.imageId,
        durationSeconds: nextShot.durationSeconds,
        motionType: nextShot.motionType,
        startCrop: nextShot.startCrop,
        endCrop: nextShot.endCrop,
        caption: nextShot.caption,
        promptNote: nextShot.promptNote,
        brokerPrompt: nextShot.brokerPrompt,
        brokerEnabled: nextShot.brokerEnabled,
      }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setSaveStatus({ busy: false, message: null, error: payload.error ?? "Speichern fehlgeschlagen." });
      return;
    }

    setLocalJobs((currentJobs) => currentJobs.map((job) => {
      if (job.id !== activeJob.id) return job;
      return {
        ...job,
        shots: job.shots.map((shot) => shot.imageId === selectedShot.imageId ? nextShot : shot),
      };
    }));
    setSaveStatus({ busy: false, message: "Gespeichert.", error: null });
  }

  async function startVideoRender() {
    if (!selectedShot) return;
    setRenderStatus({ busy: true, message: "Video-Rendering wird gestartet ...", error: null });
    const prompt = buildBrokerPrompt({
      candidateLabel: activeJob.candidateLabel,
      shotCaption: selectedShot.caption,
      motionLabel: motionLabels[selectedShot.motionType],
      customPrompt: selectedShot.brokerPrompt,
    });

    const response = await fetch("/api/video-studio/render/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: "candidate-10-shared-video-project-v1",
        qualityPreset: "product_fast_720p",
        prompt,
        imageUrl: selectedShot.imageUrl,
      }),
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      setRenderStatus({
        busy: false,
        message: null,
        error: payload.error ?? "Video-Rendering konnte nicht gestartet werden.",
      });
      return;
    }

    setRenderStatus({
      busy: false,
      message: "Videoauftrag wurde gestartet.",
      error: null,
      requestId: payload.requestId ?? null,
      operationName: payload.operationName ?? null,
      statusUrl: payload.statusUrl ?? null,
      responseUrl: payload.responseUrl ?? null,
      model: payload.model ?? null,
      costEstimate: payload.costEstimate ?? null,
    });

    if (payload.operationName || payload.requestId) {
      void pollVideoRenderStatus({
        requestId: payload.requestId ?? null,
        operationName: payload.operationName ?? null,
        statusUrl: payload.statusUrl ?? null,
        responseUrl: payload.responseUrl ?? null,
        model: payload.model ?? null,
      });
    }
  }

  async function pollVideoRenderStatus(input: {
    requestId: string | null;
    operationName: string | null;
    statusUrl: string | null;
    responseUrl: string | null;
    model: string | null;
  }) {
    for (let attempt = 0; attempt < 12; attempt += 1) {
      await new Promise((resolve) => window.setTimeout(resolve, attempt === 0 ? 1000 : 5000));
      const params = new URLSearchParams({
        projectId: "candidate-10-shared-video-project-v1",
        qualityPreset: "product_fast_720p",
      });
      if (input.requestId) params.set("requestId", input.requestId);
      if (input.operationName) params.set("operationName", input.operationName);
      if (input.statusUrl) params.set("statusUrl", input.statusUrl);
      if (input.responseUrl) params.set("responseUrl", input.responseUrl);
      if (input.model) params.set("model", input.model);
      const response = await fetch(`/api/video-studio/render/status?${params.toString()}`);
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setRenderStatus((current) => ({
          ...current,
          busy: false,
          error: payload.error ?? "Renderstatus konnte nicht geladen werden.",
        }));
        return;
      }
      const providerStatus = typeof payload.status?.status === "string" ? payload.status.status : "IN_PROGRESS";
      if (payload.complete) {
        const videoUrl = typeof payload.result?.video?.url === "string" ? payload.result.video.url : null;
        setRenderStatus((current) => ({
          ...current,
          busy: false,
          message: videoUrl ? "Video ist fertig." : "Rendering ist fertig.",
          error: null,
          videoUrl,
        }));
        return;
      }
      setRenderStatus((current) => ({
        ...current,
        busy: false,
        message: providerStatus === "IN_QUEUE" ? "Video wartet in der Warteschlange." : "Video rendert gerade.",
      }));
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-16">
      <header className="border-b border-border pb-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Video-Werkstatt</p>
            <h1 className="mt-1 text-3xl font-bold text-foreground">{activeJob.projectName}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {activeJob.shots.length} Bilder · {totalDuration.toFixed(2)} Sekunden · {activeJob.propertyAddress ?? activeJob.candidateLabel}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {localJobs.map((job) => (
              <Button key={job.id} asChild variant={job.id === activeJob.id ? "primary" : "outline"} size="sm">
                <Link href={`/dashboard/video-studio/setup?jobId=${encodeURIComponent(job.jobId)}`}>
                  Motiv {job.candidateIndex}
                </Link>
              </Button>
            ))}
          </div>
        </div>
        <nav className="mt-6 flex flex-wrap gap-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Button key={item.href} asChild variant={item.active ? "primary" : "ghost"} size="sm">
                <Link href={item.href}>
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Link>
              </Button>
            );
          })}
        </nav>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <main className="space-y-5">
          {mode === "timeline" && (
            <TimelineView
              job={activeJob}
              selectedImageId={selectedShot.imageId}
              onSelect={setSelectedImageId}
            />
          )}
          {mode === "motion" && (
            <MotionView key={selectedShot.imageId} shot={selectedShot} onSave={saveShot} saveStatus={saveStatus} />
          )}
          {mode === "broker" && (
            <BrokerView
              key={selectedShot.imageId}
              job={activeJob}
              shot={selectedShot}
              onSave={saveShot}
              onStartVideoRender={startVideoRender}
              saveStatus={saveStatus}
              renderStatus={renderStatus}
            />
          )}
        </main>

        <aside className="space-y-4">
          <div className="overflow-hidden border border-border bg-card">
            <div className="aspect-[9/16] bg-muted">
              <img src={selectedShot.imageUrl} alt={selectedShot.caption || activeJob.projectName} className="h-full w-full object-cover" />
            </div>
            <div className="space-y-2 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-foreground">Bild {selectedShot.order}</p>
                <span className="text-xs text-muted-foreground">{selectedShot.durationSeconds.toFixed(2)} s</span>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{selectedShot.caption || selectedShot.roomLabel}</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function TimelineView({
  job,
  selectedImageId,
  onSelect,
}: {
  job: VideoStudioJob;
  selectedImageId: string;
  onSelect: (imageId: string) => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {job.shots.map((shot) => (
        <button
          key={shot.imageId}
          type="button"
          onClick={() => onSelect(shot.imageId)}
          className={`group overflow-hidden border bg-card text-left transition ${selectedImageId === shot.imageId ? "border-primary" : "border-border hover:border-primary/50"}`}
        >
          <div className="aspect-[4/3] overflow-hidden bg-muted">
            <img src={shot.imageUrl} alt={shot.caption || `Bild ${shot.order}`} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
          </div>
          <div className="space-y-2 p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-foreground">{String(shot.order).padStart(2, "0")}</span>
              <span className="text-xs text-muted-foreground">{motionLabels[shot.motionType]}</span>
            </div>
            <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{shot.caption || shot.roomLabel}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

function MotionView({
  shot,
  onSave,
  saveStatus,
}: {
  shot: VideoStudioJob["shots"][number];
  onSave: (patch: Partial<VideoStudioJob["shots"][number]>) => void;
  saveStatus: SaveStatus;
}) {
  const [durationSeconds, setDurationSeconds] = useState(shot.durationSeconds);
  const [motionType, setMotionType] = useState<VideoStudioMotion>(shot.motionType);
  const [startCrop, setStartCrop] = useState(shot.startCrop);
  const [endCrop, setEndCrop] = useState(shot.endCrop);
  const [caption, setCaption] = useState(shot.caption);

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Dauer"
          type="number"
          min="0.5"
          max="8"
          step="0.25"
          value={durationSeconds}
          onChange={(event) => setDurationSeconds(Number(event.target.value))}
        />
        <label className="space-y-2">
          <span className="text-sm font-medium text-foreground">Bewegung</span>
          <select
            value={motionType}
            onChange={(event) => setMotionType(event.target.value as VideoStudioMotion)}
            className="h-11 w-full border border-input bg-background px-3 text-sm text-foreground"
          >
            {VIDEO_STUDIO_MOTIONS.map((motion) => (
              <option key={motion} value={motion}>{motionLabels[motion]}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <CropControls title="Start" crop={startCrop} onChange={setStartCrop} />
        <CropControls title="Ende" crop={endCrop} onChange={setEndCrop} />
      </div>

      <label className="space-y-2">
        <span className="text-sm font-medium text-foreground">Bildtext</span>
        <Textarea value={caption} onChange={(event) => setCaption(event.target.value)} className="min-h-28" />
      </label>

      <StatusLine status={saveStatus} />
      <Button onClick={() => onSave({ durationSeconds, motionType, startCrop, endCrop, caption })} disabled={saveStatus.busy}>
        {saveStatus.busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
        Speichern
      </Button>
    </section>
  );
}

function BrokerView({
  job,
  shot,
  onSave,
  onStartVideoRender,
  saveStatus,
  renderStatus,
}: {
  job: VideoStudioJob;
  shot: VideoStudioJob["shots"][number];
  onSave: (patch: Partial<VideoStudioJob["shots"][number]>) => void;
  onStartVideoRender: () => void;
  saveStatus: SaveStatus;
  renderStatus: SaveStatus & {
    requestId?: string | null;
    model?: string | null;
    costEstimate?: { estimatedCostUsd?: number; currency?: string } | null;
    videoUrl?: string | null;
  };
}) {
  const [brokerEnabled, setBrokerEnabled] = useState(shot.brokerEnabled ?? false);
  const [brokerPrompt, setBrokerPrompt] = useState(
    shot.brokerPrompt || buildBrokerPrompt({
      candidateLabel: job.candidateLabel,
      shotCaption: shot.caption,
      motionLabel: motionLabels[shot.motionType],
    }),
  );

  return (
    <section className="space-y-6">
      {job.candidateIndex === 10 && (
        <div className="overflow-hidden border border-border bg-card">
          <video
            controls
            className="aspect-[9/16] w-full bg-black"
            src="/demo/video-studio/candidate-10-maklerin-first-preview.mp4"
          />
        </div>
      )}

      <label className="flex items-center gap-3 text-sm font-medium text-foreground">
        <input
          type="checkbox"
          checked={brokerEnabled}
          onChange={(event) => setBrokerEnabled(event.target.checked)}
          className="h-4 w-4 accent-primary"
        />
        Maklerin fuer diesen Einstieg verwenden
      </label>

      <label className="space-y-2">
        <span className="text-sm font-medium text-foreground">Prompt</span>
        <Textarea value={brokerPrompt} onChange={(event) => setBrokerPrompt(event.target.value)} className="min-h-44" />
      </label>

      <div className="flex flex-wrap gap-3">
        <Button onClick={() => onSave({ brokerEnabled, brokerPrompt })} disabled={saveStatus.busy}>
          {saveStatus.busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Speichern
        </Button>
        <Button type="button" variant="outline" onClick={onStartVideoRender} disabled={renderStatus.busy}>
          {renderStatus.busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
          Video starten
        </Button>
      </div>

      <StatusLine status={saveStatus} />
      <StatusLine status={renderStatus} />
      {renderStatus.videoUrl && (
        <div className="overflow-hidden border border-border bg-card">
          <video controls className="aspect-[9/16] w-full bg-black" src={renderStatus.videoUrl} />
        </div>
      )}
      {renderStatus.requestId && (
        <div className="space-y-1 text-xs text-muted-foreground">
          <p className="flex items-center gap-2">
            <Camera className="h-3.5 w-3.5" />
            Auftrag: {renderStatus.requestId}
          </p>
          {typeof renderStatus.costEstimate?.estimatedCostUsd === "number" && (
            <p>
              Projektkosten geschaetzt: {renderStatus.costEstimate.estimatedCostUsd.toFixed(2)} {renderStatus.costEstimate.currency ?? "USD"}
            </p>
          )}
        </div>
      )}
    </section>
  );
}

function CropControls({ title, crop, onChange }: { title: string; crop: VideoStudioCrop; onChange: (crop: VideoStudioCrop) => void }) {
  return (
    <div className="space-y-4 border border-border bg-card p-4">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <SliderRow label="Links/Rechts" value={crop.x} min={0} max={16} step={0.5} onChange={(x) => onChange({ ...crop, x })} />
      <SliderRow label="Oben/Unten" value={crop.y} min={0} max={16} step={0.5} onChange={(y) => onChange({ ...crop, y })} />
      <SliderRow label="Zoom" value={crop.scale} min={1} max={1.6} step={0.01} onChange={(scale) => onChange({ ...crop, scale })} />
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
        {label}
        <span>{value.toFixed(step < 0.1 ? 2 : 1)}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

function StatusLine({ status }: { status: SaveStatus }) {
  if (!status.message && !status.error) return null;
  return (
    <p className={`flex items-center gap-2 text-sm ${status.error ? "text-destructive" : "text-emerald-600"}`}>
      {!status.error && <Check className="h-4 w-4" />}
      {status.error ?? status.message}
    </p>
  );
}
