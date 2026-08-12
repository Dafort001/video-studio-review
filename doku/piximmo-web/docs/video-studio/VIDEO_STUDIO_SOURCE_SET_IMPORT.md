# Video Studio SourceSet import

`VideoStudioSourceSet` preserves one immutable, ordered image manifest for a
PixImmo job. It does not replace `ProcessedImage`, existing Delivery objects or
an existing Shared Video Studio project.

## Contract

- Each source set contains 2-120 ordered image entries, matching Shared. The Seeburg restart for
  `SCQ-NTX9R` must contain exactly 31.
- The browser-visible asset id is derived from PixImmo, the internal job id and
  the original SHA-256. It is never copied from a removed Delivery image.
- `manifestDigest` is SHA-256 over the exact ordered Shared manifest
  `[{id,kind:"image",storageKey:originalKey}, ...]`.
- `sourceReference.id` is `job:<internalJobId>:assets:<manifestDigest>` and is
  limited to 120 characters. A changed asset, key or order therefore opens a
  fresh Shared project and cannot collide with the legacy project.
- `snapshotDigest` separately protects dimensions, preview metadata, filename
  and taxonomy. Those private fields do not change the required Shared
  manifest digest.
- Original and preview keys must live under
  `piximmo/video-source-sets/`, be separate and contain their respective
  content SHA-256. They are never overwritten.
- An active SourceSet hands Shared the original key and original dimensions.
  Only the separate preview key is signed for browser display. Existing SAM
  masks are deliberately omitted because they belong to the former native
  image geometry.
- With no active pointer, the existing Delivery-image handoff remains exactly
  the fallback. Rollback only clears the pointer; it does not delete snapshots,
  objects or the old Shared project.

## Staged command

The command is intentionally read-only unless an explicit mutation flag is
present:

```sh
npm run video-studio:source-set -- \
  --manifest=/absolute/path/source-set.json \
  --audit-manifest=/absolute/path/source-inventory.json \
  --expected-count=31
```

This resolves the PixImmo job, checks all 31 originals and 31 previews in R2
with HEAD plus a full read, verifies SHA-256, byte length, JPEG decoding and
dimensions, and then exits without changing the database.

For `SCQ-NTX9R`, the exact audited report SHA-256
`dbfa7c026d2a6176302776fd16f2e73e837799eb0f69eaf4f1b2467f40a36c57`
is pinned in code. The importer compares all m01-m31 filenames, hashes, byte
lengths and dimensions and explicitly requires the new `_V4A4507` identity in
m30. Other jobs require an independently supplied `--audit-sha256`.

Optional staging upload requires `--upload-root=/absolute/path`. Every object
is written with `If-None-Match: *`; an existing key is never overwritten and
must subsequently pass the same full validation. Upload, activation and
rollback additionally require the exact `--confirm-job=SCQ-NTX9R` guard.

Only after validation and independent review may the operator add `--activate`.
The immutable snapshot is created idempotently and the job-bound pointer is
changed with one conditional database update. A failure before that update
leaves the previous pointer untouched.

Rollback to the untouched legacy handoff is explicit:

```sh
npm run video-studio:source-set -- --job=SCQ-NTX9R --rollback
```

## Seeburg ordering rule

The fresh 31-image manifest retains the audited current m01-m31 motif order.
Slot m30 is the new Canon image `_V4A4507`; the former Apple/iPhone m30 image
and its asset identity must not be reused. Full filenames, hashes, sizes and
dimensions must come from the machine-readable read-only inventory before a
staging manifest is accepted. Preview metadata is derived from the actual
preview bytes, never inferred from the originals.

The import manifest schema is `video_studio_source_set_import_v1`. Each entry
contains `originalKey`, `previewKey`, `sha256`, `bytes`, `width`, `height`,
`filename`, `taxonomy`, `previewSha256`, `previewBytes`, `previewWidth` and
`previewHeight`. `originalLocalPath` and `previewLocalPath` are required only
when `--upload-root` is used. Object keys and signed URLs must never be placed
in browser payloads or client logs.
