# Objektvideo PixImmo / Modal Handover

Stand: 2026-06-26, 20:52 CEST

Status 2026-06-29: **Render-Plumbing behalten, Produkt-/Creative-Richtung
superseded.**

Dieser Handover bleibt nur als technische Referenz fuer den bestehenden
PixImmo Social Clip Lab Bridge zu Modal/R2 erhalten. Die neue kreative
Video-Motion-Richtung liegt unter `docs/video-motion/MASTERPLAN.md` und ersetzt
die alten Objektvideo-/A-J-Konzepttexte als Produktgrundlage.

## Update 2026-06-28, 19:27 CEST

Render-UX auf beta.pix.immo ist nach Daniels Live-Test verbessert und deployed.

- PixImmo commit: `3c8d33c Improve object video render download status`
- Vercel deploy: `dpl_Rh9aSN5rqeQPZoYD9mVuH8BAwJyP`
- Sicherung des zuvor erzeugten Kunden-Testvideos:
  `/Users/danielfortmann/Desktop/2026OBJ-Mov.mp4`
- Nach `Video vorbereiten` bleibt der User nicht gefuehlt auf einer alten Seite,
  sondern landet im eigenen Schritt `Videoausgabe`.
- `Videoausgabe` zeigt `Renderplan bereit`, Renderumfang, Schaetzung und den
  Button `Basisvideo erstellen`.
- Waehrend eines Renders lautet der Status klar:
  `Die Szenen werden berechnet. Danach wird das Video zusammengesetzt.`
- Wenn Modal `done` meldet, zeigt die UI `Download bereit` sowie zwei Aktionen:
  `Video herunterladen` und `Im Browser oeffnen`.
- Browsercheck auf `https://beta.pix.immo/dashboard/admin/video?sessionId=intk_kOsOgubJABKRyiH7`:
  4 Motive ausgewaehlt, gespeicherte Vorschlaege wiederverwendet, Empfehlung
  uebernommen, `Video vorbereiten` geklickt. Ergebnis: `Videoausgabe`,
  `Renderplan bereit`, `Basisvideo erstellen` sichtbar. Kein neuer Render
  gestartet, Browser-Console ohne Errors.

## Update 2026-06-28, Social-Clip-Naming

Kunden-/webseitensichtbar heisst die Funktion jetzt `Social Clip`, nicht mehr
`Objektvideo`, weil `Objektvideo` missverstaendlich nach 360-Grad- bzw.
Orbit-Video um ein Objekt klingt.

- PixImmo commit: `0046729 Rename object video UI to Social Clip`
- Vercel deploy: `dpl_GsT1YKpZSRXbGg9V8wozuF3F6Vya`
- Geaendert wurden sichtbare Labels auf Admin-Seite, Kunden-Dashboard,
  Admin-Navigation, Intake-Link, Job-Link, Lab-Seite und Builder-Status.
- Technische Pfade, Komponenten, API-Routen und Storage-Keys bleiben vorerst
  `objektvideo`, damit der bestehende Modal/R2-Pfad stabil bleibt.
- Browsercheck auf `https://beta.pix.immo/dashboard/admin/video?sessionId=intk_kOsOgubJABKRyiH7`:
  Seitentitel `Social Clip | PIX.IMMO Admin`, `Social Clip Builder` und
  `Social Clip aus fertigen Immobilienbildern` sichtbar; alte sichtbare
  `Objektvideo Builder`-Texte nicht mehr sichtbar.

## Kurzfassung

PixImmo hat jetzt einen echten technischen Renderpfad fuer Objektvideos:

```text
PixImmo Lab
-> lokale Bilder / spaeter Kundenbilder
-> R2 Upload oder bestehende R2 Keys
-> Modal pix-social-video
-> OpenCV/FFmpeg MP4 Render
-> R2 MP4 + signierter Link
```

Das ist ein funktionierender technischer Renderanschluss, aber noch nicht die
besprochene intelligente Kundenunterstuetzung.

Der naechste Agent soll nicht erneut den Renderpfad bauen. Der naechste Schritt
ist die Vorschlags-/Assistenzschicht vor dem Render:

```text
Kunde waehlt Bilder
-> System schlaegt Auswahl-/Bewegungs-/Frame-Hilfen vor
-> Kunde sieht Vorschlaege klar markiert
-> Kunde uebernimmt, aendert oder ignoriert
-> erst dann rendern
```

## Aktueller Produktstand

Funktioniert im lokalen PixImmo Lab:

- Bilder lokal laden.
- Bilder auswaehlen und sortieren.
- Startbild festlegen.
- Bewegung, Marker, Startframe, Endframe und Zeitkurve manuell setzen.
- Renderplan vorbereiten.
- `MP4 rendern` startet echten Modal-Render.
- UI zeigt Upload-/Start-/Renderstatus und danach einen Videolink.

Nicht fertig:

- Keine intelligente Auswahlunterstuetzung.
- Keine beratende Qwen/GPT-Schicht im PixImmo-Lab-Flow.
- DA3 ist nur optional im Modal-Worker vorbereitet, aber nicht als sichtbarer
  Kundenassistent verdrahtet.
- Keine Vorschlaege wie:
  - dieses Bild eignet sich als Startbild
  - diese Bilder sind doppelt/schwach
  - diese Bewegung passt besser
  - hier sollte der Endframe auf Detail/Fenster/Hauptraum liegen
  - dieses Bild braucht manuelle Pruefung
- Keine klare Trennung in der UI zwischen `vom Kunden gewaehlt` und
  `vom System vorgeschlagen`.

Wichtig: Daniel hat genau diese fehlende Assistenzschicht angemahnt. Nicht mit
"der Render funktioniert" antworten, wenn er nach intelligenter Automatik fragt.

## Warum Das Wichtig Ist

Die alte Voleur/Social-Video-Automatik wurde am 2026-06-25 als Produktlogik
verworfen. Sie machte technisch ein Video, aber nicht das, was der Kunde oder
Makler wollte. Daher gilt weiterhin:

- Automatik darf Vorschlaege machen.
- Automatik darf nicht heimlich Regie fuehren.
- Der Kunde muss Auswahl, Reihenfolge, Bewegungen und kritische Frames
  verstehen und uebernehmen koennen.
- Ein Fallback darf rendern, aber die gute Produktlogik ist
  "Assistent statt Autopilot".

## Code-Stand

PixImmo repo:

```text
projects/piximmo-web
Branch: codex/piximmo-portal-merge
Commit: 474a2d2 Connect object video lab to Modal renderer
```

Wichtige Dateien:

```text
src/components/objektvideo/PixImmoObjektvideoLab.tsx
src/lib/modal-config.ts
src/app/api/objektvideo/render/presign/route.ts
src/app/api/objektvideo/render/start/route.ts
src/app/api/objektvideo/render/status/[callId]/route.ts
src/app/modal/objektvideo-lab/page.tsx
src/app/dashboard/video/page.tsx
src/app/dashboard/admin/video/page.tsx
```

Voleur Backend / Modal:

```text
projects/voleurdimages-backend
Branch: codex/pipeline-batchworker-20260418
Commit: a737ad8 Add async social video render jobs
```

Wichtige Dateien:

```text
modal_app/social_video_worker.py
modal_app/social_video_render.py
modal_app/social_video_cv.py
modal_app/social_video.py
```

Modal app:

```text
pix-social-video
https://dafort001--pix-social-video-social-video-api.modal.run
```

Aktive Endpunkte:

```text
GET  /
POST /render/crop
POST /render/crop/start
GET  /render/crop/status/{call_id}
```

## Technische Architekturgrenze

Nicht wieder brechen:

- PixImmo/Vercel darf nur UI, Presign, Orchestrierung, Status und Downloadlink
  machen.
- Kein FFmpeg/OpenCV/DA3/GPU/long-running MP4-Render in Vercel Serverless.
- Modal rendert.
- R2 speichert Quellen, Previews und MP4-Artefakte.

Aktueller Lab-Weg:

- Browserbilder werden per `POST /api/objektvideo/render/presign` vorbereitet.
- Der Browser laedt direkt per presigned PUT nach R2.
- `POST /api/objektvideo/render/start` startet Modal async.
- `GET /api/objektvideo/render/status/[callId]` pollt Modal.
- Modal laedt R2-Bilder, rendert MP4, schreibt MP4 nach R2 und gibt signed URL
  zurueck.

Spaeterer Produktweg:

- Kunden-/Objektbilder aus PixImmo sollten direkt ueber bestehende R2 Keys an
  denselben Modal-Render gehen.
- Lokaler Upload im Lab ist nur der aktuelle Test-/Prototyp-Eingang.

## Verifikation Heute

Modal deploy:

```text
modal deploy modal_app/social_video_worker.py
```

Modal Health:

```text
curl https://dafort001--pix-social-video-social-video-api.modal.run/
```

Antwort enthielt:

```text
["/render/crop","/render/crop/start","/render/crop/status/{call_id}"]
```

Checks:

```text
python3 -m unittest modal_app.test_social_video modal_app.test_social_video_cv
npx eslint src/components/objektvideo/PixImmoObjektvideoLab.tsx src/lib/modal-config.ts src/app/dashboard/video/page.tsx src/app/dashboard/admin/video/page.tsx 'src/app/api/objektvideo/render/presign/route.ts' 'src/app/api/objektvideo/render/start/route.ts' 'src/app/api/objektvideo/render/status/[callId]/route.ts'
npx tsc --noEmit --pretty false
```

Alle liefen erfolgreich.

Direkter echter Render-Test ueber PixImmo API:

- Dev Server: `http://localhost:3032`
- Testbilder:
  - `public/demo/DEM-DEMO1_living_room_m01_e01.jpg`
  - `public/demo/DEM-DEMO2_kitchen_m01_e01.jpg`
- Ablauf: PixImmo Presign -> R2 PUT -> PixImmo Modal Start -> Status Polling
  -> MP4 fertig.
- Modal Call ID:
  `fc-01KW2K0DE11YNCZNHZSQAKB7V6`
- Finaler Test-MP4-Key:
  `social-video/renders/20260626-182757-42feafeb/social-video-crop-render-60fps-h264.mp4`

## Lokaler Dev-Server

Der alte Prozess auf `3031` antwortete nach den Codeaenderungen mit HTTP 500
ohne sichtbare Thread-Terminal-Logs.

Ein frischer Server wurde gestartet:

```text
cd /Volumes/drive\ 1/PIXCAPTURE/projects/piximmo-web
npm run dev -- -p 3032
```

Seite:

```text
http://localhost:3032/modal/objektvideo-lab
```

Die Seite lud mit HTTP 200.

## Offener Naechster Schritt

Daniel wollte direkt danach, dass die fehlende intelligente
Kundenunterstuetzung geaendert wird. Wegen vollem Kontext wurde die Arbeit
gestoppt und diese Uebergabe geschrieben.

Naechster Agent soll als erstes eine Vorschlagsschicht planen/implementieren:

1. Nach Bildauswahl eine sichtbare Analyse-/Vorschlagsphase anbieten, z.B.
   `Vorschlaege erstellen`.
2. Pro Bild Vorschlagsstatus anzeigen:
   - `empfohlen`
   - `optional`
   - `unsicher`
   - `nicht empfohlen`
3. Pro Bild Grund anzeigen:
   - Startanker/Fassade
   - starker Hauptraum
   - wichtiger Funktionsraum
   - Detail nur mit Anker
   - doppelt/aehnlich
   - schwach/unklar
   - manuell pruefen
4. Pro Szene Vorschlaege fuer Bewegung und Start-/Endframe erzeugen.
5. UI muss klar zeigen:
   - Vorschlag vom System
   - vom Kunden uebernommen
   - vom Kunden geaendert
   - vom Kunden verworfen
6. Render darf weiterhin mit Defaultwerten funktionieren, aber die
   Produktfuehrung soll den Kunden aktiv unterstuetzen.

Gute technische Reihenfolge:

1. Erst lokale heuristische Vorschlaege im PixImmo Lab bauen, ohne Qwen/GPT.
2. Danach optional Qwen/GPT als beratende Textebene anbinden.
3. DA3 nur fuer sichtbare Tiefen-/Bewegungsvorschlaege verwenden, nicht als
   versteckte Pflicht.

## Nicht Tun

- Nicht wieder behaupten, Qwen/GPT/DA3 seien bereits im PixImmo-Lab intelligent
  verbunden.
- Nicht einen neuen Renderweg bauen.
- Nicht FFmpeg nach Vercel verschieben.
- Nicht die alte verworfene Voleur-Automatik als Produktantwort reaktivieren.
- Nicht "Video erstellen geht" mit "Kundenunterstuetzung geht" verwechseln.

## Git-/Commit-Status Zum Zeitpunkt Dieser Uebergabe

Bereits gepusht:

```text
projects/voleurdimages-backend
a737ad8 Add async social video render jobs
origin/codex/pipeline-batchworker-20260418

projects/piximmo-web
474a2d2 Connect object video lab to Modal renderer
origin/codex/piximmo-portal-merge
```

Der Root-Handover/Gitlink-Commit haelt diese Uebergabe und die neuen
Subrepo-Pointer fest.

Unrelated dirty state, nicht von dieser Objektvideo-Arbeit anfassen:

```text
docs/HANDOVERS/PIXCAPTURE_CURRENT_RELEASE_STATE.md
projects/pixcapture-web
```

## Update 2026-06-26, 21:35 CEST - Echte Analysephase Angebunden

Nach Daniels Rueckfrage, warum nur halb gebaut wurde, wurde die
Vorschlags-/Assistenzphase nicht mehr als lokale Platzhalterlogik belassen.

Neu:

- PixImmo Lab hat jetzt eine echte `Analyse`-Phase zwischen Motivauswahl und
  Timeline.
- Beim Weitergehen nach der Motivauswahl werden die ausgewaehlten Bilder fuer
  die Analyse nach R2 hochgeladen.
- PixImmo startet danach Modal async ueber:

```text
POST /api/objektvideo/analyze/start
GET  /api/objektvideo/analyze/status/[callId]
```

- Die PixImmo-Routen proxien auf die Modal-App `pix-social-video`.
- Modal wurde neu deployed und expose't jetzt:

```text
POST /analyze/start
GET  /analyze/status/{call_id}
POST /render/crop
POST /render/crop/start
GET  /render/crop/status/{call_id}
```

- Modal laedt die R2-Bilder, ruft Qwen ueber `qwen_provider.py` und
  `dashscope-secret`, normalisiert die JSON-Antwort und liefert pro Motiv:
  Status, Grund, Detailtext, Scores, Raumtyp, Bewegungsvorschlag und
  Crop-Fokus.
- PixImmo uebersetzt die Modal/Qwen-Antwort in sichtbare Kundenvorschlaege:
  `empfohlen`, `optional`, `unsicher`, `nicht empfohlen` plus
  `Systemvorschlag`, `uebernommen`, `geaendert`, `verworfen`.
- Der Renderplan traegt die Assistance-Metadaten mit, damit spaeter sichtbar
  bleibt, welche Vorschlaege uebernommen oder verworfen wurden.

Geaenderte Dateien:

```text
projects/piximmo-web/src/components/objektvideo/PixImmoObjektvideoLab.tsx
projects/piximmo-web/src/app/api/objektvideo/analyze/start/route.ts
projects/piximmo-web/src/app/api/objektvideo/analyze/status/[callId]/route.ts
projects/voleurdimages-backend/modal_app/social_video_worker.py
```

Verifikation:

```text
npx eslint src/components/objektvideo/PixImmoObjektvideoLab.tsx src/app/api/objektvideo/analyze/start/route.ts 'src/app/api/objektvideo/analyze/status/[callId]/route.ts'
npx tsc --noEmit --pretty false
python3 -m py_compile modal_app/social_video_worker.py
python3 -m unittest modal_app.test_social_video modal_app.test_social_video_cv
modal deploy modal_app/social_video_worker.py
curl -s https://dafort001--pix-social-video-social-video-api.modal.run/
```

Health zeigte die neuen Analyse-Endpunkte. Ein negativer PixImmo-API-Smoke mit
leerem `scenes`-Array startete einen Modal-Job und lieferte im Status sauber
`No scenes supplied for analysis`, womit Start-/Status-Routing validiert ist.

Echter 2-Bild-Qwen-Smoke:

- Dev Server: `http://localhost:3033`
- Bilder:
  - `public/demo/DEM-DEMO1_living_room_m01_e01.jpg`
  - `public/demo/DEM-DEMO2_kitchen_m01_e01.jpg`
- Ablauf: PixImmo Presign -> R2 PUT -> PixImmo Analyse Start -> Modal/Qwen ->
  Status Polling.
- Modal Call ID:
  `fc-01KW2Q7T393NHE6BEZ1BHMWW95`
- Ergebnis:
  `status=done`, `provider=dashscope`, `model=qwen3.7-plus`, `2/2`
  Analysezeilen, `0` Failures.

Weiter offen:

- Der direkte Lab-Upload nutzt jetzt Qwen/Modal, aber Wiederverwendung
  bestehender PixImmo-/PixCapture-ProcessedImage-Analysen ist noch nicht
  angeschlossen, weil der Lab-Flow aktuell keine konkrete Job-/Galeriequelle
  uebergibt.
- Naechster Schritt: sobald Bilder aus einer echten PixImmo/PixCapture-Quelle
  kommen, zuerst vorhandene Analyse nachschlagen und nur fehlende Motive an
  Modal/Qwen schicken.

## Update 2026-06-26, 22:05 CEST - Kundentexte Und Wartezeit Gekuerzt

Daniel hat zwei harte Produktkorrekturen gegeben:

- Kundenseiten duerfen keine internen Dienst-/Provider-Namen zeigen. Begriffe
  wie Qwen, LLM, Modal, R2, Cloudflare, DashScope, DA3 oder MP4 sind auf der
  Kundenseite falsch.
- Prozent-Wertigkeiten in den Vorschlagskarten sind irrefuehrend. Sie wirken
  wie objektive Qualitaetsnoten, obwohl das System eigentlich Rollen und
  Verwendungskontext im Video vorschlaegt.

Geaendert in PixImmo:

- Sichtbare Status-/Fehlertexte wurden auf neutrale Kundensprache umgestellt:
  `Analyse`, `Bildpruefung`, `System`, `Videoverarbeitung`,
  `Video erstellen`.
- Interne Fehler werden ueber `publicStatusMessage(...)` maskiert, sobald sie
  interne Begriffe enthalten.
- Die Vorschlagskarten zeigen keine Prozentwerte mehr, sondern Rollen wie:
  `Rolle: Einstieg`, `Rolle: Hauptmotiv`, `Rolle: Raum ergaenzen`,
  `Rolle: Detail`, `Rolle: pruefen`, `Rolle: eher weglassen`.
- Page-Metadata und sichtbare Headline wurden von `Objektvideo Lab` auf
  kundentaugliches `Objektvideo` bereinigt.

Geaendert in Modal:

- Die Bildanalyse laeuft nicht mehr strikt nacheinander.
- Vor dem Analyseaufruf werden Bilder auf maximal 1600 px Kantenlaenge
  verkleinert und als JPEG Quality 82 vorbereitet.
- Die Analyse laeuft mit begrenzter Parallelitaet:
  `maxAnalysisParallelism` oder `SOCIAL_VIDEO_ANALYSIS_PARALLELISM`, Default 4,
  gedeckelt auf 1..6.
- Das Ergebnis enthaelt `performance` und pro Bild `analysisImage`, damit spaeter
  sichtbar ist, wie stark die Vorbereitung die Laufzeit beeinflusst.

Verifikation nach Deploy:

- Modal App `pix-social-video` neu deployed.
- Health zeigt weiterhin:

```text
POST /analyze/start
GET  /analyze/status/{call_id}
POST /render/crop
POST /render/crop/start
GET  /render/crop/status/{call_id}
```

- Echter 2-Bild-Smoke nach Optimierung:
  - Modal Call ID: `fc-01KW2RC2004PFVZH16MVM0PVWG`
  - Status: `done`
  - Analysezeilen: `2/2`
  - Failures: `0`
  - Worker Performance: `elapsedSeconds=10.367`, `parallelism=2`,
    `downloadedImages=2`
  - Bild 1: 3000x2000, 1,059,908 Bytes -> 1600x1067, 148,424 Bytes
  - Bild 2: 3000x2000, 2,407,934 Bytes -> 1600x1067, 439,737 Bytes
  - Einzelne Modellzeiten: ca. 6.21s und 8.36s; durch Parallelisierung ist die
    Worker-Zeit nun eher am langsamsten Einzelbild plus Overhead orientiert,
    nicht an der Summe aller Bilder.

Noch offen fuer weitere Wartezeitkuerzung:

- Analyseergebnisse serverseitig/jobbezogen wiederverwenden, nicht nur per
  localStorage im direkten Lab-Pfad.
- Uploads fuer Analyse und Render zusammenfuehren, damit dieselben R2-Keys nicht
  doppelt vorbereitet werden.
- Progressive Vorschlaege anzeigen, sobald einzelne Bilder fertig sind. Dafuer
  braucht der Worker Status-Artefakte oder kleinere per-Bild-Jobs statt nur ein
  finales Modal-Ergebnis.
- Sobald die Auswahl stabil ist, kann die Vorbereitung im Hintergrund starten,
  waehrend der Kunde noch prueft.

## Update 2026-06-26, 22:20 CEST - Renderdauer Sichtbar Machen

Daniel hat zurecht darauf hingewiesen, dass ein echter Render mit vielen Clips
nicht wie ein kurzer Knopfdruck behandelt werden darf. Bei 60 Bildern/Sek. und
z.B. 20 Clips a 2,5 Sekunden entstehen ca. 3.000 Einzelbilder plus Kodierung.

Kontrolle im Code:

- PixImmo startet den Render mit `fps: 60`.
- Der Modal-Worker setzt ebenfalls Default `fps=60`, falls kein Wert uebergeben
  wird.
- Der Renderer erzeugt das finale H.264-Video als 60-FPS-Datei.

Geaendert in PixImmo:

- `RENDER_FPS = 60` ist als UI-Konstante gesetzt.
- Der Renderplan zeigt jetzt:
  - Clipanzahl
  - Videolaenge
  - geschaetzte Einzelbildanzahl
  - `60 Bilder/Sek.`
  - voraussichtliche Erstellungsdauer
- Waehrend `uploading`, `starting`, `queued` und `running` laeuft ein
  Countdown/Fortschrittsbalken gegen diese Schaetzung.
- Wenn die Schaetzung ueberschritten wird, sagt die UI ehrlich, dass die
  Erstellung laenger dauert, statt bei null stehenzubleiben.

Verifikation:

```text
npx eslint src/components/objektvideo/PixImmoObjektvideoLab.tsx
npx tsc --noEmit --pretty false
python3 -m py_compile modal_app/social_video_render.py modal_app/social_video_worker.py
```

Alle Checks erfolgreich.

## Update 2026-06-26, 22:35 CEST - Realer 8-Motiv-E2E

Daniel bat um einen echten E2E-Test in der realen Umgebung, um zu sehen, was
bricht. Getestet wurde lokal PixImmo `http://localhost:3033` gegen echte
R2-Presign-Uploads und die deployte Modal-App `pix-social-video`.

Testmotivsatz:

```text
DEM-DEMO2_exterior_facade_m01_e01.jpg
DEM-DEMO2_living_room_m01_e01.jpg
DEM-DEMO2_kitchen_m01_e01.jpg
DEM-DEMO2_bedroom_m01_e01.jpg
DEM-DEMO2_bathroom_m01_e01.jpg
DEM-DEMO2_garden_m01_e01.jpg
DEM-DEMO2_balcony_m01_e01.jpg
DEM-DEMO2_terrace_m01_e01.jpg
```

Analyse:

- PixImmo Presign -> R2 PUT: 8/8 erfolgreich.
- Modal Analyse Call ID: `fc-01KW2S5P3Y2HEEVSMFGJJ4ZJZ7`
- Ergebnis: `done`, 8 Analysezeilen, 0 Failures.
- Worker Performance: `elapsedSeconds=25.791`, `parallelism=4`,
  `downloadedImages=8`.
- Polling-Wandzeit ueber PixImmo API: ca. 32.4s.

Render:

- PixImmo Presign -> R2 PUT fuer Render: 8/8 erfolgreich.
- Modal Render Call ID: `fc-01KW2S6V9YV0B4JC32KJ17HP1C`
- Ergebnis: `done`, 8 Szenen, 1080x1920, `fps=60`.
- Polling-Wandzeit ueber PixImmo API: ca. 47.9s.
- Finaler R2-Key:
  `social-video/renders/20260626-201619-0c2e0a60/social-video-crop-render-60fps-h264.mp4`
- Download erfolgreich, lokale Pruefdatei:
  `/tmp/piximmo-objektvideo-e2e-8clip.mp4`
- `ffprobe`: H.264, 1080x1920, `r_frame_rate=60/1`, `duration=18.016667`,
  `nb_frames=1081`.
- Gesamtwandzeit Analyse + Render inkl. Upload/Polling: ca. 91.7s.

Browser/Oberflaeche:

- `http://localhost:3033/modal/objektvideo-lab` lud mit Titel
  `Objektvideo | PIX.IMMO`.
- Keine sichtbaren internen Begriffe in der geladenen Startansicht:
  Qwen, LLM, Modal, R2, Cloudflare, DashScope, DA3, MP4, Objektvideo Lab.
- Keine Browser-Console-Errors.

Gefundene Probleme / Produktluecken:

- Analyse und Render laden dieselben Bilder aktuell zweimal nach R2 hoch. Fuer
  echte Wartezeit und Kosten muss der Render die bereits hochgeladenen
  Analyse-Keys wiederverwenden.
- Der Status bleibt jobbasiert: die UI weiss nicht wirklich `3/8 Clips fertig`,
  sondern nur lokale Schaetzung plus Modal done/running. Fuer echten Fortschritt
  braucht der Worker Status-Artefakte oder Clip-/Batch-Jobs.
- Die naive UI-Zeitrechnung war falsch, weil Fade-Uebergaenge Szenen
  ueberlappen lassen. 8 Clips a 2,5s ergeben nicht 20.0s, sondern durch
  17 Fade-Frames pro Uebergang exakt 1081 Frames bzw. 18.016667s. Die UI wurde
  danach auf framebasierte Schaetzung korrigiert.
- Die Fade-Uebergaenge selbst sind produktseitig noch fraglich; Daniel findet
  sie aktuell nicht gut. Nicht weiter an Fades feilen, bevor die
  Uebergangslogik neu entschieden ist.
- Noch kein verteilter Clip-/Batch-Render. Der aktuelle Render laeuft weiter als
  ein CPU-Container-Job. Parallelisierung ueber Clip- oder Batch-Jobs ist der
  naechste sinnvolle Architekturschritt.

Nachfix nach E2E:

- `RENDER_FADE_SECONDS = 0.28` als UI-Konstante ergaenzt.
- Render-Payload nutzt diese Konstante statt Magic Number.
- UI-Schaetzung berechnet jetzt die echte Framezahl:
  `clips * round(2.5s * 60fps) - (clips - 1) * round(0.28s * 60fps)`.
- Rechencheck fuer 8 Clips: `1081` Frames und `18.016666...s`, passend zu
  `ffprobe`.
- Checks nach Fix:

```text
npx eslint src/components/objektvideo/PixImmoObjektvideoLab.tsx
npx tsc --noEmit --pretty false
```

Beide erfolgreich.

## Update 2026-06-26, 22:45 CEST - Visuelle Bewertung Des E2E-Videos

Das erzeugte MP4 wurde nicht nur technisch per `ffprobe`, sondern visuell ueber
extrahierte Frames/Contact-Sheets geprueft:

```text
/tmp/piximmo-video-review/contact-sheet.jpg
/tmp/piximmo-video-review/keyframes.jpg
/tmp/piximmo-video-review/frames/frame_*.jpg
```

Bewertung:

- Technisch ist das Video gueltig: H.264, 1080x1920, 60 FPS, abrufbar aus R2.
- Produktseitig ist das Ergebnis nicht akzeptabel als vorzeigbares
  Immobilienvideo.
- Die Motivreihenfolge wirkt nicht wie eine Fuehrung durch das Objekt.
- Einige Ausschnitte sind redaktionell schwach bzw. unattraktiv, z.B. Garage,
  harte Fassaden-/Balkonansichten, leere Raum-/Badansichten ohne klare
  Erzaehlung.
- Die Bewegungen/Fades erzeugen eher ein technisches Ken-Burns-Rendering als
  eine gute Objektgeschichte.
- Wichtig: Der E2E-Test hat die Analyse und den Renderpfad bewiesen, aber der
  Renderpayload war ein technischer Testpayload. Er hat die Analyseempfehlung
  nicht wirklich als endgueltige Regie-/Reihenfolgeentscheidung angewendet.

Konsequenz:

- Nicht als Produktreferenz verwenden.
- Als technische Pipeline-Evidenz behalten.
- Naechster Produktarbeitsschritt muss die Regie-/Timeline-Schicht sein:
  Analyseergebnis -> sinnvolle Reihenfolge -> harte Motivfilterung ->
  Uebergangsentscheidung -> erst dann Render.

## Update 2026-06-26, 22:55 CEST - Technische Restpunkte Fuer Morgen Geraeumt

Daniel wollte die technischen Probleme heute Abend noch geklaert haben, damit
morgen nur noch redaktionelle/aesthetische Fragen bleiben.

Umgesetzt:

- Analyse-Upload wird fuer den Render wiederverwendet.
  - Modal Analyseergebnisse enthalten jetzt `inputScenes` mit den verwendeten
    R2-Keys.
  - PixImmo speichert diese Keys im `AssistanceRun`.
  - Beim Render sucht PixImmo zuerst diese Keys und laedt nur noch fehlende
    Bilder neu hoch.
  - Wenn alle Keys vorhanden sind, zeigt die UI:
    `Vorbereitete Bilder werden wiederverwendet. Es ist kein erneuter Upload noetig.`

- Echter Render-Fortschritt wurde eingebaut.
  - PixImmo erzeugt vor Renderstart eine `renderJobId`.
  - Modal schreibt Fortschritt als JSON nach R2:
    `social-video/render-progress/{renderJobId}.json`
  - Die PixImmo Statusroute reicht `renderJobId` an Modal weiter.
  - Modal Status gibt waehrend `running` ein `progress`-Objekt zurueck.
  - UI nutzt echten Fortschritt, wenn vorhanden, sonst weiterhin die
    Countdown-Schaetzung.

Progress-Stufen:

```text
downloading
rendering 0/N
rendering 1/N ...
encoding
uploading
done
```

Deploy:

```text
modal deploy modal_app/social_video_worker.py
```

Echter 3-Bild-Smoke nach Deploy:

- Analyse Call: `fc-01KW2T74CTWQGKVA0XD4T02PPZ`
- Analyse: 3/3 Zeilen, 0 Failures, `inputScenes=3`, R2-Keys vorhanden.
- Render Call: `fc-01KW2T7KX10SV47895AZXTZPJD`
- Render: `done`, 3 Szenen, `fps=60`
- Finaler R2-Key:
  `social-video/renders/20260626-203412-4b781b38/social-video-crop-render-60fps-h264.mp4`
- Fortschritt wurde real aus Modal/R2 gelesen:

```text
rendering:0/3:5
rendering:1/3:31.7
rendering:2/3:58.3
encoding:3/3:90
uploading:3/3:96
done:3/3:100
```

Checks:

```text
npx eslint src/components/objektvideo/PixImmoObjektvideoLab.tsx 'src/app/api/objektvideo/render/status/[callId]/route.ts'
npx tsc --noEmit --pretty false
python3 -m py_compile modal_app/social_video_worker.py modal_app/social_video_render.py
python3 -m unittest modal_app.test_social_video modal_app.test_social_video_cv
```

Alle erfolgreich.

## Finaler Restart-Hinweis Fuer Den Naechsten Agenten

Beim Fortsetzen hier starten:

1. Die technische Pipeline nicht neu bauen.
2. Der aktuelle technische Stand ist:
   - Analyse real ueber Modal.
   - Render real ueber Modal.
   - 1080x1920, 60 FPS.
   - `fadeSeconds = 0.28`.
   - Analyse-R2-Keys werden fuer Render wiederverwendet.
   - Echter Render-Fortschritt ist eingebaut.
3. Morgen muss PixImmo produktseitig finalisiert werden:
   - Ziel: vernuenftiges Objektvideo mit ca. 25 bis 40 Sekunden.
   - Fokus: Motivfilterung, Reihenfolge, Regie, Bewegung, Uebergangswirkung.
   - Ergebnis muss visuell bewertet werden, nicht nur per `ffprobe`.

Wenn etwas getestet wird, dann mit bewusst ausgewaehlten Immobilienmotiven und
mit der Frage: Wuerde man dieses Video einem Makler/Kunden zeigen?

## Schlussuebergabe 2026-06-26, 22:47 CEST - Auftrag Fuer Den Naechsten Agenten

Ziel fuer morgen:

PixImmo muss aus fertigen Immobilienbildern ein vernuenftiges Objektvideo von
ca. 25 bis 40 Sekunden erzeugen. Die technische Pipeline steht; morgen muss der
Produkt-/Regieteil so weit finalisiert werden, dass ein Makler/Kunde daraus ein
brauchbares Video bekommt und nicht nur einen technischen Render.

### Was Heute Erledigt Wurde

- PixImmo Objektvideo-Seite ist kundentauglicher verdrahtet:
  - Motivauswahl
  - Analyse-/Vorschlagsphase
  - Uebernehmen/Aendern/Verwerfen
  - Renderplan
  - Video-Renderstart
  - Status/Downloadlink
- Kundenseite zeigt keine internen Provider-/Infrastrukturbegriffe mehr.
  Keine sichtbaren Namen wie Qwen, LLM, Modal, R2, Cloudflare, DashScope, DA3
  oder MP4 in den geprueften Kundentexten.
- Prozent-Wertungen wurden aus den Vorschlagskarten entfernt. Stattdessen
  Rollen/Einordnung wie Einstieg, Hauptmotiv, Ergaenzung, pruefen.
- Analyse laeuft real ueber die deployte Modal-App:
  - PixImmo Presign -> R2 Upload
  - Modal `/analyze/start`
  - Modal `/analyze/status/{call_id}`
  - Qwen/DashScope intern, nicht kundenseitig sichtbar
- Analyse wurde technisch beschleunigt:
  - Bilder werden fuer Analyse auf max. 1600 px Kantenlaenge vorbereitet.
  - Analyse laeuft parallel, Default 4, Cap 6.
- Render laeuft real ueber die deployte Modal-App:
  - Modal CPU-Container
  - OpenCV Frame-Erzeugung
  - FFmpeg/H.264
  - 1080x1920
  - 60 FPS
  - Upload nach R2
- Analyse-Uploads werden fuer Render wiederverwendet:
  - Analyseergebnis enthaelt `inputScenes` mit R2-Keys.
  - PixImmo speichert diese Keys im AssistanceRun.
  - Render laedt nur fehlende Bilder neu hoch.
- Echter Render-Fortschritt ist eingebaut:
  - PixImmo erzeugt `renderJobId`.
  - Modal schreibt Fortschritt nach R2.
  - Statusroute liefert `progress` zurueck.
  - UI kann echte Stufen anzeigen: rendering 0/N, rendering 1/N, encoding,
    uploading, done.
- Uebergang ist aktuell der erste, etwas laengere kurze Uebergang:
  - `fadeSeconds = 0.28`
  - bei 60 FPS ca. 17 Frames
  - nicht komplett hart, aber weiterhin kurz.
- Modal wurde mehrfach deployed; letzter Stand ist deployed.
- Handover und Working-Memory wurden aktualisiert.

### Verifizierte Technische Evidenz

8-Motiv-E2E:

- Analyse Call: `fc-01KW2S5P3Y2HEEVSMFGJJ4ZJZ7`
- Render Call: `fc-01KW2S6V9YV0B4JC32KJ17HP1C`
- Ergebnis: H.264, 1080x1920, 60 FPS, 8 Szenen, abrufbar aus R2.
- Visuelle Bewertung: technisch gueltig, produktseitig nicht akzeptabel.

3-Motiv-Technik-Smoke nach Fortschritts-/Reuse-Umbau:

- Analyse Call: `fc-01KW2T74CTWQGKVA0XD4T02PPZ`
- Render Call: `fc-01KW2T7KX10SV47895AZXTZPJD`
- Fortschritt real gesehen:

```text
rendering:0/3:5
rendering:1/3:31.7
rendering:2/3:58.3
encoding:3/3:90
uploading:3/3:96
done:3/3:100
```

- Finaler R2-Key:
  `social-video/renders/20260626-203412-4b781b38/social-video-crop-render-60fps-h264.mp4`
- Kopie liegt auf Daniels Desktop:
  `/Users/danielfortmann/Desktop/piximmo-objektvideo-technik-smoke-2026-06-26.mp4`

Checks:

```text
npx eslint src/components/objektvideo/PixImmoObjektvideoLab.tsx 'src/app/api/objektvideo/render/status/[callId]/route.ts'
npx tsc --noEmit --pretty false
python3 -m py_compile modal_app/social_video_worker.py modal_app/social_video_render.py
python3 -m unittest modal_app.test_social_video modal_app.test_social_video_cv
modal deploy modal_app/social_video_worker.py
```

Alle erfolgreich.

### Was Noch Aussteht

Morgen nicht wieder Render/Upload/Status neu bauen. Die offene Arbeit ist die
Regie- und Produktschicht:

1. Zielvideo 25 bis 40 Sekunden
   - Laufzeit muss aus Auswahl/Story entstehen, nicht aus einem starren
     Cliplaengen-Schalter.
   - Bei 2.5s pro Bild braucht man grob 10 bis 16 Motive, je nach Uebergaengen.

2. Motivfilterung
   - Schlechte oder sinnlose Motive hart rausnehmen.
   - Duplikate vermeiden.
   - Garage, harte Balkon-/Fassadenfragmente, leere schwache Raeume nicht
     automatisch in die Timeline uebernehmen.

3. Regie/Reihenfolge
   - Von Orientierung/Objektanker zu Hauptbereichen und sinnvollem Abschluss.
   - Nicht einfach Dateireihenfolge oder technische Auswahl rendern.
   - Analyseergebnisse muessen echte Reihenfolge/Story bestimmen.

4. Bewegungen
   - Bewegung muss zum Motiv passen.
   - Keine zufaelligen Pans/Zooms.
   - Leere Raeume eher ruhig, Details gezielt, Fenster/Blick nur mit Kontext.

5. Uebergaenge
   - Aktuell `0.28s`.
   - Morgen visuell pruefen, ob das der richtige Standard bleibt.
   - Nicht weiter technisch daran feilen, bevor Daniel die Wirkung bewertet hat.

6. Vorschlagsuebernahme
   - Der Render sollte nicht einen technischen Testpayload rendern, sondern die
     uebernommene/angepasste Empfehlung wirklich als Timeline verwenden.
   - Ablehnungen/Aenderungen muessen fuer spaetere Heuristik nutzbar bleiben.

7. Echter Produkttest
   - Einen Test mit bewusst ausgewaehlten Immobilienmotiven fahren.
   - Nicht nur beweisen, dass MP4 entsteht.
   - Ergebnis danach visuell bewerten: waere das einem Makler vorzeigbar?

8. Verteilter Render
   - Noch nicht umgesetzt.
   - Fortschrittskanal ist vorbereitet.
   - Erst bauen, wenn Schnitt-/Uebergangspolitik geklaert ist, weil die
     technische Aufteilung davon abhaengt.

### Wichtige Grenzen

- Modal bleibt Verarbeitungsebene, nicht Kundenfrontend.
- PixImmo/PixCapture sind die normalen Kundenseiten.
- Kundentexte duerfen keine internen Provider-/Infrastrukturbegriffe nennen.
- Technisch erfolgreiche Videos sind nicht automatisch Produktreferenzen.
- Der 8-Motiv-E2E ist nur Pipeline-Evidenz, nicht gestalterischer Zielzustand.

Noch technisch offen, aber bewusst nicht heute umgesetzt:

- Verteilter Clip-/Batch-Render. Der Fortschrittskanal ist jetzt vorhanden; ein
  verteilter Render kann darauf aufbauen. Wegen der noch offenen
  Uebergangs-/Fade-Entscheidung sollte die Aufteilung erst nach der
  Produktentscheidung zu Schnitten/Uebergaengen gebaut werden.

Morgen kann die Diskussion daher auf redaktionelle/aesthetische Themen gehen:
Motivfilterung, Reihenfolge, Regie, Bewegung, Uebergangspolitik.

## Update 2026-06-26, 23:05 CEST - Uebergang Bleibt Beim Laengeren Kurzen Wert

Daniel korrigierte die Uebergangsentscheidung: Gemeint war der erste,
etwas laengere Uebergang. Die technische Vorgabe bleibt daher bei `0.28s`.

- PixImmo UI: `RENDER_FADE_SECONDS = 0.28`
- Modal Worker Fallback: `fadeSeconds` Default `0.28`
- Renderer Fallback: `fadeSeconds` Default `0.28`
- Bei 60 FPS sind das ca. 17 Frames Uebergang.

Checks:

```text
npx eslint src/components/objektvideo/PixImmoObjektvideoLab.tsx
npx tsc --noEmit --pretty false
python3 -m py_compile modal_app/social_video_worker.py modal_app/social_video_render.py
python3 -m unittest modal_app.test_social_video modal_app.test_social_video_cv
modal deploy modal_app/social_video_worker.py
```

Alle erfolgreich.

## Update 2026-06-27, 07:32 CEST - PixImmo Objektvideo E2E Mit 13 Desktop-Motiven

Daniel gab den lokalen Desktop-Ordner:

```text
/Users/danielfortmann/Desktop/Obj-MOV-Test
```

Regeln:

- 13 Dateien verwenden.
- `_DSF2392.jpg` ist Startbild.
- `_DSF2247.jpg` ist Detailmotiv.
- Test muss ueber die Webseite laufen, nicht ueber interne Abkuerzungen.

Umgesetzt:

- Playwright im PixImmo-Repo als Dev-Dependency installiert.
- Wiederholbaren E2E-Script ergaenzt:

```text
projects/piximmo-web/scripts/e2e-objektvideo-piximmo-modal.mjs
```

- Der Script oeffnet `http://localhost:3034/modal/objektvideo-lab`, laedt die
  13 Bilder ueber den File-Input, waehlt alle Motive ueber UI-Buttons, setzt
  `_DSF2392.jpg` als Startbild, wartet auf die echte Analyse, uebernimmt die
  Empfehlung, markiert `_DSF2247.jpg` als Detailmotiv, startet den echten
  Render und laedt das Ergebnis ueber den UI-Link herunter.

Gefundener und behobener UI-Bug:

- Analyse- und Render-Statuspolling war faktisch nur ein Einmal-Timeout pro
  Statuswechsel. Bei laengeren echten Jobs blieb die UI im laufenden Zustand
  stehen, obwohl Modal spaeter `done` meldete.
- `PixImmoObjektvideoLab.tsx` wurde auf wiederholtes Polling per Interval
  umgestellt.

E2E-Evidenz:

```text
Analyse Call: fc-01KW3RJ1K7C2GHNQ36WXHA2G1J
Render Call:  fc-01KW3RK7V6X6QS2PGX1RQZGHZC
Render Job:   render-job-eijd95ae6q-mqvx17yp
R2-Key:       social-video/renders/20260627-052453-393e64e4/social-video-crop-render-60fps-h264.mp4
```

Lokale Artefakte:

```text
projects/piximmo-web/.data/objektvideo-e2e/run-2026-06-27T05-23-48-076Z/piximmo-objektvideo-e2e.mp4
projects/piximmo-web/.data/objektvideo-e2e/run-2026-06-27T05-23-48-076Z/contact-sheet.jpg
projects/piximmo-web/.data/objektvideo-e2e/run-2026-06-27T05-23-48-076Z/final-page.png
projects/piximmo-web/.data/objektvideo-e2e/run-2026-06-27T05-23-48-076Z/summary.json
```

`ffprobe` Ergebnis:

```text
H.264
1080x1920
60/1 FPS
duration=38.200000
nb_frames=2292
```

Bewertung:

- Technischer E2E ist erfolgreich: Webseite -> Analyse -> R2 -> Modal Render
  -> Fortschritt -> Downloadlink -> MP4-Verifikation.
- Contact-Sheet zeigt ein echtes Objektvideo mit Fassade/Innenraeumen/Garten.
- Das ist ein brauchbarer E2E-Beweis, aber noch keine finale Produktaesthetik.
  Die naechste Produktarbeit bleibt: Regie/Reihenfolge/Motivgewichtung und
  Bewegungen visuell weiter verbessern.

Zusatzstand HeyGen:

- HeyGen Speech ist als separater, manueller Schritt vorbereitet.
- Key liegt in Keychain/Vercel/env; siehe `docs/SECRET_REGISTRY.md`.
- Beim E2E wurde kein HeyGen-Audio erzeugt und kein HeyGen-Guthaben verbraucht.

## Update 2026-06-27, 09:50 CEST - Text-/Sprecher-Export Produktiv Ueber Modal

Daniel stellte klar, dass der Nachmittag nicht ueber einen lokalen/dev Server
laufen soll. PixImmo soll als Interface dienen, die Verarbeitung muss extern
ueber den deployten Modal-Service laufen. PixCapture soll gespiegelt werden,
mit kuerzeren/ruhigeren Bewegungen wegen kleinerem Ausgangsmaterial.

Umgesetzt:

- Modal `pix-social-video` neu deployed.
- Neue externe Modal-Endpunkte:

```text
POST /render/social-export/start
GET  /render/social-export/status/{call_id}
```

- Varianten:
  - `text`
  - `voice`
  - `text_voice`
- Modal laedt Basis-MP4 und optional Sprecher-Audio per URL, brennt die
  zweizeilige Helvetica-nahe Untertitelgrafik unten ein, muxt optional AAC
  Audio, speichert die MP4 in R2 und liefert eine signierte URL zurueck.
- PixImmo ruft dafuer keine lokale `ffmpeg`-Route mehr auf, sondern proxied
  nur noch Start/Status zu Modal:

```text
POST /api/objektvideo/export/social/start
GET  /api/objektvideo/export/social/status/[callId]
```

- PixCapture hat die gleichen Social-Export-Wrapper:

```text
POST /api/video-builder/export/social/start
GET  /api/video-builder/export/social/status/[callId]
```

- PixCapture Video-Builder nutzt jetzt vorsichtigere Defaultbewegungen:
  kuerzere Still-Dauer, kleinere Pan-/Tilt-Wege, sanfterer Zoom, keine langen
  Crane-artigen Bewegungen als Default.
- HeyGen-Stimmnamen bleiben intern. Die UI nutzt neutrale Labels wie
  `Maennlich, klar`; keine Provider-/Castingnamen auf Kundenseiten anzeigen.

Deploys:

```text
Modal:     https://dafort001--pix-social-video-social-video-api.modal.run
PixImmo:   https://piximmo-web.vercel.app
PixCapture:https://pixcapture.app
```

Verifikation:

```text
python3 -m py_compile modal_app/social_video_worker.py
npx tsc --noEmit
npx eslint src/components/objektvideo/PixImmoObjektvideoLab.tsx src/app/api/objektvideo/export/social/start/route.ts 'src/app/api/objektvideo/export/social/status/[callId]/route.ts'
npx tsc --noEmit
npx eslint src/lib/modal-config.ts src/components/video-builder/PixCaptureVideoBuilderPrototype.tsx src/app/api/video-builder/export/social/start/route.ts 'src/app/api/video-builder/export/social/status/[callId]/route.ts'
modal deploy modal_app/social_video_worker.py
npx vercel deploy --prod --yes   # PixImmo
npx vercel deploy --prod --yes   # PixCapture
```

Produktive Smoke-Tests ueber die Website-Wrapper, nicht lokal:

```text
PixImmo wrapper -> Modal -> R2:
social-video/piximmo/social-export/20260627-074829-6480b7fe/website-wrapper-smoke-text.mp4

PixCapture wrapper -> Modal -> R2:
social-video/pixcapture/social-export/20260627-074833-27049340/website-wrapper-smoke-text.mp4
```

Produktiver HeyGen-/Sprecher-Smoke ueber PixImmo:

```text
HeyGen Audio:
piximmo/objektvideo/narration/mqw2ay8c-6b75286f/prod-voice-smoke-voiceover.mp3

PixImmo wrapper -> Modal text_voice:
social-video/piximmo/social-export/20260627-075226-80cb916f/prod-text-voice-smoke-text_voice.mp4
```

Direkter Modal-Smoke:

```text
social-video/codex-smoke/social-export/20260627-074227-e3ce19e6/modal-social-export-smoke-text.mp4
```

`ffprobe` bestaetigte H.264-MP4-Ausgabe. PixImmo-Lab antwortete produktiv mit
HTTP 200. PixCapture `/video-builder-prototype` antwortete HTTP 200;
`/dashboard/video-builder` leitete erwartungsgemaess auf Login weiter.

## Update 2026-06-27, 10:15 CEST - PixCapture Vollstaendig Verbunden

Nach Daniels Rueckfrage wurde PixCapture nicht nur mit den Export-Endpunkten
vorbereitet, sondern wie PixImmo an die echte Pipeline angeschlossen.

Neu in PixCapture:

- Lokale Testbilder im Video-Builder werden mit Datei, Breite und Hoehe
  gehalten.
- `Basisvideo erstellen` laedt die Bilder via presigned PUT nach R2,
  startet Modal `/render/crop/start`, pollt `/render/crop/status/{call_id}`
  und zeigt den MP4-Link.
- `Sprecher` ruft HeyGen ueber PixCapture auf und speichert das Audio in R2.
- `Textvideo`, `Sprechervideo` und `Text + Sprecher` laufen ueber die
  bestehenden Modal Social-Export-Endpunkte.
- Bewegungsdefaults bleiben PixCapture-spezifisch gedrosselt: kuerzere Clips,
  kleinere Pan-/Tilt-Wege, sanfterer Zoom, kein langer Crane-Default.

Neue PixCapture-Routen:

```text
POST /api/video-builder/render/presign
POST /api/video-builder/render/start
GET  /api/video-builder/render/status/[callId]
POST /api/video-builder/narration/speech
POST /api/video-builder/export/social/start
GET  /api/video-builder/export/social/status/[callId]
```

Vercel:

- PixCapture wurde produktiv neu deployed und ist auf
  `https://pixcapture.app` aliasiert.
- `HEYGEN_API_KEY` wurde fuer PixCapture Vercel gesetzt. Production und Preview
  sind sensitive.

Produktive PixCapture-Smokes ueber `https://pixcapture.app`, nicht lokal:

```text
Basisrender:
social-video/renders/20260627-080834-613f700f/social-video-crop-render-60fps-h264.mp4

Textvideo:
social-video/pixcapture/social-export/20260627-080901-08648cff/pixcapture-prod-export-smoke-text.mp4

HeyGen Audio:
pixcapture/video-builder/narration/mqw327ju-a7a7bff9/pixcapture-text-voice-smoke-voiceover.mp3

Text + Sprecher:
social-video/pixcapture/social-export/20260627-081335-c377d06b/pixcapture-prod-text-voice-smoke-text_voice.mp4
```

Checks:

```text
npx tsc --noEmit
npx eslint src/components/video-builder/PixCaptureVideoBuilderPrototype.tsx src/app/api/video-builder/render/presign/route.ts src/app/api/video-builder/render/start/route.ts 'src/app/api/video-builder/render/status/[callId]/route.ts' src/app/api/video-builder/narration/speech/route.ts src/app/api/video-builder/export/social/start/route.ts 'src/app/api/video-builder/export/social/status/[callId]/route.ts'
npx vercel deploy --prod --yes
```

Damit sind PixImmo und PixCapture beide als Website-Interfaces an den externen
Modal-Worker angeschlossen.

## Update 2026-06-27, 10:26 CEST - Optionale Textfreigabe Vor Render

Daniel wollte eine Zwischenstufe, in der Kunden die vom System vorgeschlagene
Video-Zusammenfassung sehen und bei Bedarf aendern koennen, bevor Sprechertext
oder eingeblendeter Text daraus erzeugt werden.

Umgesetzt fuer PixImmo und PixCapture:

- Vor dem eigentlichen Render gibt es jetzt die Phase `Sprechtext pruefen`.
- Die Seite zeigt die fuer das Video ausgewaehlten Motive als kleine Galerie in
  der geplanten Reihenfolge.
- Darunter steht der generierte deutsche Sprecher-/Beschreibungstext in einem
  editierbaren Textfeld.
- Der Kunde kann den Vorschlag unveraendert freigeben oder einzelne
  Formulierungen aendern.
- Der freigegebene Text wird danach fuer HeyGen-Sprecher-Audio sowie fuer
  `Textvideo` und `Text + Sprecher` verwendet.
- Wenn der Kunde nichts aendert, wird der Systemvorschlag unveraendert
  weiterverwendet. Die Textfreigabe ist also eine Kann-Stufe, keine Pflicht.

Geaenderte Dateien:

```text
projects/piximmo-web/src/components/objektvideo/PixImmoObjektvideoLab.tsx
projects/pixcapture-web/src/components/video-builder/PixCaptureVideoBuilderPrototype.tsx
```

Verifikation:

```text
# PixImmo
npx tsc --noEmit
npx eslint src/components/objektvideo/PixImmoObjektvideoLab.tsx
npx vercel deploy --prod --yes

# PixCapture
npx tsc --noEmit
npx eslint src/components/video-builder/PixCaptureVideoBuilderPrototype.tsx
npx vercel deploy --prod --yes
```

Deploys:

```text
PixImmo:   dpl_7y4KDUtb61Vo5fvwRK4AmsiMDPiR
           https://piximmo-web.vercel.app/modal/objektvideo-lab

PixCapture:dpl_FpYZoPppUUNxnwm3drCUA6wTwkS2
           https://pixcapture.app/video-builder-prototype
```

Post-Deploy-Smoke:

```text
curl -I https://piximmo-web.vercel.app/modal/objektvideo-lab
curl -I https://pixcapture.app/video-builder-prototype
```

Beide Routen antworteten mit HTTP 200.

## Abschluss 2026-06-27, Git-Hygiene Und Push-Status

Nach der Objektvideo-/Video-Builder-Arbeit wurde der zuvor offene Dirty-State
aufgeraeumt, getrennt committed und gepusht. Es soll keinen generischen
`Repo ist dirty`-Hinweis fuer den naechsten Agenten geben.

Gepushte Commits:

```text
Root / Handover:
287b8766 Record video builder handover state
Branch: origin/codex/pipeline-handover-20260418

PixImmo:
1232ba2 Add PixImmo object video analysis and export flow
Branch: origin/codex/piximmo-portal-merge

PixCapture:
235e061 Add PixCapture video builder pipeline
Branch: origin/main

Voleur / Modal:
781d40e Extend social video worker for analysis and exports
Branch: origin/codex/pipeline-batchworker-20260418
```

Final gepruefte Git-Roots:

```text
/Volumes/drive 1/PIXCAPTURE
/Volumes/drive 1/PIXCAPTURE/projects/piximmo-web
/Volumes/drive 1/PIXCAPTURE/projects/pixcapture-web
/Volumes/drive 1/PIXCAPTURE/projects/voleurdimages-backend
```

Alle vier Roots waren nach Commit und Push sauber und mit `origin`
synchronisiert.

Lokale PixCapture-Screenshot-/Eval-Artefakte wurden nicht committed. Sie wurden
aus dem Repo entfernt und ausserhalb von Git geparkt:

```text
/Volumes/drive 1/PIXCAPTURE_HOLD_2026-06-27/pixcapture-web/.data-video-builder-eval-2026-06-26
```

Dieser Abschlussblock selbst wurde danach als eigener Root-Handover-Commit
committed und gepusht. Wenn ein naechster Agent hier weiterarbeitet, soll er
nicht zuerst aufraeumen muessen, sondern direkt bei Produkt-/UX-Tests oder der
naechsten fachlichen Entscheidung weitermachen.

## Update 2026-06-28 - Beta PixImmo Job Bridge Verified

Ausloeser: Auf `beta.pix.immo` lag ein vorbereiteter Auftrag mit Bildern,
Qwen-/SAM-/DA3-Status und Delivery-Freigabe, aber der Objektvideo-Builder
erzeugte daraus kein Video. Ursache war, dass der Builder noch als lokaler
Lab-Upload arbeitete und keine vorhandenen Job-Bilder/R2-Keys/Qwen-Texte
uebernahm.

Fix committed und gepusht:

```text
PixImmo:
627ee3e Connect PixImmo object video builder to job images
Branch: origin/codex/piximmo-portal-merge
```

Deploy:

```text
Vercel Deployment: dpl_Cu5TygTU1RyRzy7sRr5eiekMSN5G
Alias: https://piximmo-web.vercel.app
Beta:  https://beta.pix.immo
```

Verifiziert auf Beta am Auftrag `VB6YN / 20260604-HAF-WA`:

```text
/dashboard/admin/jobs/VB6YN
- zeigt neue Karte "Objektvideo"
- Link: /dashboard/admin/video?jobId=cmq0fvimo000004l1qbp90x7t
- Jobstatus: 64 Rueckgabe-Bilder, 64/64 Delivery-ready,
  64/64 Qwen, 64/64 AI-ready, SAM 64/64, DA3 64/64

/dashboard/admin/video?jobId=VB6YN
- Quelle: 20260604-HAF-WA · 64 Delivery-Bilder aus dem Projekt geladen.
- kein "0 geladen"-Labzustand mehr
- vier Motive im Browser ausgewaehlt
- vorhandene Job-Bildtexte wurden fuer die Analyse wiederverwendet
- Renderplan erstellt
- echter 4-Clip-Basisrender gestartet und abgeschlossen
- Status-Call: /api/objektvideo/render/status/fc-01KW7EGJGXGTDN844PJM9G93TX
  antwortete mit {"ok":true,"status":"done",...}
- UI zeigte danach einen "Video oeffnen"-Link auf das erzeugte MP4 in R2
```

Noch wichtig:

- Der getestete Basisrender nutzte nur 4 Clips, um Zeit/Kosten klein zu halten.
  Die Job-Bruecke laedt aber alle 64 Delivery-Bilder.
- Heygen/Sprecher-Export wurde in diesem Test bewusst nicht gestartet, um keine
  zusaetzlichen Credits fuer einen reinen Pipeline-Smoke zu verbrauchen.
- Die sichtbare Menuezeile `Systemfehler` im Admin ist ein Navigationspunkt,
  keine Objektvideo-Fehlermeldung.

## Update 2026-06-28 - UploadSession Source Added

Korrektur zum vorherigen Beta-Test: Daniels Testmaterial war nicht als
Job-Detail/Delivery-Auswahl gemeint, sondern als fuer Objektvideo hochgeladene
UploadSession. Der Builder unterstuetzt jetzt beide Quellen:

```text
/dashboard/admin/video?jobId=...
  laedt Delivery-Bilder aus ProcessedImage/Job.

/dashboard/admin/video?sessionId=...
  laedt renderbare UploadFile-Bilder direkt aus einer UploadSession.
```

PixImmo-Commits:

```text
ba9d094 Load PixImmo object video from intake sessions
4f73b1f Clarify object video reused metadata copy
Branch: origin/codex/piximmo-portal-merge
```

Deploy:

```text
Vercel Deployment: dpl_BLxajLez4FPPaYEQXpEjj8H9fwrQ
Alias: https://piximmo-web.vercel.app
Beta:  https://beta.pix.immo
```

Verifiziert auf Beta:

```text
/dashboard/admin/intake
- zeigt pro Intake-Session jetzt "Video vorbereiten"
- Beispiel-Link: /dashboard/admin/video?sessionId=intk_kOsOgubJABKRyiH7

/dashboard/admin/video?sessionId=intk_kOsOgubJABKRyiH7
- Quelle: 20260604-HAF-WA · 64 Upload-Dateien aus der Session geladen.
- kein "0 geladen"-Zustand
- vier UploadSession-Bilder konnten ausgewaehlt werden
- Analyse-Schritt erreichte "Vorschlaege bereit"
- echter 4-Clip-Basisrender aus der UploadSession wurde abgeschlossen
- UI zeigte danach "Video oeffnen" auf das erzeugte MP4 in R2
```
