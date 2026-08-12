# Motif Detection Rules

## Zweck

Diese Datei beschreibt erste menschenlesbare Regeln, um Motivklassen und
Eigenschaften aus Immobilienbildern abzuleiten. Sie ist keine produktive
Detection-Engine und enthaelt keine Modell-, API- oder Provider-Integration.

Die Regeln sollen spaeter helfen, manuelles Tagging, Qwen-/Vision-Prompts,
interne Review-Tools oder einfache Heuristiken konsistent zu halten.

## Allgemeine Regeln

1. Tagge zuerst die Funktion des Bildes, nicht das schoenste Detail.
2. Setze genau eine primaere Motivklasse.
3. Nutze sekundaere Motivklassen nur, wenn sie fuer den spaeteren Shot Plan
   relevant sind.
4. Nutze Eigenschaften sparsam und nur, wenn sie sichtbar sind.
5. Markiere unsichere Bilder mit `manual_review_required: true`.
6. Vermeide automatische Ueberinterpretation von Lifestyle oder Luxus.

## Primaere Motivklasse waehlen

### Raumfunktion vor Dekoration

Wenn ein Bild eindeutig ein Wohnzimmer zeigt, bleibt `living` die primaere
Klasse, auch wenn ein schoenes Detail oder ein Fenster sichtbar ist.

Beispiel:

```text
Sofa + Couchtisch + TV-Wand + grosses Fenster
-> primary_motif_class: living
-> motif_properties: bright, window_dominant
```

### Open Plan vor Einzelraum

Wenn Wohnen, Essen und Kueche in einem zusammenhaengenden Raum sichtbar sind
und die Offenheit das Hauptargument ist, nutze `open_plan` statt `living` oder
`kitchen`.

```text
Sofa + Esstisch + Kuecheninsel in einem weiten Raum
-> primary_motif_class: open_plan
-> secondary_motif_classes: living, kitchen, dining
```

### Aussenbereich unterscheiden

Nutze:

- `balcony` fuer kleine private Aussenflaechen am Gebaeude
- `terrace` fuer groessere befestigte Aussenflaechen
- `garden` fuer Gruen- oder Hofflaechen
- `view` fuer die Aussicht selbst
- `exterior` fuer das Gebaeude von aussen

Ein Terrassenbild mit Blick in den Garten bleibt primaer `terrace`, wenn die
Terrasse das Motiv dominiert.

### Detail nur bei echtem Detailmotiv

`detail` soll nur primaer sein, wenn das Bild wirklich auf Material, Objekt,
Textur, Lichtstimmung oder Ausstattung fokussiert.

Wenn ein Bad mit sichtbarer Armatur als ganzer Raum fotografiert ist, bleibt es
`bathroom`. Wenn nur Armatur, Fliese und Lichtreflex sichtbar sind, ist
`detail` passend.

### Branding nur bei Kommunikationsmaterial

`branding` ist fuer Makler-, Agentur-, Logo-, Schild-, Team- oder CTA-Material.
Ein normales Immobilienbild mit kleinem Logo-Wasserzeichen ist nicht
automatisch `branding`.

## Eigenschaften erkennen

### symmetric

Setzen, wenn die Komposition deutlich gespiegelt oder mittig balanciert ist.

Typisch:

- frontal fotografierte Fassade
- zentrierte Kuecheninsel
- Bad mit klarer Mittelachse

Nicht setzen, wenn nur einzelne Objekte links und rechts aehnlich wirken.

### strong_lines

Setzen, wenn Linienfuehrung ein sichtbarer Gestaltungswert ist.

Typisch:

- klare Fensterachsen
- Treppenlinien
- lange Flure
- moderne Fassaden
- sichtbare Balken oder Materialkanten

### deep_perspective

Setzen, wenn das Bild erkennbare Tiefe oder eine starke Raumachse hat.

Typisch:

- Blick durch mehrere Raumzonen
- langer Flur
- offene Wohnlandschaft
- Terrasse mit Blick in Garten oder Landschaft

### window_dominant

Setzen, wenn Fenster, Glasflaechen oder Ausblick einen grossen Teil der
Bildwirkung bestimmen.

Hinweis: Diese Eigenschaft erzeugt spaeter oft Text- und Qwen-Risiken, weil
Belichtung, Reflexionen und Linien stabil bleiben muessen.

### feature_object

Setzen, wenn ein klares Verkaufs- oder Ausstattungsobjekt sichtbar dominiert.

Beispiele:

- Kamin
- Kochinsel
- freistehende Badewanne
- Design-Treppe
- Weinkuehlschrank
- Sauna

### high_ceiling

Setzen, wenn hohe Decken, Galerie, Loftgefuehl oder vertikale Grosszuegigkeit
sichtbar sind.

Nicht setzen, wenn der Raum nur hell oder weit wirkt.

### narrow_space

Setzen, wenn der Raum eng, schlauchfoermig oder geometrisch riskant wirkt.

Typisch:

- enger Flur
- kleines Bad
- schmale Kueche
- kompakter Balkon

Diese Eigenschaft ist ein Risikohinweis, kein Qualitaetsurteil.

### outdoor

Setzen, wenn das Bild draussen aufgenommen wurde oder der Aussenraum das Motiv
klar bestimmt.

Typisch fuer `exterior`, `balcony`, `terrace`, `garden` und viele `view`-Bilder.

### luxury

Setzen, wenn sichtbare Materialien, Architektur, Ausstattung oder Lage eine
hochwertige Wirkung tragen.

Nur setzen, wenn die Bildinformation es wirklich stuetzt. Ein grosses Zimmer
oder ein helles Bild ist allein noch kein `luxury`.

### cozy

Setzen, wenn das Bild Waerme, Wohnlichkeit oder Familiengefuehl vermittelt.

Typisch:

- warmer Wohnbereich
- Garten mit Aufenthaltsqualitaet
- Schlafzimmer mit ruhiger Stimmung
- Essbereich mit einladender Wirkung

### bright

Setzen, wenn gute Helligkeit oder natuerliches Licht klar zur Bildwirkung
beitragen.

Nicht setzen, wenn das Bild nur technisch korrekt belichtet ist.

### sunset

Setzen, wenn Abendlicht, Sonnenuntergang, Golden Hour oder Daemmerungsstimmung
sichtbar ist.

Diese Eigenschaft kann stark fuer Hook und Stimmung sein, braucht aber spaeter
Review fuer Farb- und Belichtungsstabilitaet.

## Manuelle Review-Ausloeser

Setze `manual_review_required: true`, wenn mindestens einer dieser Punkte
zutrifft:

- primaere Motivklasse unsicher
- mehrere Raumfunktionen konkurrieren stark
- starke Spiegelungen oder Glasflaechen
- sichtbare Personen, Nummernschilder oder sensible Informationen
- Marken-/Logo-Material mit Lesbarkeitsanforderung
- sehr enge Raeume
- extreme Weitwinkelwirkung
- starke Fensterdominanz
- dunkle oder technisch schwache Bildbereiche
- Bild koennte `ignore_candidate` sein

## Suggested Video Roles

Die Rolle ist nur ein frueher Hinweis:

- `hero_candidate`: starkes erstes oder tragendes Bild
- `rhythm_candidate`: kurzer Energie- oder Stimmungsshot
- `transition_candidate`: verbindet Raumzonen oder Kapitel
- `text_anchor_candidate`: ruhiger Bereich fuer kurze Typografie
- `avatar_background_candidate`: ruhiger Hintergrund fuer Presenter/Avatar
- `detail_candidate`: Detail- oder Premiumbeweis
- `cta_candidate`: Schluss, Kontakt oder Markenbezug
- `ignore_candidate`: wahrscheinlich nicht nutzen

## Nicht in Session 3 enthalten

- keine Highlight-Scores
- keine Motion-Presets
- keine Qwen-, DA3- oder Vision-API
- keine automatische Objekterkennung
- keine Webseite
- keine Render-Integration
- keine Produkt-Templates

## Status

Diese Regeln sind `v0.1`, `draft` und nicht production-approved. Sie muessen
mit echten Immobilienbildern geprueft und spaeter gegen Scoring- und
Motion-Ergebnisse validiert werden.
