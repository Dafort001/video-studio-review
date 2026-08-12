import { getGermanRoomName } from "@/lib/room-translations";

const FLOOR_LABELS: Record<string, string> = {
    EG: "EG",
    UG: "Keller",
    DG: "DG",
    GF: "EG",
    "1F": "1. OG",
    "2F": "2. OG",
    "3F": "3. OG",
    BASEMENT: "Keller",
    ATTIC: "DG",
    ...Object.fromEntries(
        Array.from({ length: 10 }, (_, index) => {
            const floor = index + 1;
            return [`OG${floor}`, `${floor}. OG`];
        }),
    ),
    ...Object.fromEntries(
        Array.from({ length: 10 }, (_, index) => {
            const floor = index + 1;
            return [`${floor}F`, `${floor}. OG`];
        }),
    ),
};

function normalizeText(value: string | null | undefined): string | null {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
}

function normalizeRoomKey(value: string | null | undefined): string | null {
    return normalizeText(value)?.toLowerCase().replace(/[./]+/g, " ").replace(/[-\s]+/g, "_") ?? null;
}

export function formatGalleryFloorLabel(floor: string | null | undefined): string | null {
    const normalized = normalizeText(floor)?.toUpperCase();
    if (!normalized) return null;
    return FLOOR_LABELS[normalized] ?? normalized;
}

export function buildGalleryRoomName(input: {
    roomType?: string | null;
    roomName?: string | null;
    floor?: string | null;
}): string {
    const roomKey = normalizeRoomKey(input.roomType);
    const storedRoomName = normalizeText(input.roomName);
    const floorLabel = formatGalleryFloorLabel(input.floor);
    const isUnknownRoom = !roomKey || roomKey === "unknown";

    if (isUnknownRoom && floorLabel) return floorLabel;
    if (roomKey === "custom" && storedRoomName) return floorLabel ? `${storedRoomName} (${floorLabel})` : storedRoomName;
    if (isUnknownRoom && storedRoomName) return floorLabel ? `${storedRoomName} (${floorLabel})` : storedRoomName;

    const baseName = getGermanRoomName(input.roomType || "unknown");
    return floorLabel ? `${baseName} (${floorLabel})` : baseName;
}

export function getGalleryRoomNumberingKey(input: {
    roomType?: string | null;
    roomName?: string | null;
    floor?: string | null;
}): string {
    const roomKey = normalizeRoomKey(input.roomType) ?? normalizeRoomKey(input.roomName) ?? "unknown";
    const floorKey = normalizeText(input.floor)?.toUpperCase() ?? "NO_FLOOR";
    return `${floorKey}__${roomKey}`;
}
