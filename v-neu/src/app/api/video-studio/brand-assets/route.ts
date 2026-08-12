import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Logos werden ausschließlich innerhalb einer freigegebenen zentralen Werkstatt-Sitzung verwaltet.",
    },
    { status: 410 },
  );
}
