# Shared Video Studio API v1

Status: server core and production persistence implemented, deployed and
verified, 2026-08-10. PixImmo is connected through a direct verified preview;
PixCapture's portal adapter is still open.

## Architecture and trust boundary

PixImmo and PixCapture use one neutral Video Studio service, but never share a
customer session or project scope. Each portal creates a short-lived signed
handoff with its own HMAC secret. The service binds the resulting session token
to exactly one `product`, `tenantId`, `actorId` and `projectId`. A token from one
product or tenant cannot address another project.

The portal handoff is the only project creation path. It contains internal
storage keys, but these keys and all renderworker references are removed from
public responses. The external render service is an internal worker adapter;
it does not authenticate customers and does not own project state.

The included file store writes atomically and is suitable for local or
single-instance integration tests. Production uses the PostgreSQL store (Neon
is supported), which keeps projects, jobs and replay nonces durable and
enforces the same compare-and-swap revision contract across multiple instances.

## Product rule

The broker owns the image selection, start image and complete take order. The
studio may explain pacing problems and propose explicit changes. It must never
silently reorder takes.

The same project opens in two views:

- `guided`: quick, assisted decisions and a complete first suggestion.
- `detailed`: the same data with per-take framing, timing, movement, text,
  prepared visual moments and presenter controls.

Switching views is lossless. The guided view must not overwrite detailed-only
decisions.

The editing view is independent from the selected video intention. Initial
intentions are `balanced_property_story`, `dynamic_highlights`,
`calm_premium`, `presenter_story` and `custom`; they all use the same project
and take contract.

## Public language rule

Client responses may contain user-facing capability labels, but never provider,
model or infrastructure names. Examples:

- `move_closer` -> `Sanft näher kommen`
- `spatial_depth` -> `Mehr räumliche Tiefe`
- `perspective_shift` -> `Perspektive leicht verändern`
- `layered_composition` -> `Elemente räumlich anordnen`

Provider routing belongs exclusively to server-side worker adapters. Projects,
takes, prepared assets and jobs store the same open `CapabilityId`; enabled
capabilities are an ID list rather than fixed feature booleans.

The open capability and routing contract is specified in
`CAPABILITY_REGISTRY_V1.md`. New processing modes use the `extension.*`
namespace and do not require a `VideoProject` schema change.

## Resource model

```text
Product context
  -> VideoProject (vertical video in v1)
     -> SourceAsset[]
     -> AssetAnalysis[] (separate, versioned per asset)
     -> VideoTake[] (broker-owned order)
     -> PreparedAsset[] (cached and reviewable)
     -> DirectionNotice[]
     -> StudioJob[]
     -> Deliverable[]
```

`VideoProject` is the single source of truth for both products and both editing
views. Every update carries a project revision so a delayed preparation or
render job cannot silently publish output for an older edit.

## Endpoint surface

```text
GET    /health
POST   /v1/handoffs/exchange
POST   /v1/video-projects/{projectId}/creative-assets/attest
GET    /v1/video-projects/{projectId}
PATCH  /v1/video-projects/{projectId}
POST   /v1/video-projects/{projectId}/bootstrap
PUT    /v1/video-projects/{projectId}/selection
PUT    /v1/video-projects/{projectId}/timeline
PATCH  /v1/video-projects/{projectId}/takes/{takeId}
PUT    /v1/video-projects/{projectId}/brand-overlay
PUT    /v1/video-projects/{projectId}/font-assets
PUT    /v1/video-projects/{projectId}/ai-studio-drafts/{draftId}
POST   /v1/video-projects/{projectId}/ai-studio-drafts/{draftId}/approve
POST   /v1/video-projects/{projectId}/takes/{takeId}/review
POST   /v1/video-projects/{projectId}/analysis
GET    /v1/video-projects/{projectId}/assets/{assetId}/analysis
GET    /v1/video-projects/{projectId}/scene-spec?purpose=preview|final
POST   /v1/video-projects/{projectId}/direction-review
POST   /v1/video-projects/{projectId}/renders
POST   /v1/video-projects/{projectId}/approve
GET    /v1/video-projects/{projectId}/jobs/{jobId}
```

The additive global-logo, independent typography/layer, signed creative-asset
attestation, generated-clip and AI-draft contracts are specified in
`CREATIVE_LAYERS_AND_GENERATED_CLIPS_V1.md`.

Prepared-asset and deliverable endpoints remain part of the wider contract but
are not exposed by the v1 server core yet.

### Exchange a portal handoff

`POST /v1/handoffs/exchange` accepts a JSON body signed by the originating
portal. Required headers are `x-video-studio-product`,
`x-video-studio-timestamp`, `x-video-studio-nonce` and
`x-video-studio-signature`. The signature covers product, timestamp, nonce and
the exact body hash. Requests expire after five minutes and nonces are
single-use. PixImmo and PixCapture must use separate secrets.

```json
{
  "schemaVersion": "video_studio_handoff_v1",
  "product": "piximmo",
  "tenantId": "agency_456",
  "actorId": "user_789",
  "sourceReference": { "type": "job", "id": "job_123" },
  "name": "Wohnung am Stadtpark",
  "returnUrl": "/jobs/job_123",
  "assets": [
    {
      "id": "image_1",
      "kind": "image",
      "storageKey": "agency_456/job_123/image_1.jpg",
      "filename": "Aussen.jpg",
      "width": 3000,
      "height": 2000,
      "motif": "exterior"
    },
    {
      "id": "image_2",
      "kind": "image",
      "storageKey": "agency_456/job_123/image_2.jpg",
      "filename": "Wohnen.jpg",
      "width": 3000,
      "height": 2000,
      "motif": "living"
    }
  ]
}
```

The response contains the source-bound project and a 15-minute bearer token.
All following project routes require that token. Source manifests are never
silently replaced: a changed portal source produces a conflict until an
explicit synchronization path is implemented.

### Set the broker-owned image selection

The ordered asset IDs determine which source images are active, their order and
the start image. Drafts may contain zero or one image; preview and final render
still require at least two. The same write may update the 30/45/60-second target.

```json
{
  "expectedRevision": 3,
  "orderedAssetIds": ["image_2", "image_1"]
}
```

For a newly exchanged project, a portal may apply its complete initial
briefing atomically through `POST /bootstrap`: project direction, ordered image
selection and sparse take patches are validated first and persisted as one
revision. This endpoint succeeds only once, at the untouched initial revision;
it can therefore never overwrite later broker work during a repeated handoff.

### Set the broker-owned timeline

The ID list is authoritative and supplied by the broker. It must contain every
take exactly once. `startTakeId` must be the first ID. The server normalizes
`order` numbers but must not change relative order.

```json
{
  "expectedRevision": 7,
  "startTakeId": "take_001",
  "orderedTakeIds": ["take_001", "take_002", "take_003"]
}
```

### Update one take

Take updates are sparse patches. Fields omitted by the client remain unchanged.
Every editable field records whether its current decision came from the broker
or from a system suggestion. A system suggestion may fill undecided fields but
must never overwrite a broker decision. This is the enforced A/B losslessness
rule, not merely a frontend convention.

```json
{
  "expectedRevision": 8,
  "patch": {
    "durationSeconds": 3.5,
    "durationSource": "manual",
    "transitionIn": "crossfade",
    "transitionInSeconds": 0.3,
    "motion": "move_closer",
    "text": {
      "enabled": true,
      "styleId": 2,
      "title": "Licht und Weite",
      "subtitle": "Wohnen mit Blick in den Garten",
      "purpose": "hook",
      "position": { "x": 0.08, "y": 0.72, "width": 0.72 },
      "typography": {
        "preset": "architecture",
        "color": "#FFFFFF",
        "titleSize": 58,
        "subtitleSize": 28,
        "align": "left"
      }
    }
  }
}
```

The six approved text styles are enforced by the service rather than only by
the editor. Selecting a style snapshots its concrete font, weights, relative
sizes, color, opacity, spacing, line height, backdrop, animation and maximum
width into the take. The renderer therefore receives concrete values; the
style ID is provenance, not a live lookup that can silently restyle an older
project.

| ID | Style | Hard content limit | Entrance |
|---|---|---|---|
| 1 | Klar | headline 28, subline 40 | slide-up, 400 ms |
| 2 | Redaktion | headline 24, subline 36 | fade, 600 ms |
| 3 | Bogen | headline 20, label 16 | wipe, 500 ms |
| 4 | Journal | headline 18, up to three values of 14 characters | slide-in, 300 ms |
| 5 | Ruhe | 32 characters total, no subline | letter-by-letter, 600 ms |
| 6 | Schlag | one word, 12 characters | none |

Only Schlag is accepted on takes below 1.5 seconds. `safeAreaLock` defaults to
true with 14 percent reserved at the top and 20 percent at the bottom. The
render manifest explicitly disables hyphenation and instructs the renderer to
shrink an overflowing single word instead of breaking it.

The data and render contract is implemented locally. Visual font parity is not
yet an acceptance point: the pinned Inter, Fraunces, Outfit, Archivo Narrow,
Newsreader and Archivo files (browser WOFF2 plus renderer TTF/OTF from the same
source, including licenses) still have to be added. Until that asset block is
complete, browser fallbacks must not be treated as a final typography proof.

New takes use `durationSource: "pattern"` and the project's
`rhythmPatternId` (default `puls`). `POST /applyPattern` applies one of `puls`,
`ruhig`, `zweier`, `auftakt`, or `ausklang` to pattern-owned takes only;
manual durations are never overwritten. `POST /fitToTarget` scales only
pattern-owned takes and clamps the shared factor to ±20 percent.

Crossfades are effective only when both adjacent takes are at least 1.5 seconds
long and are capped at `min(0.3s, 0.25 × shorter take)`. The authoritative film
duration is the sum of take durations minus effective crossfade overlaps. The
same calculation feeds direction review and the internal render manifest.

`POST /versions` creates an immutable snapshot of the current revision. This is
the explicit “Version festhalten” action and is separate from autosave.

### Analysis and native quality

`POST /analysis` submits only the selected project's internally stored R2
keys to the existing `pix-social-video` analysis contract. The public job never
contains the worker call ID. Completed results are stored independently by
`projectId + assetId` with a pinned `analysisVersion`; asking for an asset that
does not belong to the authorized project returns 404.

The quality calculation uses the native source height and the tightest crop:
`r = nativeHeight / (1920 × scale)`. Values below 1.0 are `ungeeignet` and the
zoom is capped at native output resolution. Values from 1.0 to below 1.3 are
`eingeschränkt`; 1.3 or above is `sicher`, unless a relevant instance mask is
cut by the crop. Takes shorter than 1.2 seconds are forced to `still`.

`POST /takes/{takeId}/review` explicitly confirms one saved scene. A later
change to duration, movement, start/end crop or clip order clears `reviewedAt`.
Autosave never confirms a scene implicitly.

### Direction review

The response follows the product pattern `observation -> impact -> suggestion
-> explicit action`. Actions may change timing, movement, text or prepared
moments. No action may reorder takes without a separate user-confirmed order
update.

### Prepared asset

A prepared visual moment is generated before the final render and stored as a
reviewable asset. The project references the approved asset by ID. This keeps
preview and final render repeatable and lets the broker reject or regenerate a
single scene without rendering the complete video again.

### Render

`scene-spec` is the sole saved geometry contract for browser preview and the
renderer. It contains subpixel crop coordinates, effective transition overlap,
the concrete text overlay and a revision-pinned render profile. Its public form
contains asset IDs but never internal storage keys; the render adapter resolves
the same internal specification to authorized R2 keys.

The v1 profile renders motion at 2160 × 3840 and downsamples with Lanczos in
linear light. Source transfer is sRGB and BT.709 output is explicitly converted,
not merely tagged. FFmpeg is encode-only, `zoompan` is forbidden, frame
interpolation is off, and coordinates remain floating point. Preview uses the
same 1080 × 1920 geometry at 540 × 960; preview and final both render natively
at the version's current 60 fps. Named sharpening profiles distinguish 6000-px,
12-MP and unknown source material without embedding an uncalibrated strength.

```json
{
  "expectedRevision": 12,
  "purpose": "preview"
}
```

The API translates this into the neutral `render.timeline` capability with a
`preview` or `final` purpose.
The selected worker is an internal implementation detail. Client-visible job
and review messages use a fixed neutral message code; raw worker errors and
provider names never pass through to the product interface.

Starting a preview freezes a new immutable version and moves the project to
`preview_rendering`. Job completion moves it to `preview_ready` while keeping
the older preview/version available for comparison. `POST /approve` accepts
only that exact succeeded preview version and only after every take has an
explicit `reviewedAt`. Final rendering always reads the approved snapshot,
never a mutable current draft. Any later content edit clears
`approvedVersionId`; final start then fails closed until another preview is
reviewed and approved. PixImmo polls only while a preview or final job is
active and exposes separate “Preview freigeben” and “Endfassung erstellen”
actions.

## Initial capability set

- reliable movement from the original image;
- depth-aware spatial movement;
- slight perspective variation for suitable highlights;
- foreground reveal;
- spatial composition of property, text and presenter;
- uploaded or saved presenter in intro/outro;
- inexpensive preview and approved final render.
- first/end-view transitions, reference-guided scenes and partial scene repair;
- optional voice, music and subtle scene atmosphere;
- stabilization, frame refinement and output refinement;
- automatic source-fidelity comparison before approval.

Depth and segmentation data are reusable evidence. They can improve motion,
occlusion, text-safe areas and presenter placement without becoming separate
controls in the broker interface.

Multi-image alignment is only relevant when a source is an actual bracket or
capture sequence. It is not part of the normal single-photo video path.

## Runtime configuration

The local service starts with `npm run video-studio:server` and fails closed
unless these secrets are configured with at least 32 characters:

- `VIDEO_STUDIO_SESSION_SECRET`
- `PIXIMMO_VIDEO_STUDIO_HANDOFF_SECRET`
- `PIXCAPTURE_VIDEO_STUDIO_HANDOFF_SECRET`

The two portal handoff secrets must differ. Optional settings are
`VIDEO_STUDIO_HOST`, `VIDEO_STUDIO_PORT`, `VIDEO_STUDIO_DATA_DIR` and the
comma-separated `VIDEO_STUDIO_ALLOWED_ORIGINS`. Renderworker URL and secret
must be configured together. Production mode requires an explicit origin
allowlist for both portals.

Set `VIDEO_STUDIO_DATABASE_URL` to use the production PostgreSQL/Neon store.
Without it the server deliberately falls back to the local single-instance
file store; a production deployment must never use that fallback.

The Vercel function lives at `api/studio.ts`; `vercel.json` exposes the same
`/health` and `/v1/*` contract as the long-running Node server. The Vercel
project is `pix-shared-video-studio` in region `fra1`. Its dedicated Neon
resource is Frankfurt `free_v3`, without Neon Auth, using the
`VIDEO_STUDIO_` environment prefix; neither portal's customer database is
reused. The stable service alias is
`https://pix-shared-video-studio.vercel.app`. The PixImmo preview remains
pinned to the exact signed-E2E deployment URL until the portal rollout is
completed.
