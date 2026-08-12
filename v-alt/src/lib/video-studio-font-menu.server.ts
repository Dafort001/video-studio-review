import { prisma } from "@/lib/prisma";
import {
  VIDEO_STUDIO_FONTS,
  normalizeVideoStudioFontMenu,
  type VideoStudioFont,
} from "@/lib/video-studio-font-catalog";

const PAGE = "system:video-studio-font-menu";

export async function getVideoStudioFontMenu(): Promise<VideoStudioFont[]> {
  const rows = await prisma.marketingContent.findMany({
    where: { page: PAGE, type: "font" },
    orderBy: [{ orderIndex: "asc" }, { createdAt: "asc" }],
  });
  if (!rows.length) return VIDEO_STUDIO_FONTS;
  return normalizeVideoStudioFontMenu(
    rows.map((row) => ({
      family: row.url,
      active: row.isActive,
      order: row.orderIndex,
    })),
  );
}

export async function saveVideoStudioFontMenu(
  input: unknown,
): Promise<VideoStudioFont[]> {
  const menu = normalizeVideoStudioFontMenu(input);
  if (!menu.some((font) => font.active)) {
    throw new Error(
      "Mindestens eine Schrift muss im Kundenmenü aktiv bleiben.",
    );
  }
  await prisma.$transaction(async (transaction) => {
    await transaction.marketingContent.deleteMany({
      where: { page: PAGE, type: "font" },
    });
    await transaction.marketingContent.createMany({
      data: menu.map((font) => ({
        page: PAGE,
        type: "font",
        url: font.family,
        altText: font.label,
        description: font.group,
        aspectRatio: "font",
        orderIndex: font.order,
        isActive: font.active,
      })),
    });
  });
  return getVideoStudioFontMenu();
}
