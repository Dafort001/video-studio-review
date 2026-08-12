# Transition Library v0.1

## Zweck

Diese Datei definiert die erste Transition Library fuer moderne
Social-Property-Clips. Transitions verbinden Shots rhythmisch und inhaltlich,
ohne die Immobilie zur Effektshow zu machen.

Session 8 erstellt eine Planungsbibliothek. Sie baut keine API-Integration,
keine Webseite, keine Render-Integration, keine Avatar Library, keine
Product Templates und keine Script- oder Voice-Regeln.

## Position in der Planung

```text
Inputbilder + Objektkontext
  -> Creative Direction Layer
  -> Motivklassen + Eigenschaften
  -> Highlight Scoring
  -> Motion Families / Motion Presets
  -> Typography Presets / Typography Rules
  -> Transition Presets / Transition Rules
  -> Shot Plan
  -> Render Job
```

## Grundregel

Transitions sind Entscheidungen aus Bildfolge, Rhythmus, Motivlogik und
Creative Direction. Sie duerfen nicht zufaellig eingesetzt werden.

Leitlinien:

- Harte Schnitte sind der Standard, wenn keine klare Transition-Idee vorliegt.
- Starke Transitions muessen selten bleiben.
- Eine Transition muss die Shot-Folge erklaeren oder Energie setzen.
- Architektur, Fenster, Tueren und Raumlinien duerfen nicht unglaubwuerdig
  werden.
- Textbasierte Transitions duerfen nur kurze, bereits erlaubte Textmomente
  nutzen.
- Experimentelle Transitions bleiben hinter `experimental_transitions_enabled`.

## Transition-Presets v0.1

### hard_cut

Direkter Schnitt ohne sichtbaren Effekt.

Gut fuer:

- normale Shot-Folgen
- Premium- und Architekturclips
- Wechsel zwischen ruhigen Hero- oder Medium-Takes
- Situationen ohne klare Motivbruecke

Risiken:

- kann bei zu vielen aehnlichen Bildern trocken wirken
- braucht rhythmische Shot-Auswahl
- laute Musik kann mehr visuelle Energie verlangen

### match_cut

Schnitt ueber aehnliche Linien, Farben, Formen, Blickrichtungen oder
Kompositionen.

Gut fuer:

- Architekturachsen
- Fenster-zu-Fenster
- Kuechenzeile zu Regal oder Tischkante
- Aussenlinie zu Innenlinie

Risiken:

- wirkt zufaellig, wenn die Formbruecke nicht sichtbar ist
- braucht bewusste Bildreihenfolge
- schlechte Bildausrichtung macht den Effekt unklar

### push_transition

Ein gerichteter Push verbindet zwei Shots. Der Wechsel fuehlt sich wie
Vorwaertsbewegung an.

Gut fuer:

- Aussen zu Innen
- Eingang zu Raum
- Flur zu Wohnbereich
- schnelle, aber lesbare Social-Folgen

Risiken:

- zu haeufige Pushes wirken billig
- enge Raeume koennen klaustrophobisch werden
- Richtung muss zur Bildfolge passen

### whip_blur

Sehr kurzer Bewegungs- oder Blur-Impuls zwischen Shots.

Gut fuer:

- schnelle Social-Impulse
- micro_take- oder short_take-Folgen
- Detail zu naechstem Detail
- kurze Energie vor einem ruhigen Hero-Shot

Risiken:

- sparsam einsetzen
- kann hochwertige Immobilienclips schnell billig machen
- schlecht bei Text, Avatar, CTA oder ruhiger Premium-Erzaehlung

### zoom_through

Kurzer Zoom-Impuls durch einen Bildbereich in den naechsten Shot.

Gut fuer:

- Hook- oder Energy-Momente
- Detail zu Raum
- Fenster, Durchgang, Feature-Objekt oder Blickachse
- `fast_social` und vorsichtig `luxury_dynamic`

Risiken:

- darf keine falsche Raumwahrheit behaupten
- kann bei starken Linien, Spiegeln oder Fenstern brechen
- braucht Review bei QW-/MX-naher Wirkung

### doorway_cut

Transition fuer Wege durch Tuer, Eingang, Flur oder Raumachse.

Gut fuer:

- Flur/Tuer zu Raum
- Eingang zu Wohnbereich
- Treppe zu Obergeschoss
- Raumabfolge mit echter Objektlogik

Risiken:

- braucht sichtbare Tuer-, Flur- oder Achsenlogik
- ungeeignet fuer zufaellige Raumwechsel
- enge, dunkle Flure koennen unruhig wirken

### window_cut

Transition ueber Fenster, Aussicht, Lichtflaeche oder Blickbezug.

Gut fuer:

- Innen zu Aussicht
- Raum mit Fenster zu Balkon/Terrasse
- View-Shots
- Licht- und Stimmungswechsel

Risiken:

- ueberbelichtete Fenster koennen hart flackern
- Datenschutz und Nachbarschaftsdetails brauchen spaeter Review
- nicht fuer beliebige helle Flaechen missbrauchen

### text_wipe

Kurzer Text- oder Grafik-Wipe als rhythmischer Uebergang.

Gut fuer:

- sehr kurze Hook-Worte
- Status- oder Location-Momente
- Segmentwechsel in schnellen Social-Clips
- spaetere Verbindung mit Typography Rules

Risiken:

- keine langen Texte
- darf nicht zur allgemeinen Textanimation werden
- braucht ruhige Lesbarkeit und darf das Objekt nicht verdecken

### light_flash

Kurzer Licht- oder Helligkeitsimpuls zwischen Shots.

Gut fuer:

- helle Fenster- oder Sonnenmomente
- Aussen/Innen-Wechsel mit Lichtlogik
- kurzer Energieakzent vor einem neuen Abschnitt

Risiken:

- kann wie ein generischer Effekt wirken
- nicht bei dunklen Premium-Momenten erzwingen
- braucht spaeter sensible Helligkeitsgrenzen

### speed_ramp_fake

Geplanter Eindruck einer Beschleunigung oder Verlangsamung, ohne echte
Kamerafahrt zu behaupten.

Gut fuer:

- schnelle Social-Passagen
- Rhythmusbruecken zwischen micro_take und short_take
- Energie vor einem Feature- oder Hero-Shot

Risiken:

- experimental, sparsam und reviewpflichtig
- ungeeignet fuer ruhige Premium- oder Architekturpassagen
- darf keine falsche Bewegung durch reale Raeume suggerieren

## Regelanker aus dem Masterplan

- Uebergaenge nicht zufaellig einsetzen.
- Flur/Tuer zu Raum: `doorway_cut`.
- Fenster/Aussicht: `window_cut`.
- Aussen zu Innen: `push_transition`.
- Schnelle Social-Impulse: `whip_blur` oder `zoom_through`, aber sparsam.

## JSON-Quellen

Die maschinenlesbaren Presets liegen in:

```text
config/video-motion/transition_presets.v01.json
```

Die Regeln liegen in:

```text
config/video-motion/transition_rules.v01.json
```

## Status

Alle Transition-Presets und Regeln sind `v0.1`, `draft`,
`tested_with_real_images: false` und `approved_for_production: false`.

