# PixImmo Video Workbench Render/Motion Handover

## Auftrag fuer morgen: ffmpeg-Umsetzung, keine Grundsatzdiskussion

Stand: 2026-07-09, 22:45 CEST

Daniel will morgen **nicht** wieder ueber Motion-Namen, Drift, alte Render oder
Architektur diskutieren. Der funktionierende Vertrag ist gefunden:

> Der Browser-Simulator ist die Wahrheit. Modal muss exakt dieselben
> `startCrop` / `endCrop` / `cx` / `cy` / `zoom` Bewegungen rendern.

Aktuell funktioniert das korrekt ueber den neuen frameweisen
Simulator-Renderer in:

```text
projects/voleurdimages-backend/modal_app/social_video_worker.py
Commit: d3a027f Render workbench crops with simulator math
Modal-App: pix-social-video, deployed
```

Dieser Pfad ist fachlich korrekt, aber wegen Python/OpenCV frameweise potenziell
etwas weicher/langsamer als ein reiner ffmpeg-Filtergraph.

### Konkrete Aufgabe

Die Aufgabe ist **nur**:

1. Die bereits funktionierende Simulator-Crop-Mathematik aus
   `social_video_worker.py` in einen nativen ffmpeg-Filter zu uebersetzen.
2. Dabei muss das Ergebnis pixelgleich bzw. praktisch kongruent zum
   Simulator-Renderer bleiben.
3. Keine neuen Motion-Regeln erfinden.
4. Keine UI-Diskussion.
5. Keine Provider-/Makler-/Text-Themen aufmachen.

### Relevante Dateien

```text
projects/voleurdimages-backend/modal_app/social_video_worker.py
projects/piximmo-web/public/video-workbench/motion/index.html
projects/piximmo-web/src/lib/video-workbench-renderer.ts
projects/pixcapture-web/src/lib/video-workbench-renderer.ts
```

Die Web-Adapter sind bereits gepusht/deployed und duerfen die Start-Crop-Mitte
nicht mehr auf Originalbildmitte `0.5/0.5` zerstoeren:

```text
PixImmo-Web: f190b5e Keep workbench zoom anchored to start crop
PixCapture-Web: eabf97f Keep workbench zoom anchored to start crop
Voleur/Modal: d3a027f Render workbench crops with simulator math
```

### Abnahmekriterium

Ein Test mit Daniels JSON:

```text
/Users/danielfortmann/Downloads/candidate-10-motion-plan-2026-07-09T20-07-50.json
```

muss zeigen:

```text
Simulator-Preview == Modal-Render
```

Mindestens pruefen:

- Szene 2 Mitte und Ende: `slow_push`
- Szene 5 Mitte und Ende: `slide_left`
- Vollrender 26 Szenen: exakt 33.25s
- 1080x1920
- 60 fps
- Text bleibt sichtbar

Aktuelle Referenzdatei auf Daniels Desktop:

```text
/Users/danielfortmann/Desktop/candidate-10-modal-simulator-full-2026-07-09.mp4
```

Wenn der native ffmpeg-Pfad nicht kongruent ist: **nicht shippen**. Dann bleibt
der frameweise Simulator-Renderer der funktionierende Stand.

---

Stand: 2026-07-09, 19:12 CEST

## Kurzstatus

PixImmo Motion/Typo Editor fuer Motiv 10 ist auf `beta.pix.immo` mit dem
aktuellen Render-/Motion-Stand live. Der relevante PixImmo-Branch ist
`codex/piximmo-portal-merge`; der relevante Voleur-Backend-Branch ist
`codex/pipeline-batchworker-20260418`.

Der aktuelle Beta-Deploy ist bereit:

- Vercel deployment: `dpl_DUXcCYwTdZB8iC12kBv52rnwyJvu`
- URL: `https://piximmo-n6qitae6o-daniel-fortmanns-projects-08a374bc.vercel.app`
- Alias: `https://beta.pix.immo`
- Status bei Pruefung: `Ready`

## Wichtige Produktregeln aus dieser Session

- Externe Provider-/Modellnamen duerfen nicht sichtbar auf die Produktseite.
- Basis-Render ist 60 fps. 30 fps ist fuer diese Workbench nicht akzeptabel.
- Vercel/PixImmo bleibt Orchestrierung: Start, Status, Downloadlink. Video wird
  nicht in Vercel erzeugt oder zwischengespeichert.
- Der fertige MP4 liegt in R2; lokale Testdownloads unter `.video-workbench/`
  sind nur E2E-Artefakte.
- Bei Slides muss die Bewegung beherrschbar sein: keine versteckten Tastatur-
  Modi, keine unabsichtliche Y-Achsen-Beule.

## Was umgesetzt und gepusht wurde

### PixImmo Web

Repo:

```text
projects/piximmo-web
Branch: codex/piximmo-portal-merge
```

Relevante letzte Commits:

```text
cca283b Always lock slide movement height
3430ed9 Lock slide drag to horizontal movement
a2caa46 Add preview alignment grid
9a0b184 Lock slide frame height for equal crops
f616cac Tame short workbench motion presets
4fd194c Normalize video workbench motion presets
```

Wichtige Datei:

```text
public/video-workbench/motion/index.html
```

Aktueller Motion-Editor-Stand:

- `simple-axis-motion-v5` ist live.
- Takes unter 1 Sekunde werden automatisch nur noch als sehr leichter,
  zentrierter Push-in gesetzt.
- `Pull Out` bleibt zentriert.
- `Slide links` / `Slide rechts` sind bei gleicher Rahmengroesse auf der
  Y-Achse gesperrt.
- Beim Ziehen des Endrahmens in Slide-Bewegungen veraendert sich nur X, nicht Y.
- `Beide angleichen` setzt Slides wieder gerade.
- Alte lokale Slide-Y-Abweichungen werden durch `simple-axis-motion-v5`
  neutralisiert.
- Rechts in der 9:16-Vorschau liegt ein Raster:
  - starke vertikale und horizontale Mitte
  - Drittel-/Viertel-Linien
  - duennen Rahmen
  - reines Vorschau-Overlay, kein Einfluss auf Render oder Export

Verifizierter Inhaltscheck auf `beta.pix.immo`:

```text
preview-grid vorhanden
simple-axis-motion-v5 vorhanden
Slide-Y-Lock vorhanden: cy: cfg.start.cy
slideLockedY vorhanden
```

### Voleur Backend / Modal

Repo:

```text
projects/voleurdimages-backend
Branch: codex/pipeline-batchworker-20260418
Commit: 9b882ea Smooth workbench render motion at 60fps
```

Wichtige Datei:

```text
modal_app/social_video_worker.py
```

Umgesetzt:

- Workbench-Render animiert Standbild-Zoom/Zentrum framebasiert.
- Ergebnis wird wirklich in 60 fps gerendert.
- Modal-App `pix-social-video` wurde deployed.

Verifizierte Renderwerte:

- Direkter Modal-Test mit 6 Szenen:
  - H.264
  - 1080x1920
  - `60/1 fps`
  - 855 Frames
  - 14.25 Sekunden
- Website-E2E ueber Motion-Seite:
  - Button `Video rendern`
  - Status `Render fertig`
  - Download ueber Website-Route
  - H.264
  - 1080x1920
  - `60/1 fps`
  - 2020 Frames
  - 33.666667 Sekunden

Testvideo wurde auf Daniels Desktop gelegt:

```text
/Users/danielfortmann/Desktop/piximmo-kandidat-10-60fps-render.mp4
```

## Bekannte offene Frage

Daniel meldete danach:

> Bei allen Slow-Push-Geschichten wirkt es, als ziehe es leicht schraeg nach
> oben links, nicht wie reiner Zoom.

Noch nicht geloest. Wahrscheinliche Ursache pruefen:

- `normalizeCrop()` klemmt `cx/cy` je nach Zoom und Bildrand.
- Dadurch kann ein eigentlich zentrierter Push visuell driften, wenn Start oder
  Ende nahe an einer Crop-Grenze liegen.
- Preview und Modal-Renderer verwenden unterschiedliche Crop-Mathematik:
  - Browser: `cropSize()` + CSS-Positionierung
  - Modal: FFmpeg scale/crop mit framebasierter Expression

Naechster sinnvoller Schritt:

1. Fuer Slow Push eine eigene Center-Lock-Regel analog Slide-Y-Lock pruefen:
   wenn `motionType === "slow_push"`, dann `end.cx = start.cx` und
   `end.cy = start.cy` nach `normalizeCrop`, ausser das Klemmen macht es
   unmoeglich.
2. Fuer Take 12 / andere Problem-Takes in der Vorschau den tatsaechlichen
   Start-/End-Crop loggen.
3. Wenn Drift vom Klemmen kommt, UI sichtbar markieren:
   "Push ist am Bildrand geklemmt" oder Startzentrum automatisch weiter ins
   sichere Bildzentrum setzen.

## Dirty-State / Hygiene

### PixImmo Repo

`projects/piximmo-web` hat nach den Commits weiterhin vorhandene, nicht in
dieser Handover-Aenderung enthaltene Aenderungen:

```text
 M src/app/api/video-studio/veo/start/route.ts
 M src/app/api/video-studio/veo/status/route.ts
 D src/app/dashboard/video-studio/maklerin/page.tsx
 M src/lib/cost-tracking.ts
?? .video-workbench/
?? exports/
?? public/video-workbench/maklerin/
?? src/app/api/admin/editor-uebergabe/
?? src/app/api/admin/material-import/
?? src/app/api/video-workbench/motion-test-prompts/
?? src/app/api/video-workbench/projects/[projectId]/costs/
?? src/app/api/video-workbench/prompt/
?? src/app/api/video-workbench/video-quality-presets/
?? src/app/dashboard/admin/editor-uebergabe/
?? src/app/dashboard/admin/material-import/
?? src/app/dashboard/video-studio/maklerin/route.ts
?? src/lib/video-workbench-costs.ts
?? src/lib/video-workbench-motion-test-prompts.ts
?? src/lib/video-workbench-prompt-normalizer.ts
```

Diese Dateien waren bereits Arbeits-/Nebenstand und wurden fuer die letzten
Motion-Regel-Commits nicht mitgestaged.

### Voleur Backend Repo

`projects/voleurdimages-backend` hat nach dem Modal-Commit weiterhin:

```text
 M scripts/setup_modal_secrets.sh
```

Diese Datei wurde nicht angefasst und nicht gestaged.

### Workspace Root

Der Workspace-Root hat weitere vorhandene Dirty-/Untracked-Staende in Docs,
Subprojekten und Tools. Fuer diesen Handover ist nur diese neue Datei relevant.

## Naechster Agent

Bitte nicht wieder von vorne bauen. Der Renderpfad funktioniert und ist live.

Wenn Daniel weiter an der Slow-Push-Drift arbeitet:

1. Nur `projects/piximmo-web/public/video-workbench/motion/index.html` lesen.
2. Slow-Push-Crop-Logik gegen `normalizeCrop()` und `cropSize()` pruefen.
3. Keine Provider-Namen in die UI.
4. Nach jeder UI-Regel:
   - Inline-JS aus HTML mit `vm.Script` pruefen.
   - `git diff --check`.
   - gezielt committen.
   - pushen.
   - `npx vercel@latest inspect <deployment-url>` bis `Ready`.
   - `curl https://beta.pix.immo/video-workbench/motion/index.html | rg ...`
     fuer Inhaltscheck.
