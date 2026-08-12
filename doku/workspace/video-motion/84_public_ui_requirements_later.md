# Public UI Requirements Later v0.1

## Zweck

Dieses Dokument sammelt Anforderungen fuer eine spaetere Pix.mo Public UI. Es
ist bewusst noch keine Umsetzung, kein Routing-Plan und kein Designauftrag.

## Grundregel

Die spaetere Public UI darf nicht das interne Motion Lab kopieren. Sie muss
weniger technische Details zeigen, klare Nutzerfuehrung haben und nur getestete
Funktionen freigeben.

## Public UI darf zeigen

- hochgeladene oder ausgewaehlte Immobilienbilder
- einfache Bildauswahl fuer ein Social-Video
- verstaendliche Stilrichtung statt interner Creative-Profile
- wenige getestete Videoformen
- einfache Dauer- oder Formatvorschlaege
- Preview-Status
- verstaendliche Warnungen bei ungeeignetem Bildmaterial
- final freigegebene Beispielbewegungen
- klare CTA- und Exportoptionen

## Public UI darf nicht zeigen

- interne Adapterstatus
- Qwen- oder Provider-Rohpayloads
- Mock-/Real-Call-Schalter
- interne Storage-Pfade
- technische Failure Codes ohne Erklaerung
- Preset-Rohscores
- ungetestete experimentelle Presets
- Debug-Warnungen aus dem Lab
- unfertige Render-Timeline-Daten

## Erforderliche UI-Zustaende

Eine spaetere Public UI braucht mindestens:

- leerer Zustand ohne Bilder
- Upload laeuft
- Bildanalyse laeuft
- ungeeignetes Bildmaterial
- Auswahl bereit
- Preview wird vorbereitet
- Preview fehlgeschlagen
- Preview bereit
- Export wird vorbereitet
- Export fehlgeschlagen
- Export bereit
- externe Dienstleistung temporaer nicht verfuegbar
- sichere Wiederaufnahme nach Reload

## Erforderliche Produktentscheidungen

Vor einer Public UI muss geklaert sein:

- Welche Videoformen duerfen Kunden sehen?
- Welche Presets sind freigegeben?
- Wie wird "modern" nutzerverstaendlich beschrieben?
- Welche Fehler darf das System automatisch korrigieren?
- Wann muss ein Mensch eingreifen?
- Welche Provider-Kosten entstehen pro Versuch?
- Welche Preview-Qualitaet ist akzeptabel?
- Welche finalen Exportformate werden angeboten?
- Wie werden Kundendaten und Testdaten getrennt?

## Mindestqualitaet vor Public UI

Keine Public UI, bevor:

- zentrale Presets echte Testbilder und Ratings haben,
- fehlgeschlagene Provider- oder Renderjobs verstaendlich behandelt werden,
- Preview und finale Ausgabe klar getrennt sind,
- Speicherorte und Datenlebensdauer definiert sind,
- Zugriffsschutz und Rechte geklaert sind,
- Kosten- und Retry-Logik fuer externe Dienste entschieden ist,
- interne Debugfelder entfernt oder uebersetzt sind.

## Spaetere Uebergabe aus dem Lab

Das Lab sollte spaeter nur kuratierte Ergebnisse liefern:

- freigegebene Presets
- bekannte Failure Cases
- empfohlene Bildanforderungen
- robuste Default-Dauern
- getestete Textslot-Regeln
- klare Provider-Grenzen
- Audit-Ergebnisse pro Preset

Alles andere bleibt intern.
