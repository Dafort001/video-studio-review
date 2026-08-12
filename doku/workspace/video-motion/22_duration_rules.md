# Duration Rules

## Zweck

Dauerregeln verbinden Take-Laenge, Bewegungsenergie und visuelle
Glaubwuerdigkeit. Ein kurzer Take darf mehr Energie haben als ein langer
Hero-Shot. Ein langer Take muss Raum, Linien, Fenster und Moebel stabil halten.

Diese Datei definiert die v0.1-Dauerlogik fuer spaetere Shot-Plan- und
Motion-Preset-Entscheidungen. Sie erstellt keine konkreten Presets.

## Take-Laengen v0.1

```text
micro_take  = 0.3-0.8s
short_take  = 0.8-1.5s
medium_take = 1.5-3.0s
hero_take   = 3.0-5.0s
```

## Grundregel

Je kuerzer der Take, desto mehr Bewegungsenergie und experimentelle Freiheit
ist erlaubt.

Je laenger der Take, desto wichtiger sind:

- stabile Raumgeometrie
- stabile Fenster und Tueren
- glaubwuerdige Moebel
- ruhige Linienfuehrung
- natuerliche Lichtlogik
- genug Zeit fuer den Betrachter, den Raum zu verstehen

## micro_take

Dauer:

```text
0.3-0.8s
```

Funktion:

- Hook
- Energy-Cut
- Rhythmus
- kurzer Feature-Beweis
- visuelle Pointe

Geeignete Safety Levels:

- `safe`
- `medium`
- `experimental`
- `micro_only`

Geeignete Motion Families:

- `diagonal_move`
- `feature_focus`
- `perspective_nudge`
- `orbit_hint`
- `doorway_reveal`
- `staircase_rise`
- schnelle `text_card`

Risiko:

- darf nicht zu viele Informationen tragen
- darf keine Raumwahrheit behaupten, die das Bild nicht halten kann
- bei Qwen-/MX-Eindruck muss der Take kurz genug bleiben

## short_take

Dauer:

```text
0.8-1.5s
```

Funktion:

- kurzer Raum- oder Feature-Shot
- Social-Pacing
- Uebergang zwischen Hero-Momenten
- Detail- oder Outdoor-Moment

Geeignete Safety Levels:

- `safe`
- `medium`
- vorsichtig `experimental`

Geeignete Motion Families:

- `push_in`
- `pull_out`
- `pan_left`
- `pan_right`
- `tilt_up`
- `tilt_down`
- `diagonal_move`
- `feature_focus`
- `doorway_reveal`
- `text_card`

Risiko:

- experimentelle Bewegung muss sichtbar kontrolliert bleiben
- Text darf nicht zu lang sein
- Fenster- und Linienrisiken brauchen Review

## medium_take

Dauer:

```text
1.5-3.0s
```

Funktion:

- lesbarer Raum-Shot
- ruhiger Hero-Nebenmoment
- Premium- oder Architekturfluss
- klares Verkaufsargument

Geeignete Safety Levels:

- `safe`
- kontrolliert `medium`

Geeignete Motion Families:

- `push_in`
- `pull_out`
- `pan_left`
- `pan_right`
- leichte `tilt_up`
- leichte `tilt_down`
- subtiler `parallax_float`
- ruhiger `feature_focus`
- ruhige `text_card`

Risiko:

- Qwen-/Perspective-Effekte werden schnell sichtbar falsch
- enge Raeume brauchen sehr subtile Bewegung
- starke Linien und Fenster muessen stabil bleiben

## hero_take

Dauer:

```text
3.0-5.0s
```

Funktion:

- Hauptbild des Clips
- emotionaler oder architektonischer Anker
- Aussicht, Garten, Terrasse, Open Plan oder Premium-Raum
- ruhiger Einstieg oder Abschluss

Geeignete Safety Levels:

- `safe`
- nur sehr vorsichtig `medium`

Geeignete Motion Families:

- langsamer `push_in`
- langsamer `pull_out`
- sehr ruhiger `pan_left`
- sehr ruhiger `pan_right`
- minimaler `parallax_float`, falls sauber
- ruhige `text_card`

Risiko:

- lange Takes verzeihen keine geometrischen Fehler
- aggressive Bewegung wirkt schnell billig
- experimentelle Qwen-/MX-Bewegung ist fuer hero_take in v0.1 nicht
  empfohlen

## Dauer und Creative Direction

Creative Direction beeinflusst die Dauerlogik:

- `fast_social`: mehr micro_take und short_take
- `calm_premium`: mehr medium_take und hero_take
- `editorial_architecture`: kontrollierte short_take und medium_take
- `luxury_dynamic`: kurze Energie plus einzelne ruhige Hero-Takes
- `family_home_warm`: medium_take fuer Wohnlichkeit
- `new_build_clean`: ruhige klare Takes, wenig Risiko
- `sold_showcase`: kurze Text- und Beweis-Takes
- `agent_branding`: ruhigere Avatar-/Branding-Hintergruende

## Dauer und Risikowerte

Wenn `qwen_risk_score` hoch ist, muss die erlaubte Dauer sinken:

```text
qwen_risk_score >= 70 -> experimental nur micro_take oder vermeiden
qwen_risk_score >= 85 -> QW/MX vermeiden, safe KB oder static hold pruefen
```

Wenn `motion_potential_score` niedrig ist, soll Bewegung reduziert werden:

```text
motion_potential_score <= 40 -> nur safe, kurzer Take oder statischer Hold
motion_potential_score <= 25 -> ignore oder manuelle Review pruefen
```

## Dauer und Text

Text braucht Zeit. Ein `micro_take` eignet sich nur fuer sehr kurze Hook-Worte
oder reine visuelle Textkarten. Normale Lesetexte gehoeren eher in
`short_take`, `medium_take` oder ruhige `text_card`-Momente.

Typografie wird erst in einer spaeteren Session definiert.

## Status

Alle Dauerregeln sind `v0.1`, `draft`,
`tested_with_real_images: false` und `approved_for_production: false`.
