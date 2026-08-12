# Motif Tagging Schema

## Zweck

Das Motif Tagging Schema beschreibt, wie ein einzelnes Bild fuer die
Video-Motion-Library beschrieben werden soll. Es ist ein Planungsvertrag fuer
spaetere manuelle, halbautomatische oder modellgestuetzte Tagging-Schritte.

Diese Session erstellt keine API, keine UI, keine Bilderkennung und keine
Render-Integration.

## Grundprinzip

Jedes Bild bekommt:

- eine primaere Motivklasse
- optionale sekundaere Motivklassen
- optionale Eigenschaften
- eine grobe Vertrauensangabe
- Hinweise zu visuellen Risiken
- Hinweise zu moeglichen Video-Rollen

Das Tagging soll genug Struktur liefern, damit spaetere Sessions Highlight
Scoring, Shot Planning, Motion-Auswahl und Typografie darauf aufbauen koennen.

## Minimales Tagging-Objekt

```json
{
  "asset_id": "example-image-001",
  "primary_motif_class": "living",
  "secondary_motif_classes": ["open_plan", "view"],
  "motif_properties": ["bright", "deep_perspective", "window_dominant"],
  "tagging_confidence": "medium",
  "manual_review_required": true,
  "visual_risk_notes": ["large window area may be overexposed"],
  "suggested_video_roles": ["hero_candidate", "text_anchor_candidate"],
  "notes": "Strong main room, but view detail should be checked manually."
}
```

## Felder

### asset_id

Technische Referenz auf das Bild oder spaetere Asset. Dieses Feld ist nur ein
Identifier und enthaelt keine URL- oder Storage-Logik.

### primary_motif_class

Genau eine Motivklasse aus `motif_classes.v01.json`.

Die primaere Klasse beschreibt, wofuer das Bild im Video hauptsaechlich steht.
Bei einem offenen Wohn-/Ess-/Kuechenbereich soll `open_plan` gesetzt werden,
wenn die Offenheit staerker ist als eine einzelne Funktion.

### secondary_motif_classes

Liste weiterer sichtbarer Motivklassen. Dieses Feld darf leer sein.

Beispiele:

- `living` mit `view`
- `kitchen` mit `dining`
- `terrace` mit `garden`
- `entrance` mit `exterior`

### motif_properties

Liste sichtbarer Eigenschaften aus `motif_classes.v01.json`.

Eigenschaften duerfen sich auf Komposition, Licht, Raumwirkung, Stimmung oder
Ausstattung beziehen.

### tagging_confidence

Erlaubte Werte:

```text
low
medium
high
manual
```

`manual` bedeutet, dass die Einordnung bewusst von einem Menschen getroffen
wurde. Es bedeutet nicht automatisch, dass sie wahrer ist als `high`, aber sie
ist fuer spaetere Review-Flows wichtig.

### manual_review_required

Boolean. `true`, wenn das Bild fuer spaetere Entscheidungen unsicher ist oder
wenn ein riskantes Motiv vorkommt.

Typische Gruende:

- unklare Raumfunktion
- sehr enge Geometrie
- starke Spiegelungen
- Fensterdominanz
- Branding- oder Textlesbarkeit
- moeglicher Qwen- oder Motion-Risikofall

### visual_risk_notes

Freitext-Liste fuer kurze Hinweise. Diese Hinweise sollen spaeter nicht blind
gerendert, sondern in Scoring und manuelle Review-Flows eingespeist werden.

### suggested_video_roles

Erste unverbindliche Rolle fuer spaetere Sessions. Erlaubte v0.1-Werte:

```text
hero_candidate
rhythm_candidate
transition_candidate
text_anchor_candidate
avatar_background_candidate
detail_candidate
cta_candidate
ignore_candidate
```

Diese Rollen ersetzen nicht das spaetere Highlight-Scoring. Sie sind nur eine
fruehe Notiz aus dem Motiv-Tagging.

### notes

Kurzer optionaler Freitext fuer Beobachtungen, die nicht sauber in eine Klasse
oder Eigenschaft passen.

## Validierungsregeln v0.1

- `primary_motif_class` muss aus der aktuellen Motivklassenliste kommen.
- `secondary_motif_classes` darf keine Duplikate enthalten.
- `secondary_motif_classes` soll die primaere Klasse nicht wiederholen.
- `motif_properties` darf keine Duplikate enthalten.
- `tagging_confidence` muss einer der definierten Werte sein.
- `manual_review_required` muss ein Boolean sein.
- `visual_risk_notes` und `notes` duerfen keine produktiven Secrets,
  Presign-URLs oder Kundendaten enthalten.

## Beziehung zu Creative Direction

Creative Direction entscheidet, welche Erzaehlung ein Objekt braucht. Motif
Tagging beschreibt, was einzelne Bilder sichtbar anbieten.

Beispiel:

- Creative Profile: `family_home_warm`
- Bild-Tagging: `garden`, Eigenschaften `outdoor`, `cozy`, `bright`
- Spaetere Interpretation: moeglicher Hero- oder emotionaler Abschluss-Shot

Das Tagging darf die Creative Direction informieren, aber nicht ersetzen.

## Beziehung zu spaeterem Scoring

Session 4 wird die Bewertung pro Bild definieren. Dieses Schema bereitet nur
die Felder vor, damit spaetere Scores wie `hero_score`,
`motion_potential_score`, `text_overlay_score` oder `qwen_risk_score` sinnvoll
berechnet oder manuell gesetzt werden koennen.

## Status

Dieses Schema ist `v0.1`, `draft` und nicht production-approved. Es wurde noch
nicht mit echten Immobilienbildern getestet.
