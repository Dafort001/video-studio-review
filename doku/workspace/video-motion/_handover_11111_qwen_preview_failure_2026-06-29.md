# Handover - Qwen Recognition Works, Preview Variants Fail

Timestamp: 2026-06-29 20:51 CEST

Branch: `codex/pipeline-handover-20260418`

## Short Truth

Today proved the Motion Lab can run real Qwen/DashScope recognition on a local
folder and use that recognition in the strict offline proof path.

It did not prove the product video direction works.

Daniel reviewed the generated MP4 previews and correctly pointed out that the
variants look essentially the same. The current implementation creates
technically different files, but not meaningfully different videos.

## Input Tested

Source folder:

```text
/Users/danielfortmann/Desktop/11111
```

Input:

- `8` JPG files.
- Copied into a temporary Motion Lab root under `/tmp`.
- Temporary copies were resized to `1024 px` long edge before Qwen calls.
- Originals on Desktop were not modified.

Persisted result folder:

```text
/Users/danielfortmann/Desktop/11111_motion_lab_qwen_2026-06-29
```

Important outputs:

```text
output/11111/previews/fast_social_teaser.mp4
output/11111/previews/balanced_listing_video.mp4
output/11111/previews/premium_calm.mp4
work/11111/analysis/image_recognition.json
work/11111/shotplans/*.json
reports/proof_report.html
```

## What Worked

Qwen recognition:

- Backend: `qwen_vl`
- Images: `8/8`
- Real vision: `8/8`
- Manual review required: `0`
- Minimum confidence: `0.95`
- Room classes:
  - `exterior`: 2
  - `living`: 3
  - `bedroom`: 2
  - `hallway`: 1

Strict offline proof:

- `ok=true`
- `require_real_recognition=true`
- recognition quality allowed planning
- 3 preview MP4 files were generated

This proves the technical chain:

```text
folder -> import -> qwen_vl recognition -> strict planning -> offline preview render
```

## What Failed

The generated preview variants do not communicate distinct video concepts.

Observed:

- `fast_social_teaser`, `balanced_listing_video`, and `premium_calm` use almost
  the same image order.
- `fast_social_teaser` and `balanced_listing_video` both use
  `safe_frame_drift` for all selected shots.
- `premium_calm` uses `premium_safe_push`, but the offline renderer does not
  visibly implement that preset as motion.
- The current offline renderer renders still-image cuts with safe framing:

```text
scale=1280:720:force_original_aspect_ratio=decrease,
pad=1280:720:(ow-iw)/2:(oh-ih)/2,
format=yuv420p
```

It does not meaningfully apply:

- push/pull/pan motion
- variant-specific crop paths
- different image selection logic
- different sequencing language
- transitions
- typography/script/voice timing
- product-specific pacing

So the MP4s are technically separate encodes with different durations, but they
are visually close enough that Daniel's product verdict is: implementation
fails.

## Important Interpretation

Do not spend tomorrow scaling Qwen to 50 folders before fixing this.

The problem is no longer "can we recognize rooms?" The problem is that the
recognized data is not yet translated into differentiated, useful motion-video
output.

Recognition is a useful input layer. It is not the product result.

## Likely Fix Direction Tomorrow

Start with renderer and shotplan differentiation, not provider work.

Minimum useful next work:

1. Make the offline renderer visibly implement at least basic Ken Burns style
   motion from `motion_preset_id`:
   - slow push in
   - pull out
   - left/right pan
   - calm premium push
   - safe drift
2. Make the three variants differ beyond duration:
   - different shot order
   - different selected images or repeated hero logic
   - different motion presets per room type
   - different pacing curves
3. Add a visual/debug report that lists per shot:
   - image
   - room class
   - reason selected
   - motion preset
   - crop/motion path
   - duration
4. Regenerate only the `11111` set first.
5. Let Daniel judge the three videos before any larger batch.

## Concrete Starting Points

Renderer:

```text
internal/motion-lab/server/rendering/offlinePreviewRenderer.ts
```

Planner:

```text
internal/motion-lab/server/planning/shotplan.ts
```

Existing test output:

```text
/Users/danielfortmann/Desktop/11111_motion_lab_qwen_2026-06-29
```

Qwen connection handover:

```text
docs/video-motion/_handover_qwen_vl_connection_2026-06-29.md
```

## Stop Rules

- Do not run a 50-folder / 1500-image Qwen batch until Daniel accepts one
  visibly improved small video set.
- Do not treat technical MP4 generation as product success.
- Do not touch `projects/piximmo-web`; it remains unrelated dirty state.
- Do not print or commit secrets.
- Do not switch provider secrets; the successful Qwen tests used existing
  Voleur DashScope Keychain entries through `npm run secrets -- run`.
