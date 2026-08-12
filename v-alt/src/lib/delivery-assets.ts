import { Prisma } from "@prisma/client";

export const deliveryReadyImageWhere = {
    qcStatus: "delivery_ready",
    deliveryKey: { not: null },
} satisfies Prisma.ProcessedImageWhereInput;

export function isDeliveryReadyImage(image: {
    qcStatus?: string | null;
    deliveryKey?: string | null;
}) {
    return image.qcStatus === "delivery_ready" && Boolean(image.deliveryKey);
}

export function isQcApprovedImage(image: {
    qcStatus?: string | null;
    status?: string | null;
    isApproved?: boolean | null;
}) {
    return image.qcStatus === "qc_approved" || image.status === "approved" || image.isApproved === true;
}
