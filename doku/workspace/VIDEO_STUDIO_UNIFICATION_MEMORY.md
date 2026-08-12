# Video Studio Unification – Arbeitsgedächtnis

Stand: 2026-08-11, Europe/Berlin

## Zielregel

Genau eine sichtbare Video-Werkstatt, erreichbar über zwei signierte
Portalstarter. Keine zweite Editor-/Timeline-Oberfläche in PixImmo oder
PixCapture.

## Gesicherter Ausgangsstand

- Root, PixImmo und PixCapture besitzen lokalen Tag
  `backup/pre-shared-workbench-unification-20260811`.
- Alle drei stehen auf Branch `codex/shared-workbench-unification-20260811`.
- Ausgangs-HEADs: Root `66aaa12`, PixImmo `72fc2ea`, PixCapture `9414e76`.
- Voleur-Ausgangsstand war `0a19842`; auch dort gilt jetzt der gemeinsame
  Branch `codex/shared-workbench-unification-20260811`.

## Verbindliche Entscheidungen

- PixImmo-Workbench ist Funktionsquelle, nicht zweites Endprodukt.
- Historische Werkstatt ist UX-Referenz: Bildbank + Bildgeschichte gemeinsam,
  aktiver Szenenfokus, Original mit Start/Ende neben 9:16, permanente
  Szenenleiste, Presenter-Referenz.
- PixCapture wird reiner Portalstarter.
- Shared API, Projektmodell, Scene-Spec und Renderer bleiben erhalten.
- Keine Pushes, Beta-/Production-/Modal-Deployments während der lokalen
  Konsolidierung.

## Festgelegter Launch-/Bildvertrag

- `POST /v1/handoffs/exchange` bleibt abwärtskompatibel und ergänzt
  `launchCode`, `workbenchUrl`, `launchExpiresInSeconds`.
- `workbenchUrl` trägt den 90 Sekunden gültigen Einmalcode nur im URL-Fragment
  `#launchCode=...`; kein Sessiontoken in Query, Historie oder Serverlog.
- `POST /v1/workbench-launches/redeem` tauscht den Code genau einmal gegen
  Projekt und gebundene Session. Speicherung nur als Hash; Bindung an Produkt,
  Tenant, Actor und Projekt.
- Signierte Quellbilder werden als volatile Metadaten
  `sourcePreviewUrl`/`sourcePreviewUrlExpiresAt` übertragen. Nur HTTPS, optional
  Host-Allowlist; `storageKey` bleibt intern und die Manifestidentität bleibt
  unverändert.

## Agentengrenzen

- Shared-Agent: nur Workspace-Root; sicherer Einmal-Launch und Shared-Vertrag.
- Canonical-UI-Agent: nur `projects/piximmo-web`; produktneutrale zentrale
  Werkstatt und sichtbarer Testscreen.
- PixCapture-Agent: nur `projects/pixcapture-web`; lokaler Editor wird Starter,
  keine neue Werkstattlogik.
- Root-Agent koordiniert Verträge, integriert, testet und aktualisiert diese
  Notiz.

## Lokale Umsetzungscommits / abgeschlossener Reviewstand

- Shared HEAD `f02acb0`: `874df64`, Reviewfix `2dfee04` und produktgebundene
  Render-/Analyse-Worker-Registry `f02acb0`.
- Canonical PixImmo HEAD `bffb24b`: eine zentrale Werkstatt `92927b3`,
  Handoff-/Legacy-Fixes `70999b9`, `1bddf98`, `2659976`, produktgebundene
  Kontobibliothek `e0fb1c4` und Klarstellung Logo-only-Limits `bffb24b`.
- PixCapture HEAD `ce0cbb6`: reiner zentraler Starter; lokaler Editorpfad inert.
- Voleur HEAD `fa0ca2d`: getrennte feste PixImmo-/PixCapture-ASGI-Endpunkte,
  R2-Secrets und Storage-Scope-Bindung für Render und Analyse.
- Sämtliche konkreten Reviewfindings wurden vom jeweiligen Autor in separaten
  Commits behoben und anschließend von einem anderen Agenten erneut grün
  geprüft. Auch Konto-Adapter, Shared-Storagevertrag und Voleur wurden
  wechselseitig unabhängig geprüft; keine offenen Findings.
- Alte PixImmo-Editorrouten einschließlich des gesamten öffentlichen
  `/video-workbench/:path*`-Baums sind vor dem Rendern gesperrt oder leiten zum
  zentralen Starter. Es gibt keinen zweiten aktiven Editorpfad.
- Kontobibliothek wählt DB und R2 ausschließlich aus autorisiertem
  Shared-Projekt (`product` + `actorId`), niemals aus Browserparametern.

## Verbindliche Review-Kette

Kein Agentenbeitrag wird allein durch den Autor abgenommen.

1. Canonical-UI-Agent reviewt Shared-Agent-Diff und Tests.
2. PixCapture-Agent reviewt Canonical-UI-Agent-Diff und Tests.
3. Root-Agent reviewt PixCapture-Agent-Diff sowie den integrierten Gesamtfluss.
4. Fehler gehen mit Datei und konkretem Nachweis an den ursprünglichen Autor
   zurück; erst die Korrektur schließt den Block.

## Stopregeln bei Komprimierung

1. Diese Datei, `00_READ_FIRST_EVERY_SESSION.md` und PixImmo-Cache lesen.
2. Git-Branch/HEAD/Status aller vier Wurzeln prüfen.
3. Agentenstatus abrufen; keine bereits bearbeitete Datei parallel übernehmen.
4. Bei Widerspruch zwischen Erinnerung, Git und Tests gilt Git plus Testbeweis.
5. Bei fehlendem Vertragsdetail nicht raten: zuständigen Agenten fragen oder
   read-only rekonstruieren.

## Harte Abnahme – erfüllt am 2026-08-11

- Lokaler Browser-E2E öffnete PixImmo und PixCapture über signierte Handovers
  auf derselben zentralen Hostroute `/video-studio/workbench/[projectId]`.
- Beide Pfade zeigten dieselbe UI-Struktur, Bildbank, Bildgeschichte, Timeline,
  Start/Ende, Szenenansicht und 9:16-Vorschau; nur Produktlabel und sicher
  gebundener Rücksprung unterscheiden sich.
- Fragmentcode verschwand nach Einlösung; Wiederholung desselben Codes zeigte
  `Link nicht mehr gültig`. Autosave blieb nach Reload erhalten.
- Quellbilder blieben unveränderte Delivery-Objekte. 5 MB / 2048 px gilt nur
  für freiwillige Logo-Uploads; `sourcePreviewUrl` ist reine Anzeige und
  `storageKey` bleibt für Analyse/Renderer intern unverändert.
- Finaler Nachweis: Shared 42/42 regulär plus 1 PostgreSQL-Skip ohne Test-DB;
  PixImmo 170/170; PixCapture 182/182; Voleur 29/29; TypeScript, py_compile
  und Diff-Checks grün. PixImmo-/PixCapture-Builds sowie Reviews grün.

## Aktuelle Rollout-Grenze

- Nur `beta.pix.immo` ist autorisiert und live. `pix.immo`, `pixcapture.app`
  und PixCapture-Web bleiben bis zu Daniels sichtbarer Freigabe unverändert.
- Kein Preview-/Final-Render, Analysejob, Providerlauf oder Logo-Upload wurde
  gestartet. Ein echter Render bleibt ein eigener sichtbarer Test.

## Werkstatt-Neubau – lokaler Stand 2026-08-11

- Final auf Beta deployed und technisch abgenommen. Shared-Vertrag ist in
  `cf1c069` plus Fixes `f294d6d`, `8b83734`, `d1b8aee` und `731468e`
  implementiert: globale Logo-AABB/Sperrzone, signierte Creative-Asset-
  Attestierung, quellengebundene Masken, Firmenschriften, 32 Typo-Ebenen,
  Storyboard-Entwürfe, servergeprüfte generierte Clips, weiche Laufzeitwarnung
  und 21 tatsächlich renderbare Phase-1-Bewegungen. Root: 52/52 regulär grün,
  ein PostgreSQL-Skip ohne Test-DB; tsc und Diff-Check grün.
- Voleur-Renderer ist in `e4ee71b` implementiert, unabhängig grün geprüft und
  nur in die isolierte PixImmo-Beta-App v3 deployed:
  gemischte Standbild-/Clip-Timeline, ffprobe-Dauer, Audio fail-closed, keine
  Clip-Zeitmanipulation, globale Logo-Endkomposition, echte Mehrfachtypografie,
  produktgebundene TTF/OTF/WOFF2-Fonts und mitbewegte SAM-Masken. 43 reguläre
  Tests plus echter WOFF2-Test grün.
- Canonical PixImmo ist final in `eb60b75`, `a611b98`, `c67ec6a`,
  `87026ac` und `984f04c` umgesetzt und fremdgeprüft:
  fünf sichtbare Bereiche Logo, Galerie, reine Sortier-Timeline,
  Szenenbearbeitung sowie Vorschau & KI; interaktive Start-/Endrahmen,
  gruppierter 91er Katalog, Typografie/Masken, Fontupload und Storyboard.
  Typografie-/Layervertrag, Font-Reload, konkurrenzfreie Altwerkzeuge und
  Client-/Shared-Integration sind grün; PixImmo 188/188 plus Build/tsc/lint.

## Daniels verbindlicher Werkstattablauf – Korrektur 2026-08-11

1. Job als vollständige Bildergalerie laden.
2. Bilder auswählen und ausschließlich als vollständige Originalmotive in die
   Timeline übernehmen; dort nur sortieren, positionieren und rückgängig
   machen. Kein 9:16-Ausschnitt und keine Bewegung in diesem Schritt.
3. Erst danach jede Szene einzeln groß bearbeiten: Dauer 0,6–10 s,
   Start-/Endrahmen, qualitätsbegrenzter Zoom/Pan und gruppierte Bewegungen;
   Vorgänger/Nachfolger angeschnitten hinter dem Hero-Motiv sichtbar.
4. Szenenebenen festlegen: Architektur-/Objektmasken, später eingefügter
   Avatar und Typografie mit Vorder-/Hintergrund- sowie Verdeckungsreihenfolge.
5. Typografie ist ein eigener nachfolgender Schritt, nutzt aber die in Schritt
   3 festgelegten Ebenen. Sie muss räumlich/kinetisch und nicht nur als Leiste
   funktionieren.
- Quellfotos enthalten keine Personen. Personen kommen ausschließlich später
  als Avatar-Studio-Ebene hinzu.
- Bewegungen müssen sichtbar in quellenbasierte und generative/AI-gestützte
  Verfahren getrennt sein; auch Pfadfahrten, Fake-Drone und generative
  Perspektivwechsel gehören in die zweite Gruppe.
- Die aktuell live geschaltete Beta-Werkstatt bildet diesen Ablauf sichtbar ab;
  Daniels fachliche/gestalterische Abnahme bleibt maßgeblich.

## Avatar-Audit 2026-08-11

- Echter Avatar-Code liegt in `services/pix-avatar-pipeline` und
  `projects/voleurdimages-web`, nicht in den allgemeinen Voleur-RAW-Repos.
- Live read-only bestätigt: zwölf `pix-avatar-*` Modal-Apps sind deployed;
  geschützte API antwortet unauthentifiziert 401; Voleur `/studio` leitet zum
  Login.
- Real vorhanden: R2-Arbeitsbereich, Identitäts-LoRA-Training, Chatterbox-
  Sprach-Smoke, geschützte Job-API und ein einzelner Wan-TI2V-Smoke.
- Nicht fertig: einfache UI sammelt und speichert nur Material und endet
  ausdrücklich ohne Job/Render; Experten-Renderknopf ist gesperrt. In der API
  sind Avatarbild, CosyVoice sowie Wan I2V/S2V blockiert; nur LoRA wird real
  dispatched. Chatterbox wird angenommen, aber nicht aus der API dispatched.
- Keine Integration in die zentrale Werkstatt: `TakePresenter` existiert nur
  als Datenansatz; Scene-Spec/Renderer übertragen weder Avatar-Layer noch
  Maske/Depth/Occlusion. Text ist ausdrücklich foreground-only und
  `occlusionMaskSupported: false`.
- Avatar darf deshalb nicht als fertige Funktion dargestellt werden. Für die
  Werkstatt fehlen ein projektgebundener Avatar-Assetvertrag, transparenter
  Personenclip, Position/Skalierung/Zeit, Depth-/Occlusion-Compositing,
  Renderübergabe und echte visuelle Abnahme.

## Beta-Rollout 2026-08-11 – live und technisch grün

- Daniel hat ausschließlich `beta.pix.immo` freigegeben. `pix.immo`,
  `pixcapture.app` und PixCapture-Web dürfen bis zu seiner späteren sichtbaren
  Abnahme nicht deployed oder umgeschaltet werden.
- Shared-DB wurde additiv um Analyse- und One-Time-Launch-Tabellen/Indizes
  ergänzt; keine Bestandsdaten geändert. Shared läuft als Deployment
  `dpl_HbL6ctNQiFbadou36moK3BnJPx8b` auf
  `https://pix-shared-video-studio-c7ffpzcy9.vercel.app`.
- PixImmo CENTRAL-Adapter nutzt für Beta den isolierten Neon-Child
  `br-broad-fire-agyy9yo1`, beide Tabellen vorhanden/leer, sechs PixImmo
  DB/R2-Envs plus Portal-URL und Handoff-Secret gesetzt.
- Tatsächliche Vercel-Konfiguration: PixImmo/PixCapture haben unterschiedliche
  R2-Accounts, Endpoints und Buckets. Vercel gibt Sensitive-Werte nur als
  11-Zeichen-Marker zurück; Gleichheit dieses Markers ist kein Credential-
  Beweis. In lokaler PixCapture-Production-Konfiguration fehlen jedoch echte
  Access-/Secret-Keys, daher kein sicherer PixCapture-Modal-Secretaufbau.
- Sicherer Entschluss für die ausdrücklich PixImmo-only Beta: Shared und
  Voleur erhalten strikt geparste `ENABLED_PRODUCTS`-Schalter, Default bleibt
  beide Produkte; Beta setzt nur `piximmo`. PixCapture wird nicht registriert
  bzw. fail-closed abgewiesen, niemals auf PixImmo-Storage umgeleitet.
- Voleur-Appname ist in fremdgeprüftem Commit `f20e226` konfigurierbar;
  Default `pix-social-video`, Beta isoliert
  `pix-social-video-beta-unification`. Bestehende Modal-App bleibt unangetastet.
- Neue Rollout-Commits: Shared `6f47569` + Reviewfix `6b49c80`; Voleur
  `f20e226`, `f6ef699` + Reviewfix `5bc6b07`. Gegenseitige Fremdreviews grün.
- Isolierte Modal-App `pix-social-video-beta-unification`, App-ID
  `ap-h3jd2dnSOd4JaLHFWfegvD`, registriert exakt drei PixImmo-Funktionen. Die
  bestehende Modal-App blieb unangetastet.
- PixImmo Deployment `dpl_DRu1T9MTRanLRpPs82wvuDbC9wWh` bestand die direkte
  Abnahme. Danach wurde nur `beta.pix.immo` umgeschaltet; Rückfallziel
  `dpl_7FCsVRcr1VGLHcHct9yHox8tYMDZ`.
- Post-Alias erneut grün: HTTP, Adminlogin/Session, DB, fünf bildbereite Jobs,
  reale R2-Bilder, 18/18 Filmstrip, 35/35 Portfolio, realer 31-Bilder-Handoff,
  Einmalcode/Replay, zentrale Werkstatt, Auswahl, Timeline, Original-/9:16-
  Szene und Autosave nach Reload. Nächster Schritt ist Daniels eigene Abnahme.

## Finaler Werkstatt-Rollout 2026-08-11

- `beta.pix.immo` zeigt verifiziert auf das saubere PixImmo-Deployment
  `dpl_FZuNeXd2zRoX4aFKU3Lz2AgixxVw`, HEAD `984f04c`.
- Shared läuft PixImmo-only aus `731468e` als
  `dpl_6ycKXR3uzt5ysFVMLeiLhP5XnHd1`; PixCapture wird vor Signatur/Nonce mit
  `403 product_disabled` abgewiesen.
- Isolierter Modal-Worker `pix-social-video-beta-unification` läuft als v3 aus
  `e4ee71b`, exakt drei PixImmo-Funktionen; bestehende Production-App blieb
  unverändert.
- Account-Library-Fehler behoben: Vercel hatte einen 11-Zeichen-Redaktionsmarker
  statt der Neon-URL gespeichert. Der echte gepoolte Child-String ist gesetzt;
  Brand/Preset/Font-Tabellen sind vorhanden und leer, API 200.
- Post-Alias: normale DB-Auth, Setup/Galleries/Portfolio 200, Seeburg-Handoff
  31/31 signierte Bilder, echtes R2-JPEG 206, kein Browser-storageKey,
  Redeem 200/Replay 401, Account-Library 200 und alle fünf Werkstattbereiche.
- Sichtbar im Browser bestätigt: getrennte Galerie, reine Sortier-Timeline,
  Start-/Endrahmen, 21 aktive Quellbewegungen, Whip/Depth ehrlich deaktiviert,
  Mehrfachtypografie und Preview/KI-Storyboard. Seeburg hat derzeit 0
  vorhandene attestierbare Masken; es wird keine Maske simuliert.
- Qualitätsbudget korrigiert: exakt `min(width/1080,height/1920)`, tolerante
  Float-Grenze, keine Aufrundung über den Cap und dieselbe Normalisierung für
  persistierte SceneSpec-Hero-Frames. 3000x2000 mit 1.00→1.04 ist
  eingeschränkt, aber zulässig. Fremdreview grün; 188/188 Tests.
- `pix.immo`, PixCapture-Web und PixCapture-Production wurden nicht verändert.
