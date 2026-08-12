# Lokaler Video-Studio-Vertical-Slice · 2026-08-07

## Ergebnis

Der gemeinsame Video-Studio-Vertrag wurde mit zwei realen Hochformatvideos bis zur fertigen MP4-Datei ausgeführt:

- `guided.mp4`: geführte Objektstory aus der bestehenden, vom Makler bestimmten Bildfolge
- `showcase.mp4`: klar als intern gekennzeichnete Leistungsdemo mit bereits vorbereiteten Prüfclips und ausgewählten Objektbildern

Die Ausgabe liegt unter `output/video-studio-e2e-2026-08-07/`. Der Ordner ist absichtlich nicht versioniert.

## Ehrlicher E2E-Umfang

Die geprüfte Kette ist:

`gemeinsamer Projektvertrag -> render.timeline-Routenauswahl -> lokaler Timeline-Arbeiter -> MP4 -> Medienprüfung`

Der Test beweist damit die austauschbare Render-Schnittstelle und die Montage bis zur fertigen Datei. Die in der Leistungsdemo gezeigten vorbereiteten Szenen stammen aus bereits vorhandenen internen Prüfclips. Ihre jeweiligen Vorbereitungs- und Makler-Fähigkeiten wurden in diesem Lauf nicht erneut über eigene Arbeiter erzeugt.

## Ausführen

```bash
npm run video-studio:e2e
```

Der Lauf baut beide Projekte aus vorhandenem Material, wählt den lokalen Arbeiter über die Fähigkeitsregistrierung aus, rendert beide Timelines und schreibt `local-e2e-report.json`.

## Verifizierter Stand

- Beide Jobs enden mit `succeeded` und neutralem Statuscode `result_ready`.
- Beide Dateien sind 720 × 1280, H.264, 30 Bilder pro Sekunde und besitzen eine AAC-Spur.
- Die Ausgabedauer liegt jeweils innerhalb von 0,15 Sekunden zur geplanten Dauer.
- Beide Dateien lassen sich vollständig dekodieren.
- Die geführte Fassung besitzt noch keinen hörbaren Ton; die AAC-Spur ist für eine einheitliche Timeline vorhanden.
- Die Leistungsdemo enthält hörbares Material aus einem bestehenden Prüfclip.
- Einstieg, Abschluss, Langtextumbruch und Makler-Komposition wurden zusätzlich als Einzelbilder kontrolliert.

## Noch nicht bewiesen

- Kein Netzwerk-, Deployment-, Speicher- oder externer Arbeiter-E2E
- Keine erneute Erzeugung der vorbereiteten Spezialclips
- Keine Musik-, Sprach- oder Atmosphärengestaltung für die geführte Fassung
- Keine produktive 1080 × 1920-Ausgabe
- Kein vollständiger Freigabeablauf von Vorschau über Maklerfreigabe bis Endfassung
- Kein ausgeführter Wechsel zwischen geführter und detaillierter Ansicht im Frontend

Der nächste technische Schritt ist ein realer `prepare.*`-Arbeiter hinter demselben Vertrag. Danach kann die erste vorbereitete Szene ohne Änderung des Projektformats erzeugt, geprüft und in die Timeline übernommen werden.
