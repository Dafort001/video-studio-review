# Real Room Recognition

Stand: 2026-07-01

## Zweck

Real Room Recognition ist die Pflichtstufe zwischen Bildimport und echter
Video-Planung. Sie verhindert, dass die Pipeline aus Dateinamen, Mock-Daten
oder unklaren Bildern automatisch Shotplans baut.

Die zentrale Datei pro Objekt ist:

```text
work/{object_id}/analysis/image_recognition.json
```

Nachgelagerte Stufen duerfen fuer echte Planung `confirmed_room_type`,
`recognition_source`, `is_real_vision`, `is_manual`, `reliability_level`,
`needs_manual_review` und `usable_for_video` auswerten. Sie duerfen nicht
blind aus Dateinamen, Ordnernamen oder `detected_room_type` planen.

## Warum `filename_heuristic` nicht reicht

Dateinamen wie `kitchen_01.jpg` oder `bad_02.jpg` koennen Hinweise enthalten,
aber sie beweisen keinen Raumtyp. Neutrale Kameranamen wie `DSC_0001.jpg`
enthalten gar keine Raumwahrheit. Umbenannte Dateien koennen falsch sein, alte
Maklerexporte koennen uneinheitlich sein, und Seriennamen sind fuer
Objektvideos nicht eindeutig genug.

Darum gilt:

- `filename_heuristic` ist keine visuelle Analyse.
- `filename_heuristic` schreibt `is_real_vision=false`.
- `filename_heuristic` ist nur `reliability_level=low`.
- Automatische echte Planung bleibt mit Default-Gates blockiert.

Ein Low-Reliability-Lauf ist nur ein technischer Pipeline-Test und braucht
explizite Flags wie `--require-real-recognition false` und
`--allow-low-reliability`.

## Quellen und Bedeutung

Recognition-Records tragen diese Quellenfelder:

```text
recognition_source
recognition_backend
is_real_vision
is_mock
is_manual
reliability_level
```

### `mock`

- synthetische Platzhalterdaten
- keine Bildanalyse
- `is_mock=true`
- `is_real_vision=false`
- `reliability_level=none`
- nie fuer echte Qualitaetsbewertung oder automatische Shotplans geeignet

### `filename_heuristic`

- liest nur Raumwoerter aus Dateinamen
- keine Bildanalyse
- `is_real_vision=false`
- `reliability_level=low`
- neutrale Namen bleiben `confirmed_room_type=unknown`
- nur fuer technische Tests oder manuell freigegebene Review-Laeufe

### `manual_json`

- manuell bestaetigte Raumdaten
- `is_manual=true`
- belastbar, wenn `confirmed_room_type != unknown`
- normalisiert zu `reliability_level=high`, wenn die Angaben plausibel sind
- gute Bruecke fuer kleine Tests, wenn echte Vision noch nicht freigegeben ist

### `existing_metadata`

- nutzt vorhandene Import-/Metadaten
- keine neue Bildanalyse
- nur dann fuer Planung akzeptabel, wenn Raumtyp und Reliability wirklich aus
  belastbaren Metadaten stammen
- ohne klares Label bleibt `confirmed_room_type=unknown` und
  `needs_manual_review=true`

### `openai_vision`

- echter Vision-Adapter
- serverseitige API-Nutzung
- `is_real_vision=true`, wenn erfolgreich konfiguriert und ausgefuehrt
- Cache:
  `work/{object_id}/analysis/vision/openai_vision/{asset_id}.json`

### `qwen_vl`

- echter DashScope/Qwen-VL-Adapter ueber OpenAI-kompatible Schnittstelle
- live mit lokalem Secret-Manager nachgewiesen
- `is_real_vision=true`, wenn erfolgreich konfiguriert und ausgefuehrt
- Cache:
  `work/{object_id}/analysis/vision/qwen_vl/{asset_id}.json`

### `custom_vision`

- Backend-ID reserviert
- aktuell kein projektspezifischer Adapter live

## Verfuegbare Backends

Lokale oder technische Backends:

```text
mock
filename_heuristic
manual_json
existing_metadata
```

Echte visuelle Backends:

```text
openai_vision
qwen_vl
```

Reserviert:

```text
custom_vision
```

## Echte Recognition starten

Vor Live-Laeufen mit externen Vision-Backends: Kosten und Umfang mit Daniel
klaeren. Kein stiller 50-Ordner-Lauf.

Qwen/DashScope ueber lokalen Secret-Manager:

```text
npm run secrets -- run \
  --env DASHSCOPE_API_KEY=<ENTFERNT_API_KEY> \
  --env DASHSCOPE_BASE_URL=voleur_dashscope_base_url \
  --env DASHSCOPE_MODEL=voleur_dashscope_model \
  -- npm run motion-lab:recognize -- --root "/Volumes/PIX_MOTION_TEST" --backend qwen_vl --limit 10 --force-recognition true
```

OpenAI Vision, wenn Env gesetzt ist:

```text
npm run motion-lab:recognize -- --root "/Volumes/PIX_MOTION_TEST" --backend openai_vision --limit 10 --force-recognition true
```

Technischer Dateinamen-Test:

```text
npm run motion-lab:recognize -- --root "/Volumes/PIX_MOTION_TEST" --backend filename_heuristic --limit 10 --force-recognition true
```

## ENV-Variablen

OpenAI Vision:

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

Der bekannte funktionierende lokale Store nutzt:

```text
voleur_dashscope_api_key
voleur_dashscope_base_url
voleur_dashscope_model
```

Raw Secrets duerfen nicht in Docs, Chat, Git oder Frontend-Code landen.

## Ergebnis-Speicherung

Gesamtergebnis:

```text
work/{object_id}/analysis/image_recognition.json
```

Backend-Status:

```text
work/{object_id}/analysis/vision/{backend}/backend_status.json
```

Per-Bild-Cache:

```text
work/{object_id}/analysis/vision/openai_vision/{asset_id}.json
work/{object_id}/analysis/vision/qwen_vl/{asset_id}.json
```

Bestehende Recognition wird ohne `--force-recognition` nicht ueberschrieben.
Manuelle Korrekturen werden besonders vorsichtig behandelt; nur explizites
`--force` darf sie ersetzen.

## Manuelle Korrektur

Manuelle JSON-Dateien koennen an diesen Orten liegen:

```text
inbox/{object_id}/recognition.json
work/{object_id}/analysis/image_recognition.manual.json
```

Danach:

```text
npm run motion-lab:recognize -- --root "/Volumes/PIX_MOTION_TEST" --backend manual_json --only-object OBJECT_ID --force-recognition true
```

Manuelle Records muessen mindestens pro Bild den bestaetigten Raumtyp und die
Zuordnung zum Asset enthalten. Bei gueltigem Raumtyp werden sie als
`is_manual=true` und fuer strikte Planung als belastbar behandelt.

## Ready For Planning

Ein Bild ist fuer echte Planung bereit, wenn mindestens eine Bedingung gilt:

- `is_real_vision=true` und `reliability_level` ist `medium` oder `high`
- `is_manual=true` und `confirmed_room_type != unknown`
- `recognition_source=existing_metadata` und `reliability_level` ist `medium`
  oder `high`

Zusaetzlich muessen spaetere Gates beachten:

- `needs_manual_review=false`
- `usable_for_video=true`
- Planning Gate hat das Bild ausgewaehlt
- `quality_evaluation_allowed=true`
- Motion Candidate hat `review_status=candidate`

## Warum 50-Ordner-Batches warten muessen

Ein 50-Ordner-Batch ist erst sinnvoll, wenn echte Vision Recognition oder
manuell bestaetigte Recognition-Daten vorhanden sind. Sonst misst man nur, ob
die technische Pipeline Dateien erzeugt. Man misst nicht, ob die Raumlogik,
Shotauswahl, Motion Candidates oder spaetere Videos fachlich taugen.

Empfohlene Reihenfolge:

1. kleiner Import mit `--limit 5` oder `--limit 10`
2. echte Recognition oder manuelle Bestaetigung
3. Review von `image_recognition.json`
4. Semantic Profiles und Motion Candidates
5. Shotplan-Vorschlag
6. erst danach groessere Batches

## MVP-Grenze

Recognition beendet keine Videoarbeit automatisch. Sie liefert nur belastbare
Raum- und Bildsignale fuer spaetere Planung. Rendering, Avatar-Compositing,
generative Video-APIs, Modal-Submits und DA3/SAM3 bleiben nachgelagert und
brauchen separate Freigabe.
