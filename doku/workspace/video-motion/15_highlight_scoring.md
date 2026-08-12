# Highlight Scoring

## Zweck

Highlight Scoring bewertet jedes einzelne Immobilienbild fuer seine moegliche
Rolle im Video. Motif Tagging sagt, was auf dem Bild sichtbar ist. Highlight
Scoring sagt, wie stark dieses Bild fuer bestimmte Videoentscheidungen ist.

Diese Datei erstellt keine API, keine automatische Bilderkennung, keine
Motion-Presets und keine Render-Logik. Sie definiert nur die v0.1-Scoring-
Begriffe und erste Entscheidungsregeln.

## Position in der Planung

```text
Inputbilder + Objektkontext
  -> Creative Direction Layer
  -> Motivklassen + Eigenschaften
  -> Highlight Scoring
  -> Shot Plan
  -> Motion Families / Presets
  -> Typography / Voice / Avatar
  -> Render Job
```

Highlight Scoring liegt nach Motivklassen und vor Shot Plan. Es darf
Vorschlaege machen, aber keine finale Schnittentscheidung erzwingen.

## Score-Skala

Alle Scores nutzen in v0.1 dieselbe Skala:

```text
0   = nicht geeignet oder nicht sichtbar
25  = schwach
50  = mittel
75  = stark
100 = sehr stark
```

Scores sind Planungswerte, keine Produktionsfreigabe. Ein hoher Score kann
weiterhin manuelle Review brauchen, wenn Bildqualitaet, Geometrie,
Fensterdominanz, Branding oder Datenschutz riskant sind.

## Scoring-Felder v0.1

### hero_score

Bewertet, ob ein Bild das Video tragen kann.

Starke Hinweise:

- klare erste Wirkung
- starke Raumwirkung
- gutes Licht
- Aussicht, Garten, Terrasse oder hochwertiger Hauptraum
- geringe visuelle Stoerung

Typische Hero-Kandidaten:

- `open_plan`
- `living`
- `exterior`
- `terrace`
- `garden`
- `view`
- sehr starke `kitchen`

### luxury_score

Bewertet, ob das Bild glaubwuerdig Premium- oder Luxuswirkung traegt.

Starke Hinweise:

- hochwertige Materialien
- klare Architektur
- besondere Ausstattung
- grosse Flaechen oder starke Lage
- reduzierte, saubere Bildwirkung

Wichtig: Luxus darf nicht aus Preisannahmen abgeleitet werden. Das Bild muss
die Wirkung sichtbar tragen.

### spatial_depth_score

Bewertet Tiefe, Raumachsen und raeumliche Lesbarkeit.

Starke Hinweise:

- `deep_perspective`
- offene Raumzonen
- klare Fluchtlinien
- Blick durch mehrere Bereiche
- Terrasse/Garten/View mit sichtbarer Tiefe

Niedriger Score bei engen, flachen oder unklar geschnittenen Bildern.

### light_quality_score

Bewertet, ob Licht als Bildwert funktioniert.

Starke Hinweise:

- `bright`
- angenehmes Tageslicht
- sichtbarer Sonnen- oder Abendlichtcharakter
- gleichmaessige Belichtung
- Fenster ohne problematische Ueberstrahlung

Ein helles, aber ausgebranntes Fenster soll nicht automatisch hoch bewertet
werden.

### feature_score

Bewertet, ob ein konkretes Verkaufsargument sichtbar ist.

Starke Hinweise:

- `feature_object`
- Kamin, Kochinsel, Badewanne, Design-Treppe, Sauna
- Garten, Terrasse, Aussicht oder besondere Fassade
- Material- oder Ausstattungsbeweis

Dieser Score hilft spaeter, kurze Detail- oder Beweis-Shots zu finden.

### social_hook_score

Bewertet, ob ein Bild schnell Aufmerksamkeit erzeugen kann.

Starke Hinweise:

- sofort lesbares Motiv
- starke Linien, Tiefe oder Kontrast
- Outdoor-/View-/Feature-Moment
- gute Crop-Faehigkeit fuer mobile Formate
- kurze visuelle Pointe

Dieser Score ist nicht dasselbe wie `hero_score`. Ein Detail kann einen hohen
Social-Hook haben, ohne ein guter Hero-Shot zu sein.

### text_overlay_score

Bewertet, ob kurze Typografie auf dem Bild funktionieren kann.

Starke Hinweise:

- ruhige Flaeche
- klare Kontrastzone
- nicht zu viele konkurrierende Bildbereiche
- Text kann Hauptmotiv respektieren
- keine wichtigen Details im erwarteten Textbereich

Niedriger Score bei starken Mustern, Fensterdominanz, Spiegeln, Gesichtern,
Logos oder sehr unruhigen Details.

### motion_potential_score

Bewertet, wie gut sich das Bild spaeter bewegen laesst.

Starke Hinweise:

- stabile Linien
- genug Crop-Reserve
- erkennbare Tiefe
- klares Hauptmotiv
- keine heiklen Fenster-, Spiegel- oder Moebelverzerrungen

Dieser Score sagt noch nicht, welche Motion Family passt. Das kommt erst in
spaeteren Sessions.

### avatar_background_score

Bewertet, ob das Bild als ruhiger Hintergrund fuer Presenter oder Avatar
funktionieren kann.

Starke Hinweise:

- ruhige Bildbereiche
- nicht zu starke Bewegungs- oder Detaildominanz
- gute Lichtwirkung
- erkennbare Immobilie bleibt sichtbar
- keine empfindlichen privaten Informationen

Ein hoher Avatar-Background-Score bedeutet nicht, dass Avatar genutzt werden
soll. Die Creative Direction und Feature Flags entscheiden weiterhin, ob Avatar
ueberhaupt erlaubt ist.

### qwen_risk_score

Bewertet das Risiko fuer Qwen-/Multi-Angle- oder andere perspektivische
Experimente.

Starke Risiko-Hinweise:

- `window_dominant`
- `narrow_space`
- Spiegel
- Badarmaturen und Fugen
- starke Linien mit wenig Fehlertoleranz
- Personen, Logos oder sensible Details
- lange Takes

Bei diesem Feld ist hoch schlecht: Ein hoher `qwen_risk_score` bedeutet, dass
Qwen oder aggressive Perspektivbewegung spaeter vermieden oder nur in sehr
kurzen Takes getestet werden sollte.

## Zielentscheidungen

Session 4 definiert erste Entscheidungsziele. Diese Entscheidungen bleiben
unverbindliche Planungsresultate.

### Hero-Shot

Ein Bild ist Hero-Kandidat, wenn es stark genug ist, laenger im Video zu
stehen.

Typische Hinweise:

- hoher `hero_score`
- hoher `light_quality_score` oder `spatial_depth_score`
- niedriger bis mittlerer `qwen_risk_score`
- kein `ignore_candidate`

### Kurzer Energy-Cut

Ein Bild ist Energy-Cut-Kandidat, wenn es schnell wirkt, aber nicht unbedingt
lange tragen muss.

Typische Hinweise:

- hoher `social_hook_score`
- mittlerer bis hoher `feature_score`
- Detail, Treppe, Eingang, Kueche, Balkon oder Materialmoment
- Bewegung nur kurz und kontrolliert

### Textgeeignet

Ein Bild eignet sich fuer Text, wenn es lesbare Zonen und genug visuelle Ruhe
bietet.

Typische Hinweise:

- hoher `text_overlay_score`
- keine zentrale Stoerung im Textbereich
- keine wichtige Bildinformation wird ueberdeckt

### Avatar-/Presenter-Hintergrund

Ein Bild eignet sich als Avatar-Hintergrund, wenn es ruhig, glaubwuerdig und
nicht zu detaildominant ist.

Typische Hinweise:

- hoher `avatar_background_score`
- mittlerer bis hoher `light_quality_score`
- niedriger bis mittlerer `social_hook_score`
- genug Raum fuer Overlay, ohne das Objekt zu verlieren

### Vorsichtig bewegen oder vermeiden

Ein Bild sollte nur vorsichtig bewegt werden, wenn Geometrie, Fenster,
Spiegelungen oder Raumenge riskant sind.

Typische Hinweise:

- hoher `qwen_risk_score`
- `narrow_space`
- `window_dominant`
- Bad, Flur, Treppe oder stark linienbasierte Architektur
- lange Takes waeren geometrisch auffaellig

## Beziehung zu Creative Direction

Creative Direction bestimmt, welche Scores wichtiger sind. Ein
`fast_social`-Profil darf `social_hook_score` staerker gewichten. Ein
`calm_premium`-Profil soll `hero_score`, `luxury_score`, `light_quality_score`
und niedrige Risikowerte hoeher achten.

Die Regeln in `highlight_scoring_rules.v01.json` sind deshalb keine
vollstaendige Produktentscheidung, sondern ein gemeinsames Vokabular fuer
spaetere Profil- und Shot-Plan-Logik.

## Beziehung zu spaeteren Sessions

Session 5 wird Bewegungsfamilien und Sicherheitsstufen definieren. Session 6
wird konkrete Motion-Presets bauen. Highlight Scoring darf diese Schritte nicht
vorwegnehmen.

## Status

Alle Scoring-Regeln sind `v0.1`, `draft`,
`tested_with_real_images: false` und `approved_for_production: false`, bis sie
mit echten Immobilienbildern geprueft wurden.
