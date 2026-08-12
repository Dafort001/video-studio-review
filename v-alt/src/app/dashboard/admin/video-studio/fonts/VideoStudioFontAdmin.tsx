"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Save, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { VideoStudioFont } from "@/lib/video-studio-font-catalog";
import fontStyles from "@/app/dashboard/video-studio/workbench/[projectId]/videoStudioFonts.module.css";

export function VideoStudioFontAdmin({ initialFonts }: { initialFonts: VideoStudioFont[] }) {
  const [fonts, setFonts] = useState(initialFonts);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  function move(index: number, delta: -1 | 1) {
    const target = index + delta;
    if (target < 0 || target >= fonts.length) return;
    const next = [...fonts];
    [next[index], next[target]] = [next[target], next[index]];
    setFonts(next.map((font, order) => ({ ...font, order })));
  }
  async function save() {
    setBusy(true); setMessage(null);
    const response = await fetch("/api/admin/video-studio/fonts", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ fonts }) });
    const payload = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) { setMessage(payload.error ?? "Schriftmenü konnte nicht gespeichert werden."); return; }
    setFonts(payload.fonts); setMessage("Schriftmenü gespeichert.");
  }
  return <div className={`${fontStyles.scope} mx-auto max-w-4xl space-y-6 pb-16`}>
    <header className="border-b border-border pb-5"><p className="text-sm font-semibold text-primary">Admin · Video-Werkstatt</p><h1 className="mt-1 text-3xl font-bold">Schriftmenü</h1><p className="mt-2 text-sm text-muted-foreground">Hier wird nur festgelegt, welche technisch eingebetteten Schriften Benutzer sehen und in welcher Reihenfolge. Farbe, Größe, Position, Laufweite und Breite stellt der Benutzer selbst ein.</p></header>
    <div className="space-y-2">{fonts.map((font, index) => <div key={font.family} className="flex items-center gap-3 border border-border bg-card p-3">
      <Type className="h-4 w-4 text-primary" /><div className="min-w-0 flex-1"><p className="truncate text-lg" style={{ fontFamily: `"${font.family}", ${font.fallback}` }}>{font.label}</p><p className="text-xs capitalize text-muted-foreground">{font.group}</p></div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={font.active} onChange={(event) => setFonts((current) => current.map((item) => item.family === font.family ? { ...item, active: event.target.checked } : item))} /> im Menü</label>
      <Button type="button" size="sm" variant="outline" aria-label="Nach oben" disabled={index === 0} onClick={() => move(index, -1)}><ArrowUp className="h-4 w-4" /></Button>
      <Button type="button" size="sm" variant="outline" aria-label="Nach unten" disabled={index === fonts.length - 1} onClick={() => move(index, 1)}><ArrowDown className="h-4 w-4" /></Button>
    </div>)}</div>
    <div className="flex items-center gap-4"><Button disabled={busy || !fonts.some((font) => font.active)} onClick={save}><Save className="mr-2 h-4 w-4" /> Speichern</Button>{message && <p className="text-sm text-muted-foreground">{message}</p>}</div>
  </div>;
}
