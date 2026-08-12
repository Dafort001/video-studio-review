import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { importVideoStudioDemoCandidates } from "@/lib/video-studio-import";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({})) as { customerEmail?: string };

  try {
    const result = await importVideoStudioDemoCandidates({ customerEmail: body.customerEmail });
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Import fehlgeschlagen.",
    }, { status: 500 });
  }
}
