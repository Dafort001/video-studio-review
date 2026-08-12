"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, Images, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { VideoStudioSetupJob } from "@/lib/video-studio-server";
import { defaultVideoProjectBriefing, type VideoProjectBriefing } from "@/lib/video-project-briefing";

type Props = {
  jobs: VideoStudioSetupJob[];
  initialJobReference: string | null;
  initialBriefing: VideoProjectBriefing | null;
  isAdmin: boolean;
  workbenchArea?: "customer" | "admin";
};

export function VideoStudioSetupClient({ jobs, initialJobReference, isAdmin, workbenchArea = "customer" }: Props) {
  const [jobReference, setJobReference] = useState(initialJobReference ?? jobs[0]?.reference ?? "");
  const [status, setStatus] = useState<{ busy: boolean; error: string | null }>({ busy: false, error: null });
  const activeJob = jobs.find((job) => job.reference === jobReference) ?? null;

  async function openWorkbench() {
    if (!activeJob) return;
    setStatus({ busy: true, error: null });
    const briefing = defaultVideoProjectBriefing({
      jobId: activeJob.reference,
      projectName: activeJob.projectName,
      locationLabel: activeJob.propertyAddress,
      images: activeJob.images,
    });
    const response = await fetch(`/api/video-studio/shared/jobs/${encodeURIComponent(activeJob.reference)}/handoff`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(briefing),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setStatus({ busy: false, error: payload.error ?? "Die Video-Werkstatt konnte nicht geöffnet werden." });
      return;
    }
    const destination = workbenchArea === "admin"
      ? String(payload.workbenchUrl).replace("/dashboard/video-studio/workbench/", "/dashboard/admin/video-studio/workbench/")
      : payload.workbenchUrl;
    window.location.assign(destination);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-16">
      <header className="border-b border-border pb-6">
        <p className="text-sm font-medium text-primary">PixImmo Video</p>
        <h1 className="mt-1 text-3xl font-bold tracking-[-0.025em] text-foreground">Projekt für die Video-Werkstatt wählen</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Öffne einen Auftrag und beginne direkt mit den freigegebenen Bildern. Länge, Auswahl, Start, Ende und Reihenfolge werden erst in der Werkstatt festgelegt.
        </p>
      </header>

      {jobs.length === 0 ? (
        <section className="border border-dashed border-border p-8 text-center">
          <Images className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 font-semibold">Noch kein Auftrag mit fertigen Bildern vorhanden.</p>
        </section>
      ) : (
        <section className="space-y-5">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {jobs.map((job) => {
              const selected = job.reference === jobReference;
              return (
                <button
                  key={job.id}
                  type="button"
                  onClick={() => {
                    setJobReference(job.reference);
                    setStatus({ busy: false, error: null });
                  }}
                  className={`group border p-5 text-left transition ${selected ? "border-primary bg-primary/5 ring-2 ring-primary/15" : "border-border bg-card hover:border-primary/50"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">{job.reference}</p>
                      <h2 className="mt-2 text-lg font-semibold text-foreground">{job.projectName}</h2>
                      {job.propertyAddress && <p className="mt-1 text-xs text-muted-foreground">{job.propertyAddress}</p>}
                    </div>
                    {selected && <Check className="h-5 w-5 shrink-0 text-primary" />}
                  </div>
                  <div className="mt-5 flex items-center justify-between border-t border-border/70 pt-3 text-xs">
                    <span className="font-semibold text-foreground">{job.readyImageCount} Bilder</span>
                    <span className="text-muted-foreground">freigegeben</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="sticky bottom-4 z-10 flex flex-col gap-4 border border-primary/30 bg-background/95 p-5 shadow-xl backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">{activeJob ? `${activeJob.projectName} · ${activeJob.readyImageCount} Bilder` : "Auftrag auswählen"}</p>
              <p className="mt-1 text-xs text-muted-foreground">Die Werkstatt nimmt keine automatische Motivauswahl vor.</p>
              {status.error && <p className="mt-2 text-sm text-destructive">{status.error}</p>}
            </div>
            <Button disabled={!activeJob || status.busy || activeJob.readyImageCount === 0} onClick={openWorkbench}>
              {status.busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Images className="mr-2 h-4 w-4" />}
              Bilder in der Werkstatt öffnen
              {!status.busy && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </section>
      )}

      {isAdmin && (
        <Button asChild variant="outline" size="sm">
          <Link href={`/dashboard/admin/intake?mode=final-jpg${activeJob ? `&job=${encodeURIComponent(activeJob.reference)}` : ""}`}>
            <Upload className="mr-2 h-4 w-4" /> Fertige JPGs hinzufügen
          </Link>
        </Button>
      )}
    </div>
  );
}
