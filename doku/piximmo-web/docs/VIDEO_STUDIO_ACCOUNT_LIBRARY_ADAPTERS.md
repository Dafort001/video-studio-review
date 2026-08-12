# Central Video Studio account library adapters

The canonical Video Studio host reads and writes personal logos, company fonts
and editing presets through one server-side API. The browser supplies only the Shared
project id. The host resolves the HttpOnly Shared session, reads the authorized
Shared project, and selects the product adapter from `project.product`. The
database key is always the authorized Shared `actorId`; a browser-provided user
id is never accepted.

## Required product configuration

Both products must be configured independently. Production has no fallback to
the canonical host's ordinary `DATABASE_URL` or `R2_*` values.

PixImmo:

- `CENTRAL_VIDEO_STUDIO_PIXIMMO_DATABASE_URL`
- `CENTRAL_VIDEO_STUDIO_PIXIMMO_R2_ACCOUNT_ID`
- `CENTRAL_VIDEO_STUDIO_PIXIMMO_R2_ENDPOINT_URL`
- `CENTRAL_VIDEO_STUDIO_PIXIMMO_R2_ACCESS_KEY_ID`
- `CENTRAL_VIDEO_STUDIO_PIXIMMO_R2_SECRET_ACCESS_KEY`
- `CENTRAL_VIDEO_STUDIO_PIXIMMO_R2_BUCKET_NAME`
- `PIXIMMO_VIDEO_STUDIO_HANDOFF_SECRET` (also signs post-launch creative-asset attestations)

PixCapture:

- `CENTRAL_VIDEO_STUDIO_PIXCAPTURE_DATABASE_URL`
- `CENTRAL_VIDEO_STUDIO_PIXCAPTURE_R2_ACCOUNT_ID`
- `CENTRAL_VIDEO_STUDIO_PIXCAPTURE_R2_ENDPOINT_URL`
- `CENTRAL_VIDEO_STUDIO_PIXCAPTURE_R2_ACCESS_KEY_ID`
- `CENTRAL_VIDEO_STUDIO_PIXCAPTURE_R2_SECRET_ACCESS_KEY`
- `CENTRAL_VIDEO_STUDIO_PIXCAPTURE_R2_BUCKET_NAME`
- `PIXCAPTURE_VIDEO_STUDIO_HANDOFF_SECRET` (required before PixCapture font uploads are enabled)

Each R2 endpoint must be exactly
`https://<32-character-account-id>.r2.cloudflarestorage.com`. Credentials,
endpoint details, and database error messages must not be logged.

## Database and bucket prerequisites

Before enabling a product adapter, its product database must contain the
current `VideoStudioBrandAsset`, `VideoStudioPreset`, and
`VideoStudioFontAsset` tables and their
relations to that product's `User` table. The canonical host currently uses the
matching Prisma models present in both portal schemas; deploy the existing
portal migrations to each database before setting the adapter environment
variables.

The additive font migration is
`prisma/migrations/manual_video_studio_font_assets.sql`. Apply it separately to
each product database before enabling font upload for that product. It does not
modify existing logo or preset rows.

The configured product R2 credential needs read, write, and delete access only
to its configured bucket. New objects use the product-separated path
`video-studio/<product>/<actor-hash>/brand/<asset-id>.png`. Do not point both
adapters at one product's database or bucket merely to satisfy configuration.
Fonts use the adjacent actor-bound `fonts/` prefix and are limited to 5 MB per
TTF, OTF, or WOFF2 file. A rights confirmation is mandatory. The browser never
receives the object key: the host signs a project/product/tenant/actor-bound
Shared attestation, then selects only the returned font asset id. A project may
select at most eight company fonts.

The 5 MB input limit and 2048 px normalization apply only to uploaded brand
logos. Property and scene source images are not resized before motion or render
work. Their short-lived `sourcePreviewUrl` is display-only; the Shared asset's
unchanged `storageKey` remains the delivery source for analysis and rendering.

## Failure behavior and verification

If an adapter is missing, misconfigured, or temporarily unavailable, the
canonical editor remains usable and disables only personal logos and presets.
Account API calls fail closed. A failed database registration removes the exact
object uploaded by that call; tests use injected in-memory adapters and fake
upload callbacks and never write to production databases or buckets.

Deployment verification for each product:

1. Open the canonical workbench from that portal and confirm existing logos and
   presets and company fonts belong to the signed-in account.
2. Upload one temporary logo, save and apply one temporary preset, and confirm
   the other product and a second account cannot see or resolve either id.
3. Remove the temporary records and object using the product's normal
   operational cleanup process.
