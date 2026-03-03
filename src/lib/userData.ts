import {
    GoalTier,
    getAllLitaniesForTradition,
    getActiveLitanies,
    getSectionIdsForTradition,
    getTraditionById,
    TRADITIONS,
    TraditionLitany,
    TraditionWindowConfig,
} from "../data/traditions";
import {
    Dhikr,
    DhikrCategory,
    morningAdhkar,
    eveningAdhkar,
    afterPrayerAdhkar,
    generalDhikr,
} from "../data/dhikr";
import type { Wird } from "./wirdTypes";
import { getAllBookItems } from "../data/books";

export const USER_DATA_KEY = "dhikr_user_data";

export interface DhikrUserData {
    version: 4;
    id?: string;
    userId?: string;
    name: string;
    language: string;
    showTransliteration: boolean;
    showTranslation: boolean;
    fontSize: "small" | "medium" | "large";
    traditionId: string;
    goalTier: GoalTier;
    litanyToggles: Record<string, boolean>;
    selectedSectionsByTradition: Record<string, string[]>;
    reminderTriggers: string[];
    reminderWindows: TraditionWindowConfig;
    customWirds: Wird[];
    activeWirdIdBySession: Record<DhikrCategory, string | null>;
    /** Pinned source for daily goals/progress and default Dhikr session source */
    dhikrMode: "basic" | "custom";
    /** Pinned wird id when dhikrMode === "custom" */
    pinnedWirdId: string | null;
}

function buildDefaultToggles(traditionId: string): Record<string, boolean> {
    const tradition = getTraditionById(traditionId);
    return tradition.litanies.reduce<Record<string, boolean>>((acc, litany) => {
        acc[litany.id] = litany.defaultEnabled;
        return acc;
    }, {});
}

function buildDefaults(): DhikrUserData {
    const tradition = TRADITIONS[0];
    return {
        version: 4,
        name: "",
        language: "en",
        showTransliteration: true,
        showTranslation: true,
        fontSize: "medium",
        traditionId: tradition.id,
        goalTier: "standard",
        litanyToggles: buildDefaultToggles(tradition.id),
        selectedSectionsByTradition: {
            [tradition.id]: getSectionIdsForTradition(tradition.id),
        },
        reminderTriggers: ["prayer-based", "morning", "evening"],
        reminderWindows: tradition.notificationWindows,
        customWirds: [],
        dhikrMode: "basic",
        pinnedWirdId: null,
        activeWirdIdBySession: {
            morning: null,
            evening: null,
            "after-prayer": null,
            general: null,
        },
    };
}

export const DEFAULT_USER_DATA = buildDefaults();

export function loadUserData(): DhikrUserData {
    const defaults = buildDefaults();

    try {
        const raw = localStorage.getItem(USER_DATA_KEY);
        if (!raw) return defaults;

        const parsed = JSON.parse(raw);
        const tradition = getTraditionById(
            parsed.traditionId || defaults.traditionId,
        );

        return {
            ...defaults,
            ...parsed,
            version: 4,
            traditionId: tradition.id,
            goalTier: parsed.goalTier || defaults.goalTier,
            litanyToggles: {
                ...buildDefaultToggles(tradition.id),
                ...(parsed.litanyToggles || {}),
            },
            selectedSectionsByTradition: {
                [tradition.id]: getSectionIdsForTradition(tradition.id),
                ...(parsed.selectedSectionsByTradition || {}),
            },
            reminderWindows: {
                ...tradition.notificationWindows,
                ...(parsed.reminderWindows || {}),
            },
            customWirds: parsed.customWirds || [],
            dhikrMode: parsed.dhikrMode ?? "basic",
            pinnedWirdId: parsed.pinnedWirdId ?? null,
            activeWirdIdBySession: {
                ...defaults.activeWirdIdBySession,
                ...(parsed.activeWirdIdBySession || {}),
            },
        };
    } catch {
        return defaults;
    }
}

export function saveUserData(nextData: Partial<DhikrUserData>) {
    const current = loadUserData();
    const nextTraditionId = nextData.traditionId || current.traditionId;
    const traditionChanged = nextTraditionId !== current.traditionId;

    const baseToggles = traditionChanged
        ? buildDefaultToggles(nextTraditionId)
        : current.litanyToggles;

    const baseSections = traditionChanged
        ? {
              ...current.selectedSectionsByTradition,
              [nextTraditionId]: getSectionIdsForTradition(nextTraditionId),
          }
        : current.selectedSectionsByTradition;

    const merged: DhikrUserData = {
        ...current,
        ...nextData,
        traditionId: nextTraditionId,
        version: 4,
        litanyToggles: {
            ...baseToggles,
            ...(nextData.litanyToggles || {}),
        },
        selectedSectionsByTradition: {
            ...baseSections,
            ...(nextData.selectedSectionsByTradition || {}),
        },
        reminderWindows: {
            ...(traditionChanged
                ? getTraditionById(nextTraditionId).notificationWindows
                : current.reminderWindows),
            ...(nextData.reminderWindows || {}),
        },
        customWirds: nextData.customWirds ?? current.customWirds,
        dhikrMode: nextData.dhikrMode ?? current.dhikrMode,
        pinnedWirdId: nextData.pinnedWirdId ?? current.pinnedWirdId,
        activeWirdIdBySession: {
            ...current.activeWirdIdBySession,
            ...(nextData.activeWirdIdBySession || {}),
        },
    };

    localStorage.setItem(USER_DATA_KEY, JSON.stringify(merged));
    return merged;
}

/** Basic (built-in) adhkar — always Hisn al-Muslim curated set, no tradition needed */
const BASIC_ADHKAR: Record<DhikrCategory, Dhikr[]> = {
    morning: morningAdhkar,
    evening: eveningAdhkar,
    "after-prayer": afterPrayerAdhkar,
    general: generalDhikr,
};

export function getBasicDhikrForSession(category: DhikrCategory): Dhikr[] {
    return BASIC_ADHKAR[category] ?? [];
}

export function getActiveDhikrItems(userData: DhikrUserData): Dhikr[] {
    const all = [
        ...getSessionItems(userData, "morning"),
        ...getSessionItems(userData, "evening"),
        ...getSessionItems(userData, "after-prayer"),
        ...getSessionItems(userData, "general"),
    ];
    // Deduplicate by id in case custom append mode reuses existing IDs.
    const byId = new Map<string, Dhikr>();
    for (const item of all) {
        byId.set(item.id, item);
    }
    return Array.from(byId.values());
}

export function getActiveLitaniesForUser(
    userData: DhikrUserData,
): TraditionLitany[] {
    const selectedSections =
        userData.selectedSectionsByTradition[userData.traditionId] ||
        getAllLitaniesForTradition(userData.traditionId).map(
            (litany) => litany.sectionId || litany.id,
        );

    return getActiveLitanies(
        userData.traditionId,
        userData.goalTier,
        userData.litanyToggles,
        selectedSections,
    );
}

/** Resolve full Dhikr items from a custom Wird definition using the book registry. */
export function resolveWirdItems(wird: Wird): Dhikr[] {
    const allItems = getAllBookItems();
    const byId = new Map(allItems.map((item) => [item.id, item]));
    const validCategories = new Set<string>([
        "morning",
        "evening",
        "after-prayer",
        "general",
    ]);

    return wird.items
        .filter((wi) => wi.enabled)
        .map((wi): Dhikr | null => {
            const source = byId.get(wi.sourceId);
            if (!source) return null;
            const rawCat = source.category as string;
            const cat: DhikrCategory = validCategories.has(rawCat)
                ? (rawCat as DhikrCategory)
                : "general";
            return {
                id: `wird:${wird.id}:${wi.id}`,
                arabic: source.arabic,
                transliteration: source.transliteration,
                translation: source.translation,
                benefit: source.benefit,
                targetCount: wi.overrideCount ?? source.targetCount,
                source: source.source,
                category: cat,
            };
        })
        .filter((item): item is Dhikr => item !== null);
}

/** Returns active Dhikr for a given session category, respecting pinned source mode. */
export function getSessionItems(
    userData: DhikrUserData,
    category: DhikrCategory,
): Dhikr[] {
    if (userData.dhikrMode === "basic") {
        return getBasicDhikrForSession(category);
    }

    const activeWirdId =
        userData.pinnedWirdId ||
        userData.activeWirdIdBySession[category] ||
        userData.customWirds[0]?.id ||
        null;
    if (activeWirdId) {
        const wird = userData.customWirds.find((w) => w.id === activeWirdId);
        if (wird) {
            const items = resolveWirdItems(wird).filter(
                (item) => item.category === category,
            );
            // In pinned wird mode, session content should come from the selected wird only.
            if (items.length > 0) return items;
        }
    }

    // custom mode but no pinned/valid items for this category -> graceful fallback
    return getBasicDhikrForSession(category);
}
