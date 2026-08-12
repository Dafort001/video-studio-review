# Video Studio – operative Übergabe für 2026-08-11

Stand: 2026-08-11, Europe/Berlin

Diese Datei ist die verbindliche kurze Fortsetzungsübergabe. Der lokale
Implementierungs-, Review- und Browser-Abnahmeblock ist abgeschlossen; live ist
die neue Architektur noch nicht. Heute wurde nichts gepusht oder deployed und
keine Produktionsdatenbank migriert. Die zwei ausdrücklich abgegrenzten
synthetischen R2-Tests sind abgeschlossen und vollständig bereinigt; kein
kostenpflichtiger Provider-/GPU-Lauf wurde gestartet.

## 1. Einstieg morgen – exakt diese Reihenfolge

1. `/Volumes/drive 1/PIXCAPTURE/00_READ_FIRST_EVERY_SESSION.md`
2. `/Volumes/drive 1/PIXCAPTURE/CODEX_WORKING_MEMORY_DO_NOT_TOUCH/PIXIMMO_SESSION_CACHE.md`
3. `/Users/danielfortmann/Desktop/VIDEO_STUDIO_UMSETZUNGSAUFTRAG.md`
4. `/Volumes/drive 1/PIXCAPTURE/docs/HANDOVERS/VIDEO_STUDIO_GESAMTAUFTRAG_2026-08-10.md`
5. `/Volumes/drive 1/PIXCAPTURE/docs/HANDOVERS/VIDEO_STUDIO_NEXT_AGENT_AFTER_PHASE4_2026-08-10.md`
6. diese Datei vollständig

Die Dateien 4 und 5 enthalten Begründung und Verlauf. Für den ersten
Arbeitsblock morgen gilt diese Datei operativ.

## 2. Git-Stände

| Git-Wurzel | Branch | Feature-Stand |
|---|---|---:|
| Workspace/Shared API | `codex/shared-workbench-unification-20260811` | `f02acb0` |
| PixImmo | `codex/shared-workbench-unification-20260811` | `bffb24b` |
| PixCapture | `codex/shared-workbench-unification-20260811` | `ce0cbb6` |
| Voleur Backend | `codex/shared-workbench-unification-20260811` | `fa0ca2d` |

Alle Feature-Commits sind lokal und nicht gepusht. Die vier Git-Wurzeln sind
nach den getrennten Commits sauber. Der rohe Root-Status zeigt ausschließlich
die erwarteten Gitlink-Abweichungen der verschachtelten Repositories. Diese
Gitlinks nicht kosmetisch committen oder resetten.

## 3. Heute zuletzt fertiggestellt

- Shared `60383bd` speichert pro Version die vollständige interne Preview- und
  Final-Scene-Spec. Der Renderer verwendet exakt den eingefrorenen Stand;
  öffentliche Antworten bleiben frei von Storage-Keys.
- PixImmo `8e3dc92` und PixCapture `062bea0` führen Klick/Scrub im fertigen
  Vorschauvideo crossfade-korrekt zur aktiven Szene im Editor.
- PixCapture stellt fertige Previewjobs nach Reload wieder her und besitzt
  einen Regressionstest für die GET-Query-Weiterleitung.
- Der zuvor fertiggestellte visuelle Editor enthält echten 9:16-Szenen-Canvas,
  Text/Logo-Griffe und Führungslinien, Basis-/Feinsteuerung, Undo/Redo,
  Laufzeit-/Abweichungsanzeige und bewusste Kurzclip-Bestätigung. Keine Scrims
  oder abdunkelnden Textflächen.
- Der accountgebundene Preset- und Logo-E2E ist für PixImmo und PixCapture
  bestanden. Speichern, Reload, Update, Fremdkontotrennung, normalisierte
  Logo-Vorschau und exakte DB-/R2-Bereinigung sind nachgewiesen.
- Die dabei gefundenen Neon-HTTP-Probleme sind lokal behoben: PixImmo
  `72fc2ea`, PixCapture `9414e76`. Keine Änderungen sind gepusht oder
  deployed.
- Daniels freigegebener TidyCal-Bestandsimport liegt ausschließlich im
  isolierten PixImmo-Child: 187 Buchungen, 60 konfliktfreie
  Kandidatenidentitäten, davon 58 neue und 2 vorhandene Konten. Drei weitere
  widersprüchliche E-Mail-Identitäten mit je einer Buchung bleiben bewusst
  unverknüpft. Keine Nachricht oder Login-Aktivierung.

## 4. Bereite isolierte Neon-Testumgebungen

| App | Neon-Projekt | Parent | Testbranch |
|---|---|---|---|
| PixImmo | `pixcapture-db` | `br-frosty-star-agm2zfg3` (`production`) | `br-broad-fire-agyy9yo1` |
| PixCapture | `pixcapture-db` | `br-frosty-star-agm2zfg3` (`production`) | `br-bold-night-ags15adk` |

Der PixImmo-Branch heißt `video-studio-piximmo-account-e2e-20260811`, der
PixCapture-Branch `video-studio-account-e2e-20260810`. Beide verwenden 0,25 CU,
pausieren nach fünf Minuten und laufen automatisch am 2026-08-17 um 22:00 UTC
ab. Der früher dokumentierte PixImmo/Pixplatform-Branch
`br-solitary-resonance-agpoyxb8` war leer beziehungsweise die falsche
Datenbasis und darf für PixImmo-Konto-E2Es nicht verwendet werden.

Nur auf diesen Child-Branches wurde
`manual_video_studio_user_brand_and_presets.sql` ausgeführt. Je Branch ist
verifiziert:

- `VideoStudioBrandAsset` und `VideoStudioPreset` fehlten vorher,
- beide Tabellen sind jetzt vorhanden,
- zwei `User`-Fremdschlüssel und vier erwartete Indizes sind vorhanden,
- die jeweiligen `production`-Branches besitzen beide Tabellen weiterhin
  nicht.

Nach dem E2E enthalten beide Childs wieder exakt 0 Presets und 0 Logozeilen;
die synthetischen R2-Testobjekte wurden per exaktem Schlüssel entfernt. Im
PixImmo-Child bleiben beauftragt 80 User und 187 TidyCal-Buchungen bestehen.
Kevin Blume und Nafiye Johannsen waren die beiden getrennten Testkonten.
Gleichnamige E-Mail-Identitäten wurden bewusst nicht automatisch
zusammengeführt. 184 Buchungen sind kontogebunden; drei widersprüchliche
Kontaktidentitäten mit je einer Buchung bleiben absichtlich unverknüpft. Alle
58 neu importierten Kunden sind nicht freigeschaltet.

Keine Verbindungs-URL und kein Rollenpasswort ist dokumentiert. Eine spätere
Verbindung nur flüchtig über Neon CLI und die Branch-ID beziehen, niemals in
Repo, Handover, Terminalausgabe oder Chat kopieren.

## 5. Abgeschlossener Arbeitsblock 2026-08-11

1. Branches geprüft und den falschen leeren PixImmo-Child durch einen Child der
   tatsächlichen PixImmo-Production ersetzt.
2. TidyCal-Bestand idempotent und nur in diesen PixImmo-Child importiert.
3. Preset-E2E ohne R2 für beide Apps mit je zwei getrennten Konten bestanden.
4. Logo-/R2-Test mit je genau einer synthetischen PNG-Datei durchgeführt.
5. Upload, Metadaten, Vorschau, Accountbindung und Renderer-Vertrag geprüft.
6. Genau erzeugte R2-Objekte und Testzeilen entfernt; keine breite Löschung.
7. Neon-HTTP-Fixes getrennt lokal committed; nichts gepusht oder deployed.

## 6. Bekannter grüner Nachweis

- Shared: 42/42 reguläre Tests; ein PostgreSQL-Test ohne
  `VIDEO_STUDIO_TEST_DATABASE_URL` übersprungen; TypeScript und Diff-Check
  grün.
- PixImmo: 170/170 Unit-Tests, TypeScript, gezieltes ESLint und Production-
  Build grün.
- PixCapture: 182/182 Unit-Tests, TypeScript, gezieltes ESLint und Build grün.
  Die bekannten Modulformat-Warnungen der Tests sind keine Video-Studio-
  Regression.
- Voleur: 26/26 Video-Unit-Tests plus 3/3 Endpoint-Auth-Tests, `py_compile`,
  Import in der installierten Modal-1.3.5-Runtime und Diff-Check grün.
- Lokaler Browser-E2E: PixImmo und PixCapture öffneten dieselbe zentrale
  Hostroute und UI, Bildauswahl/Timeline/Szenenfokus funktionierten, Autosave
  blieb nach Reload erhalten, der Fragmentcode verschwand und ein Replay
  zeigte korrekt `Link nicht mehr gültig`.

## 7. Stopregeln

- Kein Push, PR, Vercel-/Beta-/Production-/Modal-Deployment ohne Daniels neue
  ausdrückliche Freigabe.
- Keine Migration auf den Parent-/Production-Branches. Nicht Beta oder
  Production auf die Testbranches umkonfigurieren.
- Keine Secrets, Connection-Strings oder Rollenpasswörter ausgeben oder
  dokumentieren.
- Kein kostenpflichtiger Provider-/GPU-Lauf ohne zuvor sichtbares Motiv,
  Anzahl, Parameter und Kostenlimit.
- Keine Providerarchitektur vorentscheiden. Badezimmer-fal bleibt nur
  Infrastrukturbeweis; die Seeaufnahme bleibt redaktionelles Startmotiv und
  ist nicht automatisch Provider-Testmotiv.
- Keine fremden Änderungen löschen und keine Root-Gitlinks zur Kosmetik
  committen.

## 8. Abnahme dieses Blocks

Der Block ist abgenommen: Presets und Logos wurden im richtigen Testkonto
gespeichert, nach Reload reproduziert und gegen einen fremden Account
abgeschirmt. Beide App-Childs blieben getrennt, alle erzeugten Preset-/Logo-
Testdaten und R2-Testobjekte wurden gezielt bereinigt, und Tests/Builds sind
grün. Der TidyCal-Bestand bleibt wie beauftragt nur im isolierten PixImmo-
Child. Der Gesamtauftrag ist nicht automatisch live: Push, Deployment,
Migration nach Beta/Production und Beta-Umschaltung bleiben separate
Entscheidungen Daniels.

## 9. Maßgeblicher Architekturstand nach der Konsolidierung

- Es gibt genau eine sichtbare Werkstatt auf dem zentralen PixImmo-Host unter
  `/video-studio/workbench/[projectId]`. Sie ist produktneutral und benötigt
  weder PixImmo-Login noch PixCapture-Login, sondern ausschließlich die
  autorisierte Shared-Projektsitzung.
- Beide Portale authentifizieren ihren eigenen Auftrag und senden einen
  signierten Handoff an Shared. Shared ergänzt einen zufälligen, 90 Sekunden
  gültigen Einmalcode im URL-Fragment. Die Launchseite entfernt das Fragment,
  löst den Code serverseitig ein und setzt ein projektgebundenes
  HttpOnly-/Secure-/SameSite-Lax-Cookie. Token oder Storage-Key stehen weder in
  der URL noch im öffentlichen Projekt.
- PixImmo- und PixCapture-Quellbilder erhalten nur für die Browseranzeige eine
  kurzlebige signierte `sourcePreviewUrl`. Die stabile Delivery-Identität und
  der unveränderte `storageKey` bleiben intern für Analyse und Renderer.
- Alte PixImmo-Admin-/User-Werkstätten, die historischen Routen `timeline`,
  `motion`, `maklerin` und der komplette öffentliche
  `/video-workbench/:path*`-Baum rendern keinen zweiten Editor mehr. Der alte
  PixCapture-Editorpfad ist ebenfalls inert.
- Persönliche Logos und Vorlagen laufen in der zentralen UI über strikt
  produktgebundene PixImmo-/PixCapture-DB- und R2-Adapter. Produkt und Actor
  stammen nur aus dem gelesenen Shared-Projekt; Browserparameter, PixImmo-
  Login oder frei übergebene User-IDs entscheiden niemals die Adapterwahl.
- Shared dispatcht Render und Analyse an getrennte produktfeste Worker-URLs.
  Voleur bindet PixImmo und PixCapture an getrennte ASGI-Funktionen und
  R2-Secrets; Source, Logo, Progress, Ergebnis und Status tragen denselben
  Produkt-/Storage-Scope. Unbekannte oder widersprüchliche Scopes scheitern
  geschlossen.

## 10. Bildgrößen – verbindliche Klarstellung

Die 5-MB-Grenze und Normalisierung auf höchstens 2048 Pixel gelten
ausschließlich für ein freiwillig hochgeladenes Kundenlogo. Sie gelten nicht
für Objekt-, Immobilien- oder Szenenbilder. Diese bleiben in ihrer
unveränderten Delivery-Auflösung erhalten. Browser-Vorschauen können
kurzlebige Anzeigeableitungen sein; Bewegungsplanung, Analyse und Rendering
referenzieren weiterhin die interne Original-Delivery-Quelle. Eine
automatische Verkleinerung der Szenenbilder beim Werkstattimport ist nicht
Teil dieses Standes.

## 11. Lokale Commits

- Shared: `874df64`, `2dfee04`, `f02acb0`.
- PixImmo/Zentralhost: `92927b3`, `70999b9`, `1bddf98`, `2659976`,
  `e0fb1c4`, `bffb24b`.
- PixCapture-Starter: `ce0cbb6`.
- Voleur: `fa0ca2d`.

Alle Beiträge wurden entsprechend Daniels Regel von einem anderen Agenten
read-only geprüft. Gefundene Fehler – zu kurze Preview-Gültigkeit, fehlende
PixImmo-Previewfelder, noch aktive Legacy-Werkstätten und die zunächst
produktunsichere Einzel-R2-Worker-Annahme – wurden in separaten Fixcommits
behoben und danach erneut grün geprüft. Es gibt kein offenes Reviewfinding.

## 12. Browser-Abnahmebilder

Die lokalen Screenshots liegen außerhalb der Git-Repositories unter:

`/Users/danielfortmann/.codex/visualizations/2026/08/11/019fef34-1e22-70a2-95ad-773d4ce032d2/video-studio-proof/`

Maßgeblich sind `piximmo-central-workbench-top-final.png` und
`pixcapture-central-workbench-overview.png`. Die Bilder zeigen dieselbe
Werkstattstruktur mit produktgebundenem Label und Rücksprungziel. Die dabei
erzeugten lokalen File-Store-Projekte und Serverprozesse wurden anschließend
vollständig entfernt beziehungsweise beendet.

## 13. Noch notwendige Live-Schritte

1. Product-spezifische zentrale DB-/R2-Konfiguration für PixImmo und
   PixCapture kontrolliert setzen und die vorhandenen additiven Video-Studio-
   Tabellen in den Ziel-Datenbanken migrieren.
2. Die zwei produktfesten Modal-/Voleur-Endpunkte mit getrennten R2-Secrets
   deployen; danach Shared-Service, zentralen Host und beide Portalstarter
   deployen.
3. Jede direkte Deployment-URL vor einer Aliasänderung gemäß Beta-
   Sicherheitsregel mit Login, DB, einem echten R2-Asset, Filmstrip,
   Portfolio und Werkstatt prüfen. Erst danach `beta.pix.immo` umschalten und
   dieselben Prüfungen wiederholen.
4. In den isolierten Zielumgebungen je Produkt einen echten Logo-/Preset-
   Reload sowie einen echten Render-/Analyse-E2E mit korrektem Storage-Scope
   durchführen. Keine Produktionstestdaten ohne neue ausdrückliche Freigabe.
5. Push/PR/Merge/Deployment bleiben Daniels separate Entscheidung; lokal ist
   der Code- und Reviewblock abgeschlossen.

## 14. PixImmo-Beta live seit 2026-08-11

Daniel hat anschließend ausdrücklich nur den gestuften Rollout auf
`beta.pix.immo` freigegeben. `pix.immo`, `pixcapture.app` und PixCapture-Web
bleiben bis zu seiner eigenen sichtbaren Abnahme unverändert.

- Shared läuft isoliert auf
  `https://pix-shared-video-studio-c7ffpzcy9.vercel.app`, Deployment
  `dpl_HbL6ctNQiFbadou36moK3BnJPx8b`, Shared-HEAD `6b49c80`.
- Der Beta-Worker läuft als getrennte Modal-App
  `pix-social-video-beta-unification`, App-ID
  `ap-h3jd2dnSOd4JaLHFWfegvD`, Voleur-HEAD `5bc6b07`. Registriert sind nur
  die drei PixImmo-Funktionen für Analyse, Render und ASGI; PixCapture und die
  bisherigen Legacy-Funktionen sind in dieser App nicht registriert. Die
  bestehende Modal-App `pix-social-video` blieb unverändert.
- Der neue PixImmo-Stand ist Deployment
  `dpl_DRu1T9MTRanLRpPs82wvuDbC9wWh`, Commit `bffb24b`. Die direkte URL
  bestand vor der Umschaltung Login, Datenbank, reale R2-Bilder, Filmstrip,
  Portfolio, Legacy-Redirects, realen 31-Bilder-Handoff, Einmalcode-Redeem und
  zentrale Werkstatt.
- Danach wurde ausschließlich der Alias `beta.pix.immo` auf dieses Deployment
  gesetzt. Rückfallziel ist
  `dpl_7FCsVRcr1VGLHcHct9yHox8tYMDZ`.
- Die vollständige Prüfung auf der echten Beta-Domain bestand erneut:
  Startseite, Loginprovider, Adminlogin, Session, Setup mit fünf bildbereiten
  Aufträgen, 18/18 Startseitenbilder, 35/35 Portfoliobilder, echtes DB→R2-WebP,
  Demo-Filmstrip, echtes JPEG, Handoff für `SCQ-NTX9R` mit 31 Assets,
  kurzlebige Preview, HttpOnly-Redeem und Replay-Sperre `401`.
- Im sichtbaren Browser wurden zwei reale Seeburg-Bilder ausgewählt. Bildfolge,
  Timeline, Start/Ende, Original-Start-/Endrahmen, 9:16-Szenenansicht und
  Autosave nach Reload funktionierten. Screenshots liegen im bereits genannten
  `video-studio-proof`-Ordner als
  `beta-pix-immo-portfolio-live.png` und
  `beta-pix-immo-workbench-live.png`.
- Es wurde kein Render-, Analyse- oder kostenpflichtiger Providerlauf gestartet
  und kein Logo hochgeladen. Die Bilder blieben unveränderte R2-Delivery-
  Quellen. `pix.immo` antwortet weiterhin über Wix; PixCapture wurde weder
  deployed noch umgeschaltet.

Der nächste Schritt ist Daniels eigene sichtbare Beta-Abnahme. Erst nach seiner
ausdrücklichen Freigabe darf der PixCapture-Rollout vorbereitet werden. Ein
echter Preview-/Final-Render auf Beta bleibt ein eigener, sichtbarer Test mit
bewusst gewähltem Auftrag; er darf nicht als synthetischer Produktions-R2-
Write versteckt vorweggenommen werden.

## 15. Änderungsnotiz 2026-08-11 20:25 – sichtbare Bewegungsdemos, Break

- Geändert: Keine Produktdatei. Keine neue Beta-, Shared- oder Modal-
  Bereitstellung. Daniel hat den Arbeitsblock ausdrücklich beendet und eine
  Fortsetzungsübergabe verlangt.
- Aktueller Live-Stand: `beta.pix.immo` steht auf PixImmo-Deployment
  `dpl_BUCfU3bmJpqNKx7e47e795JDWhcw`, PixImmo-HEAD `16991f7`. Der vom Portal
  verwendete unveränderliche Shared-Service bleibt
  `https://pix-shared-video-studio-656fx2n36.vercel.app`, Shared-HEAD
  `33446ec`. Nicht auf einen späteren Shared-Deploy wechseln: dessen
  Production-Handoff-Secret ist nicht synchron. Der isolierte PixImmo-Worker
  `pix-social-video-beta-unification` läuft als V6 auf Voleur-HEAD `364ee82`
  mit 16 CPU, 49.152 MiB, maximal 16 parallelen Cut-Szenen und ohne
  Bildverkleinerung.
- Rendernachweis: Der autorisierte 60-Sekunden-Testfilm liegt unter
  `output/video-studio-e2e-60s-2026-08-11/vsp_f66809853cdef8e0c021d8d9279ff887-60s-preview.mp4`.
  Er wurde technisch korrekt in rund 8:12 Minuten gerendert (60 FPS, 3.600
  Frames, 31 Szenen), ist nach Daniels und anschließend eigener visueller
  Prüfung aber **kein gestalterisch brauchbarer Demo- oder Kundenfilm**.
  Insbesondere laufen Texte unleserlich über Bildränder, Farben und Positionen
  sind zufällig, und Start-/Endausschnitte wurden motivblind automatisiert.
  Technische Richtungs-/Frameprüfungen dürfen nicht mehr als gestalterische
  Abnahme bezeichnet werden. Kein weiterer Preview-, Final- oder AI-Job.
- Verbindliche Produktentscheidung: Die Bewegungsbibliothek wird mit genau
  einem neutralen, reparierten Raumbild aufgebaut. Für jede Bewegung legt
  Daniel nacheinander selbst Startausschnitt, Endausschnitt und Dauer fest.
  Erst nach seiner sichtbaren Einzelabnahme wird genau ein kleines 9:16-
  Demovideo gerendert und später im Bewegungsmenü abgespielt. Keine automatische
  Zehnererzeugung und keine Ping-Pong-Bewegung. Das Menü soll die Vorschau erst
  bei Klick oder Hover abspielen; der Bewegungsname steht außerhalb des Videos.
- **Harte Änderungsregel:** Jede weitere Änderung an Bewegungsauswahl,
  Rahmenbedienung, Vorschau oder Demo-Bibliothek muss innerhalb des aktuell
  gemeinsam entwickelten Weges erfolgen: in der einen zentralen Werkstatt
  `/video-studio/workbench/[projectId]` auf dem bestehenden
  `codex/shared-workbench-unification-20260811`-Stand und nach dem sichtbaren
  Einzelablauf `Start festlegen → Ende festlegen → Dauer festlegen → Daniel
  prüft → genau eine Demo rendern → erst dann einbauen`. Kein zweiter Editor,
  keine neue parallele Route, kein Wiederbeleben einer Legacy-Werkstatt, kein
  losgelöstes Offline-Autogenerieren und kein stiller Sonderweg neben diesem
  Ablauf. Eine lokale Bedienseite darf ausschließlich die Eingabeoberfläche
  für genau diesen Weg sein; bestätigte Werte müssen anschließend in denselben
  kanonischen Werkstattvertrag einfließen.
- Verbindliche Quelldateien: Repariertes Raumbild
  `/Users/danielfortmann/.codex/generated_images/019fef34-1e22-70a2-95ad-773d4ce032d2/exec-2049b9d6-cfc2-446b-b2eb-999da1d6e180.png`
  (1672×941; Daniel hat das fehlerhafte hintere Fenster selbst in Photoshop
  korrigiert). Rahmenreferenz `/Users/danielfortmann/Desktop/Rahmen1.png`
  (900×1600 RGBA, transparentes Inneres, exakt 9:16). Nicht erneut generieren,
  nicht überschreiben und Daniels Bildkorrektur nicht verlieren. Für die
  Anwendung kann der Rahmen später nativ als CSS/SVG umgesetzt werden; die PNG
  ist die verbindliche Verhältnis- und Farbvorlage.
- Nächster Schritt morgen: Ausschließlich Bewegung 01 `Pan links → rechts`.
  Eine kleine lokale Bedienseite bereitstellen, auf der Daniel auf dem ganzen
  Raumbild zuerst den echten 9:16-Start- und dann den Endrahmen horizontal
  verschiebt, die Dauer 0,6–10 Sekunden setzt und eine einmalige Vorschau
  startet. Positionen sichtbar ausgeben und lokal speichern. Vor Daniels
  Bestätigung **kein MP4 rendern**. Danach erst Bewegung 02 beginnen.
- Fehlversuch/Entsorgung: Ein vorschnell automatisch erzeugter Satz aus zehn
  lokalen MP4-Entwürfen sowie ein unfertiger HTML-Spike wurden nicht gezeigt,
  nicht deployed und nicht in ein Repository übernommen. Sie liegen
  wiederherstellbar im Papierkorb unter
  `/Users/danielfortmann/.Trash/codex-video-motion-invalid-drafts-20260811/`
  und dürfen nicht als Ausgangspunkt oder Abnahme verwendet werden.
- Verifikation/Status: Workspace-Root mit `--ignore-submodules=all`, PixImmo,
  PixCapture und Voleur waren vor dieser Dokumentationsänderung jeweils ohne
  uncommitted Dateien. Kein lokaler Server blieb laufen. Keine Produktions-,
  Projekt-, R2-, Datenbank- oder Browsermutation aus dem abgebrochenen
  Demoblock.
