# Handover Session 27

## Was wurde erstellt?

Session 27 hat die interne Typography Preview vorbereitet.

Neu erstellt:

- `internal/motion-lab/client/TypographyPreview.ts`
- `internal/motion-lab/server/typography.ts`
- `docs/video-motion/_handover_session_27.md`

## Welche Dateien wurden geaendert?

Session-27-eigene neue Dateien:

- `internal/motion-lab/client/TypographyPreview.ts`
- `internal/motion-lab/server/typography.ts`
- `docs/video-motion/_handover_session_27.md`

## Welche Entscheidungen wurden getroffen?

- Die Preview bleibt ein internes TypeScript-Scaffold, keine gerenderte UI.
- Typografie-Presets und Typografie-Regeln werden aus den Phase-1-JSON-Dateien
  geladen.
- Textinput wird normalisiert und auf 160 Zeichen begrenzt.
- Safe Areas werden aus `typography_rules.v01.json` abgeleitet und mit
  optionalen Bild-Risiko-Tags abgeglichen.
- Lesbarkeit wird als sichtbare v0.1-Heuristik bewertet: Wortanzahl,
  empfohlene Platzierung, Safe-Area-Konflikte, `text_overlay_score` und
  `qwen_risk_score`.
- Es gibt keine CSS-, Canvas-, Render- oder Public-UI-Integration.

## Was ist bewusst noch offen?

- Keine echte UI-Komponente.
- Keine typografische Render-Engine.
- Keine responsive Textmessung.
- Keine Font-Auswahl.
- Keine Animation.
- Keine Persistenz von Typography-Preview-States.
- Keine Verbindung zum Avatar / Presenter Mock Preview aus Session 28.

## Was soll die naechste Session tun?

Session 28 soll ausschliesslich die Avatar / Presenter Mock Preview
vorbereiten:

- `internal/motion-lab/client/AvatarPresenterPreview.*`
- `internal/motion-lab/server/avatar.*`
- `docs/video-motion/_handover_session_28.md`

## Welche Dateien muss die naechste Session zuerst lesen?

```text
docs/video-motion/MASTERPLAN.md
docs/video-motion/PHASE2_INTERNAL_MOTION_LAB.md
docs/video-motion/_handover_session_27.md
config/video-motion/presenter_shot_types.v01.json
config/video-motion/avatar_compatibility_rules.v01.json
internal/motion-lab/adapters/heygenAdapter.ts
```

## Externe Dienste / Adapterstatus

- Qwen: nicht betroffen.
- HeyGen/Avatar: nicht betroffen.
- Storage: keine echte Persistenz.
- Render: nicht betroffen.
- Metadata: nicht betroffen.

## Risiken / Hinweise

- Readability Scores sind v0.1-Lab-Heuristiken, keine Designfreigabe.
- Safe-Area-Konflikte haengen aktuell von uebergebenen `imageRiskTags` ab, es
  gibt noch keine automatische Bildanalyse.
- `projects/piximmo-web` enthaelt weiterhin unrelated Dirty-State und wurde in
  Session 27 nicht angefasst.

## Validierung

Durchgefuehrt am 2026-06-29:

- `node --check internal/motion-lab/server/typography.ts`: ok.
- `node --check internal/motion-lab/client/TypographyPreview.ts`: ok.
- Import-Smoke-Test fuer `buildTypographyPreview`: ok.
- Demo mit `location_label`, Text `Berlin Mitte`, Placement `top_left` und
  Risk Tag `bright_sky` erzeugt 7 Safe Areas, 2 Words, Level `good` und 1
  sichtbares Issue.
- Strukturcheck: keine `fetch`- oder `process.env`-Nutzung in den neuen
  Code-Dateien: ok.
- Strukturcheck: keine Public UI, keine API-Route, keine Render-Integration
  angelegt: ok.
- `git status --short`: nur Session-27-Dateien neu im Root; unrelated
  `projects/piximmo-web` bleibt dirty und wurde nicht angefasst.
