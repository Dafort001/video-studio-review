"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

type LaunchState =
  | { status: "loading" }
  | { status: "error"; message: string };

export default function VideoStudioLaunchPage() {
  const [state, setState] = useState<LaunchState>({ status: "loading" });

  useEffect(() => {
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const launchCode = fragment.get("launchCode")?.trim() ?? "";
    window.history.replaceState(null, "", window.location.pathname);
    if (!launchCode) {
      void Promise.resolve().then(() =>
        setState({
          status: "error",
          message: "Der Werkstatt-Link ist unvollständig oder abgelaufen.",
        }),
      );
      return;
    }

    void fetch("/api/video-studio/workbench-launch/redeem", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ launchCode }),
    })
      .then(async (response) => {
        const payload = (await response.json().catch(() => ({}))) as {
          workbenchUrl?: string;
          error?: string;
        };
        if (!response.ok || !payload.workbenchUrl) {
          throw new Error(
            payload.error ?? "Die Video-Werkstatt konnte nicht geöffnet werden.",
          );
        }
        window.location.replace(payload.workbenchUrl);
      })
      .catch((error) => {
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Die Video-Werkstatt konnte nicht geöffnet werden.",
        });
      });
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#101010] px-6 text-white">
      <div className="max-w-md text-center">
        {state.status === "loading" ? (
          <>
            <Loader2 className="mx-auto h-8 w-8 animate-spin" />
            <h1 className="mt-5 text-2xl font-semibold">
              Video-Werkstatt wird geöffnet
            </h1>
            <p className="mt-2 text-sm text-white/65">
              Projekt und Bilder werden sicher geladen.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold">Link nicht mehr gültig</h1>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              {state.message}
            </p>
            <p className="mt-2 text-sm text-white/55">
              Bitte öffne die Video-Werkstatt erneut aus deinem Portal.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
