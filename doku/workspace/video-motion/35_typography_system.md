# Typography System v0.1

## Zweck

Diese Datei definiert das erste Typografie-System fuer moderne
Social-Property-Clips. Typografie ist hier ein Gestaltungsmittel: Sie setzt
Hook, Orientierung, Feature-Beweis und CTA, ohne die Immobilie zu verdecken
oder Expose-Saetze in ein Video zu pressen.

Session 7 erstellt eine Planungsbibliothek. Sie baut keine Webseite, kein CSS,
keine Render-Integration, keine Motion-Engine und kein Avatar-System.

## Position in der Planung

```text
Inputbilder + Objektkontext
  -> Creative Direction Layer
  -> Motivklassen + Eigenschaften
  -> Highlight Scoring
  -> Motion Families / Motion Presets
  -> Typography Presets / Typography Rules
  -> Shot Plan
  -> Transitions / Voice / Avatar
  -> Render Job
```

## Grundregel

Typografie muss in kurzen Immobilienclips sofort lesbar sein. Sie darf nicht
erklaeren, was das Bild selbst besser zeigt.

Leitlinien:

- Maximal 3-5 Woerter pro Overlay.
- Keine langen Expose-Saetze.
- Text nie auf visuell unruhige Bildbereiche.
- Textposition abhaengig vom Bildinhalt.
- Klare Akzentlogik fuer Weiss, Gelb und Schwarz.
- Typografie ist Gestaltungsmittel, nicht nur Information.

## Wortlaengen

```text
micro_text = 1-2 Woerter
short_text = 2-3 Woerter
standard_text = 3-5 Woerter
cta_text = 2-5 Woerter
subtitle_text = 3-7 Woerter, nur spaeter fuer Avatar/Voice-Kontext
```

Normale Social-Property-Overlays sollen bei `standard_text` enden. Laengere
Texte brauchen spaeter explizite Regeln fuer Untertitel oder Presenter-Segmente.

## Typografie-Presets v0.1

### hook_big_keyword

Grosser, kurzer Einstiegshook.

Gut fuer:

- erste 0-2 Sekunden
- `fast_social`
- `luxury_dynamic`
- starke Hero-Bilder

Textbeispiele als Typ, nicht als fertige Copy:

- `Licht`
- `Terrasse`
- `Cityblick`
- `Verkauft`

Risiken:

- grosses Wort verdeckt das Hauptmotiv
- falscher Claim wirkt lauter als der Bildbeweis
- unruhiger Hintergrund macht den Hook billig

### location_label

Kurzer Orts- oder Lagehinweis.

Gut fuer:

- View
- Exterior
- Eingang
- ruhige Establishing-Shots

Risiken:

- zu genaue Adresse oder private Lageinformation
- Text liegt ueber Fenstern, Schildern oder Hausnummern
- Lageclaim ist im Bild nicht nachvollziehbar

### room_label

Knappe Raumorientierung.

Gut fuer:

- Wohnzimmer
- Kueche
- Schlafzimmer
- Bad
- Homeoffice

Risiken:

- wirkt wie ein technischer Grundriss statt wie Social Content
- redundanter Text, wenn der Raum sofort klar ist
- zu viele Labels in Folge machen den Clip trocken

### feature_badge

Kurzer Ausstattungs- oder Verkaufsargument-Badge.

Gut fuer:

- Kamin
- Dachterrasse
- Einbaukueche
- Garten
- Blick
- Materialdetail

Risiken:

- Feature ist zu klein oder nicht sichtbar
- Badge verdeckt genau das Feature
- Text behauptet mehr als das Bild belegt

### price_or_status_tag

Preis-, Status- oder Angebotsmarkierung.

Gut fuer:

- `Neu`
- `Reserviert`
- `Verkauft`
- `Coming soon`

Risiken:

- rechtlich oder organisatorisch falscher Status
- Preis-/Statusinfo ist nicht freigegeben
- Tag bleibt zu lange stehen und wirkt wie Werbung statt Objektvideo

### sold_stamp

Kurzer, sichtbarer Verkaufsnachweis.

Gut fuer:

- `sold_showcase`
- Makler-Referenzclips
- Branding-Enden

Risiken:

- dominiert die Immobilie
- wirkt triumphal, wenn das Bild selbst schwach ist
- verdeckt Fassade, Garten oder wichtiges Detail

### new_listing_tag

Kurzer Hinweis auf neues Angebot.

Gut fuer:

- erste Sekunden in Feed-Clips
- Social Teaser
- ruhigere Hero-Shots mit klarer Textzone

Risiken:

- zu generisch, wenn kein Objektwert folgt
- konkurriert mit starkem Hero-Hook
- wird als Produktkategorie statt als Video-Akzent benutzt

### cta_card

Abschlusskarte oder ruhiger CTA-Moment.

Gut fuer:

- letzte 2-4 Sekunden
- Kontaktaufforderung
- Besichtigungshinweis
- Branding

Risiken:

- zu viel Kontakttext
- zu frueh im Video
- Hintergrund ist nicht ruhig genug fuer Lesbarkeit

### agent_lower_third

Kompakte Makler-/Agenturkennung im unteren Bildbereich.

Gut fuer:

- `agent_branding`
- Presenter- oder Markenclips
- ruhige Interior- oder Exterior-Hintergruende

Risiken:

- verdeckt Nutzflaeche, Moebel oder Gartenkante
- wirkt wie Nachrichtengrafik statt Immobilienclip
- Logo/Name ist zu klein oder zu dominant

### avatar_subtitle

Kurzer Untertitel fuer spaetere Avatar- oder Presenter-Segmente.

Gut fuer:

- spaetere Session 9/10
- kurze Voiceover- oder Avatar-Zeilen
- Verstaendlichkeit ohne Ton

Risiken:

- wird vor Avatar-/Script-Regeln als allgemeiner Fliesstext missbraucht
- zu lange Zeilen blockieren das Objektbild
- Untertitel konkurriert mit CTA oder Feature-Badges

## Akzentlogik

### Weiss

Default fuer klare, ruhige Lesbarkeit.

Gut fuer:

- dunklere oder mittlere Bildbereiche
- Premium- und Architekturprofile
- ruhige Room Labels

Nicht gut fuer:

- helle Fenster
- weisse Waende
- ueberbelichtete Himmel

### Gelb

Akzentfarbe fuer kurze Hooks, Status und Aufmerksamkeit.

Gut fuer:

- ein einzelnes Keyword
- kurze Feature-Badges
- Social-Hook
- `new_listing_tag`

Nicht gut fuer:

- lange Texte
- mehrere gleichzeitige Akzente
- sehr warme Innenraeume, wenn Gelb billig wirkt

### Schwarz

Kontrast- und Blockfarbe, sparsam nutzen.

Gut fuer:

- ruhige CTA-Karten
- kleine Label-Hintergruende
- helle Bilder mit genug Randzone

Nicht gut fuer:

- grosse Flaechen ueber Immobilienbildern
- Premium-Hero-Shots, wenn der Block zu schwer wirkt
- Text, der wie Warnhinweis aussieht

## Platzierungslogik

Textposition ist eine Entscheidung aus Bildinhalt, nicht aus Template-Gewohnheit.

Pruefe vor jeder Platzierung:

- Wo ist das Hauptmotiv?
- Wo sind Fenster, Tueren, Blickachsen und wichtige Linien?
- Gibt es eine ruhige Negativflaeche?
- Wird ein Feature verdeckt?
- Ist der Text auf Mobile lesbar?
- Bleibt genug Rand fuer Reels, Stories und Feed-Crops?

Empfohlene Zonen:

- `top_left`: Location, kurzer Hook, wenn Himmel/Wand ruhig ist.
- `top_right`: Status-Tag oder kleines Badge, wenn kein Fenster dominiert.
- `center`: nur fuer sehr kurze Hooks oder Sold-Stamps.
- `bottom_left`: Room Label, Agent Lower Third, ruhige Orientierung.
- `bottom_right`: Feature Badge, wenn die linke Seite das Motiv traegt.
- `full_card`: CTA, Branding oder kurze Textkarte, nicht fuer normale Raumshots.

## Beziehung zu Motion Presets

Session 6 hat `text_overlay_allowed` nur als Planungsflag definiert. Dieses
Feld bedeutet nicht, dass Text automatisch gesetzt werden soll.

Typografie darf nur auf Motion Presets gelegt werden, wenn:

- `text_overlay_allowed` wahr ist,
- das Bild einen passenden `text_overlay_score` hat,
- die gewaehlte Zone ruhig genug ist,
- die Bewegung nicht gegen Lesbarkeit arbeitet,
- der Text in 3-5 Woertern oder weniger funktioniert.

## Beziehung zu Avatar/Presenter

`avatar_subtitle` und `agent_lower_third` sind nur strukturelle Vorbereitung.
Avatar-, Presenter-, Script- und Voice-Regeln kommen spaeter. In Session 7 wird
kein Avatar aktiviert und kein Untertitel-Renderer gebaut.

## Was Session 7 nicht macht

- Keine API-Integration.
- Keine Webseite.
- Keine Render-Integration.
- Keine CSS- oder Font-Implementierung.
- Keine Animation-Implementierung.
- Keine Transition Library.
- Keine Avatar Library.
- Keine Product Templates.
- Keine spaeteren Sessions.

## Maschinenlesbare Dateien

```text
config/video-motion/typography_presets.v01.json
config/video-motion/typography_rules.v01.json
```

Diese JSON-Dateien sind v0.1, `draft`, nicht mit echten Bildern getestet und
nicht fuer Produktion freigegeben.
