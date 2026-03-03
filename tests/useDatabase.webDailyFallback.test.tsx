import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { invoke } from "@tauri-apps/api/core";

import { useDatabase } from "@/lib/useDatabase";

vi.mock("@tauri-apps/api/core", () => ({
    invoke: vi.fn(),
}));

describe("useDatabase web daily-adhkar fallback", () => {
    const mockInvoke = vi.mocked(invoke);

    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it("persists incremented daily dhikr counts in localStorage outside Tauri", async () => {
        const { result, unmount } = renderHook(() => useDatabase());

        await act(async () => {
            await result.current.incrementDailyAdhkar(
                "user-1",
                "2026-03-03",
                "morning-1",
                33,
                1,
            );
            await result.current.incrementDailyAdhkar(
                "user-1",
                "2026-03-03",
                "morning-1",
                33,
                1,
            );
        });

        let rows: any[] = [];
        await act(async () => {
            rows = await result.current.getDailyAdhkarProgress(
                "user-1",
                "2026-03-03",
            );
        });

        expect(rows).toHaveLength(1);
        expect(rows[0].adhkarId).toBe("morning-1");
        expect(rows[0].count).toBe(2);

        unmount();

        const { result: remounted } = renderHook(() => useDatabase());
        let restoredRows: any[] = [];
        await act(async () => {
            restoredRows = await remounted.current.getDailyAdhkarProgress(
                "user-1",
                "2026-03-03",
            );
        });

        expect(restoredRows).toHaveLength(1);
        expect(restoredRows[0].count).toBe(2);
        expect(mockInvoke).not.toHaveBeenCalled();
    });

    it("bounds setDailyAdhkarCount between zero and target in fallback mode", async () => {
        const { result } = renderHook(() => useDatabase());

        await act(async () => {
            await result.current.setDailyAdhkarCount(
                "user-1",
                "2026-03-03",
                "morning-1",
                33,
                99,
            );
        });

        let rows: any[] = [];
        await act(async () => {
            rows = await result.current.getDailyAdhkarProgress(
                "user-1",
                "2026-03-03",
            );
        });

        expect(rows[0].count).toBe(33);
    });
});
