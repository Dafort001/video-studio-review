# Handover Phase 06 - Planning Gate

Stand: 2026-07-01

## Ziel

Phase 6 verhindert, dass echte Shotplans aus unzuverlaessiger Recognition
entstehen. Die Planungslogik bewertet jetzt explizit, ob ein Lauf
qualitaetsfaehig ist oder nur ein technischer Pipeline-Test.

Kein Rendering wurde ausgefuehrt.

## Grundregel

Automatisch fuer echte Shotplans nutzbar sind nur Bilder mit mindestens einer
dieser Bedingungen:

- `is_real_vision=true` und `reliability_level=medium|high`
- `is_manual=true` und `confirmed_room_type != unknown`
- `recognition_source=existing_metadata` und `reliability_level=medium|high`

Weiterhin ausgeschlossen:

- `mock`: erzeugt keine Shots mehr, auch nicht mit `--allow-low-reliability`
- `confirmed_room_type=unknown`: bleibt in `unknown_images` /
  `rejected_images`
- `filename_heuristic`: nur mit
  `--require-real-recognition false --allow-low-reliability true`, dann aber
  `pipeline_test_only=true` und `quality_evaluation_allowed=false`

## Geaenderte Dateien

- `internal/motion-lab/server/planning/shotplan.ts`
- `internal/motion-lab/server/batchCli.mjs`
- `docs/video-motion/_handover_phase_06_planning_gate.md`

## Shotplan-Erweiterung

Jeder Shotplan enthaelt jetzt:

- `planning_gate.real_recognition_used`
- `planning_gate.manually_confirmed_used`
- `planning_gate.existing_metadata_used`
- `planning_gate.low_reliability_used`
- `planning_gate.allow_low_reliability_used`
- `planning_gate.require_real_recognition`
- `planning_gate.quality_evaluation_allowed`
- `planning_gate.pipeline_test_only`
- `planning_gate.low_reliability_images`
- `planning_gate.unknown_images`

`recognition_quality` wurde erweitert um:

- `existing_metadata_reliable`
- `filename_heuristic_low_reliability`

## CLI-Report-Erweiterung

`npm run motion-lab:plan` gibt jetzt `planning_quality` auf Root- und
Objektebene aus:

- `total_shotplans`
- `total_shots`
- `quality_evaluation_allowed`
- `pipeline_test_only`
- `real_recognition_used`
- `manually_confirmed_used`
- `existing_metadata_used`
- `low_reliability_used`
- `allow_low_reliability_used`
- `rejected_images`
- `unknown_images`
- `low_reliability_images`
- `mock_images`

Pro Shotplan-Summary werden zusaetzlich gezeigt:

- `quality_evaluation_allowed`
- `pipeline_test_only`
- `real_recognition_used`
- `low_reliability_used`
- `allow_low_reliability_used`
- `unknown_image_count`
- `rejected_image_count`

## Wichtige CLI-Details

`--allow-low-reliability true` wird jetzt robust als Boolean geparst. Vorher
funktionierte nur das Flag ohne Wert korrekt.

Standard fuer echte Tests bleibt:

```sh
npm run motion-lab:plan -- --root "/Volumes/PIX_MOTION_TEST" --require-real-recognition true
```

Filename-Heuristik nur fuer Proof-of-Motion / technische Sichtpruefung:

```sh
npm run motion-lab:plan \
  -- --root "/Volumes/PIX_MOTION_TEST" \
  --require-real-recognition false \
  --allow-low-reliability true
```

## Validierung

Test-Root:

```text
/tmp/pixcapture_phase6_gate
```

Getestet:

```sh
node --check internal/motion-lab/server/batchCli.mjs
node --check internal/motion-lab/server/planning/shotplan.ts
npm run motion-lab:plan -- --root /tmp/pixcapture_phase6_gate --only-object mock_object --require-real-recognition true --variants fast_social_teaser
npm run motion-lab:plan -- --root /tmp/pixcapture_phase6_gate --only-object real_object --require-real-recognition true --variants fast_social_teaser
npm run motion-lab:plan -- --root /tmp/pixcapture_phase6_gate --only-object filename_object --require-real-recognition true --variants fast_social_teaser
npm run motion-lab:plan -- --root /tmp/pixcapture_phase6_gate --only-object filename_object --require-real-recognition false --allow-low-reliability true --variants fast_social_teaser
npm run motion-lab:plan -- --root /tmp/pixcapture_phase6_gate --only-object unknown_object --require-real-recognition true --variants fast_social_teaser
```

Ergebnisse:

- `mock_object`: Exit 1, `total_shots=0`, `pipeline_test_only=1`,
  `mock_images=1`, Rejection-Grund:
  `mock recognition is technical-test-only and cannot populate real shotplans`.
- `real_object`: Exit 0, `total_shots=1`,
  `quality_evaluation_allowed=1`, `real_recognition_used=1`.
- `filename_object` ohne Sonderfreigabe: Exit 1, `total_shots=0`,
  `low_reliability_images=1`.
- `filename_object` mit Sonderfreigabe: Exit 0, `total_shots=1`,
  `low_reliability_used=1`, `pipeline_test_only=1`,
  `quality_evaluation_allowed=0`.
- `unknown_object`: Exit 1, `total_shots=0`, `unknown_images=1`,
  `pipeline_test_only=1`.

## Nicht Getan

- Kein Rendering.
- Keine finalen Motion-Regeln als unveraenderbar behandelt.
- Keine externen APIs.
- Keine DA3/SAM3-Verarbeitung.

## Naechste Phase

Phase 7 kann auf diesem Gate aufsetzen und Profile/Recognition nur dann in
echte Planungslogik ueberfuehren, wenn `quality_evaluation_allowed=true` oder
eine UI/manuelle Review-Freigabe bewusst dokumentiert ist.
