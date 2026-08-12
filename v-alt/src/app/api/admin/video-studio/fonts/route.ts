import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getVideoStudioFontMenu,
  saveVideoStudioFontMenu,
} from "@/lib/video-studio-font-menu.server";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ fonts: await getVideoStudioFontMenu() });
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json().catch(() => null)) as {
    fonts?: unknown;
  } | null;
  if (!body)
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  try {
    return NextResponse.json({
      fonts: await saveVideoStudioFontMenu(body.fonts),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Schriftmenü konnte nicht gespeichert werden.",
      },
      { status: 400 },
    );
  }
}
