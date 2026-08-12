# Zwischenpruefung Phase 7 - Motion Candidates

Datum: 2026-07-01

## Pruefergebnis

`READY_FOR_NEXT_PHASE = true`

Phase 7 ist in sich abgeschlossen und bleibt hinter dem Planning Gate. Die
Implementierung erzeugt Motion-Candidate-Artefakte und Reports, aber keine
Videos, Renderer-Jobs, DA3/SAM3-Jobs oder externen API-Aufrufe.

## Gepruefte Vorgaben

| Vorgabe | Status |
| --- | --- |
| Motion Candidates nur nach Planning Gate | erfuellt |
| `quality_evaluation_allowed=true` oder manuelle Motion-Freigabe erforderlich | erfuellt |
| `mock` nicht automatisch verwenden | erfuellt |
| `filename_heuristic` ohne manuelle Freigabe nicht automatisch verwenden | erfuellt |
| `unknown` / `needs_manual_review` nicht automatisch verwenden | erfuellt |
| `reliability_level=none` nicht automatisch verwenden | erfuellt |
| `reliability_level=low` nur mit `--allow-low-reliability` | erfuellt |
| keine finale Videoerzeugung | erfuellt |
| keine Renderer-Logik | erfuellt |
| keine DA3/SAM3-Jobs | erfuellt |
| keine externen APIs | erfuellt |
| Ausschlussgruende dokumentiert | erfuellt |

## Output-Vertrag

Jede JSONL-Zeile enthaelt die Pflichtfelder:

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

Nicht geeignete Bilder behalten `motion_class=null` und erhalten
`review_status=needs_review` oder `review_status=reject`.

## Testnotizen

Der synthetische Smoke-Test enthielt:

- ein freigegebenes Qwen/Real-Vision-Bild mit Candidate
- ein manuell bestaetigtes Bild mit Candidate
- ein `mock`-Bild mit `reject`
- ein `filename_heuristic`-Bild mit `needs_review`
- ein `unknown`-Bild mit `reject`
- ein `needs_manual_review`-Bild mit `needs_review`
- einen Lauf ohne Planning Gate mit ausschliesslich `needs_review`

## Offene Produktentscheidung

`--allow-low-reliability` ist bewusst nicht als Qualitaetsfreigabe fuer reale
Videos zu verstehen. Es ist nur ein expliziter technischer Review-Modus. Fuer
echte Produktqualitaet sollte weiterhin Real Vision, manuelle Bestaetigung oder
akzeptierte Metadaten durch Phase 6 laufen.
