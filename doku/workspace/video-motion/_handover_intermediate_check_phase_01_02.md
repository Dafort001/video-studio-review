# Handover Intermediate Check - Phase 01 + 02

Stand: 2026-07-01

## Ziel der Pruefung

Geprueft wurde, ob Phase 1 Image Catalog und Phase 2 Qwen-/Alt-Text-Rohimport
sauber genug sind, bevor Recognition-Quellen, echte Vision-Erkennung,
Motion-Regeln oder Shotplans weitergefuehrt werden.

Diese Zwischenpruefung hat keine neuen Pipeline-Features implementiert.
Erzeugt wurde nur diese Handover-Datei.

## Gepruefte Dateien

- `internal/motion-lab/server/catalogCli.mjs`
- `internal/motion-lab/server/importQwenCli.mjs`
- `package.json`
- `docs/video-motion/_handover_phase_01_catalog.md`
- `docs/video-motion/_handover_phase_02_qwen_import.md`

Syntaxchecks:

```sh
node --check internal/motion-lab/server/catalogCli.mjs
node --check internal/motion-lab/server/importQwenCli.mjs
```

Ergebnis: beide ok.

## Audit-Fixture

Kleiner temporaerer Testordner:

```text
/tmp/pixcapture_intermediate_check_src
```

Enthalten:

- `kitchen_01.jpg`
- `DSC_0001.jpg`
- `living_01.png`
- `objectA/room.jpg`
- `objectB/room.jpg`
- `broken.jpg` als absichtlich defekte Datei

Qwen-/Alt-Text-Testquellen:

```text
/tmp/pixcapture_intermediate_check_qwen/qwen_records.json
/tmp/pixcapture_intermediate_check_alt/alt_records.json
```

Analyseausgaben lagen ausserhalb des Originalordners:

```text
/tmp/pixcapture_intermediate_check_analysis
```

## Ausgefuehrte Befehle

Catalog Run 1:

```sh
npm run motion-lab:catalog -- --root /tmp/pixcapture_intermediate_check_src --out /tmp/pixcapture_intermediate_check_analysis/run1/catalog --report-out /tmp/pixcapture_intermediate_check_analysis/run1/reports --force-catalog
```

Catalog Run 2 fuer Idempotenz:

```sh
npm run motion-lab:catalog -- --root /tmp/pixcapture_intermediate_check_src --out /tmp/pixcapture_intermediate_check_analysis/run2/catalog --report-out /tmp/pixcapture_intermediate_check_analysis/run2/reports --force-catalog
```

Qwen-/Alt-Text-Import:

```sh
npm run motion-lab:import-qwen -- --catalog /tmp/pixcapture_intermediate_check_analysis/run1/catalog/image_catalog.jsonl --qwen /tmp/pixcapture_intermediate_check_qwen --alt-texts /tmp/pixcapture_intermediate_check_alt --out /tmp/pixcapture_intermediate_check_analysis/run1/qwen_import --force --limit 20
```

Ueberschreibschutz:

```sh
npm run motion-lab:import-qwen -- --catalog /tmp/pixcapture_intermediate_check_analysis/run1/catalog/image_catalog.jsonl --qwen /tmp/pixcapture_intermediate_check_qwen --alt-texts /tmp/pixcapture_intermediate_check_alt --out /tmp/pixcapture_intermediate_check_analysis/run1/qwen_import --limit 20
```

Ergebnis: Abbruch wie erwartet, weil Outputs existieren und `--force` fehlt.

Originalordner-Schutz:

```sh
npm run motion-lab:catalog -- --root /tmp/pixcapture_intermediate_check_src --out /tmp/pixcapture_intermediate_check_src/analysis --dry-run true
```

Ergebnis: Abbruch wie erwartet:

```text
--out must be outside --root so analysis artifacts are never written into original folders.
```

## Erzeugte Audit-Dateien

```text
/tmp/pixcapture_intermediate_check_analysis/run1/catalog/image_catalog.jsonl
/tmp/pixcapture_intermediate_check_analysis/run1/reports/catalog_report.json
/tmp/pixcapture_intermediate_check_analysis/run1/reports/catalog_report.html
/tmp/pixcapture_intermediate_check_analysis/run1/qwen_import/qwen_import_report.json
/tmp/pixcapture_intermediate_check_analysis/run1/qwen_import/qwen_import_report.html
/tmp/pixcapture_intermediate_check_analysis/run1/qwen_import/merged_semantic_raw.jsonl
/tmp/pixcapture_intermediate_check_analysis/run1/qwen_import/unmatched_qwen_records.jsonl
/tmp/pixcapture_intermediate_check_analysis/run1/qwen_import/ambiguous_matches.jsonl
/tmp/pixcapture_intermediate_check_analysis/run2/catalog/image_catalog.jsonl
/tmp/pixcapture_intermediate_check_analysis/run2/reports/catalog_report.json
/tmp/pixcapture_intermediate_check_analysis/run2/reports/catalog_report.html
```

Keine dieser Dateien lag im Originalordner.

## Pruefung 1 - Catalog-Integritaet

Statistik aus dem Audit:

- katalogisierte Bilder: `6`
- fehlgeschlagene Bilder: `1`
- fehlende Originalpfade: `0`
- doppelte `image_id`: `0`
- doppelte Checksum-Gruppen: `0`
- Near-Duplicate-Gruppen via pHash: `1`
- Orientation:
  - `landscape`: `1`
  - `portrait`: `1`
  - `square`: `3`
  - `unknown`: `1`
- Dateitypen:
  - `jpg`: `5`
  - `png`: `1`

Validierung:

- `image_id` eindeutig.
- `original_path` existierte fuer alle sechs Testeintraege.
- `checksum_sha256` vorhanden.
- Erfolgreich gelesene Bilder hatten plausible `width`/`height`.
- `orientation` war nur `landscape`, `portrait`, `square` oder `unknown`.
- Keine leeren Pflichtfelder bei erfolgreich gelesenen Bildern.
- Das defekte Bild wurde als `read_error` / `failed_files` geloggt, ohne den
  Lauf abzubrechen.

## Pruefung 2 - Read-only-Sicherheit

Geprueft:

- Anzahl Originalbilder vor/nach blieb gleich.
- Ordnerstruktur blieb:
  - `/tmp/pixcapture_intermediate_check_src`
  - `/tmp/pixcapture_intermediate_check_src/objectA`
  - `/tmp/pixcapture_intermediate_check_src/objectB`
- Keine Analyse-Dateien im Originalordner gefunden fuer:
  - `*.json`
  - `*.jsonl`
  - `*.parquet`
  - `*.duckdb`
  - `*.html`
  - `*_analysis*`
  - `*_profile*`
  - `*_recognition*`
  - `*_qwen*`
- `stat`-Zeitstempel der Testbilder blieben unveraendert.
- Keine Originaldateien wurden verschoben, umbenannt oder geloescht.

Kritischer Fehler: keiner gefunden.

## Pruefung 3 - Qwen-/Alt-Text-Import

Statistik:

- Katalogbilder insgesamt: `6`
- Semantic-Source-Records: `6`
- Qwen-Records: `4`
- Alt-Text-Records: `2`
- gemappte Qwen-Records: `2`
- gemappte Alt-Text-Records: `2`
- unmatched Qwen-Records: `1`
- ambiguous Qwen-Matches: `1`
- Bilder mit Alt-Text: `2`
- Bilder mit Qwen-Beschreibung: `2`
- Bilder mit `filename_label`: `2`
- Bilder ohne semantische Daten: `3`

Validierung:

- Qwen-Daten wurden nur aus vorhandenen Testquellen importiert.
- Fehlende Qwen-Daten wurden als unmatched geloggt.
- Mehrdeutiger Dateiname `room.jpg` in zwei Ordnern wurde als
  `ambiguous_match` geloggt und nicht automatisch zugeordnet.
- Alt-Texte wurden als eigene Quelle gespeichert.
- Dateinamen-Bezeichnungen wurden nur als `filename_label` gespeichert.

## Pruefung 4 - Keine falsche Recognition

Geprueft in den Phase-2-Ausgaben:

- Kein `confirmed_room_type` aus Dateinamen.
- Kein `is_real_vision=true` aus Dateinamen.
- Keine Motion-Kandidaten.
- Keine Shotplans.
- Keine DA3-/SAM3-Jobs.
- Kein Video-Rendering.
- Kein externer API-Aufruf.

Einziger Treffer bei Suche nach Motion/Shotplan/DA3/SAM war eine Report-Notiz,
die genau festhaelt, dass diese Dinge nicht erzeugt werden.

Architekturabweichung: keine gefunden.

## Pruefung 5 - Audit-Stichprobe

Das Fixture enthaelt weniger als zehn Eintraege pro Kategorie; deshalb wurden
alle verfuegbaren Eintraege der jeweiligen Kategorie verwendet.

Beispiele mit Qwen-Daten:

| filename | qwen_room_label | qwen_description | filename_label | status |
| --- | --- | --- | --- | --- |
| `kitchen_01.jpg` | `kitchen` | `Bright kitchen view` | `kitchen` | `matched` |
| `living_01.png` | `living` | `Small living area` | `living` | `matched` |

Beispiele mit Alt-Text:

| filename | existing_alt_text | filename_label | status |
| --- | --- | --- | --- |
| `DSC_0001.jpg` | `Neutral filename image with existing alt text.` | `unknown` | `matched` |
| `kitchen_01.jpg` | `Kitchen alt text.` | `kitchen` | `matched` |

Neutrale Dateinamen / ohne sichere semantische Zuordnung:

| filename | original_path | filename_label | status |
| --- | --- | --- | --- |
| `DSC_0001.jpg` | `/tmp/pixcapture_intermediate_check_src/DSC_0001.jpg` | `unknown` | `matched via alt-text` |
| `room.jpg` | `/tmp/pixcapture_intermediate_check_src/objectA/room.jpg` | `unknown` | `no_qwen_data` |
| `room.jpg` | `/tmp/pixcapture_intermediate_check_src/objectB/room.jpg` | `unknown` | `no_qwen_data` |

Importfehler / Konflikte:

- `missing.jpg`: unmatched Qwen record.
- `room.jpg`: ambiguous Qwen match mit zwei Kandidaten.
- `broken.jpg`: Catalog-Lesefehler `Invalid JPEG header.`

## Pruefung 6 - Idempotenz

Catalog:

- Zwei getrennte Laeufe auf demselben Testordner erzeugten dieselben
  `relative_path` -> `image_id` Paare.
- `image_id` ist stabil, solange Pfad und Checksum gleich bleiben.
- Keine doppelten Katalogeintraege innerhalb eines Laufs.

Import:

- Zweiter Import in denselben Output ohne `--force` wurde abgelehnt.
- Bestehende importierte Daten werden also nicht stillschweigend
  ueberschrieben.

Nicht getestet:

- Manuelle spaetere Korrekturfelder, weil Phase 1/2 noch keine solche
  Korrekturschicht schreibt.

## Pruefung 7 - Speicherorte

Aktuelle erwartete Struktur:

- `analysis/catalog/`
- `analysis/reports/`
- `analysis/qwen_import/`

Im Audit wurden aequivalente `/tmp/.../analysis/...`-Pfade genutzt.

Nicht vorhanden / noch nicht genutzt:

- `analysis/qwen_raw/`
- `analysis/semantic_profiles/`
- `analysis/contact_sheets/`
- `analysis/import_logs/`

Das ist fuer Phase 1/2 akzeptabel, weil noch kein finales Semantic-Profil,
keine Contact Sheets und keine groessere Import-Log-Schicht implementiert
wurde.

## Pruefung 8 - Handover-Dateien

Vorhanden:

- `docs/video-motion/_handover_phase_01_catalog.md`
- `docs/video-motion/_handover_phase_02_qwen_import.md`

Neu erstellt:

- `docs/video-motion/_handover_intermediate_check_phase_01_02.md`

## Phase-3-Freigabe

Freigabe: bedingt ja.

Phase 3 darf als naechster kleiner, kontrollierter Schritt geplant werden, wenn
sie auf den erzeugten Rohdaten aufsetzt und weiterhin keine stillschweigende
Recognition-/Motion-Vermischung einbaut.

Nicht freigegeben:

- voller Festplattenlauf ohne vorherigen `--limit`-Echtlauf,
- externe Vision-API,
- automatische Motion-Kandidaten,
- Shotplans,
- DA3/SAM,
- Video-Rendering.

Empfohlener naechster Schritt:

1. Einen echten kleinen Ordner mit `--limit` katalogisieren.
2. Falls passende vorhandene Qwen-/Alt-Text-Daten existieren, Import dagegen
   laufen lassen.
3. Den Report manuell pruefen.
4. Erst danach Phase 3 fuer ein echtes `ImageSemanticProfile` entwerfen.

## Offene Punkte

- Full-disk-Read-only-Sicherheit wurde in dieser Zwischenpruefung nicht auf
  externen Festplatten verifiziert, sondern auf einem kontrollierten Fixture.
- Der alte Desktop-Originalordner `11111` war beim Phase-2-Test nicht mehr
  vorhanden; dessen Qwen-Lauf konnte deshalb nicht real gegen Originalbilder
  rematched werden.
- DuckDB/Parquet bleiben bewusst offen, weil im Root keine passende Dependency
  vorhanden ist.
