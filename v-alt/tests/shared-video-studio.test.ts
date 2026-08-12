import test from "node:test";
import assert from "node:assert/strict";
import { createHash, createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import { sharedStudioCookieName, signPiximmoStudioHandoff } from "../src/lib/shared-video-studio.ts";
import {
  centralVideoStudioStarterUrl,
  resolveVideoStudioReturnUrl,
  SHARED_VIDEO_STUDIO_SOURCE_PREVIEW_TTL_SECONDS,
  sharedVideoStudioSourcePreviewExpiresAt,
  studioSourceImagesFromProject,
  videoStudioProductLabel,
} from "../src/lib/central-video-studio.ts";
import type { SharedStudioProject } from "../src/lib/shared-video-studio.ts";
import { legacyVideoWorkbenchRedirects } from "../next.config.ts";

test("PixImmo handoff signature binds product, timestamp, nonce and exact body", () => {
  const body = JSON.stringify({ product: "piximmo", tenantId: "tenant-1" });
  const timestamp = 1_786_350_000_000;
  const nonce = "handoff-nonce";
  const secret = "<ENTFERNT_SECRET>";
  const bodyHash = createHash("sha256").update(body).digest("hex");
  const expected = createHmac("sha256", secret)
    .update(`piximmo\n${timestamp}\n${nonce}\n${bodyHash}`)
    .digest("base64url");

  assert.equal(signPiximmoStudioHandoff(body, timestamp, nonce, secret), expected);
  assert.notEqual(signPiximmoStudioHandoff(`${body} `, timestamp, nonce, secret), expected);
});

test("studio cookie names retain only the bound safe project identifier", () => {
  assert.equal(
    sharedStudioCookieName("vsp_1234567890abcdef1234567890abcdef/../../foreign"),
    "piximmo_vs_vsp_1234567890abcdef1234567890abcdefforeign",
  );
});

test("portal-auth account APIs are inert after central account binding", () => {
  const brandRoute = readFileSync(
    new URL("../src/app/api/video-studio/brand-assets/route.ts", import.meta.url),
    "utf8",
  );
  const presetRoute = readFileSync(
    new URL("../src/app/api/video-studio/presets/route.ts", import.meta.url),
    "utf8",
  );
  for (const source of [brandRoute, presetRoute]) {
    assert.match(source, /status: 410/);
    assert.doesNotMatch(source, /auth\(|session\.user|prisma|uploadToR2/);
  }
});

test("central workbench labels products and maps only public source previews", () => {
  const project = {
    product: "pixcapture",
    assets: [
      {
        id: "asset-1",
        filename: "see.jpg",
        width: 2400,
        height: 1600,
        motif: "view",
        description: "Blick über das Grundstück",
        sourcePreviewUrl: "https://assets.example/see.jpg?signature=bound",
        sourcePreviewUrlExpiresAt: "2026-08-11T12:00:00.000Z",
      },
      { id: "asset-without-public-preview", filename: "private.jpg" },
    ],
  } as SharedStudioProject;

  assert.equal(videoStudioProductLabel(project.product), "PixCapture");
  assert.deepEqual(studioSourceImagesFromProject(project), [
    {
      id: "asset-1",
      filename: "see.jpg",
      previewUrl: "https://assets.example/see.jpg?signature=bound",
      roomLabel: "view",
      role: "exterior",
      width: 2400,
      height: 1600,
      description: "Blick über das Grundstück",
    },
  ]);
});

test("central return links are resolved against the bound product portal", () => {
  assert.equal(
    resolveVideoStudioReturnUrl(
      { product: "piximmo", returnUrl: "/dashboard/jobs?jobId=SCQ-NTX9R" },
      "https://beta.pix.immo",
    ),
    "https://beta.pix.immo/dashboard/jobs?jobId=SCQ-NTX9R",
  );
  assert.throws(() =>
    resolveVideoStudioReturnUrl(
      { product: "pixcapture", returnUrl: "//attacker.example/escape" },
      "https://capture.example",
    ),
  );
  assert.throws(() =>
    resolveVideoStudioReturnUrl(
      { product: "pixcapture", returnUrl: "/jobs" },
      "http://capture.example",
    ),
  );
});

test("central launch and workbench stay independent from PixImmo auth and job data", () => {
  const workbenchPage = readFileSync(
    new URL(
      "../src/app/video-studio/workbench/[projectId]/page.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  const launchPage = readFileSync(
    new URL("../src/app/video-studio/launch/page.tsx", import.meta.url),
    "utf8",
  );
  const proxy = readFileSync(
    new URL(
      "../src/app/api/video-studio/shared/projects/[projectId]/[[...action]]/route.ts",
      import.meta.url,
    ),
    "utf8",
  );
  assert.doesNotMatch(workbenchPage, /auth\(|getVideoStudioSetupJob|jobId/);
  assert.doesNotMatch(workbenchPage, /product !== "piximmo"/);
  assert.match(workbenchPage, /readCentralVideoStudioSession/);
  assert.match(workbenchPage, /studioSourceImagesFromProject/);
  assert.match(launchPage, /window\.location\.hash/);
  assert.match(launchPage, /workbench-launch\/redeem/);
  assert.doesNotMatch(proxy, /auth\(|resolveSessionUser|canAccessVideoStudioJob/);
});

test("canonical visual structure keeps history and image bank together", () => {
  const source = readFileSync(
    new URL(
      "../src/app/dashboard/video-studio/workbench/[projectId]/SharedVideoStudioWorkbench.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  assert.match(source, /Bildbank/);
  assert.match(source, /Verwendete Motive ausblenden/);
  assert.match(source, /SourceFramePreview/);
  assert.match(source, /9:16-Vorschau/);
  assert.match(source, /<TimelineStage/);
  assert.match(source, /Diese Grenze gilt nur für/);
  assert.match(source, /Originalauflösung erhalten/);
  assert.doesNotMatch(source, /PixImmo Video/);
});

test("PixImmo handoff assets carry real ten-minute signed source previews", () => {
  const now = 1_786_350_000_000;
  assert.equal(SHARED_VIDEO_STUDIO_SOURCE_PREVIEW_TTL_SECONDS, 600);
  assert.equal(
    sharedVideoStudioSourcePreviewExpiresAt(now),
    new Date(now + 600_000).toISOString(),
  );
  const source = readFileSync(
    new URL("../src/lib/video-studio-server.ts", import.meta.url),
    "utf8",
  );
  assert.match(source, /assets: await Promise\.all\(ready\.map\(async/);
  assert.match(source, /sourcePreviewUrl: await getSignedDownloadUrl/);
  assert.match(source, /SHARED_VIDEO_STUDIO_SOURCE_PREVIEW_TTL_SECONDS/);
  assert.match(source, /sourcePreviewUrlExpiresAt,/);
});

test("legacy admin workbench is inert and cannot render a second editor", () => {
  const source = readFileSync(
    new URL(
      "../src/app/dashboard/admin/video-studio/workbench/[projectId]/page.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  assert.match(source, /redirect\(/);
  assert.doesNotMatch(source, /SharedVideoStudioWorkbench/);
  assert.doesNotMatch(source, /sharedStudioRequest|sharedStudioCookieName/);
});

test("all three historical workbench routes redirect to the central starter", () => {
  const routeFiles = [
    "../src/app/dashboard/video-studio/route.ts",
    "../src/app/dashboard/video-studio/motion/route.ts",
    "../src/app/dashboard/video-studio/maklerin/route.ts",
  ];
  for (const routeFile of routeFiles) {
    const source = readFileSync(new URL(routeFile, import.meta.url), "utf8");
    assert.match(source, /centralVideoStudioStarterUrl/);
    assert.match(source, /NextResponse\.redirect/);
    assert.doesNotMatch(source, /serveVideoWorkbenchPage/);
  }
  assert.equal(
    centralVideoStudioStarterUrl(
      "https://beta.pix.immo/dashboard/video-studio/motion?jobId=SCQ-NTX9R",
    ).toString(),
    "https://beta.pix.immo/dashboard/video-studio/setup?jobId=SCQ-NTX9R&studioSession=central",
  );
});

test("active app code no longer links to historical editor routes", () => {
  const files = [
    "../src/app/dashboard/admin/video-studio/AdminVideoStudioClient.tsx",
    "../src/app/dashboard/video-studio/VideoStudioWorkspace.tsx",
    "../src/app/api/video-workbench/jobs/[jobReference]/briefing/route.ts",
  ];
  for (const file of files) {
    const source = readFileSync(new URL(file, import.meta.url), "utf8");
    assert.doesNotMatch(source, /dashboard\/video-studio(?:\/motion|\/maklerin)?\?/);
    assert.match(source, /dashboard\/video-studio\/setup/);
  }
});

test("the entire public historical workbench tree is blocked before static serving", () => {
  assert.deepEqual(
    legacyVideoWorkbenchRedirects,
    [{
      source: "/video-workbench/:path*",
      destination: "/dashboard/video-studio/setup",
      permanent: false,
    }],
  );
  const blockedExamples = [
    "/video-workbench/timeline",
    "/video-workbench/motion/index.html",
    "/video-workbench/maklerin/source-assets/deep/reference.jpg",
  ];
  assert.ok(blockedExamples.every((path) => path.startsWith("/video-workbench/")));
  assert.ok(!"/api/video-workbench/projects/1".startsWith("/video-workbench/"));
  assert.ok(!"/video-studio/launch".startsWith("/video-workbench/"));
});
