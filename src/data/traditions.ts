import {
    Dhikr,
    morningAdhkar,
    eveningAdhkar,
    afterPrayerAdhkar,
    generalDhikr,
} from "./dhikr";
import { externalGeneralAdhkar } from "./generalAdhkarSelection";
import { SEEN_MORNING_ADHKAR, SEEN_EVENING_ADHKAR } from "./seenArabicDb";

export type GoalTier = "essential" | "standard" | "complete";

export interface TraditionWindowConfig {
    morning: string;
    evening: string;
    night: string;
}

export interface TraditionLitany {
    id: string;
    title: string;
    source: string;
    bookId?: string;
    sectionId?: string;
    sectionTitle?: string;
    category: Dhikr["category"];
    tier: GoalTier;
    defaultEnabled: boolean;
    items: Dhikr[];
}

export interface TraditionSection {
    id: string;
    title: string;
    bookId: string;
    bookTitle: string;
    category: Dhikr["category"];
}

export interface TraditionBook {
    id: string;
    title: string;
    sections: TraditionSection[];
}

export interface TraditionDefinition {
    id: string;
    title: string;
    cardLabel: string;
    region: string;
    description: string;
    primarySource: string;
    books: string[];
    notificationWindows: TraditionWindowConfig;
    litanies: TraditionLitany[];
}

const GOAL_RANK: Record<GoalTier, number> = {
    essential: 1,
    standard: 2,
    complete: 3,
};

function withNamespacedIds(
    traditionId: string,
    litanyId: string,
    items: Dhikr[],
): Dhikr[] {
    return items.map((item) => ({
        ...item,
        id: `${traditionId}:${litanyId}:${item.id}`,
    }));
}

function buildSampleItem(
    traditionId: string,
    litanyId: string,
    itemId: string,
    category: Dhikr["category"],
    arabic: string,
    transliteration: string,
    translation: string,
    source: string,
    targetCount: number,
): Dhikr {
    return {
        id: `${traditionId}:${litanyId}:${itemId}`,
        arabic,
        transliteration,
        translation,
        source,
        category,
        targetCount,
    };
}

export const TRADITIONS: TraditionDefinition[] = [
    {
        id: "global_hisn",
        title: "Global Standard Path",
        cardLabel: "The Global Path",
        region: "Global",
        description:
            "Core daily adhkar from Hisn al-Muslim with balanced daily coverage.",
        primarySource: "Hisn al-Muslim (Fortress of the Muslim)",
        books: ["Hisn al-Muslim"],
        notificationWindows: {
            morning: "05:30",
            evening: "17:30",
            night: "21:00",
        },
        litanies: [
            {
                id: "hisn_morning",
                title: "Morning Essentials",
                source: "Hisn al-Muslim",
                category: "morning",
                tier: "essential",
                defaultEnabled: true,
                items: withNamespacedIds(
                    "global_hisn",
                    "hisn_morning",
                    morningAdhkar.slice(0, 3),
                ),
            },
            {
                id: "hisn_morning_extended",
                title: "Morning Extended",
                source: "Hisn al-Muslim",
                category: "morning",
                tier: "standard",
                defaultEnabled: true,
                items: withNamespacedIds(
                    "global_hisn",
                    "hisn_morning_extended",
                    morningAdhkar.slice(3),
                ),
            },
            {
                id: "hisn_morning_seen",
                title: "Morning Adhkar — Full Collection",
                source: "Seen-Arabic DB (Hisn al-Muslim)",
                bookId: "hisn_al_muslim",
                sectionId: "hisn_morning_seen",
                sectionTitle: "Morning Adhkar (Full Collection)",
                category: "morning",
                tier: "complete",
                defaultEnabled: false,
                items: withNamespacedIds(
                    "global_hisn",
                    "hisn_morning_seen",
                    SEEN_MORNING_ADHKAR,
                ),
            },
            {
                id: "hisn_evening",
                title: "Evening Essentials",
                source: "Hisn al-Muslim",
                category: "evening",
                tier: "essential",
                defaultEnabled: true,
                items: withNamespacedIds(
                    "global_hisn",
                    "hisn_evening",
                    eveningAdhkar.slice(0, 2),
                ),
            },
            {
                id: "hisn_evening_extended",
                title: "Evening Extended",
                source: "Hisn al-Muslim",
                category: "evening",
                tier: "standard",
                defaultEnabled: true,
                items: withNamespacedIds(
                    "global_hisn",
                    "hisn_evening_extended",
                    eveningAdhkar.slice(2),
                ),
            },
            {
                id: "hisn_evening_seen",
                title: "Evening Adhkar — Full Collection",
                source: "Seen-Arabic DB (Hisn al-Muslim)",
                bookId: "hisn_al_muslim",
                sectionId: "hisn_evening_seen",
                sectionTitle: "Evening Adhkar (Full Collection)",
                category: "evening",
                tier: "complete",
                defaultEnabled: false,
                items: withNamespacedIds(
                    "global_hisn",
                    "hisn_evening_seen",
                    SEEN_EVENING_ADHKAR,
                ),
            },
            {
                id: "hisn_after_prayer",
                title: "After Prayer Cycle",
                source: "Hisn al-Muslim",
                category: "after-prayer",
                tier: "standard",
                defaultEnabled: true,
                items: withNamespacedIds(
                    "global_hisn",
                    "hisn_after_prayer",
                    afterPrayerAdhkar,
                ),
            },
            {
                id: "hisn_general",
                title: "General Daily Dhikr",
                source: "Hisn al-Muslim + External General DB",
                bookId: "general_mixed",
                sectionId: "general_core_and_external",
                sectionTitle: "General Adhkar Selection",
                category: "general",
                tier: "complete",
                defaultEnabled: false,
                items: withNamespacedIds("global_hisn", "hisn_general", [
                    ...generalDhikr,
                    ...externalGeneralAdhkar,
                ]),
            },
        ],
    },
    {
        id: "classical_nawawi",
        title: "The Classical Path",
        cardLabel: "The Classical Path",
        region: "Sham / Classical",
        description: "Selections inspired by Imam al-Nawawi's Al-Adhkar.",
        primarySource: "Al-Adhkar (Imam al-Nawawi)",
        books: ["Al-Adhkar"],
        notificationWindows: {
            morning: "05:20",
            evening: "17:20",
            night: "21:10",
        },
        litanies: [
            {
                id: "nawawi_morning",
                title: "Nawawi Morning",
                source: "Al-Adhkar",
                category: "morning",
                tier: "essential",
                defaultEnabled: true,
                items: [
                    buildSampleItem(
                        "classical_nawawi",
                        "nawawi_morning",
                        "n1",
                        "morning",
                        "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ",
                        "Allahumma inni as'aluka al-'afwa wa al-'afiyah",
                        "O Allah, I ask You for pardon and well-being.",
                        "Al-Adhkar",
                        3,
                    ),
                ],
            },
            {
                id: "nawawi_evening",
                title: "Nawawi Evening",
                source: "Al-Adhkar",
                category: "evening",
                tier: "standard",
                defaultEnabled: true,
                items: [
                    buildSampleItem(
                        "classical_nawawi",
                        "nawawi_evening",
                        "n2",
                        "evening",
                        "اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ",
                        "Allahumma anta as-salam wa minka as-salam",
                        "O Allah, You are Peace and from You is peace.",
                        "Al-Adhkar",
                        1,
                    ),
                ],
            },
        ],
    },
    {
        id: "tarimi_baalawi",
        title: "The Yemeni (Tarimi) Path",
        cardLabel: "The Yemeni Path",
        region: "Tarim, Yemen",
        description:
            "Focused Wird flow from Ba 'Alawi scholarship and practice.",
        primarySource: "Khulasat al-Madad al-Nabawi",
        books: ["Khulasat al-Madad al-Nabawi", "Wird al-Latif"],
        notificationWindows: {
            morning: "04:50",
            evening: "17:40",
            night: "21:30",
        },
        litanies: [
            {
                id: "wird_al_latif",
                title: "Wird al-Latif",
                source: "Imam al-Haddad",
                category: "morning",
                tier: "essential",
                defaultEnabled: true,
                items: [
                    buildSampleItem(
                        "tarimi_baalawi",
                        "wird_al_latif",
                        "t1",
                        "morning",
                        "يَا رَبِّ بِالْمُصْطَفَى بَلِّغْ مَقَاصِدَنَا",
                        "Ya Rabb bil-Mustafa balligh maqasidana",
                        "O Lord, by the Chosen One, let us reach our aims.",
                        "Wird al-Latif",
                        3,
                    ),
                ],
            },
            {
                id: "ratib_haddad",
                title: "Ratib al-Haddad",
                source: "Imam al-Haddad",
                category: "evening",
                tier: "standard",
                defaultEnabled: true,
                items: [
                    buildSampleItem(
                        "tarimi_baalawi",
                        "ratib_haddad",
                        "t2",
                        "evening",
                        "لَا إِلَهَ إِلَّا اللَّهُ",
                        "La ilaha illa Allah",
                        "There is no god but Allah.",
                        "Ratib al-Haddad",
                        33,
                    ),
                ],
            },
            {
                id: "khulasat_madad",
                title: "Khulasat al-Madad Selection",
                source: "Habib Umar bin Hafiz",
                category: "general",
                tier: "complete",
                defaultEnabled: false,
                items: [
                    buildSampleItem(
                        "tarimi_baalawi",
                        "khulasat_madad",
                        "t3",
                        "general",
                        "اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ",
                        "Allahumma salli 'ala Sayyidina Muhammad",
                        "O Allah, send blessings upon our master Muhammad.",
                        "Khulasat al-Madad al-Nabawi",
                        100,
                    ),
                ],
            },
        ],
    },
    {
        id: "maghribi_shadhili",
        title: "The Maghribi Path",
        cardLabel: "The Devotional Path",
        region: "North Africa",
        description: "Shadhili devotional litanies from Maghribi transmission.",
        primarySource: "Dala'il al-Khayrat",
        books: ["Dala'il al-Khayrat", "Hizb al-Bahr"],
        notificationWindows: {
            morning: "05:35",
            evening: "18:00",
            night: "21:15",
        },
        litanies: [
            {
                id: "dalail_daily",
                title: "Dala'il Daily Portion",
                source: "Dala'il al-Khayrat",
                category: "morning",
                tier: "essential",
                defaultEnabled: true,
                items: [
                    buildSampleItem(
                        "maghribi_shadhili",
                        "dalail_daily",
                        "m1",
                        "morning",
                        "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ",
                        "Allahumma salli 'ala Muhammad wa ala ali Muhammad",
                        "O Allah, send blessings upon Muhammad and his family.",
                        "Dala'il al-Khayrat",
                        11,
                    ),
                ],
            },
            {
                id: "hizb_bahr",
                title: "Hizb al-Bahr",
                source: "Imam Abu al-Hasan al-Shadhili",
                category: "evening",
                tier: "standard",
                defaultEnabled: true,
                items: [
                    buildSampleItem(
                        "maghribi_shadhili",
                        "hizb_bahr",
                        "m2",
                        "evening",
                        "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
                        "Hasbuna Allahu wa ni'ma al-wakil",
                        "Allah is sufficient for us and the best disposer of affairs.",
                        "Hizb al-Bahr",
                        7,
                    ),
                ],
            },
        ],
    },
    {
        id: "ottoman_ahzab",
        title: "The Ottoman Path",
        cardLabel: "The Ottoman Path",
        region: "Anatolia / Ottoman",
        description:
            "Selections from Majmu'at al-Ahzab in Ottoman-Turkish practice.",
        primarySource: "Majmu'at al-Ahzab (Gumushanevi)",
        books: ["Majmu'at al-Ahzab"],
        notificationWindows: {
            morning: "05:10",
            evening: "17:25",
            night: "21:20",
        },
        litanies: [
            {
                id: "ahzab_morning",
                title: "Majmu'at Morning Hizb",
                source: "Gumushanevi",
                category: "morning",
                tier: "essential",
                defaultEnabled: true,
                items: [
                    buildSampleItem(
                        "ottoman_ahzab",
                        "ahzab_morning",
                        "o1",
                        "morning",
                        "سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ",
                        "Subhan Allah wa al-hamdu lillah",
                        "Glory be to Allah and praise be to Allah.",
                        "Majmu'at al-Ahzab",
                        33,
                    ),
                ],
            },
            {
                id: "ahzab_evening",
                title: "Majmu'at Evening Hizb",
                source: "Gumushanevi",
                category: "evening",
                tier: "standard",
                defaultEnabled: true,
                items: [
                    buildSampleItem(
                        "ottoman_ahzab",
                        "ahzab_evening",
                        "o2",
                        "evening",
                        "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
                        "La hawla wa la quwwata illa billah",
                        "There is no power and no strength except through Allah.",
                        "Majmu'at al-Ahzab",
                        100,
                    ),
                ],
            },
        ],
    },
];

export function getTraditionById(traditionId: string): TraditionDefinition {
    return (
        TRADITIONS.find((tradition) => tradition.id === traditionId) ??
        TRADITIONS[0]
    );
}

export function getActiveLitanies(
    traditionId: string,
    goalTier: GoalTier,
    litanyToggles: Record<string, boolean>,
    selectedSectionIds?: string[],
): TraditionLitany[] {
    const tradition = getTraditionById(traditionId);
    const goalRank = GOAL_RANK[goalTier];
    const selected = new Set(selectedSectionIds || []);

    return tradition.litanies.filter((litany) => {
        if (GOAL_RANK[litany.tier] > goalRank) {
            return false;
        }
        const toggled = litanyToggles[litany.id];
        const enabled = toggled === undefined ? litany.defaultEnabled : toggled;
        if (!enabled) return false;

        if (selected.size === 0) {
            return true;
        }

        const sectionId = litany.sectionId || litany.id;
        return selected.has(sectionId);
    });
}

export function getAllLitaniesForTradition(
    traditionId: string,
): TraditionLitany[] {
    return getTraditionById(traditionId).litanies;
}

function toSlug(value: string): string {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
}

export function getBookCatalogForTradition(
    traditionId: string,
): TraditionBook[] {
    const tradition = getTraditionById(traditionId);
    const map = new Map<string, TraditionBook>();

    for (const litany of tradition.litanies) {
        const bookTitle = litany.source;
        const bookId = litany.bookId || toSlug(bookTitle || "book");
        const section: TraditionSection = {
            id: litany.sectionId || litany.id,
            title: litany.sectionTitle || litany.title,
            bookId,
            bookTitle,
            category: litany.category,
        };

        const existing = map.get(bookId);
        if (existing) {
            existing.sections.push(section);
        } else {
            map.set(bookId, {
                id: bookId,
                title: bookTitle,
                sections: [section],
            });
        }
    }

    return Array.from(map.values());
}

export function getSectionIdsForTradition(traditionId: string): string[] {
    return getAllLitaniesForTradition(traditionId).map(
        (litany) => litany.sectionId || litany.id,
    );
}
