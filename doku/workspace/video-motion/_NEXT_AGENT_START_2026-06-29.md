# Next Agent Start - Video Motion / Qwen Recognition / Preview Failure

Timestamp: 2026-06-29 20:52 CEST

Branch: `codex/pipeline-handover-20260418`

## Start Here Tomorrow

Read these first, in this order:

1. `00_READ_FIRST_EVERY_SESSION.md`
2. `docs/START.md`
3. `docs/video-motion/_NEXT_AGENT_START_2026-06-29.md`
4. `docs/video-motion/_handover_qwen_vl_connection_2026-06-29.md`
5. `docs/video-motion/_handover_11111_qwen_preview_failure_2026-06-29.md`

Do not start with a broad workspace search.

## Current Truth

The Motion Lab pipeline has two separate truths now:

1. Recognition works.
2. The current preview/video implementation does not work as product output.

Qwen/DashScope recognition is live through the `qwen_vl` backend. It was tested
successfully on a local folder with 8 images.

The offline preview renderer generated MP4s, but Daniel correctly rejected the
result because the variants look essentially the same. The current output is a
technical proof, not a product proof.

## Relevant Commits

Recent root commits:

- `c7a7d781 Add local Keychain secret manager`
- `c3d9d00a Add Qwen VL recognition backend`
- `167f6a5f Document Motion Lab preview variant failure`

## What Was Tested

Input folder:

```text
/Users/danielfortmann/Desktop/11111
```

Persisted output folder:

```text
/Users/danielfortmann/Desktop/11111_motion_lab_qwen_2026-06-29
```

Result:

- `8` JPG images.
- `8/8` recognized by `qwen_vl` as real vision.
- `0` manual-review flags.
- minimum confidence: `0.95`.
- room classes:
  - `exterior`: 2
  - `living`: 3
  - `bedroom`: 2
  - `hallway`: 1
- strict offline proof generated:
  - `fast_social_teaser.mp4`
  - `balanced_listing_video.mp4`
  - `premium_calm.mp4`

## Why The Result Was Rejected

The three MP4s are technically distinct files with different durations, but
they are not meaningfully different videos.

Current causes:

- The shotplans use nearly the same selected images and order.
- `fast_social_teaser` and `balanced_listing_video` use `safe_frame_drift` for
  all shots.
- `premium_calm` uses `premium_safe_push`, but the offline renderer does not
  visibly implement that motion.
- `internal/motion-lab/server/rendering/offlinePreviewRenderer.ts` currently
  renders simple still-image cuts with safe 1280x720 framing.
- Variant concepts are not yet expressed through motion, crop path, shot
  selection, transitions, typography, or pacing.

## Do Not Do Next

- Do not run a 50-folder or 1500-image Qwen batch.
- Do not interpret technical MP4 generation as product success.
- Do not keep optimizing provider/secret plumbing before fixing video output.
- Do not touch `projects/piximmo-web`; it remains unrelated dirty state.
- Do not print or commit secrets.

## Next Work

Work on renderer and shotplan differentiation first, using the `11111` set as
the only test case.

Primary files:

```text
internal/motion-lab/server/rendering/offlinePreviewRenderer.ts
internal/motion-lab/server/planning/shotplan.ts
```

Minimum useful target:

1. Make motion presets visibly affect the preview:
   - slow push in
   - pull out
   - left/right pan
   - calm premium push
   - safe drift
2. Make variants differ beyond duration:
   - different shot order
   - different hero/repeat logic
   - different pacing
   - different motion choices per room type
3. Add or improve a debug report that explains per shot:
   - selected image
   - room class
   - reason selected
   - motion preset
   - crop/motion path
   - duration
4. Regenerate the three `11111` previews.
5. Ask Daniel to judge the videos before any larger run.

## Secret Handling

Use the local secret manager. Do not ask Daniel to paste keys.

Qwen command shape:

```text
npm run secrets -- run \
  --env DASHSCOPE_API_KEY=<ENTFERNT_API_KEY> \
  --env DASHSCOPE_BASE_URL=voleur_dashscope_base_url \
  --env DASHSCOPE_MODEL=voleur_dashscope_model \
  -- npm run motion-lab:recognize -- --root "/path/to/root" --backend qwen_vl --limit 1
```

The successful tests used the existing Voleur DashScope Keychain entries, not a
provider switch to the separate PixImmo/Alibaba credentials.

## Git / Workspace State

At the time of writing:

- Root work for this handover should be committed.
- `projects/piximmo-web` was already dirty/unrelated and must not be mixed into
  the Motion Lab work.

