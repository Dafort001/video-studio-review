export const ROOM_TRANSLATIONS: Record<string, string> = {
    // --- Innenräume ---
    "living_room":      "Wohnzimmer",
    "living_kitchen":   "Wohnküche",
    "studio":           "Studio (Wohn-/Schlafraum)",
    "kitchen":          "Küche",
    "dining_room":      "Esszimmer",
    "bedroom":          "Schlafzimmer",
    "children_room":    "Kinderzimmer",
    "guest_room":       "Gästezimmer",
    "bathroom":         "Badezimmer",
    "guest_wc":         "WC",
    "wc":               "WC",
    "office":           "Büro / Arbeitszimmer",
    "fitness_room":     "Fitnessraum",
    "hallway":          "Flur / Diele",
    "corridor":         "Gang / Korridor",
    "stairs":           "Treppenhaus",
    "storage":          "Abstellraum",
    "pantry":           "Speisekammer",
    "utility_room":     "Hauswirtschaft / Technik (HWR)",
    "laundry_room":     "Waschküche",
    "closet":           "Garderobe / Schrankraum",
    "walk_in_closet":   "Ankleidezimmer",
    "basement":         "Keller",
    "attic":            "Dachboden",
    "conservatory":     "Wintergarten",
    "pool_room":        "Poolbereich / Schwimmbad",
    "sauna":            "Sauna / Wellnessbereich",
    "wine_cellar":      "Weinkeller",
    "home_cinema":      "Heimkino",
    "library":          "Bibliothek / Bücherzimmer",
    "play_room":        "Spielzimmer",
    "music_room":       "Musikzimmer",
    // --- Außenbereiche ---
    "balcony":          "Balkon",
    "terrace":          "Terrasse",
    "roof_terrace":     "Dachterrasse",
    "courtyard":        "Innenhof",
    "garden":           "Garten",
    "driveway":         "Einfahrt / Zufahrt",
    "garage":           "Garage",
    "carport":          "Carport",
    "outbuilding":      "Nebengebäude / Schuppen",
    "exterior":         "Außenbereich (allgemein)",
    "exterior_front":   "Vorderansicht",
    "exterior_rear":    "Rückansicht",
    "exterior_facade":  "Fassade",
    "exterior_full":    "Außenaufnahme (gesamt)",
    "street":           "Straße / Umgebung",
    "rooftop":          "Dach / Dachaufsicht",
    "pool_outdoor":     "Außenpool",
    // --- Sonstige ---
    "unknown":          "Sonstiges",
};

export const ROOM_TAXONOMY_GROUPS = [
    {
        id: "interior",
        label: "Innenräume",
        options: [
            "living_room",
            "living_kitchen",
            "studio",
            "kitchen",
            "dining_room",
            "bedroom",
            "children_room",
            "guest_room",
            "bathroom",
            "wc",
            "office",
            "fitness_room",
            "hallway",
            "corridor",
            "stairs",
            "storage",
            "pantry",
            "utility_room",
            "laundry_room",
            "closet",
            "walk_in_closet",
            "basement",
            "attic",
            "conservatory",
            "pool_room",
            "sauna",
            "wine_cellar",
            "home_cinema",
            "library",
            "play_room",
            "music_room",
        ],
    },
    {
        id: "exterior",
        label: "Außenbereiche",
        options: [
            "balcony",
            "terrace",
            "roof_terrace",
            "courtyard",
            "garden",
            "driveway",
            "garage",
            "carport",
            "outbuilding",
            "exterior",
            "exterior_front",
            "exterior_rear",
            "exterior_facade",
            "exterior_full",
            "street",
            "rooftop",
            "pool_outdoor",
        ],
    },
    {
        id: "other",
        label: "Sonstige",
        options: ["unknown"],
    },
] as const;

export const ROOM_TAXONOMY_OPTIONS = ROOM_TAXONOMY_GROUPS.flatMap((group) =>
    group.options.map((id) => ({
        id,
        label: ROOM_TRANSLATIONS[id] ?? id,
        groupId: group.id,
        groupLabel: group.label,
    })),
);

export function normalizeRoomTaxonomyLabel(value: string | null | undefined): string | null {
    const normalized = value?.trim().toLowerCase();
    if (!normalized) return null;

    const match = ROOM_TAXONOMY_OPTIONS.find((option) =>
        option.id.toLowerCase() === normalized || option.label.toLowerCase() === normalized
    );

    return match?.label ?? null;
}

/** Gibt den deutschen Anzeigenamen für einen englischen room-key zurück */
export const getGermanRoomName = (englishKey: string | null | undefined): string => {
    if (!englishKey) return "Unbekannter Raum";
    const normalized = englishKey.trim().toLowerCase();
    const keyLike = normalized
        .replace(/[./]+/g, " ")
        .replace(/[-\s]+/g, "_");

    const aliases: Record<string, string> = {
        living: "Wohnzimmer",
        living_room: "Wohnzimmer",
        living_kitchen: "Wohnküche",
        open_kitchen: "Wohnküche",
        kitchen_living: "Wohnküche",
        bathroom: "Badezimmer",
        bath: "Badezimmer",
        guest_wc: "WC",
        wc: "WC",
        toilet: "WC",
        toilette: "WC",
        kitchen: "Küche",
        hallway: "Flur",
        hall: "Flur",
        corridor: "Flur",
        bedroom: "Schlafzimmer",
        balcony: "Balkon",
        loggia: "Balkon",
        terrace: "Terrasse",
        exterior: "Außenansicht",
        outside: "Außenansicht",
        facade: "Außenansicht",
        front: "Vorderansicht",
        exterior_front: "Vorderansicht",
        front_view: "Vorderansicht",
        rear: "Rückansicht",
        back: "Rückansicht",
        exterior_rear: "Rückansicht",
        rear_view: "Rückansicht",
        garden: "Garten",
        stairs: "Treppenhaus",
        stairway: "Treppenhaus",
        unknown: "Sonstiges",
    };

    return ROOM_TRANSLATIONS[englishKey]
        ?? ROOM_TRANSLATIONS[normalized]
        ?? ROOM_TRANSLATIONS[keyLike]
        ?? aliases[keyLike]
        ?? aliases[normalized]
        ?? englishKey;
};

/** Gibt den englischen room-key für einen deutschen Namen zurück (für Pipeline) */
export const getEnglishRoomKey = (germanName: string | null | undefined): string | null => {
    if (!germanName) return null;
    const entry = Object.entries(ROOM_TRANSLATIONS).find(([, de]) => de === germanName);
    return entry?.[0] ?? null;
};
