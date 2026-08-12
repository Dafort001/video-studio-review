# Pix.mo Internal Motion Lab – Codex Masterplan Phase 2

## Zweck dieses Dokuments

Dieses Dokument beschreibt die zweite Umsetzungsphase nach der Video-Motion-Library.

Phase 1 hat das Regelwerk vorbereitet: Creative Direction, Motivklassen, Highlight Scoring, Motion Presets, Typografie, Transitions, Presenter-/Avatar-Logik, Produktlogik, Matching, Anti-Boring Rules, Quality Gates, Qwen-Testmatrix und Variantenlogik.

Phase 2 soll daraus ein **internes Test- und Bewertungswerkzeug** machen.

Ziel ist noch keine finale Kunden-UI. Ziel ist ein internes **Motion Lab**, mit dem die Motion Library, Qwen-Workflows, Bildauswahl, Shotpläne, Typografie, Avatar-/Presenter-Optionen und externe Dienste sichtbar getestet werden können, bevor daraus später eine öffentliche Pix.mo-Funktion wird.

---

# 0. Grundentscheidung: interne Server-Anwendung statt sofortige Public UI

Die interne Server-Lösung ist zunächst bevorzugt.

Begründung:

- Kein permanenter Push + Vercel Deploy für jeden Test.
- Schnellere Iteration.
- Besser geeignet für Debugging.
- Externe Dienste wie Qwen, HeyGen, Storage, Rendering und spätere APIs können kontrolliert getestet werden.
- Fehlende Datenflüsse, falsche Annahmen und übersehene UI-Zustände werden sichtbar, bevor eine öffentliche Pix.mo-Integration gebaut wird.
- Risikoarme Trennung zwischen Produktivsystem und Experimentierumgebung.

Die interne Anwendung darf später in Pix.mo integriert werden, ist aber zunächst als separates internes Tool zu behandeln.

---

# 1. Zielbild

Das Motion Lab soll ermöglichen:

1. Immobilienbilder hochladen oder aus Testdaten auswählen.
2. Motive und Eigenschaften anzeigen.
3. Highlight Scores anzeigen.
4. Passende Motion Presets anzeigen.
5. Qwen-relevante Presets testen.
6. Typografie-Vorschläge prüfen.
7. Avatar-/Presenter-Optionen simulieren.
8. Einzelne Shots generieren oder vorbereiten.
9. Shotpläne aus mehreren Bildern bauen.
10. Eine einfache Video-Preview erzeugen.
11. Ergebnisse bewerten.
12. Bewertungen und Fehlerfälle speichern.
13. Externe Datenflüsse transparent darstellen.
14. Vor der finalen UI übersehene Probleme finden.

---

# 2. Was dieses Tool ausdrücklich nicht sein soll

Das Motion Lab ist **nicht**:

- die finale Kunden-UI,
- ein öffentlicher Pix.mo-Editor,
- ein fertiges Bestellsystem,
- ein vollständig automatischer Video-Generator,
- eine produktive Qwen-Abrechnungspipeline,
- ein endgültiges UI/UX-Design.

Es ist ein internes Test-, Debug- und Bewertungswerkzeug.

---

# 3. Architekturentscheidung

## Empfohlene Struktur

```text
Pix.mo Repository
├── docs/video-motion/
│   ├── MASTERPLAN.md
│   └── PHASE2_INTERNAL_MOTION_LAB.md
├── config/video-motion/
│   ├── *.json
│   └── *.schema.json
├── src/videoMotion/
│   ├── bestehende Phase-1-Logik
│   └── neue Matching-/Preview-Hilfen
├── internal/motion-lab/
│   ├── server/
│   ├── client/
│   ├── storage/
│   ├── adapters/
│   └── README.md
└── tests/
```

Falls die bestehende Pix.mo-Struktur eine andere Ordnerlogik hat, soll Codex sie respektieren. Der Grundsatz bleibt:

```text
Interne Testanwendung klar getrennt von öffentlicher Pix.mo-UI.
```

---

# 4. Betriebsmodell

## Lokal / interner Server

Die erste Version soll lokal oder auf einem internen Server laufen.

Beispiele:

```text
localhost:xxxx/internal/motion-lab
```

oder später, falls ein geschützter interner Host existiert:

```text
internal.pix.mo/motion-lab
```

## Zugriffsschutz

Das Tool darf nicht öffentlich frei erreichbar sein.

Mindestens erforderlich:

- lokale Nutzung oder
- Basic Auth oder
- Admin-only Auth oder
- IP-/VPN-Schutz.

Codex soll keine unsichere öffentliche Route bauen.

---

# 5. Externe Dienste als Adapter

Externe Dienste dürfen nicht direkt unstrukturiert aus UI-Komponenten heraus aufgerufen werden.

Alle externen Dienste müssen über Adapter laufen.

Geplante Adapter:

```text
qwen_adapter
heygen_adapter
storage_adapter
render_adapter
metadata_adapter
```

## Qwen Adapter

Zweck:

- Qwen-Image-Edit / Multi-Angle Tests vorbereiten.
- Prompts erzeugen.
- Request Payloads sichtbar machen.
- Response-Dateien speichern.
- Fehler dokumentieren.
- Noch keine harte Produktivabhängigkeit.

Der Adapter soll zunächst auch einen Mock-Modus unterstützen.

```text
qwen_enabled=false
qwen_mock_mode=true
```

## HeyGen / Avatar Adapter

Zweck:

- Avatar-/Presenter-Workflows später vorbereiten.
- In Phase 2 zunächst nur Platzhalter, Timing und Kompositionslogik.
- Keine Pflicht zur sofortigen HeyGen-Integration.

```text
avatar_enabled=false
avatar_mock_mode=true
```

## Storage Adapter

Zweck:

- Testbilder speichern.
- generierte Testshots speichern.
- Bewertungen speichern.
- externe Outputs referenzieren.

Lokale Speicherung ist für v0.1 ausreichend.

## Render Adapter

Zweck:

- einfache Preview-Clips erzeugen.
- zunächst KB/PX/Typografie/Shotplan rendern.
- Qwen-Ergebnisse nur einbinden, wenn vorhanden.

---

# 6. Feature Flags

Alle riskanten oder externen Funktionen müssen abschaltbar sein.

```text
motion_lab_enabled
qwen_enabled
qwen_mock_mode
avatar_enabled
avatar_mock_mode
aggressive_motion_enabled
experimental_transitions_enabled
typography_heavy_mode_enabled
external_render_enabled
local_preview_render_enabled
```

Feature Flags dürfen nicht hart im Code verstreut sein. Sie müssen zentral konfigurierbar sein.

Empfohlene Datei:

```text
/config/video-motion/motion_lab_feature_flags.v01.json
```

---

# 7. Datenmodell v0.1

## TestAsset

Ein TestAsset ist ein hochgeladenes oder vorhandenes Immobilienbild.

```text
asset_id
filename
source
storage_path
width
height
orientation
created_at
motif_class
motif_properties
highlight_scores
notes
```

## MotionCandidate

Ein MotionCandidate ist ein vorgeschlagenes Bewegungs-Preset für ein Asset.

```text
candidate_id
asset_id
motion_preset_id
technical_method
duration
risk_level
qwen_required
text_overlay_allowed
avatar_overlay_allowed
score
reasoning_summary
```

## ShotTest

Ein ShotTest ist ein konkreter Versuch mit einem Bild und einer Bewegung.

```text
shot_test_id
asset_id
motion_preset_id
duration
technical_method
qwen_enabled
typography_enabled
avatar_enabled
input_config
output_path
status
created_at
```

## ShotRating

Eine Bewertung eines Testshots.

```text
rating_id
shot_test_id
motion_quality
artifact_level
modern_property_feel
usable_for_social
usable_for_premium
usable_duration_max
notes
created_at
```

## ShotPlan

Ein ShotPlan ist eine geplante Sequenz aus mehreren Bildern.

```text
shot_plan_id
name
product_template
creative_profile
target_duration
shots
quality_gate_result
created_at
```

## ExternalJob

Ein ExternalJob dokumentiert Aufrufe externer Dienste.

```text
external_job_id
provider
adapter
status
request_payload_path
response_payload_path
input_asset_ids
output_paths
error_message
created_at
completed_at
```

---

# 8. UI-Bereiche des Motion Labs

## 8.1 Dashboard

Zweck:

- Überblick über Testassets, Shot Tests, Qwen Jobs, Bewertungen und offene Fehler.

Anzeigen:

- Anzahl Testbilder
- Anzahl generierter Shot Tests
- Anzahl Qwen-Jobs
- Anzahl fehlgeschlagener Jobs
- Top Presets
- Presets mit hoher Fehlerquote
- letzte Bewertungen

## 8.2 Asset Library

Zweck:

- Testbilder hochladen oder auswählen.
- Motive und Scoring kontrollieren.

Funktionen:

- Upload einzelner Bilder.
- Upload kleiner Bildgruppen.
- Anzeige technischer Metadaten.
- Anzeige erkannter Motivklasse.
- Anzeige erkannter Eigenschaften.
- manuelle Korrektur von Motivklasse und Eigenschaften.
- Notizen zum Bild.

## 8.3 Motif / Scoring Debug Panel

Zweck:

- sichtbar machen, warum ein Bild wie bewertet wurde.

Anzeigen:

```text
motif_class
motif_properties
hero_score
luxury_score
spatial_depth_score
light_quality_score
feature_score
social_hook_score
text_overlay_score
motion_potential_score
avatar_background_score
qwen_risk_score
```

Wichtig: Manuelle Overrides müssen möglich sein.

## 8.4 Motion Preset Selector

Zweck:

- passende Bewegungen pro Bild anzeigen.

Anzeigen:

- empfohlene Presets
- technische Methode: KB / PX / QW / MX
- Dauerbereich
- Risiko
- Qwen erforderlich ja/nein
- Text geeignet ja/nein
- Avatar geeignet ja/nein
- Begründung

Funktionen:

- Preset auswählen
- Dauer ändern
- Qwen an/aus
- Typografie an/aus
- Avatar an/aus
- Shot Test erstellen

## 8.5 Single Shot Preview

Zweck:

- ein Bild mit einer Bewegung testen.

Funktionen:

- einfache Vorschau für KB/PX-Bewegungen
- Platzhalter für Qwen-Output
- Anzeige von Textoverlay
- Anzeige von Safe Area
- Anzeige von Dauer
- Export eines Preview-Clips, wenn Render Adapter verfügbar ist

Ziel:

```text
1 Bild → 5 Bewegungen → Vorschau → Bewertung
```

## 8.6 Qwen Test Runner

Zweck:

- Qwen-Image-Edit / Multi-Angle Experimente sichtbar machen.

Funktionen:

- Prompt anzeigen
- Negative Prompt anzeigen
- Request Payload anzeigen
- Mock Response erzeugen
- später echten Request auslösen, wenn qwen_enabled=true
- Ergebnis speichern
- Fehler speichern
- Bewertung speichern

Wichtig: Keine versteckte Qwen-Nutzung. Jeder Request muss sichtbar, nachvollziehbar und speicherbar sein.

## 8.7 Typography Preview

Zweck:

- Textoverlays testen.

Funktionen:

- Typografie-Preset auswählen
- Text eingeben
- Position prüfen
- Safe Areas anzeigen
- Lesbarkeit bewerten
- kurze Hook-Varianten testen

## 8.8 Avatar / Presenter Preview

Zweck:

- Avatar-/Presenter-Logik vorbereiten.

Phase 2 v0.1:

- nur Mock / Platzhalter
- Positionen simulieren
- Timing simulieren
- Picture-in-Picture simulieren
- Intro/CTA-Slots markieren

Noch keine Pflicht zur echten Avatar-Generierung.

## 8.9 Shotplan Builder

Zweck:

- aus mehreren Bildern eine Sequenz bauen.

Funktionen:

- Bilder auswählen
- Produktklasse auswählen
- Creative Profile auswählen
- automatischen Shotplan erzeugen
- Reihenfolge bearbeiten
- Dauer bearbeiten
- Preset pro Shot ändern
- Textoverlays hinzufügen
- Avatar-Slots einfügen oder entfernen
- Quality Gates prüfen

## 8.10 Preview Video Renderer

Zweck:

- einfache Sequenzvorschau erstellen.

v0.1 genügt:

- 720p oder 1080p
- einfache Schnitte
- einfache KB-Bewegungen
- einfache Typografie
- keine finale Qualität erforderlich
- keine Kundenfähigkeit erforderlich

Ziel ist Beurteilung:

- wirkt es modern?
- ist es langweilig?
- ist der Rhythmus brauchbar?
- sind Texte lesbar?
- sind die Bewegungen plausibel?

## 8.11 Rating & Feedback Panel

Zweck:

- Tests auswertbar machen.

Bewertungsfelder:

```text
motion_quality: 1–5
artifact_level: 1–5
modern_property_feel: 1–5
usable_for_social: true/false
usable_for_premium: true/false
usable_duration_max
notes
```

Bewertungen müssen gespeichert werden.

---

# 9. Phase-2-Sessions für Codex

## Session 18 – Internal Motion Lab Architektur

### Ziel

Grundarchitektur und Dokumentation für das interne Motion Lab erstellen.

### Erstelle

```text
/docs/video-motion/phase2_internal_motion_lab.md
/docs/video-motion/80_internal_motion_lab_architecture.md
/config/video-motion/motion_lab_feature_flags.v01.json
/docs/video-motion/_handover_session_18.md
```

### Inhalt

- interne Server-App statt Public UI
- Trennung von Pix.mo Public UI
- Adapter-Prinzip
- Feature Flags
- Sicherheits-/Zugriffshinweise
- Noch keine produktive API-Integration
- Noch keine finale UI

---

## Session 19 – Datenmodelle und Schemas

### Ziel

Datenmodelle und JSON-Schemas für das Motion Lab erstellen.

### Erstelle

```text
/docs/video-motion/81_motion_lab_data_model.md
/config/video-motion/motion_lab_data_model.v01.json
/config/video-motion/motion_lab_data_model.v01.schema.json
/docs/video-motion/_handover_session_19.md
```

### Enthaltene Modelle

```text
TestAsset
MotionCandidate
ShotTest
ShotRating
ShotPlan
ExternalJob
```

---

## Session 20 – Interne Server-Grundstruktur

### Ziel

Interne Server-Anwendung vorbereiten, aber noch ohne komplexe UI.

### Erstelle

```text
/internal/motion-lab/README.md
/internal/motion-lab/server/
/internal/motion-lab/client/
/internal/motion-lab/adapters/
/internal/motion-lab/storage/
/docs/video-motion/_handover_session_20.md
```

### Anforderungen

- bestehende Projektstruktur respektieren
- keine Public Route ohne Schutz
- lokaler Start dokumentieren
- keine Vercel-Abhängigkeit erzwingen
- keine produktive Qwen-Integration

---

## Session 21 – Adapter Interfaces

### Ziel

Adapter für externe Dienste definieren.

### Erstelle

```text
/internal/motion-lab/adapters/types.ts
/internal/motion-lab/adapters/qwenAdapter.ts
/internal/motion-lab/adapters/heygenAdapter.ts
/internal/motion-lab/adapters/storageAdapter.ts
/internal/motion-lab/adapters/renderAdapter.ts
/internal/motion-lab/adapters/metadataAdapter.ts
/docs/video-motion/_handover_session_21.md
```

### Anforderungen

- zunächst Mock-Modus unterstützen
- Request/Response protokollierbar machen
- externe Jobs als ExternalJob speichern können
- keine echten API Keys hardcoden
- keine echten API Calls ohne Feature Flag

---

## Session 22 – Asset Library

### Ziel

Upload und Verwaltung von Testbildern ermöglichen.

### Erstelle

```text
/internal/motion-lab/client/AssetLibrary.*
/internal/motion-lab/server/assets.*
/internal/motion-lab/storage/test-assets/
/docs/video-motion/_handover_session_22.md
```

### Anforderungen

- einzelne Bilder hochladen
- Metadaten erfassen
- gespeicherte Bilder anzeigen
- Motivklasse manuell setzen oder korrigieren
- Eigenschaften manuell setzen oder korrigieren

---

## Session 23 – Motif / Scoring Debug Panel

### Ziel

Motivklassifikation und Highlight Scores sichtbar machen.

### Erstelle

```text
/internal/motion-lab/client/ScoringDebugPanel.*
/internal/motion-lab/server/scoring.*
/docs/video-motion/_handover_session_23.md
```

### Anforderungen

- Scores anzeigen
- Scores manuell überschreiben
- Gründe anzeigen, soweit vorhanden
- keine versteckte Automatik ohne Anzeige

---

## Session 24 – Motion Preset Selector

### Ziel

Passende Motion Presets für ein Bild anzeigen.

### Erstelle

```text
/internal/motion-lab/client/MotionPresetSelector.*
/internal/motion-lab/server/motionCandidates.*
/docs/video-motion/_handover_session_24.md
```

### Anforderungen

- Presets aus Phase-1-Config laden
- Presets nach Motivklasse und Scores filtern
- Risiko anzeigen
- Qwen-Erfordernis anzeigen
- Dauer anpassen
- Shot Test vorbereiten

---

## Session 25 – Single Shot Preview

### Ziel

Einzelne Bewegungen auf einem Bild als Vorschau testbar machen.

### Erstelle

```text
/internal/motion-lab/client/SingleShotPreview.*
/internal/motion-lab/server/shotTests.*
/docs/video-motion/_handover_session_25.md
```

### Anforderungen

- KB-Bewegung als einfache Vorschau
- Qwen-Platzhalter anzeigen, wenn QW erforderlich ist
- Textoverlay optional anzeigen
- Dauer anzeigen
- Shot Test speichern

---

## Session 26 – Qwen Test Runner

### Ziel

Qwen-Tests sichtbar und kontrolliert vorbereiten.

### Erstelle

```text
/internal/motion-lab/client/QwenTestRunner.*
/internal/motion-lab/server/qwenJobs.*
/docs/video-motion/_handover_session_26.md
```

### Anforderungen

- Prompt anzeigen
- Negative Prompt anzeigen
- Request Payload anzeigen
- Mock Response unterstützen
- echte Calls nur, wenn qwen_enabled=true und qwen_mock_mode=false
- Ergebnis speichern
- Fehler speichern
- keine API Keys im Code

---

## Session 27 – Typography Preview

### Ziel

Typografie-Presets sichtbar testen.

### Erstelle

```text
/internal/motion-lab/client/TypographyPreview.*
/internal/motion-lab/server/typography.*
/docs/video-motion/_handover_session_27.md
```

### Anforderungen

- Typografie-Presets laden
- Text eingeben
- Positionen testen
- Safe Areas anzeigen
- Lesbarkeit bewerten

---

## Session 28 – Avatar / Presenter Mock Preview

### Ziel

Avatar- und Presenter-Logik simulieren.

### Erstelle

```text
/internal/motion-lab/client/AvatarPresenterPreview.*
/internal/motion-lab/server/avatar.*
/docs/video-motion/_handover_session_28.md
```

### Anforderungen

- Avatar-Platzhalter
- Picture-in-Picture
- Full Frame Intro
- CTA Slot
- Timing anzeigen
- noch keine echte Avatar-Generierung erforderlich

---

## Session 29 – Shotplan Builder

### Ziel

Aus mehreren Bildern einen Shotplan bauen.

### Erstelle

```text
/internal/motion-lab/client/ShotplanBuilder.*
/internal/motion-lab/server/shotplans.*
/docs/video-motion/_handover_session_29.md
```

### Anforderungen

- mehrere Assets auswählen
- Produktklasse auswählen
- Creative Profile auswählen
- automatischen Shotplan erzeugen
- Reihenfolge ändern
- Shot-Dauer ändern
- Preset pro Shot ändern
- Avatar- und Textslots anzeigen

---

## Session 30 – Preview Video Renderer

### Ziel

Einfache Preview-Videos erzeugen.

### Erstelle

```text
/internal/motion-lab/client/PreviewRenderer.*
/internal/motion-lab/server/renderJobs.*
/docs/video-motion/_handover_session_30.md
```

### Anforderungen

- einfache Preview aus Shotplan
- 720p oder 1080p
- KB-Bewegungen
- einfache Typografie
- Qwen-Ergebnisse einbinden, falls vorhanden
- keine finale Qualität erforderlich
- Renderjobs speichern

---

## Session 31 – Rating & Feedback Storage

### Ziel

Bewertungen speichern und später nutzbar machen.

### Erstelle

```text
/internal/motion-lab/client/RatingPanel.*
/internal/motion-lab/server/ratings.*
/internal/motion-lab/storage/ratings/
/docs/video-motion/_handover_session_31.md
```

### Anforderungen

- Shot bewerten
- Preset bewerten
- Notizen speichern
- Fehlerfälle dokumentieren
- Export als JSON/CSV vorbereiten

---

## Session 32 – Dashboard und Audit View

### Ziel

Überblick über Tests, Fehler und Preset-Qualität schaffen.

### Erstelle

```text
/internal/motion-lab/client/Dashboard.*
/internal/motion-lab/server/dashboard.*
/docs/video-motion/82_motion_lab_audit_checklist.md
/docs/video-motion/_handover_session_32.md
```

### Anzeigen

- Anzahl Testbilder
- Anzahl Shot Tests
- Anzahl Qwen Jobs
- fehlgeschlagene Jobs
- beste Presets
- schlechteste Presets
- Presets ohne Tests
- offene Fehlerfälle
- externe Datenflüsse

---

## Session 33 – Integration Readiness Report

### Ziel

Prüfen, ob das Motion Lab bereit ist, später in Pix.mo integriert zu werden.

### Erstelle

```text
/docs/video-motion/83_motion_lab_integration_readiness.md
/docs/video-motion/84_public_ui_requirements_later.md
/docs/video-motion/85_open_risks_and_missing_parts.md
/docs/video-motion/_handover_session_33.md
```

### Fragen

- Welche Teile sind nur intern?
- Welche Teile könnten später in Pix.mo Public UI?
- Welche Datenmodelle sind stabil?
- Welche Adapter sind nur Mock?
- Welche externen Dienste fehlen noch?
- Welche Tests fehlen?
- Welche UI-Zustände wurden übersehen?
- Welche Workflows sind zu kompliziert?
- Welche Presets funktionieren nicht?

---

# 10. Handover-Regel für Phase 2

Jede Session muss mit einer Handover-Datei enden:

```text
/docs/video-motion/_handover_session_X.md
```

Diese Datei muss enthalten:

```text
# Handover Session X

## Was wurde erstellt?

## Welche Dateien wurden geändert?

## Welche Entscheidungen wurden getroffen?

## Was ist bewusst noch offen?

## Was soll die nächste Session tun?

## Welche Dateien muss die nächste Session zuerst lesen?

## Externe Dienste / Adapterstatus

## Risiken / Hinweise
```

---

# 11. Startauftrag für Codex Phase 2

Diesen Auftrag an Codex geben, um dieses Dokument im Projekt abzulegen:

```text
Lege den folgenden Phase-2-Masterplan unverändert als /docs/video-motion/PHASE2_INTERNAL_MOTION_LAB.md ab. Setze noch keine Session um. Erstelle nur diese Datei und bestätige danach, dass sie abgelegt wurde.
```

Danach dieses Dokument einfügen.

---

# 12. Auftrag für Session 18

Nach dem Ablegen des Phase-2-Masterplans diesen Auftrag an Codex geben:

```text
Lies zuerst:
- /docs/video-motion/MASTERPLAN.md
- /docs/video-motion/PHASE2_INTERNAL_MOTION_LAB.md
- die letzte vorhandene Handover-Datei aus Phase 1

Starte danach ausschließlich mit Session 18 aus PHASE2_INTERNAL_MOTION_LAB.md.

Erstelle nur die in Session 18 genannten Dateien:
- /docs/video-motion/phase2_internal_motion_lab.md
- /docs/video-motion/80_internal_motion_lab_architecture.md
- /config/video-motion/motion_lab_feature_flags.v01.json
- /docs/video-motion/_handover_session_18.md

Setze keine späteren Sessions um.
Baue noch keine vollständige UI.
Integriere keine echte Qwen-API.
Integriere keine echte HeyGen-API.
Mache keine Public Pix.mo UI.
Mache keine großen Refactorings.

Beende die Arbeit mit einer vollständigen Handover-Datei.
```

---

# 13. Auftrag für jede Folgesession

Für jede weitere Phase-2-Session diesen Auftrag verwenden und nur die Nummer anpassen:

```text
Lies zuerst:
- /docs/video-motion/MASTERPLAN.md
- /docs/video-motion/PHASE2_INTERNAL_MOTION_LAB.md
- /docs/video-motion/_handover_session_X.md

Setze danach ausschließlich Session X+1 aus PHASE2_INTERNAL_MOTION_LAB.md um.

Erstelle nur die dort genannten Dateien.
Setze keine späteren Sessions um.
Mache keine Refactorings außerhalb des Session-Ziels.
Integriere keine echten externen APIs, sofern diese Session das nicht ausdrücklich verlangt.
Veröffentliche nichts in der Public Pix.mo UI.

Beende die Arbeit mit /docs/video-motion/_handover_session_X+1.md.

Wenn der Kontext zu groß wird, schreibe zuerst die vollständige Handover-Datei und stoppe danach.
```

---

# 14. Kontrollregel für den Nutzer

Nach jeder Session prüfen:

```text
Wurde die Handover-Datei erstellt?
Sind nur die Dateien dieser Session geändert worden?
Wurde keine spätere Session vorgezogen?
Wurde keine Public UI gebaut?
Wurde keine echte externe API unkontrolliert integriert?
Sind Mock-Modi und Feature Flags vorhanden?
Sind offene Punkte dokumentiert?
Kann die nächste Session allein mit MASTERPLAN.md + PHASE2_INTERNAL_MOTION_LAB.md + Handover starten?
```

Wenn eine dieser Fragen mit Nein beantwortet wird, die nächste Session nicht starten. Erst korrigieren lassen.

---

# 15. Wichtigste Leitlinie

Das interne Motion Lab soll helfen, Fehler zu finden, bevor Pix.mo eine Kundenfunktion bekommt.

Es soll sichtbar machen:

- welche Motive funktionieren,
- welche Bewegungen funktionieren,
- welche Qwen-Prompts funktionieren,
- welche Presets scheitern,
- welche Typografie lesbar ist,
- welche Avatar-Varianten sinnvoll sind,
- welche externen Datenflüsse fehlen,
- welche UI-Zustände übersehen wurden.

Erst wenn dieses interne Tool ausreichend getestet ist, sollte eine öffentliche Pix.mo-UI geplant werden.
