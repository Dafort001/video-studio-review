# Handover Session 13

## Was wurde erstellt?

Session 13 hat die erste Anti-Boring- und Quality-Gate-Schicht fuer die
Video-Motion-Library erstellt.

Neu erstellt:

- `docs/video-motion/55_anti_boring_rules.md`
- `docs/video-motion/56_quality_gates.md`
- `config/video-motion/anti_boring_rules.v01.json`
- `config/video-motion/quality_gates.v01.json`
- `docs/video-motion/_handover_session_13.md`

## Was ist der Inhalt?

`55_anti_boring_rules.md` beschreibt, wie langweilige oder chaotische
Social-Property-Clips verhindert werden sollen:

- keine Serien aus mehr als zwei aehnlichen Raumshots,
- keine fuenf gleich langen Takes nacheinander,
- keine sachliche Expose-Reihenfolge als Default,
- Rhythmuswechsel alle 4 bis 6 Sekunden,
- starker Einstieg,
- Detail- oder Mood-Shot im Mittelteil,
- keine endlosen Ken-Burns-Zooms,
- keine PowerPoint-Slides,
- keine zufaelligen Drehbewegungen,
- keine ueberladenen Texttafeln,
- keine Avatar-Dominanz bei normalen Listingvideos.

`anti_boring_rules.v01.json` enthaelt zwoelf v0.1-Regeln mit Severity,
Erkennungssignalen, erlaubten Korrekturen, Ausnahmen und bekannten
Fehlerfaellen.

`56_quality_gates.md` beschreibt die erste Review-Schicht fuer einen spaeteren
Shot Plan. Gate-Ergebnisse sind:

- `pass`
- `warn`
- `review`
- `block`

`quality_gates.v01.json` enthaelt neun Gates:

- `opening_strength_gate`
- `similar_shot_repetition_gate`
- `qwen_artifact_gate`
- `text_readability_gate`
- `property_dominance_gate`
- `cta_presence_gate`
- `pace_too_slow_gate`
- `pace_too_hectic_gate`
- `variety_balance_gate`

## Welche Entscheidungen wurden getroffen?

- Anti-Boring-Regeln und Quality Gates bleiben v0.1, `draft`, nicht mit echten
  Bildern getestet und nicht fuer Produktion freigegeben.
- Quality Gates sind Review-/Block-Logik fuer Shot Plans, keine automatische
  Engine und keine finalen Schwellenwerte.
- QW bleibt reviewpflichtig; sichtbare Qwen-Artefakte blockieren.
- Property Dominance ist ein Kern-Gate: normale Listingvideos muessen die
  Immobilie im 2-8-Sekunden-Fenster sichtbar tragen.
- CTA ist nur dann Pflicht, wenn das Product Template ihn verlangt.
- Avatar-/Presenter-Logik bleibt supportend und darf normale Listingvideos
  nicht dominieren.
- Anti-Boring loest Wiederholung bevorzugt durch bessere Auswahl, Reihenfolge,
  Dauer und Rhythmus; nicht durch zufaellige Effekte.

## Was wurde bewusst nicht gemacht?

- Keine API-Integration.
- Keine Webseite geaendert.
- Keine Render-Integration gebaut.
- Keine Avatar-, Voice-, HeyGen-, Qwen- oder Provider-Integration gebaut.
- Keine automatische Gate-Engine gebaut.
- Keine Qwen-Testmatrix gebaut.
- Keine finalen Produktionsschwellenwerte definiert.
- Keine spaeteren Sessions vorgezogen.

## Validierung

Durchgefuehrt am 2026-06-29:

- `python3 -m json.tool config/video-motion/anti_boring_rules.v01.json`: ok.
- `python3 -m json.tool config/video-motion/quality_gates.v01.json`: ok.
- Struktureller Anti-Boring-/Quality-Gate-Check mit Python: ok.
- Alle zwoelf Masterplan-Anti-Boring-Regeln abgedeckt: ok.
- `rule_count` ist 12: ok.
- Alle neun Masterplan-Quality-Gate-Fragen abgedeckt: ok.
- `gate_count` ist 9: ok.
- Gate-Ergebnisse enthalten `pass`, `warn`, `review`, `block`: ok.
- `qwen_enabled` und `avatar_enabled` bleiben Feature-Flag-gebunden: ok.
- Keine API-, Web-, Render-, Provider- oder Session-14-Datei geaendert.

## Git-Status bei Abschluss

Session-13-eigene neue Dateien:

- `docs/video-motion/55_anti_boring_rules.md`
- `docs/video-motion/56_quality_gates.md`
- `config/video-motion/anti_boring_rules.v01.json`
- `config/video-motion/quality_gates.v01.json`
- `docs/video-motion/_handover_session_13.md`

Optional aktualisierte Working-Memory:

- `CODEX_WORKING_MEMORY_DO_NOT_TOUCH/video-motion-current.md`

Unrelated bereits vorhandener Dirty-State, nicht von Session 13 zu bearbeiten:

- `projects/piximmo-web`

## Naechster sinnvoller Schritt

Die naechste Session darf nur die naechste im Masterplan ausdruecklich
beauftragte Session umsetzen. Nach Session 13 waere das Session 14:
Qwen-Testmatrix.

Vor Session 14 zuerst lesen:

- `docs/video-motion/MASTERPLAN.md`
- `docs/video-motion/_handover_session_13.md`

Session 14 darf nicht automatisch gestartet werden. Sie braucht Daniels
expliziten Auftrag.
