# Recognition Batch Path v0.1

## Zweck

Dieses Dokument beschreibt den lokalen Festplattenpfad fuer Recognition Batch
Processing im internen Motion Lab. Es gehoert zu Session 1 und ist noch keine
Video-, Recognition- oder Provider-Integration.

## Pflichtablauf

```text
Festplattenordner mit bearbeiteten Bildern
-> Doctor Check
-> Import / Normalisierung
-> visuelle Recognition pro Bild
-> manuelle Korrektur moeglich
-> Shotplan
-> Offline Preview Video
-> Report / Bewertung
```

Session 1 setzt nur die ersten zwei Schritte um:

```text
Doctor Check
Import / Normalisierung
```

## Root-Struktur

Beispiel:

```text
/Volumes/PIX_MOTION_TEST/
  inbox/
    objekt_001/
    objekt_002/
  work/
  output/
  logs/
  reports/
  rejected/
```

`inbox/` muss existieren. `work/`, `output/`, `logs/` und `reports/` werden von
Doctor/Import angelegt oder auf Schreibbarkeit geprueft.

## Objektordner

Ein Objektordner kann Bilder direkt enthalten:

```text
inbox/objekt_001/DSC_0001.jpg
inbox/objekt_001/DSC_0002.jpg
```

oder in einem `edited/`-Unterordner:

```text
inbox/objekt_002/edited/DSC_0001.jpg
inbox/objekt_002/edited/DSC_0002.jpg
```

Wenn `edited/` unterstuetzte Bilder enthaelt, wird `edited/` bevorzugt.

## Unterstuetzte Bildtypen

Session 1 erkennt:

- `.jpg`
- `.jpeg`
- `.png`
- `.tif`
- `.tiff`

Andere Dateien werden nicht importiert und erscheinen als unsupported files im
Import-Ergebnis.

## Befehle

Doctor:

```text
npm run motion-lab:doctor -- --root "/Volumes/PIX_MOTION_TEST"
```

Import:

```text
npm run motion-lab:import -- --root "/Volumes/PIX_MOTION_TEST" --limit 50
```

## Doctor-Pruefungen

Doctor prueft:

- Root-Pfad existiert
- `inbox/` existiert
- `work/` ist anlegbar/schreibbar
- `output/` ist anlegbar/schreibbar
- `logs/` ist anlegbar/schreibbar
- `reports/` ist anlegbar/schreibbar
- unterstuetzte Bilder sind auffindbar
- Bildheader fuer JPG/PNG/TIFF sind lesbar
- `ffmpeg` ist verfuegbar oder der Fehler ist sichtbar
- `sharp` ist verfuegbar oder der eingebaute Header-Reader wird genutzt
- Feature Flags sind vorhanden
- einfache API-Key-Pattern sind nicht hardcodiert

## Import-Ergebnis

Pro Objekt schreibt Import:

```text
work/{object_id}/normalized/images/
work/{object_id}/analysis/image_metadata.json
work/{object_id}/logs/import.log
```

Die normalisierten Bilder werden fortlaufend benannt:

```text
001.jpg
002.jpg
003.png
```

`image_metadata.json` enthaelt pro Bild:

```json
{
  "asset_id": "objekt_001_img_001",
  "filename_original": "DSC_0001.jpg",
  "filename_normalized": "001.jpg",
  "width": 3000,
  "height": 2000,
  "aspect_ratio": 1.5,
  "orientation": "landscape",
  "file_size": 1234567,
  "source_path": "...",
  "normalized_path": "..."
}
```

## Grenzen von Session 1

Session 1 macht nicht:

- keine Recognition
- keine manuelle Review UI
- keinen Shotplan
- keine Videoerstellung
- keine Qwen- oder GPT-Calls
- keine finale Kunden-UI
