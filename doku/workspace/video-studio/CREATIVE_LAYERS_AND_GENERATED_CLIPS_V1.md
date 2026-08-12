# Video Studio creative layers and generated clips v1

Status: canonical additive contract, 2026-08-11. This document describes local
Shared-service code only. It is not a deployment record.

## Trust boundaries

Ordinary Studio bearer requests never submit an R2 key for a font or an
occlusion mask. A portal BFF first uploads the object into its product-scoped
account library, then attests the internal reference through:

```text
POST /v1/video-projects/{projectId}/creative-assets/attest
```

The request uses the same product/timestamp/nonce/HMAC headers as the portal
handoff. Its schema is
`video_studio_creative_asset_attestation_v1` and its body binds `product`,
`projectId`, `tenantId`, `actorId`, `expectedRevision` and `creativeAssets`.
Attestations are replay-protected and merge by `assetId`. Font records contain
filename, MIME, size, family and rights confirmation. PNG mask records also
contain the exact source image's `sourceAssetId`. The public project exposes
only `assetId`, `kind`, display name and (for masks) `sourceAssetId`.

The Studio client selects up to eight already-attested fonts with:

```json
{
  "expectedRevision": 12,
  "fontAssetIds": ["font:company-sans"]
}
```

at `PUT /v1/video-projects/{projectId}/font-assets`. A take layer likewise
selects `maskAssetId`; `maskAsset.storageKey` and client-authored `ready` status
are rejected. Shared resolves both objects from its internal, actor-bound
registry. Fonts are at most 5 MiB and use TTF, OTF or WOFF2. A scene uses at
most 32 typography elements and 16 masks.

## Global brand layer

`brandOverlay` is one global layer for the complete film. New writes always
store `scope: "global"`; legacy `placement` values are migration input only.
Position, relative width, opacity and rotation are explicit. Shared derives the
rotated logo AABB from the logo aspect ratio in the 9:16 stage. Both that AABB
and a 2-percent padding must fit the stage and the declared `safeZone
{x,y,w,h}`. The render scene spec applies the logo from zero to the complete
calculated timeline duration after timeline blending.

## Typography and layers

Each take can contain independent `typographyElements[]`. Every element owns
its text, geometry (`x`, `y`, `widthRel`, rotation, `scaleX`, `scaleY`, align),
font, weight, relative size, color, opacity, spacing, line height, start/end
time, enter/exit animation and layer placement. `fontAssetId` is an ID only.

Movement while the element is visible is optional and additive:

```json
{
  "animationId": "left_to_right",
  "easing": "smooth",
  "holdStartMs": 100,
  "holdEndMs": 150
}
```

This object lives at `animation.during`. Its animation ID is exactly `none`,
`left_to_right`, `right_to_left`, `up_to_down` or `down_to_up`; easing is
`linear`, `ease_in`, `ease_out`, `ease_in_out` or `smooth`. Holds are integer
milliseconds from zero through 10,000. A missing object on a legacy element is
equivalent to `none/linear/0/0`. Directional motion traverses the full frame
once, never alternates or ping-pongs. Its movement window is the text interval
after enter delay/duration and before exit delay/duration, less both explicit
holds; a non-positive movement window fails closed.

`sceneLayers[]` contains architecture, object and one optional
`avatar_reserved` layer. The avatar layer is expressly non-renderable. A
`behind-object` typography element requires a ready PNG mask selected by ID.
Masks are defined in native still-image coordinates; the renderer applies the
same crop/pan/zoom transform as the source on every frame. Static masks are not
valid for a generated video clip, so behind-object typography on such a clip
fails closed until a tracked-mask contract exists.

## Motion catalog

The motion demo catalog preserves all 91 numbered motions from the historical
motion specification and separates `source_based` from `generative_ai`.
Catalog presence is not a renderability promise. `supportStatus` is one of:

- `renderable`: accepted directly in a scene render;
- `generation_draft`: valid only in the AI draft/generation/approval flow;
- `reserved`: visible capability vocabulary, rejected at the render boundary.

`motionSpec.parameters` prepares rotation, easing, start/end holds and strength;
start/end crop still owns center and zoom. Omitted strength means `1` for a
movement (`0` only for `still`), so the saved end frame is reached. Shared and the renderer must enable
new IDs together. Unknown or mismatched motion/capability/demo combinations
fail closed.

## AI drafts and generated clips

Project endpoint surface:

```text
PUT  /v1/video-projects/{projectId}/ai-studio-drafts/{draftId}
POST /v1/video-projects/{projectId}/ai-studio-drafts/{draftId}/approve
```

`selection.demoNumber` is the visible AI-Studio gallery choice (currently
1–18); it is independent from the technical `motion.demoNumber` in the 91-item
motion catalog. Shared derives the latter from `motionId`.

The status union is exactly `draft | selected | generating | generated |
approved | rejected | failed`. A draft records the selected source image and
demo number, catalog motion, storyboard and an explicit timeline activation:
replace one take or insert directly after one take. A project holds at most 100
drafts. Approval never blindly appends a duration.

Browser requests cannot submit `actualDurationSeconds`. A generated result must
arrive as a ready PreparedAsset/provider result with product-bound storage,
`audioPolicy: "reject"`, verified byte size (maximum 512 MiB), draft binding
and server-probed duration. Approval freezes that duration onto a new video
SourceAsset. Timeline calculation uses the frozen duration and never trims or
changes tempo to hit the desired total.

The scene spec carries a duration tolerance of
`max(0.1 seconds, actualDurationSeconds * 0.02)`. Larger ffprobe differences
fail with `media_duration_mismatch`; any audio stream fails with
`audio_not_allowed`.

`desiredTimelineDurationSeconds` is a soft target. Shared reports the real sum
as `timelineDurationStatus` with `within_target`, `over_target` or
`far_over_target`; it does not mutate the timeline to satisfy that target.

## Compatibility and limits

Legacy take `motion` and singleton `text` fields remain readable and normalize
into the additive contracts. Stand-image takes accept 0.6–10 seconds. A
timeline contains at most 120 scenes. Generated clips use their real duration
even when it lies outside that still-image range. Internal storage keys and
rights metadata are removed from public projects and public scene specs.

`PUT /v1/video-projects/{projectId}/selection` remains the only selection and
undo persistence contract. Its request is still `expectedRevision`, the full
ordered list of source `orderedAssetIds`, and the optional desired duration.
Shared keeps deselected source-bound takes in a bounded internal archive in the
same compare-and-swap record. Re-selecting an asset restores the complete take
(including crop, motion, typography, layers and review) before applying the
new active order. The archive is absent from public projects, scene specs,
timelines and immutable version snapshots. Empty and one-item selections remain
drafts; preview and render continue to require at least two active takes.

All preview and final scene specs use exactly 60 fps. FPS is server-owned and
cannot be supplied or changed by a project patch or client request.
