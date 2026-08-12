# Video Studio Product Storage Contract

PixImmo and PixCapture use separate object-storage accounts. A Video Studio
worker must therefore resolve every source and result through a product-bound,
server-configured storage registry. Object keys are not globally unique.

## Trust boundary

The only storage selector accepted over HTTP is the closed product enum
`piximmo | pixcapture`. Requests never contain a bucket, endpoint, access key,
secret key or caller-selected storage account. Unknown products and every
product/scope mismatch fail closed without trying another registry entry.

Production uses separate least-privilege worker URLs:

- `PIXIMMO_VIDEO_STUDIO_RENDER_WORKER_URL`
- `PIXCAPTURE_VIDEO_STUDIO_RENDER_WORKER_URL`

The URLs must differ. Each worker deployment owns only its product's R2 secret.
`VIDEO_STUDIO_RENDER_WORKER_SECRET` authenticates the internal HTTP request but
does not grant object-storage access.

## Staged product activation

`VIDEO_STUDIO_ENABLED_PRODUCTS` optionally limits a deployment to a strict,
comma-separated subset of `piximmo,pixcapture`. If it is unset, both products
remain enabled exactly as before. Empty values, whitespace, empty entries,
duplicates and unknown product names fail startup.

A production deployment requires the trigger secret and an explicit worker URL
for every enabled product. Thus `VIDEO_STUDIO_ENABLED_PRODUCTS=piximmo` requires
only `PIXIMMO_VIDEO_STUDIO_RENDER_WORKER_URL`; it does not invent or reuse a
PixCapture URL. With both products enabled, both explicit URLs remain mandatory
and must differ after URL canonicalization. Production worker URLs must be
absolute HTTPS URLs without credentials, a query or a fragment; host case,
default ports and trailing slashes cannot bypass the separation check.

Disabled-product handoffs return `403 product_disabled` before a nonce is
consumed. Existing sessions for a disabled product cannot read, analyze,
render or poll a project. An older one-time launch for a disabled product is
consumed and answered with the generic `invalid_workbench_launch` response.
Adapters additionally reject an unconfigured product URL instead of falling
back to another product.

## Workbench render v2

`POST /render/workbench/start` uses schema
`pix_video_workbench_render_request_v2` and binds:

- `sourceProduct`
- `sourceStorageScope`
- `outputStorageScope`

All three values are identical. Every scene and `brandOverlay` additionally
contains the same `storageScope` next to its opaque `r2Key`.

The start response echoes all three bindings with `callId`. The Shared Service
stores the worker reference as `<product>:<callId>`. Polling uses the raw call
ID only on the already-bound product worker URL and repeats all three bindings
as query parameters.

Every running or completed status response echoes the bindings. A completed
render additionally returns `render.storageScope`, which must equal the
original output scope. Missing or conflicting bindings mark the job failed and
the result key is discarded.

## Analysis v2

`POST /analyze/start` uses schema
`pix_video_studio_analysis_request_v2`. `sourceProduct` and
`sourceStorageScope` must be identical, and every scene repeats that
`storageScope` next to its opaque `r2Key`.

Start and status responses echo both bindings. The completed analysis object
also contains both. The Shared Service rejects unknown or conflicting values
and never retries against the other product worker.

## Result persistence

Internal Studio jobs store source product, source scope, output scope and
result scope with the key. These routing fields and raw keys are removed from
the public job response; customers receive only the existing safe result URL.
