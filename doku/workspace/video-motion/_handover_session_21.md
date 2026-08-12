# Handover Session 21

## Was wurde erstellt?

Session 21 hat Mock-faehige Adapter-Interfaces fuer das interne Motion Lab
definiert.

Neu erstellt:

- `internal/motion-lab/adapters/types.ts`
- `internal/motion-lab/adapters/qwenAdapter.ts`
- `internal/motion-lab/adapters/heygenAdapter.ts`
- `internal/motion-lab/adapters/storageAdapter.ts`
- `internal/motion-lab/adapters/renderAdapter.ts`
- `internal/motion-lab/adapters/metadataAdapter.ts`
- `docs/video-motion/_handover_session_21.md`

## Welche Dateien wurden geaendert?

Session-21-eigene neue Dateien:

- `internal/motion-lab/adapters/types.ts`
- `internal/motion-lab/adapters/qwenAdapter.ts`
- `internal/motion-lab/adapters/heygenAdapter.ts`
- `internal/motion-lab/adapters/storageAdapter.ts`
- `internal/motion-lab/adapters/renderAdapter.ts`
- `internal/motion-lab/adapters/metadataAdapter.ts`
- `docs/video-motion/_handover_session_21.md`

Optional aktualisierte Working-Memory:

- `CODEX_WORKING_MEMORY_DO_NOT_TOUCH/video-motion-current.md`

## Welche Entscheidungen wurden getroffen?

- Adapter erzeugen `ExternalJobRecord`-aehnliche Audit-Records.
- Qwen und HeyGen arbeiten in Session 21 nur im Mock-Modus.
- Echte Qwen Calls werfen ab, wenn `qwen_enabled` nicht true und
  `qwen_mock_mode` nicht false ist.
- Echte HeyGen/Avatar Calls werfen ab, wenn `avatar_enabled` nicht true und
  `avatar_mock_mode` nicht false ist.
- Storage, Render und Metadata liefern nur geplante lokale/mock Pfade.
- Keine API Keys, keine Provider-SDKs und keine externen Calls wurden
  eingefuehrt.

## Was ist bewusst noch offen?

- Keine echten Qwen Calls.
- Keine echten HeyGen Calls.
- Keine echte Storage-Schreiblogik.
- Keine echte Render-Engine.
- Keine Metadata-Extraktion aus Bilddateien.
- Keine Server-Routen.
- Keine UI.
- Keine Persistenz von ExternalJob Records.

## Was soll die nächste Session tun?

Session 22 soll ausschliesslich Asset Library vorbereiten:

- `internal/motion-lab/client/AssetLibrary.*`
- `internal/motion-lab/server/assets.*`
- `internal/motion-lab/storage/test-assets/`
- `docs/video-motion/_handover_session_22.md`

## Welche Dateien muss die nächste Session zuerst lesen?

```text
docs/video-motion/MASTERPLAN.md
docs/video-motion/PHASE2_INTERNAL_MOTION_LAB.md
docs/video-motion/_handover_session_21.md
```

## Externe Dienste / Adapterstatus

- Qwen: Mock Adapter vorhanden, keine echte Integration.
- HeyGen/Avatar: Mock Adapter vorhanden, keine echte Integration.
- Storage: Pfadplanungsadapter vorhanden, keine echte Schreiblogik.
- Render: Mock Preview Adapter vorhanden, keine echte Render-Engine.
- Metadata: Mock Metadata Adapter vorhanden, keine echte Bildanalyse.

## Risiken / Hinweise

- Adapter geben Audit-Records zurueck, speichern sie aber noch nicht.
- Die spaetere Server-Schicht muss Request/Response-Payloads wirklich
  persistieren.
- Mock-Pfade sind Planungswerte, keine existierenden Dateien.
- `projects/piximmo-web` enthaelt weiterhin unrelated Dirty-State und wurde in
  Session 21 nicht angefasst.

## Validierung

Durchgefuehrt am 2026-06-29:

- `node --check internal/motion-lab/adapters/types.ts`: ok.
- `node --check internal/motion-lab/adapters/qwenAdapter.ts`: ok.
- `node --check internal/motion-lab/adapters/heygenAdapter.ts`: ok.
- `node --check internal/motion-lab/adapters/storageAdapter.ts`: ok.
- `node --check internal/motion-lab/adapters/renderAdapter.ts`: ok.
- `node --check internal/motion-lab/adapters/metadataAdapter.ts`: ok.
- Strukturcheck: keine API Keys, Secrets, `process.env`, `fetch`, `axios`,
  `Authorization` oder `Bearer`-Muster in Adapterdateien: ok.
- Strukturcheck: keine Server-, UI- oder Public-Route-Dateien angelegt: ok.
