# Candidate 7 · Prepared source motion A/B proof · 2026-08-08

## Scope

This is a Cross-Area milestone in the umbrella repository. The shared contract
uses `product: piximmo` for the first product path and remains reusable by
PixCapture later. No nested PixImmo, PixCapture Web, Mobile or Voleur repository
was changed.

Exactly one prepared moment was added to the internal capability showcase. The
guided broker version remains image-only and unchanged in structure. The two
verified V1 MP4 files on Daniel's Desktop were not overwritten.

## Selected source

- Candidate: 7, Backsteinhaus mit Einfahrt/Garten
- Cut-plan order: 9
- File: `20260605-095536000-Wohnzimmer-DSF0087.jpg`
- Source size: 6000 x 4000
- Reason: the warm living/dining view has clear ceiling, wall, window, stove,
  shelf, table and chair geometry, so fidelity changes are immediately visible.

## Real executed chain

```text
shared VideoProject revision 2
  -> prepare.source_motion capability route
  -> local CPU-only source-motion worker
  -> SHA-256 fingerprinted PreparedAsset cache
  -> source-lock fidelity check at start/middle/end
  -> VideoProject revision 3 with PreparedAsset status ready
  -> internal A/B timeline
  -> render.timeline worker
  -> vertical MP4 and full decode
```

This is a real prepared asset behind the shared contract, not metadata claiming
that preparation happened. The repeated identical preparation request reused
the same cached file. It is deliberately a reliable 2D source-locked camera
move; it does not claim generated depth, parallax, a changed perspective or new
pixels outside the original source crop.

No provider, network, GPU, Modal, R2 or deployment call ran. No provider secret
was read because the proof remained fully local.

## Internal A/B

The showcase now places two consecutive 3.2-second scenes from the same source:

- A: direct `render.timeline` movement;
- B: cached `prepare.source_motion` PreparedAsset.

Both scenes use identical start/end framing. This makes geometry and object
differences attributable to the preparation boundary rather than a different
crop. The guided broker version contains zero PreparedAssets.

## Verification

- Video Studio contract tests: 13/13 passed.
- Python syntax checks for both local workers passed.
- Prepared asset: 3.2 s, 720 x 1280, H.264, 30 fps, silent AAC, full decode.
- Prepared cache fingerprint:
  `sha256:c3f01996855ea89b6b2d9e267b995a367df6fb919e275aa6b959044157d03453`
- Repeated identical request: cache hit, same output path.
- Automated source-lock checkpoints:
  - start: PSNR 41.7262 dB, edge MAE 0.017587;
  - middle: PSNR 39.9217 dB, edge MAE 0.022037;
  - end: PSNR 39.5738 dB, edge MAE 0.022814.
- Required thresholds: PSNR at least 34 dB and normalized edge MAE at most
  0.035; all checkpoints passed.
- New internal showcase: 32.821333 s, 720 x 1280, H.264, 30 fps, silent AAC,
  full decode.
- Separately rendered guided copy: 32.321333 s, same media checks passed.

Manual visual review of the fidelity sheet and A/B scene centers found no
changes to architecture, furniture, fixed objects, windows or exterior views.
The prepared-video text overlay is transparent; typography remains directly on
the image with restrained outline/shadow and no card, pill or background area.

## Output

Unversioned reproducible artifacts:

`output/video-studio-e2e-candidate-7-prepared-ab-2026-08-08/`

Important files:

- `showcase.mp4`
- `guided.mp4`
- `local-e2e-report.json`
- `showcase-project.json`
- `showcase-source-motion-prepare.json`
- `prepared-assets/cache/*.mp4`
- `prepared-assets/cache/*.fidelity.json`
- `prepared-assets/cache/*.fidelity.jpg`

## Product stop point

The infrastructure, cache and source fidelity are proven. The A/B pair is
intentionally visually equivalent; it proves the preparation boundary without
inventing a stronger effect. Daniel should judge whether that prepared boundary
has enough product value before any prepared moment is copied into the guided
broker version. A provider-backed or spatial-motion experiment remains a
separate later decision and still requires the secret/provider preflight and an
explicit cost-quality choice.
