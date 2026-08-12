import { NextResponse } from "next/server";
import {
  redeemSharedStudioLaunch,
  sharedWorkbenchCookieName,
  SharedVideoStudioError,
} from "@/lib/shared-video-studio";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as {
    launchCode?: unknown;
  } | null;
  const launchCode =
    typeof payload?.launchCode === "string" ? payload.launchCode.trim() : "";
  if (!/^[A-Za-z0-9_-]{20,512}$/.test(launchCode)) {
    return NextResponse.json(
      { error: "Der Werkstatt-Link ist ungültig." },
      { status: 400 },
    );
  }

  try {
    const exchanged = await redeemSharedStudioLaunch(launchCode);
    const response = NextResponse.json({
      workbenchUrl: `/video-studio/workbench/${encodeURIComponent(exchanged.project.id)}`,
    });
    response.cookies.set(
      sharedWorkbenchCookieName(exchanged.project.id),
      exchanged.accessToken,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: exchanged.expiresInSeconds,
      },
    );
    return response;
  } catch (error) {
    if (error instanceof SharedVideoStudioError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      );
    }
    console.error("[shared-video-studio] launch redemption failed", error);
    return NextResponse.json(
      { error: "Die Video-Werkstatt konnte nicht geöffnet werden." },
      { status: 500 },
    );
  }
}
