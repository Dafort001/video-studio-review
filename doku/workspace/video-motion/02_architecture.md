# Video Motion Architecture

## Architekturziel

Die Video-Motion-Library soll zuerst Pix.immo dienen, aber nicht als reine
Pix.immo-Sonderlogik entstehen. Sie wird als Cross-Area-faehige Nebenstelle
gedacht, damit PixCapture Backend und spaeter die Swift App denselben Kern
ansprechen koennen.

## Logische Schichten

```text
Asset Input
  -> Motif Analysis
  -> Creative Direction Layer
  -> Highlight Scoring
  -> Motion Matching
  -> Shot Plan
  -> Product Template
  -> Render or Generation Job
  -> Output Bundle
```

Session 1 dokumentiert diese Schichten nur. Es wird noch kein Code fuer diese
Schichten erstellt.

## Asset Input

Der Asset Input enthaelt zunaechst einzelne Immobilienbilder. Spaeter kann er
auch kurze Videodateien, Presenter-Aufnahmen, Avatar-Assets oder Branding-Medien
enthalten.

## Motif Analysis

Die Motif Analysis beschreibt, was auf einem Bild zu sehen ist und welche
Eigenschaften fuer Bewegung und Typografie relevant sind. Beispiele sind
Motivklasse, Linienfuehrung, Tiefenwirkung, Fensterdominanz, Helligkeit,
Luxuswirkung oder enger Raum.

## Creative Direction Layer

Diese Schicht waehlt die kreative Richtung fuer ein Objekt. Sie soll verhindern,
dass jedes Objekt gleich geschnitten wird, und entscheidet, ob ein Clip eher
schnell, ruhig, architektonisch, warm, luxuriös, verkaufsorientiert oder
agentenbezogen wirken soll.

## Highlight Scoring

Highlight Scoring bewertet jedes Bild fuer seine Rolle im Video. Ein Bild kann
zum Beispiel Hero-Shot, kurzer Energy-Cut, Textflaeche, Avatar-Hintergrund oder
risikoreiches Qwen-Motiv sein.

## Motion Matching

Motion Matching verbindet Motivklassen, Bildmerkmale, Dauerlogik,
Sicherheitsstufen und Creative Direction mit passenden Motion Families oder
spaeter konkreten Presets.

## Shot Plan

Der Shot Plan ist das zentrale Zwischenergebnis. Er beschreibt, welche Bilder in
welcher Reihenfolge, mit welcher Dauer, welcher Bewegung und welcher
Gestaltungsidee verwendet werden.

## Product Template

Product Templates definieren spaeter konkrete Video-Produkte, zum Beispiel
Social Teaser, Premium Property Clip, Sold Showcase oder Clips mit Avatar-Intro.

## Provider- und Render-Schicht

Externe Systeme wie Qwen, DA3, Avatar-Provider, Renderer oder FFmpeg/Remotion
gehoeren hinter Adapter. Die Library darf nicht davon ausgehen, dass ein
bestimmter Provider immer aktiv oder guenstig verfuegbar ist.

Provider-Zugaenge muessen ueber Secrets und Server-seitige Adapter laufen.
Clientcode, Dokumentation und JSON-Konfigurationen duerfen keine produktiven
Zugangsdaten enthalten.

## Beziehung zur Objektvideo-Pipeline

Die bestehende Objektvideo-Pipeline bleibt parallel bestehen. In fruehen
Sessions darf die Video-Motion-Library nur daneben dokumentiert und aufgebaut
werden. Eine spaetere Bruecke ist moeglich, wenn es einen klaren gemeinsamen
Vertrag gibt, zum Beispiel fuer Asset-Pakete, Jobstatus oder Output-Bundles.

