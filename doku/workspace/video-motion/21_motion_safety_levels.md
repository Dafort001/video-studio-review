# Motion Safety Levels

## Zweck

Motion Safety Levels beschreiben, wie riskant eine Bewegungsart fuer
Immobilienbilder ist. Sie schuetzen Architektur, Raumlogik, Fenster, Linien,
Moebel und Vertrauen in das Objekt.

Diese Datei definiert Sicherheitsstufen fuer spaetere Motion Matching- und
Preset-Entscheidungen. Sie implementiert keine Render-Logik und blockiert keine
produktive Funktion im Code.

## Sicherheitsstufen v0.1

```text
safe
medium
experimental
micro_only
```

## safe

`safe` bedeutet: Die Bewegung ist mit normalen Immobilienbildern meistens
glaubwuerdig, wenn Crop, Dauer und Richtung sauber gewaehlt werden.

Typische technische Methoden:

- KB
- sehr leichte MX-Kombinationen ohne perspektivische Veraenderung

Typische Bewegungen:

- `push_in`
- `pull_out`
- `pan_left`
- `pan_right`
- ruhige `text_card`

Geeignet fuer:

- Hero-Shots
- medium_take
- hero_take, wenn die Bewegung sehr subtil bleibt
- Premium- und Family-Profile

Review trotzdem noetig bei:

- `narrow_space`
- `window_dominant`
- starken Spiegelungen
- sehr wenig Crop-Reserve

## medium

`medium` bedeutet: Die Bewegung kann sehr gut funktionieren, braucht aber
Motiv-, Score- und Dauerpruefung.

Typische technische Methoden:

- KB
- PX
- kontrollierte MX-Kombinationen

Typische Bewegungen:

- `tilt_up`
- `tilt_down`
- `diagonal_move`
- `parallax_float`
- `feature_focus`
- `doorway_reveal`
- `staircase_rise`

Geeignet fuer:

- short_take
- medium_take
- einzelne Hero-Shots mit guter Geometrie
- Bilder mit `deep_perspective`, `feature_object`, `strong_lines` oder
  `high_ceiling`, wenn das Risiko geprueft wurde

Review noetig bei:

- hoherem `qwen_risk_score`
- Bad, Flur, Treppe, Balkon oder starkem Fensteranteil
- Creative Direction mit ruhigem Premium-Anspruch

## experimental

`experimental` bedeutet: Die Bewegung kann visuell wertvoll sein, ist aber
sichtbar riskanter und darf nicht als Standard fuer Listingvideos behandelt
werden.

Typische technische Methoden:

- PX
- QW
- MX

Typische Bewegungen:

- `perspective_nudge`
- `orbit_hint`
- staerkerer `parallax_float`
- dynamischer `diagonal_move`
- `drone_like_lift` aus Einzelbildmaterial

Geeignet fuer:

- short_take
- einzelne Social-Hooks
- kontrollierte Tests
- Material mit niedrigerem `qwen_risk_score`

Nicht geeignet fuer:

- lange Hero-Takes
- sensible Architektur
- enge Raeume
- Bilder mit starkem Fenster-, Spiegel- oder Linienrisiko

Feature-Flag-Bezug:

- `qwen_enabled`
- `aggressive_motion_enabled`
- `experimental_transitions_enabled`

Diese Flags muessen spaeter respektiert werden.

## micro_only

`micro_only` bedeutet: Die Bewegung darf nur als sehr kurzer Eindruck genutzt
werden. Sie soll Aufmerksamkeit oder Rhythmus erzeugen, aber keine laengere
raeumliche Glaubwuerdigkeit behaupten.

Typische technische Methoden:

- QW
- MX
- sehr schnelle KB/PX-Kombination

Typische Bewegungen:

- `orbit_hint`
- `perspective_nudge`
- aggressive `diagonal_move`
- kurze `staircase_rise`
- kurzer `doorway_reveal`

Geeignet fuer:

- micro_take
- kurze Energy-Cuts
- sehr kurze Hook-Momente

Nicht geeignet fuer:

- medium_take
- hero_take
- ruhige Premium-Erzaehlung
- Bilder mit hohem `qwen_risk_score`

## Safety-Entscheidung aus Scores

Safety soll spaeter aus mehreren Hinweisen abgeleitet werden:

- `motion_potential_score`
- `qwen_risk_score`
- `text_overlay_score`
- Motivklasse
- Motiv-Eigenschaften
- Take-Dauer
- Creative Direction
- Feature Flags

Grundregel:

```text
hoher motion_potential_score + niedriger qwen_risk_score = mehr Spielraum
niedriger motion_potential_score + hoher qwen_risk_score = vorsichtig bewegen
```

## Harte Warnsignale

Diese Hinweise sollen spaeter mindestens manuelle Review ausloesen:

- `qwen_risk_score >= 70`
- `narrow_space`
- `window_dominant`
- Spiegel oder Glasflaechen
- sichtbare Personen oder private Informationen
- stark linienbasierte Architektur
- wenig Crop-Reserve
- intended duration ist `medium_take` oder `hero_take` bei experimenteller
  Bewegung

## Kein Ersatz fuer Presets

Safety Levels sind kein Preset-Katalog. Sie sagen noch nicht, welche konkrete
Bewegung mit welchen Werten gerendert wird.

Konkrete Presets entstehen erst in Session 6.

## Status

Alle Safety Levels sind `v0.1`, `draft`,
`tested_with_real_images: false` und `approved_for_production: false`.
