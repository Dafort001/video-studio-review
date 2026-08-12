import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  VIDEO_STUDIO_MOTION_CATALOG,
  RENDERABLE_SOURCE_MOTION_IDS,
  AI_STUDIO_PROPOSALS,
  VIDEO_STUDIO_WORKFLOW_STEPS,
  approveAiDraft,
  clampInteractiveFrame,
  clampStillDuration,
  createAiDraft,
  createTimelineHistory,
  createTypographyElement,
  insertApprovedClipSlot,
  logoSafeZone,
  normalizeInteractiveFrame,
  normalizeTypographyElement,
  portraitScaleBudget,
  removeTimelineAsset,
  resizeTypographyGeometry,
  scaleTypographyGeometry,
  snapTypographyPosition,
  redoTimeline,
  reorderTimeline,
  softTargetStatus,
  typographyExitWindowMs,
  sourceMotionPatch,
  sourceFrameQuality,
  timelineDurationFromSlots,
  typographyRotationDegrees,
  undoTimeline,
  videoMaskCandidatesForHandoff,
  replaceTimelineSlotWithApprovedClip,
} from "../src/lib/video-studio-workflow.ts";

const guidedSource = await readFile(new URL("../src/app/dashboard/video-studio/workbench/[projectId]/GuidedStudioStages.tsx", import.meta.url), "utf8");
const workbenchSource = await readFile(new URL("../src/app/dashboard/video-studio/workbench/[projectId]/SharedVideoStudioWorkbench.tsx", import.meta.url), "utf8");
const creativeRouteSource = await readFile(new URL("../src/app/api/video-studio/shared/projects/[projectId]/creative/[[...action]]/route.ts", import.meta.url), "utf8");
const motionDemoManifest = JSON.parse(
  await readFile(new URL("../public/video-studio/motion-demos/v1/manifest.json", import.meta.url), "utf8"),
) as {
  durationSeconds: number;
  fps: number;
  outputSize: number[];
  motions: string[];
  source: { sha256: string };
  frameGuide: { sha256: string; size: number[] };
};

test("visible workflow is logo, gallery, sorting timeline, combined scene editing, preview/AI", () => {
  assert.deepEqual(VIDEO_STUDIO_WORKFLOW_STEPS, ["brand", "gallery", "timeline", "scene", "preview_ai"]);
  assert.match(workbenchSource, /stage === "brand"/);
  assert.match(workbenchSource, /stage === "gallery"/);
  assert.match(workbenchSource, /stage === "timeline"/);
  assert.match(workbenchSource, /stage === "scene"/);
  assert.match(workbenchSource, /stage === "preview_ai"/);
  assert.match(guidedSource, /Hier wird nur ausgewählt/);
  assert.match(guidedSource, /Nur Reihenfolge/);
  assert.match(guidedSource, /Noch kein 9:16, kein Crop und keine Bewegung/);
});

test("logo start step has an unambiguous primary continuation to the gallery", () => {
  assert.match(workbenchSource, /Nur speichern/);
  assert.match(workbenchSource, /Speichern und weiter zur Galerie/);
  assert.match(workbenchSource, /if \(saved\) onContinue\?\.\(\)/);
  assert.doesNotMatch(workbenchSource, /Ohne Logo zur Galerie/);
  assert.match(workbenchSource, /disabled=\{busy \|\| \(logoEnabled && !accountLibraryAvailable\)\}/);
  assert.doesNotMatch(workbenchSource, /Speichern und weiter zur Galerie[\s\S]{0,500}disabled=\{busy \|\| !accountLibraryAvailable\}/);
  assert.match(workbenchSource, /\.\.\.\(selectedAsset[\s\S]*safeZone: logoSafeZone/);
  assert.doesNotMatch(workbenchSource, /safeZone: \{ x: 0, y: 0, w: 0, h: 0 \}/);
});

test("sorting timeline supports drag, explicit position, undo and redo", () => {
  let history = createTimelineHistory(["a", "b", "c"]);
  history = reorderTimeline(history, "c", 0);
  assert.deepEqual(history.present, ["c", "a", "b"]);
  history = undoTimeline(history);
  assert.deepEqual(history.present, ["a", "b", "c"]);
  history = redoTimeline(history);
  assert.deepEqual(history.present, ["c", "a", "b"]);
  assert.match(guidedSource, /aria-label={`Motiv \$\{index \+ 1\} ziehen`}/);
  assert.match(guidedSource, /onPointerMove=\{\(event\) => \{[\s\S]*elementFromPoint/);
  assert.match(guidedSource, /event\.key === "ArrowLeft"/);
  assert.match(guidedSource, /aria-label={`Position von/);
});

test("timeline removal keeps one scene and remains reversible through the existing selection history", () => {
  const initial = ["a", "b", "c"];
  const removed = removeTimelineAsset(initial, "b");
  assert.deepEqual(removed, ["a", "c"]);
  const single = ["a"];
  assert.strictEqual(removeTimelineAsset(single, "a"), single);
  let history = createTimelineHistory(initial);
  history = { ...history, past: [initial], present: removed };
  assert.deepEqual(undoTimeline(history).present, initial);
  assert.match(guidedSource, /aus der Timeline entfernen/);
  assert.match(guidedSource, /window\.confirm\("Dieses Motiv aus der Timeline entfernen/);
  assert.match(workbenchSource, /removeTimelineAsset\(current, assetId\)/);
  assert.match(workbenchSource, /method: "PUT"[\s\S]*orderedAssetIds: pendingIds/);
});

test("motion catalog preserves all 91 grouped source and generative definitions", () => {
  assert.equal(VIDEO_STUDIO_MOTION_CATALOG.length, 91);
  assert.equal(new Set(VIDEO_STUDIO_MOTION_CATALOG.map((motion) => motion.id)).size, 91);
  assert.ok(VIDEO_STUDIO_MOTION_CATALOG.some((motion) => motion.sourceGroup === "source_based"));
  assert.ok(VIDEO_STUDIO_MOTION_CATALOG.some((motion) => motion.sourceGroup === "generative_ai"));
  assert.ok(VIDEO_STUDIO_MOTION_CATALOG.filter((motion) => motion.sourceGroup === "generative_ai").every((motion) => motion.safety === "GENERATIVE"));
  for (const family of ["classic", "depth", "perspective", "outpainting", "focus"]) assert.match(guidedSource, new RegExp(`"${family}"`));
});

test("supported safe source motion changes renderer frames and unsupported safe motion is explicit", () => {
  const take = { startFrame: { centerX: 0.5, centerY: 0.5, scale: 1 }, endFrame: { centerX: 0.5, centerY: 0.5, scale: 1 } };
  const pan = VIDEO_STUDIO_MOTION_CATALOG.find((motion) => motion.id === "PAN_LEFT")!;
  const patch = sourceMotionPatch(pan, take);
  assert.ok(patch);
  assert.notDeepEqual(patch.startFrame, patch.endFrame);
  const roll = VIDEO_STUDIO_MOTION_CATALOG.find((motion) => motion.id === "ROLL_CLOCKWISE")!;
  const rollPatch = sourceMotionPatch(roll, take);
  assert.equal(rollPatch?.motionSpec.parameters?.rotationEndDeg, 6);
  const dutch = VIDEO_STUDIO_MOTION_CATALOG.find((motion) => motion.id === "DUTCH_ANGLE_IN")!;
  const whip = VIDEO_STUDIO_MOTION_CATALOG.find((motion) => motion.id === "WHIP_PAN_LEFT")!;
  assert.equal(sourceMotionPatch(dutch, take)?.motionSpec.parameters?.rotationEndDeg, -5);
  assert.equal(sourceMotionPatch(whip, take), null);
  assert.match(guidedSource, /Noch nicht anwendbar/);
  assert.match(workbenchSource, /motion\.sourceGroup === "generative_ai" \|\| \(portraitScaleBudget/);
  assert.doesNotMatch(workbenchSource, /motion\.safety !== "SAFE" \|\|/);
});

test("motion library explains a move before applying it and reserves one demo slot per card", () => {
  assert.match(guidedSource, /Absicht wählen, am Motiv ansehen, dann anwenden/);
  assert.match(guidedSource, /data-motion-demo-slot=\{motion\.id\}/);
  assert.match(guidedSource, /demoVideoUrl\?: string/);
  assert.match(guidedSource, /duration: "1,5 Sekunden"/);
  assert.match(guidedSource, /video-studio\/motion-demos\/v1/);
  assert.match(guidedSource, /onPointerEnter=\{\(\) => setDemoPlayback\(true\)\}/);
  assert.match(guidedSource, /onPointerLeave=\{\(\) => setDemoPlayback\(false\)\}/);
  assert.match(guidedSource, /Pan links → rechts/);
  assert.match(guidedSource, /Geeignet für:/);
  assert.match(guidedSource, /Auf diese Szene anwenden/);
  assert.match(guidedSource, /onClick=\{onFocus\}/);
  assert.match(guidedSource, /onApply=\{\(\) => onSelect\(focusedMotion\)\}/);
  assert.doesNotMatch(guidedSource, /onClick=\{\(\) => onSelect\(motion\)\}/);
  assert.match(workbenchSource, /selectedCatalogMotionId \?\? activeTake\.motionSpec\?\.motionId/);
  assert.match(workbenchSource, /setSelectedCatalogMotionId\(undefined\);[\s\S]*setActiveAssetId\(assetId\)/);
});

test("canonical motion demos use Daniel's repaired source, exact frame ratio, and 1.5 second contract", async () => {
  assert.equal(RENDERABLE_SOURCE_MOTION_IDS.size, 21);
  assert.deepEqual(new Set(motionDemoManifest.motions), RENDERABLE_SOURCE_MOTION_IDS);
  assert.equal(motionDemoManifest.durationSeconds, 1.5);
  assert.equal(motionDemoManifest.fps, 60);
  assert.deepEqual(motionDemoManifest.outputSize, [540, 960]);
  assert.deepEqual(motionDemoManifest.frameGuide.size, [900, 1600]);
  assert.equal(motionDemoManifest.source.sha256, "68cfe601fb2ffb2f3c12aa46eda759407fa5e7f470b168bb22de2c2133ea6330");
  assert.equal(motionDemoManifest.frameGuide.sha256, "affd6fd06076b672a3338ac45160bd9d00d830625ddfe7c293b087d0c9fddec3");
  for (const motionId of motionDemoManifest.motions) {
    const filename = `${motionId.toLowerCase().replaceAll("_", "-")}.mp4`;
    const video = await readFile(new URL(`../public/video-studio/motion-demos/v1/${filename}`, import.meta.url));
    assert.ok(video.byteLength > 50_000, `${filename} should contain a rendered demo`);
  }
});

test("still duration clamps to 0.6–10 seconds and soft target never trims", () => {
  assert.equal(clampStillDuration(0.1), 0.6);
  assert.equal(clampStillDuration(12), 10);
  assert.equal(clampStillDuration(4.37), 4.37);
  assert.equal(softTargetStatus(48, 30).mustAutoTrim, false);
});

test("interactive start/end frames stay in source bounds and respect the quality scale cap", () => {
  const frame = clampInteractiveFrame({ centerX: 4, centerY: -2, scale: 4, maximumScale: 1.5, sourceWidth: 4000, sourceHeight: 3000 });
  assert.equal(frame.scale, 1.5);
  assert.ok(frame.centerX <= 1 && frame.centerX >= 0);
  assert.ok(frame.centerY <= 1 && frame.centerY >= 0);
  assert.match(workbenchSource, /data-scale-handle="true"/);
  assert.match(workbenchSource, /setPointerCapture/);
  assert.match(workbenchSource, /maximumScale={maximumScale}/);
  assert.match(workbenchSource, /scaleStart\.current\.scale -/);
  assert.deepEqual(portraitScaleBudget(1080, 1920), { maximumScale: 1, motionAllowed: true });
  assert.deepEqual(portraitScaleBudget(900, 2400), { maximumScale: 1, motionAllowed: false });
});

test("landscape quality uses the exact portrait crop budget without rounding below native output", () => {
  const budget = portraitScaleBudget(3000, 2000);
  assert.ok(Math.abs(budget.maximumScale - (2000 / 1920)) < 1e-9);
  assert.deepEqual(sourceFrameQuality(3000, 2000, 1, 1.04).rating, "eingeschränkt");
  const normalized = normalizeInteractiveFrame(
    { centerX: 0.5, centerY: 0.5, scale: 1.042 },
    3000,
    2000,
  );
  assert.ok(normalized.scale <= budget.maximumScale);
  assert.equal(sourceFrameQuality(3000, 2000, 1, normalized.scale).rating, "eingeschränkt");
});

test("portrait quality uses width as well as height and normalizes persisted frames", () => {
  assert.equal(sourceFrameQuality(900, 2400, 1, 1).rating, "ungeeignet");
  assert.deepEqual(
    normalizeInteractiveFrame(
      { centerX: 0.5, centerY: 0.5, scale: 1.4 },
      900,
      2400,
    ),
    { centerX: 0.5, centerY: 0.5, scale: 1 },
  );
  assert.match(
    workbenchSource,
    /normalizeInteractiveFrame\(\s*cropFrameFromSpec\(sceneSpecScene\.startCrop\),\s*image\.width,\s*image\.height/,
  );
  assert.match(
    workbenchSource,
    /normalizeInteractiveFrame\(\s*cropFrameFromSpec\(sceneSpecScene\.endCrop\),\s*image\.width,\s*image\.height/,
  );
});

test("logo geometry stays clipped while the visible logo remains topmost without a collision warning", () => {
  const plain = logoSafeZone({ x: 0.8, y: 0.8, widthRel: 0.3, assetWidth: 1000, assetHeight: 500, rotationDeg: 0 });
  const rotated = logoSafeZone({ x: 0.8, y: 0.8, widthRel: 0.3, assetWidth: 1000, assetHeight: 500, rotationDeg: 45 });
  assert.ok(rotated.h > plain.h);
  assert.ok(plain.x >= 0 && plain.y >= 0 && plain.x + plain.w <= 1 && plain.y + plain.h <= 1);
  assert.match(workbenchSource, /className="pointer-events-none absolute z-50/);
  assert.doesNotMatch(guidedSource, /überlappt die globale Logo-Sicherheitszone/);
  assert.match(guidedSource, /Text darf bewusst darunter hindurchlaufen/);
});

test("typography elements are independent and expose rich geometry and enter/exit motion", () => {
  const first = createTypographyElement("one", 0);
  const second = createTypographyElement("two", 1);
  assert.notEqual(first.id, second.id);
  assert.notEqual(first.geometry.y, second.geometry.y);
  assert.equal(first.geometry.scaleX, 1);
  assert.equal(first.geometry.scaleY, 1);
  assert.equal(first.animation.enter.animationId, "fade");
  assert.equal(first.animation.exit?.animationId, "fade-out");
  assert.equal("timing" in first, false);
  assert.deepEqual(first.layer, { mode: "foreground" });
  for (const animation of ["blur-in", "scale-in", "word-by-word", "line-by-line", "blur-out", "scale-out"]) assert.match(guidedSource, new RegExp(animation));
  assert.match(guidedSource, /data-typography-canvas/);
  assert.match(guidedSource, /image.previewUrl/);
});

test("typography canvas resize and rotation handles update exact Shared geometry", () => {
  const element = createTypographyElement("handle");
  const wider = resizeTypographyGeometry(element.geometry, 0.1);
  assert.equal(wider.widthRel, 0.82);
  const clipped = resizeTypographyGeometry({ ...element.geometry, x: 0.8 }, 0.5);
  assert.ok(Math.abs(clipped.widthRel - 0.2) < 1e-9);
  assert.equal(typographyRotationDegrees({ centerX: 100, centerY: 100, pointerX: 200, pointerY: 100 }), 90);
  const scaled = scaleTypographyGeometry(element.geometry, 0.25);
  assert.equal(scaled.scaleX, 1.25);
  assert.equal(scaled.scaleY, 1.25);
  assert.equal(scaleTypographyGeometry(element.geometry, 10).scaleX, 4);
  assert.match(guidedSource, /aria-label="Text symmetrisch skalieren"[\s\S]*onPointerDown/);
  assert.match(guidedSource, /aria-label="Textdrehung ziehen"[\s\S]*onPointerDown/);
  assert.equal(guidedSource.match(/min=\{0\.25\} max=\{4\}/g)?.length, 2);
  assert.equal(guidedSource.match(/Math\.max\(0\.25, Math\.min\(4, Number\(event\.target\.value\)\)\)/g)?.length, 2);
});

test("typography guides snap visible glyph bounds and remain optional", () => {
  assert.deepEqual(snapTypographyPosition({ x: 0.43, y: 0.2, visibleWidthRel: 0.12, visibleHeightRel: 0.08, verticalGuides: [0.5], horizontalGuides: [], enabled: true }), { x: 0.44, y: 0.2 });
  assert.deepEqual(snapTypographyPosition({ x: 0.43, y: 0.2, visibleWidthRel: 0.12, visibleHeightRel: 0.08, verticalGuides: [0.5], horizontalGuides: [], enabled: false }), { x: 0.43, y: 0.2 });
  assert.match(guidedSource, /Goldener Schnitt 38,2 \/ 61,8 %/);
  assert.match(guidedSource, /box\.width \/ canvas\.width/);
  assert.match(guidedSource, /w-fit max-w-full/);
  assert.match(guidedSource, /transformOrigin: "center"/);
});

test("typography is optional, catalog fonts are visual, and corporate upload has its own rights gate", () => {
  assert.match(guidedSource, /initialElements \?\? \[\]/);
  assert.doesNotMatch(guidedSource, /disabled=\{elements\.length <= 1\}/);
  assert.match(guidedSource, /Katalogschriften · direkt verwendbar/);
  assert.match(guidedSource, /style=\{\{ fontFamily: font \}\}/);
  assert.match(guidedSource, /Eigene Corporate-Schrift hinzufügen/);
  assert.match(guidedSource, /Ich bestätige die Nutzungsrechte an dieser eigenen Schriftdatei/);
  assert.match(guidedSource, /key=\{font\.assetId\}/);
});

test("typography during-animation is exact, one-way and constrained to the visible window", () => {
  const element = createTypographyElement("vertical");
  assert.deepEqual(element.animation.during, { animationId: "none", easing: "linear", holdStartMs: 0, holdEndMs: 0 });
  const vertical = {
    ...element,
    animation: {
      ...element.animation,
      during: { animationId: "up_to_down" as const, easing: "smooth" as const, holdStartMs: 120, holdEndMs: 80 },
    },
  };
  assert.deepEqual(JSON.parse(JSON.stringify(vertical)).animation.during, { animationId: "up_to_down", easing: "smooth", holdStartMs: 120, holdEndMs: 80 });
  assert.match(guidedSource, /up_to_down: "Einmal von oben nach unten"/);
  assert.match(guidedSource, /down_to_up: "Einmal von unten nach oben"/);
  assert.match(guidedSource, /Es gibt kein automatisches Zurückpendeln/);
  assert.match(guidedSource, /activeMotionWindowMs/);
  assert.doesNotMatch(guidedSource, /ping.?pong/i);
});

test("typography controls normalize exact Shared numeric bounds and keep a positive during window", () => {
  const element = createTypographyElement("bounds");
  const normalized = normalizeTypographyElement({
    ...element,
    fontWeight: 955.4,
    letterSpacing: 0.5,
    lineHeight: 3,
    geometry: { ...element.geometry, rotationDeg: 250 },
    animation: {
      ...element.animation,
      enter: { animationId: "fade", durationMs: 5_000, delayMs: 0 },
      during: { animationId: "up_to_down", easing: "smooth", holdStartMs: 2.5, holdEndMs: 2.5 },
      exit: { animationId: "fade-out", durationMs: 5_000, delayMs: 0 },
    },
  }, 2);
  assert.equal(normalized.fontWeight, 900);
  assert.equal(normalized.letterSpacing, 0.3);
  assert.equal(normalized.lineHeight, 2);
  assert.equal(normalized.geometry.rotationDeg, 180);
  assert.equal(normalized.animation.enter.durationMs, 4_000);
  assert.equal(normalized.animation.exit?.durationMs, 4_000);
  assert.deepEqual(normalized.animation.during, { animationId: "none", easing: "linear", holdStartMs: 0, holdEndMs: 0 });
  assert.match(guidedSource, /max=\{0\.3\}/);
  assert.match(guidedSource, /min=\{0\.8\} max=\{2\}/);
  assert.equal(guidedSource.match(/max=\{4000\}/g)?.length, 2);
});

test("combined scene hero uses saved crop motion, composed typography wrappers and the global logo on top", () => {
  assert.match(guidedSource, /data-scene-motion-preview[\s\S]*guidedSceneMotionPreviewStyle\(take\)/);
  assert.match(guidedSource, /<TypographyPreviewContent element=\{element\} durationSeconds=\{durationSeconds\}/);
  assert.match(guidedSource, /style=\{styles\.exit\}[\s\S]*style=\{styles\.during\}[\s\S]*style=\{styles\.enter\}/);
  assert.match(guidedSource, /1 normal forwards/);
  assert.doesNotMatch(guidedSource, /animation-composition/);
  assert.match(guidedSource, /alt="Globales Logo über der Typografie"[\s\S]*absolute z-50/);
  assert.match(workbenchSource, /take=\{activeTake\}[\s\S]*brandOverlay=\{project\.brandOverlay\}[\s\S]*brandPreviewUrl=/);
  assert.doesNotMatch(workbenchSource, /Typografie wird vor einer Überlappung gewarnt/);
});

test("scene editing has one replayable result flow for motion, frames, duration and typography", () => {
  assert.match(workbenchSource, /<CombinedSourceFramePreview[\s\S]*startFrame=\{startFrame\}[\s\S]*endFrame=\{endFrame\}/);
  assert.match(workbenchSource, /Vorschau abspielen/);
  assert.match(workbenchSource, /onAnimationEnd=\{\(\) => \{[\s\S]*setCompletedPreviewKey\(previewKey\)[\s\S]*setPreviewPlaying\(false\)/);
  assert.match(workbenchSource, /animate=\{previewIsPlaying\}/);
  assert.match(workbenchSource, /key=\{`scene-preview-\$\{previewKey\}`\}/);
  assert.match(workbenchSource, /typographyElements\.map[\s\S]*<TypographyPreviewContent element=\{element\} durationSeconds=\{durationSeconds\}/);
  assert.match(workbenchSource, /typographyElements=\{typographyDrafts\[activeTake\.id\]/);
  assert.doesNotMatch(workbenchSource, /durationSeconds < 1\.2 \|\| qualityNote/);
  assert.doesNotMatch(workbenchSource, /if \(value < 1\.2\) setMotion\("still"\)/);
  assert.match(guidedSource, /TypographyPreviewContent element=\{element\} durationSeconds=\{durationSeconds\} animate=\{false\}/);
  assert.match(guidedSource, /onPreview\?\.\(motion\)/);
  assert.match(workbenchSource, /onPreview=\{\(motion\) => \{[\s\S]*sourceMotionPatch\(motion, activeTake/);
  assert.match(workbenchSource, /motionPreview\?\.label \?\? motionLabel\(effectivePreviewMotion\)/);
});

test("typography exit starts before its trailing delay and leaves no unintended during gap", () => {
  const window = typographyExitWindowMs(5_000, {
    animationId: "fade-out",
    durationMs: 800,
    delayMs: 300,
  });
  assert.deepEqual(window, { startMs: 3_900, endMs: 4_700 });
  assert.match(guidedSource, /typographyExitWindowMs\(intervalMs, exit\)/);
  assert.match(guidedSource, /\$\{exitWindow\?\.startMs \?\? 0\}ms 1 normal forwards/);
  assert.doesNotMatch(guidedSource, /intervalMs - exitTotal \+ exit\.delayMs/);
});

test("approved generated clip replaces one slot or is inserted explicitly without double duration", () => {
  const selected = createAiDraft("draft", "asset-a", 16, "take-a");
  const generated = { ...selected, status: "generated" as const, preparedAssetId: "prepared-a" };
  const approved = approveAiDraft(generated, "clip-a", 7.25);
  assert.equal(approved.status, "approved");
  const slots = [
    { id: "take-a", kind: "still" as const, durationSeconds: 3 },
    { id: "take-b", kind: "still" as const, durationSeconds: 4 },
  ];
  const replaced = replaceTimelineSlotWithApprovedClip(slots, "take-a", approved);
  assert.equal(timelineDurationFromSlots(replaced), 11.25);
  const inserted = insertApprovedClipSlot(slots, 1, approved);
  assert.equal(timelineDurationFromSlots(inserted), 14.25);
});

test("AI draft persists through Shared while the canonical final step cannot start a provider", () => {
  const draft = createAiDraft("draft-demo", "asset", 16, "take", "GENERATIVE_WALK_THROUGH");
  assert.equal(draft.selection.demoNumber, 16);
  assert.equal(draft.motion.demoNumber, 74);
  assert.match(creativeRouteSource, /status: "selected"/);
  assert.match(creativeRouteSource, /ai-studio-drafts/);
  assert.match(creativeRouteSource, /demoNumber: motionIndex \+ 1/);
  assert.match(workbenchSource, /setSelectedCatalogMotionId\(motion.id\)[\s\S]*setStage\("preview_ai"\)/);
  assert.ok(AI_STUDIO_PROPOSALS.every((proposal) => proposal.resultExampleUrl === null && proposal.provenance === null));
  assert.match(guidedSource, /Auftragsfotos werden niemals als KI-Ergebnisse ausgegeben/);
  assert.match(guidedSource, /Noch nicht verfügbar/);
  assert.match(guidedSource, /<video src=\{proposal\.resultExampleUrl\}[\s\S]*autoPlay loop muted playsInline/);
  assert.doesNotMatch(guidedSource, /\/demo\/video-studio\/candidate-10/);
  assert.doesNotMatch(guidedSource, /<PerspectiveVideoPanel/);
  assert.doesNotMatch(guidedSource, /Google Fast erzeugen|\/api\/video-studio\/veo\/start/);
  assert.match(guidedSource, /Storyboard speichern · keine Erzeugung/);
  assert.match(guidedSource, /kein Qwen-, Google-, Kling-, MiniMax- oder anderer Providerjob gestartet/);
  assert.doesNotMatch(creativeRouteSource, /provider_disabled|queued|status: "ready"/);
  assert.doesNotMatch(guidedSource, /actualDuration/);
});

test("motion choice is progressive and the final film follows explicit review gates", () => {
  assert.match(guidedSource, /motions\.slice\(0, 6\)/);
  assert.match(guidedSource, /Weitere \{motions\.length - visibleMotions\.length\} Bewegungen anzeigen/);
  assert.match(guidedSource, /Original erhalten · ★/);
  assert.match(guidedSource, /Neuen Bildraum vorbereiten · ★★★/);
  assert.match(workbenchSource, /1 · Gesamtpreview erstellen/);
  assert.match(workbenchSource, /2 · Gesehene Preview freigeben/);
  assert.match(workbenchSource, /3 · Endfassung erstellen/);
  assert.match(workbenchSource, /project\.status !== "preview_ready"[\s\S]*unreviewedSceneCount > 0[\s\S]*!previewUrl/);
  assert.match(workbenchSource, /project\.status !== "approved"/);
  assert.match(workbenchSource, /onDoubleClick=\{\(event\) => openPreviewSceneAt/);
  assert.doesNotMatch(workbenchSource, /onClick=\{\(event\) =>\s*openPreviewSceneAt/);
});

test("failed creative autosave keeps the local draft and offers an explicit retry", () => {
  assert.match(guidedSource, /await onSaveRef\.current\(\{ typographyElements: elements, sceneLayers: layers \}\)/);
  assert.match(guidedSource, /setSaveFailed\(true\)/);
  assert.match(guidedSource, /Dein lokaler Entwurf bleibt erhalten/);
  assert.match(guidedSource, /setSaveRetryNonce/);
  assert.match(workbenchSource, /onSave=\{\(patch\) => saveTake\(activeTake\.id, patch\)\}/);
  assert.doesNotMatch(workbenchSource, /setProject\(null\)/);
});

test("motion preview traverses once, honors holds and never alternates", () => {
  assert.match(workbenchSource, /var\(--motion-delay\) 1 normal forwards/);
  assert.match(workbenchSource, /durationSeconds - holdStartSeconds - holdEndSeconds/);
  assert.match(workbenchSource, /objectPosition: `\$\{start\.centerX \* 100\}% \$\{start\.centerY \* 100\}%`/);
  assert.doesNotMatch(workbenchSource, /infinite alternate/);
});

test("creative mutations publish the new Shared revision before the next autosave", () => {
  assert.equal(creativeRouteSource.match(/const \{ project \} = await sharedStudioRequest/g)?.length, 2);
  assert.match(creativeRouteSource, /return NextResponse\.json\(\{[\s\S]*project,[\s\S]*fontAsset:/);
  assert.match(guidedSource, /if \(!payload\.project\) throw new Error\("Die neue Projektrevision fehlt\."\)/);
  assert.match(workbenchSource, /onProject=\{\(nextProject\) => \{[\s\S]*projectRef\.current = nextProject;[\s\S]*setProject\(nextProject\)/);
});

test("existing account fonts are attached and reloaded through a session-bound byte route", () => {
  assert.match(creativeRouteSource, /current\.project\.fontAssets\?\.some\(\(asset\) => asset\.assetId === assetId\)/);
  assert.match(creativeRouteSource, /resolveFontAsset\([\s\S]*current\.project\.product,[\s\S]*current\.actorId/);
  assert.match(creativeRouteSource, /"cache-control": "private, no-store, max-age=0"/);
  assert.match(creativeRouteSource, /"cross-origin-resource-policy": "same-origin"/);
  assert.match(guidedSource, /new FontFace\(font\.displayName/);
  assert.match(guidedSource, /document\.fonts\.delete\(face\)/);
});

test("empty normalized scene layers are replaced by source-bound mask layers", () => {
  assert.match(workbenchSource, /activeTake\.sceneLayers\?\.length \? activeTake\.sceneLayers : \[/);
  assert.match(workbenchSource, /maskAssetId: asset\.assetId/);
  assert.match(guidedSource, /mode === "foreground" \? \{ mode \} : \{ mode, maskAssetId: maskAssets\[0\]\?\.assetId \}/);
});

test("normal preview remains the primary path before optional AI ideas", () => {
  assert.match(workbenchSource, /Film prüfen und abschließen/);
  assert.match(workbenchSource, /Optionale KI-Ideen stehen getrennt darunter/);
  assert.match(workbenchSource, /onClick={startPreview}/);
  assert.match(workbenchSource, /onClick={approvePreview}/);
  assert.match(workbenchSource, /onClick={startFinal}/);
});

test("a failed render remains visible after refresh while the preserved draft can be retried", () => {
  assert.match(
    workbenchSource,
    /!notice && project\.status === "failed"[\s\S]*data-video-render-failure[\s\S]*vollständiger[\s\S]*Entwurf[\s\S]*Vorschau nach Prüfung erneut starten/,
  );
  assert.match(
    workbenchSource,
    /onClick=\{startPreview\}/,
  );
});

test("mask handoff is globally capped, de-duplicated and source-bound", () => {
  const images = Array.from({ length: 10 }, (_, imageIndex) => ({
    id: `image-${imageIndex}`,
    aiOverlays: {
      sam3: {
        masks: Array.from({ length: 20 }, (_, maskIndex) => ({
          label: `Maske ${imageIndex}-${maskIndex}`,
          maskKey: maskIndex === 0 ? "shared/mask.png" : `image-${imageIndex}/mask-${maskIndex}.png`,
          technical: maskIndex === 19,
        })),
      },
    },
  }));
  const candidates = videoMaskCandidatesForHandoff(images);
  assert.equal(candidates.length, 128);
  assert.equal(new Set(candidates.map((candidate) => candidate.maskKey)).size, 128);
  assert.ok(candidates.every((candidate) => candidate.sourceAssetId.startsWith("image-")));
});
