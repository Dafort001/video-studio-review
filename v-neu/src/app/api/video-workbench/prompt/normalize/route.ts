import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { logApiUsage } from "@/lib/cost-tracking";
import { DEFAULT_VIDEO_WORKBENCH_PROJECT_ID } from "@/lib/video-workbench-costs";
import {
  createLocalPromptNormalization,
  createNegativePromptEn,
  createVeoPromptEn,
  extractGermanSpokenLine,
  type VideoPromptNormalizeInput,
  type VideoPromptNormalizeResult,
} from "@/lib/video-workbench-prompt-normalizer";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function extractJsonObject(value: string) {
  const start = value.indexOf("{");
  const end = value.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(value.slice(start, end + 1)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({})) as VideoPromptNormalizeInput;
  const projectId = body.projectId?.trim() || DEFAULT_VIDEO_WORKBENCH_PROJECT_ID;
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  const fallback = createLocalPromptNormalization(body);

  if (!apiKey) {
    return NextResponse.json({ success: true, result: fallback, missingKey: true });
  }

  const model = process.env.GEMINI_TEXT_MODEL?.trim() || "gemini-2.5-flash";
  const startedAt = Date.now();
  const systemPrompt = `You normalize German customer video briefs into a safe Veo prompt contract.

Return JSON only. Do not use Markdown.
Fields:
- semanticPromptDe: corrected German intermediate prompt with precise video semantics
- spokenLineDe: exact short German spoken line, or "Immobilienvideo mit Persoenlichkeit."
- veoPromptEn: final English Veo prompt for a realistic 4-second vertical 9:16 real-estate image-to-video opener
- negativePromptEn: English negative prompt
- warnings: array of short German warnings if the brief is ambiguous

Rules:
- Do not do a literal translation. Convert misunderstood German words into the correct video semantics.
- "Praesente", "Präsente", "Praesenter", and similar should mean presenter/person only when the context is a person.
- Preserve real-estate source fidelity: building, facade, windows, doors, street, cars, trees, light, perspective.
- Keep any spoken sentence German.
- No generated text, logo, subtitles, watermark, or graphic overlay in the video.`;

  try {
    const client = new GoogleGenAI({ apiKey });
    const response = await client.models.generateContent({
      model,
      contents: [{
        role: "user",
        parts: [{
          text: `${systemPrompt}

Customer material / person reference:
${body.customerMaterialDe || ""}

German customer prompt:
${body.customerPromptDe || ""}

Preferred spoken line:
${body.preferredSpokenLineDe || ""}`,
        }],
      }],
    });

    const rawText = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
    const parsed = extractJsonObject(rawText);
    const spokenLineDe = stringValue(parsed?.spokenLineDe) || extractGermanSpokenLine(body.customerPromptDe, body.preferredSpokenLineDe);
    const result: VideoPromptNormalizeResult = {
      version: "video_prompt_pipeline_v1",
      customerPromptDe: body.customerPromptDe?.trim() || "",
      customerMaterialDe: body.customerMaterialDe?.trim() || "",
      semanticPromptDe: stringValue(parsed?.semanticPromptDe) || fallback.semanticPromptDe,
      spokenLineDe,
      veoPromptEn: stringValue(parsed?.veoPromptEn) || createVeoPromptEn(spokenLineDe),
      negativePromptEn: stringValue(parsed?.negativePromptEn) || createNegativePromptEn(),
      warnings: Array.isArray(parsed?.warnings)
        ? parsed.warnings.filter((item): item is string => typeof item === "string")
        : fallback.warnings,
      provider: "gemini",
      model,
    };

    const durationMs = Date.now() - startedAt;
    await logApiUsage({
      provider: "gemini",
      model,
      operation: "video_prompt_normalize",
      durationMs,
      inputTokens: Math.round((systemPrompt.length + JSON.stringify(body).length) / 4),
      outputTokens: Math.round((rawText.length || JSON.stringify(result).length) / 4),
      metadata: {
        videoProjectId: projectId,
        promptLength: body.customerPromptDe?.length ?? 0,
        materialLength: body.customerMaterialDe?.length ?? 0,
      },
    });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.warn("[video-workbench/prompt/normalize] Gemini failed, using fallback", error);
    return NextResponse.json({
      success: true,
      result: fallback,
      fallbackReason: error instanceof Error ? error.message : "Gemini prompt normalization failed",
    });
  }
}
