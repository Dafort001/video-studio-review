# Motion Lab Data Model v0.1

## Zweck

Diese Datei beschreibt die v0.1-Datenmodelle fuer das interne Motion Lab.
Sie definiert die Begriffe fuer Testbilder, Motion-Kandidaten, Shot-Tests,
Bewertungen, Shotplaene und externe Jobs.

Session 19 erstellt nur Datenmodell-Dokumentation und JSON-Schemas. Sie baut
keinen Server, keine UI, keine Storage-Implementierung und keine externe API.

## Modelle

### TestAsset

Ein `TestAsset` ist ein hochgeladenes oder vorhandenes Immobilienbild im
internen Motion Lab.

Felder:

```text
asset_id
filename
source
storage_path
width
height
orientation
created_at
motif_class
motif_properties
highlight_scores
notes
```

Nutzung:

- Asset Library,
- Motif-/Scoring-Debug,
- Motion Candidate Matching,
- Shotplan Builder.

### MotionCandidate

Ein `MotionCandidate` ist ein vorgeschlagenes Bewegungs-Preset fuer ein Asset.

Felder:

```text
candidate_id
asset_id
motion_preset_id
technical_method
duration
risk_level
qwen_required
text_overlay_allowed
avatar_overlay_allowed
score
reasoning_summary
```

Nutzung:

- Motion Preset Selector,
- Qwen Test Runner,
- Single Shot Preview,
- Shotplan Builder.

### ShotTest

Ein `ShotTest` ist ein konkreter Versuch mit einem Bild und einer Bewegung.

Felder:

```text
shot_test_id
asset_id
motion_preset_id
duration
technical_method
qwen_enabled
typography_enabled
avatar_enabled
input_config
output_path
status
created_at
```

Nutzung:

- Single Shot Preview,
- Qwen Test Runner,
- Preview Renderer,
- Rating Panel.

### ShotRating

Ein `ShotRating` bewertet einen Testshot.

Felder:

```text
rating_id
shot_test_id
motion_quality
artifact_level
modern_property_feel
usable_for_social
usable_for_premium
usable_duration_max
notes
created_at
```

Nutzung:

- Rating & Feedback Panel,
- Dashboard,
- Preset-Qualitaetsauswertung.

### ShotPlan

Ein `ShotPlan` ist eine geplante Sequenz aus mehreren Bildern.

Felder:

```text
shot_plan_id
name
product_template
creative_profile
target_duration
shots
quality_gate_result
created_at
```

Nutzung:

- Shotplan Builder,
- Preview Video Renderer,
- Quality Gates,
- Variantenvergleich.

### ExternalJob

Ein `ExternalJob` dokumentiert Aufrufe externer Dienste oder deren Mock-Modus.

Felder:

```text
external_job_id
provider
adapter
status
request_payload_path
response_payload_path
input_asset_ids
output_paths
error_message
created_at
completed_at
```

Nutzung:

- Qwen Adapter,
- HeyGen Adapter,
- Render Adapter,
- Storage-/Payload-Audit,
- Dashboard.

## JSON-Quellen

Die maschinenlesbare Modellbeschreibung liegt in:

```text
config/video-motion/motion_lab_data_model.v01.json
```

Das Schema fuer diese Modellbeschreibung liegt in:

```text
config/video-motion/motion_lab_data_model.v01.schema.json
```

## Status

Alle Datenmodelle sind `v0.1`, `draft`, nicht mit echten Bildern getestet und
nicht fuer Produktion freigegeben.

