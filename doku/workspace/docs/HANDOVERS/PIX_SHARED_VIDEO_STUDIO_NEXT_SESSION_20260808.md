# PixImmo/PixCapture Shared Video Studio · Übergabe für 2026-08-08

Stand: 2026-08-07, 21:16 CEST

## Morgen genau hier einsteigen

In dieser Reihenfolge lesen:

1. `00_READ_FIRST_EVERY_SESSION.md`
2. `docs/HANDOVERS/PIXCAPTURE_START.md`
3. `/Volumes/drive 1/PIXCAPTURE/CODEX_WORKING_MEMORY_DO_NOT_TOUCH/video-motion-current.md`
4. diese Datei
5. `docs/video-studio/CANDIDATE_7_VISUAL_PROOF_2026-08-07.md`

Das Thema ist das gemeinsame Video Studio für PixImmo und später PixCapture.
Die heutige Arbeit liegt im Umbrella-Root; kein verschachteltes PixImmo-,
PixCapture-Web- oder Voleur-Repo wurde für diesen Meilenstein verändert.

## Ergebnis des 07.08.2026

Die drei verbleibenden gesperrten Objektkandidaten 1, 5 und 7 wurden gezielt
inventarisiert. Kandidat 10 ist dauerhaft als neues Demo- und Referenzmotiv
ausgeschlossen; seine alten MP4s bleiben ausschließlich historischer
technischer Nachweis.

Gewählt wurde Kandidat 7, das Backsteinhaus mit Garten/Einfahrt:

- stärkste zusammenhängende Objektgeschichte;
- klare Fassade und Gartenfolge;
- warme, bewohnte Wohn-/Essräume;
- genügend unterschiedliche Nebenräume für einen glaubwürdigen Rhythmus.

Neu gebaut wurden:

- `guided.mp4`: geführte Maklerfassung, 13 Takes, 32,321333 Sekunden;
- `showcase.mp4`: klar interne Timeline-Leistungsdemo, 10 Takes,
  29,221333 Sekunden.

Beide Videos verwenden ausschließlich vorhandene Bilder von Kandidat 7. Kein
Candidate-10-Material und kein alter vorbereiteter Spezialclip wurde verwendet.

## Unveränderliche Designregeln

- Schrift niemals in Pillen, Karten, Badges oder einer eigenen Hintergrundfläche
  über dem Bild.
- Text liegt direkt im Bild, innerhalb der Hochformat-Safe-Areas.
- Die Typografie wählt bildabhängig hell oder dunkel.
- Erlaubt sind nur ein dezenter Schatten und eine schmale Outline.
- Keine Provider- oder Modellnamen in der Makleroberfläche.
- Die gute heutige Baseline nicht für den nächsten Versuch überschreiben.

## Ehrlicher technischer Nachweis

Real ausgeführt wurde ausschließlich:

`gemeinsamer VideoProject-Vertrag -> render.timeline-Routenauswahl -> lokaler Timeline-Worker -> Hochformat-MP4 -> vollständige Medienprüfung`

Nicht ausgeführt wurden:

- kein `prepare.*`-Worker;
- kein `presenter.*`-Worker;
- kein Netzwerk-, Modal-, R2- oder Deployment-E2E;
- keine produktive 1080 x 1920-Ausgabe;
- keine Musik, Sprache oder hörbare Atmosphäre.

Die sichtbaren Bewegungen sind die real gerenderte Crop-/Zoom-Choreografie des
Timeline-Workers. Deshalb tragen auch die Takes dieses Nachweises ehrlich
`render.timeline` und nicht `prepare.source_motion`.

## Verifikation

- `npm run video-studio:test`: 12/12 bestanden;
- Python-Syntaxprüfung des lokalen Renderers bestanden;
- vollständiger Lauf mit
  `PIX_VIDEO_STUDIO_ASSET_ROOT="/Volumes/drive 1/PIXCAPTURE" npm run video-studio:e2e`
  bestanden;
- beide Jobs: `succeeded`, Statuscode `result_ready`;
- beide MP4s: 720 x 1280, H.264, 30 fps, AAC-Spur;
- beide AAC-Spuren sind absichtlich stumm;
- Dauerabweichung jeweils innerhalb 0,15 Sekunden;
- vollständige FFmpeg-Dekodierung beider Dateien bestanden;
- alle 13 beziehungsweise 10 Szenenmitten wurden visuell kontrolliert;
- Claude/Opus prüfte Code, Report und Szenenbögen zweimal read-only;
  finales Urteil: `GO`, keine verbleibenden Blocker.

## Sicherung und Fundorte

Die bequem anzusehenden, gegen die geprüften Worktree-Dateien per SHA-256
verifizierten Kopien liegen auf Daniels Schreibtisch:

`/Users/danielfortmann/Desktop/PIXCAPTURE Video Studio · Kandidat 7 · 2026-08-07/`

Dateien:

- `Maklerfassung · Backsteinhaus mit Garten.mp4`
  - SHA-256: `b95d7aba3c72e117c14e99ddf6979990d1e66532f29456b8512ba871e5b2968e`
- `Interne Leistungsdemo · Backsteinhaus mit Garten.mp4`
  - SHA-256: `8948cf83028db5fedae4a4dff3aa65c2fc2eec223c7eb2dc8af4401f4ccac153`

Die reproduzierbaren unversionierten E2E-Artefakte liegen zusätzlich unter:

`/Users/danielfortmann/.codex/worktrees/94c4/PIXCAPTURE/output/video-studio-e2e-candidate-7-2026-08-07/`

Wichtige Dateien dort:

- `guided.mp4`
- `showcase.mp4`
- `local-e2e-report.json`
- `guided.scene-centers.jpg`
- `showcase.scene-centers.jpg`

## Git-Stand

Relevanter Umbrella-Branch:

- Branch: `codex/shared-video-studio-api-v1`
- verifizierter Video-Code-Commit: `d66ff68 feat: rebuild video proof with candidate 7`
- vorherige Vertrags-/Registry-/E2E-Commits:
  - `0eceb87 feat: add shared video studio contract`
  - `3a8e1ce feat: add extensible video capability registry`
  - `8e4d775 feat: add local video studio e2e proof`

Der Task-Worktree arbeitet auf
`codex/video-studio-new-motifs-20260807`; der Video-Code-Commit wurde bereits
per Fast-forward auf `codex/shared-video-studio-api-v1` übernommen. Nichts wurde
gepusht oder deployed.

### Fremder Dirty State im Hauptcheckout

Im Hauptcheckout `/Volumes/drive 1/PIXCAPTURE` erschienen nach Abschluss der
Videoarbeit folgende nicht von diesem Video-Task stammende Änderungen:

- `M 00_READ_FIRST_EVERY_SESSION.md`
- `M AGENTS.md`
- `M docs/HANDOVERS/PIXCAPTURE_START.md`
- `m projects/pixcapture-mobile`
  - Submodule-HEAD: `e884b9e7b4142c179a82d66df7c325bb86a2c51e`
  - Branch dort: `codex/ios-raw-capability-fallback-20260807`

Die drei Root-Dateien zeigen zusammen 42 Löschzeilen. Diese Änderungen wurden
nicht untersucht, nicht zurückgesetzt und nicht mit der Videoarbeit vermischt.
Sie gehören sehr wahrscheinlich zur parallelen Telefon-App-/Startup-Arbeit und
müssen morgen als fremder Bestand behandelt werden.

## Nächster konkreter Schritt

Die beiden heutigen Videos bleiben unveränderte Baseline V1.

Danach genau einen echten vorbereiteten Bewegungsmoment bauen:

1. einen realen, zwischengespeicherten `PreparedAsset` hinter dem bestehenden
   Vertrag erzeugen;
2. als ersten Test den warmen Wohn-/Essbereich von Kandidat 7 verwenden, weil
   seine klare Raumtiefe Verformungen sofort sichtbar macht;
3. nur einen Clip mit source-locked Ziel und ruhiger Kamerabewegung erzeugen;
4. Ergebnis gegen Ausgangsbild auf Architektur-, Möbel- und Objektfidelity
   prüfen;
5. zunächst nur die interne Leistungsdemo als A/B-Vergleich erweitern;
6. erst bei überzeugender Qualität höchstens ein bis zwei vorbereitete Momente
   in die Maklerfassung übernehmen.

Vor einem kostenpflichtigen Provider-/GPU-Lauf zuerst
`docs/LOCAL_SECRET_MANAGER.md`, `docs/SECRET_REGISTRY.md` und den aktuellen
Providerstand im Working Memory prüfen. Die frühere Providerdiskussion nicht
blind neu beginnen. Provider bleiben interne Worker-Details.

## Stopregeln für heute und morgen

- Heute keinen weiteren API-, GPU-, Modal-, Deployment- oder Providerlauf.
- Die beiden Desktop-MP4s nicht überschreiben.
- Candidate 10 nicht wieder als Demo oder Referenz einsetzen.
- Keine Textflächen hinter Typografie zurückbringen.
- Nicht gleichzeitig Audio, 1080p, UI und echten `prepare.*`-Worker beginnen.
- Fremde Mobile-/Startup-Änderungen im Hauptcheckout nicht committen,
  zurücksetzen oder in Video-Commits mischen.

## Fortsetzung 08.08.2026 · erster PreparedAsset-Nachweis abgeschlossen

Der oben genannte nächste Schritt wurde im gemeinsamen Umbrella-Vertrag lokal
ausgeführt. Genau das warme Wohnzimmermotiv, Candidate-7-Cutplanposition 9,
läuft nun in der internen Leistungsdemo als direkt aufeinander folgendes A/B:

- A: direkte `render.timeline`-Bewegung;
- B: realer, SHA-256-gecachter `prepare.source_motion`-PreparedAsset.

Beide Seiten verwenden identische 3,2 Sekunden und identisches
Start-/End-Framing. Die geführte Maklerfassung enthält weiterhin keinen
PreparedAsset. Der zweite identische Vorbereitungsauftrag traf denselben Cache.
Start/Mitte/Ende bestanden die automatischen Source-Lock-Grenzen; die visuelle
Prüfung fand keine Änderung an Architektur, Möbeln, festen Objekten, Fenstern
oder Ausblicken. Der neue Showcase und die separate Guided-Kopie bestanden die
vollständige Medienprüfung. Es lief ausschließlich lokaler CPU-Code: kein
Provider, Netzwerk, GPU, Modal, R2 oder Deployment.

Vollständiger Nachweis:
`docs/video-studio/CANDIDATE_7_PREPARED_SOURCE_MOTION_PROOF_2026-08-08.md`.

Nächster Stop-/Entscheidungspunkt: Daniel prüft den A/B-Produktwert. Der
Vergleich ist absichtlich visuell äquivalent und beweist Lifecycle, Cache und
Fidelity, nicht generierte räumliche Bewegung. Vor Daniels Urteil keinen
PreparedAsset in die Maklerfassung übernehmen und keinen Providerlauf starten.

## Änderungsnotiz

### 2026-08-07 21:16 - Candidate-7-Vertical-Slice gesichert

- Geändert: Shared-Video-Studio-E2E, Timeline-Renderer, Candidate-7-Projekte,
  adaptive Direkt-Typografie und Nachweisdokumentation.
- Warum: Candidate 10 ist als Referenz gesperrt; benötigt wurden zwei neue,
  visuell glaubwürdige Hochformatnachweise ohne Textflächen.
- Wirkung: reproduzierbare Maklerfassung und interne Leistungsdemo auf dem
  gemeinsamen Vertrag, beide ausschließlich mit Kandidat 7.
- Verifikation: 12/12 Tests, realer lokaler E2E, vollständige Dekodierung,
  Szenenmitten-QA, zwei read-only Opus-Prüfungen mit finalem `GO`.
- Status: Code committed; Desktop-MP4s SHA-256-verifiziert; nicht gepusht,
  nicht deployed; Renderartefakte bewusst lokal.
- Vorsicht: ehrlicher Umfang bleibt `render.timeline`; kein `prepare.*` oder
  `presenter.*` lief real.

### 2026-08-08 08:46 - PixImmo Bewegung/Text und Editor-Rueckgabe auf Beta

- Geaendert: `projects/piximmo-web` auf Branch
  `codex/piximmo-video-studio-ui-20260808`; gemeinsamer Makler-Editor
  `Bewegung & Text` mit vier Typografie-Startstilen sowie eigener Intake-Modus
  fuer fertige externe Editor-Bilder an vorhandenen PixImmo-Auftraegen.
- Warum: Makler sollen Bewegung und direkte Bildtypografie selbst bestimmen;
  zugleich fehlte ein benutzbarer Rueckweg fuer bereits extern fertig
  bearbeitete Bilder.
- Wirkung: Ein Auftrag bietet `Fertige Bilder hochladen`. Dieser Modus nimmt
  nur fertige Bildformate an, haengt sie verlustfrei als neue
  `Editor-Original`-ProcessedImages an, umgeht Dropbox/erneute Bearbeitung,
  setzt den Auftrag waehrend des Uploads nicht in den Intake-Status zurueck und
  fuehrt nach erfolgreichem Upload automatisch in die QC. Normale Intake-
  Sessions duerfen den Finalimport serverseitig nicht mehr ausloesen.
- Verifikation: Produktions-Build, ESLint, 124/124 Unit-Tests; Live-Browser-QA
  auf `beta.pix.immo` fuer Candidate 7 und die Editor-Rueckgabe am bestehenden
  Auftrag `SCQ-NTX9R`; kein reales Bild wurde in den Auftrag geladen.
- Status: PixImmo-Code committed als `81ba0f9` und `c794320`; Vercel-Deployment
  `dpl_7fk5f4e4L1FdpduC5feHz9yHFBd4` ist `Ready`; `beta.pix.immo` zeigt auf
  diesen Stand und liefert HTTP 200. Nicht gepusht.
- Vorsicht: `pix.immo`, Wix und DNS wurden nicht veraendert. Qwen bleibt der
  naechste bewusste Ausbau nach dem Test mit einem neuen Auftrag und frischen
  Bildern; es lief kein kostenpflichtiger Qwen-/Provider-Aufruf.

### 2026-08-08 09:22 - Reproduzierbares Video-Projekt-Setup auf PixImmo Beta

- Geaendert: Neuer jobbasierter Einstieg unter
  `/dashboard/video-studio/setup`. Nutzer waehlen einen vorhandenen Auftrag,
  ausschliesslich auslieferungsbereite Bilder, Ziellaenge, Tempo,
  Aussen-/Innengewichtung, Bildrollen, Textdichte, vier konkrete Textpunkte
  und einen Typografie-Startstil. Daraus entsteht deterministisch ein
  persistiertes Video-Projekt, das Timeline sowie `Bewegung & Text` mit
  denselben Auftragsbildern und Eingaben oeffnet.
- Warum: Der SEEBURG-Test darf kein einmaliges Chat-/Lokalskript-Ergebnis sein;
  der Weg muss fuer Makler und weitere Auftraege in der Produkt-UI wiederholbar
  sein.
- Wirkung: Editor-Rueckgabe, QC/Auslieferungsbereitschaft, Video-Briefing,
  Timeline und Motion/Text bilden nun einen zusammenhaengenden Produktweg.
  Bildrollen bleiben vor der Projektanlage manuell korrigierbar; Texte werden
  nicht aus unbestätigten Objektdaten erfunden.
- Verifikation: ESLint, Produktions-Build und 127/127 Unit-Tests bestanden.
  Commit `3823c32 feat: add job-based video project setup` ist sauber im
  PixImmo-Repo. Vercel-Deployment
  `dpl_suhiUd1szLjq7GGZaP5jSGLLxCab` ist `READY`; `beta.pix.immo` zeigt auf
  diesen Stand. Die neue Route antwortet und leitet ohne Sitzung korrekt zum
  Login weiter.
- Status: Kein SEEBURG-Bild wurde importiert, kein Video-Projekt angelegt und
  kein Video gerendert. Die inhaltliche E2E-Pruefung bleibt bewusst der
  angemeldeten PixImmo-UI vorbehalten. Kein Qwen-/Provider-Aufruf.

### 2026-08-08 09:39 - Produktgrenze PixImmo/PixCapture und Auth-Stopregel

- Verbindliche Architekturvorgabe: Nach dem Intake muessen PixImmo und
  PixCapture dieselbe Bildverarbeitung, dieselben Bildrollen, denselben
  `VideoProject`-/Timeline-Vertrag, dieselben Text-/Typografie-/Motion-Regeln
  und dieselben Render-/Provider-Faehigkeiten verwenden. Unterschiedlich sind
  nur die Herkunft der Bilder und die Bildung der Takes: PixImmo arbeitet aus
  Auftraegen/Editor-Rueckgaben, PixCapture aus Capture-Sessions/Takes.
- Konsequenz: Den neuen PixImmo-Setup-Flow nicht als dauerhaft getrennte
  Produktlogik weiterbauen. Der naechste Implementierungsschritt ist die
  Extraktion des Briefing-/Planungs-/Persistenzkerns in eine gemeinsam
  nutzbare Schicht und ein duennes PixCapture-Intake-Mapping darauf.
- Auth-Blocker: Der Agent-Zugang auf `beta.pix.immo` endet aktuell unter
  `/api/auth/error`. Im Admin-Bereich existieren laut Daniel bereits mehrere
  verwaiste oder doppelte Agent-Zugaenge. Bis zur gezielten Bestandsaufnahme
  keinen weiteren Zugang anlegen. Ein bestehender Eintrag muss eindeutig
  zugeordnet, repariert und anschliessend als einziger dokumentierter
  Testzugang verwendet werden; Loeschen oder Zusammenfuehren erst nach
  Daniels ausdruecklicher Freigabe.
- Sicherungsstand: PixImmo-Commits `81ba0f9`, `c794320` und `3823c32`; gemeinsamer
  Workspace bis `ce1d072`; Beta-Deployment
  `dpl_suhiUd1szLjq7GGZaP5jSGLLxCab`. Kein Bildimport, Render oder
  Qwen-/Provider-Aufruf nach diesem Stand.
- Ausfallsicherung: Beide Arbeitsbranches sind auf GitHub gepusht. Draft-PRs
  sind `Dafort001/piximmo#15` fuer den PixImmo-Produktweg und
  `Dafort001/pixcapture-workspace#7` fuer den gemeinsamen Vertrag, Nachweis und
  die Produktgrenzen. Die PRs sind bewusst nicht gemergt.
