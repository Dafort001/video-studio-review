import { NextResponse } from "next/server";
import { centralVideoStudioStarterUrl } from "@/lib/central-video-studio";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  return NextResponse.redirect(centralVideoStudioStarterUrl(request.url), 307);
}
