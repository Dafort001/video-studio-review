# Handover - Real Room Recognition

Stand: 2026-07-01

## Was geaendert wurde

Die Motion-Lab-Recognition trennt jetzt dokumentiert und technisch zwischen:

- `mock`
- `filename_heuristic`
- `manual_json`
- `existing_metadata`
- `openai_vision`
- `qwen_vl`
- reserviertem `custom_vision`

Wichtige Quellenfelder:

- `recognition_source`
- `recognition_backend`
- `is_real_vision`
- `is_mock`
- `is_manual`
- `reliability_level`

Die aktuelle Dokumentation steht in:

- `docs/video-motion/REAL_ROOM_RECOGNITION.md`
- `docs/video-motion/RECOGNITION_SCHEMA_AND_BACKENDS.md`

## Backends

Lokal/technisch:

- `mock`
- `filename_heuristic`
- `manual_json`
- `existing_metadata`

Echte Vision:

- `openai_vision`
- `qwen_vl`

Reserviert:

- `custom_vision`

## Live funktionierendes Backend

`qwen_vl` ist live angebunden und wurde am 2026-06-29 einmal gegen DashScope
getestet. Der Test nutzte den vorhandenen Voleur DashScope Keychain-Store:

```text
voleur_dashscope_api_key
voleur_dashscope_base_url
voleur_dashscope_model
```

Ergebnis des Live-Tests:

- `ok=true`
- `backend=qwen_vl`
- `image_count=1`
- `recognition_source=qwen_vl`
- `is_real_vision=true`
- Klassifikation: `bedroom`
- Confidence: `0.95`
- Reliability: `high`
- `usable_for_video=true`

`openai_vision` hat einen Adapter und klare Env-Gates, aber noch keinen
dokumentierten Live-Erfolg in dieser Arbeitslinie.

## Fehlende oder benoetigte ENV-Variablen

OpenAI:

```text
OPENAI_API_KEY
OPENAI_VISION_MODEL
OPENAI_BASE_URL optional
```

Qwen/DashScope:

```text
DASHSCOPE_API_KEY oder QWEN_API_KEY
DASHSCOPE_BASE_URL oder QWEN_BASE_URL
DASHSCOPE_MODEL oder QWEN_VL_MODEL oder SOCIAL_VIDEO_QWEN_MODEL
QWEN_FORCE_IPV4 optional
QWEN_VL_TIMEOUT_MS optional
```

Secrets duerfen nur ueber Keychain, Secret Manager, Vercel/Modal Env oder
vergleichbare Stores injiziert werden. Keine Rohwerte in Chat, Git oder
Frontend.

## 10-Bilder-Test

Qwen/DashScope:

```text
npm run secrets -- run \
  --env DASHSCOPE_API_KEY=<ENTFERNT_API_KEY> \
  --env DASHSCOPE_BASE_URL=voleur_dashscope_base_url \
  --env DASHSCOPE_MODEL=voleur_dashscope_model \
  -- npm run motion-lab:recognize -- --root "/Volumes/PIX_MOTION_TEST" --backend qwen_vl --limit 10 --force-recognition true
```

OpenAI:

```text
npm run motion-lab:recognize -- --root "/Volumes/PIX_MOTION_TEST" --backend openai_vision --limit 10 --force-recognition true
```

Vor echten Provider-Laeufen Daniel kurz bestaetigen lassen, weil Vision-Calls
Kosten erzeugen.

## Echte Recognition vs. Dateinamen-Heuristik

Echte Recognition:

```json
{
  "recognition_source": "qwen_vl",
  "is_real_vision": true,
  "reliability_level": "high"
}
```

oder:

```json
{
  "recognition_source": "openai_vision",
  "is_real_vision": true,
  "reliability_level": "medium"
}
```

Nicht echt:

```json
{
  "recognition_source": "filename_heuristic",
  "is_real_vision": false,
  "reliability_level": "low"
}
```

Mock:

```json
{
  "recognition_source": "mock",
  "is_mock": true,
  "reliability_level": "none"
}
```

## Risiken und offene Punkte

- `qwen_vl` ist nur mit einem kleinen Live-Test bestaetigt, nicht mit einem
  50-Ordner-Batch.
- `openai_vision` braucht noch einen Live-Test, falls dieser Provider genutzt
  werden soll.
- Prompt und Normalisierung muessen mit echten Immobilienbildern evaluiert
  werden.
- Filename-Heuristik und Mock-Daten bleiben technische Tests, keine
  Produktwahrheit.
- Low-Reliability-Planung darf nur explizit fuer Review/Debug aktiviert
  werden.
- Das bekannte unrelated Dirty-State in `projects/piximmo-web` gehoert nicht
  zu dieser Recognition-Linie.

## Aktuelle Downstream-Gates

Echte Planung darf erst weiterlaufen, wenn ein Bild:

- real erkannt oder manuell bestaetigt ist,
- `confirmed_room_type != unknown` hat,
- `needs_manual_review=false` hat,
- `usable_for_video=true` hat,
- im Planning Gate ausgewaehlt wurde,
- `quality_evaluation_allowed=true` hat,
- als Motion Candidate `review_status=candidate` hat.

## Nicht getan

- kein neuer Live-Provider-Call in Phase 12
- kein Rendering
- kein Avatar-Compositing
- keine generative Video-API
- kein Modal-Submit
- kein DA3/SAM3-Start
