import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isVideoStudioMotion, mergeShotPlanMetadata, normalizeCrop, parseShotPlan, type VideoStudioMotion } from "@/lib/video-studio";

type SaveBody = {
  imageId?: string;
  durationSeconds?: number;
  motionType?: string;
  startCrop?: unknown;
  endCrop?: unknown;
  caption?: string;
  promptNote?: string;
  brokerPrompt?: string;
  brokerEnabled?: boolean;
};

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({})) as SaveBody;
  if (!body.imageId) {
    return NextResponse.json({ error: "Bild fehlt." }, { status: 400 });
  }

  const sessionUser = session.user as { id?: string | null; email?: string | null; role?: string | null };
  const isAdmin = sessionUser.role === "admin" || sessionUser.role === "ADMIN";
  const user = sessionUser.id
    ? { id: sessionUser.id }
    : await prisma.user.findUnique({ where: { email: sessionUser.email ?? "" }, select: { id: true } });

  if (!user && !isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const image = await prisma.processedImage.findFirst({
    where: {
      id: body.imageId,
      job: {
        sourceProduct: "piximmo",
        ...(isAdmin ? {} : { userId: user?.id }),
      },
    },
    select: {
      id: true,
      qcMetadata: true,
    },
  });

  if (!image) {
    return NextResponse.json({ error: "Bild wurde nicht gefunden." }, { status: 404 });
  }

  const current = parseShotPlan(image.qcMetadata);
  if (!current) {
    return NextResponse.json({ error: "Dieses Bild gehoert nicht zur Video-Werkstatt." }, { status: 400 });
  }

  const motionType: VideoStudioMotion = isVideoStudioMotion(body.motionType) ? body.motionType : current.motionType;
  const nextMetadata = mergeShotPlanMetadata(image.qcMetadata, {
    durationSeconds: typeof body.durationSeconds === "number"
      ? Math.min(8, Math.max(0.5, body.durationSeconds))
      : current.durationSeconds,
    motionType,
    startCrop: normalizeCrop(body.startCrop, current.startCrop),
    endCrop: normalizeCrop(body.endCrop, current.endCrop),
    caption: typeof body.caption === "string" ? body.caption : current.caption,
    promptNote: typeof body.promptNote === "string" ? body.promptNote : current.promptNote,
    brokerPrompt: typeof body.brokerPrompt === "string" ? body.brokerPrompt : current.brokerPrompt,
    brokerEnabled: body.brokerEnabled === true,
  });

  await prisma.processedImage.update({
    where: { id: image.id },
    data: { qcMetadata: nextMetadata },
  });

  return NextResponse.json({ success: true });
}
