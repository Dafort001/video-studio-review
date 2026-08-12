# Video Studio Capability Registry v1

Status: implementation draft, 2026-08-07

## Why this exists

Video providers change faster than the broker product should. The studio must
not encode a provider name, model name or today's endpoint shape into a project
or interface. It stores the creative decision and resolves an implementation
only when a scene is prepared.

The registry therefore separates three layers:

```text
Broker intention
  -> neutral capability
     -> currently suitable worker route
```

Examples:

```text
"Mehr räumliche Tiefe"
  -> prepare.spatial_motion
     -> enabled worker satisfying fidelity, cost and latency policy

"Zwei Ansichten verbinden"
  -> prepare.first_last_transition
     -> enabled worker accepting first and last image
```

## Stable broker choices

Editing experience and video intention are separate decisions:

- Editing experience: `guided` or `detailed`.
- Video intention:
  - `balanced_property_story`
  - `dynamic_highlights`
  - `calm_premium`
  - `presenter_story`
  - `custom`

Neither decision exposes how a scene is processed.

## Capability families

- analysis: scene, depth, layers, safe areas and fidelity comparison;
- preparation: source motion, spatial motion, perspective change, foreground
  reveal, start/end transition, reference-guided scene and extension;
- editing: replace an image region or a selected video interval;
- presenter: composition, movement and speech-driven presentation;
- audio: voice, music and optional scene atmosphere;
- finishing: stabilization, frame refinement and output refinement;
- rendering: assemble the approved timeline.

## Open extension contract

Known core IDs are strongly typed. A new development can be registered with an
ID in the `extension.*` namespace without changing `VideoProject`. An extension
declares:

- family and neutral product copy;
- required and produced media kinds;
- whether it is internal, suggested or visible in detailed editing;
- risk and review requirement;
- supported format, fidelity class, cost class and latency class;
- optional requirements such as reference count, last frame, source video or
  audio input.

Extensions remain unavailable until a worker route is explicitly enabled.
`VideoTake`, `PreparedAsset`, `StudioJob` and `VideoProject.enabledCapabilities`
all reference the same open `CapabilityId`. There is no second treatment enum
that must be migrated when an extension is introduced.

## Route policy

Resolution is capability-based. A route is eligible only if it satisfies all
requested inputs, vertical output, minimum source fidelity, cost limit, latency
limit and special input requirements. A high-priority creative route cannot
win when the scene requires source-locked fidelity.

The resolved route names an internal worker adapter. Dispatch succeeds only
when that adapter is registered and advertises the same capability. Capability
routing and job dispatch therefore cannot silently select different workers.

Provider IDs and raw errors stay server-side. Client responses use neutral
capability IDs and fixed message codes.

## Initial product policy

- Reliable source motion is the default.
- Spatial depth may be suggested more often because it is subtle.
- Perspective changes, foreground reveals, reference-guided scenes and
  presenter generation remain reviewable highlights.
- Start/end transitions are available when the broker explicitly chooses both
  views; they never change timeline order.
- Video extension and partial re-generation are repair tools, not default
  broker controls.
- Audio generation is optional and independent from visual scene generation.
- Every prepared result passes the source-fidelity comparison before it can be
  approved for final rendering.
