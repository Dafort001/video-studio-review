# Video Studio font manifest

The browser and deterministic renderer use the same six Google Fonts source
files pinned by `fontManifestId`:

`google-fonts-038b637da7b3fd956a4ed93ffc607c3d5e4ce172`

Source TTFs and per-family SIL Open Font License 1.1 files come from commit
`038b637da7b3fd956a4ed93ffc607c3d5e4ce172` of
`https://github.com/google/fonts`.

Renderer assets:

- `projects/voleurdimages-backend/modal_app/assets/video_studio_fonts/`

Browser assets:

- `projects/piximmo-web/public/fonts/video-studio/`

Both directories contain identical `manifest.json`, TTF, WOFF2, and license
files. The renderer verifies the TTF SHA-256 before use. WOFF2 files are
derived from the matching TTF with `fontTools.subset`, retaining Latin-1,
Latin Extended-A/B, Latin Extended Additional, all layout features, and the
Euro sign. The manifest pins both formats by SHA-256.

The six families used by the current style contract are Inter, Fraunces,
Outfit, Archivo Narrow, Newsreader, and Archivo. Do not substitute system
fonts or OpenCV Hershey fonts during visual acceptance.
