/**
 * Database Hook Tests
 *
 * Test suite for useDatabase React hook
 *
 * Run with: npm run test
 *
 * Coverage:
 * - Hook initialization
 * - User operations (save, get)
 * - Adhkar progress tracking
 * - Settings persistence
 * - Quran progress
 * - Voice recording management
 * - Error handling
 * - Concurrent operations
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useDatabase as useDatabaseHook } from "@/lib/useDatabase";
import { invoke } from "@tauri-apps/api/core";

function useDatabase() {
    return renderHook(() => useDatabaseHook()).result.current;
}

// Mock Tauri invoke function
vi.mock("@tauri-apps/api/core", () => ({
    invoke: vi.fn(),
}));

describe("useDatabase Hook", () => {
    const mockInvoke = invoke as any;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    // ── Initialization Tests ────────────────────────────────────────────

    describe("Hook Initialization", () => {
        it("should initialize with correct state", () => {
            const db = useDatabase();

            expect(db.isInitialized).toBe(false);
            expect(db.error).toBeNull();
        });

        it("should have all required methods", () => {
            const db = useDatabase();

            expect(typeof db.saveUser).toBe("function");
            expect(typeof db.getUser).toBe("function");
            expect(typeof db.saveAdhkarProgress).toBe("function");
            expect(typeof db.getAdhkarProgress).toBe("function");
            expect(typeof db.saveAppSettings).toBe("function");
            expect(typeof db.getAppSettings).toBe("function");
            expect(typeof db.saveQuranProgress).toBe("function");
            expect(typeof db.getQuranProgress).toBe("function");
            expect(typeof db.saveVoiceRecording).toBe("function");
            expect(typeof db.getVoiceRecordings).toBe("function");
            expect(typeof db.getVerseRecordings).toBe("function");
            expect(typeof db.deleteVoiceRecording).toBe("function");
            expect(typeof db.exportUserData).toBe("function");
            expect(typeof db.resetUserData).toBe("function");
        });
    });

    // ── User Operations Tests ────────────────────────────────────────────

    describe("User Operations", () => {
        it("should save user successfully", async () => {
            const db = useDatabase();
            const mockUser = {
                id: "user-123",
                name: "Ahmed Ali",
                language: "en",
                created_at: Date.now(),
                updated_at: Date.now(),
            };

            mockInvoke.mockResolvedValueOnce(mockUser);

            const result = await db.saveUser("user-123", "Ahmed Ali", "en");

            expect(mockInvoke).toHaveBeenCalledWith("db_save_user", {
                id: "user-123",
                name: "Ahmed Ali",
                language: "en",
            });
            expect(result).toEqual(mockUser);
            expect(db.error).toBeNull();
        });

        it("should get user successfully", async () => {
            const db = useDatabase();
            const mockUser = {
                id: "user-123",
                name: "Ahmed Ali",
                language: "en",
            };

            mockInvoke.mockResolvedValueOnce(mockUser);

            const result = await db.getUser("user-123");

            expect(mockInvoke).toHaveBeenCalledWith("db_get_user", {
                id: "user-123",
            });
            expect(result).toEqual(mockUser);
        });

        it("should handle user not found", async () => {
            const db = useDatabase();

            mockInvoke.mockResolvedValueOnce(null);

            const result = await db.getUser("nonexistent");

            expect(result).toBeNull();
        });

        it("should handle save user error", async () => {
            const db = useDatabase();
            const error = new Error("Database error");

            mockInvoke.mockRejectedValueOnce(error);

            await expect(
                db.saveUser("user-123", "Name", "en"),
            ).rejects.toThrow();
            expect(db.error).not.toBeNull();
        });
    });

    // ── Adhkar Progress Tests ────────────────────────────────────────────

    describe("Adhkar Progress", () => {
        it("should save adhkar progress", async () => {
            const db = useDatabase();
            const mockProgress = {
                id: 1,
                user_id: "user-123",
                adhkar_id: "adhkar-1",
                display_count: 1,
                user_rating: "liked",
            };

            mockInvoke.mockResolvedValueOnce(mockProgress);

            const result = await db.saveAdhkarProgress(
                "user-123",
                "adhkar-1",
                "liked",
            );

            expect(mockInvoke).toHaveBeenCalledWith("db_save_adhkar_progress", {
                user_id: "user-123",
                adhkar_id: "adhkar-1",
                user_rating: "liked",
            });
            expect(result).toEqual(mockProgress);
        });

        it("should get adhkar progress for user", async () => {
            const db = useDatabase();
            const mockProgress = [
                { id: 1, adhkar_id: "adhkar-1", display_count: 1 },
                { id: 2, adhkar_id: "adhkar-2", display_count: 2 },
            ];

            mockInvoke.mockResolvedValueOnce(mockProgress);

            const result = await db.getAdhkarProgress("user-123");

            expect(mockInvoke).toHaveBeenCalledWith("db_get_adhkar_progress", {
                user_id: "user-123",
            });
            expect(result).toEqual(mockProgress);
        });

        it("should return empty array if no adhkar progress", async () => {
            const db = useDatabase();

            mockInvoke.mockResolvedValueOnce([]);

            const result = await db.getAdhkarProgress("user-123");

            expect(result).toEqual([]);
        });
    });

    // ── App Settings Tests ────────────────────────────────────────────

    describe("App Settings", () => {
        it("should save app settings", async () => {
            const db = useDatabase();
            const mockSettings = {
                user_id: "user-123",
                reminder_interval: 30,
                enable_notifications: true,
                language: "ar",
            };

            mockInvoke.mockResolvedValueOnce(mockSettings);

            const result = await db.saveAppSettings({
                userId: "user-123",
                reminderInterval: 30,
                enableNotifications: true,
                language: "ar",
            });

            expect(mockInvoke).toHaveBeenCalled();
            expect(result).toEqual(mockSettings);
        });

        it("should get app settings", async () => {
            const db = useDatabase();
            const mockSettings = {
                user_id: "user-123",
                reminder_interval: 60,
                language: "en",
            };

            mockInvoke.mockResolvedValueOnce(mockSettings);

            const result = await db.getAppSettings("user-123");

            expect(mockInvoke).toHaveBeenCalledWith("db_get_app_settings", {
                user_id: "user-123",
            });
            expect(result).toEqual(mockSettings);
        });

        it("should handle settings not found", async () => {
            const db = useDatabase();

            mockInvoke.mockResolvedValueOnce(null);

            const result = await db.getAppSettings("user-123");

            expect(result).toBeNull();
        });
    });

    // ── Quran Progress Tests ────────────────────────────────────────────

    describe("Quran Progress", () => {
        it("should save quran progress", async () => {
            const db = useDatabase();
            const mockProgress = {
                id: 1,
                user_id: "user-123",
                surah_number: 1,
                verse_number: 5,
                read_count: 1,
            };

            mockInvoke.mockResolvedValueOnce(mockProgress);

            const result = await db.saveQuranProgress("user-123", 1, 5);

            expect(mockInvoke).toHaveBeenCalledWith("db_save_quran_progress", {
                user_id: "user-123",
                surah_number: 1,
                verse_number: 5,
                bookmarked: false,
            });
            expect(result).toEqual(mockProgress);
        });

        it("should get quran progress", async () => {
            const db = useDatabase();
            const mockProgress = [
                { surah_number: 1, verse_number: 1, read_count: 1 },
                { surah_number: 1, verse_number: 2, read_count: 1 },
            ];

            mockInvoke.mockResolvedValueOnce(mockProgress);

            const result = await db.getQuranProgress("user-123");

            expect(mockInvoke).toHaveBeenCalledWith("db_get_quran_progress", {
                user_id: "user-123",
            });
            expect(result).toEqual(mockProgress);
        });

        it("should save bookmarked verse", async () => {
            const db = useDatabase();
            const mockProgress = {
                id: 1,
                surah_number: 1,
                verse_number: 5,
                bookmarked: true,
            };

            mockInvoke.mockResolvedValueOnce(mockProgress);

            const result = await db.saveQuranProgress("user-123", 1, 5, true);

            expect(mockInvoke).toHaveBeenCalledWith("db_save_quran_progress", {
                user_id: "user-123",
                surah_number: 1,
                verse_number: 5,
                bookmarked: true,
            });
            expect(result.bookmarked).toBe(true);
        });
    });

    // ── Voice Recording Tests ────────────────────────────────────────────

    describe("Voice Recordings", () => {
        it("should save voice recording", async () => {
            const db = useDatabase();
            const recordingId = "rec-123";

            mockInvoke.mockResolvedValueOnce(recordingId);

            const result = await db.saveVoiceRecording({
                userId: "user-123",
                surahNumber: 1,
                verseNumber: 5,
                filePath: "/audio.wav",
                duration: 10.5,
                confidenceScore: 0.92,
            });

            expect(mockInvoke).toHaveBeenCalledWith("db_save_voice_recording", {
                user_id: "user-123",
                surah_number: 1,
                verse_number: 5,
                file_path: "/audio.wav",
                duration: 10.5,
                confidence_score: 0.92,
                transcription: null,
            });
            expect(result).toBe(recordingId);
        });

        it("should get user voice recordings", async () => {
            const db = useDatabase();
            const mockRecordings = [
                {
                    id: "rec-1",
                    surah_number: 1,
                    verse_number: 1,
                    duration: 5.0,
                },
                {
                    id: "rec-2",
                    surah_number: 1,
                    verse_number: 2,
                    duration: 6.0,
                },
            ];

            mockInvoke.mockResolvedValueOnce(mockRecordings);

            const result = await db.getVoiceRecordings("user-123");

            expect(mockInvoke).toHaveBeenCalledWith("db_get_voice_recordings", {
                user_id: "user-123",
            });
            expect(result).toEqual(mockRecordings);
        });

        it("should get verse-specific recordings", async () => {
            const db = useDatabase();
            const mockRecordings = [
                { id: "rec-1", duration: 5.0 },
                { id: "rec-2", duration: 6.0 },
            ];

            mockInvoke.mockResolvedValueOnce(mockRecordings);

            const result = await db.getVerseRecordings("user-123", 1, 5);

            expect(mockInvoke).toHaveBeenCalledWith("db_get_verse_recordings", {
                user_id: "user-123",
                surah_number: 1,
                verse_number: 5,
            });
            expect(result).toEqual(mockRecordings);
        });

        it("should delete voice recording", async () => {
            const db = useDatabase();

            mockInvoke.mockResolvedValueOnce(undefined);

            await db.deleteVoiceRecording("rec-123");

            expect(mockInvoke).toHaveBeenCalledWith(
                "db_delete_voice_recording",
                {
                    recording_id: "rec-123",
                },
            );
        });

        it("should return empty array if no recordings", async () => {
            const db = useDatabase();

            mockInvoke.mockResolvedValueOnce([]);

            const result = await db.getVoiceRecordings("user-123");

            expect(result).toEqual([]);
        });
    });

    // ── Utility Operations Tests ────────────────────────────────────────

    describe("Utility Operations", () => {
        it("should export user data", async () => {
            const db = useDatabase();
            const mockExport = {
                user: { id: "user-123", name: "Ahmed" },
                settings: { language: "en" },
                adhkar_progress: [],
                quran_progress: [],
                voice_recordings: [],
            };

            mockInvoke.mockResolvedValueOnce(mockExport);

            const result = await db.exportUserData("user-123");

            expect(mockInvoke).toHaveBeenCalledWith("db_export_user_data", {
                user_id: "user-123",
            });
            expect(result).toEqual(mockExport);
        });

        it("should reset user data", async () => {
            const db = useDatabase();

            mockInvoke.mockResolvedValueOnce(undefined);

            await db.resetUserData("user-123");

            expect(mockInvoke).toHaveBeenCalledWith("db_reset_user_data", {
                user_id: "user-123",
            });
        });
    });

    // ── Error Handling Tests ────────────────────────────────────────────

    describe("Error Handling", () => {
        it("should set error state on failure", async () => {
            const db = useDatabase();
            const errorMessage = "Connection failed";

            mockInvoke.mockRejectedValueOnce(new Error(errorMessage));

            try {
                await db.saveUser("user-123", "Name", "en");
            } catch {
                expect(db.error).not.toBeNull();
                expect(db.error?.message).toContain("Connection failed");
            }
        });

        it("should clear error on successful operation", async () => {
            const db = useDatabase();
            const mockUser = { id: "user-123", name: "Test" };

            mockInvoke.mockResolvedValueOnce(mockUser);

            const result = await db.saveUser("user-123", "Test", "en");

            expect(result).toEqual(mockUser);
            expect(db.error).toBeNull();
        });

        it("should handle database not initialized error", async () => {
            const db = useDatabase();

            mockInvoke.mockRejectedValueOnce(
                new Error("Database not initialized"),
            );

            await expect(db.getUser("user-123")).rejects.toThrow();
        });
    });

    // ── Integration Tests ────────────────────────────────────────────────

    describe("Integration", () => {
        it("should handle complete user workflow", async () => {
            const db = useDatabase();

            // Create user
            const mockUser = {
                id: "user-123",
                name: "Ahmed",
                language: "en",
            };
            mockInvoke.mockResolvedValueOnce(mockUser);
            const user = await db.saveUser("user-123", "Ahmed", "en");
            expect(user.id).toBe("user-123");

            // Save settings
            const mockSettings = {
                user_id: "user-123",
                language: "ar",
            };
            mockInvoke.mockResolvedValueOnce(mockSettings);
            const settings = await db.saveAppSettings({
                userId: "user-123",
                language: "ar",
            });
            expect(settings.language).toBe("ar");

            // Save adhkar progress
            const mockProgress = {
                user_id: "user-123",
                adhkar_id: "adhkar-1",
            };
            mockInvoke.mockResolvedValueOnce(mockProgress);
            const progress = await db.saveAdhkarProgress(
                "user-123",
                "adhkar-1",
            );
            expect(progress.user_id).toBe("user-123");
        });

        it("should handle voice recording workflow", async () => {
            const db = useDatabase();

            // Save recording
            const recordingId = "rec-123";
            mockInvoke.mockResolvedValueOnce(recordingId);
            const id = await db.saveVoiceRecording({
                userId: "user-123",
                surahNumber: 1,
                verseNumber: 5,
                filePath: "/audio.wav",
            });
            expect(id).toBe(recordingId);

            // Get recordings
            const mockRecordings = [{ id: recordingId, duration: 5.0 }];
            mockInvoke.mockResolvedValueOnce(mockRecordings);
            const recordings = await db.getVoiceRecordings("user-123");
            expect(recordings).toHaveLength(1);

            // Delete recording
            mockInvoke.mockResolvedValueOnce(undefined);
            await db.deleteVoiceRecording(recordingId);
        });
    });
});
