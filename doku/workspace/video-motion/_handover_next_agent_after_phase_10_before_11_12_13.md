# Next Agent Handover - After Phase 10, Before Phases 11-13

Date: 2026-07-01

## Situation

Daniel stopped this thread intentionally after Phase 10. Do not continue from
chat memory alone. Start from this file plus the phase handovers below.

Phases 11, 12, and 13 should be handled together in a fresh context because
they build on each other:

- Phase 11: minimal shotplan generator
- Phase 12: likely downstream shotplan/preview/render-adjacent logic
- Phase 13: likely continuation of the generator chain

Important: Phase 11 was read but not implemented in this thread. No Phase-11
files were created.

## Current Branch / Commits

Working branch:

- `codex/pipeline-handover-20260418`

Validated phase commits in order:

- `4954f6ba` - Add motion lab image catalog phase 1
- `c95311cd` - Add motion lab qwen raw import phase 2
- `34bbf11b` - Document video pipeline phase 1 2 audit
- `607e66ad` - Clarify motion lab recognition sources
- `4fff8cb5` - Add motion lab real vision adapters phase 4
- `00f978a7` - Add motion lab semantic profiles phase 5
- `3e913d7f` - Add motion lab planning gate phase 6
- `911975ca` - Audit motion lab phases 3 through 6
- `7184014b` - Add motion lab motion candidates phase 7
- `387cff74` - Add motion lab modal candidates phase 8
- `f06b4470` - Add motion lab review reports phase 9
- `92bf32dc` - Add PixCapture canon rules phase 10

This handover file is the next commit after those.

## Current Dirty State

Before writing this handover, `git status --short` showed only:

```text
 m projects/piximmo-web
?? tools/
```

These are unrelated pre-existing entries. Do not clean, stage, or commit them
unless Daniel explicitly asks.

## Official Phase Handovers

Read these in order when needed:

- `docs/video-motion/_handover_phase_01_catalog.md`
- `docs/video-motion/_handover_phase_02_qwen_import.md`
- `docs/video-motion/_handover_phase_03_recognition_sources.md`
- `docs/video-motion/_handover_phase_04_real_vision_backend.md`
- `docs/video-motion/_handover_phase_05_semantic_profiles.md`
- `docs/video-motion/_handover_phase_06_planning_gate.md`
- `docs/video-motion/_handover_intermediate_check_phase_03_06.md`
- `docs/video-motion/_handover_phase_07_motion_candidates.md`
- `docs/video-motion/_handover_intermediate_check_phase_07_motion_candidates.md`
- `docs/video-motion/_handover_phase_08_modal_candidates.md`
- `docs/video-motion/_handover_phase_09_reports_review_ui.md`
- `docs/video-motion/_handover_phase_10_canon_v1.md`

## Phase 10 Output

Canon files now exist in `rules/`:

- `rules/edit_canon_v1.yaml`
- `rules/motion_canon_v1.yaml`
- `rules/staging_canon_v1.yaml`
- `rules/avatar_canon_v1.yaml`
- `rules/edit_canon_v1.json`
- `rules/motion_canon_v1.json`
- `rules/staging_canon_v1.json`
- `rules/avatar_canon_v1.json`

Use JSON first for implementation to avoid adding YAML dependencies.

Canon status is intentionally:

- `status=draft_reference_derived`
- `approved_for_production=false`

The reference matrix is not absolute truth.

Matrix file used:

- `/Users/danielfortmann/Desktop/pixcapture_immobilienvideo_referenzmatrix_top100.xlsx`

All required sheets were present:

- `00 Dashboard`
- `01 Top100`
- `02 Top25 PixCapture`
- `03 Aggregat`
- `04 Schnittklassen`
- `05 Motion_Staging`
- `06 Quellen`
- `07 Templatequellen`

## Phase 11 Source

Daniel supplied:

- `/Users/danielfortmann/Desktop/video auftrag codex/pixcapture_codex_phase_plan/11_PHASE_11_SHOTPLAN_GENERATOR.md`

Summary of Phase 11:

- Build a minimal offline shotplan generator.
- CLI target:
  `npm run motion-lab:build-shotplan -- --profiles ./analysis/semantic_profiles --video-class 45_60s_listing_video --require-real-recognition true --out ./analysis/shotplans`
- Outputs:
  - `shotplan.json`
  - `shotplan.html`
  - optional contact sheet
- Required shot fields:
  - `shot_index`
  - `image_id`
  - `original_path`
  - `confirmed_room_type`
  - `recognition_source`
  - `reliability_level`
  - `video_role`
  - `shot_duration`
  - `motion_class`
  - `motion_intensity`
  - `text_overlay_allowed`
  - `avatar_allowed`
  - `risk_flags`
  - `reason`
  - `fallback_motion`

## Hard Boundaries For Phases 11-13

Do not start:

- final rendering
- avatar compositing
- generative video API
- paid external APIs
- DA3/SAM3 execution
- Modal submits

Phase 11 should only create audit-friendly shotplan proposals.

## Recommended Phase 11 Implementation Shape

Build a new offline CLI:

- `internal/motion-lab/server/buildShotplanCli.mjs`
- package script: `motion-lab:build-shotplan`

Inputs:

- `--profiles`: Phase 5 semantic profiles
- `--motion-candidates`: Phase 7 output, optional explicit path
- `--canon`: default `rules/edit_canon_v1.json`
- `--motion-canon`: default `rules/motion_canon_v1.json`
- `--video-class`
- `--require-real-recognition true`
- `--allow-low-reliability false`
- `--out`
- `--force`
- `--dry-run`

Suggested logic:

1. Load profiles.
2. Load Phase 7 motion candidates.
3. Filter eligible images:
   - include only `motion.review_status=candidate`
   - include only `motion.quality_evaluation_allowed=true`
   - reject mock / unknown / needs review / reliability none
   - reject low reliability unless explicit allow flag is used
4. Rank by canon video class sequence and Phase 7 fields:
   - `video_role_candidate`
   - `edit_priority`
   - `confirmed_room_type`
   - `usable_in_video_class`
5. Apply target image count and duration windows from
   `rules/edit_canon_v1.json`.
6. Emit selected `shots[]` and `excluded_images[]`.
7. Emit an audit summary that explains why every image was selected or excluded.

The existing Phase 7 synthetic test root can be reused for smoke tests:

- `/tmp/pixcapture_phase7_motion/semantic_profiles`
- `/tmp/pixcapture_phase7_motion/motion_candidates`

Regenerate it if missing by following Phase 7 test style; keep all test output
under `/tmp`.

## Expected Verification For Phase 11

At minimum:

- `node --check internal/motion-lab/server/buildShotplanCli.mjs`
- `npm run motion-lab:build-shotplan -- --help`
- synthetic run using Phase 5 profiles and Phase 7 motion candidates
- verify `shotplan.json` contains required shot fields
- verify excluded unsafe images are present and explained
- verify `source_trace` / report flags say no render/API/Modal/DA3/SAM3
- `git diff --check`
- `git status --short`

## Working Memory

Continuity-only note exists at:

- `CODEX_WORKING_MEMORY_DO_NOT_TOUCH/video-motion-current.md`

It is intentionally excluded from Git. Use it for compaction safety, but treat
tracked handovers as project truth.
