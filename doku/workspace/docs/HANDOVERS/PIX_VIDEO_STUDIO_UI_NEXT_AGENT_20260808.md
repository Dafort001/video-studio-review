# PixImmo/PixCapture Video Studio UI · Anweisung fuer den naechsten Agenten

Stand: 2026-08-08, 17:45 CEST

## Änderungsnotiz 2026-08-10 13:35 - Produktionsspeicher und Deploymentpaket

- Geändert: Der gemeinsame Server besitzt jetzt einen dauerhaften
  PostgreSQL-Store für Projekte, Jobs und Handoff-Nonces. Revisionen werden
  über mehrere Instanzen atomar verglichen; Replay-Schutz ist nicht mehr an
  einen einzelnen Prozess gebunden. In Produktion startet der Node-Dienst
  ohne Datenbank-URL bewusst nicht.
- Deploymentpaket: eigenständiges Docker-Image sowie eine Vercel-Funktion mit
  neutralen `/health`- und `/v1/*`-Routen. Das isolierte Vercel-Projekt
  `pix-shared-video-studio` wurde in Frankfurt angelegt; kein Portalprojekt und
  keine bestehende Kundendatenbank werden dafür wiederverwendet.
- Verifikation: 26/26 normale Tests plus ein bedingt aktivierter PostgreSQL-
  Test; mit echtem PostgreSQL bestanden 27/27. Produktionsmodus, persistentes
  signiertes Handoff und Container-Smoke bestanden. Striktes TypeScript,
  `npm audit` (0 Findings) und `vercel build` bestanden.
- Deployment: Daniels Terms-Zustimmung ist erfolgt. Die dedizierte Neon-
  Datenbank läuft als `free_v3` in Frankfurt ohne Neon Auth; getrennte
  Studio-/PixImmo-/PixCapture-Secrets sind gesetzt. Shared-Deployment
  `dpl_Hewy7hJSo4yikdEaVQF3QZANjPQ6` bestand Health, signiertes Handoff `200`,
  Replay-Ablehnung `401` und projektgebundenes Lesen `200`. Der verifizierte
  Build wurde danach auf `https://pix-shared-video-studio.vercel.app`
  promoted; Health dort `200`.
- PixImmo-E2E: direkte Preview
  `dpl_8G7tXF4G36rnAkp7dNAWpRF96Rv6` bestand Startseite/Login/Auth, 18
  Filmstrip- und 35 Portfolio-Bildquellen, echtes R2-WebP `206` sowie den
  angemeldeten Auftrag `SCQ-NTX9R`. 31 Bilder wurden in das gemeinsame Projekt
  `vsp_bbfe7742f6e4d4e8a7fabedc28120b3c` übergeben; die Werkstatt lud 47
  Bildinstanzen und zeigte Auswahl/Reihenfolge, Motion, Crop, Text und
  Vorschau-Steuerung. Kein Render-/Providerlauf. Beta blieb unverändert.

## Änderungsnotiz 2026-08-10 14:20 - Gemeinsamer Server und PixImmo-Adapter

- Geändert: Der neutrale Shared-Video-Studio-Server besitzt jetzt signierte,
  produktgetrennte Handoffs, einen atomaren Erst-Briefing-Bootstrap und den
  internen Renderworker-Adapter. Root-Commits: `c4df13d`, `5c11dec`,
  `922edf1` auf `codex/shared-video-studio-api-v1`.
- PixImmo: Commit `a2d6a21` auf
  `codex/piximmo-video-studio-ui-20260808` verbindet den vorhandenen
  Job-/Briefing-Einstieg mit dem gemeinsamen Server. Die neue Werkbank steuert
  Bildauswahl/Reihenfolge, Startbild, Dauer, Bewegung, Bildausschnitt und
  direkten Bildtext inklusive Typografie. Vollständige Detailnotiz:
  `projects/piximmo-web/docs/HANDOVERS/PIXIMMO_SHARED_VIDEO_STUDIO_ADAPTER_20260810.md`.
- Isolation: Der Studio-Mandant ist der Auftragseigentümer, der Akteur der
  angemeldete PixImmo-Nutzer. Das Studio-Token bleibt `HttpOnly`; jeder
  Portalproxy prüft erneut Produkt, Akteur, Quellauftrag und Zugriffsrecht.
- Verifikation: Shared Server 25/25 Tests. PixImmo TypeScript, gezieltes
  ESLint, Produktionsbuild und 150/150 Tests bestanden. Lokaler Server-Health
  war grün und unauthentifiziertes PixImmo-Handoff lieferte korrekt `401`.
- Status: PixImmo-Portaladapter, Produktionsspeicher und direkte Preview sind
  vollständig verifiziert. Kein Bildupload und kein Render-/Providerlauf; nur
  das gemeinsame Projekt für `SCQ-NTX9R` wurde persistent angelegt. Beta wurde
  nicht umgehängt. Offen sind der PixCapture-Portaladapter und eine bewusste
  Entscheidung, ob die geprüfte PixImmo-Preview auf Beta soll.

## Auftrag von Daniel

Das Video darf nicht als einmaliges lokales oder im Chat gebautes Ergebnis
entstehen. Der komplette Weg muss reproduzierbar ueber die Produkt-UI laufen
und spaeter von anderen Nutzern bedienbar sein.

PixImmo und PixCapture muessen nach der Quellenbildung dieselbe Verarbeitung
verwenden:

- PixImmo-Quelle: Auftrag und extern fertig bearbeitete Editorbilder;
- PixCapture-Quelle: Capture-Session und daraus gebildete Takes;
- danach gemeinsam: Bildrollen, Bildverarbeitung, Briefing, `VideoProject`,
  Timeline, Texte, Typografie, Motion, Render- und Provider-Faehigkeiten.

Keine getrennte PixImmo-Video-Domain weiterbauen. Unterschiedlich bleiben nur
Quelle und Take-Bildung.

## Gesicherter Produktstand

PixImmo-Repo:

- Pfad: `/Volumes/drive 1/PIXCAPTURE/projects/piximmo-web`
- Branch: `codex/piximmo-video-studio-ui-20260808`
- HEAD: `3823c32 feat: add job-based video project setup`
- vorherige Commits: `81ba0f9`, `c794320`
- GitHub: `Dafort001/piximmo#15` als Draft-PR
- Beta-Deployment: `dpl_suhiUd1szLjq7GGZaP5jSGLLxCab`, `READY`
- Alias: `https://beta.pix.immo`

Gemeinsamer Workspace:

- Branch: `codex/shared-video-studio-api-v1`
- gesicherter HEAD bei Erstellung dieser Notiz: `b9b2b12`
- GitHub: `Dafort001/pixcapture-workspace#7` als Draft-PR
- der Workspace-Gitlink pinnt PixImmo auf `3823c32`

Verifikation des PixImmo-Stands:

- ESLint bestanden;
- Produktions-Build bestanden;
- 127/127 Unit-Tests bestanden;
- `/dashboard/video-studio/setup` ist auf Beta erreichbar und leitet ohne
  Sitzung korrekt zum Login weiter.

## Aenderungsnotiz 2026-08-08 18:14 - Beta-Auth repariert

- Geaendert: Die vorhandenen Vercel-Variablen `AUTH_SECRET`,
  `NEXTAUTH_SECRET` und `DATABASE_URL` wurden ohne Auslesen ihrer Werte vom
  alten Preview-Branch `codex/piximmo-portal-merge` auf
  `codex/piximmo-video-studio-ui-20260808` umgehaengt. Die zugehoerigen
  URL-/Trust-Variablen wurden branchgebunden uebernommen.
- Warum: Das bisherige Beta-Deployment lieferte am Auth-Handler reproduzierbar
  `MissingSecret`; der aktuelle Preview-Branch erhielt die vorhandene
  Auth-/DB-Konfiguration nicht.
- Wirkung: `beta.pix.immo` zeigt jetzt auf Deployment
  `dpl_9WTtcLA6tUjvdfEbqvNBCmUKKiDQ` (`READY`). Startseite, Loginseite,
  Auth-Provider und Datenbankzugriff funktionieren wieder.
- Verifikation: `/`, `/auth/signin` und `/api/auth/providers` liefern `200`;
  die Provider sind `credentials` und `email-code`; ein einzelner Loginversuch
  mit einer eindeutig nicht existierenden Testadresse erreichte die Datenbank
  und endete erwartungsgemaess mit `E-Mail oder Passwort ist falsch.` statt
  `/api/auth/error`.
- Status: Vercel-Konfiguration aktiv, Preview redeployed und Alias
  `beta.pix.immo` umgestellt. Keine Code- oder Benutzerdaten geaendert.
- Vorsicht: Der echte vorhandene Agent-Zugang ist noch nicht identifiziert oder
  repariert. Keinen neuen Zugang anlegen und keine Dublette ohne Daniels
  Freigabe loeschen oder zusammenfuehren.

## Aenderungsnotiz 2026-08-08 18:27 - Beta-Bilder wiederhergestellt

- Geaendert: Die bestehenden Vercel-R2-Eintraege `R2_ACCESS_KEY_ID`,
  `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT_URL`, `R2_BUCKET_NAME` und
  `R2_ACCOUNT_ID` wurden ebenfalls ohne Auslesen ihrer Werte vom alten
  Preview-Branch auf `codex/piximmo-video-studio-ui-20260808` umgehaengt.
- Warum: Das erste Auth-Reparatur-Deployment hatte zwar DB und Login, aber
  keine R2-Konfiguration. Bildrouten erzeugten deshalb Signaturen mit leerer
  Access-Key-ID; Cloudflare antwortete `400 InvalidArgument`. Die Bilder waren
  nicht geloescht.
- Wirkung: `beta.pix.immo` zeigt jetzt auf Deployment
  `dpl_GddfQkCsNbLFNFnWeNsq6rf6EvmP` (`READY`); Marketing- und
  Portfolio-Bilder werden wieder aus R2 ausgeliefert.
- Verifikation: Direkter Assetabruf liefert `200 image/webp` mit gueltigem
  WebP-Header. Im echten Browser laden auf der oeffentlichen Beta-Domain
  `18/18` Filmstrip-Bilder und nach Durchscrollen `35/35` Portfolio-Bilder;
  jeweils `0` fehlgeschlagene Bilder und keine Browserfehler.
- Status: Vercel-Konfiguration aktiv, Preview redeployed und Beta-Alias
  umgestellt. Keine Bild-, DB-, Benutzer- oder Code-Daten veraendert.

## Änderungsnotiz 2026-08-08 19:00 - Video-Studio sicher auf Beta installiert

- Ursache des letzten Zugangsblockers: Der aktuelle Preview-Branch hatte Auth,
  Datenbank und R2, aber keinen branchgebundenen
  `PIXIMMO_BETA_ADMIN_SECRET`. Dadurch fiel der temporäre Adminweg auf einen
  anderen Schlüssel zurück und lehnte korrekt signierte Links ab.
- Geändert: Der bereits in der lokalen Registry vorhandene dedizierte Schlüssel
  wurde ohne Ausgabe seines Werts ausschließlich dem Preview-Branch
  `codex/piximmo-video-studio-ui-20260808` zugeordnet. Danach wurde der
  unveränderte Commit `3823c32` als Deployment
  `dpl_E4PZmCXycQDTvv1eD9DNh7rv5vfo` neu gebaut.
- Sicherheitsreihenfolge: Zuerst wurde nur die direkte Deployment-URL geprüft.
  Dort funktionierten Admin-Auth, Live-Datenbank, echtes R2, Filmstrip `18/18`,
  Portfolio `35/35` und `/dashboard/video-studio/setup?jobId=SCQ-NTX9R`.
  Erst danach wurde `beta.pix.immo` auf das neue Deployment umgehängt.
- Nach Alias-Umschaltung erneut geprüft: `/`, `/auth/signin` und
  `/api/auth/providers` jeweils `200`; nicht angemeldetes Video-Setup leitet
  korrekt zum Login; temporärer Admin-Link landet im Kontrollzentrum;
  Datenbank und R2 melden live; Video-Setup rendert ohne Browserfehler;
  Filmstrip `18/18` und Portfolio `35/35`, jeweils null fehlgeschlagene Bilder.
- Read-only Kontoinventur: 22 Benutzer, darunter vier Admin-Konten. Kein Konto
  wurde angelegt, verändert, gelöscht oder zusammengeführt.
- Erwarteter UI-Stand für `SCQ-NTX9R`: Der Auftrag besitzt Intake-Dateien, aber
  noch keine freigegebenen bearbeiteten Delivery-Bilder. Das Setup zeigt daher
  korrekt den Einstieg `Fertige JPGs hinzufügen`. Nächster Schritt ist der
  direkte JPG-Intake über die UI, nicht ein direkter DB-Import.
- Keine Code-, Bild-, Job- oder Benutzerdaten wurden bei der Installation
  verändert. Nur die eine branchgebundene Vercel-Variable und der Beta-Alias
  wurden aktualisiert.

## Änderungsnotiz 2026-08-08 19:20 - Tab für fertige JPGs veröffentlicht

- Wunsch: Wenn die RAW-/Ausgangsdaten bereits im Job liegen, sollen die
  zugehörigen fertigen JPGs ohne Editor-Rückgabe-Wording direkt ergänzt werden.
- Umgesetzt auf PixImmo-Commit `149120b`: Im Job-/Intake-Weg gibt es jetzt die
  zwei klaren Tabs `RAW / Ausgangsdaten` und `Fertige JPGs`. Der JPG-Tab hält
  den vorhandenen Zieljob fest, lässt RAWs unangetastet, lädt fertige Bilder in
  den bewährten resumierbaren R2-Intake und öffnet danach direkt die QC.
- Kompatibilität: Der bestehende interne Editor-Return-Vertrag bleibt erhalten;
  alte `mode=editor-return`-Links funktionieren weiter. Es wurde kein zweiter
  Datenpfad und keine neue ProcessedImage-Sonderlogik angelegt.
- Deployment `dpl_FZoqdoSR49ohqr3CXBhYKEL52jtR` wurde zuerst direkt geprüft und
  danach auf `beta.pix.immo` gelegt. Real verifiziert: Ziel
  `SCQ-NTX9R`, vorhandene `135/135` Intake-Dateien, sichtbare Tabs, Button
  `JPGs hochladen und zum Job hinzufügen`, Filmstrip `18/18`, Portfolio
  `35/35`, keine fehlgeschlagenen Bilder.
- Noch nicht ausgeführt: Die 31 SEEBURG-JPGs wurden nicht hochgeladen. Das ist
  der nächste bewusste Schritt über den neuen Tab.

## Änderungsnotiz 2026-08-08 19:45 - JPG-Raumzuordnung abgesichert

- Beim manuellen Test fiel auf, dass fertige JPGs ohne bereits gesetzte
  Upload-Taxonomie trotz eindeutiger Raumbezeichnung im Dateinamen als
  `Sonstiges` importiert würden.
- Behoben auf PixImmo-Commit `a84b2ab`: Der Final-JPG-Import übernimmt zuerst
  eine konkrete vorhandene RAW-/Aufnahmezuordnung über die Kamerabildnummer
  (zum Beispiel `_V4A4512`). Fehlt sie oder lautet sie nur `Sonstiges`, wird
  die Taxonomie aus Bezeichnungen wie `Wohnzimmer`, `Kuche`, `Flur-Diele`,
  `Garten`, `Aussenaufnahme-gesamt` oder `bathroom` im JPG-Dateinamen erkannt.
- Unbeschriftete Dateien werden nicht geraten. Bei SEEBURG sind 29 von 31
  Dateinamen direkt erkennbar; `_V4A4657.jpg` und `_V4A4658.jpg` benötigen eine
  konkrete RAW-Zuordnung oder spätere manuelle Prüfung.
- Verifikation: ESLint erfolgreich, Unit-Suite `130/130`, Produktionsbuild
  erfolgreich. Deployment `dpl_DrgCQneqqLvGgh5T41AfdcLDkr1s` wurde vor der
  Alias-Umschaltung direkt geprüft (`18/18` Filmstrip, `35/35` Portfolio) und
  liegt jetzt auf `beta.pix.immo`.
- Weiterhin wurden keine der 31 JPGs hochgeladen oder vorhandene Job-/Bilddaten
  verändert.

## Repo-Hygiene und externe Review-Kopie 2026-08-08

- Der vollständige historische App-Abzug `archive/legacy-piximmo-repo`
  wurde aus dem aktiven PixImmo-Tree entfernt und wiederherstellbar unter
  `/Volumes/drive 1/PIXIMMO_ALTSTAND_2026-08-08/` abgelegt.
- PixImmo-Commit: `8ca8ac2` (`chore: remove archived legacy repository`).
- Für eine unabhängige Claude-Review existiert die private schlanke Kopie
  `https://github.com/Dafort001/piximmo-claude-review`, Root-Commit
  `a631fd4`; Review-Auftrag und Auslassungen stehen in `REVIEW_SCOPE.md`.
- Diese Kopie enthält keine alte Git-Historie, Medienpakete, Build-Artefakte,
  Secrets oder Dependencies. Ein versehentlich getracktes Worker-`node_modules`
  wurde vor dem Push entfernt.
- `public/demo` und die Medien unter `public/video-workbench` bleiben im echten
  Repo, weil aktive Seiten beziehungsweise Konfigurationen sie referenzieren.
  Eine spätere Auslagerung braucht erst Ersatz-Hosting oder R2-Migration.
- Beta, Kundendaten, R2-Objekte und die 31 lokalen SEEBURG-JPGs wurden durch
  diese Repo-Bereinigung nicht verändert.

## Was implementiert ist

Der reproduzierbare UI-Weg lautet:

`vorhandener Auftrag -> fertige Editorbilder -> QC/Auslieferungsbereitschaft -> Video-Setup -> Timeline -> Bewegung & Text`

Im Setup waehlt der Nutzer:

- Ziellaenge und Tempo;
- Aussen-/Innengewichtung;
- korrigierbare Bildrollen `Aussen`, `Innen`, `Detail`;
- Textdichte und vier konkrete Textpunkte;
- Typografie-Startstil.

Aus diesen Eingaben wird deterministisch dasselbe persistierte Video-Projekt
fuer Timeline und Motion/Text erzeugt. Wichtige PixImmo-Dateien:

- `src/lib/video-project-briefing.ts`
- `src/app/dashboard/video-studio/setup/page.tsx`
- `src/app/dashboard/video-studio/setup/VideoStudioSetupClient.tsx`
- `src/app/api/video-workbench/jobs/[jobReference]/briefing/route.ts`
- `src/lib/video-studio-server.ts`
- `src/lib/video-workbench-projects.ts`
- `src/lib/video-workbench-static.ts`

Der Intake fertiger externer Editorbilder an vorhandenen Auftraegen ist
ebenfalls implementiert. Nur auslieferungsbereite Bilder duerfen Videoquelle
werden.

## Exakter naechster Schritt

Den SEEBURG-Test ausschliesslich ueber die UI ausfuehren:

- vorhandener Auftrag: `SCQ-NTX9R`;
- lokale fertige JPGs:
  `/Volumes/drive 1/Kundendata/20260803/SEEBURG ALSTERKR/ALSTERKRUG`;
- 31 Bilder wurden nur read-only angesehen, noch nicht hochgeladen;
- im Auftrag den Tab `Fertige JPGs` öffnen, Ordner auswählen und den Job als
  Upload-Ziel kontrollieren;
- das Video soll laenger sein und Aussenmotive deutlich staerker gewichten;
- JPGs ueber den neuen direkten Job-Tab laden, QC abschliessen, dann
  im Video-Setup Laenge, Aussenanteil, Bildrollen, Texte und Typografie in der
  UI festlegen;
- keine Texte im Chat erfinden und kein privates Lokalskript als Ersatz bauen.

## Stopregeln

- Kein neuer Agent-/Admin-Zugang als Workaround.
- Keine Account-Loeschung oder Zusammenfuehrung ohne Daniels Freigabe.
- Kein direkter DB-Import der SEEBURG-Bilder; Intake ausschliesslich ueber UI.
- Kein lokales Einzelvideo ausserhalb des Produktwegs.
- Kein Qwen-, GPU- oder sonstiger kostenpflichtiger Providerlauf, bis der
  UI-Weg mit echten Bildern funktioniert und Daniel den Provider-Test bewusst
  freigibt.
- Keine Provider-/Modellnamen in der Makleroberflaeche.
- PixCapture-Anbindung nicht durch Kopieren der PixImmo-Logik bauen, sondern
  Briefing/Planung/Persistenz als gemeinsamen Kern extrahieren und nur die
  Capture-Session-/Take-Quelle adaptieren.

## Git-/Dirty-State

Bei Erstellung der Anweisung war das PixImmo-Repo clean und lokal/remote auf
`3823c32` identisch. Im Workspace-Root waren folgende fremde Aenderungen offen
und wurden nicht angefasst:

- `00_READ_FIRST_EVERY_SESSION.md`
- `AGENTS.md`
- `docs/HANDOVERS/PIXCAPTURE_DIRECT_UPLOAD_DIAGNOSE.md`
- `docs/HANDOVERS/PIXCAPTURE_START.md`
- `projects/pixcapture-mobile`
- `projects/pixcapture-web`

Diese Dateien nicht pauschal committen, stashen oder zuruecksetzen. Die neue
Anweisung und ihre Indexverweise gehoeren dagegen zum aktuellen Handover und
muessen gezielt committed und auf
`codex/shared-video-studio-api-v1` gepusht werden.

Der lokal ignorierte
`CODEX_WORKING_MEMORY_DO_NOT_TOUCH/PIXCAPTURE_SESSION_CACHE.md` wurde in-place
aktualisiert und verweist als erster Punkt unter `JETZT` auf diese Anweisung.
