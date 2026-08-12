# PixImmo Shared Video Workbench Handover - 2026-07-08

Stand: 2026-07-08 21:37 CEST

## Ziel dieses Handovers

Die drei lokalen Video-Workbench-Seiten sollen nicht mehr als lose Einzelseiten
weiterentwickelt werden. Sie sind ab jetzt Ansichten auf einen gemeinsamen
`videoProject`-Zustand, den PixImmo und PixCapture spaeter beide verwenden
koennen.

Das ist bewusst ein autarker lokaler Prototyp-Kern. Er ist noch keine
Produktionsdatenbank und noch kein finaler Provider-Runner.

## Aktive Seiten

PixImmo Web, lokaler Server:

- `http://127.0.0.1:3000/dashboard/video-studio?candidate=10`
- `http://127.0.0.1:3000/dashboard/video-studio/motion`
- `http://127.0.0.1:3000/dashboard/video-studio/maklerin`

Statische Workbench-Dateien:

- `projects/piximmo-web/public/video-workbench/timeline/index.html`
- `projects/piximmo-web/public/video-workbench/motion/index.html`
- `projects/piximmo-web/public/video-workbench/maklerin/index.html`

## Neue gemeinsame Grundlage

Neu angelegt:

- `projects/piximmo-web/src/lib/video-workbench-projects.ts`
- `projects/piximmo-web/src/app/api/video-workbench/projects/[projectId]/route.ts`
- `projects/piximmo-web/public/video-workbench/shared/project-store.js`

Projekt-ID:

- `candidate-10-shared-video-project-v1`

API:

- `GET /api/video-workbench/projects/candidate-10-shared-video-project-v1`
- `PATCH /api/video-workbench/projects/candidate-10-shared-video-project-v1`

Lokaler Prototyp-Speicher:

- `projects/piximmo-web/.video-workbench/projects/candidate-10-shared-video-project-v1.json`

Der Speicher wird bei Bedarf erzeugt. Diese `.video-workbench`-Datei ist
lokaler Laufzeitstatus, nicht Quellcode.

## Sections im gemeinsamen videoProject

- `timeline`: Schnittplan, Kacheln, Reihenfolge, Dauern, Verbunden/Block-Status.
- `motion`: Motion-/Crop-/Text-/Avatar-Editorzustand.
- `presenter`: Maklerin/Veo-Seite inklusive Presenter-Definition und Referenzen.
- `promptPipeline`: Kundenprompt Deutsch, korrigierter deutscher Zwischenstand,
  finaler englischer Veo-Prompt, Negative Prompt.
- `providerJobs`: reserviert fuer Google Veo/FAL Jobstatus, Kosten, Ergebnis.
- `exports`: reserviert fuer Render-/Exportstatus.

Die drei HTML-Seiten laden jetzt `public/video-workbench/shared/project-store.js`
und speichern zusaetzlich zum vorhandenen `localStorage` in den gemeinsamen
Serverzustand. Das lokale Verhalten der Seiten bleibt erhalten.

## Prompt-Pipeline

Neu angelegt:

- `projects/piximmo-web/src/lib/video-workbench-prompt-normalizer.ts`
- `projects/piximmo-web/src/app/api/video-workbench/prompt/normalize/route.ts`

API:

- `POST /api/video-workbench/prompt/normalize`

Funktion:

1. Kunde schreibt Deutsch.
2. Server normalisiert den deutschen Prompt semantisch.
3. Ergebnis enthaelt:
   - `semanticPromptDe`
   - `spokenLineDe`
   - `veoPromptEn`
   - `negativePromptEn`
   - `warnings`
4. Wenn `GOOGLE_GEMINI_API_KEY` verfuegbar ist, wird Gemini Text genutzt.
5. Wenn Gemini fehlt oder fehlschlaegt, greift ein deterministischer lokaler
   Fallback.

Wichtig: Das ist keine klassische Google-Translate-Strecke. Es ist bewusst eine
semantische Prompt-Normalisierung. Deutsch bleibt fuer Nutzer sichtbar, Veo
bekommt kontrolliertes Englisch.

## Veo/FAL Entscheidung

Vorhandene alte Route:

- `projects/piximmo-web/src/app/api/video-studio/veo/start/route.ts`

Aktueller Zustand:

- Diese Route nutzt noch FAL.
- Sie ist aktuell auf `fal-ai/veo2/image-to-video` gesetzt.
- Der gute Testlauf lag aber in:
  `exports/opening_candidate_picker_2026-07-07/selected_exterior_facade_opening/video_tests/motif10_wan_walk_pan/provider_compare/veo31_standard_opener_audio/request.json`
  und nutzte `fal-ai/veo3.1/image-to-video`.

Produktentscheidung aus der Diskussion:

- Google/Gemini fuer Prompt-Normalisierung.
- Google Veo soll primaerer Video-Provider werden, wenn Projektzugriff und
  Abrechnung bestaetigt sind.
- FAL nur als Fallback/Testprovider behalten.

## Maklerin-Seite: aktueller UI-Stand

Die Seite hat jetzt:

- Kundenmaterial / Referenz fuer Person.
- Kundenprompt Deutsch.
- Zwischenstand: korrigierte Semantik.
- Button `Zwischenstand erstellen`.
- Prompt-Vorlagen, darunter `Veo Arbeitsreferenz`.
- Finales Feld `Veo Prompt Englisch`.
- Feld `Negative Prompt / vermeiden`.
- Ausklappbares Textgestaltungsfeld.

Der alte funktionierende Prompt ist als Vorlage `Veo Arbeitsreferenz` eingebaut,
inklusive Negative Prompt.

## Contract-Dokument

Neu:

- `docs/video-motion/SHARED_VIDEO_PROJECT_CONTRACT_2026-07-08.md`

Zweck:

- Festhalten, dass PixImmo und PixCapture dieselbe Video-Pipeline verwenden
  sollen.
- Verhindern, dass spaeter wieder zwei getrennte Implementierungen entstehen.

## Verifikation

Ausgefuehrt in `projects/piximmo-web`:

- `npx eslint 'src/lib/video-workbench-projects.ts' 'src/lib/video-workbench-prompt-normalizer.ts' 'src/app/api/video-workbench/projects/[projectId]/route.ts' 'src/app/api/video-workbench/prompt/normalize/route.ts'`
- `npm exec tsc -- --noEmit --pretty false --incremental false`

Beide Checks liefen ohne Fehler.

Zusaetzlich geprueft:

- Inline-Script-Syntax der drei Workbench-HTML-Dateien.
- Syntax von `public/video-workbench/shared/project-store.js`.

Browser-Pruefung:

- Vorherige Browser-Automation fuer localhost wurde einmal von der Browser-URL-
  Policy blockiert. Nicht umgangen.
- Die Seite selbst war im Benutzerbrowser weiterhin unter
  `/dashboard/video-studio/maklerin` offen.

## Git-/Dirty-State

Root `git status --short` zeigte bereits mehrere nicht zu diesem Schritt
gehoerende Aenderungen, u. a. Secret-/Voleur-/ProductCapture-Dateien und
Subrepos. Diese wurden nicht angefasst.

PixImmo `projects/piximmo-web` Status enthaelt:

- Bereits vorhandene geloeschte alte React-Seiten:
  - `src/app/dashboard/video-studio/page.tsx`
  - `src/app/dashboard/video-studio/motion/page.tsx`
  - `src/app/dashboard/video-studio/maklerin/page.tsx`
- Bereits vorhandene statische Workbench-/Route-Dateien:
  - `public/video-workbench/`
  - `src/app/dashboard/video-studio/route.ts`
  - `src/app/dashboard/video-studio/motion/route.ts`
  - `src/app/dashboard/video-studio/maklerin/route.ts`
  - `src/lib/video-workbench-static.ts`
- Neue Dateien aus diesem Schritt:
  - `src/lib/video-workbench-projects.ts`
  - `src/lib/video-workbench-prompt-normalizer.ts`
  - `src/app/api/video-workbench/projects/[projectId]/route.ts`
  - `src/app/api/video-workbench/prompt/normalize/route.ts`
  - `public/video-workbench/shared/project-store.js`
- Ebenfalls in diesem Schritt angepasst:
  - `public/video-workbench/timeline/index.html`
  - `public/video-workbench/motion/index.html`
  - `public/video-workbench/maklerin/index.html`

Unrelated, nicht anfassen ohne separaten Auftrag:

- `src/app/api/admin/editor-uebergabe/`
- `src/app/api/admin/material-import/`
- `src/app/dashboard/admin/editor-uebergabe/`
- `src/app/dashboard/admin/material-import/`

Kein Commit wurde erstellt, weil der PixImmo-Tree bereits viele untracked
Workbench- und Admin-Dateien aus vorherigen Schritten enthaelt. Ein Commit sollte
erst nach Daniels Entscheidung erfolgen, welche untracked Bloecke zusammen in
den Stand gehoeren.

## Naechster sinnvoller Schritt

1. Im Browser einmal den Button `Zwischenstand erstellen` auf der Maklerin-Seite
   mit einem deutschen Testprompt verwenden.
2. Pruefen, ob der gemeinsame Projektzustand unter
   `.video-workbench/projects/candidate-10-shared-video-project-v1.json`
   entsteht und die Sections `presenter` und `promptPipeline` enthaelt.
3. Danach Provider-Entscheidung konkretisieren:
   - Google Veo direkter Zugriff vorhanden?
   - Wenn ja: neue Google-Veo-Start-Route bauen.
   - Wenn nein: FAL-Route auf Veo 3.1 konfigurierbar machen und als Fallback
     deklarieren.

## Update 2026-07-09 - Timeline/Motion in PixImmo und PixCapture

Daniel hat die aehnlicher-Avatar/HeyGen-Digital-Twin-Spur gestoppt, bis
aktuelles Bild-/Videomaterial einer realen Person mit Consent vorliegt. Bis
dahin bleibt Veo der beste praktische Provider fuer die aktuellen
Makler-/Bewegungstests.

Die ersten zwei Workbench-Seiten sind jetzt in beiden Webprodukten als
sessiongeschuetzte lokale Prototyp-Routen vorhanden:

- PixImmo:
  - `/dashboard/video-studio?candidate=10`
  - `/dashboard/video-studio/motion`
  - `/api/video-workbench/projects/candidate-10-shared-video-project-v1`
- PixCapture:
  - `/dashboard/video-studio?candidate=10`
  - `/dashboard/video-studio/motion`
  - `/api/video-workbench/projects/candidate-10-shared-video-project-v1`

PixCapture bekam dafuer die Timeline-/Motion-Workbench-Assets, die
`video-workbench` Projekt-API und die statischen Route-Handler. Die
Maklerin-/Presenter-Seite wurde bewusst noch nicht nach PixCapture gespiegelt.

`public/video-workbench/shared/project-store.js` liest den Projektzustand beim
Start automatisch und wird beim Serven ueber `data-source-product` konfiguriert.
Schreibzugriffe aus PixImmo markieren `lastWriter.sourceProduct=piximmo`;
Schreibzugriffe aus PixCapture markieren `lastWriter.sourceProduct=pixcapture`.

Wichtig: Beide Repos nutzen denselben API-Vertrag. Die API schreibt auf der
Website zuerst in Postgres (`VideoWorkbenchProject`) und faellt nur lokal bzw.
bei DB-Ausfall auf die bisherige `.video-workbench` Filesystem-Struktur zurueck.
Ein wirklich zentraler Cross-Domain-Speicher zwischen pix.immo und
pixcapture.app ist damit noch nicht geloest; dafuer muss spaeter bewusst ein
gemeinsamer DB/R2/dauerhafter Shared Storage gewaehlt werden.

Verifikation am 2026-07-09:

- PixImmo:
  - `npx eslint 'src/lib/video-workbench-static.ts' 'src/app/api/video-workbench/projects/[projectId]/route.ts'`
  - `npx prisma validate`
  - `node --check public/video-workbench/shared/project-store.js`
  - `npm exec tsc -- --noEmit --pretty false --incremental false`
- PixCapture:
  - `npx eslint 'src/lib/video-workbench-projects.ts' 'src/lib/video-workbench-static.ts' 'src/app/dashboard/video-studio/route.ts' 'src/app/dashboard/video-studio/motion/route.ts' 'src/app/api/video-workbench/projects/[projectId]/route.ts'`
  - `npx prisma validate`
  - `node --check public/video-workbench/shared/project-store.js`
  - `npm exec tsc -- --noEmit --pretty false --incremental false`
- HTTP-Smoke ohne Login:
  - beide Workbench-Seiten leiten korrekt zur Anmeldung weiter.
  - beide Projekt-APIs liefern ohne Session `401`.
  - beide `/video-workbench/shared/project-store.js` Assets liefern `200`.

## Update 2026-07-09 - Modal/R2-Render fuer fertiges Workbench-Video

Daniel hat korrekt festgehalten, dass zur Workbench nicht nur Timeline/Motion
gehoeren, sondern auch ein fertiger Video-Render. Dafuer wurde ein Modal/R2-
Renderpfad fuer den Motion-Plan ergaenzt und in beiden Webprodukten
gespiegelt:

- `src/lib/video-workbench-renderer.ts`
- `src/app/api/video-workbench/projects/[projectId]/render/start/route.ts`
- `src/app/api/video-workbench/projects/[projectId]/render/status/route.ts`
- `public/video-workbench/motion/index.html` mit Button `Video rendern`

Der Renderer liest den Kandidat-10-Motion-Plan, nutzt die Web-Kopien der
Bilder oder vorgerenderte Quellclips aus R2, rendert sauberes 9:16-Cropping
ohne Bildverzerrung und schreibt das fertige H.264-MP4 nach R2 unter
`video-workbench/renders/<projectId>/<jobId>.mp4`. Wichtig: Der FFmpeg-Render
laeuft nicht in Vercel/Next.js, sondern im Voleur Modal Worker
`pix-social-video` ueber:

- `POST https://dafort001--pix-social-video-social-video-api.modal.run/render/workbench/start`
- `GET https://dafort001--pix-social-video-social-video-api.modal.run/render/workbench/status/<callId>`

Vercel/PixImmo/PixCapture orchestrieren nur Start, Status und Downloadlink.
Die Website liefert das fertige Video ueber eine stabile Download-Route aus:

- `GET /api/video-workbench/projects/[projectId]/render/download?jobId=<jobId>`

Der FFmpeg-Prozess rendert nur temporaer im Modal Worker. Das MP4 liegt danach
dauerhaft in R2, nicht in Vercel und nicht in `public/`. Standbild-Szenen
nutzen `r2Key`; vorgerenderte Clips wie die Kandidat-10-Maklerin-Opening-Szene
nutzen `videoR2Key`. Workbench-Renders werden auf `1080x1920`, H.264 und
`60fps` normalisiert.

Verifizierter lokaler E2E am 2026-07-09 auf PixImmo dev server
`http://127.0.0.1:3000`:

- `POST /api/video-workbench/projects/candidate-10-shared-video-project-v1/render/start`
  mit temp-admin Cookie: `success=true`, `status=completed`, `itemCount=26`,
  `durationSeconds=33.25`.
- `GET /api/video-workbench/projects/candidate-10-shared-video-project-v1/render/status`:
  letzter Job `completed` mit MP4-URL.
- R2-/Downloadroute:
  `GET /api/video-workbench/projects/candidate-10-shared-video-project-v1/render/download?jobId=...`
  liefert per Redirect ein abrufbares MP4.
- MP4-Verifikation:
  H.264, `1080x1920`, `60fps`, `33.533333s`.
- UI-E2E:
  Motion-Seite im Browser geoeffnet, `Video rendern` geklickt, Status
  `Render fertig. MP4 oeffnen` sichtbar. Screenshot:
  `projects/piximmo-web/.video-workbench/e2e/ui-modal-render-complete.png`.

Wichtig fuer Deployment: Diese Architektur haelt die PixImmo/PixCapture
Websites als reine Orchestrierungs-/Routing-Schicht. Videodaten werden nicht in
Vercel erzeugt, gespeichert oder zwischengespeichert. Quellbilder fuer Motiv 10
wurden fuer diesen Test direkt nach R2 unter
`video-workbench/source-assets/motion/candidate_10_motion_typo_assets/large/`
geladen.
