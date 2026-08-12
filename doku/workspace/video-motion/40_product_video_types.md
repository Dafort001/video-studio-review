# Product Video Types v0.1

## Zweck

Diese Datei definiert die ersten Produktlogiken und Videotypen fuer moderne
Social-Property-Clips. Sie verbindet Motion, Typografie, Transitions,
Presenter/Avatar und Script-/Timing-Regeln zu planbaren Clip-Formaten.

Session 11 erstellt Planungsartefakte. Sie baut keine API-Integration, keine
Webseite, keine Render-Integration, keine Matching-/Scoring-Regeln aus Session
12 und keine Quality Gates.

## Position in der Planung

```text
Inputbilder + Objektkontext
  -> Creative Direction Layer
  -> Motivklassen + Highlight Scoring
  -> Motion / Typography / Transitions
  -> Presenter / Avatar / Script Timing
  -> Product Video Types
  -> Shot Plan
  -> Render Job
```

## Grundregel

Ein Produkt-Template beschreibt den Zweck, die grobe Laenge, die Shot-Menge,
die Textdichte, die Avatar-/Presenter-Erlaubnis, die typische Dramaturgie und
die CTA-Logik eines Clips. Es ist noch keine Render-Vorlage und kein finaler
Kundenproduktvertrag.

Jede Produktklasse definiert:

- `target_duration`
- `number_of_shots`
- `allowed_qwen_ratio`
- `text_density`
- `avatar_presenter_allowed`
- `typical_dramaturgy`
- `cta_logic`

## Produktklassen v0.1

### fast_social_teaser

Kurzer, schneller Teaser fuer Feed- und Story-Umfelder.

Gut fuer:

- starke Hero-Bilder
- neue Listings
- schnelle Social-Aufmerksamkeit
- wenige, klare Verkaufsargumente

Risiken:

- zu viele Effekte
- Immobilie wirkt wie Template-Content
- CTA kommt zu frueh

### balanced_listing_video

Ausgewogener Standardclip fuer normale Immobilienangebote.

Gut fuer:

- allgemeine Listings
- brauchbare Bildstrecken
- Mix aus Hero, Raumfolge, Feature und CTA

Risiken:

- zu katalogartig
- zu wenig Hook
- zu viele Raumlabels

### premium_property_clip

Ruhiger, hochwertiger Clip fuer starke Objekte.

Gut fuer:

- hochwertige Innenraeume
- Architektur
- View, Terrasse, Garten oder Open Plan
- ruhige Markenwirkung

Risiken:

- zu langsam fuer Social
- zu viel Text senkt Wertigkeit
- Avatar oder aggressive Transitions stoeren

### new_build_project_story

Strukturierter Clip fuer Neubau- oder Projektkontext.

Gut fuer:

- neue Projekte
- Architektur- oder Lageerklaerung
- Feature- und Kontextkommunikation

Risiken:

- wird zu erklaerend
- Zukunftsclaims brauchen spaeter Freigabe
- Produktdetails koennen Text und Voice ueberladen

### sold_showcase

Kurzer Referenz- oder Erfolgsmoment.

Gut fuer:

- verkauft / vermarktet / Referenz
- Makler-Branding
- Social Proof

Risiken:

- Statusclaim nicht freigegeben
- Clip wirkt triumphal statt professionell
- Immobilie wird zur Dekoration fuer Branding

### agent_branding_clip

Clip mit staerkerer Makler- oder Markenpraesenz.

Gut fuer:

- Maklerprofil
- Vertrauensaufbau
- Presenter oder Avatar als unterstuetzendes Element

Risiken:

- Immobilie wird zweitrangig
- Intro zu lang
- Kontakt-/Branding-Copy wird zu dicht

### property_with_voiceover

Property-first Clip mit kurzer Voice-Fuehrung.

Gut fuer:

- ruhige Erklaerung
- komplexeres Feature
- Clips, die ohne sichtbaren Avatar funktionieren sollen

Risiken:

- Voiceover ersetzt Bildbeweis
- Video funktioniert ohne Ton nicht
- Untertitel werden zu dicht

### property_with_avatar_intro

Property-Clip mit kurzem Avatar-Intro, danach objektzentrierter Body.

Gut fuer:

- spaetere skalierbare Maklerclips
- Agent Branding mit Objektfokus
- kurze Hook- oder Begruessungsformate

Risiken:

- Avatar dominiert
- Provider- oder Freigabelogik ist nicht vorhanden
- Immobilie erscheint zu spaet

### property_with_avatar_cta

Property-Clip mit Avatar- oder Brand-CTA am Ende.

Gut fuer:

- Kontaktmoment nach Objektbeweis
- Makler-Branding am Schluss
- Sold Showcase oder Agent Branding

Risiken:

- CTA zu frueh
- Avatar ersetzt letzten Objektbeweis
- Kontakttext wird zu lang

## Shot-Sequence-Prinzipien

- 0-2s darf Hook sein, muss aber schnell Objektwert zeigen.
- 2-8s ist Objektbeweis und darf nicht von Avatar/Presenter dominiert werden.
- 8-20s darf Feature-, Kontext- oder Voice-Erklaerung tragen.
- Letzte 2-4s duerfen CTA, Kontakt oder Branding tragen.
- Product Templates duerfen keine falsche Raumfolge behaupten.
- Avatar-Varianten brauchen spaeter `avatar_enabled`.
- QW-/experimental-Anteile bleiben begrenzt und reviewpflichtig.

## JSON-Quellen

Produkt-Templates liegen in:

```text
config/video-motion/product_templates.v01.json
```

Shot-Sequence-Regeln liegen in:

```text
config/video-motion/shot_sequence_rules.v01.json
```

## Status

Alle Produktklassen und Regeln sind `v0.1`, `draft`,
`tested_with_real_images: false` und `approved_for_production: false`.

