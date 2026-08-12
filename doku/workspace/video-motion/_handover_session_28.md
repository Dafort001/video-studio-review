# Handover Session 28

## Was wurde erstellt?

Session 28 hat die interne Avatar / Presenter Mock Preview vorbereitet.

Neu erstellt:

- `internal/motion-lab/client/AvatarPresenterPreview.ts`
- `internal/motion-lab/server/avatar.ts`
- `docs/video-motion/_handover_session_28.md`

## Welche Dateien wurden geaendert?

Session-28-eigene neue Dateien:

- `internal/motion-lab/client/AvatarPresenterPreview.ts`
- `internal/motion-lab/server/avatar.ts`
- `docs/video-motion/_handover_session_28.md`

## Welche Entscheidungen wurden getroffen?

- Die Preview bleibt ein internes TypeScript-Scaffold, keine gerenderte UI.
- Presenter-/Avatar-Shot-Types werden aus
  `presenter_shot_types.v01.json` geladen.
- Avatar-Kompatibilitaetsregeln werden aus
  `avatar_compatibility_rules.v01.json` geladen.
- Picture-in-Picture, Full Frame Intro, CTA Slot und Voiceover-only werden als
  sichtbare Placeholder-Layer vorbereitet.
- Timing wird auf den empfohlenen Dauerbereich des Shot-Types geklemmt und als
  Label sichtbar gemacht.
- Avatar-Mock-Faelle nutzen den bestehenden HeyGen-Mock-Adapter; echte
  Avatar-Generierung bleibt deaktiviert.

## Was ist bewusst noch offen?

- Keine echte UI-Komponente.
- Keine HeyGen-/Avatar-Provider-Generierung.
- Keine API-Route.
- Keine Datei-Persistenz.
- Keine Layout-/Masking-Engine.
- Keine Subtitles oder Voice-Generierung.
- Keine Verbindung zum Shotplan Builder aus Session 29.

## Was soll die naechste Session tun?

Session 29 soll ausschliesslich den Shotplan Builder vorbereiten:

- `internal/motion-lab/client/ShotplanBuilder.*`
- `internal/motion-lab/server/shotplans.*`
- `docs/video-motion/_handover_session_29.md`

## Welche Dateien muss die naechste Session zuerst lesen?

```text
docs/video-motion/MASTERPLAN.md
docs/video-motion/PHASE2_INTERNAL_MOTION_LAB.md
docs/video-motion/_handover_session_28.md
src/videoMotion/buildShotPlan.ts
src/videoMotion/buildVideoVariants.ts
internal/motion-lab/server/assets.ts
internal/motion-lab/server/motionCandidates.ts
```

## Externe Dienste / Adapterstatus

- Qwen: nicht betroffen.
- HeyGen/Avatar: Mock-Adapter vorbereitet; echter Adapter weiterhin nicht
  implementiert und nicht aufgerufen.
- Storage: keine echte Persistenz.
- Render: nicht betroffen.
- Metadata: nicht betroffen.

## Risiken / Hinweise

- Avatar/Presenter-Layer sind reine Planungs-Placeholder.
- Full-frame Avatar bleibt als Warnfall markiert, weil die Immobilie dabei
  nicht sichtbar ist.
- `projects/piximmo-web` enthaelt weiterhin unrelated Dirty-State und wurde in
  Session 28 nicht angefasst.

## Validierung

Durchgefuehrt am 2026-06-29:

- `node --check internal/motion-lab/server/avatar.ts`: ok.
- `node --check internal/motion-lab/client/AvatarPresenterPreview.ts`: ok.
- Import-Smoke-Test fuer `buildAvatarPresenterPreview`: ok.
- Demo `avatar_picture_in_picture` erzeugt Layer `picture_in_picture`,
  External Job Status `mocked` und 3 sichtbare Warnungen.
- Demo `avatar_full_frame` mit 9s Wunschdauer wird auf 2.5s geklemmt und
  erzeugt Layer `full_frame_intro`.
- Strukturcheck: keine `fetch`- oder `process.env`-Nutzung in den neuen
  Code-Dateien: ok.
- Strukturcheck: keine Public UI, keine API-Route, keine echte
  Avatar-/Provider-Generierung angelegt: ok.
- `git status --short`: nur Session-28-Dateien neu im Root; unrelated
  `projects/piximmo-web` bleibt dirty und wurde nicht angefasst.
