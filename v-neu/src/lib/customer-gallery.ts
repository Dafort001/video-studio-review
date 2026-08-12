export const CUSTOMER_GALLERY_SHARE_TYPES = ["customer_portal", "external_review", "delivery_download"] as const;

export type CustomerGalleryShareType = (typeof CUSTOMER_GALLERY_SHARE_TYPES)[number];

export type CustomerGalleryRights = {
    canRate: boolean;
    canComment: boolean;
    canAnnotate: boolean;
    canDownload: boolean;
};

export const CUSTOMER_GALLERY_TYPE_LABELS: Record<CustomerGalleryShareType, string> = {
    customer_portal: "Kunden-Galerie",
    external_review: "Externer Review",
    delivery_download: "Download-Link",
};

export const CUSTOMER_GALLERY_DEFAULT_RIGHTS: Record<CustomerGalleryShareType, CustomerGalleryRights> = {
    customer_portal: {
        canRate: true,
        canComment: true,
        canAnnotate: true,
        canDownload: true,
    },
    external_review: {
        canRate: true,
        canComment: true,
        canAnnotate: true,
        canDownload: false,
    },
    delivery_download: {
        canRate: false,
        canComment: false,
        canAnnotate: false,
        canDownload: true,
    },
};

export function normalizeCustomerGalleryShareType(value: unknown): CustomerGalleryShareType {
    return CUSTOMER_GALLERY_SHARE_TYPES.includes(value as CustomerGalleryShareType)
        ? value as CustomerGalleryShareType
        : "external_review";
}

export function getCustomerGalleryDefaultRights(shareType: CustomerGalleryShareType): CustomerGalleryRights {
    return CUSTOMER_GALLERY_DEFAULT_RIGHTS[shareType];
}
