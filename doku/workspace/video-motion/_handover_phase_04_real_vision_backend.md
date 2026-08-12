# Handover Phase 04 - Real Vision Backend

Stand: 2026-07-01

## Ziel

Phase 4 bereitet echte Vision-Backends fuer Motion Lab Recognition vor, ohne
Secrets ins Repo oder Frontend zu bringen und ohne Videoerzeugung.

## Adapter

### `qwen_vl`

- Status: Backend-Adapter existiert.
- Live-Nachweis: vorhanden aus
  `docs/video-motion/_handover_qwen_vl_connection_2026-06-29.md`.
- Heute nicht erneut live ausgefuehrt, damit keine stillen Providerkosten
  entstehen.
- Required env:
  - `DASHSCOPE_API_KEY` oder `QWEN_API_KEY`
  - `DASHSCOPE_BASE_URL` oder `QWEN_BASE_URL`
- Optional env:
  - `DASHSCOPE_MODEL`
  - `QWEN_VL_MODEL`
  - `SOCIAL_VIDEO_QWEN_MODEL`
  - `QWEN_FORCE_IPV4`
  - `QWEN_VL_TIMEOUT_MS`
- Default-Modell, wenn kein Modell gesetzt ist: `qwen3.7-plus`.
- Lokaler Cache:
  `work/{object_id}/analysis/vision/qwen_vl/{asset_id}.json`
- Backend-Status:
  `work/{object_id}/analysis/vision/qwen_vl/backend_status.json`

### `openai_vision`

- Status: Backend-Adapter existiert.
- Live-Nachweis: noch nicht ausgefuehrt.
- Required env:
  - `OPENAI_API_KEY`
  - `OPENAI_VISION_MODEL`
- Optional env:
  - `OPENAI_BASE_URL`
- Lokaler Cache:
  `work/{object_id}/analysis/vision/openai_vision/{asset_id}.json`
- Backend-Status:
  `work/{object_id}/analysis/vision/openai_vision/backend_status.json`

## Adapter-Schnittstelle

Gemeinsames Modul:

- `internal/motion-lab/server/recognition/visionAdapter.ts`

Jeder echte Adapter liefert:

- `name`
- `isConfigured()`
- `analyzeImage(input)`
- `backend_status.configured`
- `required_env`, `present_env`, `missing_env`
- `rate_limit_hint`
- `retry_hint`
- lokalen Cache und maschinenlesbares JSON

Wenn ein Backend nicht konfiguriert ist, wird kein Mock- oder
Dateinamen-Fallback ausgefuehrt. Die CLI gibt `ok=false` und
`backend_status.configured=false` aus und schreibt den Status lokal.

## Geaenderte Dateien

- `internal/motion-lab/server/recognition/visionAdapter.ts`
- `internal/motion-lab/server/recognition/qwenVlRecognitionBackend.ts`
- `internal/motion-lab/server/recognition/openaiVisionRecognitionBackend.ts`
- `internal/motion-lab/server/recognition/types.ts`
- `internal/motion-lab/server/batchCli.mjs`
- `config/video-motion/image_recognition.v01.schema.json`
- `docs/video-motion/_handover_phase_04_real_vision_backend.md`

## 10-Bilder-Test

Qwen, mit lokalen Keychain-Secrets:

```sh
npm run secrets -- run \
  --env DASHSCOPE_API_KEY=<ENTFERNT_API_KEY> \
  --env DASHSCOPE_BASE_URL=voleur_dashscope_base_url \
  --env DASHSCOPE_MODEL=voleur_dashscope_model \
  -- npm run motion-lab:recognize -- --root "/Volumes/PIX_MOTION_TEST" --backend qwen_vl --limit 10 --force-recognition true
```

OpenAI, nur nach hinterlegtem Backend-Secret:

```sh
npm run motion-lab:recognize -- --root "/Volumes/PIX_MOTION_TEST" --backend openai_vision --limit 10 --force-recognition true
```

Vor einem Live-Lauf Daniel kurz bestaetigen lassen, weil Vision-Calls
Providerkosten erzeugen.

## Validierung Heute

Lokales Fixture:

```text
/tmp/pixcapture_phase4_real_vision
```

Getestet:

```sh
npm run motion-lab:import -- --root /tmp/pixcapture_phase4_real_vision --limit 1
env -u DASHSCOPE_API_KEY -u QWEN_API_KEY -u DASHSCOPE_BASE_URL -u QWEN_BASE_URL -u OPENAI_API_KEY -u OPENAI_VISION_MODEL npm run motion-lab:recognize -- --root /tmp/pixcapture_phase4_real_vision --backend qwen_vl --limit 1 --force-recognition true
env -u DASHSCOPE_API_KEY -u QWEN_API_KEY -u DASHSCOPE_BASE_URL -u QWEN_BASE_URL -u OPENAI_API_KEY -u OPENAI_VISION_MODEL npm run motion-lab:recognize -- --root /tmp/pixcapture_phase4_real_vision --backend openai_vision --limit 1 --force-recognition true
npm run motion-lab:recognize -- --root /tmp/pixcapture_phase4_real_vision --backend mock --limit 1 --force-recognition true
node -e 'JSON.parse(require("fs").readFileSync("config/video-motion/image_recognition.v01.schema.json","utf8")); console.log("schema-json-ok")'
```

Ergebnis:

- `qwen_vl` ohne Env meldet sauber `configured=false`.
- `openai_vision` ohne Env meldet sauber `configured=false`.
- Beide schreiben `backend_status.json`.
- `mock` bleibt weiter funktionsfaehig.
- Schema JSON parse ist ok.

## Risiken / Offene Punkte

- Heute wurde kein neuer Live-Provider-Call ausgefuehrt.
- `openai_vision` braucht noch einen kleinen Live-Test mit `--limit 1` oder
  `--limit 10`, sobald Secret und Kostenfreigabe klar sind.
- `qwen_vl` sollte als naechstes nur mit kleinem realem Batch laufen, nicht mit
  einem kompletten 50-Ordner-Datensatz.
- Recognition-Qualitaet muss manuell geprueft werden, bevor Planning,
  Shotplans oder Rendering wieder erlaubt sind.
- `custom_vision` ist weiterhin nur als Backend-ID reserviert, aber noch kein
  eigener Adapter.

## Nicht Getan

- Keine DA3/SAM3-Jobs.
- Keine Shotplans.
- Keine Videoerzeugung.
- Keine Secrets geschrieben oder ausgegeben.
