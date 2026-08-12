# Motion Canon v1

Stand: 2026-07-01

## Zweck

Motion Canon v1 beschreibt die aktuelle PixCapture Video-Motion Grammatik fuer
Shotplan-Vorschlaege. Die Canon-Dateien fuehren Timing, Videoklassen,
Raumgewichtung, Motion-Klassen, Staging-Regeln, Avatar-Grenzen und
Worker-Eskalationshinweise zusammen.

Wichtige Dateien:

```text
rules/edit_canon_v1.json
rules/motion_canon_v1.json
rules/staging_canon_v1.json
rules/avatar_canon_v1.json
```

YAML-Spiegel existieren ebenfalls, aber Implementierungen sollen JSON zuerst
nutzen, um keine YAML-Abhaengigkeit zu erzwingen.

Status aller Canon-Dateien:

```text
status=draft_reference_derived
approved_for_production=false
```

Die Referenzmatrix ist Orientierung, keine absolute Wahrheit. Vor finalen
Kundenvideos ist Review erforderlich.

## Videoklassen

`10_15s_teaser`

- Ziel: Scroll Stop / Social Teaser
- Dauer: 10 bis 15 Sekunden
- Bilder: 5 bis 8
- Shotdauer: 1.2 bis 2.0 Sekunden

`20_30s_reel_short`

- Ziel: Social Reach plus erste Qualifikation
- Dauer: 20 bis 30 Sekunden
- Bilder: 8 bis 12
- Shotdauer: 1.5 bis 2.5 Sekunden

`45_60s_listing_video`

- Ziel: kurze vollstaendige Objektpraesentation
- Dauer: 45 bis 60 Sekunden
- Bilder: 15 bis 22
- Shotdauer: 2.4 bis 3.2 Sekunden

`90_120s_tour`

- Ziel: Premium Short Film mit besserer Raumorientierung
- Dauer: 90 bis 120 Sekunden
- Bilder: 25 bis 35
- Shotdauer: 3.0 bis 4.5 Sekunden

`2_3min_full_tour`

- Ziel: objektnahe Tour mit breiter Raumabdeckung
- Dauer: 120 bis 180 Sekunden
- Bilder: 35 bis 55
- Shotdauer: 3.5 bis 5.0 Sekunden

`avatar_presenter_video`

- Ziel: Vertrauen, Erklaerung, Maklerbranding oder Spezialkommentar
- Dauer: 20 bis 120 Sekunden
- Bilder: 6 bis 20
- Objekt-Shots: 2.5 bis 4.0 Sekunden
- Avatar-Segmente: 3.0 bis 7.0 Sekunden

## Timing-Regeln

Timing kommt aus `rules/edit_canon_v1.json`:

- `target_duration_seconds`
- `image_count`
- `shot_duration_seconds`
- bei Avatar-Format zusaetzlich `object_shot_duration_seconds` und
  `avatar_segment_duration_seconds`

Phase 11 klemmt `recommended_shot_duration` aus Motion Candidates in das
Zeitfenster der gewaehlten Videoklasse. Zu wenige geeignete Bilder werden
sichtbar als `below_minimum_image_count=true` gemeldet.

## Motion-Klassen

Erlaubte Motion-Klassen aus `rules/motion_canon_v1.json`:

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

MVP-Regel: eine klare Motion-Idee pro Bild. Kein gleichzeitiges Zoomen,
Pannen, kuenstliches Reveal und Parallax in einem Shot.

## Room-to-Motion Defaults

Beispiele:

- `living`: `lateral_slide`, `push_in_soft`, `parallax_push`
- `kitchen`: `push_in_soft`, `lateral_slide`
- `bedroom`: `push_in_soft`, `pull_out_soft`, `static_hold`
- `bathroom`: `static_hold`, `detail_micro_move`, `push_in_soft`
- `detail`: `detail_micro_move`, `static_hold`
- `exterior`: `push_in_soft`, `lateral_slide`, `pull_out_soft`
- `view`: `static_hold`, `push_in_soft`, `pull_out_soft`

Diese Defaults sind Vorschlaege, keine Pflicht. Risk Flags und Planning Gates
koennen sie blockieren.

## Vermeidungsregeln

Wichtige Forbidden-Motion-Regeln:

- `mirror_dominant`: keine `parallax_push`, `diagonal_drift`,
  `tilt_emulation`
- `window_dominant`: keine `parallax_push`, `diagonal_drift`,
  `tilt_emulation`
- `strong_verticals`: keine `parallax_push`, `tilt_emulation`
- `low_depth_confidence`: keine `parallax_push`, `diagonal_drift`,
  `tilt_emulation`

Weitere harte Gates:

- `mock` nie automatisch verwenden
- `filename_heuristic` nicht ohne manuelle Bestaetigung verwenden
- `confirmed_room_type=unknown` blockieren
- `needs_manual_review=true` blockieren
- `reliability_level=none` blockieren
- `reliability_level=low` nur mit expliziter Review-Freigabe

## Rolle von DA3/SAM3

DA3/SAM3 sind im Canon nur als moegliche Worker-Eskalation beschrieben:

- DA3-Kandidat bei breiter/deep Composition, wichtigem Raumtyp,
  `hero_score >= 0.62`, `motion_safety_score >= 0.58` und potentieller
  Depth-/Parallax-Relevanz
- SAM3-Kandidat bei dominanten Fenstern, Spiegeln, Durchgaengen,
  Kuecheninseln, relevanten Vordergrundobjekten oder unsicherer Text-Safe-Area

Worker-Policy:

- Modal ist nur Worker-Layer
- kein Auto-Submit
- keine bezahlten APIs ohne expliziten Auftrag

## Grenzen von MVP 1

MVP 1 erzeugt auditierbare Vorschlaege, keine finalen Kundenvideos.

Nicht enthalten:

- finale Videoerzeugung
- Avatar-Compositing
- generative Video-API
- automatische Modal-Jobs
- automatische DA3/SAM3-Ausfuehrung
- Produktion ohne Review

Der aktuelle Zielpfad endet bei dokumentierten, pruefbaren Artefakten:

1. Image Catalog
2. Real Room Recognition oder manuelle Bestaetigung
3. ImageSemanticProfile
4. Planning Gate
5. Motion Candidate
6. Review Reports
7. Canon v1
8. Shotplan-Vorschlag
