import { NextResponse } from "next/server";
import { listVideoQualityPresets } from "@/lib/video-workbench-costs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    success: true,
    presets: listVideoQualityPresets(),
  });
}
