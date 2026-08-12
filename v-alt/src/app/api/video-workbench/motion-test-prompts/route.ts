import { NextResponse } from "next/server";
import {
  MANNEQUIN_MOTION_NEGATIVE_PROMPT,
  MOTION_TEST_PROMPTS,
} from "@/lib/video-workbench-motion-test-prompts";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    success: true,
    recommendedQualityPreset: "probe_lite_720p",
    negativePrompt: MANNEQUIN_MOTION_NEGATIVE_PROMPT,
    firstPassPrompts: MOTION_TEST_PROMPTS.filter((prompt) => prompt.firstPass),
    prompts: MOTION_TEST_PROMPTS,
  });
}
