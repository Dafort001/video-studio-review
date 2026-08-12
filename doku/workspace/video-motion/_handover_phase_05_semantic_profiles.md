# Handover Phase 05 - ImageSemanticProfile v1

Stand: 2026-07-01

## Ziel

Phase 5 erzeugt ein internes `ImageSemanticProfile` pro Bild aus lokalen
Quellen:

- Phase-1-Katalog
- optional Phase-2 `merged_semantic_raw.jsonl`
- optional Phase-3/4 `image_recognition.json`
- kostenlose ffmpeg-basierte CV-Heuristiken

Es wurden keine externen APIs, keine DA3/SAM3-Jobs, keine Shotplans und kein
Rendering ausgefuehrt.

## CLI

Neuer Script-Eintrag:

```sh
npm run motion-lab:build-profiles -- --catalog ./analysis/catalog/image_catalog.jsonl --out ./analysis/semantic_profiles
```

Mit optionalen Quellen:

```sh
npm run motion-lab:build-profiles \
  -- --catalog ./analysis/catalog/image_catalog.jsonl \
  --semantic-raw ./analysis/qwen_import/merged_semantic_raw.jsonl \
  --recognition-root "/tmp/motion_lab_root" \
  --out ./analysis/semantic_profiles \
  --limit 10 \
  --force true
```

Optionen:

- `--catalog`
- `--semantic-raw`
- `--recognition-root`
- `--out`
- `--limit`
- `--only-object`
- `--force`
- `--dry-run`

Hinweis: DuckDB/Parquet werden weiterhin nicht gelesen. Phase 5 nutzt die
dependency-freie Phase-1-JSONL/JSON-Ausgabe.

## Outputs

Standardausgabe unter `analysis/semantic_profiles`:

- `image_semantic_profiles.jsonl`
- `profiles/{image_id}.json`
- `semantic_profile_report.json`
- `semantic_profile_report.html`

## Schema

Schema-Datei:

- `config/video-motion/image_semantic_profile.v01.schema.json`

Top-Level-Felder:

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

`analysis_version` ist `image_semantic_profile.v1`.

## Heuristiken

Licht:

- Helligkeitsmittel
- p05/p50/p95
- Kontrast
- Highlight-/Shadow-Clip-Ratio
- Sättigung
- Weissabgleich-Farbstich
- Warmlichtdominanz
- dunkle Ecken

Geometrie:

- vertikale/horizontale Kantenstaerke
- Fluchtlinien-Proxy
- Keystone-Risiko
- Symmetrie
- Boden-/Deckensichtbarkeit als Proxy
- Raumtiefe als Proxy

Bildqualitaet:

- Schaerfe-Proxy
- Rausch-Proxy
- Aufloesungsscore
- Duplicate-/Near-Duplicate-Erkennung ueber identischen Perceptual Hash
- extrem dunkle/helle Bilder

Komposition:

- `wide`
- `medium`
- `detail`
- `window_view`
- `doorway_view`
- `foreground_layered`
- `flat_wall`
- `object_detail`
- `unclear`

## Scores

Alle Scores liegen auf `0..1`:

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

Wichtig: `recommended_motion` ist nur eine vorsichtige Kandidatenliste fuer
spaetere Review-/Planungslogik. Phase 5 erstellt keine finalen Shotplans.

## Risk Flags

Unterstuetzte Flags:

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

## Validierung

Test-Fixtures:

```text
/tmp/pixcapture_phase5_src
/tmp/pixcapture_phase5_analysis
/tmp/pixcapture_phase5_recognition
/tmp/pixcapture_phase5_broken_src
/tmp/pixcapture_phase5_broken_analysis
```

Getestet:

```sh
node --check internal/motion-lab/server/buildSemanticProfilesCli.mjs
npm run motion-lab:build-profiles -- --help
node -e 'JSON.parse(require("fs").readFileSync("config/video-motion/image_semantic_profile.v01.schema.json","utf8")); console.log("semantic-profile-schema-json-ok")'
npm run motion-lab:catalog -- --root /tmp/pixcapture_phase5_src --out /tmp/pixcapture_phase5_analysis/catalog --report-out /tmp/pixcapture_phase5_analysis/reports --force-catalog
npm run motion-lab:build-profiles -- --catalog /tmp/pixcapture_phase5_analysis/catalog/image_catalog.jsonl --semantic-raw /tmp/pixcapture_phase5_analysis/qwen_import/merged_semantic_raw.jsonl --recognition-root /tmp/pixcapture_phase5_recognition --out /tmp/pixcapture_phase5_analysis/semantic_profiles --force true
npm run motion-lab:build-profiles -- --catalog /tmp/pixcapture_phase5_analysis/catalog/image_catalog.jsonl --out /tmp/pixcapture_phase5_analysis/semantic_profiles_catalog_only --force true --limit 1
npm run motion-lab:build-profiles -- --catalog /tmp/pixcapture_phase5_broken_analysis/catalog/image_catalog.jsonl --out /tmp/pixcapture_phase5_broken_analysis/semantic_profiles --force true
```

Ergebnisse:

- Profile mit Katalog + Qwen-Raw + Recognition: `ok=true`, `profile_count=2`,
  `validation_error_count=0`.
- Katalog-only-Fallback: `ok=true`, `profile_count=1`,
  `validation_error_count=0`, Review-Warnings fuer fehlende Quellen.
- Kaputte JPG-Datei: `ok=true`, `cv_failure_count=1`,
  `validation_error_count=0`; der Lauf bricht nicht ab.

## Performance

Die CV-Heuristik skaliert jedes Bild mit ffmpeg auf `64x64` RGB und berechnet
danach einfache Pixel-/Gradientenmetriken in Node.js. Das ist fuer Smoke- und
Batch-Pruefungen bewusst guenstig und dependency-arm, aber keine praezise
Computer-Vision-Messung.

## Grenzen

- Raumtiefe, Keystone, Boden/Decke und Fluchtlinien sind nur Proxies.
- People/Pets/Privacy/Text werden aus vorhandenen Tags/Texten abgeleitet, nicht
  per Objektdetektor erkannt.
- Duplicate-Erkennung nutzt vorerst identische Perceptual Hashes, keine echte
  Hamming-Distanz-Gruppierung.
- `recommended_motion` darf nicht als finaler Shotplan verwendet werden.
- Ohne Recognition/Qwen bleibt `unknown_room` bewusst sichtbar; Phase 5 erfindet
  keine Raumtypen aus Dateinamen.

## Offene Punkte fuer Phase 6

- Profil-Review-Regeln definieren: wann wird `needs_review` zu
  `profile_ready`.
- Optional echte Near-Duplicate-Gruppierung ueber Hamming-Distanz.
- Profile als Eingang fuer Planner/Scoring mappen, aber nur mit expliziten
  Quality Gates.
- Wenn erforderlich: externe CV/Depth/Segmentation erst nach Kostenfreigabe
  und nicht in Phase 5 nachziehen.

## Nicht Getan

- Keine finalen Shotplans.
- Kein Rendering.
- Keine externen APIs.
- Keine DA3/SAM3-Verarbeitung.
