# Motif Classes

## Zweck

Motivklassen beschreiben, was auf einem Immobilienbild sichtbar ist. Sie sind
die erste Ordnungsschicht zwischen Creative Direction und spaeterem Shot Plan.

Diese Datei ist keine Bilderkennung, kein Scoring-Modell und keine
Motion-Preset-Library. Sie definiert nur die v0.1-Begriffe, die spaeter von
Tagging, Highlight-Scoring, Motion-Auswahl, Typografie und Rendering genutzt
werden koennen.

## Position in der Planung

```text
Inputbilder + Objektkontext
  -> Creative Direction Layer
  -> Motivklassen + Eigenschaften
  -> Highlight-Scoring
  -> Shot Plan
  -> Motion Families / Presets
  -> Typography / Voice / Avatar
  -> Render Job
```

Ein Bild kann mehrere Motivklassen enthalten. Fuer die erste Version soll aber
immer genau eine primaere Motivklasse gesetzt werden, damit spaetere Regeln
eindeutig entscheiden koennen.

## Motivklassen v0.1

### exterior

Aussenansicht des Gebaeudes, Fassade, Hausfront, Strassenansicht oder
architektonischer erster Eindruck.

Typische Nutzung:

- schneller Objekt-Establishing-Shot
- Hero-Shot bei starker Architektur
- Kontextbild vor Innenraeumen

Risiken:

- parkende Autos, Muelltonnen oder schlechte Wetterwirkung
- verzerrte Linien bei Weitwinkel
- zu wenig Aussage, wenn nur ein Teil der Fassade sichtbar ist

### entrance

Eingang, Haustuer, Zufahrt, Lobby, Eingangsbereich oder Ankommensmoment.

Typische Nutzung:

- weicher Uebergang von Aussen nach Innen
- kurzer Rhythmus-Shot
- Vertrauens- oder Willkommensmoment

Risiken:

- enge oder dunkle Eingangsbereiche
- geringe visuelle Wirkung ohne klare Linien

### living

Wohnzimmer oder Hauptaufenthaltsraum ohne klar dominierende Kuechenfunktion.

Typische Nutzung:

- haeufiger Hero-Shot
- emotionaler Wohnlichkeitsanker
- Text- oder Voiceover-Anker

Risiken:

- unruhige Moeblierung
- dunkle Ecken oder zu starke Bildschirmflaechen

### open_plan

Offener Wohn-, Ess- und Kuechenbereich, bei dem mehrere Funktionen in einem
grossen Raum sichtbar sind.

Typische Nutzung:

- Hero-Shot fuer Raumgefuehl
- Premium- oder Familienanker
- langsamerer Take mit stabiler Geometrie

Risiken:

- zu viele konkurrierende Bildbereiche
- schwierige Textpositionierung
- Qwen- oder Perspektivrisiko bei langen Takes

### kitchen

Kueche, Kuechenzeile, Kochinsel, Arbeitsflaechen, Geraete oder
Materialdetails mit Kuechenbezug.

Typische Nutzung:

- Feature-Shot
- Premium- oder Ausstattungsbeweis
- kurzer Rhythmus-Shot bei Details

Risiken:

- glaenzende Flaechen, Spiegelungen, Kleinteile
- unklare Raumtiefe bei engen Kuechen

### dining

Essbereich, Esstisch, Fruehstuecksplatz oder Verbindung zwischen Wohnen und
Kueche.

Typische Nutzung:

- warmer Zwischen-Shot
- Familien- oder Lifestyle-Gefuehl
- Uebergang in offenen Grundrissen

Risiken:

- kann redundant wirken, wenn `open_plan` bereits stark ist
- oft weniger Hero-Potenzial als living oder outdoor

### bedroom

Schlafzimmer, Hauptschlafzimmer, Gaestezimmer mit Bett oder ruhiger
Rueckzugsraum.

Typische Nutzung:

- ruhiger Listing-Shot
- Komfort- oder Familienhinweis
- kurzer bis mittlerer Take

Risiken:

- kleine Raeume wirken schnell enger
- unruhige Bettwaesche oder dunkle Ecken

### bathroom

Bad, Dusche, Wanne, Waschbecken, WC oder Wellness-/Sanitaerbereich.

Typische Nutzung:

- Ausstattungsbeweis
- Premium-Detail bei hochwertigen Materialien
- kurzer sauberer Take

Risiken:

- Spiegelungen und sichtbare Kamera
- enge Geometrie
- Qwen-Risiko bei Armaturen und Fugen

### office

Arbeitszimmer, Homeoffice, Studio, Bibliothek oder flexibler Arbeitsbereich.

Typische Nutzung:

- Zielgruppenhinweis fuer modernes Wohnen
- kurzer Feature-Shot
- ruhiger Nebenraum im Shot Plan

Risiken:

- wirkt schnell generisch
- Kabel, Monitore oder Kleinteile stoeren

### hallway

Flur, Diele, Verbindungsgang oder Innen-Erschliessung ohne dominante Treppe.

Typische Nutzung:

- Orientierung zwischen Raeumen
- kurzer Transition-Shot
- Tiefenhinweis bei klarer Achse

Risiken:

- enge oder dunkle Flaechen
- geringe emotionale Wirkung

### staircase

Treppe, Galerie, Treppenhaus oder vertikale Erschliessung.

Typische Nutzung:

- architektonischer Rhythmus-Shot
- dynamischer Uebergang
- Perspektiv- oder Linienmotiv

Risiken:

- starke Verzerrung bei schraegen Linien
- Sicherheitsgefuehl kann kippen, wenn Bewegung zu aggressiv ist

### balcony

Balkon, Loggia oder kleiner privater Aussenbereich am Gebaeude.

Typische Nutzung:

- Lifestyle- und Lichtmoment
- kurzer bis mittlerer Outdoor-Take
- Verbindung zu Aussicht oder Lage

Risiken:

- Gelander und Fensterlinien muessen stabil bleiben
- kleine Balkone wirken bei falschem Crop schwach

### terrace

Terrasse, Patio, Dachterrasse oder grosser befestigter Aussenbereich.

Typische Nutzung:

- starker Hero- oder Feature-Shot
- Luxury- oder Family-Hook
- Outdoor-Living-Erzaehlung

Risiken:

- schlechtes Wetter, leere Flaechen oder harte Schatten
- Moebel koennen bei Bewegung unruhig wirken

### garden

Garten, Rasen, Hof, Gruenflaeche, Pflanzung oder privater Aussenraum.

Typische Nutzung:

- Familien- und Freizeitargument
- emotionaler Hero-Shot
- warmer Abschluss oder CTA-Umfeld

Risiken:

- unstrukturierte Gruenflaechen wirken schnell beliebig
- Wind, Schatten oder starkes Gegenlicht

### view

Aussicht, Panorama, Blick aus Fenster, Blick von Balkon/Terrasse oder
Lagebeweis.

Typische Nutzung:

- starker Hook oder Premium-Beweis
- ruhiger Hero-Shot
- Textanker fuer Lage oder Aussicht

Risiken:

- Fensterrahmen und Horizont muessen stabil bleiben
- unscharfe oder ueberbelichtete Aussicht schwacht den Effekt

### detail

Material, Lichtstimmung, Griff, Armatur, Kamin, Dekor, Textur, Ausstattung,
Moebel- oder Architekturdetail.

Typische Nutzung:

- Rhythmus-Shot
- Premium-Beweis
- Uebergang, Hook oder Stimmungsmoment

Risiken:

- Details erklaeren selten die ganze Immobilie
- zu viele Detail-Shots machen den Clip fragmentiert

### branding

Makler-, Agentur-, Logo-, Schild-, Visitenkarten-, Team- oder CTA-Material, bei
dem Marke oder Ansprechpartner sichtbar wird.

Typische Nutzung:

- Agent Branding
- CTA oder Schlussbild
- kurzer Vertrauensanker

Risiken:

- darf Objektclip nicht dominieren
- Logo- und Textlesbarkeit muss manuell geprueft werden

## Eigenschaften v0.1

Eigenschaften beschreiben visuelle Qualitaeten, die quer zu Motivklassen
liegen. Sie duerfen kombiniert werden.

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

Eigenschaften sind keine Bewertung. `narrow_space` ist zum Beispiel nicht
automatisch schlecht, sondern ein Hinweis, dass Bewegung, Crop und Qwen-Risiko
vorsichtiger bewertet werden muessen.

## Statusregel

Alle Motivklassen und Eigenschaften sind `v0.1`, `draft`,
`tested_with_real_images: false` und `approved_for_production: false`, bis sie
mit echten Immobilienbildern geprueft wurden.
