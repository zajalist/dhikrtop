import type { DhikrCategory } from "../data/dhikr";

// ── Custom Wird Types ─────────────────────────────────────────────────────────

export interface WirdItem {
    /** Unique ID within the wird (uuid-style) */
    id: string;
    /** Points to a BookAdhkarItem.id or "custom_*" */
    sourceId: string;
    /** Overrides the source targetCount if set */
    overrideCount?: number;
    /** Enabled by default */
    enabled: boolean;
    /** Optional user notes */
    notes?: string;
}

export interface WirdNotificationSettings {
    enabled: boolean;
    intervalMinutes: number;
    startTime: string;
    endTime: string;
}

export interface Wird {
    id: string;
    name: string;
    description?: string;
    /** Which daily sessions this wird is active for */
    sessions: DhikrCategory[];
    items: WirdItem[];
    createdAt: number;
    updatedAt: number;
    /** If true, this wird replaces (rather than appends to) tradition items */
    replacesTradition: boolean;
    /** Optional per-wird notification preferences */
    notifications?: WirdNotificationSettings;
}

export function createWird(
    name: string,
    sessions: DhikrCategory[] = ["morning"],
): Wird {
    return {
        id: `wird_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        name,
        sessions,
        items: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        replacesTradition: false,
        notifications: {
            enabled: false,
            intervalMinutes: 60,
            startTime: "06:00",
            endTime: "21:00",
        },
    };
}

export function createWirdItem(
    sourceId: string,
    overrideCount?: number,
): WirdItem {
    return {
        id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        sourceId,
        overrideCount,
        enabled: true,
    };
}
