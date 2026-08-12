# Handover Phase 8 - Modal DA3/SAM3 Candidates

Datum: 2026-07-01

## Ergebnis

Phase 8 ist als Offline-Worker-Kandidatenstufe umgesetzt.

Neue CLIs:

- `npm run motion-lab:build-modal-queues`
- `npm run motion-lab:import-modal-results`

Neue Dateien:

- `internal/motion-lab/server/buildModalQueuesCli.mjs`
- `internal/motion-lab/server/importModalResultsCli.mjs`
- `config/video-motion/modal_worker_candidate.v01.schema.json`

## Harte Sicherheitsgrenzen

Phase 8 verschiebt keine PixCapture-Produktlogik nach Modal.

Die CLIs:

- installieren Modal nicht
- submitten keine Modal-Jobs
- starten keine DA3/SAM3-Jobs
- starten keinen Renderer
- rufen keine bezahlten APIs auf
- treffen keine finale Video- oder Produktentscheidung

`build-modal-queues` prueft nur lokal, ob ein bestehendes `modal` CLI vorhanden
ist. Diese Information wird als `modal_binding` in Report und Kandidaten
geschrieben. Die Queue-Dateien bleiben auch ohne Modal nutzbar.

## Build Modal Queues

Beispiel:

```bash
npm run motion-lab:build-modal-queues -- \
  --profiles ./analysis/semantic_profiles \
  --motion-candidates ./analysis/motion_candidates \
  --out ./analysis/modal_jobs
```

Outputs:

- `modal_worker_candidates.jsonl`
- `candidates/{image_id}.json`
- `da3_jobs.jsonl`
- `sam3_jobs.jsonl`
- `modal_queue_report.json`
- `modal_queue_report.html`

`da3_job_id` und `sam3_job_id` bleiben `null`, bis ein spaeterer,
ausdruecklicher Submit-Schritt echte externe Jobs startet. Fuer lokale
Warteschlangen gibt es `da3_queue_id` und `sam3_queue_id`.

## Import Modal Results

Beispiel:

```bash
npm run motion-lab:import-modal-results -- \
  --results ./analysis/modal_results \
  --profiles ./analysis/semantic_profiles \
  --modal-candidates ./analysis/modal_jobs \
  --out ./analysis/modal_results_import
```

Outputs:

- `modal_results_import.jsonl`
- `modal_results_import_report.json`
- `modal_results_import_report.html`

Der Import liest nur lokale Ergebnisdateien und fuehrt keine externen Jobs aus.
Er schreibt `product_decision=null`, damit PixCapture die finale Entscheidung
weiter selbst trifft.

## Felder

Pro Bild werden die Phase-8-Felder geschrieben:

- `da3_required`
- `da3_reason`
- `da3_status`
- `da3_job_id`
- `sam3_required`
- `sam3_reason`
- `sam3_status`
- `sam3_job_id`
- `sam3_concepts`
- `paid_escalation_required`
- `manual_review_required`

Zusaetzlich gibt es:

- `da3_queue_id`
- `sam3_queue_id`
- `fallback_without_modal`
- `modal_binding`
- `source_trace`

## Fallback Ohne Modal

Jeder Kandidat enthaelt `fallback_without_modal`.

Wenn DA3/SAM3 nicht laufen, bleibt die Pipeline nutzbar:

- geeignete Phase-7-Kandidaten koennen ohne Modal weiterlaufen
- blockierte oder unklare Bilder bleiben in manueller Pruefung
- Modal-Ergebnisse duerfen spaeter importiert werden, ohne Produktentscheidungen
  zu ueberschreiben

## Verifikation

Geprueft wurde:

- `node --check internal/motion-lab/server/buildModalQueuesCli.mjs`
- `node --check internal/motion-lab/server/importModalResultsCli.mjs`
- JSON-Parse fuer `modal_worker_candidate.v01.schema.json`
- `npm run motion-lab:build-modal-queues -- --help`
- `npm run motion-lab:import-modal-results -- --help`
- synthetischer Queue-Lauf mit Phase-5-Profilen und Phase-7-Motion-Candidates
- synthetischer Result-Import mit lokalen DA3/SAM3-Ergebnisdateien

## Naechster Schritt

Ein spaeterer Submit-Schritt darf nur nach ausdruecklicher Freigabe entstehen.
Bis dahin sind `da3_jobs.jsonl` und `sam3_jobs.jsonl` reine lokale Queues.
