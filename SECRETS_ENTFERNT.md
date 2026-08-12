# Entfernte Secrets und Zugangsdaten

Die beiden Stände und die Dokumentation wurden vor dem Commit mit einer gezielten Mustersuche und zusätzlich mit `detect-secrets 1.5.0` geprüft. Gefundene fest eingetragene Zugangswerte, Test-Secrets und credential-artige Beispielwerte wurden durch die unten genannten Platzhalter ersetzt. Die Platzhalter stehen in Anführungszeichen, wo dies für gültigen Quellcode erforderlich ist.

- `doku/workspace/docs/VIDEO_STUDIO_CENTRAL_LAUNCH_CONTRACT.md`: `<ENTFERNT_TOKEN>`
- `doku/workspace/video-motion/_handover_phase_04_real_vision_backend.md`: `<ENTFERNT_API_KEY>`
- `doku/workspace/video-motion/_handover_qwen_vl_connection_2026-06-29.md`: `<ENTFERNT_API_KEY>`
- `doku/workspace/video-motion/_handover_real_room_recognition.md`: `<ENTFERNT_API_KEY>`
- `doku/workspace/video-motion/_NEXT_AGENT_START_2026-06-29.md`: `<ENTFERNT_API_KEY>`
- `doku/workspace/video-motion/REAL_ROOM_RECOGNITION.md`: `<ENTFERNT_API_KEY>`
- `doku/workspace/video-motion/RECOGNITION_SCHEMA_AND_BACKENDS.md`: `<ENTFERNT_API_KEY>`
- `v-alt/package.json`: `<ENTFERNT_SECRET>`
- `v-alt/src/lib/prisma.ts`: `<ENTFERNT_DATABASE_URL>`
- `v-alt/tests/central-video-studio-account-library.test.ts`: `<ENTFERNT_BASIC_AUTH_URL>`
- `v-alt/tests/shared-video-studio.test.ts`: `<ENTFERNT_SECRET>`
- `v-neu/package.json`: `<ENTFERNT_SECRET>`
- `v-neu/scripts/e2e-video-studio-workbench.mjs`: `<ENTFERNT_ACCESS_KEY>`, `<ENTFERNT_DATABASE_URL>`, `<ENTFERNT_SECRET>`
- `v-neu/src/lib/prisma.ts`: `<ENTFERNT_DATABASE_URL>`
- `v-neu/tests/central-video-studio-account-library.test.ts`: `<ENTFERNT_BASIC_AUTH_URL>`
- `v-neu/tests/shared-video-studio.test.ts`: `<ENTFERNT_SECRET>`

Die übrigen Treffer des unabhängigen Scanners wurden einzeln als nicht geheime Prüfsummen, statische Datei-/Font-Hashes, abgeleitete Testsignaturen, ungefährliche Test-IDs oder bloße Namen von Umgebungsvariablen klassifiziert. Es wurden keine echten Werte in diesem Protokoll festgehalten.
