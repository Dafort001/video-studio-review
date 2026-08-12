# Quality Gates v0.1

## Zweck

Diese Datei definiert die erste Review-Schicht fuer geplante
Social-Property-Videos. Quality Gates pruefen, ob ein geplanter Clip stark,
lesbar, glaubwuerdig und property-first bleibt.

Session 13 erstellt nur Planungsartefakte. Sie baut keine API-Integration,
keine Webseite, keine Render-Integration, keine Avatar-/Provider-Integration
und keine automatische Gate-Engine.

## Gate-Prinzip

Quality Gates sind keine Creative-Profile und keine Scoring-Regeln. Sie sind
eine spaetere Stop-/Review-/Warn-Schicht fuer einen fertigen Shot Plan.

Gate-Ergebnisse in v0.1:

```text
pass   = Plan kann weiter.
warn   = Plan ist moeglich, aber Review-Hinweis noetig.
review = Menschliche oder separate technische Pruefung noetig.
block  = Plan sollte nicht gerendert werden.
```

## Gate-Reihenfolge

### 1. Opening Strength

Frage: Ist der Einstieg stark genug?

Der Einstieg muss in den ersten 0 bis 2 Sekunden mindestens einen klaren Wert
zeigen oder benennen. Ein schwacher Flur, ein beliebiges Bad, eine dunkle
Treppe oder eine reine Brandkarte blockiert normale Listingvideos.

### 2. Similar Shot Repetition

Frage: Sind zu viele aehnliche Shots enthalten?

Mehr als zwei aehnliche Raumshots direkt hintereinander loesen Review aus. Drei
oder mehr fast gleiche KB-/PX-Bewegungen koennen blockieren, wenn kein neuer
Wert sichtbar wird.

### 3. Qwen Artifact Risk

Frage: Gibt es sichtbare Qwen-Artefakte?

QW-/MX-Kandidaten bleiben reviewpflichtig. Sichtbare Geometriefehler,
veraenderte Fenster/Tueren, erfundene Moebel, unstimmige Spiegelungen oder
falsche Views blockieren.

### 4. Text Readability

Frage: Sind Texte lesbar?

Text muss kurz, kontrastreich und stabil lesbar sein. Lange Saetze,
Kollisionen mit Untertiteln/CTA/Avatar oder Text auf unruhiger Bewegung loesen
Review oder Block aus.

### 5. Property Dominance

Frage: Ist die Immobilie Hauptmotiv geblieben?

Avatar, Presenter, Branding, Text und Effekte duerfen normale Listingvideos
nicht dominieren. Wenn die Immobilie im 2-8-Sekunden-Fenster nicht sichtbar
traegt, blockiert das Gate.

### 6. CTA Presence

Frage: Ist der CTA vorhanden, wenn das Produkt ihn braucht?

Produkt-Templates mit `cta_logic.required: true` brauchen einen kurzen,
lesbaren CTA nach genug Objektwert. Premium- oder reine Mood-Clips koennen je
nach Template ohne CTA auskommen.

### 7. Pace Too Slow

Frage: Ist das Video zu langsam?

Zu viele lange, gleichfoermige, schwache oder rein sachliche Takes machen den
Clip langweilig. Lange Takes brauchen sichtbaren Bildwert, stabile Geometrie
und klare Rolle.

### 8. Pace Too Hectic

Frage: Ist das Video zu hektisch?

Zu viele schnelle Schnitte, starke Transitions, QW-Momente, Textwechsel oder
Avatar-/Presenter-Cuts koennen die Immobilie entwerten. Hektik ist besonders
kritisch bei Premium-, Architektur- und Family-Home-Profilen.

### 9. Variety Balance

Frage: Gibt es genug Abwechslung zwischen Raum, Detail, Aussen, Text und CTA?

Ein Clip sollte nicht nur aus Raumuebersichten, nur aus Details oder nur aus
Textkarten bestehen. Die Mischung richtet sich nach Produkt-Template und
Creative Profile, aber v0.1 verlangt eine erkennbare Variation.

## Spaetere technische Inputs

Eine spaetere Implementierung kann diese Gates mit folgenden Signalen fuettern:

- Motivklasse und Motiv-Eigenschaften,
- Highlight-Scoring,
- Matching- und Scoring-Regeln,
- Product Video Type,
- Shot-Dauer,
- Textrollen,
- Avatar-/Presenter-Segmente,
- QW-/MX-Risikomarker,
- CTA-Logik,
- Transition- und Motion-Families.

Diese Datei definiert aber noch keine Engine und keine finalen Schwellenwerte.

## JSON-Quelle

Die maschinenlesbaren v0.1-Gates liegen in:

```text
config/video-motion/quality_gates.v01.json
```

## Status

Alle Quality Gates sind `v0.1`, `draft`,
`tested_with_real_images: false` und `approved_for_production: false`.

