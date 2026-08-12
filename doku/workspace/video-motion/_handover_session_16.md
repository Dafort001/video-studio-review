# Handover Session 16

## Was wurde erstellt?

Session 16 hat den ersten lokalen Varianten-Generator fuer die
Video-Motion-Library erstellt.

Neu erstellt:

- `docs/video-motion/75_variant_generator.md`
- `config/video-motion/variant_generation_rules.v01.json`
- `src/videoMotion/buildVideoVariants.ts`
- `tests/videoMotion/videoVariants.test.ts`
- `docs/video-motion/_handover_session_16.md`

Geaendert:

- `src/videoMotion/types.ts`
- `src/videoMotion/index.ts`

## Was ist der Inhalt?

`75_variant_generator.md` beschreibt Varianten als unterschiedliche Draft
Shot-Plan-Interpretationen desselben Bildmaterials, nicht als Render- oder
Provider-Pipelines.

`variant_generation_rules.v01.json` definiert die fuenf im Masterplan
geforderten Varianten:

- `serious_broker_website`
- `fast_social_teaser`
- `premium_calm`
- `avatar_hook`
- `sold_success_clip`

Jede Variante verweist auf ein vorhandenes Product Template:

- `serious_broker_website` -> `balanced_listing_video`
- `fast_social_teaser` -> `fast_social_teaser`
- `premium_calm` -> `premium_property_clip`
- `avatar_hook` -> `property_with_avatar_intro`
- `sold_success_clip` -> `sold_showcase`

`buildVideoVariants.ts` baut aus denselben Motiven mehrere Draft Shot Plans.
Pro Variante setzt es:

- Product-Template-ID,
- Creative Profile,
- Feature Flags,
- Shot-Limit,
- bevorzugte Opening-Motivklassen,
- Qwen-/Avatar-Policy als Planungsmetadaten.

## Welche Entscheidungen wurden getroffen?

- Varianten sind v0.1, `draft`, nicht mit echten Bildern getestet und nicht
  fuer Produktion freigegeben.
- Der Generator nutzt die lokale `buildShotPlan()`-Logik aus Session 15.
- `fast_social_teaser` darf QW-Kandidaten nur als planning/review-Pfad sehen.
- `avatar_hook` und `sold_success_clip` setzen `avatar_enabled` als
  Planungsflag, rufen aber keinen Avatar-Provider auf.
- Opening-Motive werden pro Variante konservativ bevorzugt, indem der erste
  passende Motivslot nach vorne gezogen wird.
- Varianten-IDs sind keine finalen Kundenpakete oder Preise.

## Was wurde bewusst nicht gemacht?

- Keine produktive Videoerzeugung.
- Keine produktive Qwen-API.
- Keine Webseite geaendert.
- Keine Render-Integration gebaut.
- Keine Avatar-/Provider-Integration.
- Keine finalen Kundentarife oder Produktpakete.
- Keine Session-17-Audit-Dateien vorgezogen.

## Validierung

Durchgefuehrt am 2026-06-29:

- `python3 -m json.tool config/video-motion/variant_generation_rules.v01.json`:
  ok.
- Struktureller Varianten-Regel-Check mit Python: ok.
- `variant_count` ist 5: ok.
- Alle fuenf Masterplan-Varianten vorhanden: ok.
- Alle referenzierten Product Templates existieren in
  `config/video-motion/product_templates.v01.json`: ok.
- `node --test tests/videoMotion/*.test.ts`: ok.
- 9 Tests bestanden.
- Bestehende Session-15-Tests bleiben gruen: ok.
- `buildVideoVariants()` erzeugt fuenf Draft-Varianten aus denselben Motiven:
  ok.
- `filterVideoVariants()` filtert ohne Neubau: ok.

## Git-Status bei Abschluss

Session-16-eigene neue Dateien:

- `docs/video-motion/75_variant_generator.md`
- `config/video-motion/variant_generation_rules.v01.json`
- `src/videoMotion/buildVideoVariants.ts`
- `tests/videoMotion/videoVariants.test.ts`
- `docs/video-motion/_handover_session_16.md`

Session-16-eigene geaenderte Dateien:

- `src/videoMotion/types.ts`
- `src/videoMotion/index.ts`

Optional aktualisierte Working-Memory:

- `CODEX_WORKING_MEMORY_DO_NOT_TOUCH/video-motion-current.md`

Unrelated bereits vorhandener Dirty-State, nicht von Session 16 zu bearbeiten:

- `projects/piximmo-web`

## Naechster sinnvoller Schritt

Die naechste Session darf nur die naechste im Masterplan ausdruecklich
beauftragte Session umsetzen. Nach Session 16 waere das Session 17:
Finaler Audit und Konsistenzpruefung.

Vor Session 17 zuerst lesen:

- `docs/video-motion/MASTERPLAN.md`
- `docs/video-motion/_handover_session_16.md`

Session 17 darf nicht automatisch gestartet werden. Sie braucht Daniels
expliziten Auftrag.

