# Handover After Compaction - Motion Lab Recognition / Vercel APIs

Timestamp: 2026-06-29 18:36 CEST

Branch: `codex/pipeline-handover-20260418`

## Current Git State

- Last committed work: `a40ca3db feat: require reliable room recognition for motion lab`
- Root status before this handover:
  - `ahead 41` from `origin/codex/pipeline-handover-20260418`
  - only unrelated dirty state remains: `projects/piximmo-web`
- Do not touch `projects/piximmo-web`; it was dirty before and is unrelated.

## What Was Completed In This Thread

Motion Lab phase sessions:

- Session 31: `e3d808ed feat: add motion lab session 31 ratings storage`
- Session 32: `73a363d3 feat: add motion lab session 32 dashboard audit`
- Session 33: `41539d4c docs: add motion lab session 33 readiness report`

Recognition batch path:

- Masterplan copied to `docs/video-motion/RECOGNITION_BATCH_MASTERPLAN.md`
  - commit `9ab0a92e docs: add recognition batch masterplan`
- Session 1 import tooling
  - commit `9a2d2612 feat: add recognition batch session 1 import tooling`
- Session 2 recognition backends
  - commit `4be537fc feat: add recognition batch session 2 backends`
- Session 3 review tools
  - commit `45bb7cd7 feat: add recognition batch session 3 review tools`
- Session 4 offline previews
  - commit `4df5e2de feat: add recognition batch session 4 offline previews`

Correction after Daniel objected to fake room naming:

- commit `a40ca3db feat: require reliable room recognition for motion lab`
- `mock` no longer invents room labels from filenames.
- `filename_heuristic` exists only as low-reliability, explicitly non-visual
  technical fallback.
- `openai_vision` adapter exists, but has not been executed against the real
  API because no usable API env was available in the local shell at that point.
- `qwen_vl` and `custom_vision` remain reserved, not live.
- Strict shot planning now requires real/manual reliable recognition by
  default.

Detailed recognition state is in:

- `docs/video-motion/_handover_real_room_recognition.md`
- `docs/video-motion/REAL_ROOM_RECOGNITION.md`

## API / Secret Truth Boundary

Important answer Daniel explicitly requested:

- No real source/provider version is currently used for room naming.
- No Qwen version is currently used for room naming.
- Before the correction, generated room names were effectively non-visual
  placeholder behavior and could be arbitrary.
- After the correction, mock output must stay `unknown` and cannot pass strict
  planning as real recognition.

Current active local backends:

- `mock`
- `filename_heuristic`
- `manual_json`
- `existing_metadata`

Prepared but not yet proven live:

- `openai_vision`

Reserved but not implemented live:

- `qwen_vl`
- `custom_vision`

## Vercel Check Started Before Compaction

Daniel asked to go to Vercel and get the API interfaces needed.

Observed facts:

- The direct Vercel MCP/app tools were not available in this Codex tool surface.
  `tool_search` exposed Figma/GitHub/Node tools, but no Vercel MCP tools.
- Local `vercel` binary was not installed in PATH.
- `npx --yes vercel@latest --version` worked and returned Vercel CLI `54.18.3`.
- `npx --yes vercel@latest whoami` worked in linked projects and returned
  account `mail-5946`.
- No secret values were printed.
- Local shell did not expose obvious `OPENAI`, `QWEN`, `DASHSCOPE`, `VERCEL`, or
  generic token/key env vars after filtering out sensitive names.

Linked Vercel projects found:

- `projects/pixcapture-web`
  - projectName: `pixcapture-portal`
  - projectId: `prj_MJUNKpjQ2cT7mMFUZ45erjD0AzgP`
  - orgId: `team_21giGvR5xMyqGOeFPEOjdi74`
- `projects/voleurdimages-web`
  - projectName: `voleurdimages`
  - projectId: `prj_xhJSbJO9AVqC2GwnxmoQziScgMVl`
  - orgId: `team_21giGvR5xMyqGOeFPEOjdi74`

Root Motion Lab is not itself linked to a Vercel project.

## Safe Next Step

If continuing the Vercel/API work, do this first and do not print values:

```text
cd "/Volumes/drive 1/PIXCAPTURE/projects/voleurdimages-web"
npx --yes vercel@latest env ls production
npx --yes vercel@latest env ls preview
npx --yes vercel@latest env ls development
```

Then repeat for:

```text
cd "/Volumes/drive 1/PIXCAPTURE/projects/pixcapture-web"
npx --yes vercel@latest env ls production
npx --yes vercel@latest env ls preview
npx --yes vercel@latest env ls development
```

Look only for env names and environments, especially:

- `OPENAI_API_KEY`
- `OPENAI_VISION_MODEL`
- `OPENAI_BASE_URL`
- `QWEN_API_KEY`
- `DASHSCOPE_API_KEY`
- provider/model aliases that clearly belong to image recognition

If a real secret value must be used for a local recognition test, pull it only
into a temporary file outside the repo, do not commit it, do not paste it into
the chat, and delete it after the test.

Suggested temp pattern:

```text
tmp_env="$(mktemp /tmp/pixcapture-vercel-env.XXXXXX)"
npx --yes vercel@latest env pull "$tmp_env" --environment=production --yes
# load only the needed key(s) for one command, without echoing them
rm -f "$tmp_env"
```

Do not run a real provider call until Daniel has accepted the likely provider
and cost path.

## Validation Already Done

See `docs/video-motion/_handover_real_room_recognition.md` for the full list.
Key point: all local checks passed, but `openai_vision` has only been tested for
clean missing-env failure, not for live external API success.

## Stop Rules

- Do not reintroduce filename/mock room naming as real recognition.
- Do not implement public UI.
- Do not add provider calls silently.
- Do not touch `projects/piximmo-web`.
- Do not broaden into later Motion Lab sessions unless Daniel explicitly asks.
- Do not print secrets in terminal output summaries or final messages.
