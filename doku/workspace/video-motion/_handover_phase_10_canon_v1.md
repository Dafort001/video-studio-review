# Handover Phase 10 - PixCapture Canon v1

Datum: 2026-07-01

## Ergebnis

Phase 10 leitet erste versionierte PixCapture-Canon-Dateien aus der
Referenzmatrix, den bisherigen Profil-/Motion-/Report-Regeln und den Planning
Gates ab.

Quelle:

- `/Users/danielfortmann/Desktop/pixcapture_immobilienvideo_referenzmatrix_top100.xlsx`

Gelesene Matrix-Sheets:

- `00 Dashboard`
- `01 Top100`
- `02 Top25 PixCapture`
- `03 Aggregat`
- `04 Schnittklassen`
- `05 Motion_Staging`
- `06 Quellen`
- `07 Templatequellen`

## Neue Regeldateien

YAML:

- `rules/edit_canon_v1.yaml`
- `rules/motion_canon_v1.yaml`
- `rules/staging_canon_v1.yaml`
- `rules/avatar_canon_v1.yaml`

JSON-Spiegel:

- `rules/edit_canon_v1.json`
- `rules/motion_canon_v1.json`
- `rules/staging_canon_v1.json`
- `rules/avatar_canon_v1.json`

## Inhalt

Die Canon-Dateien enthalten:

- Schnittklassen und Videoklassen
- Timing-Regeln
- Bildanzahl und Shotdauer-Fenster
- Raumreihenfolgen und Raumgewichtung
- Motion-Klassen und Room-to-Motion-Defaults
- Staging-/Hook-/CTA-Regeln
- Avatar-/Presenter-Regeln
- Vermeidungsregeln
- Risk-Flags und Planning-Gate-Hinweise
- DA3/SAM3-Eskalation als optionale Worker-Markierung, nicht als Jobstart

## Wichtige Grenze

Alle Canon-Dateien sind `draft_reference_derived` und
`approved_for_production=false`.

Die Matrix ist ausdruecklich eine Referenzmatrix, keine absolute Wahrheit. Die
Regeln duerfen spaetere Shotplan-Generatoren fuehren, aber nicht ohne Review
finale Kundenvideos erzeugen.

## Keine Ausfuehrung

Phase 10 hat nicht gestartet:

- finale Videoerzeugung
- generative API
- Renderer
- Modal/DA3/SAM3-Jobs

## Verifikation

Geprueft wurde:

- Workbook-Sheetnamen und relevante Sheet-Ausschnitte gelesen
- alle geforderten Matrix-Sheets vorhanden
- JSON-Canon-Dateien mit `JSON.parse` validiert
- YAML-Dateien mit Ruby/Psych validiert
- `git diff --check`

## Naechster Schritt

Phase 11 kann einen Canon-Loader oder Shotplan-Generator-Anschluss bauen. Der
Loader sollte die JSON-Dateien bevorzugen, falls keine YAML-Abhaengigkeit
eingefuehrt werden soll.
