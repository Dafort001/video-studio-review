# Handover Intermediate Check - Phase 03 to Phase 06

Stand: 2026-07-01

## Ziel

Zwischenpruefung nach Phase 6 anhand des DOCX:

```text
/Users/danielfortmann/Desktop/video auftrag codex/pixcapture_codex_phase_plan/Codex-Zwischenprüfung- PixCapture AI Video Pipeline nach Phase 6.docx
```

Geprueft wurden Phase 3 bis Phase 6, bevor Phase 7 Motion Candidates starten
darf.

## Entscheidung

```text
READY_FOR_PHASE_7 = true
```

Begruendung:

- Recognition-Quellen sind maschinenlesbar getrennt.
- `filename_heuristic` gilt nicht als echte visuelle Recognition.
- `mock` kann keine echten Shotplan-Shots mehr befuellen.
- `unknown` und `needs_manual_review` werden im Planning Gate abgewiesen.
- Low-Reliability wird nur mit expliziter Sonderfreigabe genutzt und bleibt
  `pipeline_test_only`.
- Manuelle Korrekturen bleiben ohne Force geschuetzt.
- `--force-recognition` darf manuelle Korrekturen jetzt bewusst
  ueberschreiben.
- Reports zeigen Recognition- und Planning-Gate-Qualitaet.
- Es wurden keine Originalbilder veraendert, keine externen APIs gestartet,
  keine DA3/SAM3-Jobs gestartet und kein Rendering ausgefuehrt.

## Kleine Korrekturen in dieser Pruefung

### 1. `--force-recognition` fuer manuelle Daten

Vorher:

- Vorhandene manuelle Recognition wurde nur mit `--force` ueberschrieben.
- Das DOCX erlaubt bewusstes Ueberschreiben mit `--force` oder
  `--force-recognition`.

Jetzt:

- `--force-recognition true` laesst den Recognition-Backend-Lauf bewusst
  schreiben.
- Ohne Force bleibt manuelle Recognition unveraendert.
- Log-/Warntext nennt jetzt `--force` und `--force-recognition`.

Datei:

- `internal/motion-lab/server/batchCli.mjs`

### 2. CLI-Hilfe

Vorher:

- Help-Ausgabe nannte nicht alle relevanten Audit-Optionen/Backends sichtbar.

Jetzt:

- `custom_vision` ist in der Recognition-Support-Zeile genannt.
- `--force`, `--force-recognition`, `--manual-json`, `--only-object`,
  `--require-real-recognition` und `--allow-low-reliability` sind in der
  Hilfe sichtbar.
- `planning_quality` und `planning_gate` werden als Report-Inhalt genannt.

Datei:

- `internal/motion-lab/server/batchCli.mjs`

## Gepruefte Dateien

- `internal/motion-lab/server/recognition/types.ts`
- `internal/motion-lab/server/recognition/filenameHeuristicRecognitionBackend.ts`
- `internal/motion-lab/server/recognition/manualJsonRecognitionBackend.ts`
- `internal/motion-lab/server/recognition/existingMetadataRecognitionBackend.ts`
- `internal/motion-lab/server/recognition/qwenVlRecognitionBackend.ts`
- `internal/motion-lab/server/recognition/openaiVisionRecognitionBackend.ts`
- `internal/motion-lab/server/recognition/visionAdapter.ts`
- `internal/motion-lab/server/planning/shotplan.ts`
- `internal/motion-lab/server/batchCli.mjs`
- `internal/motion-lab/server/buildSemanticProfilesCli.mjs`
- `config/video-motion/image_recognition.v01.schema.json`
- `config/video-motion/image_semantic_profile.v01.schema.json`
- `docs/video-motion/_handover_phase_03_recognition_sources.md`
- `docs/video-motion/_handover_phase_04_real_vision_backend.md`
- `docs/video-motion/_handover_phase_05_semantic_profiles.md`
- `docs/video-motion/_handover_phase_06_planning_gate.md`

## Testroots

```text
/tmp/pixcapture_phase3_6_audit
/tmp/pixcapture_phase3_6_neutral
/tmp/pixcapture_phase3_6_manual
```

Audit-Stichprobe:

```text
/tmp/pixcapture_phase3_6_audit/audit_sample.json
/tmp/pixcapture_phase3_6_audit/audit_sample.html
```

## Ausgefuehrte Befehle

### Syntax / Help

```sh
node --check internal/motion-lab/server/batchCli.mjs
node --check internal/motion-lab/server/planning/shotplan.ts
npm run motion-lab:recognize -- --help
npm run motion-lab:plan -- --help
npm run motion-lab:build-profiles -- --help
```

### Planning-Gate-Audit

```sh
npm run motion-lab:plan -- --root /tmp/pixcapture_phase3_6_audit --require-real-recognition true --variants fast_social_teaser
```

Der Gesamtbefehl endet mit Exit 1, weil sechs von zehn Objekten korrekt
blockiert werden. Das ist erwartetes Verhalten.

### Neutrale Dateinamen

```sh
npm run motion-lab:import -- --root /tmp/pixcapture_phase3_6_neutral --limit 1
npm run motion-lab:recognize -- --root /tmp/pixcapture_phase3_6_neutral --backend filename_heuristic --only-object objecta --force-recognition true
```

Ergebnis fuer `DSC_0001.jpg`:

```json
{
  "confirmed_room_type": "unknown",
  "needs_manual_review": true,
  "usable_for_video": false,
  "recognition_source": "filename_heuristic",
  "is_real_vision": false,
  "reliability_level": "low"
}
```

### Manuelle Korrektur geschuetzt

```sh
npm run motion-lab:import -- --root /tmp/pixcapture_phase3_6_manual --limit 1
npm run motion-lab:recognize -- --root /tmp/pixcapture_phase3_6_manual --backend manual_json --manual-json /tmp/pixcapture_phase3_6_manual/manual/manual_recognition.json --only-object objecta --force-recognition true
npm run motion-lab:recognize -- --root /tmp/pixcapture_phase3_6_manual --backend filename_heuristic --only-object objecta
npm run motion-lab:recognize -- --root /tmp/pixcapture_phase3_6_manual --backend filename_heuristic --only-object objecta --force-recognition true
```

Ergebnis:

- Ohne Force blieb `manual_json / bathroom / manual_override=true` erhalten.
- Mit `--force-recognition true` wurde bewusst durch
  `filename_heuristic / kitchen / manual_override=false` ueberschrieben.

### Unkonfigurierte echte Vision-Backends

```sh
env -u DASHSCOPE_API_KEY -u QWEN_API_KEY -u DASHSCOPE_BASE_URL -u QWEN_BASE_URL -u OPENAI_API_KEY -u OPENAI_VISION_MODEL npm run motion-lab:recognize -- --root /tmp/pixcapture_phase3_6_neutral --backend qwen_vl --only-object objecta --force-recognition true
env -u DASHSCOPE_API_KEY -u QWEN_API_KEY -u DASHSCOPE_BASE_URL -u QWEN_BASE_URL -u OPENAI_API_KEY -u OPENAI_VISION_MODEL npm run motion-lab:recognize -- --root /tmp/pixcapture_phase3_6_neutral --backend openai_vision --only-object objecta --force-recognition true
```

Ergebnis:

- `qwen_vl`: `ok=false`, `backend_status.configured=false`
- `openai_vision`: `ok=false`, `backend_status.configured=false`
- Kein Fallback auf Dateinamen-Heuristik.

### Idempotenz

Planning Gate wurde zweimal auf `/tmp/pixcapture_phase3_6_audit` ausgefuehrt.

Ergebnis:

```json
{
  "gate_decisions_stable": true,
  "object_count": 10
}
```

## Recognition-Quellen-Statistik

Synthetische Audit-Objekte:

| Kategorie | Ergebnis |
| --- | --- |
| `mock` | blockiert, keine Shots |
| `filename_heuristic` bekannter Raum | blockiert bei `--require-real-recognition true` |
| `filename_heuristic` neutraler Name | `unknown`, reviewpflichtig, keine Shots |
| `manual_json` | erlaubt, `quality_evaluation_allowed=true` |
| `qwen_vl` medium | erlaubt, `quality_evaluation_allowed=true` |
| `openai_vision` high | erlaubt, `quality_evaluation_allowed=true` |
| `qwen_vl` low | blockiert |
| `unknown` | blockiert |
| `needs_manual_review` | blockiert |
| `existing_metadata` medium | erlaubt, `quality_evaluation_allowed=true` |

## Planning-Gate-Statistik

Aus `/tmp/pixcapture_phase3_6_audit`:

```json
{
  "total_shotplans": 10,
  "total_shots": 4,
  "quality_evaluation_allowed": 4,
  "pipeline_test_only": 6,
  "real_recognition_used": 2,
  "manually_confirmed_used": 1,
  "existing_metadata_used": 1,
  "low_reliability_used": 0,
  "allow_low_reliability_used": 0,
  "rejected_images": 6,
  "unknown_images": 2,
  "low_reliability_images": 4,
  "mock_images": 1
}
```

Audit-Stichprobe:

```json
{
  "real_vision": 5,
  "manual_confirmed": 1,
  "filename_heuristic": 2,
  "mock": 1,
  "unknown": 2,
  "needs_manual_review": 3,
  "ready_for_planning": 4,
  "rejected": 6
}
```

## Review-Daten

Eine eigene UI wurde in dieser Pruefung nicht gebaut. Es existieren aber
pruefbare JSON-/HTML-Daten:

- `planning_quality` im CLI-Report
- `planning_gate` pro Shotplan
- `rejected_images` pro Shotplan
- `audit_sample.json`
- `audit_sample.html`
- Phase-5-Profile und Reports

Diese Daten zeigen pro Bild:

- Dateiname / Pfad
- `confirmed_room_type`
- `recognition_source`
- `recognition_backend`
- `is_real_vision`
- `is_mock`
- `is_manual`
- `reliability_level`
- `usable_for_video`
- `needs_manual_review`
- Tags
- Scores
- Freigabe- oder Ausschlussgrund

## Bekannte Grenzen

- Die Auditdaten sind synthetische Fixtures, keine grosse reale Bildmenge.
- Echte Vision wurde nicht live aufgerufen.
- Kein finaler Proof-/Render-Lauf wurde gestartet.
- Phase 5 CV-Heuristiken bleiben einfache Proxies.
- Die Review-Ausgabe ist Datei-/Report-basiert, keine fertige UI.

## Offene Punkte fuer Phase 7

- Motion Candidates duerfen nur auf `quality_evaluation_allowed=true` oder
  bewusst manuell freigegebenen Review-Daten aufsetzen.
- Filename-Heuristik darf nur Proof-of-Motion / technische Sichtpruefung
  speisen und muss sichtbar `pipeline_test_only` bleiben.
- Keine Renderer-/Video-Arbeit aus Phase 7 ableiten, bevor Motion Candidates
  separat auditiert sind.

## Nicht Getan

- Keine Originalbilder veraendert, verschoben oder umbenannt.
- Keine Analyseartefakte in Originalordner geschrieben.
- Keine externen Vision-APIs gestartet.
- Keine DA3-/SAM3-Jobs gestartet.
- Keine finale Videoerzeugung gestartet.
- Keine Motion-Regeln aus Mock-Daten abgeleitet.
