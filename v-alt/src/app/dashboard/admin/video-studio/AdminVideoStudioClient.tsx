"use client";



import Link from "next/link";
import { useState } from "react";
import { Check, Clapperboard, Database, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import type { VideoStudioJob } from "@/lib/video-studio";

type Props = {
  jobs: VideoStudioJob[];
};

type ImportState = {
  busy: boolean;
  message: string | null;
  error: string | null;
};

export function AdminVideoStudioClient({ jobs }: Props) {
  const [customerEmail, setCustomerEmail] = useState("");
  const [state, setState] = useState<ImportState>({ busy: false, message: null, error: null });

  async function runImport() {
    setState({ busy: true, message: null, error: null });
    const response = await fetch("/api/admin/video-studio/import-demo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerEmail: customerEmail.trim() || undefined }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setState({ busy: false, message: null, error: payload.error ?? "Import fehlgeschlagen." });
      return;
    }
    setState({
      busy: false,
      message: `${payload.imported?.length ?? 0} Motive importiert. Seite neu laden, falls sie unten noch fehlen.`,
      error: null,
    });
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-16">
      <header className="border-b border-border pb-6">
        <p className="text-sm font-medium text-primary">Admin</p>
        <h1 className="mt-1 text-3xl font-bold text-foreground">Video-Werkstatt</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Demo-Motive, Schnittdaten, Bewegungsdaten und Video-Rendering.
        </p>
      </header>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-3">
            <Database className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Testdaten importieren</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
            <Input
              label="Kunden-E-Mail"
              value={customerEmail}
              onChange={(event) => setCustomerEmail(event.target.value)}
              placeholder="leer lassen fuer Daniel"
            />
            <div className="flex items-end">
              <Button onClick={runImport} disabled={state.busy}>
                {state.busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
                Import
              </Button>
            </div>
          </div>
          <Status state={state} />
        </div>

        <div className="border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Renderweg</h2>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Aktiver Video-Renderweg ist intern konfiguriert.</p>
            <p>Weitere Renderwege sind fuer spaetere Preis- und Sicherheitsvergleiche vorbereitet.</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <Clapperboard className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Vorhandene Motive</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {jobs.map((job) => (
            <article key={job.id} className="border border-border bg-card">
              <img src={job.shots[0]?.imageUrl} alt={job.projectName} className="aspect-[4/3] w-full object-cover" />
              <div className="space-y-3 p-4">
                <div>
                  <p className="text-xs font-medium text-primary">Motiv {job.candidateIndex}</p>
                  <h3 className="mt-1 text-base font-semibold text-foreground">{job.projectName}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{job.shots.length} Bilder · {job.durationSeconds.toFixed(2)} Sekunden</p>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/dashboard/video-studio/setup?jobId=${encodeURIComponent(job.jobId)}`}>
                    <Clapperboard className="mr-2 h-3.5 w-3.5" />
                    Zentrale Werkstatt
                  </Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function Status({ state }: { state: ImportState }) {
  if (!state.message && !state.error) return null;
  return (
    <p className={`mt-4 flex items-center gap-2 text-sm ${state.error ? "text-destructive" : "text-emerald-600"}`}>
      {!state.error && <Check className="h-4 w-4" />}
      {state.error ?? state.message}
    </p>
  );
}
