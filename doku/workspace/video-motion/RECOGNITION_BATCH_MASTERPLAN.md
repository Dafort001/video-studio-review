# Pix.mo Motion Lab – Recognition & Batch Processing Sessions

## Zweck dieses Dokuments

Dieses Dokument definiert den Weg, wie bearbeitete Immobilienbild-Ordner von einer Festplatte systematisch verarbeitet werden sollen, bevor daraus automatisch Testvideos entstehen.

Wichtig: Die Anwendung darf nicht direkt aus Ordnern mit JPGs Videos bauen. Vor jeder Videoerstellung muss eine visuelle Erkennung pro Bild vorhanden sein. Diese Erkennung darf nicht nur `kitchen` oder `bathroom` speichern, sondern muss beschreiben, **wie das Bild aussieht**, welche Objekte sichtbar sind, welche Bildwirkung es hat und welche Bewegungen dafür geeignet oder riskant sind.

Dieses Dokument ist als Codex-Arbeitsauftrag gedacht und soll in mehreren Sessions umgesetzt werden, damit der Kontext nicht überläuft.

---

# 0. Grundprinzip

Der Ablauf muss zwingend sein:

```text
Festplattenordner mit bearbeiteten Bildern
→ Doctor Check
→ Import / Normalisierung
→ visuelle Recognition pro Bild
→ manuelle Korrektur möglich
→ Shotplan
→ Offline Preview Video
→ Report / Bewertung
```

Nicht erlaubt:

```text
Ordner mit Bildern
→ direkt Video bauen
```

---

# 1. Ziel der Anwendung

Die Anwendung soll interne Tests mit echten Immobilienordnern ermöglichen.

Der Nutzer kann auf einer Festplatte einen Root-Pfad angeben, zum Beispiel:

```text
/Volumes/PIX_MOTION_TEST
```

Darin liegen Objektordner:

```text
/Volumes/PIX_MOTION_TEST/inbox/objekt_001/
/Volumes/PIX_MOTION_TEST/inbox/objekt_002/
/Volumes/PIX_MOTION_TEST/inbox/objekt_003/
```

Jeder Objektordner enthält bearbeitete Bilder, entweder direkt im Objektordner oder im Unterordner `edited/`.

Die Anwendung soll beide Varianten erkennen.

---

# 2. Arbeitsstruktur auf der Festplatte

Die Anwendung soll im gleichen Root-Bereich alle Zwischenergebnisse speichern:

```text
/Volumes/PIX_MOTION_TEST/
  inbox/
    objekt_001/
    objekt_002/
  work/
    objekt_001/
    objekt_002/
  output/
    objekt_001/
    objekt_002/
  logs/
  reports/
  rejected/
```

Pro Objekt soll entstehen:

```text
work/objekt_001/
  normalized/
    images/
  analysis/
    image_metadata.json
    image_recognition.json
    motif_detection.json
    highlight_scores.json
    image_selection.json
  shotplans/
    fast_social_teaser.json
    balanced_listing_video.json
    premium_calm.json
  qwen/
    requests/
    responses/
    outputs/
  render/
    intermediate/
  logs/
    import.log
    recognition.log
    shotplan.log
    render.log

output/objekt_001/
  previews/
    fast_social_teaser.mp4
    balanced_listing_video.mp4
    premium_calm.mp4
  reports/
    report.html
    report.json
    rating.json
```

---

# 3. Was Recognition leisten muss

Die Recognition darf nicht nur Raumtypen speichern.

Schlecht:

```json
{
  "filename": "DSC_0042.jpg",
  "room_type": "kitchen"
}
```

Brauchbar:

```json
{
  "asset_id": "objekt_001_img_0042",
  "filename": "DSC_0042.jpg",
  "detected_room_type": "kitchen",
  "confirmed_room_type": "kitchen",
  "confidence": 0.91,
  "secondary_room_types": ["dining", "open_plan"],
  "composition_tags": ["wide_room", "frontal_view", "strong_lines", "deep_perspective"],
  "object_tags": ["kitchen_island", "counter", "large_window", "dining_area"],
  "light_tags": ["bright", "daylight", "window_dominant"],
  "video_role_tags": ["hero_candidate", "feature_candidate", "text_overlay_candidate"],
  "motion_risk_tags": ["avoid_strong_perspective_change_near_window"],
  "scores": {
    "hero_score": 0.88,
    "motion_potential_score": 0.82,
    "text_overlay_score": 0.76,
    "spatial_depth_score": 0.84,
    "feature_score": 0.79,
    "qwen_risk_score": 0.42
  },
  "motion_suitability": {
    "push_in": 0.9,
    "pull_out": 0.7,
    "pan_left": 0.65,
    "pan_right": 0.65,
    "parallax_float": 0.75,
    "perspective_nudge": 0.55,
    "orbit_hint": 0.25
  },
  "usable_for_video": true,
  "needs_manual_review": false,
  "manual_override": false,
  "notes": "",
  "summary": "Bright open kitchen with island, strong lines and good hero potential."
}
```

## Pflichtfelder pro Bild

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

## Mindestklassen für confirmed_room_type

```text
exterior
entrance
living
open_plan
kitchen
dining
bedroom
bathroom
office
hallway
staircase
balcony
terrace
garden
view
detail
floorplan
unknown
```

Wenn die Erkennung unsicher ist, soll `unknown` oder `needs_manual_review=true` gesetzt werden. Lieber unbekannt als falsch.

---

# 4. Tag-System

## composition_tags

```text
wide_room
medium_room
detail_shot
closeup
doorway_view
window_view
corner_view
frontal_view
symmetry
deep_perspective
narrow_space
high_ceiling
strong_lines
vertical_lines
```

## object_tags

```text
kitchen_island
counter
sink
dining_table
sofa
bed
bathtub
shower
vanity
mirror
fireplace
staircase
balcony_door
large_window
garden
terrace
pool
view
built_in_storage
floorplan
```

## light_tags

```text
bright
dark
daylight
warm_light
mixed_light
evening
high_contrast
window_dominant
backlit
soft_light
```

## video_role_tags

```text
hero_candidate
hook_candidate
transition_candidate
detail_candidate
short_insert
text_overlay_candidate
avatar_background_candidate
cta_background_candidate
do_not_use
```

## motion_risk_tags

```text
mirror_reflection
glass_edges
narrow_geometry
window_warp_risk
strong_perspective_risk
furniture_warp_risk
low_resolution
too_cluttered
too_dark
too_similar_to_other_images
```

---

# 5. Scores

Die Recognition oder ein nachgelagerter Scoring-Schritt muss diese Scores berechnen oder speichern:

```text
hero_score
motion_potential_score
text_overlay_score
spatial_depth_score
feature_score
social_hook_score
avatar_background_score
qwen_risk_score
```

Empfohlene Skala:

```text
0.0 = gar nicht geeignet
1.0 = sehr geeignet
```

---

# 6. Grundregel für Motion-Auswahl

Die spätere Motion-Auswahl darf nicht nur auf `confirmed_room_type` basieren.

Falsch:

```text
Wenn kitchen → kitchen_motion
```

Richtig:

```text
Wenn confirmed_room_type = kitchen
und object_tags enthält kitchen_island
und composition_tags enthält strong_lines
und spatial_depth_score > 0.65
dann:
  kitchen_island_push
  counter_glide
  parallax_float
```

Oder:

```text
Wenn confirmed_room_type = bathroom
und object_tags enthält mirror oder shower
und motion_risk_tags enthält mirror_reflection oder glass_edges
dann:
  keine aggressive Qwen-Perspektivänderung
  keine Orbit-Bewegung
  maximal kurzer Push-in oder stabiler Insert
```


---

# 7. Feature Flags

Externe Dienste dürfen nicht hart verdrahtet werden.

Zentrale Feature-Flag-Datei:

```text
config/video-motion/motion_lab_feature_flags.v01.json
```

Inhalt mindestens:

```json
{
  "motion_lab_enabled": true,
  "recognition_enabled": true,
  "recognition_backend": "mock",
  "qwen_enabled": false,
  "qwen_mock_mode": true,
  "avatar_enabled": false,
  "avatar_mock_mode": true,
  "depth_enabled": false,
  "depth_mock_mode": true,
  "aggressive_motion_enabled": false,
  "experimental_transitions_enabled": false,
  "typography_heavy_mode_enabled": false,
  "external_render_enabled": false,
  "local_preview_render_enabled": true
}
```

---

# 8. Recognition Backends

Die Erkennung muss austauschbar vorbereitet werden.

Backends:

```text
mock
manual_json
existing_metadata
qwen_vl
gpt_vision
custom
```

Für die erste Umsetzung müssen mindestens funktionieren:

```text
mock
manual_json
existing_metadata
```

`qwen_vl`, `gpt_vision` und `custom` dürfen vorbereitet sein, aber keine echten API Calls erzwingen.

---

# 9. Umsetzung in 4 Sessions

Diese Aufgabe soll in 4 Sessions umgesetzt werden.

Codex darf nicht alles in einem Durchlauf erledigen.

Jede Session muss mit einer Handover-Datei enden.

---

## Session 1 – Batch-Grundstruktur, Doctor, Import

### Ziel

Festplattenpfade, Ordnerstruktur, Doctor-Check und Import/Normalisierung bauen.

### Erstelle oder aktualisiere

```text
docs/video-motion/PHASE2_RECOGNITION_BATCH_PATH.md
config/video-motion/motion_lab_feature_flags.v01.json
internal/motion-lab/
internal/motion-lab/server/
internal/motion-lab/storage/
internal/motion-lab/README.md
docs/video-motion/_handover_recognition_batch_session_1.md
```

### CLI-Befehle

```text
npm run motion-lab:doctor -- --root "/Volumes/PIX_MOTION_TEST"
npm run motion-lab:import -- --root "/Volumes/PIX_MOTION_TEST" --limit 50
```

### Doctor muss prüfen

```text
Root-Pfad existiert
inbox/ existiert
work/ kann angelegt/beschrieben werden
output/ kann angelegt/beschrieben werden
logs/ kann angelegt/beschrieben werden
reports/ kann angelegt/beschrieben werden
Bilder sind auffindbar
JPG/JPEG/PNG/TIFF sind grundsätzlich lesbar
ffmpeg ist verfügbar oder Fehler wird klar gemeldet
sharp oder vergleichbares Bildverarbeitungspaket ist verfügbar
Feature Flags sind vorhanden
API Keys sind nicht hardcodiert
```

### Import muss leisten

```text
Objektordner in inbox/ erkennen
Bilder direkt im Objektordner oder in edited/ erkennen
work/{object_id}/normalized/images/ anlegen
Bilder kopieren oder referenzieren
Dateinamen normalisieren
image_metadata.json schreiben
nicht unterstützte Dateien loggen
Bildgrößen, Seitenverhältnisse und Dateigrößen speichern
Warnungen bei stark unterschiedlichen Bildgrößen erzeugen
```

### image_metadata.json pro Bild

```json
{
  "asset_id": "objekt_001_img_001",
  "filename_original": "DSC_0001.jpg",
  "filename_normalized": "001.jpg",
  "width": 3000,
  "height": 2000,
  "aspect_ratio": 1.5,
  "orientation": "landscape",
  "file_size": 1234567,
  "source_path": "...",
  "normalized_path": "..."
}
```

### Wichtig

Noch keine Videoerstellung.

Noch keine echte externe Recognition-API.

Noch kein Qwen.

Noch keine finale UI.

---

## Session 2 – Recognition Schema, Backends, Recognition-CLI

### Ziel

Visuelle Recognition pro Bild als Pflichtstufe einführen.

### Erstelle oder aktualisiere

```text
config/video-motion/image_recognition.v01.schema.json
internal/motion-lab/server/recognition/
internal/motion-lab/server/recognition/types.ts
internal/motion-lab/server/recognition/mockRecognitionBackend.ts
internal/motion-lab/server/recognition/manualJsonRecognitionBackend.ts
internal/motion-lab/server/recognition/existingMetadataRecognitionBackend.ts
docs/video-motion/RECOGNITION_SCHEMA_AND_BACKENDS.md
docs/video-motion/_handover_recognition_batch_session_2.md
```

### CLI-Befehl

```text
npm run motion-lab:recognize -- --root "/Volumes/PIX_MOTION_TEST" --backend mock --limit 50
```

### Vorbereitete Backends

```text
mock
manual_json
existing_metadata
qwen_vl
gpt_vision
custom
```

### In v0.1 tatsächlich funktionsfähig

```text
mock
manual_json
existing_metadata
```

### Recognition muss pro Objekt schreiben

```text
work/{object_id}/analysis/image_recognition.json
```

### Pflichtlogik

Wenn keine Recognition vorhanden ist, darf später kein Shotplan und kein Video-Batch starten.

### Ergebnis pro Bild

Muss dem Schema aus Abschnitt 3 entsprechen.

### Mock Backend

Das Mock Backend darf einfache heuristische oder Platzhalterwerte erzeugen, muss aber klar als Mock markieren:

```json
{
  "recognition_backend": "mock",
  "is_mock": true
}
```

### manual_json Backend

Soll vorhandene manuelle JSON-Dateien akzeptieren, zum Beispiel:

```text
inbox/objekt_001/recognition.json
```

oder:

```text
work/objekt_001/analysis/image_recognition.manual.json
```

### Wichtig

Noch keine echten Qwen-/GPT-API-Calls.

Aber Adapterstellen und TODOs dokumentieren.


---

## Session 3 – Recognition Review UI und manuelle Korrektur

### Ziel

Rudimentäre interne UI zum Prüfen und Korrigieren der Recognition-Daten.

### Erstelle oder aktualisiere

```text
internal/motion-lab/client/
internal/motion-lab/client/RecognitionDashboard.*
internal/motion-lab/client/ObjectRecognitionReview.*
internal/motion-lab/server/recognitionReview.*
docs/video-motion/RECOGNITION_REVIEW_UI.md
docs/video-motion/_handover_recognition_batch_session_3.md
```

### UI-Funktionen

```text
Root-Pfad anzeigen oder setzen
Objektliste anzeigen
Status pro Objekt anzeigen:
  imported
  recognized
  needs_review
  ready_for_planning
Bilder als Grid anzeigen
Thumbnail anzeigen
Dateiname anzeigen
detected_room_type anzeigen
confirmed_room_type anzeigen
confidence anzeigen
needs_manual_review anzeigen
composition_tags anzeigen
object_tags anzeigen
light_tags anzeigen
video_role_tags anzeigen
motion_risk_tags anzeigen
scores anzeigen
summary anzeigen
```

### Manuelle Korrekturen

Die UI muss erlauben:

```text
confirmed_room_type ändern
usable_for_video true/false setzen
needs_manual_review true/false setzen
composition_tags ergänzen/entfernen
object_tags ergänzen/entfernen
light_tags ergänzen/entfernen
video_role_tags ergänzen/entfernen
motion_risk_tags ergänzen/entfernen
notes schreiben
```

### Speicherlogik

Änderungen müssen zurückgeschrieben werden nach:

```text
work/{object_id}/analysis/image_recognition.json
```

Dabei:

```text
manual_override = true
```

setzen, wenn der Nutzer etwas korrigiert.

### Wichtig

Der spätere Shotplan muss immer `confirmed_room_type` verwenden.

Nicht blind `detected_room_type`.

---

## Session 4 – Shotplan, Offline-Preview, Reports

### Ziel

Aus recognized und ggf. korrigierten Objektordnern automatisch einfache Testvideos erzeugen.

### Erstelle oder aktualisiere

```text
internal/motion-lab/server/planning/
internal/motion-lab/server/rendering/
internal/motion-lab/server/reports/
docs/video-motion/BATCH_SHOTPLAN_RENDER_REPORT.md
docs/video-motion/_handover_recognition_batch_session_4.md
```

### CLI-Befehle

```text
npm run motion-lab:plan -- --root "/Volumes/PIX_MOTION_TEST" --variants fast_social_teaser,balanced_listing_video,premium_calm --limit 50

npm run motion-lab:render -- --root "/Volumes/PIX_MOTION_TEST" --mode offline --limit 50

npm run motion-lab:run -- --root "/Volumes/PIX_MOTION_TEST" --limit 50 --mode offline --backend mock
```

### Plan-Schritt

Darf nur starten, wenn vorhanden:

```text
work/{object_id}/analysis/image_recognition.json
```

Pro Objekt erzeugen:

```text
work/{object_id}/shotplans/fast_social_teaser.json
work/{object_id}/shotplans/balanced_listing_video.json
work/{object_id}/shotplans/premium_calm.json
```

### Shotplan muss enthalten

```json
{
  "object_id": "objekt_001",
  "variant": "fast_social_teaser",
  "target_duration": 12,
  "shots": [],
  "warnings": [],
  "rejected_images": [],
  "created_at": ""
}
```

Jeder Shot:

```json
{
  "shot_id": "shot_001",
  "asset_id": "objekt_001_img_004",
  "filename": "004.jpg",
  "confirmed_room_type": "kitchen",
  "role": "hero",
  "duration": 1.2,
  "motion_preset_id": "kitchen_island_push",
  "technical_method": "KB",
  "qwen_required": false,
  "text_overlay": {
    "enabled": true,
    "text": "Küche",
    "preset": "room_label"
  },
  "reason": "Kitchen with strong lines and high motion potential."
}
```

### Varianten

```text
fast_social_teaser
8–15 Sekunden
6–10 Shots
kurze Takes
moderner Rhythmus
kein langer Rundgang

balanced_listing_video
15–30 Sekunden
8–14 Shots
ruhig + modern
nicht alle Bilder verwenden

premium_calm
20–40 Sekunden
ruhiger
weniger Risiko
längere Hero-Shots
keine aggressiven experimentellen Qwen-Shots
```

### Anti-Boring-Regeln

```text
Nie mehr als 2 ähnliche Raumshots direkt hintereinander.
Nie 5 gleich lange Takes nacheinander.
Nie alle Räume in sachlicher Reihenfolge ablaufen.
Mindestens ein starkes Motiv früh im Video.
Kein Video beginnt mit schwachem Flur, Bad oder Treppenhaus, sofern bessere Bilder vorhanden sind.
Nicht jedes Bild muss verwendet werden.
Aus 20 Bildern lieber 8–14 starke Shots machen.
```

### Render-Schritt

v0.1 reicht:

```text
lokale Ken-Burns-/Crop-Bewegungen
einfache Schnitte
einfache Textlabels
720p oder 1080p
mp4-Ausgabe
keine finale Qualität erforderlich
```

Output:

```text
output/{object_id}/previews/fast_social_teaser.mp4
output/{object_id}/previews/balanced_listing_video.mp4
output/{object_id}/previews/premium_calm.mp4
```

Wenn qwen_required=true und qwen_enabled=false:

```text
sichere KB-Ersatzbewegung verwenden
im Report dokumentieren
```

### Reports

Nach jedem Lauf erzeugen:

```text
reports/batch_report.html
reports/batch_report.json
```

Pro Objekt zusätzlich:

```text
output/{object_id}/reports/report.html
output/{object_id}/reports/report.json
output/{object_id}/reports/rating.json
```


---

# 10. Handover-Pflicht

Jede Session muss mit einer Handover-Datei enden.

Schema:

```text
# Handover Recognition Batch Session X

## Was wurde erstellt?

## Welche Dateien wurden geändert?

## Welche Befehle gibt es?

## Welche Zwischenergebnisse werden gespeichert?

## Was ist Mock?

## Was ist bewusst noch nicht live?

## Welche Risiken gibt es?

## Was muss die nächste Session zuerst lesen?

## Wie testet man den aktuellen Stand?
```

---

# 11. Startauftrag für Codex

Diesen Text zuerst an Codex geben:

```text
Lege den folgenden Masterplan unverändert als docs/video-motion/RECOGNITION_BATCH_MASTERPLAN.md ab. Setze noch keine Session um. Erstelle nur diese Datei und bestätige danach, dass sie abgelegt wurde.
```

Danach den Inhalt dieses Dokuments einfügen.

---

# 12. Auftrag für Session 1

Nach dem Ablegen des Masterplans:

```text
Lies docs/video-motion/RECOGNITION_BATCH_MASTERPLAN.md.

Setze ausschließlich Session 1 um:
Batch-Grundstruktur, Doctor, Import.

Erstelle nur die dort genannten Dateien und Befehle.
Setze keine späteren Sessions um.
Baue noch keine echte Recognition-API.
Baue noch keine Videoerstellung.
Baue noch keine Qwen-Integration.
Baue noch keine finale UI.

Beende die Arbeit mit:
docs/video-motion/_handover_recognition_batch_session_1.md
```

---

# 13. Auftrag für Session 2

```text
Lies zuerst:
- docs/video-motion/RECOGNITION_BATCH_MASTERPLAN.md
- docs/video-motion/_handover_recognition_batch_session_1.md

Setze ausschließlich Session 2 um:
Recognition Schema, Backends, Recognition-CLI.

Erstelle nur die dort genannten Dateien und Befehle.
Setze keine späteren Sessions um.
Keine echten Qwen-/GPT-API-Calls.
Backends qwen_vl, gpt_vision und custom nur vorbereiten.

Beende die Arbeit mit:
docs/video-motion/_handover_recognition_batch_session_2.md
```

---

# 14. Auftrag für Session 3

```text
Lies zuerst:
- docs/video-motion/RECOGNITION_BATCH_MASTERPLAN.md
- docs/video-motion/_handover_recognition_batch_session_2.md

Setze ausschließlich Session 3 um:
Recognition Review UI und manuelle Korrektur.

Erstelle nur die dort genannten Dateien.
Setze keine späteren Sessions um.
Keine finale Kunden-UI.
Keine externe API-Integration.

Beende die Arbeit mit:
docs/video-motion/_handover_recognition_batch_session_3.md
```

---

# 15. Auftrag für Session 4

```text
Lies zuerst:
- docs/video-motion/RECOGNITION_BATCH_MASTERPLAN.md
- docs/video-motion/_handover_recognition_batch_session_3.md

Setze ausschließlich Session 4 um:
Shotplan, Offline-Preview, Reports.

Erstelle nur die dort genannten Dateien und Befehle.
Setze keine späteren Sessions um.
Wenn Qwen erforderlich wäre, aber deaktiviert ist, nutze sichere KB-Ersatzbewegungen und dokumentiere das im Report.

Beende die Arbeit mit:
docs/video-motion/_handover_recognition_batch_session_4.md
```

---

# 16. Empfohlene erste Testläufe nach Session 4

## Doctor

```text
npm run motion-lab:doctor -- --root "/Volumes/PIX_MOTION_TEST"
```

## 5-Ordner-Test

```text
npm run motion-lab:run -- --root "/Volumes/PIX_MOTION_TEST" --limit 5 --mode offline --backend mock
```

## 50-Ordner-Test

```text
npm run motion-lab:run -- --root "/Volumes/PIX_MOTION_TEST" --limit 50 --mode offline --backend mock
```

## Später mit manueller Recognition

```text
npm run motion-lab:run -- --root "/Volumes/PIX_MOTION_TEST" --limit 10 --mode offline --backend manual_json
```

## Noch später mit echtem Vision-Backend

```text
npm run motion-lab:run -- --root "/Volumes/PIX_MOTION_TEST" --limit 3 --mode live --backend qwen_vl
```

Dieser letzte Schritt darf erst erfolgen, wenn API-Key, Kosten, Rate Limits und Payload-Struktur gesondert geprüft wurden.
