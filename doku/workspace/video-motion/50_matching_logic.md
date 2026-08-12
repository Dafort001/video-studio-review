# Matching Logic v0.1

## Zweck

Diese Datei definiert die erste Matching- und Scoring-Schicht fuer moderne
Social-Property-Clips. Sie beschreibt, welche Motion-Presets zu welchen
Motivklassen, Motiv-Eigenschaften, Dauerfenstern, Risiko-Signalen und
Produktlogiken passen koennen.

Session 12 erstellt Planungsartefakte. Sie baut keine API-Integration, keine
Webseite, keine Render-Integration, keine automatische Auswahl-Engine und keine
Quality Gates aus Session 13.

## Position in der Planung

```text
Inputbilder + Objektkontext
  -> Creative Direction Layer
  -> Motivklassen + Highlight Scoring
  -> Product Video Type
  -> Matching / Scoring Logic
  -> Shot Plan
  -> Render Job
```

## Grundregel

Matching ist eine Empfehlung, keine automatische Wahrheit. Ein Preset passt nur
dann, wenn Motiv, Bild-Eigenschaften, Dauer, Produktlogik, Risiko und
Feature-Flags zusammen plausibel sind.

Leitlinien:

- Gute Motive bekommen nicht automatisch aggressive Bewegung.
- Hohe Risiken reduzieren Dauer, QW-Anteil, Text und Avatar.
- Hero-Shots brauchen glaubwuerdige Geometrie und genug Crop-Reserve.
- QW-/MX-Bewegungen bleiben in v0.1 kurz, riskant und reviewpflichtig.
- Matching-Regeln duerfen keine Quality Gates ersetzen.

## Masterplan-Beispiele

```text
living + deep_perspective -> push_in, parallax_float, perspective_nudge
kitchen + strong_lines -> counter_glide, feature_focus
hallway + narrow_space -> doorway_reveal, forward_move, aber nur micro/short
view + window_dominant -> window_view_push, view_pull_back
exterior + corner_visible -> corner_orbit, facade_push
```

Die Motion Library v0.1 verwendet teilweise andere Preset-Namen als diese
Beispiele. Session 12 mappt deshalb auf vorhandene Motion Families und
Preset-Kandidaten, ohne neue Render-Presets zu erzeugen.

## Scoring-Signale v0.1

### motion_fit_score

Wie gut passt die Bewegung zum Motiv und zur Bildkomposition?

Positive Signale:

- Motivklasse und Motion Family passen zusammen.
- Bild hat genug Crop-Reserve.
- Linien, Fenster und Raumachsen bleiben glaubwuerdig.
- Produkt-Template erlaubt die Energie der Bewegung.

### risk_score

Wie hoch ist das Risiko, dass Bewegung, QW, Text oder Avatar die Immobilie
unglaubwuerdig oder unklar machen?

Hohe Risikosignale:

- `narrow_space`
- `window_dominant`
- Spiegel, Glas, starke Linien
- hoher `qwen_risk_score`
- wenig Crop-Reserve
- lange Dauer bei experimenteller Bewegung

### visual_interest_score

Wie stark ist das Bild als Social-Property-Moment?

Positive Signale:

- klares Hero-, Feature-, View- oder Mood-Potenzial
- gute Lichtwirkung
- starke Raumtiefe
- sichtbarer Verkaufswert

### text_overlay_score

Wie gut kann das Bild kurzen Text tragen?

Positive Signale:

- ruhige Textzone
- ausreichender Kontrast
- keine wichtigen Features in der Textzone
- passende Dauer fuer Lesbarkeit

### duration_fit_score

Wie gut passt die vorgesehene Take-Laenge zum Motiv und zur Bewegung?

Positive Signale:

- kurze Takes fuer riskante oder energetische Bewegung
- medium/hero Takes nur bei stabiler Geometrie
- Produktdauer und Shot-Menge bleiben plausibel

### avatar_fit_score

Wie gut kann das Bild Presenter, Avatar, Untertitel oder CTA unterstuetzen?

Positive Signale:

- ruhige Randzone
- keine hero-relevante Feature-Ueberdeckung
- ausreichender Text-/Subtitle-Space
- Produkt-Template erlaubt Avatar/Presenter

## Entscheidungsprinzip

Eine spaetere Auswahl sollte mehrere Scores kombinieren:

```text
matching_candidate_score =
  motion_fit_score
  + visual_interest_score
  + duration_fit_score
  + optional text_overlay_score
  + optional avatar_fit_score
  - risk_score
```

Die Formel ist absichtlich noch kein Produktalgorithmus. Sie zeigt nur, welche
Signale spaeter zusammengefuehrt werden koennen.

## Verbotene Muster

- QW einsetzen, nur weil ein Bild interessant ist.
- Avatar-fit als Ersatz fuer schlechten Objektbeweis nutzen.
- Text ueber ein starkes Feature legen, nur weil Textdichte im Produkt erlaubt
  ist.
- Hero-Takes mit experimenteller Bewegung verlaengern.
- Matching-Regeln als Quality Gates oder Render-Implementierung behandeln.

## JSON-Quellen

Motiv-zu-Motion-Regeln liegen in:

```text
config/video-motion/motif_to_motion_rules.v01.json
```

Scoring-Regeln liegen in:

```text
config/video-motion/scoring_rules.v01.json
```

## Status

Alle Matching- und Scoring-Regeln sind `v0.1`, `draft`,
`tested_with_real_images: false` und `approved_for_production: false`.

