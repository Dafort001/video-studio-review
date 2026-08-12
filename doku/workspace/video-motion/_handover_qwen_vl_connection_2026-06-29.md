# Handover - Qwen VL Connection For Motion Lab

Timestamp: 2026-06-29 19:45 CEST

Branch: `codex/pipeline-handover-20260418`

## What Changed

Motion Lab recognition now has a live `qwen_vl` backend.

Code:

- `internal/motion-lab/server/recognition/qwenVlRecognitionBackend.ts`
- `internal/motion-lab/server/batchCli.mjs`

Docs:

- `docs/video-motion/REAL_ROOM_RECOGNITION.md`
- `docs/video-motion/RECOGNITION_SCHEMA_AND_BACKENDS.md`
- `docs/video-motion/_handover_real_room_recognition.md`

## Secret / Provider Boundary

The successful test used the existing Voleur DashScope store, not the newly
separate PixImmo/Alibaba store:

```text
npm run secrets -- run \
  --env DASHSCOPE_API_KEY=<ENTFERNT_API_KEY> \
  --env DASHSCOPE_BASE_URL=voleur_dashscope_base_url \
  --env DASHSCOPE_MODEL=voleur_dashscope_model \
  -- npm run motion-lab:recognize -- --root "$ROOT" --backend qwen_vl --limit 1 --force
```

Do not print or commit raw secret values. Do not overwrite Modal Secret
`dashscope-secret` or Keychain service `PixCapture/Voleur DashScope` with the
separate `PixImmo/Alibaba Cloud` values unless Daniel explicitly confirms that
provider switch.

## Implementation Notes

- `qwen_vl` calls DashScope's OpenAI-compatible `/chat/completions` endpoint.
- Required env:
  - `DASHSCOPE_API_KEY`
  - `DASHSCOPE_BASE_URL`
  - `DASHSCOPE_MODEL`
- The adapter sends:
  - `enable_thinking=false`
  - `response_format={ "type": "json_object" }`
  - one image as a data URL
- It writes per-image cache files under:

```text
work/{object_id}/analysis/vision/qwen_vl/{asset_id}.json
```

- It normalizes into the existing Motion Lab `image_recognition.json` schema.
- It sets:
  - `recognition_source=qwen_vl`
  - `recognition_backend=qwen_vl`
  - `is_real_vision=true`
  - reliability from confidence thresholds.

## Validation

Syntax:

```text
node --check internal/motion-lab/server/recognition/qwenVlRecognitionBackend.ts
node --check internal/motion-lab/server/batchCli.mjs
```

Missing-env safety:

- `qwen_vl` without env fails clearly.
- It does not fall back to mock, filename heuristics, or OpenAI.

Live test:

- Source image: local Desktop object-motion test image copied into `/tmp`.
- The temporary copy was downscaled to 1024 px long edge before upload.
- Command used the local secret manager and the Voleur DashScope Keychain
  entries.
- Result:
  - `ok=true`
  - `backend=qwen_vl`
  - `image_count=1`
  - no warnings
  - output schema valid
- Returned summary classified the image as `bedroom`, confidence `0.95`,
  reliability `high`, `usable_for_video=true`, `needs_manual_review=false`.

No raw API response or secret value was committed.

## Next Step Tomorrow

Run a small real batch, not a full 50-folder run yet:

1. Prepare or point to the real Motion Lab root.
2. Import if needed:

```text
npm run motion-lab:import -- --root "/Volumes/PIX_MOTION_TEST" --limit 5
```

3. Run Qwen recognition:

```text
npm run secrets -- run \
  --env DASHSCOPE_API_KEY=<ENTFERNT_API_KEY> \
  --env DASHSCOPE_BASE_URL=voleur_dashscope_base_url \
  --env DASHSCOPE_MODEL=voleur_dashscope_model \
  -- npm run motion-lab:recognize -- --root "/Volumes/PIX_MOTION_TEST" --backend qwen_vl --limit 5
```

4. Review `image_recognition.json` quality before planning/rendering.
5. Only after Daniel accepts the recognition quality, run strict planning:

```text
npm run motion-lab:proof -- --root "/Volumes/PIX_MOTION_TEST" --limit 5 --mode offline --backend qwen_vl --require-real-recognition true
```

## Stop Rules

- Do not run a large batch silently; Qwen calls cost money.
- Do not print secrets.
- Do not treat one successful image as 50-folder quality validation.
- Do not touch `projects/piximmo-web`; it was already dirty and unrelated.
- Do not switch from Voleur DashScope secrets to PixImmo/Alibaba secrets without
  Daniel's explicit confirmation.
