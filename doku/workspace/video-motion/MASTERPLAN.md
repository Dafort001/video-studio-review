# Video Motion Library – Codex Masterplan

## Zweck dieses Dokuments

Dieses Dokument ist der zentrale Masterplan für den Aufbau einer systematischen Video-Creative- und Motion-Library für moderne Immobilienvideos.

Ziel ist **nicht** ein klassischer, langweiliger Objekt-Rundgang. Ziel ist moderner **Social-Property-Content**: kurze, rhythmische, typografisch klare Immobilienclips mit Bewegung, Stimmung, Hook, Highlights, optionalem Avatar/Presenter und sauberem CTA.

Dieses Dokument darf Codex vollständig als Referenz bekommen. Die eigentliche Umsetzung darf aber **niemals komplett in einem Durchlauf** erfolgen. Codex soll immer nur **eine einzelne Session** umsetzen.

---

# 0. Strikte Arbeitsregel für Codex

Diese Aufgabe darf **nicht** als ein großer Auftrag umgesetzt werden.

Arbeite strikt in kleinen, abgeschlossenen Sessions.

Jede Session muss:

1. nur ihr eigenes Ziel umsetzen,
2. sichtbare Dateien erzeugen,
3. keine späteren Sessions vorziehen,
4. keine produktive API-Integration ohne expliziten Auftrag machen,
5. keine großen Refactorings außerhalb des Session-Ziels durchführen,
6. am Ende eine vollständige Handover-Datei schreiben.

Wenn der Kontext zu groß wird, darf Codex nicht still abbrechen. In diesem Fall zuerst eine vollständige Handover-Datei schreiben und dann stoppen.

---

# 1. Globale Grundannahmen

- Ausgangspunkt sind einzelne Immobilienbilder.
- Daraus sollen kurze moderne Video-Shots entstehen.
- Ziel ist Wirkung, Rhythmus, Stimmung und Interesse.
- Vollständigkeit der Immobilie ist zweitrangig.
- Die Immobilie bleibt Hauptmotiv.
- Avatar/Presenter dürfen unterstützen, aber normale Listingvideos nicht in reine Talking-Head-Videos verwandeln.
- Sehr kurze Takes dürfen dynamischer und geometrisch freier sein.
- Lange Takes müssen architektonisch glaubwürdig bleiben.
- Alle Regeln, Presets und Scoring-Modelle sind als versionierbares Experimentiersystem zu behandeln.

---

# 2. Technische Bewegungsarten

## KB – Ken Burns / 2D Motion

Klassische Bewegung über Crop, Zoom, Pan, Tilt oder leichte Bildausschnittsbewegung.

Typische Anwendungen:

- Push-in
- Pull-out
- Pan left/right
- Tilt up/down
- leichte diagonale Bewegung

## PX – Parallax / Depth / 2.5D

Bewegung mit Tiefenkarte, Segmentierung oder Layer-Parallaxe.

Typische Anwendungen:

- subtiler räumlicher Drift
- leichter Tiefeneindruck
- kontrollierte Premium-Bewegung

## QW – Qwen-Image-Edit / Multi-Angle

Perspektivische Varianten oder kleine Blickwinkeländerungen aus einem Einzelbild.

Typische Anwendungen:

- kurze Energy-Cuts
- leichte Perspektivverschiebung
- Doorway-Reveal
- Orbit-Hint
- kurze Fake-Kamerafahrt

Wichtig: QW ist nicht als echte 3D-Rekonstruktion zu behandeln. Bei sehr kurzen Takes kann es trotzdem visuell sehr wertvoll sein.

## MX – Mischform

Kombination mehrerer Verfahren, zum Beispiel:

- Qwen-Variante + 2D Push
- Parallax + Textoverlay
- Depth Move + Transition

---

# 3. Dauerlogik

```text
micro_take  = 0.3–0.8s
short_take  = 0.8–1.5s
medium_take = 1.5–3.0s
hero_take   = 3.0–5.0s
```

## Leitlinie

Je kürzer der Take, desto mehr Bewegungsenergie und Qwen-Freiheit ist erlaubt.

Je länger der Take, desto wichtiger sind:

- stabile Raumgeometrie,
- stabile Fenster und Türen,
- glaubwürdige Möbel,
- glaubwürdige Linienführung,
- natürliche Lichtlogik.

Ein 0.5-Sekunden-Take muss nicht absolut korrekt sein. Er muss plausibel, dynamisch und stimmungsvoll wirken.

Ein 5-Sekunden-Take muss räumlich und architektonisch glaubwürdig bleiben.

---

# 4. Versionierung und Experimentierlogik

Alle Libraries, Presets, Regeln und Scoring-Modelle sind als Version **v0.1** zu behandeln.

Sie sind keine endgültige Produktlogik, sondern ein testbares Experimentiersystem.

Jede Regel muss später bewertbar, austauschbar oder deaktivierbar sein.

Keine wichtigen Werte hart im Code verstecken.

Alle relevanten Entscheidungen gehören in JSON-/Markdown-Konfigurationen.

## Statusfelder für Presets und Regeln

Für Presets und Regeln sollen grundsätzlich Statusfelder vorgesehen werden:

```text
draft
test
approved
deprecated
```

## Bewertungsfelder für Presets

Presets sollen mindestens diese Felder bekommen:

```text
tested_with_real_images: true/false
approved_for_production: true/false
notes
known_failure_cases
```

## Feature Flags / Kill Switches

Jede dynamische oder riskante Funktion muss deaktivierbar sein:

```text
qwen_enabled
avatar_enabled
aggressive_motion_enabled
experimental_transitions_enabled
typography_heavy_mode_enabled
```

Diese Flags müssen dokumentiert und später technisch nutzbar sein.

---

# 5. Geplante Sessions

## Session 1 – Projektstruktur und Grundbegriffe

### Ziel

Basisdokumentation und Projektstruktur für die Video-Motion-Library erstellen.

### Erstelle

```text
/docs/video-motion/README.md
/docs/video-motion/00_overview.md
/docs/video-motion/01_glossary.md
/docs/video-motion/02_architecture.md
/docs/video-motion/03_versioning_and_feature_flags.md
/docs/video-motion/_handover_session_1.md
```

### Inhalt

- Ziel erklären: moderner Social-Property-Content, kein langweiliger Immobilienrundgang.
- Begriffe definieren:
  - Shot
  - Take
  - Preset
  - Motivklasse
  - Motion Family
  - Product Template
  - Shot Plan
  - Creative Direction Layer
  - Qwen-Multi-Angle
  - KB
  - PX
  - QW
  - MX
- Dauerlogik definieren:
  - micro_take = 0.3–0.8s
  - short_take = 0.8–1.5s
  - medium_take = 1.5–3.0s
  - hero_take = 3.0–5.0s
- Versionierung und Feature Flags dokumentieren.
- Noch keine Preset-Liste bauen.
- Noch keine Qwen-API integrieren.
- Noch keinen Produktkatalog bauen.
- Noch keinen produktiven Code schreiben.

---

## Session 2 – Creative Direction Layer

### Ziel

Vor jeder Videoerstellung soll entschieden werden können, welche kreative Richtung das Objekt braucht.

### Erstelle

```text
/docs/video-motion/05_creative_direction_layer.md
/config/video-motion/creative_direction_profiles.v01.json
/config/video-motion/creative_direction_schema.v01.json
/docs/video-motion/_handover_session_2.md
```

### Inhalt

Definiere, wie vor jeder Videoerstellung entschieden wird:

- Was ist dieses Objekt?
- Was ist das stärkste Verkaufsargument?
- Welche Stimmung soll entstehen?
- Welche Videoform passt?
- Wie viel Dynamik verträgt das Material?
- Braucht es Avatar, Voiceover oder nur Text?
- Welche Bilder sind Hero-Shots?
- Welche Bilder sind nur kurze Rhythmus-Shots?
- Welche Bilder dürfen ignoriert werden?

### Creative Profiles

```text
fast_social
calm_premium
editorial_architecture
luxury_dynamic
family_home_warm
new_build_clean
sold_showcase
agent_branding
```

---

## Session 3 – Motivklassen und Tagging-Schema

### Ziel

Alle Bildtypen und ihre Eigenschaften systematisch definieren.

### Erstelle

```text
/docs/video-motion/10_motif_classes.md
/docs/video-motion/11_motif_tagging_schema.md
/docs/video-motion/12_motif_detection_rules.md
/config/video-motion/motif_classes.v01.json
/docs/video-motion/_handover_session_3.md
```

### Motivklassen

```text
exterior
entrance
living
open_plan
kitchen
dining
bedroom
bathroom
office
hallway
staircase
balcony
terrace
garden
view
detail
branding
```

### Zusätzliche Eigenschaften

```text
symmetric
strong_lines
deep_perspective
window_dominant
feature_object
high_ceiling
narrow_space
outdoor
luxury
cozy
bright
sunset
```

---

## Session 4 – Highlight-Scoring pro Bild

### Ziel

Jedes Bild soll nicht nur klassifiziert, sondern bewertet werden.

### Erstelle

```text
/docs/video-motion/15_highlight_scoring.md
/config/video-motion/highlight_scoring_rules.v01.json
/config/video-motion/highlight_scoring_schema.v01.json
/docs/video-motion/_handover_session_4.md
```

### Scoring-Felder

```text
hero_score
luxury_score
spatial_depth_score
light_quality_score
feature_score
social_hook_score
text_overlay_score
motion_potential_score
avatar_background_score
qwen_risk_score
```

### Zielentscheidungen

Das System soll entscheiden können:

- Dieses Bild ist ein Hero-Shot.
- Dieses Bild ist ein kurzer Energy-Cut.
- Dieses Bild eignet sich für Text.
- Dieses Bild eignet sich für Avatar/Presenter-Overlay.
- Dieses Bild sollte nicht oder nur sehr vorsichtig bewegt werden.

---

## Session 5 – Bewegungsfamilien, Dauerlogik und Sicherheitsstufen

### Ziel

Bewegungsarten sauber beschreiben, bevor konkrete Presets gebaut werden.

### Erstelle

```text
/docs/video-motion/20_motion_families.md
/docs/video-motion/21_motion_safety_levels.md
/docs/video-motion/22_duration_rules.md
/config/video-motion/motion_families.v01.json
/docs/video-motion/_handover_session_5.md
```

### Motion Families

```text
push_in
pull_out
pan_left
pan_right
tilt_up
tilt_down
diagonal_move
parallax_float
feature_focus
perspective_nudge
orbit_hint
doorway_reveal
staircase_rise
drone_like_lift
text_card
```

### Sicherheitsstufen

```text
safe
medium
experimental
micro_only
```

---

## Session 6 – Motion Library v0.1 mit 50–70 Presets

### Ziel

Die eigentliche Motion Library als Markdown und JSON erstellen.

### Erstelle

```text
/docs/video-motion/30_motion_library_v01.md
/config/video-motion/motion_presets.v01.json
/config/video-motion/motion_presets.v01.schema.json
/docs/video-motion/_handover_session_6.md
```

### Jedes Preset muss enthalten

```text
id
name
motif_classes
motif_properties
motion_family
technical_method
duration_range
risk_level
recommended_use
text_overlay_allowed
avatar_overlay_allowed
qwen_required
prompt_hint
negative_prompt_hint
failure_risks
status
tested_with_real_images
approved_for_production
notes
known_failure_cases
```

### Gruppen

Baue ca. 50–70 Presets, gruppiert nach:

```text
Universal Hook / Hero
Exterior / Entrance
Living / Open Plan
Kitchen / Dining
Bedroom / Bathroom / Office
Hallway / Staircase
Balcony / Terrace / Garden / View
Detail / Mood
Branding / CTA
```

---

## Session 7 – Typografie-System

### Ziel

Typografie als eigene Library definieren.

### Erstelle

```text
/docs/video-motion/35_typography_system.md
/config/video-motion/typography_presets.v01.json
/config/video-motion/typography_rules.v01.json
/docs/video-motion/_handover_session_7.md
```

### Typografie-Presets

```text
hook_big_keyword
location_label
room_label
feature_badge
price_or_status_tag
sold_stamp
new_listing_tag
cta_card
agent_lower_third
avatar_subtitle
```

### Regeln

- Maximal 3–5 Wörter pro Overlay.
- Keine langen Exposé-Sätze.
- Text nie auf visuell unruhige Bildbereiche.
- Textposition abhängig vom Bildinhalt.
- Klare Akzentlogik für Weiß/Gelb/Schwarz.
- Typografie ist Gestaltungsmittel, nicht nur Information.

---

## Session 8 – Transition Library

### Ziel

Übergänge zwischen Shots definieren.

### Erstelle

```text
/docs/video-motion/36_transition_library.md
/config/video-motion/transition_presets.v01.json
/config/video-motion/transition_rules.v01.json
/docs/video-motion/_handover_session_8.md
```

### Transitions

```text
hard_cut
match_cut
push_transition
whip_blur
zoom_through
doorway_cut
window_cut
text_wipe
light_flash
speed_ramp_fake
```

### Regeln

- Übergänge nicht zufällig einsetzen.
- Flur/Tür zu Raum: doorway_cut.
- Fenster/Aussicht: window_cut.
- Außen zu Innen: push_transition.
- Schnelle Social-Impulse: whip_blur oder zoom_through, aber sparsam.

---

## Session 9 – Presenter- und Avatar-Layer

### Ziel

Makler, Presenter und zukünftige Avatare strukturell vorbereiten.

### Erstelle

```text
/docs/video-motion/45_presenter_avatar_layer.md
/config/video-motion/presenter_shot_types.v01.json
/config/video-motion/avatar_compatibility_rules.v01.json
/config/video-motion/script_segment_types.v01.json
/docs/video-motion/_handover_session_9.md
```

### Presenter-/Avatar-Typen

```text
presenter_intro
presenter_hook
presenter_explainer
presenter_overlay
presenter_walkthrough_simulated
presenter_cta
avatar_intro
avatar_voiceover_only
avatar_picture_in_picture
avatar_full_frame
avatar_brand_card
```

### Leitlinie

Die Immobilie bleibt Hauptmotiv.

Presenter oder Avatar dienen als:

- Hook,
- Orientierung,
- Erklärung,
- CTA.

Avatar darf normale Listingvideos nicht dominieren.

---

## Session 10 – Script-, Voice- und Timing-Regeln

### Ziel

Sprecher, Avatar, Untertitel und Timing vorbereiten.

### Erstelle

```text
/docs/video-motion/46_script_voice_timing.md
/config/video-motion/script_timing_rules.v01.json
/config/video-motion/presenter_sequence_templates.v01.json
/config/video-motion/voiceover_rules.v01.json
/docs/video-motion/_handover_session_10.md
```

### Regeln

- 0–2s: Hook möglich.
- 2–8s: Immobilie muss sichtbar dominieren.
- 8–20s: kurze Feature-Erklärung möglich.
- Letzte 2–4s: CTA / Kontakt / Branding.
- Avatar nie dauerhaft über die Immobilie legen.
- Voiceover muss kurz bleiben.
- Video muss ohne Ton verständlich bleiben.

---

## Session 11 – Produktlogik und Videotypen

### Ziel

Aus Motion, Typografie und Avatar-Layer konkrete Video-Produkte definieren.

### Erstelle

```text
/docs/video-motion/40_product_video_types.md
/config/video-motion/product_templates.v01.json
/config/video-motion/shot_sequence_rules.v01.json
/docs/video-motion/_handover_session_11.md
```

### Produktklassen

```text
fast_social_teaser
balanced_listing_video
premium_property_clip
new_build_project_story
sold_showcase
agent_branding_clip
property_with_voiceover
property_with_avatar_intro
property_with_avatar_cta
```

### Jede Produktklasse muss definieren

```text
target_duration
number_of_shots
allowed_qwen_ratio
text_density
avatar_presenter_allowed
typical_dramaturgy
cta_logic
```

---

## Session 12 – Matching- und Scoring-Regeln

### Ziel

Definieren, welche Presets zu welchen Motiven passen.

### Erstelle

```text
/docs/video-motion/50_matching_logic.md
/config/video-motion/motif_to_motion_rules.v01.json
/config/video-motion/scoring_rules.v01.json
/docs/video-motion/_handover_session_12.md
```

### Beispiele

```text
living + deep_perspective → push_in, parallax_float, perspective_nudge
kitchen + strong_lines → counter_glide, feature_focus
hallway + narrow_space → doorway_reveal, forward_move, aber nur micro/short
view + window_dominant → window_view_push, view_pull_back
exterior + corner_visible → corner_orbit, facade_push
```

### Scoring

```text
motion_fit_score
risk_score
visual_interest_score
text_overlay_score
duration_fit_score
avatar_fit_score
```

---

## Session 13 – Anti-Boring Rules und Quality Gates

### Ziel

Regeln definieren, die langweilige oder chaotische Immobilienvideos verhindern.

### Erstelle

```text
/docs/video-motion/55_anti_boring_rules.md
/docs/video-motion/56_quality_gates.md
/config/video-motion/anti_boring_rules.v01.json
/config/video-motion/quality_gates.v01.json
/docs/video-motion/_handover_session_13.md
```

### Anti-Boring Rules

- Nie mehr als 2 ähnliche Raumshots direkt hintereinander.
- Nie 5 gleich lange Takes nacheinander.
- Nie alle Räume in sachlicher Reihenfolge ablaufen.
- Mindestens ein Rhythmuswechsel alle 4–6 Sekunden.
- Mindestens ein starker Text-Hook am Anfang.
- Mindestens ein Detail- oder Mood-Shot im Mittelteil.
- Kein Video beginnt mit einem schwachen Flur, Bad oder Treppenhaus.
- Keine endlosen Ken-Burns-Zooms.
- Keine PowerPoint-Slides.
- Keine zufälligen Drehbewegungen.
- Keine überladenen Texttafeln.
- Keine Avatar-Dominanz bei normalen Listingvideos.

### Quality Gates

- Ist der Einstieg stark genug?
- Sind zu viele ähnliche Shots enthalten?
- Gibt es sichtbare Qwen-Artefakte?
- Sind Texte lesbar?
- Ist die Immobilie Hauptmotiv geblieben?
- Ist der CTA vorhanden?
- Ist das Video zu langsam?
- Ist das Video zu hektisch?
- Gibt es genügend Abwechslung zwischen Raum, Detail, Außen, Text?

---

## Session 14 – Qwen-Testmatrix

### Ziel

Qwen-Perspektiv- und Multi-Angle-Bewegungen nicht theoretisch freigeben, sondern testbar machen.

### Erstelle

```text
/docs/video-motion/60_qwen_test_matrix.md
/docs/video-motion/61_qwen_prompt_patterns.md
/docs/video-motion/62_qwen_evaluation_criteria.md
/config/video-motion/qwen_test_cases.v01.json
/docs/video-motion/_handover_session_14.md
```

### Testlogik

- 20–30 echte Beispielbilder.
- Mehrere Motivklassen.
- Pro Motivklasse mehrere Qwen-relevante Presets.
- Bewertung nach Artefakten, Dynamik und Nutzbarkeit.

### Bewertungskriterien

```text
geometry_plausibility
motion_energy
modern_property_feel
artifact_visibility
usable_at_0_5s
usable_at_1_5s
usable_at_3s
```

---

## Session 15 – Implementierung als kleines Modul

### Ziel

Erst jetzt Code. Nur Auswahl-, Matching- und Validierungslogik.

### Erstelle

```text
/src/videoMotion/index.ts
/src/videoMotion/types.ts
/src/videoMotion/loadPresets.ts
/src/videoMotion/matchMotifsToMotions.ts
/src/videoMotion/buildShotPlan.ts
/src/videoMotion/validateShotPlan.ts
/tests/videoMotion/motionPresetSchema.test.ts
/tests/videoMotion/motifMatching.test.ts
/tests/videoMotion/shotPlan.test.ts
/docs/video-motion/_handover_session_15.md
```

### Funktionen

```text
loadMotionPresets()
validateMotionPreset()
matchMotifToAllowedMotions()
rankMotionPresets()
buildShotPlan()
validateShotSequence()
```

Noch keine produktive Videoerzeugung.

Noch keine produktive Qwen-API.

---

## Session 16 – Varianten-Generator

### Ziel

Aus demselben Objekt mehrere Video-Varianten erzeugen.

### Erstelle

```text
/docs/video-motion/75_variant_generator.md
/config/video-motion/variant_generation_rules.v01.json
/src/videoMotion/buildVideoVariants.ts
/tests/videoMotion/videoVariants.test.ts
/docs/video-motion/_handover_session_16.md
```

### Varianten

```text
serious_broker_website
fast_social_teaser
premium_calm
avatar_hook
sold_success_clip
```

---

## Session 17 – Finaler Audit und Konsistenzprüfung

### Ziel

Prüfen, ob alles vollständig, konsistent und weiterführbar ist.

### Erstelle

```text
/docs/video-motion/90_handover.md
/docs/video-motion/91_open_questions.md
/docs/video-motion/92_audit_checklist.md
/docs/video-motion/93_next_steps.md
/docs/video-motion/_handover_session_17.md
```

### Audit-Fragen

- Sind alle Motivklassen dokumentiert?
- Gibt es zu jeder Motivklasse passende Presets?
- Sind Qwen-riskante Presets klar markiert?
- Sind Micro-Takes getrennt von Hero-Takes?
- Gibt es JSON-Schemas?
- Gibt es Tests?
- Gibt es Produktlogik?
- Gibt es Presenter-/Avatar-Logik?
- Gibt es Typografie- und Transition-Regeln?
- Gibt es Anti-Boring-Regeln?
- Gibt es Quality Gates?
- Gibt es ein Handover für den nächsten Codex-Chat?

---

# 6. Zwingende Handover-Regel

Am Ende jeder Session muss eine Datei entstehen:

```text
/docs/video-motion/_handover_session_X.md
```

Diese Datei muss enthalten:

```text
# Handover Session X

## Was wurde erstellt?

## Welche Dateien wurden geändert?

## Welche Entscheidungen wurden getroffen?

## Was ist bewusst noch offen?

## Was soll die nächste Session tun?

## Welche Dateien muss die nächste Session zuerst lesen?

## Risiken / Hinweise
```

---

# 7. Einmaliger Startauftrag für Codex

Diesen Auftrag einmal an Codex geben, um den Masterplan im Projekt abzulegen:

```text
Lege den folgenden Masterplan unverändert als /docs/video-motion/MASTERPLAN.md ab. Setze noch keine Session um. Schreibe keine zusätzliche Logik. Erstelle nur diese Datei und bestätige danach, dass der Masterplan abgelegt wurde.
```

Danach den Inhalt dieses Dokuments einfügen.

---

# 8. Auftrag für Session 1

Nach dem Ablegen des Masterplans diesen Auftrag an Codex geben:

```text
Lies /docs/video-motion/MASTERPLAN.md und starte ausschließlich mit Session 1.

Erstelle nur die in Session 1 genannten Dateien:
- /docs/video-motion/README.md
- /docs/video-motion/00_overview.md
- /docs/video-motion/01_glossary.md
- /docs/video-motion/02_architecture.md
- /docs/video-motion/03_versioning_and_feature_flags.md
- /docs/video-motion/_handover_session_1.md

Setze keine späteren Sessions um.
Erstelle keine Motion Library.
Erstelle keinen Produktkatalog.
Integriere keine Qwen-API.
Schreibe keinen produktiven Code.

Beende die Arbeit mit einer vollständigen Handover-Datei.
```

---

# 9. Auftrag für jede Folgesession

Für jede weitere Session diesen Auftrag verwenden und nur die Nummer anpassen:

```text
Lies zuerst /docs/video-motion/MASTERPLAN.md und /docs/video-motion/_handover_session_X.md.

Setze danach ausschließlich Session X+1 aus dem Masterplan um.

Erstelle nur die dort genannten Dateien.
Setze keine späteren Sessions um.
Mache keine Refactorings außerhalb des Session-Ziels.
Integriere keine API, sofern diese Session das nicht ausdrücklich verlangt.

Beende die Arbeit mit /docs/video-motion/_handover_session_X+1.md.

Wenn der Kontext zu groß wird, schreibe zuerst die vollständige Handover-Datei und stoppe danach.
```

Beispiele:

Nach Session 1:

```text
Lies zuerst /docs/video-motion/MASTERPLAN.md und /docs/video-motion/_handover_session_1.md.

Setze danach ausschließlich Session 2 aus dem Masterplan um.

Erstelle nur die dort genannten Dateien.
Setze keine späteren Sessions um.
Beende die Arbeit mit /docs/video-motion/_handover_session_2.md.
```

Nach Session 2:

```text
Lies zuerst /docs/video-motion/MASTERPLAN.md und /docs/video-motion/_handover_session_2.md.

Setze danach ausschließlich Session 3 aus dem Masterplan um.

Erstelle nur die dort genannten Dateien.
Setze keine späteren Sessions um.
Beende die Arbeit mit /docs/video-motion/_handover_session_3.md.
```

---

# 10. Wichtigste Kontrollregel für den Nutzer

Nach jeder Session prüfen:

```text
Wurde die Handover-Datei erstellt?
Sind nur die Dateien dieser Session geändert worden?
Hat Codex spätere Sessions vorgezogen?
Sind offene Punkte sauber dokumentiert?
Kann die nächste Session allein mit MASTERPLAN.md + Handover starten?
```

Wenn eine dieser Fragen mit Nein beantwortet wird, Session nicht fortsetzen, sondern Codex zuerst korrigieren lassen.
