import { prisma } from "@/lib/prisma";
import { getCustomerGalleryDefaultRights } from "@/lib/customer-gallery";

export async function ensureCustomerGalleryShare(jobId: string) {
    const existing = await prisma.galleryShare.findFirst({
        where: {
            jobId,
            shareType: "customer_portal",
            active: true,
        },
        orderBy: { createdAt: "asc" },
    });

    if (existing) {
        const rights = getCustomerGalleryDefaultRights("customer_portal");
        if (
            existing.canRate !== rights.canRate ||
            existing.canComment !== rights.canComment ||
            existing.canAnnotate !== rights.canAnnotate ||
            existing.canDownload !== rights.canDownload
        ) {
            const updated = await prisma.galleryShare.update({
                where: { id: existing.id },
                data: rights,
            });
            return { share: updated, created: false };
        }
        return { share: existing, created: false };
    }

    const rights = getCustomerGalleryDefaultRights("customer_portal");
    const share = await prisma.galleryShare.create({
        data: {
            jobId,
            label: "Kunden-Galerie",
            shareType: "customer_portal",
            ...rights,
        },
    });

    return { share, created: true };
}

export function buildReviewUrl(origin: string | null, token: string) {
    const base = origin || process.env.NEXT_PUBLIC_APP_URL || "https://pix.immo";
    return `${base.replace(/\/$/, "")}/review/${token}`;
}
