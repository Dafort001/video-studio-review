export type VideoStudioFontGroup = "ruhig" | "editorial" | "modern" | "script" | "spielerisch" | "ballon";
export type VideoStudioFont = { family: string; label: string; group: VideoStudioFontGroup; fileBase: string; fallback: string; active: boolean; order: number };

const definitions: Array<Omit<VideoStudioFont, "active" | "order">> = ([
  ["Inter","ruhig","Inter","sans-serif"],["IBM Plex Sans","ruhig","IBMPlexSans","sans-serif"],["Manrope","ruhig","Manrope","sans-serif"],["Sora","ruhig","Sora","sans-serif"],["Space Grotesk","ruhig","SpaceGrotesk","sans-serif"],
  ["Playfair Display","editorial","PlayfairDisplay","serif"],["Cormorant Garamond","editorial","CormorantGaramond","serif"],["Libre Baskerville","editorial","LibreBaskerville","serif"],["Fraunces","editorial","Fraunces","serif"],["Newsreader","editorial","Newsreader","serif"],
  ["Montserrat","modern","Montserrat","sans-serif"],["Oswald","modern","Oswald","sans-serif"],["Bebas Neue","modern","BebasNeue","sans-serif"],["Outfit","modern","Outfit","sans-serif"],["Archivo Narrow","modern","ArchivoNarrow","sans-serif"],["Archivo","modern","Archivo","sans-serif"],
  ["Dancing Script","script","DancingScript","cursive"],["Caveat","script","Caveat","cursive"],
  ["Fredoka","spielerisch","Fredoka","display"],["Baloo 2","spielerisch","Baloo2","display"],
  ["Rubik Bubbles","ballon","RubikBubbles","display"],["Bungee Shade","ballon","BungeeShade","display"],["Bagel Fat One","ballon","BagelFatOne","display"],["Modak","ballon","Modak","display"],["Chewy","ballon","Chewy","display"],["Coiny","ballon","Coiny","display"],
] as const).map(([family, group, fileBase, fallback]) => ({ family, label: family, group, fileBase, fallback }));

export const VIDEO_STUDIO_FONTS: VideoStudioFont[] = definitions.map((font, order) => ({ ...font, active: true, order }));
export const VIDEO_STUDIO_FONT_FAMILIES = new Set(VIDEO_STUDIO_FONTS.map((font) => font.family));

export function fontCssFamily(font: Pick<VideoStudioFont, "family" | "fallback">) {
  return `"${font.family}", ${font.fallback}`;
}

export function normalizeVideoStudioFontMenu(value: unknown): VideoStudioFont[] {
  if (!Array.isArray(value)) return VIDEO_STUDIO_FONTS;
  const saved = new Map(value.map((item) => {
    const row = item && typeof item === "object" ? item as Record<string, unknown> : {};
    return [String(row.family ?? ""), row] as const;
  }));
  return VIDEO_STUDIO_FONTS.map((font) => {
    const row = saved.get(font.family);
    return row ? { ...font, active: row.active !== false, order: Number.isInteger(row.order) ? Number(row.order) : font.order } : font;
  }).sort((left, right) => left.order - right.order);
}
