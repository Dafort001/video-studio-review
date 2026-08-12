import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  CentralVideoStudioAccountLibrary,
  persistBrandAssetUpload,
  StudioAccountLibraryInputError,
  validateCentralStudioR2Endpoint,
  type StudioAccountLibraryAdapter,
  type StudioAccountProduct,
} from "../src/lib/central-video-studio-account-library.ts";

type AdapterCall = { operation: string; actorId: string; value?: string };

function fakeAdapter(product: StudioAccountProduct, calls: AdapterCall[]) {
  const owners = new Map([["vsb_1234567890abcdef", "actor-a"]]);
  return {
    async readLibrary(actorId) {
      calls.push({ operation: "read", actorId });
      return {
        brandAssets: [],
        fontAssets: [],
        presets: [
          {
            id: `${product}-preset`,
            name: `${product}-${actorId}`,
            kind: "rhythm" as const,
            definition: { durations: [2] },
          },
        ],
      };
    },
    async registerBrandAsset(actorId, input) {
      calls.push({ operation: "upload", actorId, value: input.id });
      return {
        id: input.id,
        filename: input.filename,
        mimeType: "image/png",
        width: input.width,
        height: input.height,
        sizeBytes: input.data.byteLength,
        isActive: true,
        previewUrl: `https://${product}.example/${actorId}/${input.id}`,
      };
    },
    async savePreset(actorId, input) {
      calls.push({ operation: "save", actorId, value: input.name });
      return {
        created: true,
        preset: { id: `${product}-saved`, ...input },
      };
    },
    async resolveBrandAsset(actorId, assetId) {
      calls.push({ operation: "resolve", actorId, value: assetId });
      if (owners.get(assetId) !== actorId) return null;
      return {
        id: assetId,
        storageKey: `${product}/${actorId}/${assetId}.png`,
        filename: "logo.png",
        mimeType: "image/png",
        width: 512,
        height: 512,
        sizeBytes: 42,
      };
    },
    async registerFontAsset(actorId, input) {
      calls.push({ operation: "font-upload", actorId, value: input.assetId });
      return {
        assetId: input.assetId,
        storageKey: `${product}/${actorId}/${input.assetId}.woff2`,
        displayName: input.displayName,
        filename: input.filename,
        mimeType: input.mimeType,
        sizeBytes: input.data.byteLength,
        rightsConfirmedAt: input.rightsConfirmedAt.toISOString(),
        ...(input.licenseReference ? { licenseReference: input.licenseReference } : {}),
      };
    },
    async readFontAsset(actorId, assetId) {
      calls.push({ operation: "font-read", actorId, value: assetId });
      return null;
    },
    async resolveFontAsset(actorId, assetId) {
      calls.push({ operation: "font-resolve", actorId, value: assetId });
      return null;
    },
  } satisfies StudioAccountLibraryAdapter;
}

test("account library selects exactly the product adapter and bound actor", async () => {
  const calls = {
    piximmo: [] as AdapterCall[],
    pixcapture: [] as AdapterCall[],
  };
  const adapters = {
    piximmo: fakeAdapter("piximmo", calls.piximmo),
    pixcapture: fakeAdapter("pixcapture", calls.pixcapture),
  };
  const library = new CentralVideoStudioAccountLibrary(
    (product) => adapters[product],
  );

  const capture = await library.readLibrary("pixcapture", "actor-a");
  const immo = await library.readLibrary("piximmo", "actor-b");
  await library.registerBrandAsset("pixcapture", "actor-a", {
    id: "vsb_1234567890abcdef",
    filename: "logo.png",
    data: new Uint8Array([1, 2, 3]),
    width: 512,
    height: 512,
  });
  await library.savePreset("piximmo", "actor-b", {
    name: "  Mein   Schnitt  ",
    kind: "rhythm",
    definition: { durations: [2] },
  });

  assert.equal(capture.presets[0]?.name, "pixcapture-actor-a");
  assert.equal(immo.presets[0]?.name, "piximmo-actor-b");
  assert.deepEqual(calls.pixcapture, [
    { operation: "read", actorId: "actor-a" },
    {
      operation: "upload",
      actorId: "actor-a",
      value: "vsb_1234567890abcdef",
    },
  ]);
  assert.deepEqual(calls.piximmo, [
    { operation: "read", actorId: "actor-b" },
    { operation: "save", actorId: "actor-b", value: "Mein Schnitt" },
  ]);
});

test("brand asset resolution cannot cross actor or product boundaries", async () => {
  const piximmoCalls: AdapterCall[] = [];
  const pixcaptureCalls: AdapterCall[] = [];
  const library = new CentralVideoStudioAccountLibrary((product) =>
    product === "piximmo"
      ? fakeAdapter(product, piximmoCalls)
      : fakeAdapter(product, pixcaptureCalls),
  );

  assert.equal(
    await library.resolveBrandAsset(
      "pixcapture",
      "actor-b",
      "vsb_1234567890abcdef",
    ),
    null,
  );
  const owned = await library.resolveBrandAsset(
    "piximmo",
    "actor-a",
    "vsb_1234567890abcdef",
  );
  assert.equal(owned?.storageKey, "piximmo/actor-a/vsb_1234567890abcdef.png");
  assert.deepEqual(pixcaptureCalls, [
    {
      operation: "resolve",
      actorId: "actor-b",
      value: "vsb_1234567890abcdef",
    },
  ]);
  assert.deepEqual(piximmoCalls, [
    {
      operation: "resolve",
      actorId: "actor-a",
      value: "vsb_1234567890abcdef",
    },
  ]);
});

test("invalid account input fails before any adapter access", () => {
  let adapterSelections = 0;
  const library = new CentralVideoStudioAccountLibrary(() => {
    adapterSelections += 1;
    return fakeAdapter("piximmo", []);
  });

  assert.throws(
    () => library.readLibrary("piximmo", "actor with spaces"),
    StudioAccountLibraryInputError,
  );
  assert.throws(
    () =>
      library.savePreset("piximmo", "actor-a", {
        name: "Ohne Daten",
        kind: "rhythm",
      }),
    StudioAccountLibraryInputError,
  );
  assert.throws(
    () =>
      library.savePreset("piximmo", "actor-a", {
        name: "Zu groß",
        kind: "rhythm",
        definition: { value: "x".repeat(65 * 1024) },
      }),
    StudioAccountLibraryInputError,
  );
  assert.equal(adapterSelections, 0);
});

test("R2 endpoint validation accepts only the exact Cloudflare account host", () => {
  const accountId = "0123456789abcdef0123456789abcdef";
  assert.equal(
    validateCentralStudioR2Endpoint(
      `https://${accountId}.r2.cloudflarestorage.com`,
      accountId,
    ),
    `https://${accountId}.r2.cloudflarestorage.com`,
  );
  for (const endpoint of [
    `https://${accountId}.attacker.tld`,
    `https://${accountId}.r2.cloudflarestorage.com.attacker.tld`,
    `http://${accountId}.r2.cloudflarestorage.com`,
    `https://${accountId}.r2.cloudflarestorage.com/foreign`,
    `<ENTFERNT_BASIC_AUTH_URL>`,
  ]) {
    assert.throws(() => validateCentralStudioR2Endpoint(endpoint, accountId));
  }
  assert.throws(() =>
    validateCentralStudioR2Endpoint(
      "https://short.r2.cloudflarestorage.com",
      "short",
    ),
  );
});

test("failed brand registration removes only the object uploaded by that call", async () => {
  const calls: string[] = [];
  const storageKey = "video-studio/pixcapture/actor-hash/brand/vsb_test.png";
  await assert.rejects(
    persistBrandAssetUpload({
      storageKey,
      data: new Uint8Array([1, 2, 3]),
      upload: async (key) => {
        calls.push(`upload:${key}`);
      },
      register: async (key) => {
        calls.push(`register:${key}`);
        throw new Error("database unavailable");
      },
      remove: async (key) => {
        calls.push(`remove:${key}`);
      },
    }),
    /database unavailable/,
  );
  assert.deepEqual(calls, [
    `upload:${storageKey}`,
    `register:${storageKey}`,
    `remove:${storageKey}`,
  ]);
});

test("central account routes derive product and actor only from Shared session", () => {
  const accountRoute = readFileSync(
    new URL(
      "../src/app/api/video-studio/shared/projects/[projectId]/account-library/[[...action]]/route.ts",
      import.meta.url,
    ),
    "utf8",
  );
  const session = readFileSync(
    new URL("../src/lib/central-video-studio-session.server.ts", import.meta.url),
    "utf8",
  );
  const proxy = readFileSync(
    new URL(
      "../src/app/api/video-studio/shared/projects/[projectId]/[[...action]]/route.ts",
      import.meta.url,
    ),
    "utf8",
  );
  const workbench = readFileSync(
    new URL(
      "../src/app/video-studio/workbench/[projectId]/page.tsx",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(session, /sharedWorkbenchCookieName\(projectId\)/);
  assert.match(session, /sharedStudioRequest/);
  assert.match(accountRoute, /readCentralVideoStudioSession\(projectId\)/);
  assert.match(accountRoute, /current\.project\.product/);
  assert.match(accountRoute, /current\.actorId/);
  assert.doesNotMatch(accountRoute, /auth\(|session\.user|body\.userId|query.*userId/);
  assert.ok(
    accountRoute.indexOf("requireBoundedContentLength(") <
      accountRoute.indexOf("request.formData()"),
  );
  assert.match(accountRoute, /headers\.get\("content-length"\)/);
  assert.doesNotMatch(accountRoute, /request failed", error/);
  assert.match(proxy, /resolveBrandAsset/);
  assert.match(proxy, /value\.asset = asset/);
  assert.doesNotMatch(proxy, /NextResponse\.json\(current\)/);
  assert.doesNotMatch(proxy, /project: current\.project,\s*actorId:/);
  assert.doesNotMatch(proxy, /auth\(|session\.user|body\.userId/);
  assert.match(workbench, /centralVideoStudioAccountLibrary\.readLibrary/);
  assert.match(workbench, /accountLibraryAvailable = false/);
  assert.match(workbench, /accountLibraryAvailable=\{accountLibraryAvailable\}/);
});

test("production adapters have explicit product envs and exact upload cleanup", () => {
  const source = readFileSync(
    new URL(
      "../src/lib/central-video-studio-account-library.server.ts",
      import.meta.url,
    ),
    "utf8",
  );
  for (const product of ["PIXIMMO", "PIXCAPTURE"]) {
    for (const suffix of [
      "DATABASE_URL",
      "R2_ACCOUNT_ID",
      "R2_ENDPOINT_URL",
      "R2_ACCESS_KEY_ID",
      "R2_SECRET_ACCESS_KEY",
      "R2_BUCKET_NAME",
    ]) {
      assert.match(source, new RegExp(`CENTRAL_VIDEO_STUDIO_${product}_${suffix}`));
    }
  }
  assert.match(source, /WHERE "userId" = \$\{actorId\}/);
  assert.match(source, /DeleteObjectCommand\(\{ Bucket: bucket, Key: key \}\)/);
  assert.doesNotMatch(source, /process\.env\.(?:DATABASE_URL|R2_ACCOUNT_ID)/);
});
