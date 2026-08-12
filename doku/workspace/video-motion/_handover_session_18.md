# Handover Session 18

## Was wurde erstellt?

Session 18 hat die Grundarchitektur und die zentrale Feature-Flag-Konfiguration
fuer das interne Motion Lab erstellt.

Neu erstellt:

- `docs/video-motion/80_internal_motion_lab_architecture.md`
- `config/video-motion/motion_lab_feature_flags.v01.json`
- `docs/video-motion/_handover_session_18.md`

Nicht separat erstellt:

- `docs/video-motion/phase2_internal_motion_lab.md`

Grund: Das Arbeitsvolume behandelt Dateinamen case-insensitiv. Dieser Pfad
kollidiert mit dem bereits unveraendert abgelegten Masterplan
`docs/video-motion/PHASE2_INTERNAL_MOTION_LAB.md`. Ein erster Schreibversuch
hat diese Masterplan-Datei ueberschrieben; sie wurde aus der Originalquelle
bytegleich wiederhergestellt. Um die Masterplan-Quelle nicht erneut zu
gefaehrden, bleibt die lowercase-Uebersichtsdatei blockiert. Die Session-18-
Architekturzusammenfassung steht stattdessen in
`docs/video-motion/80_internal_motion_lab_architecture.md`.

## Welche Dateien wurden geaendert?

Session-18-eigene neue Dateien:

- `docs/video-motion/80_internal_motion_lab_architecture.md`
- `config/video-motion/motion_lab_feature_flags.v01.json`
- `docs/video-motion/_handover_session_18.md`

Optional aktualisierte Working-Memory:

- `CODEX_WORKING_MEMORY_DO_NOT_TOUCH/video-motion-current.md`

## Welche Entscheidungen wurden getroffen?

- Phase 2 startet als internes Motion Lab, nicht als Public Pix.mo UI.
- Die Lab-App soll spaeter unter `internal/motion-lab/` getrennt von der
  oeffentlichen UI entstehen.
- Externe Dienste muessen ueber Adapter laufen.
- Qwen und Avatar starten in Mock-/Disabled-Defaults.
- Zentrale Feature Flags liegen in
  `config/video-motion/motion_lab_feature_flags.v01.json`.
- Session 18 dokumentiert Architektur und Flags, baut aber noch keinen Server.
- Die im Phase-2-Masterplan genannte lowercase-Datei
  `phase2_internal_motion_lab.md` ist auf diesem Volume wegen Case-Kollision
  mit `PHASE2_INTERNAL_MOTION_LAB.md` nicht separat anlegbar.

## Was ist bewusst noch offen?

- Keine interne Server-Grundstruktur.
- Keine Datenmodelle oder Schemas fuer Motion-Lab-Objekte.
- Keine Adapter-Implementierungen.
- Keine Upload-/Asset-Library.
- Keine UI.
- Keine Qwen-, HeyGen-, Render- oder Storage-Integration.
- Keine Public Route.
- Keine separate lowercase-Phase-2-Uebersichtsdatei, weil sie den
  unveraenderten Phase-2-Masterplan auf diesem Volume ueberschreiben wuerde.

## Was soll die nächste Session tun?

Session 19 soll ausschliesslich Datenmodelle und JSON-Schemas fuer das Motion
Lab erstellen:

- `docs/video-motion/81_motion_lab_data_model.md`
- `config/video-motion/motion_lab_data_model.v01.json`
- `config/video-motion/motion_lab_data_model.v01.schema.json`
- `docs/video-motion/_handover_session_19.md`

## Welche Dateien muss die nächste Session zuerst lesen?

```text
docs/video-motion/MASTERPLAN.md
docs/video-motion/PHASE2_INTERNAL_MOTION_LAB.md
docs/video-motion/_handover_session_18.md
```

## Externe Dienste / Adapterstatus

- Qwen: nicht integriert, Default `qwen_enabled=false`,
  `qwen_mock_mode=true`.
- HeyGen/Avatar: nicht integriert, Default `avatar_enabled=false`,
  `avatar_mock_mode=true`.
- Storage: nicht integriert.
- Render: nicht integriert, externe Render deaktiviert.
- Metadata: nicht integriert.

## Risiken / Hinweise

- Das Motion Lab darf spaeter nicht versehentlich als oeffentliche Route ohne
  Zugriffsschutz gebaut werden.
- Feature Flags sind keine Produktionsfreigabe.
- Adapter muessen spaeter Request/Response/Fehler protokollieren.
- `projects/piximmo-web` enthaelt weiterhin unrelated Dirty-State und wurde in
  Session 18 nicht angefasst.

## Validierung

Durchzufuehren vor Commit:

- `python3 -m json.tool config/video-motion/motion_lab_feature_flags.v01.json`:
  ok.
- Strukturcheck: zehn erwartete Feature Flags vorhanden: ok.
- Strukturcheck: Qwen und Avatar default disabled/mock: ok.
- Strukturcheck: keine Server-, UI-, Adapter- oder Public-Route-Dateien
  angelegt: ok.
- Hash-Check: `docs/video-motion/PHASE2_INTERNAL_MOTION_LAB.md` ist wieder
  bytegleich mit Daniels Desktop-Quelle: ok.
