# Video Studio – Übergabe nach Typografie-/Branding-/Kontovorlagen-Block

Stand: 2026-08-10, Europe/Berlin
Status: lokale Implementierung samt echtem kostenfreiem Seeburg-Render,
26-Font-Typografie, Kundenlogos, persönlichen Rhythmus-/Schnittvorlagen und
visuellen Editor-Sicherungen
committed; nicht gepusht, nicht deployed. Die beiden App-Migrationen sind nur
auf automatisch auslaufenden Neon-Testbranches ausgeführt; kein Eingriff in
Beta/Production und kein Provider-/R2-Lauf.

Operative Fortsetzung für 2026-08-11:
`docs/HANDOVERS/VIDEO_STUDIO_MORGEN_2026-08-11.md`. Diese neue Datei nach den
unten genannten Startquellen vollständig lesen; sie enthält den verbindlichen
ersten Account-E2E-Block und die beiden bereits migrierten Testbranches.

## 1. Zwingender Einstieg

Der nächste Agent liest in genau dieser Reihenfolge und beginnt nicht mit einer
breiten Workspace-Suche:

1. `/Volumes/drive 1/PIXCAPTURE/00_READ_FIRST_EVERY_SESSION.md`
2. `/Volumes/drive 1/PIXCAPTURE/CODEX_WORKING_MEMORY_DO_NOT_TOUCH/PIXIMMO_SESSION_CACHE.md`
3. `/Users/danielfortmann/Desktop/VIDEO_STUDIO_UMSETZUNGSAUFTRAG.md`
4. `/Volumes/drive 1/PIXCAPTURE/docs/HANDOVERS/VIDEO_STUDIO_GESAMTAUFTRAG_2026-08-10.md`
5. diese Übergabe
6. `/Volumes/drive 1/PIXCAPTURE/docs/HANDOVERS/VIDEO_STUDIO_MORGEN_2026-08-11.md`

Der lokale Phase-2-/3-/4-Teil ist **nicht** der Abschluss des Gesamtauftrags.
Nicht bereits erledigte Blöcke erneut erfinden oder durch historische
Video-Studio-Dateien ersetzen.

## 2. Verbindliche Git-Stände

| Git-Wurzel | Branch | Feature-Stand | Upstream |
|---|---|---:|---:|
| Workspace/Shared API | `codex/shared-video-studio-api-v1` | `60383bd` | lokal voraus |
| PixImmo | `codex/piximmo-video-studio-ui-20260808` | `8e3dc92` | lokal voraus |
| PixCapture | `codex/pixcapture-video-studio-ui-20260810` | `062bea0` | lokal voraus |
| Voleur Backend | `codex/security-auth-hardening-20260808` | `0a19842` | lokal voraus |

Die Commits sind lokal und bewusst nicht gepusht. Kein Push, PR, Vercel-,
Beta-, Production- oder Modal-Deployment ohne Daniels ausdrückliche Freigabe.
Der Workspace-Root erhält nach `60383bd` noch genau den separaten Commit dieser
Übergabe; die drei verschachtelten Feature-Stände bleiben unverändert.

Hygiene am Übergabezeitpunkt:

- `git status --short --ignore-submodules=all` im Workspace-Root: sauber.
- `git status --short` in PixImmo: sauber.
- `git status --short` in PixCapture und Voleur Backend: sauber.
- Der rohe Root-Status zeigt nur die erwarteten Gitlink-Abweichungen für die
  drei verschachtelten Projekt-Repositories.
- Gitlinks nicht zur kosmetischen Root-Bereinigung committen oder resetten.

## 3. Heute tatsächlich abgeschlossen

### Shared API

- `d08ca74`: versionierte Asset-Analyse, persistente Stores,
  `pix-social-video`-Adapter, Qualitätsformel `r`, Zoomdeckel, Cut-Risk,
  Still-Regel und Review-Invalidierung.
- `6a65eb7`: sechs Textstile mit harten Inhaltsgrenzen, konkret gespeicherten
  Stilwerten, Safe Area und Kurzclip-Regel.
- `707fd1a`: revisionsgebundene öffentliche/interne `scene-spec`, ohne
  öffentliche R2-Schlüssel, plus Renderprofilvertrag.
- `b0ddb38`: persistente Preview-/Final-Zustände, automatische
  Versionsbindung, explizite Preview-Freigabe und Final aus dem freigegebenen
  Snapshot; Inhaltsänderungen löschen die Freigabe.
- `9d04740`: Start eines Renderjobs erst nach erfolgreicher CAS-Reservierung,
  Schutz vor Parallel-Rendern und veralteten Job-Rückmeldungen, signierte
  Ergebnis-URL ohne öffentlichen Storage Key sowie Font-Manifestbindung.

### PixImmo

- `b80d26f`: Analyse-/Qualitätsanzeige, getrennte Start-/End-Crops,
  Bewegungssperren, Analysevorschlag nur nach Übernahme und explizite
  Szenenbestätigung.
- `ebf9158`: Editor für Klar, Redaktion, Bogen, Journal, Ruhe und Schlag;
  harte Feldgrenzen, 14/20-Prozent-Safe-Area und Stil-6-Regel unter 1,5 s.
- `6759c8a`: autorisierter `scene-spec`-Proxy; die gespeicherte Vorschau liest
  den bestätigten Server-Crop statt eine zweite persistente Geometrie zu
  erfinden.
- `839e9ad`: Job-Polling, „Preview freigeben“ und „Endfassung erstellen“ mit
  serverseitig erzwungener Versionsbindung.
- `490e600`: Preview-Start nur aus gespeichertem Stand, Job-Ergebnis nach
  Reload wiederherstellbar und als Video abspielbar; sechs route-lokal
  eingebundene, manifestgebundene Browserfonts.

### Voleur Backend

- `0c2f17a`: deterministischer Scene-Spec-Renderer mit Subpixel-Crop,
  2x-Arbeitsgeometrie, Lanczos, Linearlicht, exakten Crossfades, BT.709 und
  allen sechs Textstilen. TTF/WOFF2, SHA-256-Manifest und OFL-Lizenzen sind
  gepinnt. FFmpeg dient ausschließlich zum Encode. Bildszenen sind lokal
  bewiesen; Videoszenen werden im neuen Profil bewusst abgelehnt, bis ein
  nativer deterministischer Videopfad spezifiziert ist.

### Erweiterter User-/Admin-Vertrag

- Der technische Katalog umfasst 26 gepinnte Schriften. TTF/WOFF2, Lizenzen
  und SHA-256-Manifest sind in PixImmo, PixCapture und Worker deckungsgleich.
- Admins steuern ausschließlich, welche Schriften im jeweiligen App-Menü
  sichtbar sind und in welcher Reihenfolge. Mindestens eine bleibt aktiv.
- User bearbeiten pro Szene Fonts, getrennte Farben, Größen, Gewichte,
  Laufweiten, horizontale Weiten, Zeilenhöhen, Ausrichtung, Deckkraft,
  Textbreite und X/Y bis über die volle Bildhöhe. Die sechs Stile sind nur
  Ausgangspunkte und keine Inhalts- oder Gestaltungssperren.
- User laden eigene PNG/JPG-Logos hoch. Eingaben sind auf 5 MB und 64–4096 px
  begrenzt, werden als PNG mit maximal 2048 px normalisiert, usergebunden in R2
  referenziert und können in Position, Breite, Deckkraft sowie Platzierung auf
  alle/Intro/Outro eingestellt werden. Private Storage Keys bleiben aus
  Browser- und öffentlichem Scene-Spec-Vertrag entfernt.
- User speichern persönliche Rhythmus- oder Schnittfolgen im Kundenkonto und
  wenden sie später revisionssicher erneut an. PixImmo und PixCapture nutzen
  denselben Shared-Vertrag einschließlich echter Crossfades.
- „Text hinter Objekt“ ist nicht vorgetäuscht: Scene-Spec meldet ausdrücklich
  `foreground` und `occlusionMaskSupported:false`, bis ein echter
  Masken-/Layerpfad festgelegt und geprüft ist.
- Beide App-Schemas enthalten `VideoStudioBrandAsset` und
  `VideoStudioPreset`; die manuellen SQL-Migrationen sind committed und nur
  auf den unten dokumentierten isolierten Neon-Testbranches ausgeführt.
- Vor einer späteren Migration oder Installation wurde der vollständige
  Vorher-Stand separat bewahrt. Alle vier Git-Wurzeln besitzen den annotierten
  lokalen Tag `backup/video-studio-pre-typography-branding-20260810` auf
  Shared `3c51d33`, PixImmo `cd78700`, PixCapture `99f8356` und Voleur
  `ebc283b`. Verifizierte eigenständige Git-Bundles, Integritätshashes und
  Screenshots der sichtbaren Beta-Projektauswahl sowie Schritt-1-Werkstatt
  liegen unter
  `/Volumes/drive 1/PIXCAPTURE/output/video-studio-legacy-backup-2026-08-10/`.
  Der Browsernachweis änderte keine Auswahl/Einstellung und startete keinen
  Render.
- Daniels gewünschte UI-Synthese bewahrt den ruhigen alten Storyfluss und die
  neue technische Tiefe zugleich: Bildfolge, Start/Ende und große Motive stehen
  wieder vor der Timeline; PixImmos präzise Timeline bleibt als einklappbares
  Feinwerkzeug erhalten. Im Szenenschritt ist nur eine aktive Szene sichtbar,
  erreichbar über eine horizontale Szenenfolge. Typografie-Feinwerte sind
  progressiv eingeklappt. Text und Logo lassen sich direkt in einer
  9:16-Vorschau positionieren; Zahlenfelder bleiben für Präzision erhalten.
  Marke und persönliche Vorlagen folgen nach dem Hauptfluss. PixImmo-Commit
  `6c555d3`, PixCapture-Commit `0c4d1d1`.

### Visueller Editor-Sicherheitsblock

- Shared `44a3514` und Voleur `0a19842` tragen Text- und Logo-Rotation durch
  Projekt, Scene-Spec und Renderer. Beide Overlays drehen um ihren visuellen
  Mittelpunkt; alte Projekte erhalten rotationsfrei `0°`.
- PixImmo `de2f1f1` und PixCapture `ab4cb11` zeigen im aktiven echten
  9:16-Szenenbild Motiv, Text und gespeichertes Logo gemeinsam. Separate
  Fantasie-Hintergründe für die Logo-Vorschau wurden durch das aktuelle reale
  Szenenmotiv ersetzt.
- Text und Logo besitzen sichtbare Auswahlrahmen und Führungslinien. Der runde
  Griff dreht, der quadratische Griff ändert die Breite; Ziehen positioniert.
  Basisregler für Größe/Breite bleiben offen, exakte Zahlen-, Typografie- und
  Geometriewerte liegen unter klar benannten Feineinstellungen.
- Bildfolge und vollständiger lokaler Szenenzustand besitzen Undo/Redo mit je
  bis zu 50 Schritten. PixImmo speichert einen rückgängig gemachten Stand wie
  jede andere Änderung nach 800 ms; PixCapture speichert ihn mit dem normalen
  Szenen-Speichern.
- Szenenzahl, effektive aktuelle Dauer einschließlich Crossfade-Überlappung,
  Zielzeit und Abweichung sind permanent sichtbar. Eine Timeline unter fünf
  Sekunden kann nicht versehentlich als Preview gestartet werden, sondern
  verlangt eine explizite Kurzclip-Bestätigung. Der Server verbietet bewusst
  gewollte Kurzclips nicht pauschal.
- Es wurden keine Scrims, Boxen oder abdunkelnden Textflächen eingeführt.

### Unveränderliche Versionen und Preview-Navigation

- Shared `60383bd` friert zu jeder Version die vollständige interne Preview-
  und Final-Scene-Spec ein. Der Renderer erhält exakt diese gespeicherte Spec
  statt sie später mit möglicherweise geändertem Buildercode neu zu erzeugen.
  Öffentliche Projekt- und Versionsantworten entfernen weiterhin alle
  Storage-Keys; ältere Versionen ohne eingefrorene Spec antworten bewusst mit
  `409`, statt eine falsche Reproduzierbarkeit vorzutäuschen.
- Die autorisierte Route
  `GET /v1/video-projects/:projectId/versions/:versionId/scene-spec` liefert
  reproduzierbar die öffentliche Preview- oder Final-Spec.
- PixImmo `8e3dc92` und PixCapture `062bea0` lösen Klick und Scrub-Position im
  fertigen Vorschauvideo gegen genau diese Version auf. Effektive
  Crossfade-Überlappungen werden berücksichtigt und die zugehörige aktive
  Szene im Editor geöffnet.
- PixCapture stellt abgeschlossene Previewjobs nach Reload wieder her. Sein
  Proxy reicht den `purpose`-Query jetzt nachweislich weiter; ein eigener
  Regressionstest schützt diesen zuvor gefundenen Fehler.

### Isolierte Neon-Testbranches für den Account-E2E

- Am 2026-08-10 wurden nach Daniels ausdrücklicher Freigabe zwei Child-
  Branches direkt von den jeweiligen `production`-Branches erstellt:
  - PixImmo / Neon-Projekt `Pixplatform`:
    `br-solitary-resonance-agpoyxb8`
  - PixCapture / Neon-Projekt `pixcapture-db`:
    `br-bold-night-ags15adk`
- Beide heißen `video-studio-account-e2e-20260810`, verwenden 0,25 CU,
  pausieren nach fünf Minuten Inaktivität und laufen automatisch am
  2026-08-17 um 22:00 UTC ab.
- Ausschließlich dort wurde die jeweilige additive Migration
  `manual_video_studio_user_brand_and_presets.sql` ausgeführt. Vorher fehlten
  beide Tabellen; danach sind `VideoStudioBrandAsset` und `VideoStudioPreset`
  leer vorhanden, mit zwei geprüften `User`-Fremdschlüsseln und allen vier
  erwarteten Indizes.
- Read-only gegen beide `production`-Branches geprüft: Dort fehlen beide
  Tabellen weiterhin. Es gab keinen Beta-/Production-Eingriff.
- Verbindungs-URLs und Rollenpasswörter sind nirgends dokumentiert. Das nur
  temporär verwendete PixImmo-Child-Branch-Passwort wurde anschließend erneuert;
  die Neon-Operation ist abgeschlossen. Zugang morgen erneut über Neon CLI und
  Branch-ID beziehen, niemals aus einer Übergabedatei.

### Verifikation

- Shared: TypeScript grün; 37/37 reguläre Tests grün; ein PostgreSQL-Test
  mangels `VIDEO_STUDIO_TEST_DATABASE_URL` übersprungen.
- PixImmo: TypeScript grün, gezieltes ESLint grün, 152/152 Unit-Tests grün,
  `npm run build` Exit 0.
- PixCapture: TypeScript, gezieltes ESLint, 7/7 relevante Studio-/Fonttests,
  Public-Image-Check und `npm run build` Exit 0. Für den lokalen Build wurde
  nur ein flüchtiger, nicht ausgegebener ES256-Testschlüssel verwendet.
- Die lokalen bekannten Neon-/Dynamic-Server-Meldungen erscheinen beim Build,
  brechen ihn aber nicht ab.
- Voleur: 11/11 gezielte Unit-/Golden-Frame-Tests grün, einschließlich aller
  26 Fonts, erweiterter Typografieachsen, Crossfades und Logo-Compositing.
- Kostenfreier lokaler Render aus exakt zwei Seeburg-JPGs: 162 Frames,
  2,700 s, 540x960, 60 fps, H.264 yuv420p und BT.709-Metadaten. Ausgabe:
  `/Volumes/drive 1/PIXCAPTURE/output/video-studio-renderer-phase4/seeburg-two-scene-preview.mp4`.
- Kein R2-Testwrite, kein Modal-/Providerlauf und kein Deployment.

## 4. Wichtigste Wahrheit: deterministische Bildspur lokal bewiesen

Der zuvor nur nominelle Renderprofilvertrag wird jetzt vom Worker ausgeführt:
2160x3840 Arbeitsgeometrie, Subpixel-Affine-Crops, Lanczos-Downscale,
Linearlicht-Crossfades, sRGB-Dekodierung, BT.709-Ausgabe und sechs gepinnte
Textstile. Die Timeline wird gestreamt und nicht vollständig im RAM gesammelt.
Text der ausgehenden und eingehenden Szene wird während Crossfades zeitlich
gegated, damit keine kollidierenden Headlines entstehen.

Verbindliche Designkorrektur von Daniel: keine abdunkelnden Scrims oder
Textkasten-Flächen hinter Videotext. Der Shared Scene-Spec erzwingt dafür
`backdrop: none`; der Worker ignoriert auch entsprechende Legacy-Werte. Nur
dezente reine Textschatten bei Klar/Schlag bleiben bestehen. Diese Flächen
nicht zur vermeintlichen Lesbarkeitsverbesserung wieder einführen.

Der reale lokale Seeburg-Smoke beweist die deterministische **Bildspur** und
den Encode-Vertrag. Er ist kein Provider-, Layer- oder Portalnachweis. Der
neue Profilpfad lehnt Videoszenen derzeit explizit ab; er fällt nicht lautlos
auf Interpolation oder den Legacy-Pfad zurück. Diese offene Grenze nicht mit
einer fertigen generativen Videospur verwechseln.

## 5. Konkreter nächster Arbeitsblock

Der nächste Agent bleibt zunächst vollständig lokal und entscheidet keine
Providerarchitektur vor:

1. Vor jeder Änderung Branch und Status der vier Git-Wurzeln erneut prüfen.
2. Preview-Klick/Scrub und unveränderliche, autorisiert adressierbare
   Scene-Spec-Version sind mit `60383bd`, `8e3dc92` und `062bea0` erledigt;
   nicht erneut implementieren.
3. Die beiden manuellen App-Migrationen sind ausschließlich auf den isolierten,
   automatisch auslaufenden Neon-Testbranches angewandt; nicht erneut ausführen.
4. Dort den accountgebundenen Logo-/Vorlagen-E2E ergänzen. Vor einem echten
   Logo-Upload mit R2-Schreibzugriff Testdatei, Ziel, erwartete Objektanzahl und
   Cleanup konkret festlegen; die DB-Prüfung allein impliziert keinen R2-Test.
5. Anschließend redaktionell mit realistischen längeren Bildfolgen prüfen:
   Szenenwechsel, Text-/Logo-Positionen, gespeicherter Rhythmus und Wiederaufnahme
   nach Reload. Das ist ein Portal-/Vertragsnachweis, kein Providerlauf.
6. Shared, PixImmo, PixCapture und Voleur vollständig testen/builden und getrennt
   committen. Nicht nach einem Teiltest den Gesamtauftrag als fertig melden.

## 6. Qwen/fal und Motive – nicht erneut missverstehen

- Das 20er-Seeburg-Goldset liegt in
  `config/video-studio/goldsets/seeburg-mixed-v1.json`: 12 Innen-, 8
  Außenmotive aus den 31 finalen JPGs von `SCQ-NTX9R`.
- Die Seeaufnahme
  `/Volumes/drive 1/Kundendata/20260803/SEEBURG ALSTERKR/ALSTERKRUG/20260803032-Außen-fl3og-1-1.jpg`
  ersetzt Motiv 16 und ist Daniels gewünschtes redaktionelles Startmotiv.
- Timeline-/Startposition darf niemals automatisch das technische
  Provider-Testmotiv bestimmen.
- Der Badezimmerlauf
  `20260803-Badezimmer-_V4A4582.jpg` beweist nur, dass Secret, Queue und
  Vier-Layer-Rückgabe funktionieren. Das Motiv ist ausdrücklich kein
  Qualitätsnachweis für Ebenen/Parallax.
- Genau ein fal-Lauf kostete USD 0,05. Der frühere Modal-Lauf kostete geschätzt
  USD 0,3974. Beide temporären Apps sind gestoppt.
- Keine weiteren Qwen-, fal-, GPU- oder anderen kostenpflichtigen Läufe, bis
  geeignete Motive konkret gezeigt, von Daniel bestätigt und Umfang plus
  Kostenrahmen sichtbar genannt wurden.
- Die spätere Provider-/Workerarchitektur ist offen. Nicht aus dem vorhandenen
  fal-Key oder dem Labor-Bridge-Commit eine Produktentscheidung ableiten.

Details: `docs/video-studio/ANALYSIS_GOLDSET_PHASE_2_5.md`.

## 7. Stopregeln

- Kein Vercel-/Beta-/Production-/Modal-Deployment ohne Daniels neue
  ausdrückliche Freigabe.
- Keine kostenpflichtigen Providerläufe ohne konkretes Motiv, Anzahl,
  Parameter und Maximalbetrag vor dem Start.
- Keine Secrets aus macOS-Schlüsselbund, Modal oder Umgebungsvariablen
  ausgeben, kopieren oder dokumentieren.
- Keine fremden Änderungen löschen, resetten oder ungeprüft committen.
- Insbesondere Voleur nicht auf einen anderen Branch resetten, nur um den
  Root-Gitlink zu beruhigen.
- Keine neue Providerentscheidung treffen, solange die deterministische Spur A
  und geeignete Qualitätsmotive nicht abgenommen sind.

## 8. Abnahmepunkt des nächsten Blocks

Der nächste Account-E2E-Block ist erst fertig, wenn:

- Logo und persönliche Rhythmus-/Schnittvorlage tatsächlich an das richtige
  Kundenkonto gebunden gespeichert, geladen und gegen Fremdzugriff geschützt
  sind,
- Reload und erneute Anwendung denselben gespeicherten Stand reproduzieren,
- alle bisherigen Shared-, PixImmo-, PixCapture- und Voleur-Tests und Builds
  grün bleiben,
- alle vier Git-Wurzeln sauber oder mit exakt erklärter Gitlink-Abweichung
  übergeben werden,
- weiterhin kein Deployment und kein ungeklärter kostenpflichtiger Lauf
  erfolgt ist.

Der Gesamtauftrag ist damit weiterhin nicht abgeschlossen. Danach bleiben die
redaktionelle Abnahme, gegebenenfalls der ausdrücklich freigegebene
Provider-/Layervergleich und erst anschließend eine separate
Deploymententscheidung.
