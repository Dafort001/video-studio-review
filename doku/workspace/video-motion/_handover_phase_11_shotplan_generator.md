# Handover Phase 11 - Minimal Shotplan Generator

Datum: 2026-07-01

## Ergebnis

Phase 11 ist als Offline-Shotplan-Generator umgesetzt:

- Neues CLI: `npm run motion-lab:build-shotplan`
- Implementierung: `internal/motion-lab/server/buildShotplanCli.mjs`
- Package-Script: `motion-lab:build-shotplan`
- Outputs:
  - `shotplan.json`
  - `shotplan.html`

Das CLI erzeugt auditierbare Shotplan-Vorschlaege aus:

- Phase-5 `ImageSemanticProfile`-Artefakten
- Phase-7 `Motion Candidate`-Artefakten
- `rules/edit_canon_v1.json`
- `rules/motion_canon_v1.json`

Es nutzt absichtlich die JSON-Canon-Dateien und fuehrt keine YAML-Abhaengigkeit
ein.

## CLI

Beispiel:

```sh
npm run motion-lab:build-shotplan -- \
  --profiles ./analysis/semantic_profiles \
  --video-class 45_60s_listing_video \
  --require-real-recognition true \
  --out ./analysis/shotplans
```

Optionen:

- `--profiles`
- `--motion-candidates`
- `--canon`
- `--motion-canon`
- `--video-class`
- `--require-real-recognition`
- `--allow-low-reliability`
- `--only-object`
- `--limit`
- `--force`
- `--dry-run`

Wenn `--motion-candidates` fehlt und `--profiles` auf einen Ordner
`semantic_profiles` zeigt, wird der sibling-Ordner `motion_candidates`
verwendet.

## Shot-Felder

Jeder Eintrag in `shots[]` enthaelt die Phase-11-Pflichtfelder:

- `shot_index`
- `image_id`
- `original_path`
- `confirmed_room_type`
- `recognition_source`
- `reliability_level`
- `video_role`
- `shot_duration`
- `motion_class`
- `motion_intensity`
- `text_overlay_allowed`
- `avatar_allowed`
- `risk_flags`
- `reason`
- `fallback_motion`

## Gates

Automatisch ausgewaehlt werden nur Bilder mit:

- Phase-7 `review_status=candidate`
- `quality_evaluation_allowed=true`
- bekannter `confirmed_room_type`
- nicht-mock Recognition
- `reliability_level` nicht `none`
- `reliability_level=low` nur mit explizitem
  `--allow-low-reliability true`
- bei `--require-real-recognition true`: real Vision, manuelle Bestaetigung
  oder akzeptierte Metadaten-Erkennung
- Motion-Klasse in `rules/motion_canon_v1.json`
- `usable_in_video_class` enthaelt die gewaehlte Videoklasse

Alle anderen Bilder landen in `excluded_images[]` mit konkretem
`exclusion_reason`.

## Audit / Sicherheit

Der Shotplan schreibt `source_trace` mit:

- `external_api_used=false`
- `renderer_started=false`
- `final_video_rendered=false`
- `avatar_compositing_started=false`
- `generative_video_api_used=false`
- `modal_submit_started=false`
- `da3_sam3_started=false`

Phase 11 startet nicht:

- finale Videoerzeugung
- Avatar-Compositing
- generative Video-API
- externe APIs
- Modal-Jobs
- DA3/SAM3

## Ranking / Canon-Nutzung

Der Generator sortiert zunaechst nach der Canon-Sequenz der gewaehlten
Videoklasse und danach nach Phase-7 `edit_priority`.

Shotdauer wird aus `recommended_shot_duration` genommen und in das
Canon-Zeitfenster der Videoklasse geklemmt. Fuer
`avatar_presenter_video` wird das Object-Shot-Zeitfenster verwendet.

Wichtig: Die Canon-Dateien sind weiterhin
`status=draft_reference_derived` und `approved_for_production=false`.
Der Output ist deshalb ein Audit-Vorschlag, kein final freigegebener
Kundenvideo-Plan.

## Verifikation

Geprueft wurde:

```sh
node --check internal/motion-lab/server/buildShotplanCli.mjs
npm run motion-lab:build-shotplan -- --help
node -e 'JSON.parse(require("fs").readFileSync("package.json","utf8")); console.log("package-json-ok")'
npm run motion-lab:build-shotplan -- --profiles /tmp/pixcapture_phase7_motion/semantic_profiles --motion-candidates /tmp/pixcapture_phase7_motion/motion_candidates --video-class 45_60s_listing_video --require-real-recognition true --out /tmp/pixcapture_phase11_shotplans
npm run motion-lab:build-shotplan -- --profiles /tmp/pixcapture_phase7_motion/semantic_profiles --video-class 45_60s_listing_video --require-real-recognition true --out /tmp/pixcapture_phase11_shotplans_default
```

Der strukturelle Smoke-Test bestaetigte:

- `shotplan.json` wurde erzeugt
- `shotplan.html` wurde erzeugt
- alle Pflichtfelder sind in jedem Shot vorhanden
- unsichere Bilder wurden sichtbar ausgeschlossen:
  - Mock Recognition
  - Unknown Recognition
  - Low Reliability
  - fehlendes Planning Gate
- Safety-Flags fuer externe API, Renderer, finales Video, Modal und DA3/SAM3
  bleiben `false`

Die synthetische Phase-7-Testmenge enthaelt nur zwei geeignete Bilder. Deshalb
meldet der 45-60s-Smoke-Lauf korrekt:

- `selected_count=2`
- `below_minimum_image_count=true`

## Naechster Schritt

Phase 12 darf auf `shotplan.json` und `shotplan.html` aufsetzen, aber weiterhin
ohne finales Rendering, Avatar-Compositing, generative Video-API, Modal-Submit
oder DA3/SAM3-Start, bis Daniel das explizit freigibt.
