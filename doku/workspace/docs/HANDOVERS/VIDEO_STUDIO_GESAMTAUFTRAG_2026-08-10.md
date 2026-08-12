# Übergabe: gemeinsames PixImmo/PixCapture Video Studio

Stand: 2026-08-10, Europe/Berlin  
Ziel: Der nächste Codex-Task führt den **gesamten** freigegebenen Umsetzungsauftrag weiter und behandelt einzelne Phasen nicht als Ende des Gesamtauftrags.

## 1. Verbindlicher Einstieg

In dieser Reihenfolge lesen:

1. `/Volumes/drive 1/PIXCAPTURE/00_READ_FIRST_EVERY_SESSION.md`
2. `/Volumes/drive 1/PIXCAPTURE/CODEX_WORKING_MEMORY_DO_NOT_TOUCH/PIXIMMO_SESSION_CACHE.md`
3. `/Users/danielfortmann/Desktop/VIDEO_STUDIO_UMSETZUNGSAUFTRAG.md`
4. diese Übergabe

Der Desktop-Auftrag ist Version 1.1 und vom Nutzer als Umsetzungsauftrag gemeint. Er wurde in diesem Task gegen die tatsächlich vorhandene Modal-Pipeline korrigiert. Nicht wieder bei einer abstrakten API-Suche beginnen: die Modal-Realität ist unten dokumentiert.

Zusätzliche Sollbeschreibung aus der vorherigen Konzeptphase:

- `/Volumes/drive 1/PIXCAPTURE/projects/piximmo-web/docs/VIDEO_STUDIO_SOLLKONZEPT_2026-08-10.md`

## 2. Nutzerziel und verbindlicher Bedienablauf

Der User öffnet ein konkretes Projekt – aktuell ist **Seeburg / Job `SCQ-NTX9R`** der reale Referenzfall – und sieht sofort alle Projektbilder mit ihrer Taxonomie und echten Vorschaubildern.

Der gewünschte Ablauf:

1. Bilder in der Galerie auswählen; nicht jedes Bild einer Serie muss ins Video.
2. Jedes ausgewählte Bild erscheint sofort in einer sichtbaren horizontalen Timeline, ohne Seitenwechsel und ohne Bestätigungs-Gate.
3. Start- und Endbild ausdrücklich festlegen.
4. Reihenfolge direkt in der Timeline sortieren.
5. Zielzeit 30, 45 oder 60 Sekunden und Rhythmus wählen; pro Clip Dauer sichtbar und veränderbar.
6. Computer analysiert Bildinhalt, Taxonomie, Auflösung und Reihenfolge und macht **Vorschläge**, keine Zwangsentscheidungen, für Bewegung, Dauer, Ausschnitt und Text.
7. Jeder Clip ist als echte 9:16-Bewegungsvorschau prüfbar: Ken Burns, Zoom in/out, horizontale/vertikale Fahrt, später räumliche und generative Varianten.
8. Qualität darf durch Zoom oder 9:16-Ausschnitt nicht unbemerkt leiden. Portalabhängige Quellauflösungen berücksichtigen.
9. Erweiterte Vorschläge können Qwen-Text hinter Objekten, Perspektivwechsel, Kreisfahrt, Wasser-/Auto-/Vorhangbewegung und Fake-Drone umfassen. Sie werden separat vorgeschlagen, kosten sichtbar gemacht und erst nach Vergleich mit dem Original übernommen.
10. Am Ende entsteht eine zusammengesetzte Preview mit derselben Zeitrechnung wie Timeline und Renderer. Klick in der Preview springt zur Szene.
11. Danach Review, Version festhalten, Finalrender und Export.
12. Dieselbe Werkstatt muss aus PixImmo und PixCapture erreichbar sein, mit harter Portal-/Kunden-/Projekttrennung und ohne Vermischung von Assets.

Wichtige UX-Leitlinie: Sicherheits- und Datenintegritätsgrenzen bleiben streng. Lineare Bediengates, versteckte Seiten und unnötige „Weiter“- oder „Übernehmen“-Schritte sind ausdrücklich unerwünscht.

## 3. Aktuell lokal umgesetzt

### Shared Service

Repo-Root: `/Volumes/drive 1/PIXCAPTURE`  
Branch: `codex/shared-video-studio-api-v1`

Geänderte Dateien:

- `src/videoStudio/project.ts`
- `src/videoStudio/service.ts`
- `tests/videoStudio/server.test.ts`

Umgesetzt:

- Entwurfs-Auswahl darf null oder ein Bild enthalten.
- Unter zwei Bildern bleibt das Projekt `draft`; `startTakeId` ist bei leerer Auswahl `null`.
- Bootstrap/Ersteinrichtung verlangt weiterhin mindestens zwei Bilder.
- Preview-/Finalrender wird bei weniger als zwei Bildern serverseitig blockiert.
- Auswahl und Zielzeit können atomar über denselben revisionsgeschützten Selection-Write gespeichert werden.
- Neue Clips erhalten das Standardmuster `puls`: `3.0 / 0.8 / 0.8 / 0.8 / 2.0` Sekunden.
- Bestehende Clips behalten beim Sortieren/Entfernen ihre Dauer; damit bleiben manuelle Entscheidungen erhalten.

### PixImmo Workbench

Repo: `/Volumes/drive 1/PIXCAPTURE/projects/piximmo-web`  
Branch: `codex/piximmo-video-studio-ui-20260808`  
Commit: `6976de3` (`feat: unify video gallery and autosaved timeline`)

Geänderte Datei:

- `src/app/dashboard/video-studio/workbench/[projectId]/SharedVideoStudioWorkbench.tsx`

Umgesetzt:

- Galerie und horizontale Timeline stehen in einer gemeinsamen Ansicht.
- Der Button/das Gate „Auswahl und Reihenfolge übernehmen“ ist entfernt.
- Ausgewählte Bilder erscheinen sofort als Entwurfsclips in der Timeline.
- Auswahl, Reihenfolge und 30/45/60-Sekunden-Ziel speichern nach 800 ms automatisch.
- Sichtbarer Status: vorgemerkt, speichert, gespeichert, Fehler.
- Drag-and-drop, Pfeile sowie direkte Start-/Ende-Aktionen.
- Dauerwahl `0,8 / 1 / 2 / 3 s` direkt am Clip.
- Vorhandene heuristische Bewegungsvorschläge bleiben erreichbar.
- Vorschau-Start ist erst ab zwei gespeicherten Bildern möglich.

### Nachweise

- `npm run video-studio:test`: 26 bestanden, 1 PostgreSQL-Test mangels `VIDEO_STUDIO_TEST_DATABASE_URL` übersprungen.
- gezieltes ESLint für die Workbench: bestanden.
- vollständiger `npm run build` in `projects/piximmo-web`: bestanden.
- Build protokolliert erwartete lokale Neon/Dynamic-Server-Warnungen, Exit-Code dennoch 0.
- `git diff --check`: bestanden.

## 4. Noch nicht umgesetzt – nicht mit „fertig“ verwechseln

Der Gesamtauftrag ist **nicht** abgeschlossen. Insbesondere fehlen:

### Phase 2 vollständig machen

- Datenmodellfelder `durationSource: pattern | manual` statt indirekter Ableitung über Decisions.
- Rhythmuswahl `puls`, `ruhig`, `zweier`, `auftakt`, `ausklang`.
- „Muster neu anwenden“ unter Erhalt manueller Dauern.
- „Auf Zielzeit anpassen“ mit maximal ±20 Prozent Skalierung nur der Pattern-Clips.
- Übergänge `cut`, `crossfade`, `fadeFromBlack` mit identischer Zeitrechnung in UI, scene-spec und Renderer.
- Autosave für sämtliche Szenenparameter; in der Detailansicht existiert noch „Szene speichern“.
- explizite Version/Snapshot-Funktion getrennt vom Autosave.
- Konfliktbehandlung in der UI für Service-`409`, nicht bloß Fehlermeldung.

### Phase 2,5 Analyse-Goldset

- 20 echte Innenaufnahmen als Goldset auswählen.
- vorhandene `pix-segment`- und `pix-depth`-Worker verwenden.
- vorhandenen, derzeit nicht deployten `pix-layered`-Code gezielt als Laborworker deployen und prüfen; kein Portal-Deploy.
- Ergebnisse als Kontaktbogen prüfen.
- Laufzeit, GPU-Speicher, R2-Speicher und Kosten pro Bild protokollieren.
- Entscheidung, ob Qwen-Image-Layered Innenräume ausreichend sauber trennt.

### Phase 3 Analyse und Vorschläge

- persistentes Analysedokument pro Asset und `analysisVersion`.
- Taxonomie, Caption, Fokuspunkt, Depth, Masken, sichere Bewegungsbereiche, Cut-Risk und Qualitätsklasse.
- bestehende `pix-social-video`-Analyse in den Shared Service integrieren.
- Vorschlagsengine für Dauer, Bewegung, Crop und Begründung.
- Qualitätsregeln aus Kapitel 5 des Umsetzungsauftrags exakt implementieren.
- Clips unter 1,2 s automatisch `still` vorschlagen.

### Phase 4 Clip-Editor und Textsystem

- vollständiges Textsystem mit sechs Stilen, Zeichengrenzen und konsistenten Browser-/Renderer-Fonts.
- Text auf kurzen Clips nach Vorgabe begrenzen.
- echter Crop-/Motion-Editor mit Qualitätssperren.
- vorhandene manuelle Speicherknöpfe durch Autosave plus Snapshot ersetzen.

### Phase 5 deterministische Preview

- Timeline und Preview verwenden dieselbe scene-spec.
- bestehende Modal-Workbench-Renderroute anbinden.
- Preview-Abspielkopf und Klick-zur-Szene.
- Renderstatus und Ergebnis im Projekt persistieren.

### Phase 6 erweiterte Bewegungen

- Vorschläge und Review für Layered/Parallax, Source Motion, Perspektivwechsel, Fake-Drone, Wasser, Autos, Vorhänge usw.
- generierte Ergebnisse liegen neben dem Original und gelangen erst nach ausdrücklicher Annahme in die Timeline (`acceptedAt`).
- `alteredContent`, Kosten, Provider/Modellversion und Reviewstatus sichtbar.

### Phase 7 Finalisierung und beide Portale

- Finalrender-Gate erst, wenn alle veränderten Clips geprüft sind.
- Social-Export und Versionierung.
- PixCapture-Portaladapter und echte Mandantentrennung E2E.
- realer Seeburg-Durchlauf und danach kontrollierter Beta-Test.

## 5. Verifizierte Modal-Realität

Nicht erneut als hypothetische Anbieterfrage behandeln.

`modal app list` zeigte deployt:

- `pix-social-video`
- `pix-depth`
- `pix-analyze`
- `pix-gateway`
- `pix-segment`
- `piximmo-processed-image-analysis`
- `piximmo-room-dimensions`

`pix-social-video` ist erreichbar und besitzt:

- `/analyze/start`
- `/analyze/status/{call_id}`
- `/render/crop`
- `/render/crop/start`
- `/render/crop/status/{call_id}`
- `/render/workbench/start`
- `/render/workbench/status/{call_id}`
- `/render/social-export/start`
- `/render/social-export/status/{call_id}`

`pix-gateway /health` liefert 200 und nennt Qwen-Analyse/Caption über OpenRouter, SAM 3.1, DA3METRIC-LARGE, Fusion und weitere Worker.

Vorhandene Secrets in Modal: DashScope, OpenRouter, fal, Replicate, Hugging Face und Cloudflare R2. Keine Secretwerte ausgeben.

Wichtige Quellpfade:

- `projects/voleurdimages-backend/modal_app/social_video_worker.py`
- `projects/voleurdimages-backend/modal_app/social_video_cv.py`
- `projects/voleurdimages-backend/modal_app/social_video_render.py`
- `projects/voleurdimages-backend/modal_app/qwen_provider.py`
- `projects/voleurdimages-backend/modal_app/pix_layered.py`

Qwen/DashScope verwendet im aktuellen Code den internationalen Singapur-Endpunkt. Nicht ohne separaten Verfügbarkeitstest auf Frankfurt umstellen.

`pix-layered.py` existiert mit Qwen-Image-Layered, A10G, Hugging Face und R2, ist aber aktuell nicht als App deployt. Das ist ein geplanter Phase-2,5-Labortest, keine neue Produktarchitektur.

## 6. Architektur und bestehender Shared-Service

Shared Code:

- `src/videoStudio/types.ts`
- `src/videoStudio/project.ts`
- `src/videoStudio/service.ts`
- `src/videoStudio/renderWorker.ts`
- `src/videoStudio/postgresStore.ts`
- `docs/video-studio/SHARED_VIDEO_STUDIO_API_V1.md`

PixImmo-Adapter:

- `projects/piximmo-web/src/lib/shared-video-studio.ts`
- `projects/piximmo-web/src/app/api/video-studio/shared/projects/[projectId]/[[...action]]/route.ts`

Der Service besitzt bereits:

- dauerhaften PostgreSQL-Speicher,
- Compare-and-swap-Revisionsschutz mit `409`,
- signierte Handoffs und Replay-Schutz,
- Produkt-/Tenant-/Projektbindung,
- Selection-, Timeline-, Take-, Review-, Render- und Job-Endpunkte,
- Workeradapter für `pix-social-video`.

Nicht daneben einen zweiten Video-Service bauen. Das vorhandene Modell kontrolliert erweitern und Migration/Kompatibilität beachten.

## 7. Konkreter nächster Arbeitsblock

1. `durationSource`, Rhythmus-ID und Übergangsfelder rückwärtskompatibel in Shared Types, Projektdefaults, Parser, Public Contract und Tests ergänzen.
2. zentrale gemeinsame Funktion für Filmdauer inklusive Crossfade-Überlappung implementieren und in Heuristik/Render-Manifest verwenden.
3. Workbench um Rhythmusauswahl, Zielzeitanpassung und Übergänge ergänzen.
4. Szeneneditor auf 800-ms-Autosave umstellen; „Szene speichern“ entfernen, Snapshot separat vorsehen.
5. `409` durch Neuladen/konkreten Konflikthinweis behandeln.
6. lokal testen und bauen; **nicht deployen**.
7. danach Phase 2,5 Goldset und vorhandene Modal-Worker, wiederum ohne Portal-Deploy.

Nicht nach einem Teilblock behaupten, der Gesamtauftrag sei abgeschlossen. Stattdessen klar angeben: Phase, Abnahmepunkt, offene nächste Phase.

## 8. Deployment- und Kostenregeln

- Aktuell **kein Deployment**. Daniel hat bereits zu viele Vercel-Deployments für die UI-Beurteilung erlebt.
- Beta erst gemäß `AGENTS.md` nach direkter URL-Prüfung: Login, DB, echtes R2-Asset, Filmstrip, Portfolio und geänderte Funktion; danach dieselben Prüfungen am Alias.
- Kein kostenpflichtiger Qwen-/GPU-/Providerlauf ohne konkreten Testumfang. Phase 2,5 erlaubt den im Auftrag beschriebenen begrenzten 20-Bilder-Test, aber der neue Task soll vor tatsächlichem kostenpflichtigem Lauf den Umfang und die zu erwartenden Kosten sichtbar nennen.
- Keine Production-, DNS-, Konto-, Secret-, Kunden- oder Datenänderung.

## 9. Git-Hygiene und bekannte Fremdänderung

Betroffene eigene Änderungen werden vor Taskwechsel committed.

Wichtig: `projects/voleurdimages-backend` steht im Workspace als geändert auf Branch `codex/security-auth-hardening-20260808`. Diese Änderung bestand bereits vor dem aktuellen Implementierungsblock und wurde nicht angefasst. Nicht löschen, resetten oder ungeprüft in einen Video-Studio-Commit mischen.

Die Desktop-Datei `/Users/danielfortmann/Desktop/VIDEO_STUDIO_UMSETZUNGSAUFTRAG.md` liegt außerhalb von Git und enthält die korrigierte Version 1.1.
