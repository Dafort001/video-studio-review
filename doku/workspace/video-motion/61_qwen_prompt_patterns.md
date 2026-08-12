# Qwen Prompt Patterns v0.1

## Zweck

Diese Datei definiert erste Prompt-Muster fuer Qwen-Perspektiv- und
Multi-Angle-Tests. Sie ist kein Provider-Adapter, keine API-Anleitung und keine
produktive Prompt-Engine.

Session 14 beschreibt nur testbare Muster, damit echte Bildtests spaeter
vergleichbar ausgewertet werden koennen.

## Prompt-Prinzipien

Jeder Qwen-Testprompt muss zwei Dinge gleichzeitig tun:

- eine kleine, moderne Bewegungsidee erzeugen,
- Immobilienwahrheit schuetzen.

Positive Prompts muessen knapp bleiben. Negative Prompts sind Pflicht, weil
Qwen-Perspektivbewegungen sonst leicht neue Property-Fakten erfinden.

## Gemeinsame Schutzformel

Jedes Prompt-Muster soll sinngemaess diese Schutzregeln enthalten:

```text
Preserve the exact room layout, walls, windows, doors, furniture, fixtures,
materials, facade proportions, view, and lighting logic. Do not invent new
objects, rooms, openings, reflections, landscape, or architectural details.
Keep the motion subtle and suitable for a short real-estate social clip.
```

## Prompt-Muster

### tiny_perspective_nudge

Ziel: Ein sehr kleiner Blickwinkelimpuls fuer Micro-Takes.

Geeignet fuer:

- `universal_micro_perspective_pop`
- `detail_perspective_nudge_micro`
- `bathroom_micro_perspective_clean`

Prompt-Kern:

```text
Create a tiny perspective nudge around the main feature, as if the camera
shifted only a few centimeters. Keep all architecture and property facts
unchanged.
```

Negativ-Kern:

```text
No changed window frames, no warped walls, no new furniture, no changed
fixtures, no invented view, no synthetic room expansion.
```

### exterior_micro_lift

Ziel: Sehr kurzer Lift-Eindruck bei Aussenmotiven.

Geeignet fuer:

- `exterior_drone_hint_micro`

Prompt-Kern:

```text
Suggest a very small upward viewpoint shift on the exterior, like a subtle
micro-lift, while preserving the exact facade, roofline, garden, street, and
surroundings.
```

Negativ-Kern:

```text
No invented drone altitude, no changed facade proportions, no new neighboring
buildings, no altered roofline, no changed landscape.
```

### counter_or_feature_orbit

Ziel: Kurzer Orbit-Hinweis um Kuecheninsel, Detail oder klares Feature.

Geeignet fuer:

- `open_plan_micro_orbit_counter`
- `kitchen_detail_micro_orbit`

Prompt-Kern:

```text
Create a subtle micro-orbit around the main counter or feature object. Keep the
room geometry, appliances, cabinet lines, windows, and materials unchanged.
```

Negativ-Kern:

```text
No bent counter edges, no shifted appliances, no changed cabinet layout, no
invented decor, no unstable window or reflection.
```

### kitchen_short_perspective

Ziel: Etwas laengerer, aber noch kurzer Perspektivtest fuer Kuechen.

Geeignet fuer:

- `kitchen_perspective_nudge_short`

Prompt-Kern:

```text
Create a controlled short perspective nudge that gives the kitchen a modern
social-video energy while preserving straight cabinet lines, counters,
appliances, windows, and room scale.
```

Negativ-Kern:

```text
No warped cabinetry, no moving appliance positions, no changed backsplash, no
fake depth extension, no invented fixtures.
```

### staircase_micro_orbit

Ziel: Sehr kurzer Energie-Moment bei Treppe oder hoher Achse.

Geeignet fuer:

- `staircase_micro_orbit`

Prompt-Kern:

```text
Create a very subtle micro-orbit that emphasizes the staircase height or line
direction without changing steps, railings, walls, or landings.
```

Negativ-Kern:

```text
No warped railings, no changed step count, no moving wall edges, no invented
landing, no unsafe or impossible geometry.
```

## Dauerregeln

Alle Prompt-Muster muessen in drei Dauerfenstern bewertet werden:

```text
0.5s = darf dynamischer sein, Artefakte aber nicht sichtbar dominant.
1.5s = muss glaubwuerdig genug fuer Social-Rhythmus bleiben.
3.0s = nur erlaubt, wenn Geometrie und Property-Fakten stabil bleiben.
```

## Status

Alle Prompt-Muster sind `v0.1`, `draft`, nicht mit echten Bildern getestet und
nicht fuer Produktion freigegeben.

