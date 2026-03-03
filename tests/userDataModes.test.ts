import { describe, it, expect } from "vitest";
import { getSessionItems, type DhikrUserData } from "../src/lib/userData";
import { morningAdhkar } from "../src/data/dhikr";
import type { Wird } from "../src/lib/wirdTypes";

function baseUserData(overrides: Partial<DhikrUserData> = {}): DhikrUserData {
    return {
        version: 4,
        name: "",
        language: "en",
        showTransliteration: true,
        showTranslation: true,
        fontSize: "medium",
        traditionId: "global_hisn",
        goalTier: "standard",
        litanyToggles: {},
        selectedSectionsByTradition: {},
        reminderTriggers: ["morning"],
        reminderWindows: { morning: "06:00", evening: "17:00", night: "22:00" },
        customWirds: [],
        activeWirdIdBySession: {
            morning: null,
            evening: null,
            "after-prayer": null,
            general: null,
        },
        dhikrMode: "basic",
        pinnedWirdId: null,
        ...overrides,
    };
}

describe("userData mode switching", () => {
    it("returns built-in morning adhkar when mode is basic", () => {
        const data = baseUserData({ dhikrMode: "basic" });
        const items = getSessionItems(data, "morning");
        expect(items.length).toBeGreaterThan(0);
        expect(items[0].id).toBe(morningAdhkar[0].id);
    });

    it("returns custom wird items in custom mode when replacesTradition is true", () => {
        const wird: Wird = {
            id: "wird_1",
            name: "My Test Wird",
            sessions: ["morning"],
            items: [
                {
                    id: "witem_1",
                    sourceId: "hisn_m01",
                    enabled: true,
                    overrideCount: 5,
                },
            ],
            createdAt: Date.now(),
            updatedAt: Date.now(),
            replacesTradition: true,
        };

        const data = baseUserData({
            dhikrMode: "custom",
            customWirds: [wird],
            activeWirdIdBySession: {
                morning: "wird_1",
                evening: null,
                "after-prayer": null,
                general: null,
            },
        });

        const items = getSessionItems(data, "morning");
        expect(items.length).toBeGreaterThan(0);
        expect(items[0].id.startsWith("wird:wird_1")).toBe(true);
        expect(items[0].targetCount).toBe(5);
    });
});
