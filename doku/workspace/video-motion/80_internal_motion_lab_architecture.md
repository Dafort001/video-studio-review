# Internal Motion Lab Architecture v0.1

## Ziel

Das Internal Motion Lab ist eine getrennte interne Testanwendung fuer die
Video-Motion-Library. Es soll reale Testbilder, Shotplaene, Preset-Kandidaten,
Qwen-Experimente, Typografie, Avatar-Mocks, Preview-Renderings und Ratings
sichtbar machen, bevor daraus eine oeffentliche Pix.mo-Funktion entsteht.

## Geplante Struktur

```text
docs/video-motion/
  MASTERPLAN.md
  PHASE2_INTERNAL_MOTION_LAB.md
  phase2_internal_motion_lab.md
  80_internal_motion_lab_architecture.md

config/video-motion/
  *.json
  *.schema.json
  motion_lab_feature_flags.v01.json

src/videoMotion/
  Phase-1-Planungslogik
  spaetere Preview-/Matching-Hilfen

internal/motion-lab/
  server/
  client/
  adapters/
  storage/
  README.md
```

Session 18 legt `internal/motion-lab/` noch nicht an. Diese Struktur gehoert zu
Session 20.

## Trennung von Public UI

Das Motion Lab ist kein oeffentlicher Pix.mo-Editor.

Regeln:

- keine Public Route ohne Schutz,
- keine Kundenbestellung,
- keine Vercel-Produktivabhaengigkeit,
- keine Annahme, dass Lab-UI gleich spaetere Kunden-UI ist,
- keine echte externe API aus UI-Komponenten heraus.

## Laufzeitmodell

v0.1 soll lokal oder intern laufen:

```text
localhost:<port>/internal/motion-lab
```

Spaeter moeglich, aber nicht in Session 18:

```text
internal.pix.mo/motion-lab
```

## Adapter-Schicht

Alle externen oder speichernden Funktionen laufen ueber Adapter.

### qwen_adapter

Zweck:

- Prompt und Negative Prompt erzeugen,
- Request Payload sichtbar machen,
- Mock Response erzeugen,
- spaeter echte Qwen-Requests protokollieren,
- Fehler und Outputs als ExternalJob speichern.

Default:

```text
qwen_enabled=false
qwen_mock_mode=true
```

### heygen_adapter

Zweck:

- Avatar-/Presenter-Flows mocken,
- Timing und Komposition simulieren,
- spaeter echte Provider-Calls vorbereiten.

Default:

```text
avatar_enabled=false
avatar_mock_mode=true
```

### storage_adapter

Zweck:

- Testbilder,
- generierte Testshots,
- Ratings,
- Payloads,
- Fehlerfaelle

lokal speichern.

### render_adapter

Zweck:

- einfache Preview-Clips lokal vorbereiten,
- KB-/Typografie-Preview erzeugen,
- Qwen-Outputs nur einbinden, wenn vorhanden.

Default:

```text
external_render_enabled=false
local_preview_render_enabled=true
```

### metadata_adapter

Zweck:

- Bildmetadaten lesen,
- Motivklassen und Eigenschaften verwalten,
- manuelle Overrides dokumentieren.

## Sicherheitsregeln

- Keine API Keys im Code.
- Keine echten API Calls ohne Feature Flag.
- Jeder externe Job braucht Request-/Response-Pfade oder Mock-Equivalent.
- Jeder Fehler muss speicherbar sein.
- Das Lab darf nicht versehentlich als Public UI ausgeliefert werden.

## Nicht-Ziele in Session 18

- kein Server,
- keine React-/Web-UI,
- keine Upload-Funktion,
- keine Qwen-Integration,
- keine HeyGen-Integration,
- kein Renderjob,
- keine Speicherung von echten Testbildern.

