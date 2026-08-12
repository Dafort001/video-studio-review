# PixCapture Image Catalog

Stand: 2026-07-01

## Zweck

Der Image Catalog ist die read-only Eingangsschicht fuer die PixCapture /
Motion-Lab Bildpipeline. Er inventarisiert Originalbilder, ohne die
Originalstruktur zu verschieben, umzubenennen oder anzureichern.

CLI:

```text
npm run motion-lab:catalog -- --root "/Volumes/NAME_DER_FESTPLATTE" --out ./analysis/catalog --report-out ./analysis/reports --force-catalog
```

## Warum die Originalstruktur unveraendert bleibt

Kamera- und Kundenordner sind Beweismaterial fuer Herkunft, Kontext und
spaetere Wiederverwendung. Phase 1 schreibt deshalb nie in `--root`.

Sicherheitsregeln:

- `--out` muss ausserhalb von `--root` liegen.
- `--report-out` muss ausserhalb von `--root` liegen.
- `--force-catalog` ersetzt nur Analyseartefakte, niemals Originalbilder.
- Der Katalog ist ein Index, keine Migration.

Diese Regel ist wichtig, weil Dateinamen nicht eindeutig sind und gleiche
Kameranamen in mehreren Jobs vorkommen koennen. Die spaetere Identitaet kommt
aus Manifest/Katalog plus Jobkontext, nicht aus Dateinamen allein.

## Ausgabeorte

Default:

```text
analysis/catalog/image_catalog.jsonl
analysis/reports/catalog_report.json
analysis/reports/catalog_report.html
```

Phase 1 fuehrte bewusst keine DuckDB-/Parquet-Abhaengigkeit ein. Der aktuelle
MVP nutzt JSONL plus JSON/HTML-Report.

## Aufbau

`image_catalog.jsonl` enthaelt eine JSON-Zeile pro Bild. Reports fassen die
gleichen Records fuer Review zusammen:

- Anzahl Bilder
- Bildtypen
- Lesefehler
- exakte Duplikate nach SHA-256
- moegliche Near-Duplicates nach pHash
- groesste und kleinste Dimensionen
- Orientierung
- Beispielpfade
- Warnungen und fehlgeschlagene Dateien

## Felder

Pro Bild schreibt der Katalog:

- `image_id`
- `original_path`
- `drive_label`
- `relative_path`
- `filename`
- `extension`
- `checksum_sha256`
- `perceptual_hash`
- `width`
- `height`
- `orientation`
- `file_size_bytes`
- `file_created_at`
- `file_modified_at`
- `cataloged_at`
- `read_error`

Unterstuetzte Bildtypen:

- `jpg`
- `jpeg`
- `png`
- `tif`
- `tiff`
- `webp`

RAW/DNG wird im Phase-1-Katalog nicht verarbeitet.

## Checksums und pHash

`checksum_sha256` identifiziert bytegleiche Dateien. Das ist die harte
Duplikatserkennung.

`perceptual_hash` ist ein lokaler Average-Hash ueber ein kleines
ffmpeg-Sample. Er wird als `ahash:<hex>` gespeichert und ist nur ein
Near-Duplicate-Hinweis. Er ist keine Raum- oder Qualitaetsanalyse.

`image_id` wird aus Checksum und relativem Pfad erzeugt. Das reduziert
Kollisionen bei wiederholten Dateinamen.

## Katalog neu aufbauen

Trockenlauf:

```text
npm run motion-lab:catalog -- --root "/Volumes/NAME_DER_FESTPLATTE" --out ./analysis/catalog --report-out ./analysis/reports --dry-run true
```

Kleiner Test:

```text
npm run motion-lab:catalog -- --root "/Volumes/NAME_DER_FESTPLATTE" --out ./analysis/catalog --report-out ./analysis/reports --limit 20 --force-catalog
```

Voller Lauf erst nach Sichtpruefung:

```text
npm run motion-lab:catalog -- --root "/Volumes/NAME_DER_FESTPLATTE" --out ./analysis/catalog --report-out ./analysis/reports --force-catalog
```

Wenn der Lauf fehlerhafte Bilder findet, bricht er nicht zwingend ab. Er
schreibt `read_error`, `failed_files` und Warnungen in die Reports.

## Nachgelagerte Stufen

Der Katalog allein macht keine Recognition, keine Semantic Profiles, keine
Motion Candidates und keine Shotplans. Er liefert nur die stabile Bildliste.

Naechste typische Stufen:

1. echte oder manuelle Recognition
2. `motion-lab:build-profiles`
3. Planning Gate
4. `motion-lab:score-motion`
5. `motion-lab:build-shotplan`

## MVP-Grenze

Der Katalog darf nicht als Qualitaetsentscheidung missverstanden werden.
Breite, Hoehe, Checksum und pHash sagen nichts darueber aus, ob ein Bild als
Wohnzimmer, Kueche, CTA oder Motion-Shot geeignet ist.
