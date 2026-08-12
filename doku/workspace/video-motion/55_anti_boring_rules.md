# Anti-Boring Rules v0.1

## Zweck

Diese Datei definiert Regeln gegen langweilige, beliebige oder chaotische
Immobilienvideos. Sie sitzt nach Matching und Scoring, aber vor einem spaeteren
Shot Plan Review.

Session 13 erstellt Planungsartefakte. Sie baut keine API-Integration, keine
Webseite, keine Render-Integration, keine Avatar-/Provider-Integration und
keine automatische Auswahl-Engine.

## Position in der Planung

```text
Inputbilder + Objektkontext
  -> Creative Direction Layer
  -> Motivklassen + Highlight Scoring
  -> Product Video Type
  -> Matching / Scoring Logic
  -> Anti-Boring Rules
  -> Quality Gates
  -> Shot Plan
  -> Render Job
```

## Grundidee

Ein gutes Social-Property-Video muss nicht jeden Raum vollstaendig zeigen. Es
muss schnell beweisen, warum die Immobilie interessant ist, und dann Rhythmus,
Abwechslung, Textklarheit und Vertrauen halten.

Langweilig wird ein Clip, wenn er nur eine sachliche Raumliste abarbeitet.
Chaotisch wird er, wenn Effekte, Text, Avatar oder QW-Bewegung staerker wirken
als die Immobilie.

## Harte Leitlinien

### Keine Serien gleicher Shots

Nie mehr als zwei aehnliche Raumshots direkt hintereinander verwenden.

Aehnlich meint in v0.1:

- gleiche Motivklasse,
- gleiche Bewegung,
- gleiche Dauer,
- gleicher Bildwinkel,
- gleiche Textrolle,
- gleiche Raumfunktion ohne neues Verkaufsargument.

Wenn drei aehnliche Shots fachlich noetig sind, muss einer davon eine andere
Rolle bekommen: Detail, Mood, Text-Hook, anderer Ausschnitt oder klar anderer
Rhythmus.

### Keine gleichfoermige Dauer

Nie fuenf gleich lange Takes nacheinander verwenden.

Ein normales Listingvideo braucht Wechsel zwischen:

- kurzer Hook-Energie,
- lesbaren Proof-Shots,
- Detail- oder Mood-Momenten,
- ruhiger CTA-Phase.

### Keine sachliche Expose-Reihenfolge als Default

Ein Clip soll nicht automatisch wie eine Besichtigungsliste laufen:

```text
Aussen -> Flur -> Wohnzimmer -> Kueche -> Schlafzimmer -> Bad -> Balkon
```

Besser ist ein spannungsbasierter Ablauf:

```text
Staerkster Wert -> frueher Objektbeweis -> Raum/Feature-Abwechslung -> CTA
```

### Rhythmuswechsel alle 4 bis 6 Sekunden

Der Clip braucht regelmaessig einen sichtbaren Wechsel. Das kann sein:

- Motivwechsel,
- Detail- oder Mood-Shot,
- Bewegungswechsel,
- Text-Hook,
- Transition-Punkt,
- ruhige Pause nach schneller Sequenz,
- CTA oder Brand-Signoff.

Der Wechsel muss nicht laut sein. Bei Premium-Clips kann er subtil sein.

### Starker Einstieg

Der Anfang braucht mindestens einen klaren Hook:

- starkes Hero-Bild,
- sichtbarer Verkaufswert,
- kurzer Text-Hook,
- Status-Hook,
- sehr kurzer Presenter-/Avatar-Hook nur wenn Produktlogik es erlaubt.

Ein Video beginnt nicht mit einem schwachen Flur, Bad oder Treppenhaus, ausser
dieser Shot ist sichtbar der beste oder architektonisch relevante Beweis.

### Detail oder Mood im Mittelteil

Der Mittelteil darf nicht nur aus Raumuebersichten bestehen. Mindestens ein
Detail-, Feature-, View-, Licht- oder Mood-Shot soll den Rhythmus brechen.

Das Detail muss etwas verkaufen oder eine Stimmung tragen. Ein zufaelliges
Objekt ohne Immobilienwert reicht nicht.

## Verbotene Muster

- endlose Ken-Burns-Zooms,
- PowerPoint-Slides,
- zufaellige Drehbewegungen,
- ueberladene Texttafeln,
- Avatar-Dominanz bei normalen Listingvideos,
- Effekt auf jedem Schnitt,
- QW-Bewegung als Ersatz fuer echte Bildauswahl,
- CTA vor sichtbarem Objektwert,
- Text, der mehr erklaeren muss als das Bild zeigt.

## Produktbezogene Nuancen

`fast_social_teaser` darf mehr Energie haben, braucht aber besonders klare
Abwechslung und darf nicht in Effektfeuerwerk kippen.

`balanced_listing_video` ist der wichtigste Basistest: property-first,
abwechslungsreich, aber nicht hektisch.

`premium_property_clip` darf ruhiger sein, braucht aber trotzdem Rhythmus durch
Bildwert, Licht, Perspektive und Detail statt durch laute Effekte.

`agent_branding_clip` darf Presenter/Avatar staerker nutzen, aber nicht so,
dass die Immobilie zur Kulisse wird.

## JSON-Quelle

Die maschinenlesbaren v0.1-Regeln liegen in:

```text
config/video-motion/anti_boring_rules.v01.json
```

## Status

Alle Anti-Boring-Regeln sind `v0.1`, `draft`,
`tested_with_real_images: false` und `approved_for_production: false`.

