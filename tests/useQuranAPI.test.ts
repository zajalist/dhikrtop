/**
 * Quran API Hook Tests
 *
 * Test suite for useQuranAPI React hook
 *
 * Run with: npm run test
 *
 * Coverage:
 * - Fetching all Surahs
 * - Getting specific Surah with verses
 * - Getting single verse
 * - Caching functionality
 * - Offline support
 * - Error handling
 * - Search functionality
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useQuranAPI as useQuranAPIHook } from "@/lib/useQuranAPI";

function useQuranAPI() {
    return renderHook(() => useQuranAPIHook()).result.current;
}

// Mock fetch globally
global.fetch = vi.fn();

describe("useQuranAPI Hook", () => {
    const mockFetch = global.fetch as any;

    beforeEach(() => {
        vi.clearAllMocks();
        // Clear IndexedDB mocks
        global.indexedDB = {
            open: vi.fn(() => ({
                onsuccess: undefined,
                onerror: undefined,
                onupgradeneeded: undefined,
            })),
        } as any;
    });

    // ── Initialization Tests ────────────────────────────────────────────

    describe("Hook Initialization", () => {
        it("should initialize with correct state", () => {
            const quran = useQuranAPI();

            expect(quran.isLoading).toBe(false);
            expect(quran.error).toBeNull();
            expect(quran.totalSurahs).toBe(114);
        });

        it("should have all required methods", () => {
            const quran = useQuranAPI();

            expect(typeof quran.getAllSurahs).toBe("function");
            expect(typeof quran.getSurah).toBe("function");
            expect(typeof quran.getVerse).toBe("function");
            expect(typeof quran.searchVerses).toBe("function");
            expect(typeof quran.getEditions).toBe("function");
            expect(typeof quran.getLanguages).toBe("function");
            expect(typeof quran.clearCache).toBe("function");
            expect(typeof quran.getCacheInfo).toBe("function");
        });
    });

    // ── Get All Surahs Tests ────────────────────────────────────────────

    describe("getAllSurahs", () => {
        it("should fetch all 114 Surahs", async () => {
            const quran = useQuranAPI();
            const mockSurahs = [
                {
                    number: 1,
                    name: "Al-Fatiha",
                    englishName: "The Opening",
                    numberOfAyahs: 7,
                },
                {
                    number: 2,
                    name: "Al-Baqarah",
                    englishName: "The Cow",
                    numberOfAyahs: 286,
                },
            ];

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: mockSurahs }),
            });

            const surahs = await quran.getAllSurahs();

            expect(quran.isLoading).toBe(false);
            expect(quran.error).toBeNull();
            expect(surahs).toHaveLength(2);
            expect(surahs[0].number).toBe(1);
            expect(surahs[0].englishName).toBe("The Opening");
        });

        it("should cache surahs after first fetch", async () => {
            const quran = useQuranAPI();
            const mockSurahs = [
                { number: 1, name: "Al-Fatiha", numberOfAyahs: 7 },
            ];

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: mockSurahs }),
            });

            const first = await quran.getAllSurahs();
            const second = await quran.getAllSurahs();

            // Should only fetch once (second call uses cache)
            expect(mockFetch).toHaveBeenCalledTimes(1);
            expect(first).toEqual(second);
        });

        it("should set error on fetch failure", async () => {
            const quran = useQuranAPI();

            mockFetch.mockRejectedValueOnce(new Error("Network error"));

            await expect(quran.getAllSurahs()).rejects.toThrow();
            expect(quran.error).not.toBeNull();
            expect(quran.error?.code).toBe("FETCH_ERROR");
        });

        it("should handle non-ok response", async () => {
            const quran = useQuranAPI();

            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
            });

            await expect(quran.getAllSurahs()).rejects.toThrow();
            expect(quran.error).not.toBeNull();
        });
    });

    // ── Get Surah Tests ────────────────────────────────────────────────

    describe("getSurah", () => {
        it("should fetch specific Surah with verses", async () => {
            const quran = useQuranAPI();
            const mockSurah = {
                number: 1,
                name: "Al-Fatiha",
                englishName: "The Opening",
                numberOfAyahs: 7,
                ayahs: [
                    { number: 1, text: "الحمد لله", numberInSurah: 1 },
                    { number: 2, text: "رب العالمين", numberInSurah: 2 },
                ],
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: mockSurah }),
            });

            const surah = await quran.getSurah(1);

            expect(surah.number).toBe(1);
            expect(surah.ayahs).toHaveLength(2);
            expect(surah.ayahs[0].text).toBe("الحمد لله");
        });

        it("should cache Surah after first fetch", async () => {
            const quran = useQuranAPI();
            const mockSurah = {
                number: 1,
                name: "Al-Fatiha",
                ayahs: [{ number: 1, text: "Text" }],
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: mockSurah }),
            });

            const first = await quran.getSurah(1);
            const second = await quran.getSurah(1);

            // Should only fetch once
            expect(mockFetch).toHaveBeenCalledTimes(1);
            expect(first).toEqual(second);
        });

        it("should support different editions", async () => {
            const quran = useQuranAPI();
            const mockSurah = {
                number: 1,
                ayahs: [{ number: 1, text: "Text" }],
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: mockSurah }),
            });

            await quran.getSurah(1, "en.asad");

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining("/surah/1/en.asad"),
            );
        });

        it("should handle invalid surah number", async () => {
            const quran = useQuranAPI();

            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
            });

            await expect(quran.getSurah(999)).rejects.toThrow();
            expect(quran.error?.code).toBe("SURAH_FETCH_ERROR");
        });
    });

    // ── Get Verse Tests ────────────────────────────────────────────────

    describe("getVerse", () => {
        it("should get single verse", async () => {
            const quran = useQuranAPI();
            const mockSurah = {
                number: 1,
                ayahs: [
                    { number: 1, text: "الحمد لله", numberInSurah: 1 },
                    { number: 2, text: "رب العالمين", numberInSurah: 2 },
                ],
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: mockSurah }),
            });

            const verse = await quran.getVerse(1, 2);

            expect(verse.numberInSurah).toBe(2);
            expect(verse.text).toBe("رب العالمين");
        });

        it("should handle verse not found", async () => {
            const quran = useQuranAPI();
            const mockSurah = {
                number: 1,
                ayahs: [{ number: 1, text: "Text", numberInSurah: 1 }],
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: mockSurah }),
            });

            await expect(quran.getVerse(1, 999)).rejects.toThrow();
        });
    });

    // ── Search Tests ────────────────────────────────────────────────────

    describe("searchVerses", () => {
        it("should search verses in cached data", async () => {
            const quran = useQuranAPI();
            const mockSurahs = [
                {
                    number: 1,
                    ayahs: [
                        {
                            number: 1,
                            text: "Praise be to Allah",
                            translation: "Praise be to Allah",
                        },
                        {
                            number: 2,
                            text: "Lord of the worlds",
                            translation: "Lord of the worlds",
                        },
                    ],
                },
            ];

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: mockSurahs[0] }),
            });

            // Load Surah first
            await quran.getSurah(1);

            // Search
            const results = await quran.searchVerses("praise");

            expect(results.length).toBeGreaterThan(0);
            expect(results[0].text).toContain("Praise");
        });

        it("should search case-insensitively", async () => {
            const quran = useQuranAPI();
            const mockSurah = {
                number: 1,
                ayahs: [
                    { number: 1, text: "PRAISE BE", translation: "Praise be" },
                ],
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: mockSurah }),
            });

            await quran.getSurah(1);
            const results = await quran.searchVerses("praise");

            expect(results.length).toBeGreaterThan(0);
        });

        it("should return empty array if no matches", async () => {
            const quran = useQuranAPI();

            const results = await quran.searchVerses("xyz12345");

            expect(results).toEqual([]);
        });
    });

    // ── Editions Tests ────────────────────────────────────────────────

    describe("getEditions", () => {
        it("should fetch available editions", async () => {
            const quran = useQuranAPI();
            const mockEditions = [
                { identifier: "ar.alafasy", language: "ar", name: "Arabic" },
                { identifier: "en.asad", language: "en", name: "English" },
            ];

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: mockEditions }),
            });

            const editions = await quran.getEditions();

            expect(editions).toHaveLength(2);
            expect(editions[0].identifier).toBe("ar.alafasy");
        });

        it("should handle editions fetch error", async () => {
            const quran = useQuranAPI();

            mockFetch.mockRejectedValueOnce(new Error("Network error"));

            await expect(quran.getEditions()).rejects.toThrow();
            expect(quran.error?.code).toBe("EDITIONS_ERROR");
        });
    });

    // ── Languages Tests ────────────────────────────────────────────────

    describe("getLanguages", () => {
        it("should fetch available languages", async () => {
            const quran = useQuranAPI();
            const mockLanguages = [
                { iso_code: "ar", name: "Arabic" },
                { iso_code: "en", name: "English" },
            ];

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: mockLanguages }),
            });

            const languages = await quran.getLanguages();

            expect(languages).toHaveLength(2);
            expect(languages[0].iso_code).toBe("ar");
        });
    });

    // ── Cache Management Tests ──────────────────────────────────────────

    describe("Cache Management", () => {
        it("should clear cache", async () => {
            const quran = useQuranAPI();
            const mockSurah = {
                number: 1,
                ayahs: [{ number: 1, text: "Text" }],
            };

            // Load and cache
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: mockSurah }),
            });
            await quran.getSurah(1);

            // Clear cache
            await quran.clearCache();

            // Should fetch again
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: mockSurah }),
            });
            await quran.getSurah(1);

            // Should be called twice now
            expect(mockFetch).toHaveBeenCalledTimes(2);
        });

        it("should report cache info", async () => {
            const quran = useQuranAPI();
            const mockSurah = {
                number: 1,
                ayahs: [{ number: 1, text: "Text" }],
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: mockSurah }),
            });

            await quran.getSurah(1);

            const info = await quran.getCacheInfo();

            expect(info.size).toBeGreaterThan(0);
        });
    });

    // ── Error Handling Tests ────────────────────────────────────────────

    describe("Error Handling", () => {
        it("should clear error on successful operation", async () => {
            const quran = useQuranAPI();

            // First cause an error
            mockFetch.mockRejectedValueOnce(new Error("Network error"));
            await expect(quran.getAllSurahs()).rejects.toThrow();
            expect(quran.error).not.toBeNull();

            // Then succeed
            const mockSurahs = [
                { number: 1, name: "Al-Fatiha", numberOfAyahs: 7 },
            ];
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: mockSurahs }),
            });

            await quran.getAllSurahs();

            expect(quran.error).toBeNull();
        });

        it("should include error message in error object", async () => {
            const quran = useQuranAPI();

            mockFetch.mockRejectedValueOnce(new Error("Timeout"));

            try {
                await quran.getAllSurahs();
            } catch {
                expect(quran.error?.message).toContain("Timeout");
            }
        });
    });

    // ── Offline Support Tests ────────────────────────────────────────────

    describe("Offline Support", () => {
        it("should provide offline functionality via caching", async () => {
            const quran = useQuranAPI();
            const mockSurah = {
                number: 1,
                ayahs: [{ number: 1, text: "Text" }],
            };

            // First load: from network
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: mockSurah }),
            });
            const firstLoad = await quran.getSurah(1);
            expect(firstLoad.number).toBe(1);

            // Simulate network failure
            mockFetch.mockRejectedValueOnce(new Error("Network down"));

            // Second load: should still work from cache
            const secondLoad = await quran.getSurah(1);
            expect(secondLoad.number).toBe(1);

            // Only one network call
            expect(mockFetch).toHaveBeenCalledTimes(1);
        });
    });

    // ── Integration Tests ────────────────────────────────────────────────

    describe("Integration", () => {
        it("should handle complete Quran workflow", async () => {
            const quran = useQuranAPI();

            // Get all Surahs
            const mockAllSurahs = [
                { number: 1, name: "Al-Fatiha", numberOfAyahs: 7 },
            ];
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: mockAllSurahs }),
            });
            const surahs = await quran.getAllSurahs();
            expect(surahs).toHaveLength(1);

            // Get specific Surah
            const mockSurah = {
                number: 1,
                ayahs: [
                    { number: 1, text: "Text1", numberInSurah: 1 },
                    { number: 2, text: "Text2", numberInSurah: 2 },
                ],
            };
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: mockSurah }),
            });
            const surah = await quran.getSurah(1);
            expect(surah.ayahs).toHaveLength(2);

            // Get specific verse
            const verse = await quran.getVerse(1, 1);
            expect(verse.numberInSurah).toBe(1);

            // Should have cached everything
            const cacheInfo = await quran.getCacheInfo();
            expect(cacheInfo.size).toBeGreaterThan(0);
        });
    });
});
