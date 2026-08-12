# Qwen Test Matrix v0.1

## Zweck

Diese Datei definiert, wie Qwen-Perspektiv- und Multi-Angle-Bewegungen mit
echten Immobilienbildern getestet werden sollen, bevor sie spaeter in Shot
Plans oder Rendering-Logik freigegeben werden.

Session 14 erstellt Planungsartefakte. Sie baut keine Qwen-API-Integration,
keine Webseite, keine Render-Integration, keine Provider-Integration und keine
produktive Auswahl-Engine.

## Grundsatz

Qwen-Bewegungen duerfen nicht nur theoretisch plausibel klingen. Jede
QW-/MX-Nutzung braucht echte Bildtests, Artefaktbewertung und Dauerbewertung.

Die v0.1-Matrix plant 24 echte Beispielbilder. Diese Session liefert aber keine
Bilddateien und fuehrt keine Qwen-Generierung aus. Alle Testcases bleiben
deshalb `needs_real_image`, bis echte Referenzbilder zugewiesen wurden.

## Testumfang v0.1

Zielumfang:

- 20 bis 30 echte Beispielbilder.
- Mehrere Motivklassen.
- Pro Motivklasse mehrere Qwen-relevante Presets oder Prompt-Patterns.
- Bewertung nach Artefakten, Dynamik und Nutzbarkeit.

Die v0.1-Testmatrix verwendet 24 Slots:

```text
exterior   4
entrance   2
living     3
open_plan  3
kitchen    4
bathroom   2
staircase  2
terrace    2
garden     1
detail     1
```

## Qwen-relevante Presets

Aus der Motion Library v0.1 sind fuer Session 14 besonders relevant:

```text
universal_micro_perspective_pop
exterior_drone_hint_micro
open_plan_micro_orbit_counter
kitchen_detail_micro_orbit
kitchen_perspective_nudge_short
bathroom_micro_perspective_clean
staircase_micro_orbit
detail_perspective_nudge_micro
```

Diese Presets bleiben `draft`, nicht mit echten Bildern getestet und nicht fuer
Produktion freigegeben.

## Test-Ablauf

1. Echtes Immobilienbild einem Matrix-Slot zuweisen.
2. Motivklasse und Eigenschaften pruefen.
3. Qwen-relevante Presets oder Prompt-Patterns auswaehlen.
4. Qwen-Output fuer definierte Dauerfenster bewerten:
   - 0.5 Sekunden,
   - 1.5 Sekunden,
   - 3.0 Sekunden.
5. Artefakte, Dynamik, Immobilienwirkung und Nutzbarkeit bewerten.
6. Ergebnis als `pass`, `warn`, `review` oder `block` markieren.

## Harte Blocker

Ein Qwen-Test blockiert, wenn eines dieser Muster sichtbar ist:

- Fenster, Tueren, Waende oder Treppen veraendern ihre Form.
- Grundriss, Blickrichtung oder View wird erfunden.
- Moebel, Armaturen oder Fassadenteile entstehen neu.
- Spiegelungen, Glas oder Linien schwimmen sichtbar.
- Die Bewegung wirkt wie eine synthetische 3D-Szene statt wie ein
  Immobilienclip.
- Der Output ist nur bei 0.5 Sekunden kaschierbar, aber nicht ehrlich nutzbar.

## JSON-Quelle

Die maschinenlesbaren Testcases liegen in:

```text
config/video-motion/qwen_test_cases.v01.json
```

## Status

Alle Qwen-Testcases sind `v0.1`, `draft`,
`tested_with_real_images: false`, `approved_for_production: false` und
`sample_status: needs_real_image`.

