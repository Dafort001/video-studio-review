# Versioning And Feature Flags

## Versionierungsprinzip

Alle Libraries, Presets, Regeln, Schemata und Scoring-Modelle starten als
Version `v0.1`. Diese Version ist ein testbares Experimentiersystem, keine
endgueltige Produktlogik.

Wichtige Werte sollen spaeter in JSON- oder Markdown-Konfigurationen liegen und
nicht hart im Code versteckt werden.

## Statusfelder

Presets und Regeln sollen grundsaetzlich Statusfelder unterstuetzen:

```text
draft
test
approved
deprecated
```

## Bewertungsfelder

Presets sollen spaeter mindestens diese Bewertungsfelder enthalten:

```text
tested_with_real_images: true/false
approved_for_production: true/false
notes
known_failure_cases
```

## Feature Flags

Riskante oder dynamische Funktionen muessen deaktivierbar sein. Die ersten
geplanten Flags sind:

```text
qwen_enabled
avatar_enabled
aggressive_motion_enabled
experimental_transitions_enabled
typography_heavy_mode_enabled
```

## Kill-Switch-Regel

Jede Funktion, die Kosten erzeugt, Provider-Abhaengigkeiten einfuehrt oder die
visuelle Glaubwuerdigkeit eines Immobilienvideos gefaehrden kann, braucht
spaeter einen Kill Switch.

Das gilt besonders fuer:

- Qwen-Varianten und Multi-Angle-Experimente
- Avatar- oder Presenter-Overlays
- aggressive Bewegungen
- experimentelle Transitions
- stark typografiegetriebene Varianten

## Provider-Regel

Provider duerfen in dieser Library als Faehigkeiten beschrieben werden, aber
nicht als unausweichliche technische Voraussetzung. Qwen, DA3, Avatar-Systeme
oder Renderer muessen spaeter ueber Adapter und Konfiguration angesprochen
werden.

Keine Session darf produktive API-Integration vorziehen, wenn der Masterplan
sie nicht ausdruecklich vorsieht.

