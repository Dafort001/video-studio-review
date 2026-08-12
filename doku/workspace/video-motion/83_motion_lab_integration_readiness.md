# Motion Lab Integration Readiness v0.1

## Zweck

Dieses Dokument bewertet, ob das interne Motion Lab bereit ist, spaeter in
Pix.mo integriert zu werden. Es ist kein Startsignal fuer eine Public UI und
kein produktiver Integrationsauftrag.

## Kurzfazit

Das Motion Lab ist als internes Experimentier- und Bewertungsgeruest weit genug
vorbereitet, um lokale Testdaten, Shotplaene, Mocks, Preview-Metadaten,
Ratings und Audit-Snapshots in einer kontrollierten internen Anwendung
zusammenzufuehren.

Es ist noch nicht bereit fuer eine Pix.mo Public UI.

## Nur intern

Diese Teile bleiben vorerst intern:

- `internal/motion-lab/server/*`
- `internal/motion-lab/client/*`
- `internal/motion-lab/adapters/*`
- `internal/motion-lab/storage/*`
- Qwen-Mock-Jobs und Payload-Pfade
- HeyGen-/Avatar-Mocks
- Preview-Renderjobs
- Rating- und Audit-Snapshots
- manuelle Motiv- und Preset-Auswertung

Gruende:

- Es gibt noch keine geschuetzte Server-App.
- Es gibt keine echte Persistenz.
- Es gibt keine Auth-/Admin-Grenze.
- Externe Dienste sind noch Mock- oder Adapter-Scaffolds.
- Preview-Ausgaben sind nicht finale Videoqualitaet.
- Ratings und Fehlerfaelle sind noch nicht mit echten Testserien belegt.

## Spaeter public-faehig

Diese Konzepte koennen spaeter in Pix.mo Public UI uebergehen, wenn sie intern
stabil getestet wurden:

- kuratierte Produkt-Templates
- Creative Profiles
- Motivklassen und Motiv-Eigenschaften
- Highlight Scores als erklaerende Auswahlhilfe
- ausgewertete Motion-Preset-Empfehlungen
- einfache Shotplan-Vorschau
- sichere Textoverlay-Vorschlaege
- ein reduzierter Video-Preview-Status
- finale, getestete Preset-Qualitaetslabels

Nicht public uebernehmen:

- interne Debug-Pfade
- Roh-Payloads externer Provider
- technische Fehlercodes ohne nutzerverstaendliche Uebersetzung
- Mock-/Real-Call-Schalter
- unfertige Qwen-/Render-/Avatar-Adapterdetails
- interne Ranking- oder Audit-Scores ohne Produkttext

## Datenmodelle

### Relativ stabil

- `TestAsset`
- `MotionCandidate`
- `ShotTest`
- `ShotPlan`
- `ShotRating`

Diese Modelle decken den Kernfluss ab: Bild aufnehmen, Motiv/Preset bewerten,
Shot testen, Shotplan bauen und Ergebnis bewerten.

### Noch intern variabel

- `ExternalJob`
- Qwen Request-/Response-Pfade
- Renderjob Timeline Items
- Avatar-/Presenter Timing
- Dashboard-Snapshot
- Preset-Rating-Summary

Diese Modelle haengen noch stark von Adapter-, Provider- und Persistenz-
Entscheidungen ab.

## Adapterstatus

| Adapter | Status | Readiness |
| --- | --- | --- |
| `qwen_adapter` | Mock-/Payload-Vorbereitung | nicht public-ready |
| `heygen_adapter` | Avatar-/Presenter-Mock | nicht public-ready |
| `storage_adapter` | lokaler Storage-Scaffold | nicht public-ready |
| `render_adapter` | Preview-Mock | nicht final-ready |
| `metadata_adapter` | Metadaten-Scaffold | intern nutzbar |

## Fehlende Integrationsschichten

- geschuetzter lokaler/interner Serverstart
- Auth oder Admin-only Zugriff
- echte Datei-Persistenz fuer Assets, Payloads, Ratings und Previews
- kontrollierte Provider-Job-Persistenz
- zentrale ExternalJob-Historie
- echte Preview-Ausgabe
- klare Trennung zwischen internem Debug und Public-Produkttext
- End-to-End-Test mit echten Immobilienbildern
- Fehlerfall-Bibliothek nach realen Tests

## Integrationsentscheidung

Aktueller Status:

```text
internal_lab_readiness: partial
public_ui_readiness: no
provider_readiness: mock_only
storage_readiness: planned_local_paths
render_readiness: preview_scaffold
rating_readiness: export_scaffold
```

Empfehlung:

Zuerst interne Testlaeufe mit echten Bildern und Rating-Daten durchfuehren.
Danach erst entscheiden, welche public-faehigen UI-Zustaende und Datenfelder in
Pix.mo uebernommen werden.
