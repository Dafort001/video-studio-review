#!/usr/bin/env node

import { createHash, createHmac, randomUUID } from "node:crypto";
import { createServer } from "node:http";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { chromium } from "playwright";

const REPO = process.cwd();
const WORKSPACE = path.resolve(REPO, "../..");
const ARTIFACT_DIR = path.join(REPO, "tmp", "e2e", `video-studio-${new Date().toISOString().replace(/[:.]/g, "-")}`);
const HANDOFF_SECRET = "<ENTFERNT_SECRET>";
const SESSION_SECRET = "<ENTFERNT_SECRET>";
const WORKER_SECRET = "<ENTFERNT_SECRET>";
const SAMPLE_VIDEO = "https://beta.pix.immo/demo/video-studio/candidate-10-maklerin-first-preview.mp4";
const SAMPLE_IMAGES = [
  "https://beta.pix.immo/demo/video-studio/candidate-10/001-20260625-115605000-Aussenansicht-DSF2392.jpg",
  "https://beta.pix.immo/demo/video-studio/candidate-10/005-20260625-121342000-Wohnzimmer-DSF2407.jpg",
  "https://beta.pix.immo/demo/video-studio/candidate-10/001-20260625-115605000-Aussenansicht-DSF2392.jpg",
];

const processes = [];
let browser;
let page;
let workerServer;
let temporaryDirectory;
const report = { startedAt: new Date().toISOString(), assertions: [], providerRequests: [], screenshots: [] };

try {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), "piximmo-video-studio-e2e-"));
  const [workerPort, sharedPort, webPort] = await Promise.all([freePort(), freePort(), freePort()]);
  workerServer = await startFakeRenderWorker(workerPort);
  processes.push(spawnLogged(
    process.execPath,
    ["--disable-warning=MODULE_TYPELESS_PACKAGE_JSON", "--experimental-strip-types", "scripts/video-studio/run-server.ts"],
    WORKSPACE,
    {
      VIDEO_STUDIO_PORT: String(sharedPort),
      VIDEO_STUDIO_HOST: "127.0.0.1",
      VIDEO_STUDIO_DATA_DIR: temporaryDirectory,
      VIDEO_STUDIO_SESSION_SECRET: SESSION_SECRET,
      PIXIMMO_VIDEO_STUDIO_HANDOFF_SECRET: HANDOFF_SECRET,
      VIDEO_STUDIO_ENABLED_PRODUCTS: "piximmo",
      VIDEO_STUDIO_WORKBENCH_URL: `http://localhost:${webPort}/video-studio/launch`,
      VIDEO_STUDIO_ALLOWED_ORIGINS: `http://localhost:${webPort},https://beta.pix.immo`,
      PIXIMMO_VIDEO_STUDIO_RENDER_WORKER_URL: `http://127.0.0.1:${workerPort}`,
      VIDEO_STUDIO_RENDER_WORKER_SECRET: WORKER_SECRET,
    },
    "shared",
  ));
  await waitForHttp(`http://127.0.0.1:${sharedPort}/health`);

  processes.push(spawnLogged(
    "npm",
    ["start", "--", "-p", String(webPort)],
    REPO,
    {
      AUTH_SECRET: SESSION_SECRET,
      NEXTAUTH_SECRET: SESSION_SECRET,
      VIDEO_STUDIO_INTERNAL_URL: `http://127.0.0.1:${sharedPort}`,
      PIXIMMO_PORTAL_URL: `http://localhost:${webPort}`,
      CENTRAL_VIDEO_STUDIO_PIXIMMO_DATABASE_URL: "<ENTFERNT_DATABASE_URL>",
      CENTRAL_VIDEO_STUDIO_PIXIMMO_R2_ACCOUNT_ID: "00000000000000000000000000000000",
      CENTRAL_VIDEO_STUDIO_PIXIMMO_R2_ENDPOINT_URL: "https://00000000000000000000000000000000.r2.cloudflarestorage.com",
      CENTRAL_VIDEO_STUDIO_PIXIMMO_R2_ACCESS_KEY_ID: "<ENTFERNT_ACCESS_KEY>",
      CENTRAL_VIDEO_STUDIO_PIXIMMO_R2_SECRET_ACCESS_KEY: "<ENTFERNT_ACCESS_KEY>",
      CENTRAL_VIDEO_STUDIO_PIXIMMO_R2_BUCKET_NAME: "e2e",
    },
    "web",
  ));
  await waitForHttp(`http://localhost:${webPort}/video-studio/launch`);

  const launch = await createLaunch(sharedPort);
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1536, height: 1100 }, reducedMotion: "no-preference" });
  await context.addInitScript(() => {
    window.localStorage.setItem("piximmo_privacy_consent", JSON.stringify({
      version: "essential-v1",
      analytics: false,
      decidedAt: "2026-08-12T00:00:00.000Z",
    }));
  });
  page = await context.newPage();
  page.on("request", (request) => {
    if (/\/api\/video-studio\/(veo|render)\/start|generativelanguage|googleapis\.com|fal\.run|kling|minimax/i.test(request.url())) {
      report.providerRequests.push({ method: request.method(), url: request.url() });
    }
  });

  await page.goto(launch.workbenchUrl, { waitUntil: "domcontentloaded" });
  await page.waitForURL(/\/video-studio\/workbench\/vsp_[a-f0-9]{32}$/);
  const privacySettings = page.getByRole("region", { name: "Datenschutz-Einstellungen" });
  if (await privacySettings.isVisible().catch(() => false)) {
    await privacySettings.getByRole("button", { name: /Nur notwendige|Verstanden/ }).click();
  }
  await expectVisible(page.getByRole("heading", { name: "Lokaler Werkstatt-E2E" }), "central workbench loaded");
  for (const label of ["Logo", "Galerie", "Timeline", "Szenenbearbeitung", "Vorschau & KI"]) {
    await expectVisible(page.getByRole("button", { name: new RegExp(label) }), `workflow step ${label} visible`);
  }
  await screenshot(page, "01-logo.png");

  const continueToGallery = page.getByRole("button", { name: /Speichern und weiter zur Galerie/ });
  await continueToGallery.click();
  const gallery = page.locator('[data-workflow-stage="gallery"]');
  await expectVisible(gallery, "gallery opened");
  const galleryCards = gallery.locator('button[aria-pressed]');
  await assertCount(galleryCards, 3, "gallery contains three complete source cards");
  await assertAllObjectContain(gallery.locator("img"), "gallery sources use object-contain");
  await galleryCards.nth(0).click();
  await expectVisible(gallery.getByRole("button", { name: /1 Bilder in die Timeline/ }), "first gallery source selected");
  await galleryCards.nth(1).click();
  await expectVisible(gallery.getByRole("button", { name: /2 Bilder in die Timeline/ }), "second gallery source selected");
  await gallery.getByRole("button", { name: /2 Bilder in die Timeline/ }).click();

  const timeline = page.locator('[data-workflow-stage="timeline"]');
  await expectVisible(timeline, "timeline opened");
  await assertAllObjectContain(timeline.locator("img"), "timeline sources use object-contain");
  const firstPosition = timeline.getByLabel(/Position von/).first();
  await firstPosition.selectOption("2");
  await timeline.getByRole("button", { name: /Rückgängig/ }).click();
  await timeline.getByRole("button", { name: /Szenen bearbeiten/ }).click();

  await expectVisible(page.getByRole("heading", { name: "Eine Szene im Fokus" }), "scene editor opened");
  await expectVisible(page.getByRole("button", { name: /Start bearbeiten/ }), "combined start frame control visible");
  await expectVisible(page.getByRole("button", { name: /Ende bearbeiten/ }), "combined end frame control visible");
  await page.getByRole("button", { name: /Weitere .* Bewegungen anzeigen/ }).click();
  await page.getByRole("button", { name: "Hover oder Klick Zoom hinein" }).click();
  await expectVisible(page.getByText(/Zoom hinein · [0-9.]+s/), "selected zoom is shown on current scene preview");
  await page.getByRole("button", { name: /Vorschau abspielen/ }).click();
  await page.getByRole("button", { name: /Auf diese Szene anwenden/ }).click();
  await expectVisible(page.getByText(/wird quellenbasiert/), "source motion persisted without provider");

  const typography = page.locator('[data-scene-tool="typography"]');
  await typography.getByRole("button", { name: "+ Text" }).click();
  await typography.getByRole("textbox", { name: "Text", exact: true }).fill("ALSTER");
  await expectVisible(typography.locator('[data-typography-canvas] [data-type-preview]', { hasText: "ALSTER" }), "text glyphs visible in typography editor");
  await expectVisible(page.locator("article").first().locator('[data-type-preview]', { hasText: "ALSTER" }), "text glyphs mirrored into combined result preview");
  await screenshot(page, "02-scene-combined.png");
  await page.waitForTimeout(1200);
  await page.getByRole("button", { name: "Szene bestätigen" }).click();
  await expectVisible(page.getByRole("button", { name: "Bestätigt" }), "first scene reviewed");
  await page.getByRole("button", { name: /Danach:/ }).click();
  await page.getByRole("button", { name: "Szene bestätigen" }).click();
  await expectVisible(page.getByRole("button", { name: "Bestätigt" }), "second scene reviewed");
  await screenshot(page, "02b-scenes-reviewed.png");

  await page.getByRole("button", { name: /Vorschau & KI/ }).click();
  await expectVisible(page.getByRole("heading", { name: /Erst Gesamtpreview/ }), "final review step opened");
  await expectVisible(page.getByText("Alle Szenen sind im aktuellen Stand bestätigt."), "all scene reviews acknowledged");
  const shortClipConfirmation = page.locator("label", { hasText: "Sehr kurzer Clip:" }).getByRole("checkbox");
  if (await shortClipConfirmation.count()) await shortClipConfirmation.check();
  await page.getByRole("button", { name: /1 · Gesamtpreview erstellen/ }).click();
  await expectVisible(page.locator("[data-video-review]"), "rendered preview is visibly available", 15_000);
  await page.getByRole("button", { name: /2 · Gesehene Preview freigeben/ }).click();
  await page.getByRole("button", { name: /3 · Endfassung erstellen/ }).click();
  await expectVisible(page.getByRole("heading", { name: "Die Endfassung ist fertig" }), "final render reached visible ready state", 15_000);
  await expectVisible(page.getByText(/Optionale KI-Ideen ansehen/), "optional ideas remain separated below final flow");
  if (report.providerRequests.length) throw new Error(`Provider request escaped the E2E boundary: ${JSON.stringify(report.providerRequests)}`);
  pass("no provider endpoint was called");
  await screenshot(page, "03-final-ready.png");

  report.completedAt = new Date().toISOString();
  report.status = "passed";
  await writeFile(path.join(ARTIFACT_DIR, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
  process.stdout.write(`${ARTIFACT_DIR}\n`);
} catch (error) {
  report.completedAt = new Date().toISOString();
  report.status = "failed";
  report.error = error instanceof Error ? { message: error.message, stack: error.stack } : String(error);
  await mkdir(ARTIFACT_DIR, { recursive: true }).catch(() => undefined);
  if (page) {
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "failure.png"), fullPage: true }).catch(() => undefined);
    const bodyText = await page.locator("body").innerText().catch(() => "");
    await writeFile(path.join(ARTIFACT_DIR, "failure-page.txt"), `${bodyText}\n`).catch(() => undefined);
  }
  await writeFile(path.join(ARTIFACT_DIR, "report.json"), `${JSON.stringify(report, null, 2)}\n`).catch(() => undefined);
  throw error;
} finally {
  if (browser) await browser.close().catch(() => undefined);
  for (const child of processes.reverse()) child.kill("SIGTERM");
  if (workerServer) workerServer.close();
  if (workerServer?.listening) await once(workerServer, "close").catch(() => undefined);
  if (temporaryDirectory) await rm(temporaryDirectory, { recursive: true, force: true }).catch(() => undefined);
}

async function createLaunch(sharedPort) {
  const expiresAt = new Date(Date.now() + 10 * 60_000).toISOString();
  const payload = {
    schemaVersion: "video_studio_handoff_v1",
    product: "piximmo",
    tenantId: "local-e2e-tenant",
    actorId: "local-e2e-actor",
    sourceReference: { type: "job", id: `local-e2e-${Date.now()}` },
    name: "Lokaler Werkstatt-E2E",
    returnUrl: "/dashboard/video-studio",
    assets: SAMPLE_IMAGES.map((sourcePreviewUrl, index) => ({
      id: `e2e-asset-${index + 1}`,
      kind: "image",
      storageKey: `e2e/source-${index + 1}.jpg`,
      filename: index ? "Wohnzimmer.jpg" : "Aussenansicht.jpg",
      width: 3000,
      height: 2000,
      motif: index ? "living" : "exterior",
      sourcePreviewUrl,
      sourcePreviewUrlExpiresAt: expiresAt,
    })),
  };
  const body = JSON.stringify(payload);
  const timestamp = Date.now();
  const nonce = `e2e-${randomUUID()}`;
  const bodyHash = createHash("sha256").update(body).digest("hex");
  const signature = createHmac("sha256", HANDOFF_SECRET)
    .update(`piximmo\n${timestamp}\n${nonce}\n${bodyHash}`)
    .digest("base64url");
  const response = await fetch(`http://127.0.0.1:${sharedPort}/v1/handoffs/exchange`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-video-studio-product": "piximmo",
      "x-video-studio-timestamp": String(timestamp),
      "x-video-studio-nonce": nonce,
      "x-video-studio-signature": signature,
      origin: "https://beta.pix.immo",
    },
    body,
  });
  const result = await response.json();
  if (!response.ok || !result.workbenchUrl) throw new Error(`Local handoff failed: ${response.status} ${JSON.stringify(result)}`);
  return result;
}

async function startFakeRenderWorker(port) {
  const calls = new Map();
  const server = createServer(async (request, response) => {
    const url = new URL(request.url ?? "/", `http://127.0.0.1:${port}`);
    if (request.headers["x-modal-trigger-secret"] !== WORKER_SECRET) return json(response, 401, { ok: false, error: "forbidden" });
    if (request.method === "POST" && url.pathname === "/render/workbench/start") {
      const body = JSON.parse(await readBody(request));
      const callId = `local-${randomUUID()}`;
      calls.set(callId, body);
      return json(response, 200, { ok: true, callId, sourceProduct: "piximmo", sourceStorageScope: "piximmo", outputStorageScope: "piximmo" });
    }
    const match = url.pathname.match(/^\/render\/workbench\/status\/([^/]+)$/);
    if (request.method === "GET" && match && calls.has(decodeURIComponent(match[1]))) {
      const callId = decodeURIComponent(match[1]);
      return json(response, 200, {
        ok: true,
        status: "done",
        sourceProduct: "piximmo",
        sourceStorageScope: "piximmo",
        outputStorageScope: "piximmo",
        progress: { progress: 100 },
        render: { r2Key: `local-e2e/${callId}.mp4`, storageScope: "piximmo", downloadUrl: SAMPLE_VIDEO },
      });
    }
    return json(response, 404, { ok: false, error: "not found" });
  });
  server.listen(port, "127.0.0.1");
  await once(server, "listening");
  return server;
}

function spawnLogged(command, args, cwd, extraEnv, label) {
  const child = spawn(command, args, { cwd, env: { ...process.env, ...extraEnv }, stdio: ["ignore", "pipe", "pipe"] });
  child.stdout.on("data", (chunk) => process.stderr.write(`[${label}] ${chunk}`));
  child.stderr.on("data", (chunk) => process.stderr.write(`[${label}] ${chunk}`));
  return child;
}

async function freePort() {
  const server = createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 0;
  server.close();
  await once(server, "close");
  return port;
}

async function waitForHttp(url, timeoutMs = 20_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { redirect: "manual" });
      if (response.status < 500) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`Server did not become ready: ${url}`);
}

async function expectVisible(locator, name, timeout = 10_000) {
  await locator.first().waitFor({ state: "visible", timeout });
  pass(name);
}

async function assertCount(locator, expected, name) {
  const actual = await locator.count();
  if (actual !== expected) throw new Error(`${name}: expected ${expected}, got ${actual}`);
  pass(name, { count: actual });
}

async function assertAllObjectContain(locator, name) {
  const classes = await locator.evaluateAll((nodes) => nodes.map((node) => node.className));
  if (!classes.length || classes.some((value) => !String(value).includes("object-contain"))) throw new Error(`${name}: ${JSON.stringify(classes)}`);
  pass(name, { count: classes.length });
}

async function screenshot(page, filename) {
  const target = path.join(ARTIFACT_DIR, filename);
  await page.screenshot({ path: target, fullPage: true });
  report.screenshots.push(target);
}

function pass(name, details = {}) {
  report.assertions.push({ status: "pass", name, details });
  process.stdout.write(`✓ ${name}\n`);
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    request.on("data", (chunk) => chunks.push(chunk));
    request.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    request.on("error", reject);
  });
}

function json(response, status, body) {
  response.writeHead(status, { "content-type": "application/json" });
  response.end(JSON.stringify(body));
}
