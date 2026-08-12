# Handover Session 11

## Was wurde erstellt?

Session 11 hat die erste Produktlogik und Videotypen-Schicht fuer die
Video-Motion-Library erstellt.

Neu erstellt:

- `docs/video-motion/40_product_video_types.md`
- `config/video-motion/product_templates.v01.json`
- `config/video-motion/shot_sequence_rules.v01.json`
- `docs/video-motion/_handover_session_11.md`

## Was ist der Inhalt?

`40_product_video_types.md` beschreibt Product Video Types als Planungslogik
zwischen Creative-/Motion-Library und spaeterem Shot Plan:

- Produkt-Templates definieren Zweck, grobe Dauer, Shot-Menge, Textdichte,
  Avatar-/Presenter-Erlaubnis, Dramaturgie und CTA-Logik.
- Sie sind keine Render-Templates und keine finalen Kundenproduktvertraege.
- Produktlogik darf keine Matching-/Scoring-Regeln aus Session 12 vorziehen.

`product_templates.v01.json` enthaelt die neun im Masterplan geforderten
Produktklassen:

- `fast_social_teaser`
- `balanced_listing_video`
- `premium_property_clip`
- `new_build_project_story`
- `sold_showcase`
- `agent_branding_clip`
- `property_with_voiceover`
- `property_with_avatar_intro`
- `property_with_avatar_cta`

Jede Produktklasse definiert:

- `target_duration`
- `number_of_shots`
- `allowed_qwen_ratio`
- `text_density`
- `avatar_presenter_allowed`
- `typical_dramaturgy`
- `cta_logic`

`shot_sequence_rules.v01.json` definiert globale Sequence-Regeln, vier
Slot-Typen (`hook_slot`, `proof_slot`, `body_slot`, `cta_slot`), produktbezogene
Sequence-Guidance, Feature-Flag-Bezug und verbotene Muster.

## Welche Entscheidungen wurden getroffen?

- Product Video Types bleiben v0.1, `draft`, nicht mit echten Bildern getestet
  und nicht fuer Produktion freigegeben.
- `balanced_listing_video` ist der spaetere Basiskandidat fuer normale
  Listingclips.
- `premium_property_clip` reduziert Text, Avatar und QW stark.
- `agent_branding_clip` erlaubt mehr Presenter/Avatar, bleibt aber
  property-first.
- Avatar-Produkte verweisen auf `avatar_enabled` und duerfen Property Proof
  nicht verzoegern.
- `allowed_qwen_ratio` ist nur Planungsgrenze, keine Produktionsfreigabe.
- Matching-/Scoring-Regeln bleiben fuer Session 12 reserviert.

## Was wurde bewusst nicht gemacht?

- Keine API-Integration.
- Keine Webseite geaendert.
- Keine Render-Integration gebaut.
- Keine finalen Kundenprodukte oder Preise definiert.
- Keine Motiv-zu-Motion-Matching-Regeln gebaut.
- Keine Scoring-Regeln gebaut.
- Keine Quality Gates gebaut.
- Keine spaeteren Sessions vorgezogen.

## Validierung

Durchgefuehrt am 2026-06-29:

- `python3 -m json.tool config/video-motion/product_templates.v01.json`: ok.
- `python3 -m json.tool config/video-motion/shot_sequence_rules.v01.json`: ok.
- Struktureller Product-Template-Check mit Python: ok.
- Alle neun Masterplan-Produktklassen vorhanden: ok.
- `template_count` ist 9: ok.
- Jede Produktklasse hat die sieben geforderten Felder: ok.
- Jedes Template hat Status, Test- und Produktionsfreigabe-Felder: ok.
- Shot-Sequence-Regeln enthalten Hook, Proof, Body und CTA: ok.
- `qwen_enabled` und `avatar_enabled` bleiben Feature-Flag-gebunden: ok.
- Keine Matching-/Scoring-, API-, Web- oder Render-Datei geaendert.

## Git-Status bei Abschluss

Session-11-eigene neue Dateien:

- `docs/video-motion/40_product_video_types.md`
- `config/video-motion/product_templates.v01.json`
- `config/video-motion/shot_sequence_rules.v01.json`
- `docs/video-motion/_handover_session_11.md`

Optional aktualisierte Working-Memory:

- `CODEX_WORKING_MEMORY_DO_NOT_TOUCH/video-motion-current.md`

Unrelated bereits vorhandener Dirty-State, nicht von Session 11 zu bearbeiten:

- `projects/piximmo-web`

## Naechster sinnvoller Schritt

Die naechste Session darf nur die naechste im Masterplan ausdruecklich
beauftragte Session umsetzen. Nach Session 11 waere das Session 12:
Matching- und Scoring-Regeln.

Vor Session 12 zuerst lesen:

- `docs/video-motion/MASTERPLAN.md`
- `docs/video-motion/_handover_session_11.md`

Session 12 darf nicht automatisch gestartet werden. Sie braucht Daniels
expliziten Auftrag.
