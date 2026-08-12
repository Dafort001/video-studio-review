# Central Video Studio Launch Contract

PixImmo and PixCapture open one central workbench. Portal servers authenticate
the source project; browsers never receive a portal signing secret and no
Studio session token is placed in a URL.

## 1. Signed portal exchange

The portal backend sends the existing signed request to:

`POST /v1/handoffs/exchange`

The signature continues to cover the exact JSON body, product, timestamp and
nonce. Existing nonce replay protection remains mandatory.

The response is additive and keeps the legacy fields:

```json
{
  "project": {},
  "accessToken": "<ENTFERNT_TOKEN>",
  "expiresInSeconds": 900,
  "launchCode": "opaque 256-bit one-time code",
  "workbenchUrl": "https://studio.example/workbench#launchCode=...",
  "launchExpiresInSeconds": 90
}
```

The portal redirects the browser only to `workbenchUrl`. The URL fragment is
not sent in HTTP requests or referrers. The central workbench reads the
fragment, removes it from browser history with `history.replaceState`, and
redeems the code immediately.

## 2. Browser redemption

The central workbench sends:

`POST /v1/workbench-launches/redeem`

```json
{ "launchCode": "..." }
```

A successful response contains `{ project, accessToken, expiresInSeconds }`.
The access token is held by the central workbench and used as the existing
Bearer session. It must not be copied into a URL or persisted in local storage.

Launch codes are random 256-bit values. Only their SHA-256 hashes are stored.
They expire after 90 seconds by default and are atomically deleted during the
first successful redemption. Invalid, expired and replayed codes return the
same `invalid_workbench_launch` response. Each stored launch binds the exact
project, product, tenant and actor; redemption rechecks the project binding
before issuing the Studio session.

## 3. Browser image previews

The stable source identity remains `{ id, kind, storageKey }`; `storageKey`
never appears in the public project contract. A portal may add both of these
fields to each asset inside the signed handoff:

```json
{
  "sourcePreviewUrl": "https://allowed-assets.example/signed/image.jpg?...",
  "sourcePreviewUrlExpiresAt": "2026-08-11T12:01:00.000Z"
}
```

Both fields are optional but must occur together. Preview URLs must use HTTPS,
must not contain URL credentials or a fragment, and must remain valid for at
least the complete launch-code TTL plus a 30-second redemption margin. They may
expire no later than 15 minutes after the exchange. This guarantees that every
successfully redeemed launch still receives usable source previews. If
`VIDEO_STUDIO_SOURCE_PREVIEW_HOSTS` is configured, the hostname must be in its
comma-separated exact-host allowlist.

A later signed handoff for the same source may refresh or remove only these
volatile preview fields without changing project identity or revision. A
changed storage key or source manifest still fails closed.

## 4. Configuration

- `VIDEO_STUDIO_WORKBENCH_URL`: absolute central workbench URL. HTTPS is
  mandatory except for `localhost` and `127.0.0.1`; credentials, query and
  fragment are forbidden.
- `VIDEO_STUDIO_SOURCE_PREVIEW_HOSTS`: optional comma-separated exact HTTPS
  hostnames accepted for signed browser previews.
- `VIDEO_STUDIO_ENABLED_PRODUCTS`: optional strict comma-separated product set.
  Unset enables both `piximmo` and `pixcapture`; for example, `piximmo` enables
  only the PixImmo handoff and existing PixCapture launches/sessions fail
  closed.
- `VIDEO_STUDIO_ALLOWED_ORIGINS`: still contains both portal origins. The
  configured workbench origin is added automatically for redemption and API
  calls.

Production uses PostgreSQL for atomic cross-instance launch redemption. The
memory and file stores provide equivalent behavior for tests and local work.
