# Motion Families

## Zweck

Motion Families beschreiben grobe Bewegungsarten fuer Immobilienbilder. Sie
sind noch keine konkreten Presets. Eine Motion Family sagt, welche Art von
Bewegung spaeter denkbar ist, fuer welche Motive sie grundsaetzlich passt und
welche Risiken vor der Preset-Auswahl beachtet werden muessen.

Session 5 baut damit die Bruecke zwischen Highlight Scoring und spaeteren
Motion Presets. Es wird noch keine Render-Logik, kein API-Call und keine
Preset-Liste erstellt.

## Position in der Planung

```text
Inputbilder + Objektkontext
  -> Creative Direction Layer
  -> Motivklassen + Eigenschaften
  -> Highlight Scoring
  -> Motion Families / Safety / Duration
  -> Shot Plan
  -> Motion Presets
  -> Typography / Voice / Avatar
  -> Render Job
```

## Technische Methoden

Motion Families koennen spaeter mit unterschiedlichen technischen Methoden
umgesetzt werden:

```text
KB = Ken Burns / 2D crop, zoom, pan, tilt
PX = Parallax / depth / 2.5D
QW = Qwen-like multi-angle or image-edit variant
MX = mixed method, for example QW variant plus KB push
```

Session 5 entscheidet nur, welche Methoden grundsaetzlich denkbar sind. Ob ein
konkretes Bild diese Methode nutzen darf, haengt spaeter von Scoring,
Sicherheitsstufe, Dauer und Feature Flags ab.

## Motion Families v0.1

### push_in

Langsamer oder mittlerer Zoom in das Bild hinein.

Gut fuer:

- Hero-Shots
- Wohnzimmer, Open Plan, Terrasse, Garten, View
- ruhige Premium- oder Family-Momente

Risiken:

- zu starker Push wirkt billig oder klaustrophobisch
- enge Raeume verlieren Glaubwuerdigkeit
- wichtige Bildteile koennen aus dem Frame fallen

### pull_out

Bewegung aus dem Motiv heraus. Das Bild oeffnet sich und zeigt mehr Kontext.

Gut fuer:

- Raumgefuehl
- Architektur
- View oder Outdoor-Kontext
- ruhige Abschluss- oder Establishing-Momente

Risiken:

- braucht genug Crop-Reserve
- kann schwach wirken, wenn der Startausschnitt keinen klaren Hook hat

### pan_left

Seitliche Bewegung nach links ueber das Bild.

Gut fuer:

- breite Raeume
- Fassaden
- Terrassen
- Kuechenzeilen
- lange horizontale Linien

Risiken:

- horizontale Linien und Fenster muessen stabil bleiben
- schlechte Bildrander werden sichtbar

### pan_right

Seitliche Bewegung nach rechts ueber das Bild.

Gut fuer:

- breite Raeume
- Fassaden
- Terrassen
- Kuechenzeilen
- klare horizontale Bildachsen

Risiken:

- gleiche Risiken wie `pan_left`
- Bewegungsrichtung muss spaeter zur Shot-Reihenfolge passen

### tilt_up

Vertikale Bewegung nach oben.

Gut fuer:

- hohe Decken
- Treppen
- Fassaden
- Views mit Himmel
- architektonische Vertikalitaet

Risiken:

- kann Linien kippen lassen
- bei Innenraeumen schnell unnatuerlich, wenn Decke oder Leuchten stoeren

### tilt_down

Vertikale Bewegung nach unten.

Gut fuer:

- Eingang zu Raum
- Detail zu Raum
- Terrasse/Garten von Blick nach Nutzflaeche
- sanfte Reveal-Momente

Risiken:

- Bodenflaechen koennen langweilig wirken
- bei enger Geometrie steigt Glaubwuerdigkeitsrisiko

### diagonal_move

Leichte diagonale Bewegung, meist als Kombination aus Pan und Zoom.

Gut fuer:

- Social-Hooks
- offene Raeume
- Details mit Dynamik
- kurze Energy-Cuts

Risiken:

- wirkt schnell unruhig
- fuer lange Takes selten glaubwuerdig
- braucht klare Motivfuehrung

### parallax_float

Subtile raeumliche Bewegung mit Tiefe oder Layer-Gefuehl.

Gut fuer:

- Premium-Hero-Shots
- Open Plan
- View
- Terrasse/Garten
- Architektur mit Tiefe

Risiken:

- braucht Tiefenlogik oder saubere Layer
- Fenster, Spiegel und feine Linien koennen brechen
- Provider-/Depth-Abhaengigkeit spaeter moeglich, aber nicht in Session 5

### feature_focus

Bewegung hin zu einem klaren Verkaufs- oder Ausstattungsobjekt.

Gut fuer:

- Kamin
- Kochinsel
- Badewanne
- Design-Treppe
- Materialdetail
- View oder Outdoor-Feature

Risiken:

- Feature muss wirklich sichtbar und relevant sein
- zu starker Fokus kann den Raum verlieren

### perspective_nudge

Sehr kleine perspektivische Veraenderung oder Blickwinkel-Andeutung.

Gut fuer:

- sehr kurze Takes
- Social-Energie
- starke Features
- Bilder mit genug geometrischer Toleranz

Risiken:

- Qwen-/Image-Edit-Risiko
- Linien, Fenster und Spiegel koennen unglaubwuerdig werden
- nur mit Feature Flag und Review spaeter sinnvoll

### orbit_hint

Kurzer Eindruck einer seitlichen Umkreisung oder Objekt-/Raum-Orbit-Andeutung.

Gut fuer:

- Feature-Objekte
- Treppen
- Kuecheninseln
- Aussenbereiche mit klarer Tiefe

Risiken:

- kein echtes 3D
- bei langen Takes schnell falsch
- nur fuer kurze, kontrollierte Momente geeignet

### doorway_reveal

Bewegung, die einen Raum wie durch Eingang, Tuerrahmen oder Achse einfuehrt.

Gut fuer:

- entrance
- hallway
- living
- open_plan
- bedroom

Risiken:

- enge Raeume und Tuerrahmen brauchen stabile Linien
- darf nicht wie falsche Kamerafahrt wirken

### staircase_rise

Aufwaerts- oder entlangfuehrende Bewegung an Treppe, Galerie oder vertikaler
Architektur.

Gut fuer:

- staircase
- high_ceiling
- editorial_architecture
- dynamische kurze Uebergaenge

Risiken:

- Treppenlinien sind sehr fehlerempfindlich
- aggressive Bewegung kann instabil wirken

### drone_like_lift

Leichte Hebe- oder Ueberblicksbewegung, die an eine sehr sanfte Drohnenlogik
erinnert.

Gut fuer:

- exterior
- garden
- terrace
- view
- groessere Outdoor-Flaechen

Risiken:

- aus Einzelbildern nur als Andeutung glaubwuerdig
- nicht fuer enge Innenraeume geeignet
- kann schnell kuenstlich wirken

### text_card

Gestaltungsmoment, bei dem Text oder CTA die Hauptfunktion traegt und Bild oder
Hintergrund ruhiger behandelt werden.

Gut fuer:

- Branding
- Sold Showcase
- CTA
- Preis-/Statushinweis
- kurze Kapitel- oder Hook-Texte

Risiken:

- darf die Immobilie nicht aus dem Fokus draengen
- Typografie-System kommt erst in spaeterer Session

## Beziehung zu Safety Levels

Jede Motion Family bekommt eine empfohlene Sicherheitsstufe. Diese Stufe ist
noch kein hartes Verbot, sondern ein Hinweis fuer spaetere Presets:

```text
safe
medium
experimental
micro_only
```

Je laenger ein Take ist, desto konservativer muss die Motion Family bewertet
werden.

## Status

Alle Motion Families sind `v0.1`, `draft`,
`tested_with_real_images: false` und `approved_for_production: false`.
