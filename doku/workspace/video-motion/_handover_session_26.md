# Handover Session 26

## Was wurde erstellt?

Session 26 hat den internen Qwen Test Runner vorbereitet.

Neu erstellt:

- `internal/motion-lab/client/QwenTestRunner.ts`
- `internal/motion-lab/server/qwenJobs.ts`
- `docs/video-motion/_handover_session_26.md`

## Welche Dateien wurden geaendert?

Session-26-eigene neue Dateien:

- `internal/motion-lab/client/QwenTestRunner.ts`
- `internal/motion-lab/server/qwenJobs.ts`
- `docs/video-motion/_handover_session_26.md`

## Welche Entscheidungen wurden getroffen?

- Der Runner bleibt ein internes TypeScript-Scaffold, keine gerenderte UI.
- Prompt, Negative Prompt und Request Payload werden sichtbar als Record-Felder
  gehalten.
- Mock Responses laufen ueber den bestehenden `prepareQwenImageEdit` Adapter
  aus Session 21.
- Echte Calls werden nur ueber den Adapterpfad versucht, wenn
  `qwen_enabled=true` und `qwen_mock_mode=false` gesetzt waeren. Da der echte
  Adapter weiterhin nicht implementiert ist, wird daraus ein sichtbarer
  Fehler-Record statt ein versteckter Provider-Zugriff.
- Ergebnisse, Output-Pfade und Fehler werden als `QwenJobRecord`
  serialisierbar gespeichert.
- Es gibt keine API Keys, keine `process.env`-Nutzung und keine direkte
  Netzwerklogik.

## Was ist bewusst noch offen?

- Keine echte UI-Komponente.
- Keine API-Route.
- Keine echte Qwen-Provider-Integration.
- Keine Datei-Persistenz fuer Request-/Response-Payloads.
- Keine Kosten-, Datenschutz- oder Provider-Freigabe.
- Keine Verbindung zu Render- oder Preview-Ausgabe ausser gespeicherten
  Mock-Pfaden.
- Keine Verbindung zur Typography Preview aus Session 27.

## Was soll die naechste Session tun?

Session 27 soll ausschliesslich die Typography Preview vorbereiten:

- `internal/motion-lab/client/TypographyPreview.*`
- `internal/motion-lab/server/typography.*`
- `docs/video-motion/_handover_session_27.md`

## Welche Dateien muss die naechste Session zuerst lesen?

```text
docs/video-motion/MASTERPLAN.md
docs/video-motion/PHASE2_INTERNAL_MOTION_LAB.md
docs/video-motion/_handover_session_26.md
config/video-motion/typography_presets.v01.json
config/video-motion/typography_rules.v01.json
```

## Externe Dienste / Adapterstatus

- Qwen: Mock-Runner vorbereitet; echter Adapter weiterhin nicht implementiert.
- HeyGen/Avatar: nicht betroffen.
- Storage: keine echte Persistenz; Qwen-Jobs bleiben serialisierbare Records.
- Render: nicht betroffen.
- Metadata: nicht betroffen.

## Risiken / Hinweise

- `canRunReal` bleibt im Client-ViewModel bewusst `false`, weil Session 26
  keine echte Provider-Freigabe oder Adapter-Implementierung liefert.
- Request-/Response-Pfade sind geplante Speicherpfade, keine geschriebenen
  Dateien.
- `projects/piximmo-web` enthaelt weiterhin unrelated Dirty-State und wurde in
  Session 26 nicht angefasst.

## Validierung

Durchgefuehrt am 2026-06-29:

- `node --check internal/motion-lab/server/qwenJobs.ts`: ok.
- `node --check internal/motion-lab/client/QwenTestRunner.ts`: ok.
- Import-Smoke-Test fuer `buildQwenJobDraft` und `runQwenJob`: ok.
- Mock-Run erzeugt Status `mocked` mit 1 Output-Pfad.
- Real-Mode ohne `qwen_enabled=true` erzeugt Status `blocked` mit
  sichtbarer Fehlermeldung.
- Strukturcheck: keine `fetch`- oder `process.env`-Nutzung in den neuen
  Code-Dateien: ok.
- Strukturcheck: keine Public UI, keine API-Route, keine echten Provider-Calls
  angelegt: ok.
- `git status --short`: nur Session-26-Dateien neu im Root; unrelated
  `projects/piximmo-web` bleibt dirty und wurde nicht angefasst.
