# Handover Phase 01 - Read-only Image Catalog

Stand: 2026-07-01

## Ziel

Phase 1 startet die PixCapture AI Video Pipeline mit einem sicheren,
read-only Bildkatalog. Es wurde keine Videoerzeugung, keine Recognition, keine
Motion-Regel, kein Qwen-/API-Aufruf und keine DA3-/SAM-Verarbeitung gestartet.

Originaldaten bleiben unveraendert. Der neue Catalog-CLI schreibt nur in
separate Analyseausgaben ausserhalb des gescannten `--root`.

## Vorhandenes Repo-Inventar

Vor der Implementierung geprueft:

- Motion-Lab-/Video-Pipeline-Dateien existieren bereits unter
  `docs/video-motion`, `config/video-motion`, `src/videoMotion` und
  `internal/motion-lab`.
- Vorhandene CLI-Befehle in `package.json`:
  - `motion-lab:doctor`
  - `motion-lab:import`
  - `motion-lab:recognize`
  - `motion-lab:plan`
  - `motion-lab:render`
  - `motion-lab:run`
  - `motion-lab:proof`
- Datenmodelle existieren bereits fuer Motion-Lab-Assets und Tests, unter
  anderem in:
  - `internal/motion-lab/server/assets.ts`
  - `config/video-motion/motion_lab_data_model.v01.json`
  - `config/video-motion/image_recognition.v01.schema.json`
- Speicherorte fuer Reports/Proofs existieren im bisherigen Batch-Root-Modell
  unter `reports`, `work`, `output` und `logs`. Ein Root-Ordner `analysis/`
  existierte vor Phase 1 noch nicht.
- Lokale Datenbank-/Parquet-Struktur fuer den neuen Image Catalog existierte
  nicht. DuckDB/Parquet wurden nicht eingefuehrt, weil in diesem Root aktuell
  keine DuckDB-CLI, kein DuckDB-npm-Paket und kein Parquet-Writer vorhanden
  sind. Phase 1 nutzt daher dependency-frei JSONL plus JSON/HTML-Report.

## Geaenderte Dateien

- `package.json`
  - Neuer Script-Eintrag:
    `motion-lab:catalog`
- `internal/motion-lab/server/catalogCli.mjs`
  - Neuer read-only Image-Catalog-CLI.
- `docs/video-motion/_handover_phase_01_catalog.md`
  - Diese Handover-Datei.

## CLI

Beispiel:

```sh
npm run motion-lab:catalog -- --root "/Volumes/NAME_DER_FESTPLATTE" --out ./analysis/catalog --dry-run false --force-catalog
```

Unterstuetzte Optionen:

- `--root`
- `--out`
- `--report-out`
- `--limit`
- `--dry-run`
- `--include-ext`
- `--force-catalog`

Sicherheitsregel:

- `--out` und `--report-out` muessen ausserhalb von `--root` liegen.
- `--force-catalog` ersetzt nur externe Analyseausgaben, niemals Originaldaten.

## Ausgabeorte

Standard im Repo-Root, wenn `--out` nicht gesetzt ist:

- `analysis/catalog/image_catalog.jsonl`
- `analysis/reports/catalog_report.json`
- `analysis/reports/catalog_report.html`

Nicht erzeugt in Phase 1:

- `analysis/catalog/image_catalog.duckdb`
- `analysis/catalog/image_catalog.parquet`

Grund: siehe Inventar oben. Keine neue Parallelarchitektur oder schwere
Dependency wurde fuer Phase 1 erzwungen.

## Catalog-Felder

Pro Bild wird mindestens geschrieben:

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

Zusaetzlich:

- `read_error`

Der `perceptual_hash` ist ein lokaler Average-Hash via `ffmpeg` auf 8x8
Graustufen-Pixeln, gespeichert als `ahash:<hex>`. Er ist nur ein
Near-Duplicate-Hinweis, keine visuelle Recognition.

## Unterstuetzte Bildtypen

Phase 1 katalogisiert:

- `jpg`
- `jpeg`
- `png`
- `tif`
- `tiff`
- `webp`

RAW/DNG wird nicht verarbeitet.

## Report-Inhalte

Der Report enthaelt:

- Anzahl gefundener Bilder
- Anzahl pro Dateityp
- Anzahl fehlerhaft gelesener Dateien
- Dubletten nach `checksum_sha256`
- moegliche Near-Duplicates nach `perceptual_hash`
- groesste Bilddimensionen
- kleinste Bilddimensionen
- Landscape / Portrait / Square / Unknown
- Beispielpfade
- Warnungen und `failed_files`

## Durchgefuehrte Tests

Syntax/CLI:

```sh
node --check internal/motion-lab/server/catalogCli.mjs
npm run motion-lab:catalog -- --help
```

Kleiner valider Testordner:

```sh
npm run motion-lab:catalog -- --root /tmp/pixcapture_catalog_phase1_valid --out /tmp/pixcapture_catalog_phase1_valid_output/catalog --report-out /tmp/pixcapture_catalog_phase1_valid_output/reports --limit 2 --force-catalog
```

Ergebnis:

- `ok=true`
- `status=completed`
- `image_count=2`
- `failed_file_count=0`
- JSONL, JSON-Report und HTML-Report wurden ausserhalb des Quellordners
  erzeugt.

Fehlerhafte Datei ohne Abbruch:

```sh
npm run motion-lab:catalog -- --root /tmp/pixcapture_catalog_phase1_source --out /tmp/pixcapture_catalog_phase1_output/catalog --report-out /tmp/pixcapture_catalog_phase1_output/reports --force-catalog
```

Ergebnis:

- `ok=true`
- `status=completed_with_read_errors`
- `image_count=3`
- `failed_file_count=1`
- kaputte JPG-Datei wurde in `failed_files` geloggt.

`--limit`:

```sh
npm run motion-lab:catalog -- --root /tmp/pixcapture_catalog_phase1_source --out /tmp/pixcapture_catalog_phase1_output/limit_catalog --report-out /tmp/pixcapture_catalog_phase1_output/limit_reports --limit 1 --force-catalog
```

Ergebnis:

- `image_count=1`
- Katalog und Reports wurden erzeugt.

Schutz gegen Analyseausgaben im Originalordner:

```sh
npm run motion-lab:catalog -- --root /tmp/pixcapture_catalog_phase1_source --out /tmp/pixcapture_catalog_phase1_source/analysis --dry-run true
```

Ergebnis:

- Abbruch mit Fehler:
  `--out must be outside --root so analysis artifacts are never written into original folders.`

Originaldateien:

- Test-Quellordner enthielt nach dem Lauf weiterhin nur die urspruenglichen
  drei Dateien.
- `stat`-Zeitstempel der Test-Quelldateien blieben unveraendert.

## Offene Punkte fuer Phase 2

- Erst nach Freigabe entscheiden, ob DuckDB/Parquet wirklich gebraucht wird.
- Erst nach stabilen echten Kataloglaeufen eine Datenbank- oder UI-Schicht
  planen.
- Keine Qwen-/Recognition-Imports aus dem Catalog ableiten, bevor die Phase-2-
  Regeln explizit beschlossen sind.
- Keine Motion-Regeln, Shotplans oder Video-Renderings aus Phase 1 starten.
- Fuer grosse externe Festplatten zuerst mit `--limit` testen und dann den
  vollstaendigen Kataloglauf bewusst starten.
