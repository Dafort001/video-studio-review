# Handover Recognition Batch Session 1

## Was wurde erstellt?

Session 1 hat Batch-Grundstruktur, Doctor und Import/Normalisierung fuer lokale
Festplattenordner vorbereitet.

Neu erstellt:

- `package.json`
- `internal/motion-lab/server/batchCli.mjs`
- `docs/video-motion/PHASE2_RECOGNITION_BATCH_PATH.md`
- `docs/video-motion/_handover_recognition_batch_session_1.md`

Aktualisiert:

- `config/video-motion/motion_lab_feature_flags.v01.json`
- `internal/motion-lab/README.md`

## Welche Dateien wurden geändert?

- `package.json`
- `internal/motion-lab/server/batchCli.mjs`
- `config/video-motion/motion_lab_feature_flags.v01.json`
- `internal/motion-lab/README.md`
- `docs/video-motion/PHASE2_RECOGNITION_BATCH_PATH.md`
- `docs/video-motion/_handover_recognition_batch_session_1.md`

## Welche Befehle gibt es?

```text
npm run motion-lab:doctor -- --root "/Volumes/PIX_MOTION_TEST"
npm run motion-lab:import -- --root "/Volumes/PIX_MOTION_TEST" --limit 50
```

## Welche Zwischenergebnisse werden gespeichert?

Pro Objekt:

```text
work/{object_id}/normalized/images/
work/{object_id}/analysis/image_metadata.json
work/{object_id}/logs/import.log
```

Root-Import-Log:

```text
logs/motion_lab_import_<timestamp>.log
```

## Was ist Mock?

Session 1 erzeugt noch keine Recognition-Daten. Feature Flags fuer
`recognition_backend=mock`, `qwen_mock_mode=true`, `avatar_mock_mode=true` und
`depth_mock_mode=true` sind vorbereitet, aber nicht ausgefuehrt.

## Was ist bewusst noch nicht live?

- Keine visuelle Recognition.
- Keine echten Qwen-/GPT-/Vision-Calls.
- Keine manuelle Review UI.
- Kein Shotplan.
- Kein Rendering.
- Keine Public UI.
- Keine Datenbank oder dauerhafte Repo-interne Testdaten.

## Welche Risiken gibt es?

- `ffmpeg` kann im Doctor fehlen; das wird sichtbar gemeldet.
- `sharp` ist optional. Wenn es fehlt, nutzt die CLI einen eingebauten
  JPG/PNG/TIFF-Header-Reader.
- TIFF-Unterstuetzung ist v0.1-Header-Lesung, keine vollstaendige
  Bildverarbeitung.
- Import kopiert Bilder in den externen `--root`-Work-Bereich.
- `projects/piximmo-web` enthaelt weiterhin unrelated Dirty-State und wurde in
  Session 1 nicht angefasst.

## Was muss die nächste Session zuerst lesen?

```text
docs/video-motion/RECOGNITION_BATCH_MASTERPLAN.md
docs/video-motion/_handover_recognition_batch_session_1.md
docs/video-motion/PHASE2_RECOGNITION_BATCH_PATH.md
internal/motion-lab/server/batchCli.mjs
config/video-motion/motion_lab_feature_flags.v01.json
```

## Wie testet man den aktuellen Stand?

```text
node --check internal/motion-lab/server/batchCli.mjs
npm run motion-lab:doctor -- --root "<test-root>"
npm run motion-lab:import -- --root "<test-root>" --limit 5
```

Durchgefuehrt am 2026-06-29:

- `node --check internal/motion-lab/server/batchCli.mjs`: ok.
- `package.json` und `motion_lab_feature_flags.v01.json` JSON-Parse: ok.
- Temp-Root-Test mit `inbox/objekt_001/edited/DSC_0001.png`: ok.
- `npm run --silent motion-lab:doctor -- --root "<temp-root>"`: ok.
- `npm run --silent motion-lab:import -- --root "<temp-root>" --limit 5`: ok.
- Import erzeugte `work/objekt_001/normalized/images/001.png` und
  `work/objekt_001/analysis/image_metadata.json` mit korrekten 2x1-Pixel-
  Dimensionen.
- Strukturcheck: keine Public UI, keine Recognition-API, keine Qwen-/GPT-Calls
  und keine Videoerstellung.
