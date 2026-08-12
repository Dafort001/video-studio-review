# Handover Session 14

## Was wurde erstellt?

Session 14 hat die erste Qwen-Testmatrix fuer die Video-Motion-Library
erstellt.

Neu erstellt:

- `docs/video-motion/60_qwen_test_matrix.md`
- `docs/video-motion/61_qwen_prompt_patterns.md`
- `docs/video-motion/62_qwen_evaluation_criteria.md`
- `config/video-motion/qwen_test_cases.v01.json`
- `docs/video-motion/_handover_session_14.md`

## Was ist der Inhalt?

`60_qwen_test_matrix.md` beschreibt, wie Qwen-Perspektiv- und
Multi-Angle-Bewegungen mit echten Immobilienbildern getestet werden sollen,
bevor sie spaeter fuer Shot Plans, Rendering oder Produktlogik freigegeben
werden.

Die Matrix plant 24 echte Beispielbild-Slots ueber mehrere Motivklassen:

- `exterior`
- `entrance`
- `living`
- `open_plan`
- `kitchen`
- `bathroom`
- `staircase`
- `terrace`
- `garden`
- `detail`

`61_qwen_prompt_patterns.md` definiert fuenf Prompt-Muster:

- `tiny_perspective_nudge`
- `exterior_micro_lift`
- `counter_or_feature_orbit`
- `kitchen_short_perspective`
- `staircase_micro_orbit`

Jedes Muster hat einen positiven Prompt-Kern und einen negativen Schutz-Kern,
damit Property-Fakten nicht veraendert werden.

`62_qwen_evaluation_criteria.md` definiert die sieben im Masterplan geforderten
Bewertungskriterien:

- `geometry_plausibility`
- `motion_energy`
- `modern_property_feel`
- `artifact_visibility`
- `usable_at_0_5s`
- `usable_at_1_5s`
- `usable_at_3s`

`qwen_test_cases.v01.json` enthaelt 24 Testcases mit:

- Motivklasse,
- erforderlichen Eigenschaften,
- Qwen-relevanten Preset-Kandidaten,
- Prompt-Pattern-IDs,
- Risiko-Fokus,
- erwarteter Testnutzung,
- `sample_status: needs_real_image`.

## Welche Entscheidungen wurden getroffen?

- Session 14 macht Qwen testbar, aber gibt Qwen nicht produktiv frei.
- Es wurden keine echten Beispielbilder zugewiesen und keine Qwen-Outputs
  generiert.
- Alle Testcases bleiben `needs_real_image`, bis echte Immobilienbilder
  ausgewaehlt wurden.
- Die Dauerbewertung unterscheidet 0.5s, 1.5s und 3.0s.
- 3-Sekunden-QW-Nutzung bleibt ein Ausnahmefall mit sehr hoher
  Geometrieanforderung.
- Qwen-Outputs blockieren, wenn sie Property-Fakten veraendern, Artefakte
  sichtbar machen oder synthetischer wirken als die Immobilie.

## Was wurde bewusst nicht gemacht?

- Keine Qwen-API-Integration.
- Keine Provider-Auswahl oder Provider-Konfiguration.
- Keine Webseite geaendert.
- Keine Render-Integration gebaut.
- Keine automatische Test- oder Bewertungsengine gebaut.
- Keine echten Bilder ausgewaehlt.
- Keine Qwen-Generierungen ausgefuehrt.
- Keine Produktionsfreigabe fuer QW-/MX-Presets.
- Keine Session-15-Codearbeit vorgezogen.

## Validierung

Durchgefuehrt am 2026-06-29:

- `python3 -m json.tool config/video-motion/qwen_test_cases.v01.json`: ok.
- Struktureller Qwen-Testmatrix-Check mit Python: ok.
- `test_case_count` ist 24: ok.
- Alle sieben Masterplan-Bewertungskriterien sind vorhanden: ok.
- Alle 24 Testcases haben `sample_status: needs_real_image`: ok.
- Alle referenzierten Qwen-Presets existieren in
  `config/video-motion/motion_presets.v01.json`: ok.
- Keine API-, Web-, Render-, Provider- oder Session-15-Datei geaendert.

## Git-Status bei Abschluss

Session-14-eigene neue Dateien:

- `docs/video-motion/60_qwen_test_matrix.md`
- `docs/video-motion/61_qwen_prompt_patterns.md`
- `docs/video-motion/62_qwen_evaluation_criteria.md`
- `config/video-motion/qwen_test_cases.v01.json`
- `docs/video-motion/_handover_session_14.md`

Optional aktualisierte Working-Memory:

- `CODEX_WORKING_MEMORY_DO_NOT_TOUCH/video-motion-current.md`

Unrelated bereits vorhandener Dirty-State, nicht von Session 14 zu bearbeiten:

- `projects/piximmo-web`

## Naechster sinnvoller Schritt

Die naechste Session darf nur die naechste im Masterplan ausdruecklich
beauftragte Session umsetzen. Nach Session 14 waere das Session 15:
Implementierung als kleines Modul.

Vor Session 15 zuerst lesen:

- `docs/video-motion/MASTERPLAN.md`
- `docs/video-motion/_handover_session_14.md`

Session 15 darf nicht automatisch gestartet werden. Sie braucht Daniels
expliziten Auftrag.
