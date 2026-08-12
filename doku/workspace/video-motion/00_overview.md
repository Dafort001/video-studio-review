# Video Motion Overview

## Produktidee

Die Video-Motion-Library soll aus einzelnen Immobilienbildern kurze moderne
Video-Creatives erzeugen oder vorbereiten. Die Clips sollen fuer Social Media,
Maklerkommunikation, Objektpraesentation und spaetere PixCapture-Templates
geeignet sein.

Die Immobilie bleibt das Hauptmotiv. Bewegung, Typografie, Musik, Voiceover und
Presenter- oder Avatar-Elemente dienen nur dazu, Aufmerksamkeit, Orientierung
und Abschluss zu verbessern.

## Erstes Einsatzgebiet

Der erste Produktkontext ist Pix.immo. Die entstehenden Regeln und
Schnittstellen sollen aber nicht eng an Pix.immo gebunden werden. PixCapture
Backend und spaeter die Swift App sollen dieselben Prinzipien nutzen koennen:

- Asset-Auswahl
- Creative Direction
- Shot-Planung
- Motion- und Typografie-Regeln
- Provider-faehige Rendering- oder Generierungsauftraege
- Ausgabe als kurzer Video-Clip

## Abgrenzung zur Objektvideo-Pipeline

Diese Library ist eine Nebenstelle zur bestehenden Objektvideo-Erstellung. Sie
ersetzt die vorhandene Pipeline nicht und darf sie in den fruehen Sessions nicht
umbauen.

Die Objektvideo-Pipeline bleibt fuer bestehende Verarbeitungspfade zustaendig.
Die Video-Motion-Library beschreibt zuerst ein eigenes kreatives Planungs- und
Regelsystem fuer Social-Property-Clips.

## Grundannahmen

- Ausgangspunkt sind einzelne Immobilienbilder.
- Spaeter koennen kurze Videodateien hinzukommen.
- Die erste Version ist ein versionierbares Experimentiersystem.
- Regeln, Presets und Scoring-Modelle muessen austauschbar bleiben.
- Riskante Funktionen muessen ueber Feature Flags abschaltbar sein.
- Provider-Zugaenge gehoeren in eine separate Secret- und Adapter-Schicht, nicht
  in Dokumente oder Clientcode.

## Dauerlogik

Die Library unterscheidet vier Take-Laengen:

```text
micro_take  = 0.3-0.8s
short_take  = 0.8-1.5s
medium_take = 1.5-3.0s
hero_take   = 3.0-5.0s
```

Je kuerzer ein Take ist, desto mehr Bewegungsenergie und experimentelle
Qwen-Freiheit ist erlaubt. Je laenger ein Take ist, desto wichtiger werden
stabile Geometrie, glaubwuerdige Linienfuehrung und natuerliche Lichtlogik.

## Aktueller Status

Session 1 ist nur die Basisdokumentation. Es gibt noch keine Motion Library,
keine Presets, kein Matching-Modul, keine Qwen-Integration und keinen
Rendering-Server.

