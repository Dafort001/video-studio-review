# Motion Library v0.1

## Zweck

Diese Datei beschreibt die erste konkrete Motion-Preset-Library fuer moderne
Immobilienclips. Sie ist eine Planungsbibliothek, keine Render-Integration und
keine Produktionsfreigabe.

Session 6 erstellt konkrete Presets, damit spaetere Shot-Planung entscheiden
kann, welche Bewegung zu Motivklasse, Bild-Eigenschaften, Dauer, Risiko und
Creative Direction passt.

## Grenzen

- Keine API-Integration.
- Keine Webseite.
- Keine Render-Integration.
- Kein Typografie-System.
- Keine Transition Library.
- Keine Avatar Library.
- Keine Product Templates.
- Keine spaeteren Sessions.

`text_overlay_allowed` bedeutet nur, dass ein Preset spaeter mit Text
kombinierbar sein kann. Es definiert keine Schrift, Position, Animation oder
Copy-Regel. `avatar_overlay_allowed` bedeutet nur, dass das Bild prinzipiell
ruhig genug fuer einen spaeter optionalen Presenter-/Avatar-Layer sein kann.

## JSON-Quelle

Die maschinenlesbare Library liegt in:

```text
config/video-motion/motion_presets.v01.json
```

Das Schema liegt in:

```text
config/video-motion/motion_presets.v01.schema.json
```

## Preset-Zaehlung

- Version: `v0.1`
- Status: `draft`
- Presets: 60
- Gruppen: 9
- Mit echten Bildern getestet: nein
- Fuer Produktion freigegeben: nein

## Sicherheitslogik

Die Presets verwenden die Sicherheitsstufen aus Session 5:

- `safe`: konservative KB-Bewegung fuer normale Nutzungskandidaten.
- `medium`: braucht Motiv-, Score- oder manuelle Review.
- `experimental`: spaeter nur hinter Feature Flags und Review.
- `micro_only`: nur sehr kurze Hook- oder Rhythmusmomente.

QW-bezogene Presets sind in v0.1 bewusst kurz, riskant markiert und nicht
produktionsfreigegeben.

## Universal Hook / Hero

| ID | Preset | Motion | Method | Duration | Risk | Text | Avatar | QW |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `universal_hero_slow_push` | Universal Hero Slow Push | `push_in` | `KB` | `hero_take` 3.2-4.8s | `safe` | yes | yes | no |
| `universal_opening_pull_context` | Universal Opening Pull Context | `pull_out` | `KB` | `medium_take` 2-3s | `safe` | yes | no | no |
| `universal_social_energy_diagonal` | Universal Social Energy Diagonal | `diagonal_move` | `KB` | `short_take` 0.9-1.3s | `medium` | no | no | no |
| `universal_micro_perspective_pop` | Universal Micro Perspective Pop | `perspective_nudge` | `QW` | `micro_take` 0.35-0.65s | `micro_only` | no | no | yes |
| `universal_premium_parallax_anchor` | Universal Premium Parallax Anchor | `parallax_float` | `PX` | `medium_take` 1.8-2.8s | `medium` | yes | yes | no |
| `universal_text_safe_hold` | Universal Text Safe Hold | `text_card` | `KB` | `medium_take` 1.8-3s | `safe` | yes | yes | no |
| `universal_bright_pan_rhythm` | Universal Bright Pan Rhythm | `pan_right` | `KB` | `short_take` 1-1.5s | `safe` | no | no | no |
| `universal_calm_luxury_breathe` | Universal Calm Luxury Breathe | `push_in` | `KB` | `medium_take` 2.2-3s | `safe` | yes | yes | no |

### Universal Hero Slow Push

- ID: `universal_hero_slow_push`
- Motive: `living`, `open_plan`, `exterior`, `terrace`, `garden`, `view`
- Eigenschaften: `bright`, `deep_perspective`, `cozy`, `luxury`
- Empfohlene Nutzung: Opening or anchor shot when one image clearly carries the property.
- Prompt-Hinweis: Use a slow centered push that respects the strongest architectural or lifestyle subject.
- Negativ-Hinweis: Do not crop out windows, facade edges, terrace furniture, or the main room anchor.
- Hauptrisiken: low crop reserve; busy foreground; weak hero_score
- Bekannte Failure Cases: tight crop around furniture; overexposed window becomes dominant
- Notiz: Baseline v0.1 hero motion for readable property value.

### Universal Opening Pull Context

- ID: `universal_opening_pull_context`
- Motive: `open_plan`, `exterior`, `terrace`, `garden`, `view`
- Eigenschaften: `deep_perspective`, `outdoor`, `high_ceiling`, `bright`
- Empfohlene Nutzung: Reveal more context after a strong initial crop.
- Prompt-Hinweis: Start close on the value point and gently open to the surrounding space.
- Negativ-Hinweis: Do not start on an unclear or empty crop.
- Hauptrisiken: no clear starting hook; important feature near edge
- Bekannte Failure Cases: flat image with no spatial gain; wide-angle distortion at edges
- Notiz: Works when the reveal adds information rather than weakening the frame.

### Universal Social Energy Diagonal

- ID: `universal_social_energy_diagonal`
- Motive: `living`, `open_plan`, `kitchen`, `terrace`, `garden`, `detail`
- Eigenschaften: `feature_object`, `strong_lines`, `bright`
- Empfohlene Nutzung: Short rhythm shot in faster social edits.
- Prompt-Hinweis: Use a small diagonal move with mild push, anchored to the clearest feature.
- Negativ-Hinweis: Do not over-rotate, over-zoom, or make the room feel unstable.
- Hauptrisiken: narrow_space; low motion_potential_score; calm premium profile
- Bekannte Failure Cases: movement feels like a template effect; important object drifts out of frame
- Notiz: A rhythm tool, not a long architectural explanation.

### Universal Micro Perspective Pop

- ID: `universal_micro_perspective_pop`
- Motive: `exterior`, `kitchen`, `detail`, `terrace`, `garden`
- Eigenschaften: `feature_object`, `outdoor`, `deep_perspective`
- Empfohlene Nutzung: Very short hook or beat when Qwen-style variation is explicitly enabled.
- Prompt-Hinweis: Suggest a tiny viewpoint change around the feature without inventing new property details.
- Negativ-Hinweis: Do not alter walls, windows, railings, appliances, or layout.
- Hauptrisiken: qwen_enabled false; qwen_risk_score above 60; precise line geometry
- Bekannte Failure Cases: generated perspective changes property facts; window frames bend visibly
- Notiz: Requires a later feature flag and manual review before production.

### Universal Premium Parallax Anchor

- ID: `universal_premium_parallax_anchor`
- Motive: `open_plan`, `living`, `terrace`, `garden`, `view`, `exterior`
- Eigenschaften: `deep_perspective`, `bright`, `luxury`, `outdoor`
- Empfohlene Nutzung: Premium depth moment when foreground and background separate cleanly.
- Prompt-Hinweis: Keep depth movement subtle and preserve stable architectural lines.
- Negativ-Hinweis: Do not separate glass, mirrors, thin railings, or window frames aggressively.
- Hauptrisiken: window_dominant; mirror surfaces; unclear depth layers
- Bekannte Failure Cases: foreground cutout halos; window frame swimming
- Notiz: Good candidate for later depth-based rendering tests.

### Universal Text Safe Hold

- ID: `universal_text_safe_hold`
- Motive: `living`, `open_plan`, `view`, `garden`, `terrace`, `branding`
- Eigenschaften: `bright`, `cozy`, `outdoor`
- Empfohlene Nutzung: Text-led bridge using a property image without defining typography yet.
- Prompt-Hinweis: Use a nearly static hold with minimal breathing zoom behind short copy.
- Negativ-Hinweis: Do not cover the main selling feature or create busy motion behind text.
- Hauptrisiken: low text_overlay_score; busy background; important feature in text zone
- Bekannte Failure Cases: text needs too much copy; background competes with CTA
- Notiz: Typography style itself belongs to a later session.

### Universal Bright Pan Rhythm

- ID: `universal_bright_pan_rhythm`
- Motive: `living`, `open_plan`, `kitchen`, `terrace`, `view`
- Eigenschaften: `bright`, `strong_lines`, `deep_perspective`
- Empfohlene Nutzung: Clean lateral rhythm shot when image edges are safe.
- Prompt-Hinweis: Move laterally with a light push and maintain horizon or room-line stability.
- Negativ-Hinweis: Do not expose weak image edges or warped horizontal lines.
- Hauptrisiken: bad right edge; window_dominant; crooked horizon
- Bekannte Failure Cases: pan reveals clutter; window line tremor becomes visible
- Notiz: Direction can be swapped during shot planning if sequence flow requires it.

### Universal Calm Luxury Breathe

- ID: `universal_calm_luxury_breathe`
- Motive: `open_plan`, `living`, `kitchen`, `view`, `terrace`
- Eigenschaften: `luxury`, `bright`, `deep_perspective`
- Empfohlene Nutzung: Quiet premium shot for calm_premium or editorial_architecture profiles.
- Prompt-Hinweis: Use a very low-amplitude push, prioritizing calm and believable scale.
- Negativ-Hinweis: Do not add social bounce, aggressive speed, or perspective edits.
- Hauptrisiken: weak luxury_score; room clutter; over-animated movement
- Bekannte Failure Cases: premium intent is not visible in the image; movement is too subtle for short social pacing
- Notiz: Useful counterweight in edits that otherwise become too energetic.

## Exterior / Entrance

| ID | Preset | Motion | Method | Duration | Risk | Text | Avatar | QW |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `exterior_facade_establish_push` | Facade Establish Push | `push_in` | `KB` | `medium_take` 2-3s | `safe` | yes | no | no |
| `exterior_facade_lateral_scan` | Facade Lateral Scan | `pan_left` | `KB` | `medium_take` 1.8-2.8s | `safe` | no | no | no |
| `exterior_architecture_tilt_up` | Architecture Tilt Up | `tilt_up` | `KB` | `short_take` 1-1.5s | `medium` | no | no | no |
| `entrance_doorway_reveal_soft` | Entrance Doorway Reveal Soft | `doorway_reveal` | `KB` | `short_take` 1-1.5s | `medium` | yes | no | no |
| `entrance_arrival_tilt_down` | Entrance Arrival Tilt Down | `tilt_down` | `KB` | `short_take` 0.9-1.4s | `medium` | no | no | no |
| `exterior_drone_hint_micro` | Exterior Drone Hint Micro | `drone_like_lift` | `QW` | `micro_take` 0.35-0.7s | `micro_only` | no | no | yes |
| `entrance_brandable_text_card` | Entrance Brandable Text Card | `text_card` | `KB` | `medium_take` 1.8-2.8s | `safe` | yes | no | no |

### Facade Establish Push

- ID: `exterior_facade_establish_push`
- Motive: `exterior`
- Eigenschaften: `outdoor`, `strong_lines`, `symmetric`
- Empfohlene Nutzung: Readable first impression for a strong facade.
- Prompt-Hinweis: Push toward the facade center while keeping roofline and verticals stable.
- Negativ-Hinweis: Do not crop roofline, entrance, or property-defining facade edges.
- Hauptrisiken: parked cars; wide-angle facade distortion; low exterior quality
- Bekannte Failure Cases: partial facade lacks property identity; street clutter dominates
- Notiz: Strong for listings where the exterior has immediate identity.

### Facade Lateral Scan

- ID: `exterior_facade_lateral_scan`
- Motive: `exterior`
- Eigenschaften: `outdoor`, `strong_lines`
- Empfohlene Nutzung: Show horizontal facade width or street-facing presence.
- Prompt-Hinweis: Scan laterally across the facade with a stable horizon.
- Negativ-Hinweis: Do not reveal weak image edges, parked car clutter, or tilted verticals.
- Hauptrisiken: warped facade lines; bad left image edge; busy foreground
- Bekannte Failure Cases: pan exaggerates lens distortion; street signs distract
- Notiz: Use when the facade reads wider than it reads deep.

### Architecture Tilt Up

- ID: `exterior_architecture_tilt_up`
- Motive: `exterior`, `entrance`
- Eigenschaften: `high_ceiling`, `strong_lines`, `outdoor`
- Empfohlene Nutzung: Emphasize vertical facade, entry height, or architectural scale.
- Prompt-Hinweis: Move upward gently from entry or lower facade to roofline or height cue.
- Negativ-Hinweis: Do not bend vertical lines or overexpose sky.
- Hauptrisiken: crooked verticals; blown sky; weak lower-frame anchor
- Bekannte Failure Cases: tilt makes facade feel artificial; sky becomes the subject
- Notiz: Review line stability before using as hero.

### Entrance Doorway Reveal Soft

- ID: `entrance_doorway_reveal_soft`
- Motive: `entrance`, `hallway`
- Eigenschaften: `strong_lines`, `deep_perspective`, `cozy`
- Empfohlene Nutzung: Arrival or transition from exterior into interior.
- Prompt-Hinweis: Move through the entry axis by crop only, keeping door frames straight.
- Negativ-Hinweis: Do not fake a walkthrough or distort the doorway geometry.
- Hauptrisiken: dark entry; narrow_space; crooked door frame
- Bekannte Failure Cases: entry looks too dark; door frame warps during motion
- Notiz: Should feel like orientation, not virtual-tour simulation.

### Entrance Arrival Tilt Down

- ID: `entrance_arrival_tilt_down`
- Motive: `entrance`, `exterior`
- Eigenschaften: `outdoor`, `feature_object`, `strong_lines`
- Empfohlene Nutzung: Reveal entry path, steps, threshold, or arrival detail.
- Prompt-Hinweis: Start on the door or facade cue and tilt down toward the usable entry path.
- Negativ-Hinweis: Do not end on empty pavement or crop out the entrance.
- Hauptrisiken: boring ground area; important subject leaves frame
- Bekannte Failure Cases: motion reveals clutter; path has no visual appeal
- Notiz: Only works when the lower frame contains value.

### Exterior Drone Hint Micro

- ID: `exterior_drone_hint_micro`
- Motive: `exterior`, `garden`, `view`
- Eigenschaften: `outdoor`, `deep_perspective`, `sunset`
- Empfohlene Nutzung: Short impression of lift for outdoor hero energy when experimental motion is enabled.
- Prompt-Hinweis: Suggest a tiny upward viewpoint shift without changing the property, roofline, or surroundings.
- Negativ-Hinweis: Do not invent drone altitude, neighboring buildings, landscape, or missing facade detail.
- Hauptrisiken: qwen_enabled false; high qwen_risk_score; no outdoor depth
- Bekannte Failure Cases: generated environment changes; facade proportions shift
- Notiz: Not a real drone shot; keep it as a micro impression only.

### Entrance Brandable Text Card

- ID: `entrance_brandable_text_card`
- Motive: `entrance`, `exterior`, `branding`
- Eigenschaften: `strong_lines`, `outdoor`, `bright`
- Empfohlene Nutzung: Short address, sold, or arrival statement over a calm entrance image.
- Prompt-Hinweis: Use minimal background motion and preserve the entry as the visual anchor.
- Negativ-Hinweis: Do not place text over signage, door numbers, or the strongest facade detail.
- Hauptrisiken: low text_overlay_score; privacy-sensitive signage; busy facade
- Bekannte Failure Cases: text covers house number; background lacks calm text zone
- Notiz: Copy rules and type style remain out of scope for Session 6.

## Living / Open Plan

| ID | Preset | Motion | Method | Duration | Risk | Text | Avatar | QW |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `living_warm_push_in` | Living Warm Push In | `push_in` | `KB` | `medium_take` 1.8-3s | `safe` | yes | yes | no |
| `living_window_pan_left` | Living Window Pan Left | `pan_left` | `KB` | `short_take` 1-1.5s | `safe` | no | no | no |
| `open_plan_depth_pull` | Open Plan Depth Pull | `pull_out` | `KB` | `hero_take` 3-4.3s | `safe` | yes | yes | no |
| `open_plan_parallax_premium` | Open Plan Parallax Premium | `parallax_float` | `PX` | `medium_take` 2-3s | `medium` | yes | yes | no |
| `living_feature_fireplace_focus` | Living Feature Fireplace Focus | `feature_focus` | `KB` | `short_take` 0.9-1.5s | `medium` | no | no | no |
| `open_plan_social_diagonal` | Open Plan Social Diagonal | `diagonal_move` | `KB` | `short_take` 0.8-1.3s | `medium` | no | no | no |
| `living_avatar_background_breathe` | Living Avatar Background Breathe | `text_card` | `KB` | `medium_take` 2-3s | `safe` | yes | yes | no |
| `open_plan_micro_orbit_counter` | Open Plan Micro Orbit Counter | `orbit_hint` | `QW` | `micro_take` 0.3-0.6s | `micro_only` | no | no | yes |

### Living Warm Push In

- ID: `living_warm_push_in`
- Motive: `living`
- Eigenschaften: `cozy`, `bright`, `window_dominant`
- Empfohlene Nutzung: Warm emotional living-room anchor.
- Prompt-Hinweis: Push gently toward seating or the room's calmest lifestyle center.
- Negativ-Hinweis: Do not crop out windows, sofa edges, or a fireplace feature.
- Hauptrisiken: visual clutter; overexposed windows; weak cozy signal
- Bekannte Failure Cases: screen or clutter becomes the focus; window bloom dominates
- Notiz: Strong default for family_home_warm and calm_premium.

### Living Window Pan Left

- ID: `living_window_pan_left`
- Motive: `living`
- Eigenschaften: `bright`, `window_dominant`, `strong_lines`
- Empfohlene Nutzung: Show width and light across a living room.
- Prompt-Hinweis: Move laterally away from the brightest window into readable room detail.
- Negativ-Hinweis: Do not let blown windows or unstable frames become the focus.
- Hauptrisiken: window_dominant; bad left edge; thin curtains or blinds
- Bekannte Failure Cases: horizon or frames shimmer; pan reveals messy corner
- Notiz: Use only if window frames remain stable and exposure is controlled.

### Open Plan Depth Pull

- ID: `open_plan_depth_pull`
- Motive: `open_plan`
- Eigenschaften: `deep_perspective`, `bright`, `strong_lines`
- Empfohlene Nutzung: Hero reveal for connected living, dining, and kitchen space.
- Prompt-Hinweis: Start on the strongest zone and open toward the full room relationship.
- Negativ-Hinweis: Do not flatten the open-plan value or lose the main zone.
- Hauptrisiken: too many competing zones; wide-angle edge distortion
- Bekannte Failure Cases: room relation remains unclear; furniture edges distort
- Notiz: One of the strongest v0.1 hero candidates.

### Open Plan Parallax Premium

- ID: `open_plan_parallax_premium`
- Motive: `open_plan`, `living`
- Eigenschaften: `deep_perspective`, `luxury`, `bright`
- Empfohlene Nutzung: Premium spatial feeling where foreground and background separate.
- Prompt-Hinweis: Create a subtle depth drift between foreground furniture and background zones.
- Negativ-Hinweis: Do not detach chairs, counters, windows, or reflections unnaturally.
- Hauptrisiken: messy depth layers; glass reflections; thin furniture edges
- Bekannte Failure Cases: furniture cutout halos; window layer moves incorrectly
- Notiz: Review depth quality before production use.

### Living Feature Fireplace Focus

- ID: `living_feature_fireplace_focus`
- Motive: `living`, `detail`
- Eigenschaften: `feature_object`, `cozy`, `luxury`
- Empfohlene Nutzung: Short proof shot for fireplace, feature wall, or design furniture.
- Prompt-Hinweis: Move toward the feature while keeping enough room context.
- Negativ-Hinweis: Do not turn the shot into an unreadable close-up.
- Hauptrisiken: feature too small; feature near edge; unclear selling value
- Bekannte Failure Cases: focus crops out context; feature is not premium enough
- Notiz: Best after a room-wide shot has established context.

### Open Plan Social Diagonal

- ID: `open_plan_social_diagonal`
- Motive: `open_plan`, `living`, `kitchen`
- Eigenschaften: `deep_perspective`, `strong_lines`, `bright`
- Empfohlene Nutzung: Fast social rhythm inside a modern open-plan sequence.
- Prompt-Hinweis: Use a small diagonal move that follows the room axis and keeps lines stable.
- Negativ-Hinweis: Do not introduce rolling motion or aggressive zoom.
- Hauptrisiken: calm_premium profile; wide-angle distortion; narrow_space
- Bekannte Failure Cases: room feels tilted; motion competes with architectural value
- Notiz: Use sparingly between calmer readable shots.

### Living Avatar Background Breathe

- ID: `living_avatar_background_breathe`
- Motive: `living`, `open_plan`
- Eigenschaften: `bright`, `cozy`
- Empfohlene Nutzung: Optional presenter or avatar background when enabled later.
- Prompt-Hinweis: Keep the background calm with a very slow breathing zoom.
- Negativ-Hinweis: Do not move behind an avatar so much that the presenter feels detached.
- Hauptrisiken: low avatar_background_score; busy shelves or TV; important feature behind avatar zone
- Bekannte Failure Cases: avatar covers the room value; background is too busy for presenter
- Notiz: Avatar remains optional and disabled unless explicitly enabled later.

### Open Plan Micro Orbit Counter

- ID: `open_plan_micro_orbit_counter`
- Motive: `open_plan`, `kitchen`
- Eigenschaften: `feature_object`, `deep_perspective`, `strong_lines`
- Empfohlene Nutzung: Tiny energy beat around an island or central room anchor.
- Prompt-Hinweis: Suggest a minimal orbit around the island or central furniture without changing geometry.
- Negativ-Hinweis: Do not alter counters, cabinet lines, window positions, or room layout.
- Hauptrisiken: qwen_risk_score above 60; precise counter geometry; hero_take requested
- Bekannte Failure Cases: island shape changes; cabinet lines drift
- Notiz: Only for fast_social or luxury_dynamic experiments.

## Kitchen / Dining

| ID | Preset | Motion | Method | Duration | Risk | Text | Avatar | QW |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `kitchen_island_feature_push` | Kitchen Island Feature Push | `feature_focus` | `KB` | `medium_take` 1.6-2.6s | `medium` | no | no | no |
| `kitchen_clean_line_pan` | Kitchen Clean Line Pan | `pan_right` | `KB` | `short_take` 1-1.5s | `safe` | no | no | no |
| `kitchen_detail_micro_orbit` | Kitchen Detail Micro Orbit | `orbit_hint` | `QW` | `micro_take` 0.3-0.6s | `micro_only` | no | no | yes |
| `dining_warm_push` | Dining Warm Push | `push_in` | `KB` | `short_take` 1-1.5s | `safe` | yes | no | no |
| `dining_to_kitchen_reveal` | Dining To Kitchen Reveal | `doorway_reveal` | `KB` | `medium_take` 1.6-2.6s | `medium` | yes | no | no |
| `kitchen_premium_parallax` | Kitchen Premium Parallax | `parallax_float` | `PX` | `short_take` 1.2-1.5s | `medium` | no | no | no |
| `kitchen_perspective_nudge_short` | Kitchen Perspective Nudge Short | `perspective_nudge` | `QW` | `short_take` 0.8-1s | `experimental` | no | no | yes |

### Kitchen Island Feature Push

- ID: `kitchen_island_feature_push`
- Motive: `kitchen`, `open_plan`
- Eigenschaften: `feature_object`, `luxury`, `strong_lines`
- Empfohlene Nutzung: Kitchen island or premium counter as selling proof.
- Prompt-Hinweis: Move toward the island or material feature while retaining room context.
- Negativ-Hinweis: Do not crop out counters, appliances, or the open-plan relation.
- Hauptrisiken: cluttered counters; feature near frame edge; reflections
- Bekannte Failure Cases: counter clutter becomes the focus; appliance reflections distract
- Notiz: Good when kitchen is a central sales argument.

### Kitchen Clean Line Pan

- ID: `kitchen_clean_line_pan`
- Motive: `kitchen`
- Eigenschaften: `strong_lines`, `luxury`, `bright`
- Empfohlene Nutzung: Show cabinet run, counter length, or clean material line.
- Prompt-Hinweis: Pan along the kitchen line with stable cabinets and counter edges.
- Negativ-Hinweis: Do not reveal cluttered counter ends or warped cabinet geometry.
- Hauptrisiken: bad right edge; reflective appliances; crooked cabinets
- Bekannte Failure Cases: cabinet lines wobble; pan exposes clutter
- Notiz: Strong for new_build_clean if the kitchen is tidy.

### Kitchen Detail Micro Orbit

- ID: `kitchen_detail_micro_orbit`
- Motive: `kitchen`, `detail`
- Eigenschaften: `feature_object`, `luxury`, `strong_lines`
- Empfohlene Nutzung: Very short premium material or appliance detail beat.
- Prompt-Hinweis: Suggest a tiny orbit around the fixture or material feature without changing the object.
- Negativ-Hinweis: Do not alter handles, faucets, appliance logos, cabinet seams, or reflections.
- Hauptrisiken: qwen_enabled false; mirror or steel reflections; precise object geometry
- Bekannte Failure Cases: faucet shape changes; cabinet seams bend
- Notiz: Use only as optional high-energy detail.

### Dining Warm Push

- ID: `dining_warm_push`
- Motive: `dining`, `open_plan`
- Eigenschaften: `cozy`, `bright`
- Empfohlene Nutzung: Lifestyle support shot for family or warm listing story.
- Prompt-Hinweis: Push gently toward table, light, or dining zone without losing context.
- Negativ-Hinweis: Do not make table clutter the subject.
- Hauptrisiken: table clutter; weak dining identity; redundant open-plan shot
- Bekannte Failure Cases: dining zone is too generic; lighting fixture distracts
- Notiz: Usually supporting, not primary hero.

### Dining To Kitchen Reveal

- ID: `dining_to_kitchen_reveal`
- Motive: `dining`, `kitchen`, `open_plan`
- Eigenschaften: `deep_perspective`, `bright`, `strong_lines`
- Empfohlene Nutzung: Show relationship between dining and kitchen zones.
- Prompt-Hinweis: Move from the dining anchor toward the visible kitchen relationship.
- Negativ-Hinweis: Do not imply a walkthrough or change room layout.
- Hauptrisiken: too many zones; weak composition; narrow_space
- Bekannte Failure Cases: room relation remains confusing; motion crosses clutter
- Notiz: Good for open-plan layouts when both zones matter.

### Kitchen Premium Parallax

- ID: `kitchen_premium_parallax`
- Motive: `kitchen`, `open_plan`
- Eigenschaften: `luxury`, `feature_object`, `deep_perspective`
- Empfohlene Nutzung: Depth-enhanced premium kitchen moment.
- Prompt-Hinweis: Use subtle separation between island, counter, and background cabinetry.
- Negativ-Hinweis: Do not detach thin fixtures, glass, or appliance reflections.
- Hauptrisiken: reflective surfaces; thin fixtures; unclear depth
- Bekannte Failure Cases: counter edge halos; appliance reflection moves incorrectly
- Notiz: Review depth map quality before use.

### Kitchen Perspective Nudge Short

- ID: `kitchen_perspective_nudge_short`
- Motive: `kitchen`
- Eigenschaften: `feature_object`, `strong_lines`, `luxury`
- Empfohlene Nutzung: Optional short variant for strong, clean kitchens with low Qwen risk.
- Prompt-Hinweis: Create a small camera-angle suggestion while preserving exact cabinet and counter geometry.
- Negativ-Hinweis: Do not invent appliances, remove clutter, alter materials, or bend straight lines.
- Hauptrisiken: qwen_risk_score above 50; visible appliance brand; tile or cabinet grid
- Bekannte Failure Cases: cabinet count changes; countertop material shifts
- Notiz: Experimental even at short duration.

## Bedroom / Bathroom / Office

| ID | Preset | Motion | Method | Duration | Risk | Text | Avatar | QW |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `bedroom_calm_push` | Bedroom Calm Push | `push_in` | `KB` | `medium_take` 1.6-2.6s | `safe` | yes | yes | no |
| `bedroom_window_pull` | Bedroom Window Pull | `pull_out` | `KB` | `short_take` 1-1.5s | `safe` | yes | no | no |
| `bathroom_luxury_feature_focus` | Bathroom Luxury Feature Focus | `feature_focus` | `KB` | `short_take` 0.9-1.4s | `medium` | no | no | no |
| `bathroom_tile_safe_hold` | Bathroom Tile Safe Hold | `push_in` | `KB` | `short_take` 1-1.4s | `safe` | no | no | no |
| `office_work_lifestyle_push` | Office Work Lifestyle Push | `push_in` | `KB` | `short_take` 1-1.5s | `safe` | yes | yes | no |
| `office_text_anchor_hold` | Office Text Anchor Hold | `text_card` | `KB` | `medium_take` 1.6-2.6s | `safe` | yes | yes | no |
| `bathroom_micro_perspective_clean` | Bathroom Micro Perspective Clean | `perspective_nudge` | `QW` | `micro_take` 0.3-0.55s | `micro_only` | no | no | yes |

### Bedroom Calm Push

- ID: `bedroom_calm_push`
- Motive: `bedroom`
- Eigenschaften: `cozy`, `bright`
- Empfohlene Nutzung: Quiet supporting bedroom shot.
- Prompt-Hinweis: Push gently toward bed or window while keeping the room calm.
- Negativ-Hinweis: Do not emphasize cramped corners or messy textiles.
- Hauptrisiken: small room; messy textiles; weak light
- Bekannte Failure Cases: bed dominates too tightly; room feels smaller after push
- Notiz: Usually supports the sequence after stronger common spaces.

### Bedroom Window Pull

- ID: `bedroom_window_pull`
- Motive: `bedroom`
- Eigenschaften: `bright`, `window_dominant`, `cozy`
- Empfohlene Nutzung: Reveal bedroom light and usable space from a window or bed cue.
- Prompt-Hinweis: Start on light or bed cue and open to readable room context.
- Negativ-Hinweis: Do not let blown window exposure dominate the reveal.
- Hauptrisiken: overexposed window; weak starting crop; tight room
- Bekannte Failure Cases: pull reveals clutter; window is unreadable
- Notiz: Use where light is a selling point.

### Bathroom Luxury Feature Focus

- ID: `bathroom_luxury_feature_focus`
- Motive: `bathroom`
- Eigenschaften: `luxury`, `feature_object`, `narrow_space`
- Empfohlene Nutzung: Short proof shot for bath, vanity, shower, or material quality.
- Prompt-Hinweis: Move toward the bathroom feature with minimal crop change.
- Negativ-Hinweis: Do not reveal photographer reflections or distort tile lines.
- Hauptrisiken: mirror; tight geometry; tile grid
- Bekannte Failure Cases: photographer visible in mirror; tile lines warp
- Notiz: Manual review recommended for mirrors and reflective fixtures.

### Bathroom Tile Safe Hold

- ID: `bathroom_tile_safe_hold`
- Motive: `bathroom`
- Eigenschaften: `strong_lines`, `narrow_space`, `luxury`
- Empfohlene Nutzung: Conservative motion for bathrooms with sensitive geometry.
- Prompt-Hinweis: Use a very small centered push and preserve tile, mirror, and fixture geometry.
- Negativ-Hinweis: Do not pan across mirror seams or tile grids.
- Hauptrisiken: visible photographer; mirror dominance; low crop reserve
- Bekannte Failure Cases: mirror reflection distracts; push makes bathroom feel cramped
- Notiz: Safer fallback when feature focus is too risky.

### Office Work Lifestyle Push

- ID: `office_work_lifestyle_push`
- Motive: `office`
- Eigenschaften: `bright`, `cozy`
- Empfohlene Nutzung: Home-office lifestyle proof when remote work is a selling point.
- Prompt-Hinweis: Push toward the work zone without emphasizing monitor clutter.
- Negativ-Hinweis: Do not show readable private screen content or cables as focal points.
- Hauptrisiken: desk clutter; visible private data; generic room
- Bekannte Failure Cases: monitor dominates; workspace looks improvised
- Notiz: Useful when office value is explicit in the listing story.

### Office Text Anchor Hold

- ID: `office_text_anchor_hold`
- Motive: `office`, `bedroom`
- Eigenschaften: `bright`, `cozy`
- Empfohlene Nutzung: Text-supported remote-work or extra-room message.
- Prompt-Hinweis: Keep the background calm with minimal zoom for a concise text statement.
- Negativ-Hinweis: Do not cover desk function or readable screens.
- Hauptrisiken: low text_overlay_score; screen content; busy shelves
- Bekannte Failure Cases: text fights bookshelf details; screen privacy issue
- Notiz: Copy and layout remain deferred to typography sessions.

### Bathroom Micro Perspective Clean

- ID: `bathroom_micro_perspective_clean`
- Motive: `bathroom`, `detail`
- Eigenschaften: `luxury`, `feature_object`, `strong_lines`
- Empfohlene Nutzung: Experimental micro accent for very clean luxury bathroom details.
- Prompt-Hinweis: Suggest a tiny viewpoint shift around a fixture while preserving exact tile and mirror geometry.
- Negativ-Hinweis: Do not alter reflections, tile grid, shower glass, faucets, or room dimensions.
- Hauptrisiken: mirror; tile grid; qwen_risk_score above 45
- Bekannte Failure Cases: reflections change; fixture shape mutates
- Notiz: High review burden despite micro duration.

## Hallway / Staircase

| ID | Preset | Motion | Method | Duration | Risk | Text | Avatar | QW |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `hallway_axis_push` | Hallway Axis Push | `push_in` | `KB` | `short_take` 0.9-1.4s | `safe` | no | no | no |
| `hallway_doorway_transition` | Hallway Doorway Transition | `doorway_reveal` | `KB` | `short_take` 0.8-1.3s | `medium` | no | no | no |
| `staircase_rise_clean` | Staircase Rise Clean | `staircase_rise` | `KB` | `short_take` 1-1.5s | `medium` | no | no | no |
| `staircase_parallax_rise` | Staircase Parallax Rise | `staircase_rise` | `PX` | `short_take` 0.9-1.3s | `medium` | no | no | no |
| `staircase_micro_orbit` | Staircase Micro Orbit | `orbit_hint` | `QW` | `micro_take` 0.3-0.55s | `micro_only` | no | no | yes |
| `hallway_text_orientation` | Hallway Text Orientation | `text_card` | `KB` | `short_take` 1-1.5s | `safe` | yes | no | no |

### Hallway Axis Push

- ID: `hallway_axis_push`
- Motive: `hallway`
- Eigenschaften: `deep_perspective`, `narrow_space`, `strong_lines`
- Empfohlene Nutzung: Short orientation shot through a corridor axis.
- Prompt-Hinweis: Push gently down the hallway axis while keeping doors and verticals stable.
- Negativ-Hinweis: Do not make a narrow hallway feel longer or more cramped than it is.
- Hauptrisiken: dark hallway; crooked doors; low emotional value
- Bekannte Failure Cases: corridor feels tunnel-like; doors wobble
- Notiz: Use for orientation only, not as a long hero.

### Hallway Doorway Transition

- ID: `hallway_doorway_transition`
- Motive: `hallway`, `entrance`, `living`, `bedroom`
- Eigenschaften: `deep_perspective`, `strong_lines`, `narrow_space`
- Empfohlene Nutzung: Transition from circulation space into a more valuable room.
- Prompt-Hinweis: Use crop movement through the doorway axis without inventing travel.
- Negativ-Hinweis: Do not distort door frames or reveal empty wall as the end frame.
- Hauptrisiken: crooked door frame; low light; unclear destination room
- Bekannte Failure Cases: destination lacks value; doorway bends
- Notiz: Cut away once the next room is understandable.

### Staircase Rise Clean

- ID: `staircase_rise_clean`
- Motive: `staircase`
- Eigenschaften: `strong_lines`, `deep_perspective`, `high_ceiling`
- Empfohlene Nutzung: Architecture rhythm for clean stair geometry.
- Prompt-Hinweis: Rise along the stair axis while preserving railings and step geometry.
- Negativ-Hinweis: Do not rotate, wobble, or bend railings.
- Hauptrisiken: crooked railing; dark stairwell; diagonal line distortion
- Bekannte Failure Cases: steps warp; motion feels unstable
- Notiz: Strong when staircase is an architectural feature.

### Staircase Parallax Rise

- ID: `staircase_parallax_rise`
- Motive: `staircase`
- Eigenschaften: `strong_lines`, `deep_perspective`, `high_ceiling`
- Empfohlene Nutzung: Depth-enhanced staircase accent when line stability is excellent.
- Prompt-Hinweis: Add subtle depth separation along railing and steps without changing geometry.
- Negativ-Hinweis: Do not detach railings, bend steps, or exaggerate vertical motion.
- Hauptrisiken: thin railings; unclean depth map; strong diagonal lines
- Bekannte Failure Cases: railing halo; step edges swim
- Notiz: Manual review recommended because stairs expose errors quickly.

### Staircase Micro Orbit

- ID: `staircase_micro_orbit`
- Motive: `staircase`
- Eigenschaften: `feature_object`, `strong_lines`, `deep_perspective`
- Empfohlene Nutzung: Very short architecture beat around a stair feature.
- Prompt-Hinweis: Suggest a tiny viewpoint shift around railing or stair geometry without changing construction.
- Negativ-Hinweis: Do not invent steps, change railing shape, or bend verticals.
- Hauptrisiken: qwen_risk_score above 45; precise railings; dark stairwell
- Bekannte Failure Cases: railing changes design; step count changes
- Notiz: Only for experimental social rhythm, never for explanation.

### Hallway Text Orientation

- ID: `hallway_text_orientation`
- Motive: `hallway`, `entrance`
- Eigenschaften: `deep_perspective`, `strong_lines`
- Empfohlene Nutzung: Short orientation or floor-plan-like message over a calm circulation image.
- Prompt-Hinweis: Use near-static framing with a subtle push so text remains readable.
- Negativ-Hinweis: Do not cover doorway cues or make dark halls carry long copy.
- Hauptrisiken: low light; busy door pattern; low text_overlay_score
- Bekannte Failure Cases: text hides destination room; corridor feels too plain
- Notiz: Use only when hallway has enough visual clarity.

## Balcony / Terrace / Garden / View

| ID | Preset | Motion | Method | Duration | Risk | Text | Avatar | QW |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `terrace_lifestyle_push` | Terrace Lifestyle Push | `push_in` | `KB` | `medium_take` 1.8-2.8s | `safe` | yes | yes | no |
| `terrace_wide_pan` | Terrace Wide Pan | `pan_right` | `KB` | `short_take` 1-1.5s | `safe` | no | no | no |
| `balcony_view_pull` | Balcony View Pull | `pull_out` | `KB` | `medium_take` 1.6-2.4s | `safe` | yes | no | no |
| `garden_family_pull` | Garden Family Pull | `pull_out` | `KB` | `hero_take` 3-4.5s | `safe` | yes | yes | no |
| `garden_parallax_float` | Garden Parallax Float | `parallax_float` | `PX` | `medium_take` 1.8-2.8s | `medium` | yes | no | no |
| `view_sunset_slow_push` | View Sunset Slow Push | `push_in` | `KB` | `medium_take` 2-3s | `safe` | yes | no | no |
| `view_pan_location_proof` | View Pan Location Proof | `pan_left` | `KB` | `short_take` 1-1.5s | `safe` | yes | no | no |
| `outdoor_drone_like_lift_short` | Outdoor Drone Like Lift Short | `drone_like_lift` | `MX` | `short_take` 0.8-1.2s | `experimental` | no | no | no |

### Terrace Lifestyle Push

- ID: `terrace_lifestyle_push`
- Motive: `terrace`
- Eigenschaften: `outdoor`, `cozy`, `luxury`, `bright`
- Empfohlene Nutzung: Lifestyle value shot for outdoor living.
- Prompt-Hinweis: Push toward outdoor seating, dining, or usable terrace feature.
- Negativ-Hinweis: Do not crop out the relation to house, view, or usable surface.
- Hauptrisiken: empty paved area; harsh shadows; cluttered furniture
- Bekannte Failure Cases: terrace looks unused; weather weakens mood
- Notiz: Often a strong hero or supporting hero.

### Terrace Wide Pan

- ID: `terrace_wide_pan`
- Motive: `terrace`, `balcony`
- Eigenschaften: `outdoor`, `strong_lines`, `bright`
- Empfohlene Nutzung: Show terrace or balcony width when railing and horizon are stable.
- Prompt-Hinweis: Pan laterally with stable railing, horizon, and outdoor furniture lines.
- Negativ-Hinweis: Do not reveal weak edges, blown sky, or distorted railings.
- Hauptrisiken: railing geometry; bad right edge; overexposed view
- Bekannte Failure Cases: railing tremor; view blows out
- Notiz: Good for width, not for small cramped balconies.

### Balcony View Pull

- ID: `balcony_view_pull`
- Motive: `balcony`, `view`
- Eigenschaften: `outdoor`, `window_dominant`, `bright`
- Empfohlene Nutzung: Connect balcony usability with outlook or location proof.
- Prompt-Hinweis: Open from view or railing detail to the balcony context.
- Negativ-Hinweis: Do not make railing, horizon, or window frames unstable.
- Hauptrisiken: overexposed view; too narrow balcony; weak relation to property
- Bekannte Failure Cases: view cannot be read; balcony feels too small
- Notiz: Useful when view is more important than balcony size.

### Garden Family Pull

- ID: `garden_family_pull`
- Motive: `garden`
- Eigenschaften: `outdoor`, `cozy`, `bright`
- Empfohlene Nutzung: Family-home outdoor hero when the garden is a major value.
- Prompt-Hinweis: Reveal usable garden context from a clear green or seating anchor.
- Negativ-Hinweis: Do not end on flat empty lawn without property relation.
- Hauptrisiken: generic lawn; garden clutter; weak property connection
- Bekannte Failure Cases: garden lacks structure; motion reveals unmaintained areas
- Notiz: Strong family_home_warm anchor.

### Garden Parallax Float

- ID: `garden_parallax_float`
- Motive: `garden`, `terrace`
- Eigenschaften: `outdoor`, `deep_perspective`, `bright`
- Empfohlene Nutzung: Layered garden or terrace depth when foreground planting exists.
- Prompt-Hinweis: Add subtle separation between foreground planting, seating, and background.
- Negativ-Hinweis: Do not create cutout halos around plants, railings, or furniture.
- Hauptrisiken: complex foliage; wind-like artifacts; thin railings
- Bekannte Failure Cases: plant halos; furniture detaches from ground
- Notiz: Depth movement must stay subtle because foliage is fragile.

### View Sunset Slow Push

- ID: `view_sunset_slow_push`
- Motive: `view`
- Eigenschaften: `sunset`, `bright`, `outdoor`, `window_dominant`
- Empfohlene Nutzung: Atmospheric view or location hook.
- Prompt-Hinweis: Push subtly toward the horizon or strongest view feature while keeping horizon level.
- Negativ-Hinweis: Do not over-zoom into blown highlights or unstable window frames.
- Hauptrisiken: blown horizon; window reflections; weak connection to property
- Bekannte Failure Cases: view is unreadable; sunset color looks artificial
- Notiz: Good for calm premium or CTA-adjacent moments.

### View Pan Location Proof

- ID: `view_pan_location_proof`
- Motive: `view`, `balcony`, `terrace`
- Eigenschaften: `outdoor`, `window_dominant`, `deep_perspective`
- Empfohlene Nutzung: Short proof of outlook, skyline, water, or landscape.
- Prompt-Hinweis: Pan gently across the view with stable horizon and frames.
- Negativ-Hinweis: Do not reveal empty sky, blown highlights, or window-edge jitter.
- Hauptrisiken: unstable horizon; overexposure; bad left edge
- Bekannte Failure Cases: view is too bright to read; horizon drifts
- Notiz: Best when the view itself is legible.

### Outdoor Drone Like Lift Short

- ID: `outdoor_drone_like_lift_short`
- Motive: `terrace`, `garden`, `view`, `exterior`
- Eigenschaften: `outdoor`, `deep_perspective`, `sunset`
- Empfohlene Nutzung: Optional outdoor energy shot using depth or generated support later.
- Prompt-Hinweis: Suggest a mild upward lift from still imagery without pretending to be real aerial footage.
- Negativ-Hinweis: Do not invent new property surroundings, skyline, garden size, or camera altitude.
- Hauptrisiken: aggressive_motion_enabled false; no depth; high qwen_risk_score
- Bekannte Failure Cases: scene scale changes; neighboring buildings are invented
- Notiz: Experimental and should stay behind feature flags.

## Detail / Mood

| ID | Preset | Motion | Method | Duration | Risk | Text | Avatar | QW |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `detail_material_macro_push` | Detail Material Macro Push | `feature_focus` | `KB` | `micro_take` 0.5-0.8s | `safe` | no | no | no |
| `detail_light_mood_tilt` | Detail Light Mood Tilt | `tilt_up` | `KB` | `short_take` 0.8-1.2s | `medium` | no | no | no |
| `detail_perspective_nudge_micro` | Detail Perspective Nudge Micro | `perspective_nudge` | `QW` | `micro_take` 0.3-0.55s | `micro_only` | no | no | yes |
| `mood_cozy_breathe` | Mood Cozy Breathe | `push_in` | `KB` | `short_take` 1-1.5s | `safe` | yes | yes | no |
| `detail_transition_swipe_pan` | Detail Transition Swipe Pan | `pan_right` | `KB` | `micro_take` 0.45-0.75s | `medium` | no | no | no |

### Detail Material Macro Push

- ID: `detail_material_macro_push`
- Motive: `detail`, `kitchen`, `bathroom`
- Eigenschaften: `feature_object`, `luxury`, `strong_lines`
- Empfohlene Nutzung: Fast proof of material quality, fixture, or design detail.
- Prompt-Hinweis: Push slightly toward the detail while keeping the object recognizable.
- Negativ-Hinweis: Do not crop so close that the detail loses context.
- Hauptrisiken: unclear detail; macro blur; feature too small
- Bekannte Failure Cases: detail has no obvious value; shot fragments the story
- Notiz: Good rhythm shot between wider property frames.

### Detail Light Mood Tilt

- ID: `detail_light_mood_tilt`
- Motive: `detail`, `living`, `dining`, `bedroom`
- Eigenschaften: `cozy`, `bright`, `feature_object`
- Empfohlene Nutzung: Mood beat around lighting, ceiling height, or vertical decor.
- Prompt-Hinweis: Tilt gently from material or furniture detail toward light or height cue.
- Negativ-Hinweis: Do not end on empty ceiling or distracting light glare.
- Hauptrisiken: boring ceiling; glare; crooked verticals
- Bekannte Failure Cases: tilt has no payoff; light fixture clips
- Notiz: Use only when the tilt reveals real atmosphere.

### Detail Perspective Nudge Micro

- ID: `detail_perspective_nudge_micro`
- Motive: `detail`, `kitchen`, `bathroom`, `staircase`
- Eigenschaften: `feature_object`, `luxury`, `strong_lines`
- Empfohlene Nutzung: Very short experimental detail pop.
- Prompt-Hinweis: Suggest a tiny viewpoint shift around the detail without changing the object or material.
- Negativ-Hinweis: Do not change handles, fixtures, texture, seams, labels, or reflections.
- Hauptrisiken: qwen_risk_score above 50; reflective detail; precise product geometry
- Bekannte Failure Cases: object shape mutates; material texture changes
- Notiz: Useful only when the detail is visually strong enough for a hook.

### Mood Cozy Breathe

- ID: `mood_cozy_breathe`
- Motive: `living`, `bedroom`, `dining`, `detail`
- Eigenschaften: `cozy`, `bright`
- Empfohlene Nutzung: Soft mood beat in warm residential edits.
- Prompt-Hinweis: Use a minimal breathing push toward the calmest warm element.
- Negativ-Hinweis: Do not add dynamic diagonal or generated movement.
- Hauptrisiken: clutter mistaken for cozy; weak light; overly static sequence
- Bekannte Failure Cases: image feels generic; cozy cue is not visible
- Notiz: Simple fallback for warm pacing.

### Detail Transition Swipe Pan

- ID: `detail_transition_swipe_pan`
- Motive: `detail`, `kitchen`, `bathroom`, `staircase`
- Eigenschaften: `feature_object`, `strong_lines`
- Empfohlene Nutzung: Fast transition-like rhythm shot without building a transition library.
- Prompt-Hinweis: Use a quick but controlled lateral move across a strong line or detail.
- Negativ-Hinweis: Do not simulate a full transition effect or introduce blur-heavy styling.
- Hauptrisiken: motion blur expectation; weak edge crop; detail not readable
- Bekannte Failure Cases: shot reads as a failed transition; detail becomes unreadable
- Notiz: This is a motion preset only; transition rules come later.

## Branding / CTA

| ID | Preset | Motion | Method | Duration | Risk | Text | Avatar | QW |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `branding_logo_safe_card` | Branding Logo Safe Card | `text_card` | `KB` | `medium_take` 1.8-2.8s | `safe` | yes | yes | no |
| `branding_agent_background_hold` | Agent Background Hold | `text_card` | `KB` | `medium_take` 2-3s | `safe` | yes | yes | no |
| `cta_property_final_pull` | Property Final Pull | `pull_out` | `KB` | `medium_take` 1.8-3s | `safe` | yes | yes | no |
| `sold_showcase_micro_pop` | Sold Showcase Micro Pop | `diagonal_move` | `KB` | `micro_take` 0.45-0.75s | `medium` | yes | no | no |

### Branding Logo Safe Card

- ID: `branding_logo_safe_card`
- Motive: `branding`
- Eigenschaften: `feature_object`
- Empfohlene Nutzung: Agency or agent branding card with minimal motion.
- Prompt-Hinweis: Keep motion nearly static so logo, contact, or brand element remains readable.
- Negativ-Hinweis: Do not crop or animate logos so much that brand marks distort.
- Hauptrisiken: low-resolution logo; too much copy; brand dominates listing
- Bekannte Failure Cases: logo is too small; brand image unrelated to property
- Notiz: Useful mainly for CTA endings and agent_branding profiles.

### Agent Background Hold

- ID: `branding_agent_background_hold`
- Motive: `branding`, `living`, `open_plan`
- Eigenschaften: `bright`, `cozy`, `feature_object`
- Empfohlene Nutzung: Optional agent or avatar background when presenter mode is enabled later.
- Prompt-Hinweis: Use a calm background hold that leaves a clean presenter zone.
- Negativ-Hinweis: Do not let background motion fight a face, logo, or CTA.
- Hauptrisiken: avatar_enabled false; busy background; face or logo occlusion
- Bekannte Failure Cases: presenter covers the property value; background is not brand-safe
- Notiz: Avatar and presenter logic remains optional and out of scope for this session.

### Property Final Pull

- ID: `cta_property_final_pull`
- Motive: `exterior`, `garden`, `view`, `terrace`
- Eigenschaften: `outdoor`, `bright`, `cozy`
- Empfohlene Nutzung: Ending shot that leaves the property or strongest lifestyle value in view.
- Prompt-Hinweis: Open gently from the value cue to a readable final image for CTA overlay.
- Negativ-Hinweis: Do not end on clutter, empty sky, or an unclear property relation.
- Hauptrisiken: low text_overlay_score; weak final frame; no property identity
- Bekannte Failure Cases: final frame has no emotional value; CTA covers the best feature
- Notiz: CTA text style belongs to later typography/product-template sessions.

### Sold Showcase Micro Pop

- ID: `sold_showcase_micro_pop`
- Motive: `branding`, `exterior`, `detail`
- Eigenschaften: `feature_object`, `outdoor`, `bright`
- Empfohlene Nutzung: Short celebratory beat for sold_showcase without adding transition or typography systems.
- Prompt-Hinweis: Use a compact diagonal pop around a sold sign, facade cue, or brand-safe detail.
- Negativ-Hinweis: Do not animate legal text, contact details, or logos beyond readability.
- Hauptrisiken: brand readability; too much motion under text; unapproved claim copy
- Bekannte Failure Cases: motion makes sold message hard to read; branding overwhelms property
- Notiz: The visible product name and copy remain outside this preset library.


## Globale Failure Cases

- preset is treated as approved production render logic
- experimental QW or MX movement is used without feature flags and manual review
- hero_take uses aggressive perspective motion
- text_overlay_allowed is mistaken for a finished typography system
- avatar_overlay_allowed is mistaken for mandatory presenter use
- motion hides or changes the actual property value

## Naechste Nutzung

Diese Library ist erst die Preset-Grundlage. Spaeter koennen Matching- und
Ranking-Regeln die Presets gegen Motivklasse, Scores, Dauer, Creative Profile,
Feature Flags und manuelle Review-Kriterien auswerten. Das gehoert nicht in
Session 6.
