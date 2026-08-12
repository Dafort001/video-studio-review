# Handover Recognition Batch Session 2

## Was wurde erstellt?

Session 2 hat Recognition-Schema, lokale Recognition-Backends und den
Recognition-CLI-Befehl vorbereitet.

Neu erstellt:

- `config/video-motion/image_recognition.v01.schema.json`
- `internal/motion-lab/server/recognition/types.ts`
- `internal/motion-lab/server/recognition/mockRecognitionBackend.ts`
- `internal/motion-lab/server/recognition/manualJsonRecognitionBackend.ts`
- `internal/motion-lab/server/recognition/existingMetadataRecognitionBackend.ts`
- `docs/video-motion/RECOGNITION_SCHEMA_AND_BACKENDS.md`
- `docs/video-motion/_handover_recognition_batch_session_2.md`

Aktualisiert:

- `package.json`
- `internal/motion-lab/server/batchCli.mjs`

## Welche Dateien wurden geändert?

- `package.json`
- `internal/motion-lab/server/batchCli.mjs`
- `config/video-motion/image_recognition.v01.schema.json`
- `internal/motion-lab/server/recognition/types.ts`
- `internal/motion-lab/server/recognition/mockRecognitionBackend.ts`
- `internal/motion-lab/server/recognition/manualJsonRecognitionBackend.ts`
- `internal/motion-lab/server/recognition/existingMetadataRecognitionBackend.ts`
- `docs/video-motion/RECOGNITION_SCHEMA_AND_BACKENDS.md`
- `docs/video-motion/_handover_recognition_batch_session_2.md`

## Welche Befehle gibt es?

```text
npm run motion-lab:doctor -- --root "/Volumes/PIX_MOTION_TEST"
npm run motion-lab:import -- --root "/Volumes/PIX_MOTION_TEST" --limit 50
npm run motion-lab:recognize -- --root "/Volumes/PIX_MOTION_TEST" --backend mock --limit 50
```

## Welche Zwischenergebnisse werden gespeichert?

Pro Objekt:

```text
work/{object_id}/analysis/image_recognition.json
work/{object_id}/logs/recognition.log
```

Root-Recognition-Log:

```text
logs/motion_lab_recognition_<timestamp>.log
```

## Was ist Mock?

`mock` ist funktionsfaehig und schreibt:

```json
{
  "recognition_backend": "mock",
  "is_mock": true
}
```

Die Werte sind heuristisch aus Dateiname und Import-Metadaten abgeleitet und
duerfen nicht als visuelle Wahrheit gelten.

## Was ist bewusst noch nicht live?

- Keine echten Qwen-/GPT-/Vision-Calls.
- `qwen_vl`, `gpt_vision` und `custom` sind nur vorbereitete Backend-Namen.
- Keine manuelle Review UI.
- Kein Shotplan.
- Kein Rendering.
- Keine Public UI.

## Welche Risiken gibt es?

- `manual_json` ist nur so gut wie die manuelle JSON-Datei.
- `existing_metadata` setzt Raumtypen bewusst auf `unknown`; es ersetzt keine
  visuelle Recognition.
- Mock-Heuristiken koennen falsche Raumtypen aus Dateinamen ableiten.
- Session 4 muss spaeter hart pruefen, dass `image_recognition.json` existiert.
- `projects/piximmo-web` enthaelt weiterhin unrelated Dirty-State und wurde in
  Session 2 nicht angefasst.

## Was muss die nächste Session zuerst lesen?

```text
docs/video-motion/RECOGNITION_BATCH_MASTERPLAN.md
docs/video-motion/_handover_recognition_batch_session_2.md
docs/video-motion/RECOGNITION_SCHEMA_AND_BACKENDS.md
internal/motion-lab/server/recognition/types.ts
internal/motion-lab/server/batchCli.mjs
```

## Wie testet man den aktuellen Stand?

```text
node --check internal/motion-lab/server/batchCli.mjs
node --check internal/motion-lab/server/recognition/types.ts
node --check internal/motion-lab/server/recognition/mockRecognitionBackend.ts
node --check internal/motion-lab/server/recognition/manualJsonRecognitionBackend.ts
node --check internal/motion-lab/server/recognition/existingMetadataRecognitionBackend.ts
npm run motion-lab:import -- --root "<test-root>" --limit 5
npm run motion-lab:recognize -- --root "<test-root>" --backend mock --limit 5
```

Durchgefuehrt am 2026-06-29:

- `node --check internal/motion-lab/server/batchCli.mjs`: ok.
- `node --check internal/motion-lab/server/recognition/types.ts`: ok.
- `node --check internal/motion-lab/server/recognition/mockRecognitionBackend.ts`: ok.
- `node --check internal/motion-lab/server/recognition/manualJsonRecognitionBackend.ts`: ok.
- `node --check internal/motion-lab/server/recognition/existingMetadataRecognitionBackend.ts`: ok.
- Temp-Root-Test mit Import + `mock` Recognition: ok.
- Mock Recognition schrieb `work/objekt_001/analysis/image_recognition.json`
  mit allen Pflichtfeldern, `recognition_backend=mock` und `is_mock=true`.
- Temp-Root-Test fuer `existing_metadata`: ok.
- Temp-Root-Test fuer `manual_json`: ok.
- Strukturcheck: keine Public UI, keine echten Qwen-/GPT-/Vision-Calls, kein
  Shotplan und keine Videoerstellung.
