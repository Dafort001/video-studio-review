# Handover Phase 03 - Recognition Sources

Stand: 2026-07-01

## Ziel

Phase 3 trennt Recognition-Quellen sauber voneinander:

- `mock`
- `filename_heuristic`
- `manual_json`
- `existing_metadata`
- echte Vision-Backends wie `qwen_vl`, `openai_vision`, `custom_vision`

Es wurden keine externen APIs aufgerufen, keine Videos erzeugt, keine
Motion-Regeln abgeleitet und keine Shotplans erstellt.

## Geaenderte Dateien

- `internal/motion-lab/server/recognition/types.ts`
- `internal/motion-lab/server/recognition/filenameHeuristicRecognitionBackend.ts`
- `internal/motion-lab/server/recognition/existingMetadataRecognitionBackend.ts`
- `internal/motion-lab/server/recognition/manualJsonRecognitionBackend.ts`
- `internal/motion-lab/server/batchCli.mjs`
- `config/video-motion/image_recognition.v01.schema.json`
- `docs/video-motion/_handover_phase_03_recognition_sources.md`

## Schemafelder

Recognition-Eintraege enthalten jetzt die Phase-3-Pflichtfelder:

- `asset_id`
- `image_id`
- `filename`
- `detected_room_type`
- `confirmed_room_type`
- `confidence`
- `secondary_room_types`
- `recognition_source`
- `recognition_backend`
- `is_real_vision`
- `is_mock`
- `is_manual`
- `reliability_level`
- `needs_manual_review`
- `manual_override`
- `usable_for_video`
- `notes`
- `summary`
- `created_at`
- `updated_at`

`config/video-motion/image_recognition.v01.schema.json` wurde entsprechend
erweitert.

## Quellenbedeutung

### mock

- `recognition_source=mock`
- `is_real_vision=false`
- `is_mock=true`
- `is_manual=false`
- `reliability_level=none`
- nicht fuer echte Qualitaetsbewertung oder Planung geeignet

### filename_heuristic

- `recognition_source=filename_heuristic`
- `is_real_vision=false`
- `is_mock=false`
- `is_manual=false`
- `reliability_level=low`
- neutraler Dateiname bleibt `confirmed_room_type=unknown`
- neutraler Dateiname setzt `needs_manual_review=true`

### manual_json

- `recognition_source=manual_json`
- `is_real_vision=false`
- `is_mock=false`
- `is_manual=true`
- `reliability_level=high`, wenn `confirmed_room_type != unknown`
- bestehende Recognition wird ohne `--force-recognition` nicht ueberschrieben

### existing_metadata

- `recognition_source=existing_metadata`
- `is_real_vision=false`, solange nur vorhandene Metadaten ohne visuelle
  Quelle genutzt werden
- `reliability_level=medium`
- `confirmed_room_type` bleibt ohne Label `unknown`
- `needs_manual_review=true`

### qwen_vl / openai_vision / custom_vision

- echte Vision-Backends bleiben getrennt
- wenn explizit genutzt, muessen sie `is_real_vision=true` setzen
- in Phase 3 wurden sie nicht ausgefuehrt

## CLI

Getestete lokale Befehle:

```sh
npm run motion-lab:recognize -- --root /tmp/pixcapture_phase3_recognition --backend mock --limit 1 --force-recognition true
npm run motion-lab:recognize -- --root /tmp/pixcapture_phase3_recognition --backend filename_heuristic --limit 1 --force-recognition true
npm run motion-lab:recognize -- --root /tmp/pixcapture_phase3_recognition --backend manual_json --manual-json /tmp/pixcapture_phase3_recognition/manual/manual_recognition.json --only-object objecta --force-recognition true
npm run motion-lab:recognize -- --root /tmp/pixcapture_phase3_recognition --backend existing_metadata --only-object objecta --force-recognition true
```

Neue/validierte Option:

- `--manual-json`

Vorhandene `--force-recognition`-Option wurde validiert.

## Report-Erweiterung

`motion-lab:recognize` gibt jetzt `recognition_quality` aus mit:

- `total_images`
- `mock`
- `filename_heuristic`
- `manual_json`
- `existing_metadata`
- `real_vision`
- `unknown`
- `needs_manual_review`
- `ready_for_planning`

Diese Zaehlung erscheint sowohl im Root-Report als auch pro Objekt.

## Tests

Test-Fixture:

```text
/tmp/pixcapture_phase3_recognition
```

Import-Vorbereitung:

```sh
npm run motion-lab:import -- --root /tmp/pixcapture_phase3_recognition --limit 1
```

Fixture-Bilder:

- `DSC_0001.jpg` neutraler Dateiname
- `kitchen_01.jpg` sprechender Dateiname

### Mock

Ergebnis:

- `mock=2`
- `real_vision=0`
- `unknown=2`
- `needs_manual_review=2`
- `ready_for_planning=0`

### Filename-Heuristik

Ergebnis:

- `filename_heuristic=2`
- `real_vision=0`
- `unknown=1`
- `needs_manual_review=1`
- `ready_for_planning=0`

Pflichtfeldcheck:

- keine fehlenden Phase-3-Pflichtfelder
- neutraler `DSC_0001.jpg`:
  - `confirmed_room_type=unknown`
  - `is_real_vision=false`
  - `reliability_level=low`
  - `needs_manual_review=true`
- `kitchen_01.jpg`:
  - `confirmed_room_type=kitchen`
  - `is_real_vision=false`
  - `reliability_level=low`

### Manual JSON

Test:

- externe manuelle JSON-Datei via `--manual-json`
- `confirmed_room_type=bathroom`
- `manual_override=true`

Ergebnis:

- `manual_json=1`
- `real_vision=0`
- `unknown=0`
- `ready_for_planning=1`

Ueberschreibschutz:

- Nach manuellem Import wurde ein weiterer `filename_heuristic`-Lauf ohne
  `--force-recognition` gestartet.
- Bestehende manuelle Recognition blieb erhalten.
- Report meldete:
  `Existing image_recognition.json kept. Use --force to overwrite.`

### Existing Metadata

Ergebnis:

- `existing_metadata=2`
- `real_vision=0`
- `unknown=2`
- `needs_manual_review=2`
- `ready_for_planning=0`

### Dry Run

Test:

```sh
npm run motion-lab:recognize -- --root /tmp/pixcapture_phase3_recognition --backend filename_heuristic --only-object objecta --dry-run true
```

Ergebnis:

- Report wurde auf stdout erzeugt.
- `image_recognition.json` wurde nicht geschrieben.

### Schema

```sh
node -e 'JSON.parse(require("fs").readFileSync("config/video-motion/image_recognition.v01.schema.json","utf8")); console.log("schema-json-ok")'
```

Ergebnis: `schema-json-ok`

## Offene Punkte fuer echte Vision-Backends

- `qwen_vl` und `openai_vision` wurden in Phase 3 nicht live getestet.
- Vor echtem Vision-Lauf weiterhin Kosten/Provider bestaetigen.
- Echte Vision-Ergebnisse muessen nach einem kleinen `--limit`-Lauf manuell
  reviewt werden, bevor Planung/Shotplans erlaubt sind.
- Eine UI sollte nicht allgemein "Recognition" anzeigen, wenn die Quelle
  `mock` oder `filename_heuristic` ist; sie muss die konkrete Quelle und
  Reliability sichtbar machen.

## Nicht getan

- Keine API aktiviert.
- Keine Motion-Regeln abgeleitet.
- Keine Shotplans erstellt.
- Keine Videos gerendert.
