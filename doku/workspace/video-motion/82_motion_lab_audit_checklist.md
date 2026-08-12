# Motion Lab Audit Checklist v0.1

## Zweck

Diese Checkliste beschreibt, welche internen Motion-Lab-Signale vor einer
spaeteren Pix.mo-Integration sichtbar sein muessen. Sie ist keine Public-UI-
Spezifikation und kein Freigabeversprechen.

## Dashboard-Mindestwerte

Das interne Dashboard muss zeigen:

- Anzahl Testbilder
- Anzahl Shot Tests
- Anzahl Qwen Jobs
- Anzahl Preview Render Jobs
- Anzahl Shot Ratings
- fehlgeschlagene Jobs
- blockierte Jobs
- beste Presets
- schlechteste Presets
- Presets ohne Tests
- offene Fehlerfaelle
- externe Datenfluesse

## Audit-Fragen

- Gibt es genug echte Testbilder fuer die wichtigsten Motivklassen?
- Wurden KB-, PX-, QW- und MX-Presets wenigstens als interne Versuche erfasst?
- Gibt es Presets ohne Shot Tests oder Ratings?
- Wiederholen sich Fehlerfaelle bei bestimmten Presets?
- Sind Qwen-Jobs nur Mock-Jobs oder gibt es bewusst freigegebene Real-Calls?
- Gibt es fehlgeschlagene oder blockierte externe Datenfluesse?
- Wurden Renderjobs nur als Preview verstanden und nicht als finale Ausgabe?
- Sind Ratings exportierbar, damit spaeter Presets verbessert werden koennen?

## Stop-Kriterien vor Public UI

Keine Public-Integration, wenn:

- zentrale Presets keine Tests haben,
- viele Ratings ohne Notizen oder Fehlerfall-Dokumentation existieren,
- externe Jobs unklar zwischen Mock und Real-Call unterscheiden,
- Render-Ergebnisse als finale Qualitaet missverstanden werden koennten,
- die Bewertung nicht als JSON/CSV auswertbar ist,
- interne Risiken nicht im Dashboard sichtbar werden.

## Session-32-Grenze

Session 32 berechnet nur interne Dashboard-/Audit-Daten aus uebergebenen
Records. Sie baut keine Route, keine echte UI, keine Datenbank, keine
Provider-Calls und keine Public-Integration.
