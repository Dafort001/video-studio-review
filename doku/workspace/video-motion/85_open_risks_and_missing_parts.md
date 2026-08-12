# Motion Lab Open Risks And Missing Parts v0.1

## Zweck

Dieses Dokument haelt offene Risiken und fehlende Teile fest, die vor einer
Pix.mo-Integration oder echten Provider-Nutzung geklaert werden muessen.

## Technische Risiken

- Es gibt noch keinen echten internen Serverstart.
- Es gibt noch keine Auth- oder Admin-Grenze.
- Es gibt keine echte Datei-Persistenz.
- Lokale Storage-Pfade sind geplant, aber noch nicht geschrieben.
- ExternalJob-Daten sind ueber Adapter-/Job-Records verteilt.
- Renderjobs erzeugen Preview-Metadaten, keine echten Videodateien.
- Qwen-Jobs koennen vorbereitet und gemockt werden, aber echte Calls sind nicht
  freigegeben.
- Avatar-/Presenter-Flows sind noch Mock-Logik.
- Dashboard-Rankings haengen komplett von uebergebenen Rating-Daten ab.

## Produkt- und UX-Risiken

- Interne Motionsprache ist fuer Kunden zu technisch.
- "Modern", "Premium" und "Social" muessen in sichtbare Produktoptionen
  uebersetzt werden.
- Zu viele Presets koennen die spaetere UI schwer bedienbar machen.
- Kunden koennten Preview-Qualitaet mit finaler Ausgabe verwechseln.
- Fehlerfaelle brauchen nutzerverstaendliche Texte.
- Bildauswahl und Bildreihenfolge koennen wichtiger sein als weitere
  Preset-Optionen.
- Kurze Social-Clips duerfen nicht wie klassische Objekt-Rundgaenge wirken.

## Provider-Risiken

- Qwen-Kosten, Rate Limits und Retry-Verhalten sind noch nicht entschieden.
- Qwen-Outputs muessen auf Geometrie, Fenster, Tueren, Moebel und Lichtlogik
  bewertet werden.
- HeyGen/Avatar darf normale Immobilienvideos nicht in Talking-Head-Videos
  verwandeln.
- Externe Render- oder Storage-Dienste brauchen klare Fehler- und
  Abbruchregeln.
- Mock-Ergebnisse duerfen nicht als reale Provider-Qualitaet gelten.

## Fehlende Tests

- End-to-End-Test mit echten Immobilienbildern
- Testserien pro Motivklasse
- Rating-Vergleich pro Preset
- Qwen-Output-Bewertung mit echten Bildern
- Preview-vs-Final-Qualitaetsvergleich
- Fehlerfall-Dokumentation pro Preset
- CSV-/JSON-Auswertung mit mehreren Ratings
- Dashboard-Audit mit realen Job-Historien
- Zugriffsschutz-Test fuer spaetere interne Server-App

## Uebersehene UI-Zustaende

Noch nicht geloest:

- Bild ungeeignet fuer Bewegung
- zu wenige Bilder fuer Zielvideo
- Provider temporaer nicht verfuegbar
- Provider-Output unbrauchbar
- Preview vorbereitet, aber Datei fehlt
- Rating vorhanden, aber Preset-Summary fehlt
- Preset ohne Testbilder
- Shotplan mit nur Placeholder-Motion
- Export angefragt, aber nur Preview-Qualitaet vorhanden

## Komplizierte Workflows

Folgende Workflows muessen spaeter vereinfacht werden:

- Motivklasse manuell setzen
- Preset aus technischer Liste waehlen
- Qwen-Prompts bewerten
- externe Job-Payloads verstehen
- Ratings und Failure Cases getrennt pflegen
- Dashboard-Warnungen in konkrete naechste Schritte uebersetzen

## Naechste sinnvolle Klaerung

Vor einer Public-Integration sollte das Team mit echten Bildern klaeren:

- Welche Presets funktionieren sichtbar gut?
- Welche Presets fallen wiederholt durch?
- Welche Bildtypen sind fuer Social Clips ungeeignet?
- Welche Fehlerfaelle sind tolerierbar?
- Welche Preview-Qualitaet reicht fuer interne Entscheidungen?
- Welche Felder muessen spaeter wirklich in Pix.mo sichtbar werden?
