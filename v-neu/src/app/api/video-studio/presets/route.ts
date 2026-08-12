import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function retired() {
  return NextResponse.json(
    {
      error:
        "Vorlagen werden ausschließlich innerhalb einer freigegebenen zentralen Werkstatt-Sitzung verwaltet.",
    },
    { status: 410 },
  );
}

export async function GET() {
  return retired();
}

export async function POST() {
  return retired();
}
