# Handover Recognition Batch Session 4

## Was wurde erstellt?

Session 4 hat Shotplan-Erstellung, Offline-Preview-Rendering und Reports fuer
Recognition Batch vorbereitet.

Neu erstellt:

- `internal/motion-lab/server/planning/shotplan.ts`
- `internal/motion-lab/server/rendering/offlinePreviewRenderer.ts`
- `internal/motion-lab/server/reports/batchReports.ts`
- `docs/video-motion/BATCH_SHOTPLAN_RENDER_REPORT.md`
- `docs/video-motion/_handover_recognition_batch_session_4.md`

Aktualisiert:

- `package.json`
- `internal/motion-lab/server/batchCli.mjs`

## Welche Dateien wurden geändert?

- `package.json`
- `internal/motion-lab/server/batchCli.mjs`
- `internal/motion-lab/server/planning/shotplan.ts`
- `internal/motion-lab/server/rendering/offlinePreviewRenderer.ts`
- `internal/motion-lab/server/reports/batchReports.ts`
- `docs/video-motion/BATCH_SHOTPLAN_RENDER_REPORT.md`
- `docs/video-motion/_handover_recognition_batch_session_4.md`

## Welche Befehle gibt es?

```text
npm run motion-lab:doctor -- --root "/Volumes/PIX_MOTION_TEST"
npm run motion-lab:import -- --root "/Volumes/PIX_MOTION_TEST" --limit 50
npm run motion-lab:recognize -- --root "/Volumes/PIX_MOTION_TEST" --backend mock --limit 50
npm run motion-lab:plan -- --root "/Volumes/PIX_MOTION_TEST" --variants fast_social_teaser,balanced_listing_video,premium_calm --limit 50
npm run motion-lab:render -- --root "/Volumes/PIX_MOTION_TEST" --mode offline --limit 50
npm run motion-lab:run -- --root "/Volumes/PIX_MOTION_TEST" --limit 50 --mode offline --backend mock
```

## Welche Zwischenergebnisse werden gespeichert?

Shotplans:

```text
work/{object_id}/shotplans/{variant}.json
```

Render-Intermediate:

```text
work/{object_id}/render/intermediate/{variant}_concat.txt
```

Previews:

```text
output/{object_id}/previews/{variant}.mp4
```

Reports:

```text
reports/batch_report.html
reports/batch_report.json
output/{object_id}/reports/report.html
output/{object_id}/reports/report.json
output/{object_id}/reports/rating.json
```

## Was ist Mock?

`motion-lab:run` kann weiter mit `--backend mock` laufen. Session 4 selbst
macht keine Vision-Mocks, sondern nutzt vorhandene Recognition-Daten.

## Was ist bewusst noch nicht live?

- Keine echten Qwen-/GPT-/Vision-Calls.
- Keine finale Videoqualitaet.
- Keine Public UI.
- Keine API-Route.
- Keine Remotion-/Canvas-Komposition.
- Keine echte Typografie-Komposition im Video.

## Welche Risiken gibt es?

- Offline-MP4s sind einfache ffmpeg-Previews mit sicheren Schnitten, keine
  finale Motion-Qualitaet.
- `ffmpeg` muss lokal verfuegbar sein, sonst schlaegt Rendering sichtbar fehl.
- Shotplans haengen vollstaendig von `image_recognition.json` und
  `confirmed_room_type` ab.
- Mock Recognition kann falsche Auswahlentscheidungen erzeugen.
- `projects/piximmo-web` enthaelt weiterhin unrelated Dirty-State und wurde in
  Session 4 nicht angefasst.

## Was muss die nächste Session zuerst lesen?

```text
docs/video-motion/RECOGNITION_BATCH_MASTERPLAN.md
docs/video-motion/_handover_recognition_batch_session_4.md
docs/video-motion/BATCH_SHOTPLAN_RENDER_REPORT.md
internal/motion-lab/server/planning/shotplan.ts
internal/motion-lab/server/rendering/offlinePreviewRenderer.ts
internal/motion-lab/server/reports/batchReports.ts
```

## Wie testet man den aktuellen Stand?

```text
node --check internal/motion-lab/server/batchCli.mjs
node --check internal/motion-lab/server/planning/shotplan.ts
node --check internal/motion-lab/server/rendering/offlinePreviewRenderer.ts
node --check internal/motion-lab/server/reports/batchReports.ts
npm run motion-lab:run -- --root "<test-root>" --limit 5 --mode offline --backend mock
```

Durchgefuehrt am 2026-06-29:

- `node --check internal/motion-lab/server/batchCli.mjs`: ok.
- `node --check internal/motion-lab/server/planning/shotplan.ts`: ok.
- `node --check internal/motion-lab/server/rendering/offlinePreviewRenderer.ts`: ok.
- `node --check internal/motion-lab/server/reports/batchReports.ts`: ok.
- Temp-Root-Full-Run mit 3 ffmpeg-generierten 1600x900 PNGs: ok.
- `npm run --silent motion-lab:run -- --root "<temp-root>" --limit 5 --mode offline --backend mock`: ok.
- Full-Run erzeugte 3 Shotplans, 3 MP4-Previews, `reports/batch_report.*`
  und Objekt-Reports inklusive `rating.json`.
- Mini-Test erzeugte 6 erwartbare Warnungen wegen nur 3 Bildern bei Varianten,
  die mehr Shots bevorzugen.
- Strukturcheck: keine Public UI, keine echten Qwen-/GPT-/Vision-Calls und
  keine externe Render-Integration.
