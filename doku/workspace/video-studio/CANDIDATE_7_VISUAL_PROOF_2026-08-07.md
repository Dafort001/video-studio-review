# Video-Studio Bildauswahl und Kandidat-7-Nachweis · 2026-08-07

## Inventar und Auswahl

Das vorhandene gesperrte Schnittplan-Inventar enthält vier Objekte. Kandidat 10 ist durch Produktentscheidung als künftiges Demo- und Referenzmotiv ausgeschlossen und bleibt nur historischer technischer Nachweis.

| Kandidat | Bestand | Visuelle Einordnung |
|---:|---|---|
| 1 | Haus mit Vorgarten, 21 geplante Takes | Saubere, helle Räume und großer Garten, aber über weite Strecken sehr homogene leere Innenräume. |
| 5 | Historisches Wohnhaus, 22 geplante Takes | Stärkste historische Fassade und große Dachterrasse; innen hochwertig, aber überwiegend leer und farblich gleichförmig. |
| 7 | Backsteinhaus mit Einfahrt, 23 geplante Takes | Stärkste zusammenhängende Geschichte: Garten, Backstein, Terrasse, warme bewohnte Wohn-/Essräume und deutlich unterschiedliche Nebenräume. |
| 10 | Stadtfassade mit Straße, 26 geplante Takes | Für neue Demos und Referenzen gesperrt. Bestehende MP4s bleiben ausschließlich technischer Nachweis. |

Kandidat 7 wurde gewählt, weil er im Hochformat die größte Motiv- und Farbdynamik bietet und als bewohntes Objekt eine glaubwürdigere Maklergeschichte trägt als die leereren Alternativen.

## Neue Fassungen

- `guided.mp4`: geführte Maklerfassung aus 13 ausgewählten Takes in der bestehenden Maklerreihenfolge mit einer bewussten Rückkehr zum Startmotiv als Schlussbild. Dauer- und Bewegungswerte sind Systemvorschläge; die Reihenfolge bleibt als Maklerentscheidung im Vertrag markiert.
- `showcase.mp4`: ausdrücklich interne Leistungsdemo aus zehn Bildern desselben Objekts. Sie zeigt ausschließlich Timeline-Fähigkeiten wie Crop-Führung, Annäherung, Gegenrhythmus und adaptive Typografie.

Beide Fassungen setzen Text direkt ins Bild. Es gibt keine Pillen, Karten, Badges oder eigenen Text-Hintergrundflächen. Die Typografie liegt in vertikalen Safe Areas, wählt pro Bild zwischen heller und dunkler Darstellung und nutzt nur einen zurückhaltenden Schatten beziehungsweise eine schmale Outline.

## Ehrliche technische Grenze

Der reale Lauf bleibt:

`gemeinsamer Projektvertrag -> render.timeline-Routenauswahl -> lokaler Timeline-Arbeiter -> MP4 -> Medienprüfung`

Es wurde kein `prepare.*`- und kein `presenter.*`-Arbeiter ausgeführt. Die Leistungsdemo verwendet keine vorbereiteten Spezialclips. Alle sichtbaren Szenen stammen aus den bestehenden Bildern von Kandidat 7. Provider- und Modellnamen gehören nicht in die Makleroberfläche und erscheinen in keiner sichtbaren Fassung.

Die Takes dieses konkreten Nachweises tragen deshalb `render.timeline` als ausgeführte Fähigkeit. Die Bewegungsbezeichnungen in der internen Fassung beschreiben die vom Timeline-Arbeiter real erzeugte Crop-/Zoom-Choreografie und behaupten keinen vorgeschalteten `prepare.*`-Lauf.

## Lokale Eingabe

Die unversionierten Bildbestände liegen im Hauptworkspace. In einem isolierten Worktree wird der Pfad deshalb explizit übergeben:

```bash
PIX_VIDEO_STUDIO_ASSET_ROOT="/Volumes/drive 1/PIXCAPTURE" npm run video-studio:e2e
```

Die Ausgabe liegt unter `output/video-studio-e2e-candidate-7-2026-08-07/` und bleibt unversioniert.

## Read-only Schlusskritik

Claude/Opus prüfte Code, Report und beide vollständigen Szenenmitten-Bögen ohne Schreibwerkzeuge. Die erste Kritik nannte keine Blocker und empfahl nur, die Take-Fähigkeit exakt auf `render.timeline` auszurichten sowie die kleinen Unterzeilen zu stärken. Beides wurde umgesetzt und erneut gerendert. Die finale read-only Nachprüfung endete mit `GO` und keinen verbleibenden Blockern.
