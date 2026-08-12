# Handover Session 9

## Was wurde erstellt?

Session 9 hat den ersten Presenter- und Avatar-Layer fuer die
Video-Motion-Library erstellt.

Neu erstellt:

- `docs/video-motion/45_presenter_avatar_layer.md`
- `config/video-motion/presenter_shot_types.v01.json`
- `config/video-motion/avatar_compatibility_rules.v01.json`
- `config/video-motion/script_segment_types.v01.json`
- `docs/video-motion/_handover_session_9.md`

## Was ist der Inhalt?

`45_presenter_avatar_layer.md` beschreibt Presenter und Avatar als
unterstuetzende Schicht:

- Die Immobilie bleibt Hauptmotiv.
- Presenter oder Avatar dienen nur als Hook, Orientierung, kurze Erklaerung,
  CTA oder Vertrauens-/Branding-Signal.
- Avatar darf normale Listingvideos nicht dominieren.
- Full-frame Avatar ist selten und nur fuer kurze Intro-, CTA- oder
  Branding-Momente gedacht.
- Simulierte Walkthrough-Logik darf keine falsche Raumfolge behaupten.

`presenter_shot_types.v01.json` enthaelt die elf im Masterplan geforderten
Presenter-/Avatar-Typen:

- `presenter_intro`
- `presenter_hook`
- `presenter_explainer`
- `presenter_overlay`
- `presenter_walkthrough_simulated`
- `presenter_cta`
- `avatar_intro`
- `avatar_voiceover_only`
- `avatar_picture_in_picture`
- `avatar_full_frame`
- `avatar_brand_card`

`avatar_compatibility_rules.v01.json` definiert globale Regeln fuer
Property-First-Verhalten, Feature-Flag-Pflicht, Freigabe von Identitaet und
Likeness, Overlay-/PiP-Platzierung, Dauerleitplanken, Creative-Profile,
Score-Links und verbotene Muster.

`script_segment_types.v01.json` definiert nur strukturelle Segmenttypen fuer
spaetere Presenter-/Avatar-Planung. Es ist noch keine Script-, Voice- oder
Timing-Session.

## Welche Entscheidungen wurden getroffen?

- Presenter-/Avatar-Layer bleibt v0.1, `draft`, nicht mit echten Bildern
  getestet und nicht fuer Produktion freigegeben.
- `avatar_enabled` ist spaeter Pflicht fuer alle Avatar-Shot-Typen.
- Sichtbare Presenter oder Broker-Avatare brauchen spaeter explizite Asset-,
  Likeness- und Nutzungsfreigabe.
- Voiceover-only ist die property-schonendste Avatar-Variante, aber konkrete
  Voice-/Subtitle-Regeln kommen erst in Session 10.
- `presenter_walkthrough_simulated` ist nur ein Strukturplatzhalter und darf
  keinen echten Rundgang oder falsche Raumfolge behaupten.
- Script-Segment-Typen sind Vokabular, keine Timing-Regeln.

## Was wurde bewusst nicht gemacht?

- Keine API-Integration.
- Keine HeyGen-, Avatar- oder Provider-Integration gebaut.
- Keine Webseite geaendert.
- Keine Render-Integration gebaut.
- Keine CSS-, Layout-, Masking- oder PiP-Implementierung gebaut.
- Keine konkreten Sprechertexte geschrieben.
- Keine Voiceover- oder Subtitle-Timing-Regeln gebaut.
- Keine Product Templates gebaut.
- Keine spaeteren Sessions vorgezogen.

## Validierung

Durchgefuehrt am 2026-06-29:

- `python3 -m json.tool config/video-motion/presenter_shot_types.v01.json`:
  ok.
- `python3 -m json.tool config/video-motion/avatar_compatibility_rules.v01.json`:
  ok.
- `python3 -m json.tool config/video-motion/script_segment_types.v01.json`:
  ok.
- Struktureller Presenter-/Avatar-Check mit Python: ok.
- Alle elf Masterplan-Shot-Typen vorhanden: ok.
- `shot_type_count` ist 11: ok.
- Alle Shot-Typen haben Status, Test- und Produktionsfreigabe-Felder: ok.
- Avatar-Shot-Typen referenzieren `avatar_enabled`: ok.
- Property-First-Regeln vorhanden: ok.
- Script-Segment-Typen sind vorhanden, aber ohne Timing-Implementierung: ok.
- Keine produktive API-, Web- oder Render-Datei geaendert.

## Git-Status bei Abschluss

Session-9-eigene neue Dateien:

- `docs/video-motion/45_presenter_avatar_layer.md`
- `config/video-motion/presenter_shot_types.v01.json`
- `config/video-motion/avatar_compatibility_rules.v01.json`
- `config/video-motion/script_segment_types.v01.json`
- `docs/video-motion/_handover_session_9.md`

Optional aktualisierte Working-Memory:

- `CODEX_WORKING_MEMORY_DO_NOT_TOUCH/video-motion-current.md`

Unrelated bereits vorhandener Dirty-State, nicht von Session 9 zu bearbeiten:

- `projects/piximmo-web`

## Naechster sinnvoller Schritt

Die naechste Session darf nur die naechste im Masterplan ausdruecklich
beauftragte Session umsetzen. Nach Session 9 waere das Session 10:
Script-, Voice- und Timing-Regeln.

Vor Session 10 zuerst lesen:

- `docs/video-motion/MASTERPLAN.md`
- `docs/video-motion/_handover_session_9.md`

Session 10 darf nicht automatisch gestartet werden. Sie braucht Daniels
expliziten Auftrag.
