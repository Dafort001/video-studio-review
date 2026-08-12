# Handover Phase 02 - Qwen/Alt-Text Raw Import

Stand: 2026-07-01

## Ziel

Phase 2 bindet vorhandene Qwen-, Alt-Text- und Dateinamen-Rohdaten an den
Phase-1 Image Catalog an. Es wurde keine neue Qwen-Analyse gestartet, keine
externe API aufgerufen, keine Vision-Recognition ausgefuehrt und keine
Motion-/Shotplan-/Video-Entscheidung erzeugt.

Der Image Catalog bleibt read-only. Phase 2 schreibt nur separate
Analyseausgaben ausserhalb der Quellordner.

## Gefundene Datenquellen

Vorhandene Motion-Lab/Qwen-Struktur:

- `config/video-motion/image_recognition.v01.schema.json`
- `internal/motion-lab/server/recognition/types.ts`
- `internal/motion-lab/server/recognition/qwenVlRecognitionBackend.ts`
- Desktop-Testlauf:
  `/Users/danielfortmann/Desktop/11111_motion_lab_qwen_2026-06-29`
  - `work/11111/analysis/image_recognition.json`
  - `work/11111/analysis/image_metadata.json`
  - `image_recognition.json`: Backend `qwen_vl`, `8` Bilder,
    `is_mock=false`, `recognized_at=2026-06-29T18:43:24.039Z`
  - Der urspruengliche Desktop-Originalordner
    `/Users/danielfortmann/Desktop/11111` war beim Test dieser Phase nicht mehr
    vorhanden, daher wurde dieser Lauf nicht gegen echte Originale gematcht.

Vorhandene Dataset-Qwen-Struktur:

- `datasets/semantic-editing-direction-RAF-only-clean-2026-06-23/qwen_input_final_images.json`
- `datasets/semantic-editing-direction-RAF-only-clean-2026-06-23/qwen_semantic_final_images`
  - `166` Dateien `semantic_artifact_validated.json`
  - `166` Dateien `alt_text_payload.json`
  - `166` Dateien `qwen_raw.json`

Diese Quellen enthalten heterogene Datenformen:

- Motion-Lab `image_recognition.json` mit `images[]`, `asset_id`,
  normalisierten Dateinamen, Raumlabels, Tags und Summary.
- begleitendes `image_metadata.json` mit `filename_original`,
  `filename_normalized`, `source_path`, Groesse und Dimensionen.
- Semantic-Artifact-Dateien mit `room_type`, Struktur-/Objektlisten,
  `light_and_space.summary_de`, `alt_text_basis_de`, Privacy-/Risk-Flags.
- separate Alt-Text-Payloads mit `alt_text_basis_de`.

## Geaenderte Dateien

- `package.json`
  - Neuer Script-Eintrag: `motion-lab:import-qwen`
- `internal/motion-lab/server/importQwenCli.mjs`
  - Neuer read-only Import-CLI fuer vorhandene Qwen-/Alt-Text-Daten.
- `docs/video-motion/_handover_phase_02_qwen_import.md`
  - Diese Handover-Datei.

## CLI

Beispiel:

```sh
npm run motion-lab:import-qwen -- --catalog ./analysis/catalog/image_catalog.jsonl --qwen "/path/to/qwen_results" --out ./analysis/qwen_import --force
```

Optionen:

- `--catalog`
- `--qwen`
- `--alt-texts`
- `--out`
- `--limit`
- `--dry-run`
- `--force`
- `--match-strategy checksum|path|filename|auto`
- `--write-jsonl true|false`
- `--write-parquet true|false`

Aktueller Speicherentscheid:

- Phase 2 liest den Phase-1-JSONL-Katalog.
- DuckDB/Parquet werden weiterhin nicht geschrieben, weil im Root keine
  passende DuckDB-/Parquet-Abhaengigkeit vorhanden ist.
- `--write-parquet true` bricht absichtlich mit Hinweis ab.

## Matching-Strategie

Default: `--match-strategy auto`

Reihenfolge:

1. `checksum`
   - exakte `checksum_sha256`, falls vorhanden.
2. `path`
   - normalisierter `original_path` oder `relative_path`.
3. `filename`
   - `filename + file_size_bytes + width + height`, falls vollstaendig.
   - fuer normalisierte Motion-Lab-Dateien zusaetzlich sicherer
     Dateiname-Index, der Mehrfachtreffer als ambiguous meldet.
4. `folder_filename`
   - Dateiname innerhalb desselben relativen Ordners.
   - zusaetzlich Objektordner-Basename + Dateiname, damit temporaere
     Motion-Lab-Runs mit `image_metadata.filename_original` gegen frisch
     katalogisierte Originalordner matchen koennen.

Wenn mehrere Kandidaten passen:

- keine automatische Zuordnung,
- Ausgabe in `ambiguous_matches.jsonl`.

Wenn kein Kandidat passt:

- Ausgabe in `unmatched_qwen_records.jsonl`.

## Ausgabeorte

Default:

- `analysis/qwen_import/qwen_import_report.json`
- `analysis/qwen_import/qwen_import_report.html`
- `analysis/qwen_import/merged_semantic_raw.jsonl`
- `analysis/qwen_import/unmatched_qwen_records.jsonl`
- `analysis/qwen_import/ambiguous_matches.jsonl`

Der CLI verhindert, dass `--out` innerhalb der Qwen-/Alt-Text-Quellpfade liegt.

## Gefuellte Rohfelder

Pro katalogisiertem Bild in `merged_semantic_raw.jsonl`:

- `qwen_import_status`
- `qwen_import_error`
- `qwen_source_uri`
- `qwen_source_format`
- `qwen_raw`
- `qwen_room_label`
- `qwen_room_confidence`
- `qwen_scene_domain`
- `qwen_description`
- `qwen_alt_text`
- `qwen_object_tags_raw`
- `qwen_composition_tags_raw`
- `qwen_light_tags_raw`
- `filename_label`
- `filename_label_confidence`
- `existing_alt_text`
- `source_metadata`
- `semantic_raw_merged_at`
- `detected_room_type_raw`
- `secondary_room_types_raw`
- `description_short`
- `object_tags_raw`
- `composition_tags_raw`
- `light_tags_raw`
- `video_role_tags_raw`
- `motion_risk_tags_raw`

Wichtig:

- `filename_label` ist nur Rohquelle.
- Dateinamen-Heuristik wird nicht als `is_real_vision` markiert.
- Es wird kein finales `confirmed_room_type` erzeugt.
- Es wird kein `ImageSemanticProfile` finalisiert.

## Unterstuetzte Rohformate

- JSON
- JSONL
- einfache CSV-Dateien
- Motion-Lab `image_recognition.json` plus optionales Geschwisterfile
  `image_metadata.json`
- generische JSON-Arrays oder `{ "records": [...] }`
- einzelne Semantic-Artifact-/Alt-Text-JSON-Dateien

## Durchgefuehrte Tests

Syntax/CLI:

```sh
node --check internal/motion-lab/server/importQwenCli.mjs
npm run motion-lab:import-qwen -- --help
```

Kleiner Testkatalog aus Phase 1:

```sh
npm run motion-lab:catalog -- --root /tmp/pixcapture_phase2_source --out /tmp/pixcapture_phase2_analysis/catalog --report-out /tmp/pixcapture_phase2_analysis/reports --force-catalog
```

Import-Test mit `--limit 10`:

```sh
npm run motion-lab:import-qwen -- --catalog /tmp/pixcapture_phase2_analysis/catalog/image_catalog.jsonl --qwen /tmp/pixcapture_phase2_qwen --alt-texts /tmp/pixcapture_phase2_alt --out /tmp/pixcapture_phase2_out --force --limit 10
```

Ergebnis:

- `catalog_image_count=4`
- `semantic_source_record_count=4`
- `qwen_record_count=3`
- `alt_text_record_count=1`
- `matched_qwen_record_count=1`
- `matched_alt_text_record_count=1`
- `unmatched_qwen_record_count=1`
- `ambiguous_qwen_match_count=1`
- `images_with_filename_label_count=1`

Getestete Faelle:

- Import mit `--limit 10`
- neutraler Dateiname `DSC_0001.jpg`
- doppelter Dateiname `room.jpg` in zwei verschiedenen Ordnern
- fehlender Qwen-Datensatz / unmatched record
- Alt-Text-Import
- Dry-run ohne dauerhafte Ausgabe
- Schutz gegen Ausgabe innerhalb der Qwen-Quelle
- Originaldateien blieben unveraendert; `stat`-Zeitstempel der Testbilder
  blieben gleich.

Dry-run:

```sh
npm run motion-lab:import-qwen -- --catalog /tmp/pixcapture_phase2_analysis/catalog/image_catalog.jsonl --qwen /tmp/pixcapture_phase2_qwen --out /tmp/pixcapture_phase2_dry_run --dry-run true --limit 10
```

Ergebnis:

- Report nur auf stdout.
- `/tmp/pixcapture_phase2_dry_run` wurde nicht erstellt.

Quellpfad-Schutz:

```sh
npm run motion-lab:import-qwen -- --catalog /tmp/pixcapture_phase2_analysis/catalog/image_catalog.jsonl --qwen /tmp/pixcapture_phase2_qwen --out /tmp/pixcapture_phase2_qwen/import_inside --dry-run true
```

Ergebnis:

- Abbruch mit:
  `--out must be outside semantic source paths.`

## Bekannte Konflikte / Grenzen

- Der alte Desktop-Qwen-Lauf `11111_motion_lab_qwen_2026-06-29` ist vorhanden,
  aber der Originalordner `/Users/danielfortmann/Desktop/11111` war beim Test
  nicht mehr vorhanden. Deshalb wurde kein echter Matchlauf gegen diese
  Originale durchgefuehrt.
- Die Dataset-Quelle
  `semantic-editing-direction-RAF-only-clean-2026-06-23` enthaelt viele
  Semantic-Artefakte, aber die einzelnen Job-Dateien tragen nicht immer direkt
  einen eindeutigen Catalog-Pfad. Der Import dokumentiert solche Faelle als
  `unmatched` statt zu raten.
- Mehrere gleiche Dateinamen in verschiedenen Ordnern werden als
  `ambiguous_match` gespeichert.
- Qwen-/Alt-Text-Rohdaten werden gesammelt und normalisiert, aber noch nicht
  fachlich bewertet.

## Offene Punkte fuer Phase 3

- Entscheiden, ob die JSONL-Ergebnisse in DuckDB/Parquet gespiegelt werden
  sollen.
- Echte grosse Katalog-/Importlaeufe erst mit `--limit` testen.
- Mapping fuer Dataset-Jobordner verbessern, falls Phase 3 direkt auf dem
  alten Semantic-Dataset aufsetzen soll.
- Erst nach Review der Rohdaten ein echtes `ImageSemanticProfile` definieren.
- Keine Shotplans, Motion-Kandidaten, DA3/SAM-Jobs oder Videos aus diesen
  Rohdaten erzeugen, bevor Phase 3 explizit beauftragt ist.
