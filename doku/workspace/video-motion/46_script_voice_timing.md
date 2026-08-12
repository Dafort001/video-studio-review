# Script Voice Timing v0.1

## Zweck

Diese Datei definiert die erste Script-, Voice- und Timing-Schicht fuer
moderne Social-Property-Clips. Sie verbindet Presenter-/Avatar-Segmente aus
Session 9 mit einer einfachen Dramaturgie: Hook, sichtbarer Objektbeweis,
kurze Feature-Erklaerung und CTA.

Session 10 erstellt Planungsregeln. Sie baut keine Voice-API, keine
Avatar-Provider-Integration, keine Webseite, keine Render-Integration, keine
Untertitel-Engine und keine Product Templates.

## Position in der Planung

```text
Inputbilder + Objektkontext
  -> Creative Direction Layer
  -> Motivklassen + Eigenschaften
  -> Highlight Scoring
  -> Motion / Typography / Transitions
  -> Presenter / Avatar Layer
  -> Script / Voice / Timing Rules
  -> Shot Plan
  -> Render Job
```

## Grundregel

Ein Immobilienclip muss auch ohne Ton funktionieren. Voiceover, Presenter,
Avatar und Untertitel duerfen nur helfen, nicht die sichtbare Immobilie
ersetzen.

Leitlinien:

- 0-2s: Hook moeglich.
- 2-8s: Immobilie muss sichtbar dominieren.
- 8-20s: kurze Feature-Erklaerung moeglich.
- Letzte 2-4s: CTA, Kontakt oder Branding.
- Avatar nie dauerhaft ueber die Immobilie legen.
- Voiceover muss kurz bleiben.
- Video muss ohne Ton verstaendlich bleiben.

## Timing-Fenster v0.1

### opening_hook_0_2

Das erste Fenster darf einen Hook tragen, aber der Hook muss sofort an
sichtbare Objektbilder anschliessen oder bereits mit ihnen kombiniert sein.

Geeignet fuer:

- `hook`
- `question`
- sehr kurze `greeting`
- `presenter_hook`
- `avatar_intro`, nur wenn `avatar_enabled` spaeter aktiv ist

Risiken:

- Presenter oder Avatar erscheinen vor der Immobilie und bleiben zu lang.
- Hook behauptet mehr als die folgenden Bilder zeigen.
- Text, Voice und Bild konkurrieren in den ersten Sekunden.

### property_dominance_2_8

Zwischen 2 und 8 Sekunden muss die Immobilie klar dominieren. Das ist der
wichtigste Objektbeweis.

Geeignet fuer:

- Hero-Shots
- starke Raum- oder Feature-Bilder
- kurze Orientierung
- sehr sparsames Voiceover

Risiken:

- Presenter-/Avatar-Overlay blockiert die wichtigsten Bildbereiche.
- Voiceover erklaert statt zu zeigen.
- Der Clip fuehlt sich wie Werbung an, bevor das Objekt bewiesen ist.

### feature_explanation_8_20

Zwischen 8 und 20 Sekunden kann eine kurze Feature-Erklaerung stattfinden,
wenn das Bild sie unterstuetzt.

Geeignet fuer:

- `feature_tease`
- `feature_explainer`
- `orientation`
- `transition_bridge`
- voiceover-only oder kurzer Presenter-Moment

Risiken:

- Expose-Text wird vorgelesen.
- Eine Feature-Liste ersetzt Rhythmus.
- Raumfolge wird falsch suggeriert.

### closing_cta_last_2_4

Die letzten 2-4 Sekunden duerfen CTA, Kontakt oder Branding tragen, nachdem
genug Objektwert gezeigt wurde.

Geeignet fuer:

- `cta`
- `brand_signoff`
- `presenter_cta`
- `avatar_brand_card`
- `cta_card`

Risiken:

- CTA kommt zu frueh.
- Kontakttext wird zu lang.
- Avatar oder Brand Card verdeckt den letzten Objektbeweis.

## Voiceover-Prinzipien

- Eine Voice-Zeile soll eine sichtbare Bildidee tragen, nicht ein Expose
  vorlesen.
- Ein Clip darf nicht nur durch Ton verstaendlich sein.
- Voiceover und Untertitel muessen kurz genug fuer mobile Nutzung bleiben.
- Voiceover soll Luecken zwischen Bildern nicht mit erfundenen Fakten fuellen.
- Claims brauchen spaeter Produktdaten- oder Markenfreigabe.

## Subtitle-Prinzipien

- Untertitel sind Hilfsmittel fuer mute viewing.
- Untertitel duerfen CTA, Lower Third oder Feature-Badge nicht blockieren.
- Lange Untertitel gehoeren nicht in micro_take oder schnelle Transitions.
- Normale Untertitel bleiben bei kurzen, einfachen Zeilen.
- Untertitel duerfen keine rechtlichen, Preis- oder Statusdetails einfuehren,
  die nicht aus spaeteren Produktdaten kommen.

## Presenter-Sequenztypen v0.1

### property_first_voiceover

Die Immobilie startet sofort, Voiceover fuehrt nur leicht.

Gut fuer:

- normale Listing-Clips
- ruhige Premium-Clips
- Clips, die ohne sichtbaren Avatar funktionieren sollen

### short_presenter_open_property_body

Sehr kurzer Presenter-Hook oder Intro, danach Objektbilder dominieren.

Gut fuer:

- Agent Branding
- Warmth und Vertrauen
- Social Hook mit echtem Makler

### avatar_intro_property_body_cta

Kurzer Avatar-Intro- oder Branding-Moment, danach Objektbilder, am Ende CTA.

Gut fuer:

- spaetere skalierbare Maklerclips
- klare Brand-/CTA-Formate

Risiko:

- darf nur mit `avatar_enabled` und spaeterer Provider-/Freigabelogik aktiv
  werden.

### voiceover_feature_explainer

Objektbilder dominieren, eine kurze Voice-Erklaerung begleitet ein besonderes
Feature.

Gut fuer:

- Neubaukontext
- Grundriss- oder Lageerklaerung
- ein nicht sofort selbsterklaerendes Feature

### silent_text_guided

Kein Voiceover, nur kurze Text- und CTA-Fuehrung.

Gut fuer:

- schnelle Social-Clips
- mute-first Nutzung
- einfache Objektangebote

## Verbotene Muster

- Voiceover als Expose-Vorlesung.
- Avatar oder Presenter dauerhaft ueber Objektbildern.
- Clip ist ohne Ton nicht verstaendlich.
- CTA vor ausreichendem Objektbeweis.
- Untertitel und CTA gleichzeitig im selben Lesebereich.
- Falsche Raumfolge durch gesprochene Ueberleitungen.
- Provider- oder Voice-Funktion ohne spaeteren Kill Switch.

## JSON-Quellen

Script-Timing-Regeln liegen in:

```text
config/video-motion/script_timing_rules.v01.json
```

Presenter-Sequenzvorlagen liegen in:

```text
config/video-motion/presenter_sequence_templates.v01.json
```

Voiceover-Regeln liegen in:

```text
config/video-motion/voiceover_rules.v01.json
```

## Status

Alle Regeln und Templates sind `v0.1`, `draft`,
`tested_with_real_images: false` und `approved_for_production: false`.

