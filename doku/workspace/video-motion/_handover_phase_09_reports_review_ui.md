# Handover Phase 9 - Reports, Contact Sheets, Review UI

Datum: 2026-07-01

## Ergebnis

Phase 9 erweitert die Pruefbarkeit der Pipeline vor echten
Videoentscheidungen.

Umgesetzt:

- Erweiterte `batch_report.json` / `batch_report.html`
- Erweiterte `proof_report.json` / `proof_report.html`
- Neues CLI: `npm run motion-lab:review-reports`
- Neue statische Review-UI: `review_ui.html`
- Neue Contact-Sheets: `contact_sheets/*.html`

## Geaenderte Dateien

- `internal/motion-lab/server/reports/batchReports.ts`
- `internal/motion-lab/server/reviewReportsCli.mjs`
- `package.json`

## Batch-/Proof-Reports

Die vorhandenen Batch-/Proof-Reports zeigen jetzt pro Objekt:

- Anzahl Bilder insgesamt
- `real_vision`
- `manual_confirmed`
- `filename_heuristic`
- `mock`
- `unknown`
- `needs_manual_review`
- `ready_for_planning`
- rejected wegen fehlender verlaesslicher Recognition

Pro Shotplan werden sichtbar:

- ob echte Recognition genutzt wurde
- ob `--allow-low-reliability` verwendet wurde
- ob es eine echte Qualitaetsbewertung oder nur technischer Test ist
- low-reliability Bilder
- unknown Bilder
- rejected Bilder inklusive Grund

## Review Reports CLI

Beispiel:

```bash
npm run motion-lab:review-reports -- \
  --profiles ./analysis/semantic_profiles \
  --motion-candidates ./analysis/motion_candidates \
  --modal-candidates ./analysis/modal_jobs \
  --out ./analysis/review_reports
```

Outputs:

- `review_report.json`
- `review_ui.html`
- `contact_sheets/index.html`
- `contact_sheets/room_type.html`
- `contact_sheets/video_role.html`
- `contact_sheets/motion_class.html`
- `contact_sheets/risk.html`
- `contact_sheets/needs_review.html`
- `contact_sheets/ready_for_planning.html`
- `contact_sheets/low_reliability.html`
- `contact_sheets/rejected.html`

## Review UI

Pro Bild werden angezeigt:

- `detected_room_type`
- `confirmed_room_type`
- `confidence`
- `recognition_source`
- `recognition_backend`
- `is_real_vision`
- `is_mock`
- `is_manual`
- `reliability_level`
- `needs_manual_review`
- `usable_for_video`
- `summary`
- Tags
- Scores
- empfohlene Motion
- verbotene Motion
- Begründung

Filter:

- `unknown`
- `needs_manual_review`
- `low_confidence`
- `not_real_vision`
- `filename_heuristic_only`
- `mock_only`
- `ready_for_planning`

## Klare Hinweise

Die Review UI zeigt explizit:

- `Dieses Bild wurde nur per Dateinamen-Heuristik erkannt.`
- `Dieses Bild wurde nicht visuell analysiert.`
- `Dieses Bild ist noch nicht bereit fuer echte Video-Planung.`
- `Dieses Bild wurde manuell bestaetigt.`
- `Dieses Bild wurde mit echtem Vision-Backend analysiert.`

## Harte Grenze

Phase 9 erzeugt nur statische Reports, Contact-Sheets und Review-HTML. Es wird
kein finales Rendering gestartet und keine externe API aufgerufen.

## Verifikation

Geprueft wurde:

- `node --check internal/motion-lab/server/reviewReportsCli.mjs`
- `npm run motion-lab:review-reports -- --help`
- synthetischer Review-Report-Lauf mit Phase-5-Profilen, Phase-7-Candidates und
  Phase-8-Modal-Candidates
- Pflichtoutputs und Contact-Sheet-Dateien vorhanden
- Batch-Report-Modul per Syntax-Import getestet

## Naechster Schritt

Phase 10 kann auf den Review-Reports aufsetzen. Vor echten Videoentscheidungen
sollte ein Mensch mindestens `review_ui.html` und die relevanten Contact-Sheets
pruefen.
