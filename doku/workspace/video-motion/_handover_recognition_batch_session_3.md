# Handover Recognition Batch Session 3

## Was wurde erstellt?

Session 3 hat interne Recognition-Review-Viewmodels und manuelle
Korrektur-Serverlogik vorbereitet.

Neu erstellt:

- `internal/motion-lab/client/RecognitionDashboard.ts`
- `internal/motion-lab/client/ObjectRecognitionReview.ts`
- `internal/motion-lab/server/recognitionReview.ts`
- `docs/video-motion/RECOGNITION_REVIEW_UI.md`
- `docs/video-motion/_handover_recognition_batch_session_3.md`

## Welche Dateien wurden geändert?

- `internal/motion-lab/client/RecognitionDashboard.ts`
- `internal/motion-lab/client/ObjectRecognitionReview.ts`
- `internal/motion-lab/server/recognitionReview.ts`
- `docs/video-motion/RECOGNITION_REVIEW_UI.md`
- `docs/video-motion/_handover_recognition_batch_session_3.md`

## Welche Befehle gibt es?

Keine neuen CLI-Befehle in Session 3.

Bestehende Befehle bleiben:

```text
npm run motion-lab:doctor -- --root "/Volumes/PIX_MOTION_TEST"
npm run motion-lab:import -- --root "/Volumes/PIX_MOTION_TEST" --limit 50
npm run motion-lab:recognize -- --root "/Volumes/PIX_MOTION_TEST" --backend mock --limit 50
```

## Welche Zwischenergebnisse werden gespeichert?

Manuelle Korrekturen koennen zurueckgeschrieben werden nach:

```text
work/{object_id}/analysis/image_recognition.json
```

Wenn ein Bild korrigiert wird, setzt die Serverlogik:

```json
{
  "manual_override": true
}
```

## Was ist Mock?

Session 3 erzeugt keine neuen Mock-Daten. Sie kann Mock-Recognition aus Session
2 anzeigen und korrigieren.

## Was ist bewusst noch nicht live?

- Keine echte Web-App.
- Keine Public UI.
- Keine API-Route.
- Keine externe Recognition-API.
- Kein Shotplan.
- Kein Rendering.

## Welche Risiken gibt es?

- Viewmodels ersetzen noch keine echte UI.
- Korrekturen sind nur so gut wie der spaetere UI-Flow, der sie ausloest.
- Der spaetere Shotplan muss zwingend `confirmed_room_type` verwenden.
- `projects/piximmo-web` enthaelt weiterhin unrelated Dirty-State und wurde in
  Session 3 nicht angefasst.

## Was muss die nächste Session zuerst lesen?

```text
docs/video-motion/RECOGNITION_BATCH_MASTERPLAN.md
docs/video-motion/_handover_recognition_batch_session_3.md
docs/video-motion/RECOGNITION_REVIEW_UI.md
internal/motion-lab/server/recognitionReview.ts
internal/motion-lab/server/recognition/types.ts
```

## Wie testet man den aktuellen Stand?

```text
node --check internal/motion-lab/server/recognitionReview.ts
node --check internal/motion-lab/client/RecognitionDashboard.ts
node --check internal/motion-lab/client/ObjectRecognitionReview.ts
```

Durchgefuehrt am 2026-06-29:

- `node --check internal/motion-lab/server/recognitionReview.ts`: ok.
- `node --check internal/motion-lab/client/RecognitionDashboard.ts`: ok.
- `node --check internal/motion-lab/client/ObjectRecognitionReview.ts`: ok.
- Smoke-Test fuer Dashboard-Status, Object-Review-Viewmodel und manuelle
  Korrektur: ok.
- Korrektur von `confirmed_room_type=unknown` zu `living` setzte
  `manual_override=true` und wechselte Status von `needs_review` zu
  `ready_for_planning`.
- Temp-Root-Test fuer `loadRecognitionBatchFromRoot` und
  `saveRecognitionBatchToRoot`: ok.
- Strukturcheck: keine Public UI, keine API-Route, keine externe Recognition-
  API, kein Shotplan und keine Videoerstellung.
