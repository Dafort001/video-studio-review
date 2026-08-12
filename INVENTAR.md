# Inventar: Video-Studio-Review

## Zweck und Herkunft

Dieses Repository stellt zwei klar bestimmte Stände der Video-Werkstatt nebeneinander, ohne sie zusammenzuführen, umzubenennen, zu reparieren oder zu refaktorieren.

| Verzeichnis | Rolle im Review | Quell-Commit | Datum | Commit-Betreff |
| --- | --- | --- | --- | --- |
| `v-alt/` | von Daniel als Stand mit der besseren UI bezeichnet | `16991f714ddcf1f5f23091c5b30e2e481cb112c9` | 2026-08-11 17:59:18 +02:00 | `fix: surface failed video preview after reload` |
| `v-neu/` | neuerer Stand mit der weiterentwickelten Logik | `f5c66fc4ac105683f933c27a121e0e4fb1375eee` | 2026-08-12 20:38:33 +02:00 | `fix(video-studio): structure final review workflow` |

`v-alt` ist ein Vorfahr von `v-neu`. Zwischen beiden liegen diese sieben Original-Commits: Motion-Demo-Bibliothek, 1,5-Sekunden-Clips, perspektivischer Video-Workflow, stufenweise Qwen-Perspektivplanung, klarer Galerie-Übergang, vereinheitlichte Live-Szenenvorschau und strukturierter finaler Review-Ablauf.

Aufgenommen wurden die Video-Studio-/Video-Workbench-Routen, ihre UI, Serverlogik, Tests, Konfiguration, direkten Importabhängigkeiten, kleinen UI-Ressourcen und die notwendige Prisma-Migration. Allgemeine Auth-, Datenbank-, R2- und Galerie-Hilfsdateien sind nur enthalten, wenn die Video-Werkstatt sie direkt oder transitiv importiert. Es wurden keine fachfremden PixImmo-Seiten und insbesondere kein ImageLife-Modul übernommen.

Abweichungen von den Quell-Commits gibt es ausschließlich in den in `SECRETS_ENTFERNT.md` protokollierten Dateien. Dort wurden credential-artige Werte durch `<ENTFERNT_…>`-Platzhalter ersetzt. Große Demo-Bildstrecken, das große Vorschauvideo, `.env`-Dateien, Abhängigkeiten und Build-Artefakte sind nicht enthalten.

## Verzeichnisbaum bis Tiefe 3

### `v-alt`

```text
v-alt
v-alt/eslint.config.mjs
v-alt/next.config.ts
v-alt/package-lock.json
v-alt/package.json
v-alt/postcss.config.mjs
v-alt/prisma
v-alt/prisma.config.ts
v-alt/prisma/migrations
v-alt/prisma/migrations/manual_video_studio_source_sets.sql
v-alt/prisma/schema.prisma
v-alt/public
v-alt/public/fonts
v-alt/public/fonts/video-studio
v-alt/public/video-workbench
v-alt/public/video-workbench/maklerin
v-alt/public/video-workbench/motion
v-alt/public/video-workbench/shared
v-alt/public/video-workbench/timeline
v-alt/scripts
v-alt/scripts/activate-video-studio-source-set.ts
v-alt/scripts/import-video-studio-demo-candidates.mjs
v-alt/src
v-alt/src/app
v-alt/src/app/api
v-alt/src/app/dashboard
v-alt/src/app/globals.css
v-alt/src/app/layout.tsx
v-alt/src/app/video-studio
v-alt/src/auth.config.ts
v-alt/src/auth.ts
v-alt/src/components
v-alt/src/components/Footer.tsx
v-alt/src/components/Header.tsx
v-alt/src/components/LayoutWrapper.tsx
v-alt/src/components/NotificationsBell.tsx
v-alt/src/components/app-shell
v-alt/src/components/privacy
v-alt/src/components/ui
v-alt/src/components/website
v-alt/src/data
v-alt/src/data/video-studio-demo-candidates.json
v-alt/src/lib
v-alt/src/lib/auth-security.ts
v-alt/src/lib/central-video-studio-account-library.server.ts
v-alt/src/lib/central-video-studio-account-library.ts
v-alt/src/lib/central-video-studio-session.server.ts
v-alt/src/lib/central-video-studio.ts
v-alt/src/lib/cost-tracking.ts
v-alt/src/lib/customer-gallery-links.ts
v-alt/src/lib/customer-gallery.ts
v-alt/src/lib/delivery-assets.ts
v-alt/src/lib/email-login-code.ts
v-alt/src/lib/gallery-release.ts
v-alt/src/lib/gallery-room-display.ts
v-alt/src/lib/image-input-guard.ts
v-alt/src/lib/job-scope.ts
v-alt/src/lib/modal-config.ts
v-alt/src/lib/prisma.ts
v-alt/src/lib/r2.ts
v-alt/src/lib/room-translations.ts
v-alt/src/lib/secret-auth.ts
v-alt/src/lib/shared-video-studio.ts
v-alt/src/lib/site-config.ts
v-alt/src/lib/temp-admin.ts
v-alt/src/lib/utils.ts
v-alt/src/lib/video-project-briefing.ts
v-alt/src/lib/video-studio-font-catalog.ts
v-alt/src/lib/video-studio-font-menu.server.ts
v-alt/src/lib/video-studio-import.ts
v-alt/src/lib/video-studio-server.ts
v-alt/src/lib/video-studio-source-inventory.ts
v-alt/src/lib/video-studio-source-set-import.ts
v-alt/src/lib/video-studio-source-set-server.ts
v-alt/src/lib/video-studio-source-set.ts
v-alt/src/lib/video-studio-user-library.server.ts
v-alt/src/lib/video-studio-workflow.ts
v-alt/src/lib/video-studio.ts
v-alt/src/lib/video-workbench-costs.ts
v-alt/src/lib/video-workbench-motion-test-prompts.ts
v-alt/src/lib/video-workbench-projects.ts
v-alt/src/lib/video-workbench-prompt-normalizer.ts
v-alt/src/lib/video-workbench-renderer.ts
v-alt/src/lib/video-workbench-static.ts
v-alt/src/lib/website-content.ts
v-alt/src/next-auth.d.ts
v-alt/src/proxy.ts
v-alt/src/styles
v-alt/src/styles/masonry.css
v-alt/src/styles/theme.css
v-alt/src/types
v-alt/src/types/react-responsive-masonry.d.ts
v-alt/tests
v-alt/tests/central-video-studio-account-library.test.ts
v-alt/tests/shared-video-studio.test.ts
v-alt/tests/video-project-briefing.test.ts
v-alt/tests/video-studio-font-catalog.test.ts
v-alt/tests/video-studio-source-set.test.ts
v-alt/tests/video-studio-workflow.test.ts
v-alt/tsconfig.json
v-alt/types
v-alt/types/next-auth.d.ts
```

### `v-neu`

```text
v-neu
v-neu/eslint.config.mjs
v-neu/next.config.ts
v-neu/package-lock.json
v-neu/package.json
v-neu/postcss.config.mjs
v-neu/prisma
v-neu/prisma.config.ts
v-neu/prisma/migrations
v-neu/prisma/migrations/manual_video_studio_source_sets.sql
v-neu/prisma/schema.prisma
v-neu/public
v-neu/public/fonts
v-neu/public/fonts/video-studio
v-neu/public/video-studio
v-neu/public/video-studio/motion-demos
v-neu/public/video-workbench
v-neu/public/video-workbench/maklerin
v-neu/public/video-workbench/motion
v-neu/public/video-workbench/shared
v-neu/public/video-workbench/timeline
v-neu/scripts
v-neu/scripts/activate-video-studio-source-set.ts
v-neu/scripts/e2e-video-studio-workbench.mjs
v-neu/scripts/import-video-studio-demo-candidates.mjs
v-neu/scripts/render-motion-demo-library.py
v-neu/src
v-neu/src/app
v-neu/src/app/api
v-neu/src/app/dashboard
v-neu/src/app/globals.css
v-neu/src/app/layout.tsx
v-neu/src/app/video-studio
v-neu/src/auth.config.ts
v-neu/src/auth.ts
v-neu/src/components
v-neu/src/components/Footer.tsx
v-neu/src/components/Header.tsx
v-neu/src/components/LayoutWrapper.tsx
v-neu/src/components/NotificationsBell.tsx
v-neu/src/components/app-shell
v-neu/src/components/privacy
v-neu/src/components/ui
v-neu/src/components/website
v-neu/src/data
v-neu/src/data/video-studio-demo-candidates.json
v-neu/src/lib
v-neu/src/lib/auth-security.ts
v-neu/src/lib/central-video-studio-account-library.server.ts
v-neu/src/lib/central-video-studio-account-library.ts
v-neu/src/lib/central-video-studio-session.server.ts
v-neu/src/lib/central-video-studio.ts
v-neu/src/lib/cost-tracking.ts
v-neu/src/lib/customer-gallery-links.ts
v-neu/src/lib/customer-gallery.ts
v-neu/src/lib/delivery-assets.ts
v-neu/src/lib/email-login-code.ts
v-neu/src/lib/gallery-release.ts
v-neu/src/lib/gallery-room-display.ts
v-neu/src/lib/image-input-guard.ts
v-neu/src/lib/job-scope.ts
v-neu/src/lib/modal-config.ts
v-neu/src/lib/prisma.ts
v-neu/src/lib/r2.ts
v-neu/src/lib/room-translations.ts
v-neu/src/lib/secret-auth.ts
v-neu/src/lib/shared-video-studio.ts
v-neu/src/lib/site-config.ts
v-neu/src/lib/temp-admin.ts
v-neu/src/lib/utils.ts
v-neu/src/lib/video-project-briefing.ts
v-neu/src/lib/video-studio-font-catalog.ts
v-neu/src/lib/video-studio-font-menu.server.ts
v-neu/src/lib/video-studio-import.ts
v-neu/src/lib/video-studio-server.ts
v-neu/src/lib/video-studio-source-inventory.ts
v-neu/src/lib/video-studio-source-set-import.ts
v-neu/src/lib/video-studio-source-set-server.ts
v-neu/src/lib/video-studio-source-set.ts
v-neu/src/lib/video-studio-user-library.server.ts
v-neu/src/lib/video-studio-workflow.ts
v-neu/src/lib/video-studio.ts
v-neu/src/lib/video-workbench-costs.ts
v-neu/src/lib/video-workbench-motion-test-prompts.ts
v-neu/src/lib/video-workbench-projects.ts
v-neu/src/lib/video-workbench-prompt-normalizer.ts
v-neu/src/lib/video-workbench-renderer.ts
v-neu/src/lib/video-workbench-static.ts
v-neu/src/lib/website-content.ts
v-neu/src/next-auth.d.ts
v-neu/src/proxy.ts
v-neu/src/styles
v-neu/src/styles/masonry.css
v-neu/src/styles/theme.css
v-neu/src/types
v-neu/src/types/react-responsive-masonry.d.ts
v-neu/tests
v-neu/tests/central-video-studio-account-library.test.ts
v-neu/tests/shared-video-studio.test.ts
v-neu/tests/video-project-briefing.test.ts
v-neu/tests/video-studio-font-catalog.test.ts
v-neu/tests/video-studio-source-set.test.ts
v-neu/tests/video-studio-workflow.test.ts
v-neu/tsconfig.json
v-neu/types
v-neu/types/next-auth.d.ts
```

## Einstieg, Start und Toolchain

### `v-alt`

- App-Einstieg: `src/app/layout.tsx` (Next.js App Router).
- Video-Studio-Setup: `src/app/dashboard/video-studio/setup/page.tsx` → `VideoStudioSetupPage` → `VideoStudioSetupClient`.
- Zentraler Launch: `src/app/video-studio/launch/page.tsx` → `VideoStudioLaunchPage`.
- Bedienbare Workbench-Route: `src/app/video-studio/workbench/[projectId]/page.tsx` → `CentralVideoStudioPage` → `SharedVideoStudioWorkbench`.
- Installation: `npm ci`.
- Entwicklung: `npm run dev`; danach je nach vorhandenem signiertem Launch/Projekt `/video-studio/launch` beziehungsweise `/video-studio/workbench/<projectId>`.
- Produktionsbuild: `npm run build`; Start des Builds: `npm run start`.
- Fokussierte Unit-Tests: `npm run test:unit`.
- Toolchain: Node.js `>=20.9.0`, npm/`package-lock.json`, Next.js `16.3.0`, React/ReactDOM `19.2.3`, TypeScript 5, Tailwind CSS `4.3.3`, ESLint 9, Prisma/Prisma Client `7.9.1`.
- Zentrale Laufzeitabhängigkeiten: Auth.js/NextAuth 5 Beta, Neon-Adapter und Neon-Serverless, AWS S3 SDK für R2, `jose`, `zod`, `sharp`, `motion`, Radix UI, MUI und Lucide. Die vollständige unveränderte Liste steht in `package.json` und `package-lock.json`.

### `v-neu`

- App-Einstieg, Setup, Launch und Workbench entsprechen den oben genannten Pfaden und Komponenten in `v-neu/`.
- Installation: `npm ci`.
- Entwicklung: `npm run dev`.
- Produktionsbuild: `npm run build`; Start des Builds: `npm run start`.
- Fokussierte Unit-Tests: `npm run test:unit`.
- Zusätzlich vorhandener lokaler Browserablauf mit Fake-Renderworker: `npm run e2e:video-studio:local`. Er ist kein Provider- oder Produktionsnachweis.
- Zusätzlich für die lokale Motion-Demo-Erzeugung: Python 3, Pillow und ein `ffmpeg` im `PATH`.
- JavaScript-/Web-Toolchain und Abhängigkeiten entsprechen `v-alt`; die exakten Versionen stehen in `package.json` und `package-lock.json`.

Beide Stände benötigen für echte Sitzungen eigene nichtproduktive Konfiguration für Auth, Datenbank, R2, Central Video Studio und Renderworker. `.env`-Dateien wurden absichtlich ausgeschlossen; entfernte Werte dürfen nicht aus dem ursprünglichen System zurückkopiert werden. Ohne diese Konfiguration startet der Code zwar als Build/Entwicklungsserver, aber ein echter Handoff, Datenzugriff oder Render-End-to-End-Lauf ist nicht möglich.

## UI-Schicht

### Gemeinsamer aktiver Einstieg

- `src/app/video-studio/workbench/[projectId]/page.tsx` — `CentralVideoStudioPage` lädt die Sitzung und rendert die aktive Werkstatt.
- `src/app/dashboard/video-studio/workbench/[projectId]/SharedVideoStudioWorkbench.tsx` — `SharedVideoStudioWorkbench` ist die zentrale zustandsführende Client-Komponente.
- `src/app/dashboard/video-studio/workbench/[projectId]/GuidedStudioStages.tsx` — enthält die sichtbaren Stufen `GalleryStage`, `SortingTimelineStage`, `MotionCatalogPanel`, `SceneCreativePanels` und `AiStudioPanel`.
- `src/app/dashboard/video-studio/setup/VideoStudioSetupClient.tsx` — Einstieg aus dem PixImmo-Setup und Übergabe an die Workbench.
- `src/app/video-studio/launch/page.tsx` — Einlösung eines signierten Launchcodes.

Die historischen statischen Oberflächen liegen in beiden Ständen unter `public/video-workbench/` (`timeline/index.html`, `motion/index.html`, `maklerin/index.html`, `shared/project-store.js`). Sie sind als Vergleichsmaterial enthalten, werden im aktiven App-Fluss aber durch Redirect-/Proxy-Regeln blockiert; die Unit-Tests prüfen ausdrücklich, dass sie keinen zweiten aktiven Editor bilden.

`v-neu/src/app/dashboard/video-studio/workbench/[projectId]/PerspectiveVideoPanel.tsx` enthält zusätzlich `PerspectiveVideoPanel`. Die Komponente wird im finalen `v-neu`-Stand von keiner anderen Quelldatei importiert und ist damit im kanonischen Ablauf nicht erreichbar.

## Render- und ffmpeg-Pfad

### Produktiver Portalpfad in beiden Ständen

1. `src/app/api/video-workbench/projects/[projectId]/render/start/route.ts` — Route-Funktion `POST`.
2. `src/lib/video-workbench-renderer.ts` — `startVideoWorkbenchRenderJob` erstellt und sendet den Auftrag; `refreshVideoWorkbenchRenderJob` liest den Status nach.
3. Beide Funktionen adressieren über `getModalPipelineTarget("object-video-render")` einen externen Modal/Voleur-Renderdienst.

Die tatsächliche produktive ffmpeg-Implementierung liegt **nicht in diesen beiden PixImmo-Ständen**. Sie gehört zum externen Voleur/Modal-Repository und ist deshalb in diesem fokussierten Review-Repo weder ausführbar noch code-seitig prüfbar. Die PixImmo-Dateien enthalten den Orchestrierungs- und Datenvertrag, nicht den finalen Encoder.

### Weitere Renderpfade

- Beide Stände: `public/video-workbench/motion/index.html` — `renderMotionVideo` ruft lediglich den HTTP-Renderpfad auf; es enthält keinen lokalen Encoder.
- Nur `v-neu`: `scripts/render-motion-demo-library.py` — `render_motion` erzeugt die kleinen kanonischen Motion-Demos lokal und ruft dabei `ffmpeg` auf. `main` baut Manifest und Clip-Bibliothek.

## Funktionsstand

### In `v-alt` vorhanden und durch fokussierte Tests belegt

- Signierter PixImmo-Handoff, Central-Launch, projektgebundene Sitzung und Rücksprung zum Portal.
- Quellset-Import mit stabilen IDs, Hash-/JPEG-/Dimensionsprüfung, Aktivierung und Rollback-Vertrag.
- Geführter Ablauf für Logo, Galerie, Sortier-Timeline, Szenenbearbeitung sowie Vorschau/AI-Bereich.
- Timeline-Reihenfolge, Entfernen, Undo/Redo und dauerhafte Shared-Revisionen.
- Katalog mit 91 Bewegungsdefinitionen sowie sichere 2D-Quellbewegungen mit Start-/End-Frames und Dauergrenzen.
- Logo-Geometrie, mehrere Typografieelemente, Fontkatalog/-verwaltung, Ein-/Aus-/Während-Animationen und Ebenen-/Maskenvertrag.
- Accountgebundene Bibliothek für Fonts/Brand-Assets mit Produkt- und Actor-Isolation.
- Vorschau- und Final-Render-Orchestrierung; fehlgeschlagene Vorschauen bleiben nach Reload sichtbar und wiederholbar.
- Optionaler AI-Entwurf wird als Shared-Draft gespeichert; Provider-Ausführung bleibt in diesem Stand deaktiviert.

### Zusätzlich oder verändert in `v-neu`

- 21 quellbasierte, jeweils 1,5 Sekunden lange Motion-Demo-Clips mit Manifest; die Motion-Auswahl wird zunächst auf sechs Vorschläge begrenzt und progressiv erweitert.
- Ein gemeinsamer, erneut abspielbarer 9:16-Szenenfluss für Bewegung, Start-/End-Frame, Dauer, Typografie und Logo statt getrennter Vorschaufragmente.
- Eindeutiger primärer Übergang vom Logo-Schritt zur Galerie.
- Explizite Prüfreihenfolge für Gesamtvorschau, bestätigtes Ansehen und anschließenden finalen Film.
- Optionale AI-Ideen sind nachgeordnet; der kanonische Finalschritt kann keinen Provider starten.
- Lokales Playwright-Skript mit Fake-Renderworker für den Werkstattablauf.
- Zusätzlicher Veo-Download-Endpunkt und perspektivischer Panel-Code; das Panel ist im finalen Ablauf jedoch nicht verdrahtet.

## Bekannte offene Fehler und Grenzen

### Beide Stände

- **Host-/Launchfehler:** `src/app/api/video-studio/shared/jobs/[jobReference]/handoff/route.ts` übernimmt `exchanged.workbenchUrl` mitsamt dessen Origin. `VideoStudioSetupClient.openWorkbench()` verwendet diese URL unverändert. Ein Start auf einer isolierten Deployment-URL kann deshalb zu `beta.pix.immo` wechseln und dort die falsche Fassung öffnen. Dieser Fehler ist in beiden hier exportierten Commits ungelöst.
- Der produktive ffmpeg-/Modal-Renderer fehlt im Repo; nur der Aufrufvertrag ist vorhanden. Ein vollständiges Render-End-to-End-Review braucht das getrennte Voleur/Modal-Repository.
- Es gibt keine mitgelieferten `.env`-Dateien, Produktionscredentials oder Kundendaten. Ein externer Reviewer muss ausschließlich eigene Testkonfiguration und Testdaten verwenden.
- Die großen Demo-Fotostrecken und das große Vorschauvideo wurden entsprechend dem Auftrag ausgeschlossen. Import- und historische statische Demoabläufe benötigen daher eigene Testbilder; die eigentliche Werkstattlogik und die kleinen `v-neu`-Motion-Clips sind enthalten.
- `package.json` blieb bis auf Secret-Platzhalter unverändert. Darin stehen deshalb auch fachfremde PixImmo-Skriptnamen, deren Quelldateien im fokussierten Extract absichtlich fehlen. Unterstützt und geprüft sind hier nur `dev`, `build`, `start`, `lint`, `test:unit`, die Video-Studio-Import-/Source-Set-Skripte und in `v-neu` der lokale Video-Studio-E2E.
- Die lokale technische Prüfung ist keine visuelle oder fachliche Abnahme durch Daniel.

### Nur beziehungsweise besonders `v-alt`

- Keine eingebettete Motion-Demo-Bibliothek; die 91 Katalogeinträge besitzen hier keine 21 ehrlichen Clipvorschauen.
- Der primäre Übergang vom Logo-Schritt zur Galerie ist in Text und Zustandsführung weniger eindeutig.
- Die Szenenbearbeitung zeigt Bewegung, Frames, Typografie und Ergebnis nicht in demselben vereinheitlichten Live-Preview-Ablauf wie `v-neu`.
- Gesamtvorschau, Sichtungsbestätigung und Finalrender sind weniger klar voneinander getrennt.
- Kein fokussiertes lokales Playwright-E2E-Skript für die Werkstatt in diesem Stand.

### Nur beziehungsweise besonders `v-neu`

- Nur 21 von 91 Bewegungsdefinitionen haben echte eingebettete Demo-Clips; Tiefen-, Fokus- und generative Varianten bleiben ohne gleichwertige Vorschau.
- `PerspectiveVideoPanel` und der zusätzliche Veo-Pfad sind als Zwischenentwicklung vorhanden, aber nicht vollständig in den finalen kanonischen Ablauf eingebunden.
- Das lokale Playwright-E2E verwendet einen Fake-Renderworker und beweist weder Modal/ffmpeg noch einen realen Providerlauf.
- Der isolierte Deployment-Stand wurde von Daniel nicht erfolgreich in der Werkstatt abgenommen, weil der gemeinsame Host-/Launchfehler zum alten Beta-Host führte.

## Technische Prüfung dieses Review-Exports

- `v-alt`: 60 fokussierte Unit-Tests, davon 59 bestanden und 1 Test für ein nicht mitgeliefertes reales Seeburg-Audit erwartungsgemäß übersprungen.
- `v-neu`: 65 fokussierte Unit-Tests, davon 64 bestanden und derselbe reale Seeburg-Audit-Test übersprungen.
- Beide Stände: TypeScript ohne Fehler, ESLint ohne Befund, Produktionsbuild mit Next.js/webpack erfolgreich.
- Beim Build wurde erwartungsgemäß protokolliert, dass `<ENTFERNT_DATABASE_URL>` keine gültige Datenbank-URL ist; der Build selbst wurde dennoch vollständig erzeugt und danach wieder gelöscht.
- Es wurden keine Provider-, Qwen-, GPU-, AI- oder Renderläufe und keine Kundendatenmutation ausgeführt.

## Dokumentation

- `doku/piximmo-web/`: die vorhandenen PixImmo-Soll-, Adapter- und Source-Set-Dokumente.
- `doku/workspace/video-studio/`: Capability Registry, Shared-API, Creative Layers, Fontmanifest und vorhandene Proof-/Analyseunterlagen.
- `doku/workspace/video-motion/`: vorhandene Architektur-, Motion-, Typografie-, Qualitäts-, Planungs- und historische Arbeitsunterlagen.
- `doku/workspace/docs/HANDOVERS/`: die einschlägigen Video-Studio-/Video-Workbench-/ffmpeg-Handover-Dokumente.
- `doku/QUELLENHINWEIS.md`: erklärt, dass `VIDEO_STUDIO_UMSETZUNGSAUFTRAG.md` nicht auffindbar war und welche tatsächlich vorhandenen Originale stattdessen aufgenommen wurden.
