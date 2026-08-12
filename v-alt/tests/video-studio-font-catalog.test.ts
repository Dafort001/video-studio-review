import test from "node:test";
import assert from "node:assert/strict";
import { VIDEO_STUDIO_FONTS, normalizeVideoStudioFontMenu } from "../src/lib/video-studio-font-catalog.ts";

test("video studio exposes 26 unique pinned menu fonts", () => {
  assert.equal(VIDEO_STUDIO_FONTS.length, 26);
  assert.equal(new Set(VIDEO_STUDIO_FONTS.map((font) => font.family)).size, 26);
  assert.ok(VIDEO_STUDIO_FONTS.some((font) => font.family === "Cormorant Garamond"));
  assert.ok(VIDEO_STUDIO_FONTS.some((font) => font.family === "Rubik Bubbles"));
});
test("admin font menu changes visibility and order without changing the catalog", () => {
  const menu = normalizeVideoStudioFontMenu([
    { family: "Manrope", active: false, order: 1 },
    { family: "Inter", active: true, order: 0 },
  ]);
  assert.equal(menu[0].family, "Inter");
  assert.equal(menu.find((font) => font.family === "Manrope")?.active, false);
  assert.equal(VIDEO_STUDIO_FONTS.find((font) => font.family === "Manrope")?.active, true);
});
