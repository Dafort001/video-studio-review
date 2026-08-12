#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeonHttp } from "@prisma/adapter-neon";

const args = process.argv.slice(2);
const customerEmail = readArg("--email");
const dataPath = path.join(process.cwd(), "src", "data", "video-studio-demo-candidates.json");

loadEnv(".env.local");
loadEnv(".env.production.local");
loadEnv(".env.development.local");

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL fehlt.");
  process.exit(2);
}

if (globalThis.WebSocket) neonConfig.webSocketConstructor = globalThis.WebSocket;

const prisma = new PrismaClient({
  adapter: new PrismaNeonHttp(process.env.DATABASE_URL, { fetchOptions: { cache: "no-store" } }),
});

const demoData = JSON.parse(fs.readFileSync(dataPath, "utf8"));

try {
  const customer = await findTargetCustomer(customerEmail);
  if (!customer) throw new Error("Daniel-Kundenkonto wurde nicht gefunden. Nutze --email=name@example.com.");
  const customerCode = normalizeCustomerCode(customer.customerId);
  const imported = [];

  for (const candidate of demoData.candidates) {
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
            sourceProduct: "piximmo",
            sourceChannel: "piximmo_admin_manual",
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
            sourceProduct: "piximmo",
            sourceChannel: "piximmo_admin_manual",
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
        qcMetadata: {
          videoStudio: {
            candidateIndex: candidate.candidateIndex,
            candidateLabel: candidate.candidateLabel,
            order: shot.order,
            durationSeconds: shot.durationSeconds,
            motionType: shot.motionType,
            startCrop: shot.startCrop,
            endCrop: shot.endCrop,
            caption: shot.caption,
            promptNote: shot.suggestedMotion,
            brokerEnabled: false,
            brokerPrompt: "",
            source: "opening-video-muster-candidates-2026-07-07",
          },
        },
        },
      });
    }

    await ensureCustomerGalleryShare(job.id);
    imported.push(`${job.jobId} ${candidate.projectName} (${candidate.shots.length})`);
  }

  console.log(`Import fertig fuer ${customer.email ?? customer.customerId}:`);
  for (const item of imported) console.log(`- ${item}`);
} finally {
  await prisma.$disconnect();
}

async function ensureCustomerGalleryShare(jobId) {
  const existing = await prisma.galleryShare.findFirst({
    where: { jobId, shareType: "customer_portal", active: true },
    select: { id: true },
  });
  if (existing) return existing;
  return prisma.galleryShare.create({
    data: {
      jobId,
      label: "Kunden-Galerie",
      shareType: "customer_portal",
      canRate: true,
      canComment: true,
      canAnnotate: true,
      canDownload: false,
    },
  });
}

async function findTargetCustomer(email) {
  if (email) {
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

function readArg(name) {
  const prefix = `${name}=`;
  const match = args.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : null;
}

function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function normalizeCustomerCode(value) {
  return (value || "DFO").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 3).padEnd(3, "X");
}

function roomLabel(value) {
  if (!value) return null;
  return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}
