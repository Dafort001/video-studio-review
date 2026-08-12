# Handover Session 10

## Was wurde erstellt?

Session 10 hat die erste Script-, Voice- und Timing-Schicht fuer die
Video-Motion-Library erstellt.

Neu erstellt:

- `docs/video-motion/46_script_voice_timing.md`
- `config/video-motion/script_timing_rules.v01.json`
- `config/video-motion/presenter_sequence_templates.v01.json`
- `config/video-motion/voiceover_rules.v01.json`
- `docs/video-motion/_handover_session_10.md`

## Was ist der Inhalt?

`46_script_voice_timing.md` beschreibt die Grunddramaturgie fuer Sprecher,
Avatar, Untertitel und Timing:

- 0-2s: Hook moeglich.
- 2-8s: Immobilie muss sichtbar dominieren.
- 8-20s: kurze Feature-Erklaerung moeglich.
- Letzte 2-4s: CTA, Kontakt oder Branding.
- Avatar nie dauerhaft ueber die Immobilie legen.
- Voiceover muss kurz bleiben.
- Video muss ohne Ton verstaendlich bleiben.

`script_timing_rules.v01.json` enthaelt vier Timing-Fenster, globale Regeln,
Subtitle-Regeln, Feature-Flag-Bezug und verbotene Muster.

`presenter_sequence_templates.v01.json` enthaelt fuenf Kommunikationsvorlagen:

- `property_first_voiceover`
- `short_presenter_open_property_body`
- `avatar_intro_property_body_cta`
- `voiceover_feature_explainer`
- `silent_text_guided`

Diese Vorlagen sind keine Product Templates. Sie definieren keine finalen
Shot-Zahlen, Produktdauern oder Produktklassen.

`voiceover_rules.v01.json` definiert Voiceover als kurze, bildgestuetzte
Hilfsschicht mit mute-first Backup, ohne Provider-Auswahl oder TTS-Integration.

## Welche Entscheidungen wurden getroffen?

- Script-/Voice-/Timing-Regeln bleiben v0.1, `draft`, nicht mit echten Bildern
  getestet und nicht fuer Produktion freigegeben.
- Der fruehe Objektbeweis zwischen 2 und 8 Sekunden ist Pflicht fuer normale
  Property-Clips.
- Voiceover darf eine sichtbare Bildidee unterstuetzen, aber nicht das Expose
  vorlesen.
- Untertitel sind Backup fuer mute viewing, nicht zweite Expose-Ebene.
- `avatar_enabled` bleibt Voraussetzung fuer spaetere Avatar-/Voice-Aktivierung.
- Presenter-Sequenzvorlagen bleiben Kommunikationslogik und ziehen Session 11
  Product Templates nicht vor.

## Was wurde bewusst nicht gemacht?

- Keine API-Integration.
- Keine Voice-, TTS-, HeyGen-, Avatar- oder Provider-Integration gebaut.
- Keine Webseite geaendert.
- Keine Render-Integration gebaut.
- Keine Untertitel-, Layout-, Audio- oder Timing-Engine implementiert.
- Keine konkreten Sprechertexte geschrieben.
- Keine Product Templates gebaut.
- Keine spaeteren Sessions vorgezogen.

## Validierung

Durchgefuehrt am 2026-06-29:

- `python3 -m json.tool config/video-motion/script_timing_rules.v01.json`:
  ok.
- `python3 -m json.tool config/video-motion/presenter_sequence_templates.v01.json`:
  ok.
- `python3 -m json.tool config/video-motion/voiceover_rules.v01.json`: ok.
- Struktureller Script-/Voice-/Timing-Check mit Python: ok.
- Alle vier Masterplan-Timingbereiche vorhanden: ok.
- `timing_window_count` ist 4: ok.
- Fuenf Presenter-Sequenzvorlagen vorhanden: ok.
- Voiceover-Regeln enthalten Kurzheits-, Bildbeweis- und mute-first-Regeln:
  ok.
- Avatar-Dauerregel und `avatar_enabled` bleiben referenziert: ok.
- Keine Product Templates oder produktive API-, Web- oder Render-Dateien
  geaendert.

## Git-Status bei Abschluss

Session-10-eigene neue Dateien:

- `docs/video-motion/46_script_voice_timing.md`
- `config/video-motion/script_timing_rules.v01.json`
- `config/video-motion/presenter_sequence_templates.v01.json`
- `config/video-motion/voiceover_rules.v01.json`
- `docs/video-motion/_handover_session_10.md`

Optional aktualisierte Working-Memory:

- `CODEX_WORKING_MEMORY_DO_NOT_TOUCH/video-motion-current.md`

Unrelated bereits vorhandener Dirty-State, nicht von Session 10 zu bearbeiten:

- `projects/piximmo-web`

## Naechster sinnvoller Schritt

Die naechste Session darf nur die naechste im Masterplan ausdruecklich
beauftragte Session umsetzen. Nach Session 10 waere das Session 11:
Produktlogik und Videotypen.

Vor Session 11 zuerst lesen:

- `docs/video-motion/MASTERPLAN.md`
- `docs/video-motion/_handover_session_10.md`

Session 11 darf nicht automatisch gestartet werden. Sie braucht Daniels
expliziten Auftrag.
