# Video Studio analysis gold set — Phase 2.5

Status: corrected self-hosted Qwen smoke and one bounded fal.ai infrastructure
smoke passed on 2026-08-10. The bathroom result is not a quality decision; no
pilot or full-set provider run.

## Reproducible input and guard

- Manifest: `config/video-studio/goldsets/seeburg-mixed-v1.json`
- Runner: `scripts/video-studio/run_analysis_goldset.py`
- Current input: 20 images selected only from the 31 final JPGs of Seeburg job
  `SCQ-NTX9R`: 12 interiors and 8 exteriors, with SHA-256, dimensions and
  duplicate detection written into the local resolved manifest.
- Local preparation cost: USD 0.
- Provider execution is fail-closed and needs both `--execute` and an explicit
  maximum-GPU-cost acknowledgement covering all pending images.
- No worker writes analysis output to R2; laboratory artifacts stay local.

At the current A100 80 GB rate, a Qwen-only image has a USD 0.42 timeout
ceiling. Two additional pilot images have a USD 0.84 ceiling and the remaining
17 images a USD 7.08 ceiling. A complete all-worker run (SAM, DA3 and Qwen) has
a USD 13.66 GPU timeout ceiling for 20 images. These are timeout ceilings, not
measured invoices.

## Smoke history and result

An earlier, subsequently invalidated interior-only manifest was used for this
smoke. One bathroom image was submitted to the three existing laboratory
workers:

1. `pix-segment.worker_segment_batch` returned usable 3000×2000 masks for
   `wall` and `floor`; the other 14 vocabulary prompts produced no persisted
   mask. This is insufficient coverage for an instance-aware product result.
2. `pix-depth.worker_depth` returned a 504×336 16-bit metric depth PNG.
3. `pix-layered.worker_layered` failed before returning layers. Loading
   `Qwen/Qwen-Image-Layered` exhausted the A10G container's 22.06 GiB CUDA
   memory: 21.96 GiB was in use and the next 72 MiB allocation failed.

The initial gate therefore failed. Per stop rule, no pilot and no full-set run
were started. The runner did not upload provider artifacts and no Vercel, Beta
or Production deployment was made.

After the stop, the manifest was corrected to use the single canonical Seeburg
finals directory and an intentional interior/exterior mix. The lake photograph
is the editorial video start image. It is not the Qwen technical test image.

The isolated worker was moved from A10G to A100 80 GB. One mistakenly launched
lake smoke was stopped before it wrote a result. The corrected smoke was then
bound by exact filename to `20260803-Badezimmer-_V4A4582.jpg`; manifest order no
longer controls the technical test image.

The bathroom smoke succeeded:

- 4/4 RGBA layers, 1248×832 output, requested 1024 bucket, seed 42;
- model loaded in about 62 seconds and completed 50 inference steps;
- measured remote-call runtime 572.586 seconds;
- estimated GPU cost USD 0.3974, below the USD 0.42 hard ceiling;
- forward alpha composition reconstructs the source with normalized pixel RMSE
  0.0192644.

The decomposition separates broad overlapping room regions and is suitable for
laboratory parallax evaluation. It is not a precise object-instance mask.

## Provider decision

The Modal implementation is rejected for pilot/full-set use: the successful
bathroom request took 572.586 seconds and cost an estimated USD 0.3974. The
official `fal-ai/qwen-image-layered` endpoint charges USD 0.05 per request and
returns the same four-image RGBA contract. Its documented defaults are 28
steps, guidance 5, four layers and regular acceleration.

The runner now supports `--provider fal` with a flat USD 0.05-per-image guard,
provider-specific result files and exact parameter recording. It calls the
small server-side `pix-fal-layered.worker_fal_layered` bridge. That worker uses
the already existing Modal secret `fal-secret`; the key is neither copied to
the Mac nor returned or logged. Modal and fal results cannot overwrite or
satisfy each other's pending checks.

Exactly one fal.ai request was completed by this runner, bound to
`20260803-Badezimmer-_V4A4582.jpg`:

- 4/4 PNG layers, each 768×512, seed 42;
- fal inference timing 18.233 seconds and measured bridge runtime 39.979
  seconds;
- fixed provider cost USD 0.05;
- no R2 write and no second image.

This proves only that the existing `fal-secret`, queue call and four-layer
return contract work. The bathroom is not considered a suitable motif for a
product-quality layered/parallax judgment. The temporary `pix-fal-layered`
Modal app was stopped after the proof and is not an adopted product service.

## Deferred quality gate

No further Qwen-layered run is authorized from this smoke alone. A later agent
must first present suitable motifs for the actual layer-quality question and
keep the exact-filename binding; editorial timeline position must never choose
a provider test image. The eventual provider/worker architecture remains open.

The model/legal gate also remains laboratory-only. Qwen Image Layered and DA3
Metric Large publish Apache-2.0 licenses. SAM 3 uses Meta's separate SAM
License; commercial/product use must be checked against its current terms
before product integration.

## Verification commands

```sh
python3 scripts/video-studio/run_analysis_goldset.py prepare \
  --manifest config/video-studio/goldsets/seeburg-mixed-v1.json \
  --source-dir '/Volumes/drive 1/Kundendata' \
  --output-dir output/video-studio-analysis-goldset/seeburg-mixed-v1

python3 scripts/video-studio/run_analysis_goldset.py run \
  --stage smoke \
  --asset-filename '20260803-Badezimmer-_V4A4582.jpg' \
  --layered-only \
  --output-dir output/video-studio-analysis-goldset/seeburg-mixed-v1
```

The second command is a free dry run. Paid execution additionally needs the
Modal CLI interpreter, `--execute`, and `--acknowledge-max-gpu-usd`.

A free fal.ai dry run uses:

```sh
python3 scripts/video-studio/run_analysis_goldset.py run \
  --provider fal \
  --stage smoke \
  --asset-filename '20260803-Badezimmer-_V4A4582.jpg' \
  --layered-only \
  --output-dir output/video-studio-analysis-goldset/seeburg-mixed-v1
```

Execution uses the Modal CLI interpreter and additionally requires `--execute`
and `--acknowledge-max-provider-usd 0.05`. The credential stays in the existing
server-side Modal secret `fal-secret`.
