# Creative Direction Layer

## Zweck

Der Creative Direction Layer entscheidet vor jeder Videoerstellung, welche
kreative Richtung ein Objekt braucht. Er ist keine Render-Engine, kein
Provider-Adapter und kein Motion-Preset-Katalog.

Seine Aufgabe ist es, aus Objekt, Bildmaterial und Kommunikationsziel eine
klare Video-Absicht abzuleiten:

- Was ist dieses Objekt?
- Was ist das staerkste Verkaufsargument?
- Welche Stimmung soll entstehen?
- Welche Videoform passt?
- Wie viel Dynamik vertraegt das Material?
- Braucht es Avatar, Voiceover oder nur Text?
- Welche Bilder sind Hero-Shots?
- Welche Bilder sind kurze Rhythmus-Shots?
- Welche Bilder duerfen ignoriert werden?

Das Ergebnis ist spaeter ein Creative-Direction-Decision-Objekt, das von
Shot-Planung, Motion-Familien, Typografie und Rendering genutzt werden kann.
In Session 2 wird nur die Planungs- und Konfigurationsschicht beschrieben.

## Position in der Architektur

Die Creative Direction liegt vor Shot-Plan und Motion-Auswahl:

```text
Inputbilder + Objektkontext
  -> Creative Direction Layer
  -> Shot Plan
  -> Motion Families / Presets
  -> Typography / Voice / Avatar
  -> Render Job
```

Der Layer darf keine spaeteren Sessions ersetzen. Er entscheidet noch nicht
ueber konkrete Motif-Detection, Motion-Presets, Qwen-Calls, Avatar-Provider
oder Render-Implementierung.

## Eingaben

Die erste Version erwartet nur beschreibbare Eingaben. Es gibt noch keine
produktive API und keinen verpflichtenden technischen Vertrag.

Moegliche Eingaben:

- Objektart oder grobe Objektbeschreibung
- Zielgruppe oder Vermarktungssituation
- wichtigste Verkaufsargumente
- Bildanzahl und grobe Bildqualitaet
- erkennbare Staerken des Materials
- erkennbare Schwaechen des Materials
- gewuenschte Plattform oder Cliplaenge
- Wunsch nach Makler-/Agenturmarke
- Wunsch nach Voiceover, Avatar oder reinem Text

## Ausgabe

Die Ausgabe soll spaeter mindestens diese Entscheidungen enthalten:

- gewaehltetes Creative Profile
- primaeres Verkaufsargument
- sekundaere Verkaufsargumente
- gewuenschte Stimmung
- empfohlene Videoform
- Dynamik-Level
- Text-, Voiceover- und Avatar-Empfehlung
- Hero-Shot-Regeln
- Rhythmus-Shot-Regeln
- Ignore-Regeln
- Feature-Flag-Hinweise
- bekannte Risiken oder manuelle Review-Punkte

## Entscheidungsfragen

### Was ist dieses Objekt?

Nicht jede Immobilie soll gleich erzaehlt werden. Ein kompaktes
Einfamilienhaus braucht eine andere Dramaturgie als eine reduzierte
Architekturwohnung, ein Neubau oder ein bereits verkauftes Referenzobjekt.

Der Layer soll die Objektwirkung beschreiben, nicht nur eine Kategorie
benennen.

Beispiele:

- warmes Familienhaus mit Garten
- ruhige Premiumwohnung mit klaren Linien
- dynamisches Stadtobjekt mit starkem Social-Hook
- Neubau mit sauberer, heller Materialitaet
- verkauftes Objekt als Erfolgsnachweis
- Makler-/Agenturclip mit Objekt als Beweisfuehrung

### Was ist das staerkste Verkaufsargument?

Das staerkste Verkaufsargument bestimmt, welche Bilder laenger stehen duerfen
und welche Informationen frueh im Clip sichtbar werden muessen.

Typische Verkaufsargumente:

- Lage
- Aussicht
- Licht
- Raumgefuehl
- Garten oder Aussenbereich
- Architektur
- Ausstattung
- Neubauzustand
- Familienfreundlichkeit
- Exklusivitaet
- Verkaufserfolg
- Maklerkompetenz

### Welche Stimmung soll entstehen?

Die Stimmung ist kein Dekorationsdetail. Sie steuert Rhythmus, Textdichte,
Schnittgeschwindigkeit, Farbgefuehl und Voice-/Avatar-Entscheidung.

Moegliche Stimmungen:

- schnell und aufmerksamkeitsstark
- ruhig und hochwertig
- editorial und architektonisch
- warm und wohnlich
- sauber und neubauartig
- exklusiv und dynamisch
- vertrauensbildend und personenbezogen
- rueckblickend und erfolgsorientiert

### Welche Videoform passt?

Die Videoform beschreibt die Kommunikationsaufgabe des Clips. Sie ist noch kein
Produktkatalog, sondern eine kreative Richtung fuer die naechsten Planungsstufen.

Moegliche Videoformen:

- social_teaser
- premium_listing_clip
- architecture_edit
- dynamic_luxury_clip
- warm_family_listing
- new_build_showcase
- sold_result_clip
- agent_brand_clip

### Wie viel Dynamik vertraegt das Material?

Dynamik muss zum Material passen. Viele starke Linien, Tiefe, klare Bildachsen
und kurze Takes erlauben mehr Bewegung. Enge Raeume, verzerrte Fenster,
unruhige Moebel oder lange Takes verlangen Zurueckhaltung.

Die erste Version nutzt vier Dynamik-Level:

```text
low
medium
high
adaptive
```

`adaptive` bedeutet: Hero-Shots bleiben ruhiger, kurze Rhythmus-Shots duerfen
dynamischer sein.

### Braucht es Avatar, Voiceover oder nur Text?

Avatar und Voiceover sind Kommunikationsmittel, keine Pflicht. Normale
Listingvideos sollen nicht zu reinen Talking-Head-Videos werden.

Grundregel:

- Reiner Text passt fuer schnelle Social- und Architekturclips.
- Voiceover passt fuer warme, erklaerende oder vertrauensbildende Clips.
- Avatar passt vor allem fuer Agent Branding, Erklaerung oder bewusst
  persoenliche Vermarktung.
- Avatar soll bei Objektclips kurz, unterstuetzend und nicht dominierend sein.

### Welche Bilder sind Hero-Shots?

Hero-Shots tragen die Hauptaussage des Clips. Sie duerfen laenger stehen,
ruhiger bewegt werden und koennen Text- oder Voice-Anker tragen.

Hero-Shots sind typischerweise Bilder mit:

- klarem ersten Eindruck
- starkem Licht
- gutem Raumgefuehl
- Aussicht oder Garten
- architektonischer Ordnung
- Premium- oder Ausstattungsbeweis
- emotionaler Wohnlichkeit

### Welche Bilder sind Rhythmus-Shots?

Rhythmus-Shots sind kurze Energie- oder Orientierungsmomente. Sie muessen nicht
die ganze Immobilie erklaeren. Sie koennen Schnittfluss, Musikgefuehl und
Social-Energie erzeugen.

Rhythmus-Shots sind typischerweise Bilder mit:

- Detailstaerke
- kurzer visueller Pointe
- Bewegungspotenzial
- Uebergangscharakter
- Marken- oder Lifestyle-Gefuehl

### Welche Bilder duerfen ignoriert werden?

Nicht jedes Bild muss in ein gutes Video. Schwache, doppelte oder verwirrende
Bilder duerfen ausgelassen werden, wenn sie die Wirkung senken.

Ignoriert werden duerfen Bilder mit:

- starker technischer Schwaeche
- verwirrender Raumwirkung
- redundantem Inhalt
- unattraktiver Perspektive
- sichtbaren Stoerern
- geringer Aussagekraft

## Creative Profiles

Session 2 definiert acht erste Profile. Sie sind in
`config/video-motion/creative_direction_profiles.v01.json` versioniert:

- `fast_social`
- `calm_premium`
- `editorial_architecture`
- `luxury_dynamic`
- `family_home_warm`
- `new_build_clean`
- `sold_showcase`
- `agent_branding`

Die Profile sind keine finalen Produktvarianten. Sie sind v0.1-Regeln fuer
Tests mit echten Immobilienbildern.

## Bewertungs- und Statusregel

Jedes Profile enthaelt:

- `status`
- `tested_with_real_images`
- `approved_for_production`
- `notes`
- `known_failure_cases`

Bis reale Tests vorliegen, bleiben die Profile `draft`,
`tested_with_real_images: false` und `approved_for_production: false`.

## Feature-Flag-Bezug

Creative Direction darf riskante Features empfehlen, aber nicht erzwingen.
Wenn ein Profile aggressive Bewegung, Qwen-Varianten, starke Typografie,
experimentelle Transitions oder Avatar-Nutzung nahelegt, muss diese Empfehlung
ueber Feature Flags spaeter abschaltbar bleiben.

Relevante Flags:

```text
qwen_enabled
avatar_enabled
aggressive_motion_enabled
experimental_transitions_enabled
typography_heavy_mode_enabled
```

## Grenzen von Session 2

Diese Session erstellt nur Dokumentation und JSON-Konfiguration.

Nicht Teil dieser Session:

- keine API-Integration
- keine Qwen- oder DA3-Calls
- keine Webseite
- keine App-Aenderung
- keine Shot-Plan-Engine
- keine Motivklassen-Erkennung
- keine Motion-Presets
- keine Typografie- oder Transition-Library
- kein Produktkatalog

