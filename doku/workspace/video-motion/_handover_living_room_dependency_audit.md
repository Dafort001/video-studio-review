# Handover - Living Room Dependency Audit

Datum: 2026-07-01

## Ergebnis

Die lokale Umgebung ist fuer den Wohnzimmer-Subset-Test bereit.

```text
LIVING_ROOM_DEPENDENCIES_READY = true
```

Der naechste Schritt darf das Wohnzimmer-Subset aus bestehenden Qwen-/Catalog-
Daten erzeugen. Es wurden keine neuen Qwen-/Vision-Calls, keine Modal-Jobs,
keine DA3/SAM3-Verarbeitung, kein Rendering, keine Avatar-/HeyGen-Schritte und
keine Originalbild-Aenderungen gestartet.

## Systemprogramme

Vorhanden oder installiert:

- `node`: `v24.13.1`
- `npm`: `11.8.0`
- `python3`: `Python 3.14.3`
- `.venv` Python: `Python 3.14.3`
- `.venv` pip: `26.1.2`
- `git`: `2.50.1 (Apple Git-155)`
- `exiftool`: `13.49`
- `ffmpeg`: `8.1.2`
- `brew`: `6.0.6`
- `libomp`: `20.1.0`
- `imagemagick`: `7.1.2-26`

## Installiert / geaendert

System:

- `imagemagick` wurde per Homebrew installiert. Nach Daniels Korrektur ist es
  fuer diesen Wohnzimmer-Subset-Test nur optional und wird nicht primaer
  verwendet. Primaer bleiben Pillow/OpenCV/scikit-image.
- `ffmpeg` wurde nach dem Homebrew-Dependency-Update repariert/reinstalliert,
  weil der vorherige `ffmpeg 7.1.1_1` gegen eine entfernte `x265`-Library
  zeigte. Finaler Test: `ffmpeg version 8.1.2`.

Python:

- lokale `.venv` wurde im Repo-Root erstellt
- `.venv/` wurde lokal in `.git/info/exclude` aufgenommen, nicht in Git
- pip/wheel/setuptools wurden aktualisiert
- installiert wurden:
  - `pillow`
  - `opencv-python-headless`
  - `numpy`
  - `pandas`
  - `pyarrow`
  - `duckdb`
  - `pydantic`
  - `typer`
  - `rich`
  - `tqdm`
  - `scipy`
  - `scikit-image`
  - `imagehash`
  - `exifread`
  - `matplotlib`
  - `pyyaml`

Node:

- Im Root liegt `package.json`, aber kein Root-Lockfile.
- `npm ls --depth=0` zeigte keine installierten Root-Abhaengigkeiten.
- Es wurden keine Node-Pakete installiert.
- Es wurde kein Paketmanager-Mix eingefuehrt.

## Verifikation

Systemtool-Tests:

```text
exiftool -ver
magick -version
ffmpeg -version
```

Ergebnis:

- ExifTool funktioniert.
- ImageMagick funktioniert, bleibt aber optional fuer diesen Schritt.
- FFmpeg funktioniert wieder nach Reparatur.

Python-Importtest:

```text
python_full_imports_ok=true
living_room_dependency_check_ok=true
```

Importiert wurden erfolgreich:

- `PIL`
- `cv2`
- `numpy`
- `pandas`
- `pyarrow`
- `duckdb`
- `pydantic`
- `typer`
- `rich`
- `tqdm`
- `scipy`
- `skimage`
- `imagehash`
- `exifread`
- `matplotlib`
- `yaml`

Wichtige Versionen aus dem Importtest:

- `PIL 12.3.0`
- `cv2 4.13.0`
- `duckdb 1.5.4`
- `pandas 3.0.3`
- `pyarrow 24.0.0`

Motion-Lab-CLI-Checks:

```text
node --check internal/motion-lab/server/batchCli.mjs
node --check internal/motion-lab/server/buildSemanticProfilesCli.mjs
npm run motion-lab:recognize -- --help
npm run motion-lab:plan -- --help
npm run motion-lab:build-profiles -- --help
```

Ergebnis:

- Syntaxchecks liefen ohne Fehler.
- `motion-lab:recognize -- --help` funktioniert.
- `motion-lab:plan -- --help` funktioniert.
- `motion-lab:build-profiles -- --help` funktioniert.

## Bewusst nicht installiert / nicht gestartet

Nicht installiert:

- `rawpy`
- `sharp`
- `duckdb` fuer Node
- weitere Node-Report-/Template-Libraries
- `modal`
- `torch`
- `torchvision`
- `transformers`
- `accelerate`
- `safetensors`
- `huggingface_hub`
- HeyGen/Avatar-spezifische Pakete
- generative Video-API-Clients

Nicht gestartet:

- keine neuen Qwen-/DashScope-/OpenAI-Vision-Calls
- keine DA3-Verarbeitung
- keine SAM3-Verarbeitung
- keine Modal-Jobs
- kein Full-Batch-Rendering
- kein Avatar-Compositing
- keine Originalbild-Moves, -Deletes oder -Renames

## Wohnzimmer-Subset-Freigabe

Freigegeben ist jetzt nur der lokale Analyse-/Report-Schritt:

- bestehende Master-CSV lesen
- Wohnzimmer-Zeilen filtern
- vorhandene Qwen-/Alt-Text-/Recognition-Felder auswerten
- mit Pillow/OpenCV/scikit-image einfache lokale Metriken oder Thumbnails
  erzeugen
- JSONL/HTML/Contact-Sheet unter `analysis/living_room/` schreiben

Nicht freigegeben bleibt:

- neue Heuristik als Produktwahrheit
- Objektgruppen erzwingen
- Video erzeugen
- externe API nachziehen
- Analyseartefakte in Originalordner schreiben
