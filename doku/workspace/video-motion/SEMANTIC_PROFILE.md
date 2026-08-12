# ImageSemanticProfile

Stand: 2026-07-01

## Zweck

`ImageSemanticProfile` ist die interne Bildanalyse-Schicht zwischen Katalog,
Recognition und Motion Candidate. Sie fuehrt technische Bilddaten,
Recognition-Ergebnisse, optionale Qwen-Rohdaten und kostenlose lokale
CV-Heuristiken in ein auditierbares Profil pro Bild zusammen.

CLI:

```text
npm run motion-lab:build-profiles -- --catalog ./analysis/catalog/image_catalog.jsonl --out ./analysis/semantic_profiles
```

Mit Recognition und Qwen-Rohimport:

```text
npm run motion-lab:build-profiles \
  -- --catalog ./analysis/catalog/image_catalog.jsonl \
  --semantic-raw ./analysis/qwen_import/merged_semantic_raw.jsonl \
  --recognition-root "/Volumes/PIX_MOTION_TEST" \
  --out ./analysis/semantic_profiles \
  --force true
```

## Outputs

```text
analysis/semantic_profiles/image_semantic_profiles.jsonl
analysis/semantic_profiles/profiles/{image_id}.json
analysis/semantic_profiles/semantic_profile_report.json
analysis/semantic_profiles/semantic_profile_report.html
```

Schema:

```text
config/video-motion/image_semantic_profile.v01.schema.json
```

`analysis_version` ist:

```text
image_semantic_profile.v1
```

## Top-Level-Aufbau

Pflichtfelder:

- `image_id`
- `source_image_uri`
- `original_path`
- `checksum_sha256`
- `perceptual_hash`
- `width`
- `height`
- `orientation`
- `qwen_normalized`
- `recognition_profile`
- `technical_metrics`
- `geometry_profile`
- `light_profile`
- `composition_profile`
- `worker_requirements`
- `semantic_scores`
- `risk_flags`
- `recommended_motion`
- `review_status`
- `source_trace`
- `analysis_version`

## Tags

Tags koennen aus Qwen-Rohdaten, Recognition und lokalen Heuristiken kommen.
Wichtige Gruppen:

- `qwen_normalized.object_tags`
- `qwen_normalized.composition_tags`
- `qwen_normalized.light_tags`
- `composition_profile.tags`
- `recognition_profile` Raum- und Video-Nutzbarkeit

Beispiele:

- Raum-/Objekthinweise: `living`, `kitchen`, `bathroom`, `detail`
- Komposition: `wide_room`, `deep_perspective`, `doorway_view`,
  `window_view`, `flat_wall`
- Licht: `bright`, `daylight`, `window_dominant`

Tags sind Hinweise fuer Review und Ranking. Sie ersetzen keine
`confirmed_room_type`-Entscheidung.

## Scores

Alle Semantic Scores liegen auf `0..1`:

- `hero_score`
- `motion_potential_score`
- `motion_safety_score`
- `text_overlay_score`
- `spatial_depth_score`
- `feature_score`
- `social_hook_score`
- `avatar_background_score`
- `qwen_risk_score`
- `paid_escalation_score`

Die Scores sind MVP-Heuristiken. Sie duerfen Kandidaten priorisieren, aber
nicht alleine finale Kundenvideos freigeben.

## Risk Flags

Unterstuetzte Risk Flags sind unter anderem:

- `mirror_dominant`
- `window_overexposed`
- `strong_verticals`
- `wide_angle_distortion`
- `low_sharpness`
- `high_noise`
- `low_resolution`
- `cluttered`
- `small_room`
- `low_depth_confidence`
- `thin_geometry`
- `people_present`
- `pets_present`
- `personal_items`
- `text_or_logo_visible`
- `privacy_sensitive`
- `floorplan_not_photo`
- `duplicate_or_near_duplicate`
- `unknown_room`
- `too_dark`
- `too_bright`

Risk Flags speisen spaeter Motion-Vermeidungsregeln und Review-Reports.

## Worker Requirements

`worker_requirements` markiert moegliche spaetere Worker-Bedarfe, zum Beispiel
fuer depth- oder segmentation-nahe Entscheidungen.

Wichtig: Eine Worker-Markierung startet keinen Job. DA3/SAM3 bleiben optionale
spaetere Worker-Schritte und duerfen nicht automatisch aus Semantic Profiles
heraus gestartet werden.

## Motion Recommendation

`recommended_motion` ist eine vorsichtige Kandidatenliste:

```text
status
candidates
avoid
rationale
```

Sie ist noch kein Shotplan. Phase 7 `Motion Candidate` entscheidet spaeter
strenger anhand von Planning Gate, Recognition-Quelle, Reliability,
Motion-Safety und Video-Klasse.

## Source Trace

`source_trace` dokumentiert, woher ein Profil kommt:

- `catalog`
- `qwen_semantic_raw`
- `recognition`
- `free_cv_heuristics`
- `external_api_used=false`

Phase 5 selbst ruft keine externen APIs auf. Wenn Qwen-Rohdaten genutzt
werden, stammen sie aus einem vorherigen Import.

## Ready For Downstream

Ein Profil reicht allein noch nicht fuer echte Planung. Downstream braucht
mindestens:

- belastbare Recognition oder manuelle Bestaetigung
- Planning Gate mit `quality_evaluation_allowed=true`
- Motion Candidate mit `review_status=candidate`
- Shotplan-Generator mit sichtbaren Ausschlussgruenden

## MVP-Grenze

Semantic Profiles sind Analyse- und Review-Artefakte. Sie erzeugen keine
finalen Videos, keine generativen Video-Calls, keine Avatar-Composites und
keine Modal-Jobs.
