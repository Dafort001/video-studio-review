# PixImmo · Shared Video Studio Adapter

### 2026-08-10 13:35 - Shared-Server produktionsbereit verpackt

- Der neutrale Server verwendet in Produktion nun einen dedizierten
  PostgreSQL-Store für Projekte, Jobs und Replay-Nonces. Das Vercel-Projekt
  `pix-shared-video-studio` und sein Frankfurt-Build sind angelegt und grün.
- Nachweis: reguläre Suite 26 bestanden/1 PostgreSQL-Test ohne URL übersprungen;
  mit echtem PostgreSQL 27/27, dazu Produktionsserver-Smoke, Container-Smoke,
  striktes TypeScript, Audit ohne Findings und erfolgreicher Vercel-Build.
- Deployment abgeschlossen: Die kostenlose, isolierte Neon-Datenbank läuft in
  Frankfurt ohne Neon Auth. Shared-Deployment
  `dpl_Hewy7hJSo4yikdEaVQF3QZANjPQ6` bestand Health, signiertes Handoff `200`,
  Replay-Schutz `401` und projektgebundenes Lesen `200`; der verifizierte Build
  liegt auch hinter `https://pix-shared-video-studio.vercel.app` (Health
  `200`).
- PixImmo-Direktnachweis: Deployment
  `dpl_8G7tXF4G36rnAkp7dNAWpRF96Rv6` ist `READY`. Startseite, Login/Auth,
  Datenbank, 18 Filmstrip- und 35 Portfolio-Bildquellen sowie echtes R2-WebP
  `206` bestanden. Der vorhandene E2E-Admin öffnete `SCQ-NTX9R`, übergab 31
  Bilder und erreichte Projekt `vsp_bbfe7742f6e4d4e8a7fabedc28120b3c` mit
  sichtbarer Auswahl/Reihenfolge, Bewegung, Crop, Text und Vorschau-Steuerung.
  Kein Render-/Providerlauf; Beta unverändert.

### 2026-08-10 14:10 - Produktgebundene gemeinsame Video-Werkstatt

- Geändert: Der vorhandene PixImmo-Video-Setup-Button übergibt jetzt den
  authentifizierten Auftrag und ausschließlich dessen `delivery_ready`-Bilder
  an den neutralen Shared-Video-Studio-Server. Der gemeinsame Server erhielt
  dafür den einmaligen atomaren Bootstrap in Workspace-Commit `5c11dec`.
- Warum: PixImmo und PixCapture sollen dieselbe Werkstatt verwenden, ohne
  Kunden, Aufträge, Tokens oder Storage-Keys zwischen Produkten zu vermischen.
- Auth-Grenze: PixImmo signiert das Handoff serverseitig mit einem eigenen
  HMAC-Schlüssel. Der Studio-Mandant ist der tatsächliche Auftragseigentümer;
  der Akteur ist der angemeldete Nutzer. Das 15-Minuten-Studio-Token liegt nur
  in einem `HttpOnly`, `SameSite=Lax` Cookie. Jeder Proxyaufruf prüft erneut
  Akteur, Produkt, Quellauftrag und aktuelle PixImmo-Zugriffsberechtigung.
- Wirkung: Die neue Werkbank bietet Bildauswahl und Reihenfolge, Startbild,
  Dauer, Bewegung, Start-/Endausschnitt sowie direkten Bildtext mit Stil,
  Farbe, Größen und Position. Eine Vorschau wird nur explizit gestartet.
- Konfiguration: PixImmo benötigt `VIDEO_STUDIO_INTERNAL_URL` und
  `PIXIMMO_VIDEO_STUDIO_HANDOFF_SECRET`. Der gemeinsame Server muss denselben
  PixImmo-Handoff-Schlüssel besitzen. Es gibt keine Secret-Fallbacks.
- Verifikation: TypeScript, gezieltes ESLint, Produktionsbuild und 150/150
  Unit-Tests bestanden. Gemeinsamer Server: 24/24 Tests. Lokaler Zweidienst-
  Smoke-Test: `/health` erfolgreich, unauthentifiziertes PixImmo-Handoff
  korrekt `401`. Der visuelle angemeldete E2E blieb lokal offen, weil die
  lokale Produktionskopie absichtlich kein Auth-Secret besitzt; keine
  Zugangsdaten oder Beta-Konfiguration wurden dafür zweckentfremdet.
- Status: lokal vollständig implementiert, noch nicht deployed. Keine Bilder
  hochgeladen, keine DB-/R2-Daten verändert und kein Render-/Providerjob
  gestartet.
- Nächster Schritt: Shared-Server auf eine interne direkte URL deployen,
  getrennte Secrets konfigurieren, danach PixImmo als direkte Preview gemäß
  Beta-Sicherheitsregel mit Login, DB, echtem R2-Bild, Filmstrip, Portfolio und
  `SCQ-NTX9R` prüfen. Erst nach diesem Nachweis darf Beta umgehängt werden.
- Vorsicht: Die alte `/api/video-workbench/...`-Implementierung bleibt für
  historische Demo-Routen vorhanden, ist aber nicht mehr Ziel des neuen
  Setup-Buttons. Nicht mit dem Shared-Server-Projektstore vermischen.
