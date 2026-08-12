# Audit Checklist v0.1

## Masterplan-Fragen

- [x] Sind alle Motivklassen dokumentiert?
  - 17 Motivklassen liegen in `docs/video-motion/10_motif_classes.md` und
    `config/video-motion/motif_classes.v01.json`.
- [x] Gibt es zu jeder Motivklasse passende Presets?
  - Verifiziert: jede Motivklasse hat mindestens zwei Preset-Kandidaten.
- [x] Sind Qwen-riskante Presets klar markiert?
  - 8 QW-Presets sind `qwen_required: true` und bleiben reviewpflichtig.
- [x] Sind Micro-Takes getrennt von Hero-Takes?
  - Alle vier Take Types sind vorhanden: `micro_take`, `short_take`,
    `medium_take`, `hero_take`.
- [x] Gibt es JSON-Schemas?
  - Vorhanden fuer Motion Presets und Highlight Scoring.
- [x] Gibt es Tests?
  - `node --test tests/videoMotion/*.test.ts`: 9 Tests bestanden.
- [x] Gibt es Produktlogik?
  - 9 Product Templates in `config/video-motion/product_templates.v01.json`.
- [x] Gibt es Presenter-/Avatar-Logik?
  - Presenter-/Avatar-Layer, Compatibility Rules und Script-Segment-Typen sind
    vorhanden.
- [x] Gibt es Typografie- und Transition-Regeln?
  - Typography und Transition Libraries/Rules sind vorhanden.
- [x] Gibt es Anti-Boring-Regeln?
  - 12 Regeln in `config/video-motion/anti_boring_rules.v01.json`.
- [x] Gibt es Quality Gates?
  - 9 Gates in `config/video-motion/quality_gates.v01.json`.
- [x] Gibt es ein Handover fuer den naechsten Codex-Chat?
  - `docs/video-motion/90_handover.md` und
    `docs/video-motion/_handover_session_17.md`.

## Verifikation am 2026-06-29

Ausgefuehrt:

```text
node --test tests/videoMotion/*.test.ts
python3 -m json.tool config/video-motion/variant_generation_rules.v01.json
```

Zusaetzliche strukturelle Checks:

- Motivklassen gezaehlt.
- Preset-Abdeckung pro Motivklasse geprueft.
- QW-Preset-Liste geprueft.
- Product-Template-Referenzen der Varianten geprueft.
- Counts fuer Presets, Templates, Testcases, Varianten, Anti-Boring Rules und
  Quality Gates geprueft.

## Residuale Risiken

- Keine echten Bilder wurden getestet.
- Qwen-Testcases sind vorbereitet, aber `sample_status` bleibt
  `needs_real_image`.
- Motion-, Text-, Avatar- und Transition-Regeln sind noch keine gerenderte
  Produktwahrheit.
- Das lokale TypeScript-Modul liest JSON-Dateien direkt aus dem Workspace und
  ist noch nicht in ein Produktrepo eingebunden.
- Quality Gates sind noch nicht vollstaendig maschinell umgesetzt.

