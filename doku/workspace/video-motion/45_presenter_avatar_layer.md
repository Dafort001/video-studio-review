# Presenter Avatar Layer v0.1

## Zweck

Diese Datei definiert die erste strukturelle Presenter- und Avatar-Schicht
fuer moderne Social-Property-Clips. Sie beschreibt, wann Makler, Presenter
oder spaetere Avatare einen Clip unterstuetzen koennen, ohne die Immobilie zu
verdraengen.

Session 9 erstellt eine Planungsbibliothek. Sie baut keine Avatar-API, keine
HeyGen-Integration, keine Webseite, keine Render-Integration, keine
Product Templates und keine Script-, Voice- oder Timing-Regeln aus Session 10.

## Position in der Planung

```text
Inputbilder + Objektkontext
  -> Creative Direction Layer
  -> Motivklassen + Eigenschaften
  -> Highlight Scoring
  -> Motion Presets
  -> Typography / Transitions
  -> Presenter / Avatar Layer
  -> Shot Plan
  -> Render Job
```

## Grundregel

Die Immobilie bleibt Hauptmotiv. Presenter oder Avatar dienen nur als:

- Hook
- Orientierung
- kurze Erklaerung
- CTA
- Marken- oder Vertrauenssignal

Avatar darf normale Listingvideos nicht dominieren. Ein Social-Property-Clip
ist zuerst ein Immobilienclip, nicht ein Talking-Head-Video.

## Begriffe

### Presenter

`Presenter` meint echte Makler, Teammitglieder oder Moderatoren, die in
spaeteren Clips sichtbar, als Overlay oder als Voice-/Branding-Element
auftreten koennen.

### Avatar

`Avatar` meint eine spaetere digitale Repraesentation, zum Beispiel ein
generierter Presenter, ein digitaler Makler-Zwilling oder eine markengebundene
Figur. Session 9 definiert nur Kompatibilitaet und Shot-Typen.

### Voiceover Only

`voiceover_only` bedeutet: Eine Stimme kann spaeter erklaeren oder fuehren,
aber das Bild bleibt vollstaendig Immobilie. Die konkreten Voice- und
Timing-Regeln gehoeren erst zu Session 10.

## Presenter-/Avatar-Typen v0.1

### presenter_intro

Kurzer sichtbarer Einstieg mit echtem Presenter.

Gut fuer:

- Makler-Branding
- Vertrauen am Clip-Anfang
- sehr kurze Begruessung vor Objektbildern

Risiken:

- Intro dauert zu lange
- Immobilie erscheint zu spaet
- Clip wirkt wie Selbstdarstellung statt Objektangebot

### presenter_hook

Kurzer Presenter-Hook als aufmerksamkeitsstarker Auftakt.

Gut fuer:

- starke Social-Einstiege
- konkrete Frage oder ein kurzer Objektwert
- Agent-Branding-Clips

Risiken:

- Hook behauptet mehr als Bilder zeigen
- Presenter-Ton ersetzt Objektbeweis
- Text und Gesicht konkurrieren mit dem ersten Hero-Shot

### presenter_explainer

Kurzer erklaerender Presenter-Moment.

Gut fuer:

- besondere Grundrisslogik
- Neubau- oder Projektkontext
- eine komplexe Eigenschaft, die Bilder allein schwer erklaeren

Risiken:

- zu lang fuer Social-Property-Clips
- Expose-Text wird vorgelesen
- Immobilie verliert Rhythmus

### presenter_overlay

Presenter als kleines Overlay ueber Immobilienbildern.

Gut fuer:

- kurze Orientierung
- vertrauensbildende Hinweise
- sparsames Agent Branding

Risiken:

- verdeckt Verkaufsargumente
- kollidiert mit Untertiteln, Lower Third oder CTA
- macht ruhige Premiumbilder unruhig

### presenter_walkthrough_simulated

Strukturelle Vorbereitung fuer spaetere simulierte Fuehrung. Kein echter
Rundgang und keine Render-Integration in Session 9.

Gut fuer:

- spaetere Hybride aus echten Clips, Fotos und Presenter
- Orientierung durch grobe Objektfolge
- besondere Objekte, bei denen Fuehrung wichtiger ist als reiner Teaser

Risiken:

- suggeriert falsche Raumfolge
- klingt wie echter Walkthrough, obwohl nur Fotos vorliegen
- braucht spaeter starke Truth-Boundaries

### presenter_cta

Presenter-basierter Abschluss oder Kontaktmoment.

Gut fuer:

- Besichtigung anfragen
- Kontakt aufnehmen
- Makler-Vertrauen am Ende

Risiken:

- CTA dauert zu lange
- Kontaktinfo dominiert das Objekt
- rechtliche oder markenspezifische Angaben sind nicht freigegeben

### avatar_intro

Avatar-basierter kurzer Einstieg.

Gut fuer:

- spaetere skalierbare Maklerclips
- kurze Begruessung oder Hook
- Tests mit digitalem Presenter

Risiken:

- Avatar wirkt generisch
- Vertrauen sinkt, wenn Avatar die Immobilie verdraengt
- Provider-/Kostenabhaengigkeit gehoert spaeter hinter Kill Switches

### avatar_voiceover_only

Avatar oder synthetische Stimme ohne sichtbare Avatar-Flaeche.

Gut fuer:

- Immobilie bleibt voll sichtbar
- kurze Orientierung
- Clips, die ohne Gesicht funktionieren sollen

Risiken:

- Stimme erklaert zu viel
- Video ist ohne Ton nicht verstaendlich
- Voice-Regeln gehoeren erst zu Session 10

### avatar_picture_in_picture

Avatar als kleines Bild-im-Bild-Element.

Gut fuer:

- kurze Begruessung
- einzelne Erklaerung
- CTA oder Markenmoment

Risiken:

- verdeckt wichtige Bildbereiche
- kollidiert mit Untertiteln und Lower Thirds
- wirkt bei Premiumclips schnell zu laut

### avatar_full_frame

Avatar als eigener Vollbildmoment.

Gut fuer:

- sehr kurzer Intro- oder CTA-Moment
- Agent-Branding-Clip
- spaetere separate Presenter-Segmente

Risiken:

- Immobilie ist nicht sichtbar
- normale Listingvideos werden Talking-Head-lastig
- nur sehr sparsam und klar begruendet nutzen

### avatar_brand_card

Avatar oder Presenter als markengebundener Abschluss- oder Referenzmoment.

Gut fuer:

- CTA
- Agent Branding
- Sold Showcase
- Wiedererkennung

Risiken:

- wird zur Werbung statt zum Immobilienclip
- klares Kontakt-/Branding-Template fehlt noch
- Product Templates entstehen erst spaeter

## Kompatibilitaetsprinzipien

- Hero- und Feature-Shots duerfen nicht durch Gesichter, PiP oder Lower Thirds
  entwertet werden.
- Avatar-/Presenter-Elemente brauchen ruhige Bildzonen oder eigene kurze
  Segmente.
- Normale Listingvideos brauchen Objektbeweis frueh und wiederholt.
- Presenter/Avatar koennen Vertrauen erhoehen, duerfen aber keine fehlenden
  Bilder ersetzen.
- Avatar- und Provider-Abhaengigkeiten brauchen spaeter `avatar_enabled` und
  Kill Switches.

## Verbotene Muster

- Avatar dauerhaft ueber die Immobilie legen.
- Presenter-Intro so lang machen, dass die Immobilie zu spaet erscheint.
- Expose-Text als Presenter- oder Avatar-Monolog nutzen.
- Full-frame Avatar als Standard fuer normale Listingvideos.
- PiP ueber Fenster, Feature, Grundrissinformation, CTA oder Untertitel legen.
- Digitale Persona ohne klare Freigabe oder Kennzeichnung als Makler-/Branding-
  Element verwenden.

## JSON-Quellen

Presenter-/Avatar-Shot-Typen liegen in:

```text
config/video-motion/presenter_shot_types.v01.json
```

Avatar-Kompatibilitaetsregeln liegen in:

```text
config/video-motion/avatar_compatibility_rules.v01.json
```

Script-Segment-Typen als strukturelle Vorbereitung liegen in:

```text
config/video-motion/script_segment_types.v01.json
```

## Status

Alle Presenter-/Avatar-Typen und Regeln sind `v0.1`, `draft`,
`tested_with_real_images: false` und `approved_for_production: false`.

