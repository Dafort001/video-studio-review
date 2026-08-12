# Batch Shotplan Render Report v0.1

## Zweck

Session 4 verbindet erkannte Objektordner mit einfachen Shotplans,
Offline-Preview-MP4s und Reports.

Sie bleibt intern und lokal. Sie ist keine finale Videoqualitaet, keine Public
UI und keine Qwen-/GPT-Integration.

## CLI

Plan:

```text
npm run motion-lab:plan -- --root "/Volumes/PIX_MOTION_TEST" --variants fast_social_teaser,balanced_listing_video,premium_calm --limit 50
```

Render:

```text
npm run motion-lab:render -- --root "/Volumes/PIX_MOTION_TEST" --mode offline --limit 50
```

Full offline run:

```text
npm run motion-lab:run -- --root "/Volumes/PIX_MOTION_TEST" --limit 50 --mode offline --backend mock
```

Proof mit echter oder manuell bestaetigter Recognition:

```text
npm run motion-lab:proof -- --root "/Volumes/PIX_MOTION_TEST" --limit 10 --mode offline --backend openai_vision --require-real-recognition true
```

## Gate

Planning darf nur starten, wenn vorhanden:

```text
work/{object_id}/analysis/image_recognition.json
```

Wenn die Datei fehlt, wird kein Shotplan erzeugt.

Fuer echte Planung gilt standardmaessig:

```text
--require-real-recognition true
```

Ein Bild darf dann nur automatisch verwendet werden, wenn:

- `is_real_vision=true` und `reliability_level` ist `medium` oder `high`, oder
- `is_manual=true` und `confirmed_room_type != unknown`, oder
- `recognition_source=existing_metadata` und `reliability_level` ist `medium`
  oder `high`

Dateinamen-Heuristik ist nur ein technischer Low-Reliability-Test:

```text
--require-real-recognition false --allow-low-reliability
```

## Shotplans

Pro Objekt werden Varianten geschrieben nach:

```text
work/{object_id}/shotplans/fast_social_teaser.json
work/{object_id}/shotplans/balanced_listing_video.json
work/{object_id}/shotplans/premium_calm.json
```

Varianten:

- `fast_social_teaser`: ca. 12 Sekunden, kurze Takes
- `balanced_listing_video`: ca. 24 Sekunden, moderat
- `premium_calm`: ca. 32 Sekunden, ruhiger und risikoaermer

## Anti-Boring v0.1

Die Auswahl:

- nutzt nur `usable_for_video=true`
- nutzt keine Bilder mit `needs_manual_review=true`
- nutzt keine Bilder mit `confirmed_room_type=unknown`
- nutzt nicht `detected_room_type` fuer Planung
- vermeidet mehr als zwei gleiche Raumtypen direkt hintereinander
- variiert einfache Dauern
- waehlt starke Motive frueh ueber Scores

## Offline Render

Der Offline-Renderer nutzt `ffmpeg` und die normalisierten Bilder aus:

```text
work/{object_id}/normalized/images/
```

Ausgabe:

```text
output/{object_id}/previews/{variant}.mp4
```

v0.1 rendert einfache Schnitte und sichere 720p-Framing-Ausgabe. Motion-Preset-
IDs bleiben im Shotplan sichtbar; die MP4 ist noch keine finale Motion-
Qualitaet.

## Reports

Batch:

```text
reports/batch_report.html
reports/batch_report.json
reports/proof_report.html
reports/proof_report.json
```

Pro Objekt:

```text
output/{object_id}/reports/report.html
output/{object_id}/reports/report.json
output/{object_id}/reports/rating.json
```

## Qwen-Regel

Session 4 setzt keine Qwen-Jobs um. Wenn spaeter ein Shot `qwen_required=true`
haette und `qwen_enabled=false` ist, muss sichere KB-Ersatzbewegung verwendet
und im Report dokumentiert werden.
