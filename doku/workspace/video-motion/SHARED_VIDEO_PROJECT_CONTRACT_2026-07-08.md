# Shared Video Project Contract - 2026-07-08

This is the current contract for the PixImmo/PixCapture shared video workbench.
It is intentionally product-neutral. PixImmo and PixCapture should call the same
pipeline instead of maintaining separate prompt, provider, cost, and status
logic.

## Current local implementation

Prototype hosts:

- `projects/piximmo-web`
- `projects/pixcapture-web`

Shared project API:

- `GET /api/video-workbench/projects/:projectId`
- `PATCH /api/video-workbench/projects/:projectId`

Current project id:

- `candidate-10-shared-video-project-v1`

Production-capable store:

- Postgres table `VideoWorkbenchProject`
- Prisma model `VideoWorkbenchProject`
- Manual migration file in both repos:
  `prisma/migrations/manual_video_workbench_projects.sql`

Local fallback stores:

- `projects/piximmo-web/.video-workbench/projects/candidate-10-shared-video-project-v1.json`
- `projects/pixcapture-web/.video-workbench/projects/candidate-10-shared-video-project-v1.json`

The filesystem stores are local fallback stores with the same schema. The API
uses Postgres first when `DATABASE_URL` is configured. A single central shared
backend across both domains is still a later product decision.

## Sections

The shared `videoProject` has these independent sections:

- `timeline`: cutplan, selected motifs, durations, order, linked/block status.
- `motion`: crop/motion/text/avatar preparation from the motion editor.
- `presenter`: Maklerin/Veo page state, presenter references, per-take motion.
- `promptPipeline`: German customer prompt, corrected German semantic step,
  final English Veo prompt, negative prompt, active template.
- `providerJobs`: future Google Veo/FAL job status, result URLs, costs.
- `exports`: future render/export status.

## Prompt pipeline

User-facing input may remain German. Provider-facing prompt output must be
controlled English.

Flow:

1. Customer writes German prompt.
2. Backend normalizes it with semantic video rules.
3. Backend returns corrected German intermediate state and English Veo prompt.
4. Video provider receives the English prompt and negative prompt.

Current prompt normalization API:

- `POST /api/video-workbench/prompt/normalize`

Provider priority:

1. Google/Gemini text model for prompt normalization.
2. Local deterministic fallback if no `GOOGLE_GEMINI_API_KEY` is available or
   the model call fails.
3. Google Veo should become the primary video provider if project access and
   billing are confirmed.
4. FAL remains a fallback/test provider only.

## Frontend rule

The three current workbench pages are views over the same project, not separate
products:

- `/dashboard/video-studio?candidate=10`
- `/dashboard/video-studio/motion`
- `/dashboard/video-studio/maklerin`

PixImmo and PixCapture may render different product-specific frontends later,
but they should write to the same project sections and call the same prompt/video
pipeline.

Current implementation status as of 2026-07-09:

- PixImmo has timeline, motion, and maklerin/presenter prototype routes.
- PixCapture has timeline and motion prototype routes only.
- The shared browser store script is configured by `data-source-product` so
  `lastWriter.sourceProduct` records `piximmo` or `pixcapture`.
- The API is DB-backed when `DATABASE_URL` is configured and falls back to the
  local filesystem only for local/prototype resilience.
- PixImmo and PixCapture currently have schema-compatible stores. A single
  central shared store across both domains is not yet implemented.

## Render/export contract

Current render API:

- `POST /api/video-workbench/projects/[projectId]/render/start`
- `GET /api/video-workbench/projects/[projectId]/render/status`
- `GET /api/video-workbench/projects/[projectId]/render/download?jobId=<jobId>`

The start route accepts a Motion section payload with `items[]` and renders the
current Workbench video as 9:16 H.264 MP4. The website routes do not run
FFmpeg and do not store video bytes. They only start and poll the Voleur Modal
worker:

- `POST https://dafort001--pix-social-video-social-video-api.modal.run/render/workbench/start`
- `GET https://dafort001--pix-social-video-social-video-api.modal.run/render/workbench/status/<callId>`

The Modal worker reads source images or source video clips from R2, renders
temporary files only in Modal, uploads the final video to R2 under
`video-workbench/renders/<projectId>/<jobId>.mp4`, and the website exposes it
through the authenticated download route. The website records render jobs in
the project `exports` section with `providerCallId`, `status`, `outputKey`,
`outputUrl`, `durationSeconds`, and `itemCount`.

Still-image scenes provide `r2Key`. Pre-rendered clip scenes provide
`videoR2Key`, for example the candidate-10 Maklerin opening clip at
`video-workbench/source-assets/motion/candidate-10-maklerin-first-preview.mp4`.
All Workbench renders are normalized to H.264, `1080x1920`, `60fps`.

Verified local contract sample for `candidate-10-shared-video-project-v1`:

- 26 items
- 33.25 seconds planned duration
- delivered MP4 from Website -> R2 download route: H.264, 1080x1920, 60fps,
  33.533333s

Production rule: Vercel/PixImmo/PixCapture are orchestration and routing only.
Video bytes are not generated, stored, or cached in Vercel. FFmpeg execution
belongs to Voleur Modal; source and output artifacts belong to R2.
