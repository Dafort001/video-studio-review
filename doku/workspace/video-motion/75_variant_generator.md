# Variant Generator v0.1

## Zweck

Diese Datei beschreibt, wie aus demselben Objekt mehrere geplante
Video-Varianten entstehen koennen. Varianten sind unterschiedliche
Interpretationen desselben Bildmaterials, nicht unterschiedliche Render- oder
Provider-Pipelines.

Session 16 erstellt Planungsregeln und ein kleines lokales Modul. Sie baut
keine produktive Videoerzeugung, keine Webseite, keine Qwen-API, keine
Avatar-/Provider-Integration und keine Render-Integration.

## Varianten

Die v0.1-Varianten sind:

```text
serious_broker_website
fast_social_teaser
premium_calm
avatar_hook
sold_success_clip
```

## Produkt-Mapping

Jede Variante verweist auf ein vorhandenes Product Template aus Session 11.

```text
serious_broker_website -> balanced_listing_video
fast_social_teaser     -> fast_social_teaser
premium_calm           -> premium_property_clip
avatar_hook            -> property_with_avatar_intro
sold_success_clip      -> sold_showcase
```

Dieses Mapping ist bewusst konservativ. Session 16 erfindet keine finalen
Kundenprodukte, Preise, UI-Optionen oder Render-Vertraege.

## Variantenlogik

Der Generator darf pro Variante:

- einen Variantennamen setzen,
- ein Product Template referenzieren,
- ein Creative Profile referenzieren,
- ein Shot-Limit setzen,
- Feature Flags fuer Planung setzen,
- bevorzugte Opening-Motive nach vorne ziehen,
- aus den vorhandenen Motiven einen Draft Shot Plan bauen,
- Warnungen aus dem Shot Plan und der Variantenregel sammeln.

Der Generator darf nicht:

- Qwen produktiv aufrufen,
- Avatar-Provider starten,
- Videos rendern,
- Website- oder API-Payloads erzeugen,
- Varianten als verkaufte Produktpakete deklarieren.

## Variantenspezifische Leitlinien

### serious_broker_website

Ruhige, glaubwuerdige Makler-/Website-Variante fuer klare Objektpraesentation.

- Product Template: `balanced_listing_video`
- QW: aus
- Avatar: aus
- Fokus: Hero, Raumbeweis, Feature, CTA

### fast_social_teaser

Kurze Social-Variante mit mehr Energie, aber weiterhin property-first.

- Product Template: `fast_social_teaser`
- QW: nur als spaeterer Testpfad, nicht produktiv
- Avatar: aus
- Fokus: Hook, sichtbarer Wert, kurze rhythmische Shots

### premium_calm

Ruhige Premium-Variante mit wenig Text und stabiler Geometrie.

- Product Template: `premium_property_clip`
- QW: aus
- Avatar: aus
- Fokus: starke Bilder, Architektur, Licht, Vertrauen

### avatar_hook

Variante fuer sehr kurzen Avatar-/Presenter-Hook vor property-dominantem Body.

- Product Template: `property_with_avatar_intro`
- QW: aus
- Avatar: planning flag an
- Fokus: kurzer Hook, danach Immobilie als Hauptmotiv

### sold_success_clip

Kurze Status-/Referenzvariante, ohne unapproved Sold-Claims produktiv zu
behaupten.

- Product Template: `sold_showcase`
- QW: aus
- Avatar: optional in Planung
- Fokus: Status-Hook, Objektbeweis, Brand-/CTA-Signoff

## JSON-Quelle

Die maschinenlesbaren Regeln liegen in:

```text
config/video-motion/variant_generation_rules.v01.json
```

## Code-Quelle

Der lokale Generator liegt in:

```text
src/videoMotion/buildVideoVariants.ts
```

## Status

Alle Variantenregeln sind `v0.1`, `draft`,
`tested_with_real_images: false` und `approved_for_production: false`.

