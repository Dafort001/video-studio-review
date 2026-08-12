# Qwen Evaluation Criteria v0.1

## Zweck

Diese Datei definiert Bewertungskriterien fuer Qwen-Perspektiv- und
Multi-Angle-Tests. Sie verbindet Session 14 mit den Quality Gates aus Session
13, ohne eine automatische Bewertungsengine zu bauen.

## Bewertungsskala

Alle Kriterien werden in v0.1 auf einer 0-100-Skala bewertet:

```text
0   = unbrauchbar
25  = schwach
50  = nur mit Vorsicht nutzbar
75  = guter Kandidat
100 = sehr starker Kandidat
```

## Kriterien

### geometry_plausibility

Bewertet, ob Architektur, Linien, Fenster, Tueren, Treppen, Moebel und
Raumlogik glaubwuerdig bleiben.

Blocker:

- verbogene Linien,
- veraenderte Fenster oder Tueren,
- erfundene Raumtiefe,
- instabile Treppen oder Geländer,
- sichtbare View- oder Fassadenaenderung.

### motion_energy

Bewertet, ob die Bewegung genug Social-Energie hat, ohne chaotisch zu werden.

Hohe Werte brauchen:

- klare Richtung,
- kurze moderne Energie,
- keinen zufaelligen Spin,
- keine PowerPoint- oder Template-Wirkung.

### modern_property_feel

Bewertet, ob der Output wie moderner Social-Property-Content wirkt.

Hohe Werte brauchen:

- Immobilie bleibt Hauptmotiv,
- Bewegung fuehlt sich hochwertig an,
- Bildwert wird staerker statt verdeckt,
- keine synthetische 3D-Demo-Anmutung.

### artifact_visibility

Bewertet sichtbare Artefakte. Dieses Kriterium ist invertiert zu verstehen:
hohe Artefaktsichtbarkeit ist schlecht.

Typische Artefakte:

- schwimmende Fensterrahmen,
- veraenderte Fassaden,
- unstabile Spiegelungen,
- erfundene Objekte,
- flimmernde Linien,
- unplausible Lichtlogik.

### usable_at_0_5s

Bewertet, ob der Output als 0.5-Sekunden-Micro-Take nutzbar ist.

0.5 Sekunden duerfen kleine Unsauberkeiten kaschieren, aber keine
Property-Fakten veraendern.

### usable_at_1_5s

Bewertet, ob der Output als 1.5-Sekunden-Short-Take nutzbar ist.

Bei 1.5 Sekunden muessen Geometrie und Bildwert schon deutlich stabiler sein.

### usable_at_3s

Bewertet, ob der Output als 3-Sekunden-Take nutzbar ist.

3 Sekunden sind fuer QW nur selten realistisch. Ein hoher Wert verlangt stabile
Linien, ruhige Details und unveraenderte Property-Fakten.

## Entscheidungslogik v0.1

```text
pass:
  geometry_plausibility >= 80
  artifact_visibility <= 20
  modern_property_feel >= 70

warn:
  geometry_plausibility >= 65
  artifact_visibility <= 35
  usable_at_0_5s true

review:
  QW oder MX wurde genutzt
  oder ein Kriterium ist grenzwertig
  oder Dauer > 0.5s geplant

block:
  geometry_plausibility < 60
  oder artifact_visibility > 45
  oder Property-Fakten sichtbar veraendert
```

Diese Werte sind bewusst v0.1-Hinweise, keine finalen
Produktionsschwellenwerte.

## Verbindung zu Quality Gates

Qwen-Tests muessen mindestens diese Gates aus Session 13 respektieren:

- `qwen_artifact_gate`
- `property_dominance_gate`
- `pace_too_hectic_gate`
- `opening_strength_gate`
- `text_readability_gate`, falls Text spaeter kombiniert wird.

## Status

Alle Kriterien sind `v0.1`, `draft`, nicht mit echten Bildern getestet und
nicht fuer Produktion freigegeben.

