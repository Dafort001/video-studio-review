# Recognition Schema And Backends v0.1

## Zweck

Session 2 fuehrt visuelle Recognition als Pflichtstufe zwischen Import und
spaeterem Shotplan ein.

Der spaetere Batch darf nicht direkt aus Bildern Videos bauen. Vor Planung oder
Rendering muss pro Objekt vorhanden sein:

```text
work/{object_id}/analysis/image_recognition.json
```

## CLI

```text
npm run motion-lab:recognize -- --root "/Volumes/PIX_MOTION_TEST" --backend mock --limit 50
```

Funktionsfaehige v0.1-Backends:

- `mock`
- `filename_heuristic`
- `manual_json`
- `existing_metadata`
- `openai_vision` mit gesetztem `OPENAI_API_KEY` und `OPENAI_VISION_MODEL`
- `qwen_vl` mit gesetztem `DASHSCOPE_API_KEY`, `DASHSCOPE_BASE_URL` und
  `DASHSCOPE_MODEL`

Vorbereitete, aber nicht live geschaltete Backends:

- `custom_vision`

Diese Backends duerfen in Session 2 keine echten API-Calls ausloesen.

## Schema

Das JSON-Schema liegt hier:

```text
config/video-motion/image_recognition.v01.schema.json
```

Pflichtfelder pro Bild:

```text
asset_id
filename
detected_room_type
confirmed_room_type
confidence
secondary_room_types
composition_tags
object_tags
light_tags
video_role_tags
motion_risk_tags
scores
motion_suitability
usable_for_video
needs_manual_review
manual_override
notes
summary
```

Zusaetzliche Pflichtfelder fuer Quellenklarheit:

```text
recognition_source
recognition_backend
is_real_vision
is_mock
is_manual
reliability_level
```

## `mock` Backend

Das Mock Backend erzeugt bewusst synthetische Platzhalterdaten. Es wertet keine
Bildinhalte und keine Dateinamen als Raumwahrheit aus.

Wichtig:

```json
{
  "recognition_backend": "mock",
  "is_mock": true
}
```

Mock-Ergebnisse sind keine visuelle Wahrheit. Sie dienen nur dazu, die
nachfolgenden Dateien und Gates zu testen.

## `filename_heuristic` Backend

Dieses Backend liest Raumbegriffe aus Dateinamen. Es ist keine Bildanalyse.

```json
{
  "recognition_source": "filename_heuristic",
  "is_real_vision": false,
  "reliability_level": "low"
}
```

Bei neutralen Dateinamen wird `confirmed_room_type=unknown` gesetzt.

## `openai_vision` Backend

Dieses Backend analysiert echte Bildinhalte ueber einen serverseitigen Adapter.

Erforderlich:

```text
OPENAI_API_KEY
OPENAI_VISION_MODEL
```

Optional:

```text
OPENAI_BASE_URL
```

Ergebnisse werden zusaetzlich gecacht:

```text
work/{object_id}/analysis/vision/openai_vision/{asset_id}.json
```

## `qwen_vl` Backend

Dieses Backend analysiert echte Bildinhalte ueber den OpenAI-kompatiblen
DashScope/Qwen-Endpunkt.

Erforderlich:

```text
DASHSCOPE_API_KEY
DASHSCOPE_BASE_URL
DASHSCOPE_MODEL
```

Empfohlener lokaler Aufruf ueber den Keychain-basierten Secret-Manager:

```text
npm run secrets -- run \
  --env DASHSCOPE_API_KEY=<ENTFERNT_API_KEY> \
  --env DASHSCOPE_BASE_URL=voleur_dashscope_base_url \
  --env DASHSCOPE_MODEL=voleur_dashscope_model \
  -- npm run motion-lab:recognize -- --root "/Volumes/PIX_MOTION_TEST" --backend qwen_vl --limit 10
```

Der Adapter setzt `enable_thinking=false`, fordert JSON an und schreibt einen
lokalen Cache:

```text
work/{object_id}/analysis/vision/qwen_vl/{asset_id}.json
```

## `manual_json` Backend

Das Manual-Backend akzeptiert eine manuell gepflegte Recognition-Datei an einem
dieser Orte:

```text
inbox/{object_id}/recognition.json
work/{object_id}/analysis/image_recognition.manual.json
```

Wenn eine Array-Datei uebergeben wird, wird sie als `images` interpretiert. Wenn
ein vollstaendiges Batch-Objekt uebergeben wird, werden `object_id`,
`recognized_at` und `warnings` uebernommen oder ergaenzt.

`manual_override` bleibt pro Bild im JSON sichtbar und wird nicht automatisch
fuer alle Bilder gesetzt.

## `existing_metadata` Backend

Dieses Backend nutzt nur:

```text
work/{object_id}/analysis/image_metadata.json
```

Es setzt `confirmed_room_type` bewusst auf `unknown` und
`needs_manual_review=true`, weil reine Import-Metadaten keine visuelle
Raumerkennung sind.

## Gate-Regel fuer spaetere Sessions

Session 4 darf Shotplan oder Video-Batch nur starten, wenn diese Datei
existiert:

```text
work/{object_id}/analysis/image_recognition.json
```

Der spaetere Shotplan muss `confirmed_room_type` verwenden, nicht blind
`detected_room_type`.

## Grenzen

Session 2 macht nicht:

- keine echten Qwen-/GPT-/Vision-Calls
- Ausnahme nach dieser Korrektur: `openai_vision` kann echte Vision-Calls
  ausfuehren, wenn die erforderlichen ENV-Variablen gesetzt sind.
- Weitere Ausnahme: `qwen_vl` kann echte DashScope/Qwen-Vision-Calls
  ausfuehren, wenn die erforderlichen ENV-Variablen gesetzt sind.
- keine Review UI
- keinen Shotplan
- keine Videoerstellung
- keine Public UI
