import type { Prisma } from "@prisma/client";

export const PIXCAPTURE_JOB_SOURCE = "pixcapture";
export const PIXIMMO_JOB_SOURCE = "piximmo";

export const PIXIMMO_ADMIN_MANUAL_CHANNEL = "piximmo_admin_manual";
export const PIXIMMO_ADMIN_INTAKE_CHANNEL = "piximmo_admin_intake";
export const PIXIMMO_CUSTOMER_BOOKING_CHANNEL = "piximmo_customer_booking";

export const PIXCAPTURE_PORTAL_CHANNEL = "pixcapture_portal";
export const PIXCAPTURE_MOBILE_CHANNEL = "pixcapture_mobile";

export const PIXIMMO_JOB_CHANNELS = [
  PIXIMMO_ADMIN_MANUAL_CHANNEL,
  PIXIMMO_ADMIN_INTAKE_CHANNEL,
  PIXIMMO_CUSTOMER_BOOKING_CHANNEL,
] as const;

export const piximmoJobWhere = {
  sourceProduct: PIXIMMO_JOB_SOURCE,
  sourceChannel: { in: [...PIXIMMO_JOB_CHANNELS] },
} satisfies Prisma.JobWhereInput;

export const pixcaptureJobWhere = {
  sourceProduct: PIXCAPTURE_JOB_SOURCE,
} satisfies Prisma.JobWhereInput;
