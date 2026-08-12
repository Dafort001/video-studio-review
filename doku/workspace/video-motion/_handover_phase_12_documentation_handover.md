# Handover Phase 12 - Documentation And MVP Handover

Datum: 2026-07-01

## Ergebnis

Phase 12 finalisiert die Dokumentation des Analyse-/Planungs-MVP, damit
spaetere Codex-Sitzungen ohne Chat-Kontext weiterarbeiten koennen.

Neu erstellt:

- `docs/video-motion/PIXCAPTURE_IMAGE_CATALOG.md`
- `docs/video-motion/SEMANTIC_PROFILE.md`
- `docs/video-motion/MOTION_CANON_V1.md`
- `docs/video-motion/_handover_phase_12_documentation_handover.md`

Aktualisiert:

- `docs/video-motion/REAL_ROOM_RECOGNITION.md`
- `docs/video-motion/_handover_real_room_recognition.md`

## Dokumentierte Pipeline

Die Docs beschreiben den aktuellen MVP-Pfad:

1. read-only Image Catalog
2. echte oder manuelle Room Recognition
3. ImageSemanticProfile
4. Planning Gate
5. Motion Candidates
6. Review Reports
7. Canon v1
8. Shotplan-Vorschlag

## Wichtigste Grenzen

Phase 12 beendet nur die Analyse-/Planungsdokumentation.

Nicht gestartet und nicht freigegeben:

- finale Videoerzeugung
- Avatar-Compositing
- generative Video-API
- externe API-Laeufe
- Modal-Submits
- DA3/SAM3-Ausfuehrung
- 50-Ordner-Batches ohne echte Recognition oder manuelle Bestaetigung

## Anerkannte aktuelle Wahrheit

- `qwen_vl` hat einen kleinen Live-Nachweis vom 2026-06-29.
- `openai_vision` hat einen Adapter, aber keinen dokumentierten Live-Erfolg in
  dieser Arbeitslinie.
- `filename_heuristic` ist keine echte Recognition.
- `mock` ist nur technischer Platzhalter.
- Canon v1 ist `draft_reference_derived` und
  `approved_for_production=false`.
- Phase 11 erzeugt nur `shotplan.json` und `shotplan.html` als
  Audit-Vorschlag.

## Verifikation

Geprueft wurde:

```text
node --check internal/motion-lab/server/buildShotplanCli.mjs
npm run motion-lab:build-shotplan -- --help
git diff --check
```

Zusaetzlich wurde geprueft, dass die Handover-Kette fuer Phasen 1 bis 12
vorhanden ist.

## Naechster Schritt

Phase 13 darf nur auf dieser dokumentierten Grundlage weiterarbeiten. Wenn sie
Preview-, Render-, Avatar-, Provider- oder Batch-Schritte beruehrt, muss der
Auftrag diese Grenze ausdruecklich oeffnen. Andernfalls bleibt der naechste
Schritt planning-/audit-only.
