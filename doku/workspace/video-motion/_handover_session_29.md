# Handover Session 29

## Was wurde erstellt?

Session 29 hat den internen Shotplan Builder vorbereitet.

Neu erstellt:

- `internal/motion-lab/client/ShotplanBuilder.ts`
- `internal/motion-lab/server/shotplans.ts`
- `docs/video-motion/_handover_session_29.md`

## Welche Dateien wurden geaendert?

Session-29-eigene neue Dateien:

- `internal/motion-lab/client/ShotplanBuilder.ts`
- `internal/motion-lab/server/shotplans.ts`
- `docs/video-motion/_handover_session_29.md`

## Welche Entscheidungen wurden getroffen?

- Der Builder bleibt ein internes TypeScript-Scaffold, keine gerenderte UI.
- Produkt-Templates und Creative Profiles werden aus den Phase-1-JSON-Dateien
  geladen.
- Automatische Shotplans nutzen die bestehende `buildShotPlan`-Logik aus
  `src/videoMotion`.
- Assets ohne `motif_class` werden uebersprungen und als Warnung sichtbar
  gemacht.
- Reihenfolge, Shot-Dauer und Preset pro Shot koennen ueber pure Helper
  geaendert werden.
- Text- und Avatar-Slots werden aus Preset- und Produkt-Template-Regeln sichtbar
  gemacht.
- Es gibt keine Preview-Render-Integration und keine Persistenz.

## Was ist bewusst noch offen?

- Keine echte UI-Komponente.
- Keine Drag-and-drop-Oberflaeche.
- Keine Persistenz von Shotplans.
- Keine Renderjobs.
- Keine Quality-Gate-Auswertung.
- Keine echte Avatar-, Qwen- oder Typography-Komposition.
- Keine Verbindung zum Preview Video Renderer aus Session 30.

## Was soll die naechste Session tun?

Session 30 soll ausschliesslich den Preview Video Renderer vorbereiten:

- `internal/motion-lab/client/PreviewRenderer.*`
- `internal/motion-lab/server/renderJobs.*`
- `docs/video-motion/_handover_session_30.md`

## Welche Dateien muss die naechste Session zuerst lesen?

```text
docs/video-motion/MASTERPLAN.md
docs/video-motion/PHASE2_INTERNAL_MOTION_LAB.md
docs/video-motion/_handover_session_29.md
internal/motion-lab/server/shotplans.ts
internal/motion-lab/server/shotTests.ts
internal/motion-lab/adapters/renderAdapter.ts
```

## Externe Dienste / Adapterstatus

- Qwen: nicht betroffen.
- HeyGen/Avatar: nicht betroffen.
- Storage: keine echte Persistenz.
- Render: nicht betroffen.
- Metadata: nicht betroffen.

## Risiken / Hinweise

- Shotplan-Generierung ist weiterhin v0.1 und review-only.
- Produkt-Template-Zielzeiten werden sichtbar gehalten, aber noch nicht als
  hartes Quality Gate erzwungen.
- `projects/piximmo-web` enthaelt weiterhin unrelated Dirty-State und wurde in
  Session 29 nicht angefasst.

## Validierung

Durchgefuehrt am 2026-06-29:

- `node --check internal/motion-lab/server/shotplans.ts`: ok.
- `node --check internal/motion-lab/client/ShotplanBuilder.ts`: ok.
- Import-Smoke-Test fuer `buildLabShotPlan`, `reorderShotPlanShots` und
  `updateShotDuration`: ok.
- Demo mit zwei Assets, Product Template `fast_social_teaser` und Creative
  Profile `fast_social` erzeugt 2 Shots, 0 Warnungen und 1 aktivierten
  Textslot.
- Reorder setzt den ersten Shot wieder auf Order 1.
- Dauer-Update setzt den ersten Shot auf 1.23s.
- Strukturcheck: keine `fetch`- oder `process.env`-Nutzung in den neuen
  Code-Dateien: ok.
- Strukturcheck: keine Public UI, keine API-Route, keine Render-Integration
  angelegt: ok.
- `git status --short`: nur Session-29-Dateien neu im Root; unrelated
  `projects/piximmo-web` bleibt dirty und wurde nicht angefasst.
