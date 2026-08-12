# Handover Phase 7 - Motion Candidates

Datum: 2026-07-01

## Ergebnis

Phase 7 ist als Offline-Auswertung umgesetzt:

- Neues CLI: `npm run motion-lab:score-motion`
- Implementierung: `internal/motion-lab/server/scoreMotionCandidatesCli.mjs`
- Schema: `config/video-motion/motion_candidate.v01.schema.json`
- Outputs:
  - `motion_candidates.jsonl`
  - `candidates/{image_id}.json`
  - `motion_candidate_report.json`
  - `motion_candidate_report.html`

## Harte Sicherheitsgrenzen

Das CLI erzeugt nur Motion Candidates, Scores, Begruendungen,
verbotene Bewegungen und Reports.

Es startet nicht:

- finale Videoerzeugung
- Renderer-Logik
- DA3/SAM3-Jobs
- externe APIs

Jeder Candidate schreibt in `source_trace`:

- `external_api_used=false`
- `renderer_started=false`
- `da3_sam3_started=false`

## Planning-Gate-Regel

Phase 7 nutzt Motion Candidates nur hinter Phase 6.

Ein Bild bekommt nur dann automatisch eine Motion-Klasse, wenn es im Planning
Gate als `selected` gefunden wird und:

- `quality_evaluation_allowed=true`
- oder eine manuelle Motion-Freigabe fuer ein manuell bestaetigtes Bild
  vorliegt

Ohne `--planning-root` oder `--planning-gate` werden keine Motion-Klassen
erzwungen. Die Bilder gehen auf `needs_review` mit
`planning_gate_missing`.

Nicht automatisch verwendet werden:

- `mock`
- `filename_heuristic` ohne manuelle Motion-Freigabe
- `unknown`
- `needs_manual_review`
- `reliability_level=none`
- `reliability_level=low`, ausser der Lauf ist ausdruecklich mit
  `--allow-low-reliability true` gestartet

## CLI-Beispiele

```bash
npm run motion-lab:score-motion -- \
  --profiles ./analysis/semantic_profiles \
  --planning-root ./analysis-root \
  --video-class 45_60s_listing_video \
  --require-real-recognition true \
  --out ./analysis/motion_candidates
```

Ein einzelner Shotplan kann direkt uebergeben werden:

```bash
npm run motion-lab:score-motion -- \
  --profiles ./analysis/semantic_profiles \
  --planning-gate ./work/OBJECT_ID/shotplans/balanced_listing_video.json \
  --out ./analysis/motion_candidates
```

## Candidate-Felder

Pro Bild werden die vorgegebenen Pflichtfelder geschrieben:

- `image_id`
- `confirmed_room_type`
- `recognition_source`
- `reliability_level`
- `quality_evaluation_allowed`
- `video_role_candidate`
- `motion_class`
- `motion_intensity`
- `motion_reason`
- `forbidden_motions`
- `risk_flags`
- `review_status`

Zusaetzlich schreibt Phase 7 die Phase-7-Rollenfelder:

- `edit_role`
- `edit_priority`
- `usable_in_video_class`
- `recommended_shot_duration`
- `can_open_video`
- `can_close_video`
- `works_as_transition`
- `works_as_detail_insert`
- `works_with_text_overlay`
- `works_with_avatar`
- `cta_suitability`
- `exclusion_reason`
- `planning_gate`

## Bewegungslogik

Die Motion-Klassen bleiben MVP-sicher:

- `static_hold`
- `push_in_soft`
- `pull_out_soft`
- `lateral_slide`
- `diagonal_drift`
- `parallax_push`
- `reveal_from_edge`
- `tilt_emulation`
- `detail_micro_move`
- `vertical_lift_soft`

Vermeidungsregeln blockieren riskante Bewegungen bei Spiegeln, dominanten
Fenstern, starken Vertikalen, niedriger Depth Confidence, Detailbildern,
Floorplans und technischen Bildproblemen. Wenn ein Bild nicht geeignet ist,
bleibt `motion_class=null` und der Ausschlussgrund steht in
`exclusion_reason`.

## Verifikation

Lokale Smoke-Tests wurden auf synthetischen Profilen und Shotplans ausgefuehrt.

Geprueft wurde:

- `node --check internal/motion-lab/server/scoreMotionCandidatesCli.mjs`
- `node -e 'JSON.parse(...)'` fuer das neue Schema
- `npm run motion-lab:score-motion -- --help`
- Lauf mit Planning Gate und gemischten Quellen
- Lauf ohne Planning Gate erzeugt keine Motion-Klassen
- Pflichtfelder sind in allen JSONL-Zeilen vorhanden

## Naechster Schritt

Phase 8 darf auf den Motion-Candidate-Artefakten aufsetzen, aber erst nach
Pruefung der Candidate-Reports. Renderer, DA3/SAM3 oder externe APIs duerfen
nicht aus Phase 7 heraus implizit gestartet werden.
