import { prisma } from "@/lib/prisma";
import { ensureCustomerGalleryShare } from "@/lib/customer-gallery-links";
import { PIXIMMO_ADMIN_MANUAL_CHANNEL, PIXIMMO_JOB_SOURCE } from "@/lib/job-scope";
import { isVideoStudioMotion, mergeShotPlanMetadata, type DemoCandidate } from "@/lib/video-studio";
import demoCandidates from "@/data/video-studio-demo-candidates.json";

type ImportOptions = {
  customerEmail?: string | null;
};

export async function importVideoStudioDemoCandidates(options: ImportOptions = {}) {
  const customer = await findTargetCustomer(options.customerEmail);
  if (!customer) {
    throw new Error("Daniel-Kundenkonto wurde nicht gefunden. Bitte Kundenseite zuerst anlegen oder E-Mail angeben.");
  }

  const customerCode = normalizeCustomerCode(customer.customerId);
  const imported = [];

  for (const candidate of demoCandidates.candidates as DemoCandidate[]) {
    const jobCode = `V${String(candidate.candidateIndex).padStart(4, "0")}`.slice(0, 5);
    const existingJob = await prisma.job.findUnique({
      where: { customerCode_jobId: { customerCode, jobId: jobCode } },
      select: { id: true },
    });
    const job = existingJob
      ? await prisma.job.update({
          where: { id: existingJob.id },
          data: {
            projectName: candidate.projectName,
            propertyAddress: candidate.propertyAddress,
            status: "completed",
            paymentStatus: "paid",
            sourceProduct: PIXIMMO_JOB_SOURCE,
            sourceChannel: PIXIMMO_ADMIN_MANUAL_CHANNEL,
            userId: customer.id,
          },
        })
      : await prisma.job.create({
          data: {
            customerCode,
            jobId: jobCode,
            projectName: candidate.projectName,
            propertyAddress: candidate.propertyAddress,
            status: "completed",
            paymentStatus: "paid",
            sourceProduct: PIXIMMO_JOB_SOURCE,
            sourceChannel: PIXIMMO_ADMIN_MANUAL_CHANNEL,
            userId: customer.id,
          },
        });

    await prisma.processedImage.deleteMany({ where: { jobId: job.id } });

    for (const shot of candidate.shots) {
      await prisma.processedImage.create({
        data: {
        jobId: job.id,
        r2ObjectKey: shot.deliveryKey,
        thumbKey: shot.deliveryKey,
        deliveryKey: shot.deliveryKey,
        finalFilename: shot.filename,
        roomName: roomLabel(shot.roomLabel),
        finalRoomName: roomLabel(shot.roomLabel),
        motifIndex: shot.order,
        exposeSortOrder: shot.order,
        altText: shot.altText,
        qcStatus: "delivery_ready",
        status: "approved",
        isApproved: true,
        deliveryReadyAt: new Date(),
        stylePreset: "natural_hdr",
        qcMetadata: mergeShotPlanMetadata(null, {
          candidateIndex: candidate.candidateIndex,
          candidateLabel: candidate.candidateLabel,
          order: shot.order,
          durationSeconds: shot.durationSeconds,
          motionType: isVideoStudioMotion(shot.motionType) ? shot.motionType : "still",
          startCrop: shot.startCrop,
          endCrop: shot.endCrop,
          caption: shot.caption,
          promptNote: shot.suggestedMotion,
          source: "opening-video-muster-candidates-2026-07-07",
        }),
        },
      });
    }

    await ensureCustomerGalleryShare(job.id);
    imported.push({
      jobId: job.jobId,
      projectName: candidate.projectName,
      candidateIndex: candidate.candidateIndex,
      shots: candidate.shots.length,
    });
  }

  return {
    customer: {
      id: customer.id,
      email: customer.email,
      customerId: customer.customerId,
    },
    imported,
  };
}

async function findTargetCustomer(email?: string | null) {
  if (email?.trim()) {
    return prisma.user.findFirst({
      where: { email: email.trim().toLowerCase(), role: "customer", isDeleted: false },
      select: { id: true, email: true, name: true, customerId: true },
    });
  }

  const customers = await prisma.user.findMany({
    where: { role: "customer", isDeleted: false },
    select: { id: true, email: true, name: true, customerId: true },
    take: 200,
  });

  return customers.find((user) => {
    const haystack = `${user.email ?? ""} ${user.name ?? ""} ${user.customerId ?? ""}`.toLowerCase();
    return haystack.includes("daniel") || haystack.includes("fortmann") || haystack.includes("dfo");
  }) ?? null;
}

function normalizeCustomerCode(value: string | null) {
  return (value || "DFO").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 3).padEnd(3, "X");
}

function roomLabel(value: string | null | undefined) {
  if (!value) return null;
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
