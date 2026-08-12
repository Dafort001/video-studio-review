import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const operationName = new URL(request.url).searchParams.get("operationName")?.trim();
  if (!operationName || !/^models\/[^/]+\/operations\/[A-Za-z0-9_-]+$/.test(operationName)) {
    return NextResponse.json({ error: "Ungueltige Google-Operation." }, { status: 400 });
  }
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Google-Zugang fehlt." }, { status: 503 });
  const statusResponse = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/${operationName}`,
    { headers: { "x-goog-api-key": apiKey }, cache: "no-store" },
  );
  const operation = await statusResponse.json().catch(() => null) as {
    done?: boolean;
    response?: {
      generatedVideos?: Array<{ video?: { uri?: string; mimeType?: string } }>;
      generateVideoResponse?: {
        generatedVideos?: Array<{ video?: { uri?: string; mimeType?: string } }>;
        generatedSamples?: Array<{ video?: { uri?: string; mimeType?: string } }>;
      };
    };
  } | null;
  if (!statusResponse.ok) {
    return NextResponse.json({ error: "Google-Status konnte nicht geladen werden." }, { status: statusResponse.status });
  }
  if (!operation?.done) return NextResponse.json({ error: "Video ist noch nicht fertig." }, { status: 409 });
  const nested = operation.response?.generateVideoResponse;
  const video = operation.response?.generatedVideos?.[0]?.video
    ?? nested?.generatedVideos?.[0]?.video
    ?? nested?.generatedSamples?.[0]?.video;
  if (!video?.uri) return NextResponse.json({ error: "Google hat kein Video geliefert." }, { status: 404 });
  const uri = new URL(video.uri);
  if (uri.protocol !== "https:" || !(
    uri.hostname === "generativelanguage.googleapis.com"
    || uri.hostname.endsWith(".googleusercontent.com")
    || uri.hostname.endsWith(".googleapis.com")
  )) {
    return NextResponse.json({ error: "Ungueltige Google-Videoquelle." }, { status: 502 });
  }
  const videoResponse = await fetch(uri, {
    headers: { "x-goog-api-key": apiKey },
    cache: "no-store",
  });
  if (!videoResponse.ok || !videoResponse.body) {
    return NextResponse.json({ error: "Google-Video konnte nicht geladen werden." }, { status: 502 });
  }
  return new NextResponse(videoResponse.body, {
    status: 200,
    headers: {
      "content-type": video.mimeType ?? videoResponse.headers.get("content-type") ?? "video/mp4",
      "cache-control": "private, no-store, max-age=0",
      "content-disposition": 'inline; filename="pix-video-studio-veo.mp4"',
      "x-content-type-options": "nosniff",
    },
  });
}
