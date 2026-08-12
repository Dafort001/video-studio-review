# Video Motion Library

Dieses Verzeichnis beschreibt die entstehende Video-Motion-Library fuer
Pix.immo. Die Library ist als Nebenstelle zur bestehenden Objektvideo-Pipeline
gedacht und soll spaeter auch fuer PixCapture Backend und die Swift App nutzbar
werden.

Der aktuelle verbindliche Plan liegt in:

- `docs/video-motion/MASTERPLAN.md`

## Ziel

Ziel ist moderner Social-Property-Content aus Immobilienbildern: kurze,
rhythmische Clips mit klarer Typografie, Bewegung, Stimmung, Hook, Highlights,
optionalem Presenter oder Avatar und sauberem CTA.

Nicht-Ziel ist ein klassischer, langer Objekt-Rundgang, der alle Raeume
vollstaendig und sachlich abarbeitet.

## Arbeitsregel

Die Library wird strikt in kleinen Sessions aufgebaut. Jede Session darf nur
ihren eigenen Scope umsetzen und muss am Ende ein Handover in diesem Verzeichnis
schreiben.

Session 1 erstellt nur die Grundbegriffe, Architektur und Versionierungsregeln.
Sie erstellt keine Motion-Presets, keinen Produktkatalog, keine Qwen-API und
keinen produktiven Code.

## Session-1-Dateien

- `00_overview.md`
- `01_glossary.md`
- `02_architecture.md`
- `03_versioning_and_feature_flags.md`
- `_handover_session_1.md`

