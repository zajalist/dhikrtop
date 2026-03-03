/**
 * React hook for database operations
 *
 * This hook provides easy access to the local SQLite database
 * running on the user's machine. All data is stored locally.
 *
 * Usage:
 * const db = useDatabase();
 * await db.saveUser('user-123', 'Ahmed', 'en');
 * const user = await db.getUser('user-123');
 */

import { invoke } from "@tauri-apps/api/core";
import { useState, useCallback, useMemo, useEffect, useRef } from "react";

// Check if we're running in Tauri (v1 uses __TAURI__, v2 uses __TAURI_INTERNALS__).
const isTauri = () => {
    if (typeof window === "undefined") return false;
    const w = window as typeof window & {
        __TAURI__?: unknown;
        __TAURI_INTERNALS__?: unknown;
    };
    return Boolean(w.__TAURI__ || w.__TAURI_INTERNALS__);
};

interface WebDailyAdhkarProgressRow {
    userId: string;
    dayKey: string;
    adhkarId: string;
    targetCount: number;
    count: number;
    updatedAt: number;
}

const WEB_DAILY_ADHKAR_KEY = "dhikrtop_web_daily_adhkar_progress_v1";

function readWebDailyAdhkarStore(): WebDailyAdhkarProgressRow[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(WEB_DAILY_ADHKAR_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function writeWebDailyAdhkarStore(rows: WebDailyAdhkarProgressRow[]) {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(WEB_DAILY_ADHKAR_KEY, JSON.stringify(rows));
    } catch {
        // Ignore write errors (e.g. storage quota/private mode restrictions).
    }
}

function getWebDailyAdhkarProgress(userId: string, dayKey: string) {
    return readWebDailyAdhkarStore()
        .filter((row) => row.userId === userId && row.dayKey === dayKey)
        .map((row) => ({
            userId: row.userId,
            dayKey: row.dayKey,
            adhkarId: row.adhkarId,
            targetCount: row.targetCount,
            count: row.count,
            updatedAt: row.updatedAt,
        }));
}

function setWebDailyAdhkarProgress(
    userId: string,
    dayKey: string,
    adhkarId: string,
    targetCount: number,
    count: number,
) {
    const boundedCount = Math.max(0, Math.min(count, targetCount));
    const rows = readWebDailyAdhkarStore();
    const nextRow: WebDailyAdhkarProgressRow = {
        userId,
        dayKey,
        adhkarId,
        targetCount,
        count: boundedCount,
        updatedAt: Date.now(),
    };

    const idx = rows.findIndex(
        (row) =>
            row.userId === userId &&
            row.dayKey === dayKey &&
            row.adhkarId === adhkarId,
    );
    if (idx >= 0) {
        rows[idx] = nextRow;
    } else {
        rows.push(nextRow);
    }

    writeWebDailyAdhkarStore(rows);
    return {
        userId,
        dayKey,
        adhkarId,
        targetCount,
        count: boundedCount,
    };
}

export interface DatabaseError {
    message: string;
}

export interface UseDatabase {
    // User operations
    saveUser: (id: string, name: string, language: string) => Promise<any>;
    getUser: (id: string) => Promise<any | null>;

    // Adhkar progress
    saveAdhkarProgress: (
        userId: string,
        adhkarId: string,
        userRating?: string,
    ) => Promise<any>;
    getAdhkarProgress: (userId: string) => Promise<any[]>;

    // Daily adhkar progress (calendar)
    getDailyAdhkarProgress: (userId: string, dayKey: string) => Promise<any[]>;
    incrementDailyAdhkar: (
        userId: string,
        dayKey: string,
        adhkarId: string,
        targetCount: number,
        increment?: number,
    ) => Promise<any>;
    setDailyAdhkarCount: (
        userId: string,
        dayKey: string,
        adhkarId: string,
        targetCount: number,
        count: number,
    ) => Promise<any>;

    // App settings
    saveAppSettings: (settings: AppSettingsInput) => Promise<any>;
    getAppSettings: (userId: string) => Promise<any | null>;

    // Quran progress
    saveQuranProgress: (
        userId: string,
        surahNumber: number,
        verseNumber: number,
        bookmarked?: boolean,
    ) => Promise<any>;
    getQuranProgress: (userId: string) => Promise<any[]>;

    // Voice recordings
    saveVoiceRecording: (voiceInput: VoiceRecordingInput) => Promise<string>;
    getVoiceRecordings: (userId: string) => Promise<any[]>;
    getVerseRecordings: (
        userId: string,
        surahNumber: number,
        verseNumber: number,
    ) => Promise<any[]>;
    deleteVoiceRecording: (recordingId: string) => Promise<void>;

    // Utility
    exportUserData: (userId: string) => Promise<any>;
    resetUserData: (userId: string) => Promise<void>;

    // Notifications
    addNotification: (input: NotificationInput) => Promise<string>;
    getRecentNotifications: (
        userId: string,
        limit?: number,
        includeDismissed?: boolean,
    ) => Promise<any[]>;
    markNotificationRead: (id: string) => Promise<void>;
    dismissNotification: (id: string) => Promise<void>;
    clearNotifications: (userId: string) => Promise<void>;

    // State
    isInitialized: boolean;
    error: DatabaseError | null;
}

export interface AppSettingsInput {
    userId: string;
    reminderInterval?: number;
    enableNotifications?: boolean;
    enableSound?: boolean;
    quietHoursStart?: string;
    quietHoursEnd?: string;
    language?: string;
    theme?: string;
    latitude?: number;
    longitude?: number;
}

export interface VoiceRecordingInput {
    userId: string;
    surahNumber: number;
    verseNumber: number;
    filePath: string;
    duration?: number;
    confidenceScore?: number;
    transcription?: string;
}

export interface NotificationInput {
    userId: string;
    kind: "reminder" | "activity";
    notifType: "success" | "info" | "warning" | "error";
    title: string;
    subtitle?: string;
    content?: string;
    relatedId?: string;
}

export function useDatabase(): UseDatabase {
    const [isInitialized, setIsInitialized] = useState(false);
    const [error, setError] = useState<DatabaseError | null>(null);

    // De-dupe initialization so multiple concurrent calls don't race.
    const initInFlight = useRef<Promise<void> | null>(null);

    const initDb = useCallback(async () => {
        if (isInitialized) return;
        if (initInFlight.current) return initInFlight.current;

        initInFlight.current = (async () => {
            // If not in Tauri runtime, invoke will throw. Keep error but don't loop.
            if (!isTauri()) {
                throw new Error("Not running in Tauri runtime");
            }
            try {
                await invoke("db_init");
                setIsInitialized(true);
                setError(null);
            } catch (e: any) {
                const err: DatabaseError = {
                    message:
                        e?.message ||
                        String(e) ||
                        "Failed to initialize database",
                };
                setError(err);
                throw err;
            } finally {
                initInFlight.current = null;
            }
        })();

        return initInFlight.current;
    }, [isInitialized]);

    // Best-effort eager init on mount (prevents first tap not persisted)
    useEffect(() => {
        initDb().catch(() => {
            // Ignore; methods will surface errors if called outside Tauri.
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // User operations
    const saveUser = useCallback(
        async (id: string, name: string, language: string) => {
            try {
                await initDb();
                const result = await invoke<any>("db_save_user", {
                    id,
                    name,
                    language,
                });
                setError(null);
                return result;
            } catch (e: any) {
                const err: DatabaseError = {
                    message: e.message || "Failed to save user",
                };
                setError(err);
                throw err;
            }
        },
        [initDb],
    );

    const getUser = useCallback(
        async (id: string) => {
            try {
                await initDb();
                const result = await invoke<any | null>("db_get_user", { id });
                setError(null);
                return result;
            } catch (e: any) {
                const err: DatabaseError = {
                    message: e.message || "Failed to get user",
                };
                setError(err);
                throw err;
            }
        },
        [initDb],
    );

    // Adhkar progress operations
    const saveAdhkarProgress = useCallback(
        async (userId: string, adhkarId: string, userRating?: string) => {
            try {
                await initDb();
                const result = await invoke<any>("db_save_adhkar_progress", {
                    userId,
                    adhkarId,
                    userRating: userRating || null,
                });
                setError(null);
                return result;
            } catch (e: any) {
                const err: DatabaseError = {
                    message: e.message || "Failed to save adhkar progress",
                };
                setError(err);
                throw err;
            }
        },
        [initDb],
    );

    const getAdhkarProgress = useCallback(
        async (userId: string) => {
            try {
                await initDb();
                const result = await invoke<any[]>("db_get_adhkar_progress", {
                    userId,
                });
                setError(null);
                return result || [];
            } catch (e: any) {
                const err: DatabaseError = {
                    message: e.message || "Failed to get adhkar progress",
                };
                setError(err);
                throw err;
            }
        },
        [initDb],
    );

    // Daily adhkar progress (calendar)
    const getDailyAdhkarProgress = useCallback(
        async (userId: string, dayKey: string) => {
            try {
                if (!isTauri()) {
                    const rows = getWebDailyAdhkarProgress(userId, dayKey);
                    setError(null);
                    return rows;
                }
                await initDb();
                const result = await invoke<any[]>(
                    "db_get_daily_adhkar_progress",
                    { userId, dayKey },
                );
                setError(null);
                return result || [];
            } catch (e: any) {
                const err: DatabaseError = {
                    message: e.message || "Failed to get daily adhkar progress",
                };
                setError(err);
                throw err;
            }
        },
        [initDb],
    );

    const incrementDailyAdhkar = useCallback(
        async (
            userId: string,
            dayKey: string,
            adhkarId: string,
            targetCount: number,
            increment: number = 1,
        ) => {
            try {
                if (!isTauri()) {
                    const existingRows = getWebDailyAdhkarProgress(
                        userId,
                        dayKey,
                    );
                    const existing = existingRows.find(
                        (row) => row.adhkarId === adhkarId,
                    );
                    const currentCount = existing?.count ?? 0;
                    const nextCount = currentCount + increment;
                    const result = setWebDailyAdhkarProgress(
                        userId,
                        dayKey,
                        adhkarId,
                        targetCount,
                        nextCount,
                    );
                    setError(null);
                    return result;
                }
                await initDb();
                const result = await invoke<any>("db_increment_daily_adhkar", {
                    userId,
                    dayKey,
                    adhkarId,
                    targetCount,
                    increment,
                });
                setError(null);
                return result;
            } catch (e: any) {
                const err: DatabaseError = {
                    message: e.message || "Failed to increment daily adhkar",
                };
                setError(err);
                throw err;
            }
        },
        [initDb],
    );

    const setDailyAdhkarCount = useCallback(
        async (
            userId: string,
            dayKey: string,
            adhkarId: string,
            targetCount: number,
            count: number,
        ) => {
            try {
                if (!isTauri()) {
                    const result = setWebDailyAdhkarProgress(
                        userId,
                        dayKey,
                        adhkarId,
                        targetCount,
                        count,
                    );
                    setError(null);
                    return result;
                }
                await initDb();
                const result = await invoke<any>("db_set_daily_adhkar_count", {
                    userId,
                    dayKey,
                    adhkarId,
                    targetCount,
                    count,
                });
                setError(null);
                return result;
            } catch (e: any) {
                const err: DatabaseError = {
                    message: e.message || "Failed to set daily adhkar count",
                };
                setError(err);
                throw err;
            }
        },
        [initDb],
    );

    // App settings operations
    const saveAppSettings = useCallback(
        async (settings: AppSettingsInput) => {
            try {
                await initDb();
                const result = await invoke<any>("db_save_app_settings", {
                    userId: settings.userId,
                    reminderInterval: settings.reminderInterval || 60,
                    enableNotifications: settings.enableNotifications !== false,
                    enableSound: settings.enableSound !== false,
                    quietHoursStart: settings.quietHoursStart || null,
                    quietHoursEnd: settings.quietHoursEnd || null,
                    language: settings.language || "en",
                    theme: settings.theme || "dark",
                    latitude: settings.latitude || null,
                    longitude: settings.longitude || null,
                });
                setError(null);
                return result;
            } catch (e: any) {
                const err: DatabaseError = {
                    message: e.message || "Failed to save app settings",
                };
                setError(err);
                throw err;
            }
        },
        [initDb],
    );

    const getAppSettings = useCallback(
        async (userId: string) => {
            try {
                await initDb();
                const result = await invoke<any | null>("db_get_app_settings", {
                    userId,
                });
                setError(null);
                return result;
            } catch (e: any) {
                const err: DatabaseError = {
                    message: e.message || "Failed to get app settings",
                };
                setError(err);
                throw err;
            }
        },
        [initDb],
    );

    // Quran progress operations
    const saveQuranProgress = useCallback(
        async (
            userId: string,
            surahNumber: number,
            verseNumber: number,
            bookmarked = false,
        ) => {
            try {
                await initDb();
                const result = await invoke<any>("db_save_quran_progress", {
                    userId,
                    surahNumber,
                    verseNumber,
                    bookmarked,
                });
                setError(null);
                return result;
            } catch (e: any) {
                const err: DatabaseError = {
                    message: e.message || "Failed to save quran progress",
                };
                setError(err);
                throw err;
            }
        },
        [initDb],
    );

    const getQuranProgress = useCallback(
        async (userId: string) => {
            try {
                await initDb();
                const result = await invoke<any[]>("db_get_quran_progress", {
                    userId,
                });
                setError(null);
                return result || [];
            } catch (e: any) {
                const err: DatabaseError = {
                    message: e.message || "Failed to get quran progress",
                };
                setError(err);
                throw err;
            }
        },
        [initDb],
    );

    // Voice recording operations
    const saveVoiceRecording = useCallback(
        async (voiceInput: VoiceRecordingInput) => {
            try {
                await initDb();
                const result = await invoke<string>("db_save_voice_recording", {
                    userId: voiceInput.userId,
                    surahNumber: voiceInput.surahNumber,
                    verseNumber: voiceInput.verseNumber,
                    filePath: voiceInput.filePath,
                    duration: voiceInput.duration || null,
                    confidenceScore: voiceInput.confidenceScore || null,
                    transcription: voiceInput.transcription || null,
                });
                setError(null);
                return result;
            } catch (e: any) {
                const err: DatabaseError = {
                    message: e.message || "Failed to save voice recording",
                };
                setError(err);
                throw err;
            }
        },
        [initDb],
    );

    const getVoiceRecordings = useCallback(
        async (userId: string) => {
            try {
                await initDb();
                const result = await invoke<any[]>("db_get_voice_recordings", {
                    userId,
                });
                setError(null);
                return result || [];
            } catch (e: any) {
                const err: DatabaseError = {
                    message: e.message || "Failed to get voice recordings",
                };
                setError(err);
                throw err;
            }
        },
        [initDb],
    );

    const getVerseRecordings = useCallback(
        async (userId: string, surahNumber: number, verseNumber: number) => {
            try {
                await initDb();
                const result = await invoke<any[]>("db_get_verse_recordings", {
                    userId,
                    surahNumber,
                    verseNumber,
                });
                setError(null);
                return result || [];
            } catch (e: any) {
                const err: DatabaseError = {
                    message: e.message || "Failed to get verse recordings",
                };
                setError(err);
                throw err;
            }
        },
        [initDb],
    );

    const deleteVoiceRecording = useCallback(
        async (recordingId: string) => {
            try {
                await initDb();
                await invoke("db_delete_voice_recording", { recordingId });
                setError(null);
            } catch (e: any) {
                const err: DatabaseError = {
                    message: e.message || "Failed to delete voice recording",
                };
                setError(err);
                throw err;
            }
        },
        [initDb],
    );

    // Utility operations
    const exportUserData = useCallback(
        async (userId: string) => {
            try {
                await initDb();
                const result = await invoke<any>("db_export_user_data", {
                    userId,
                });
                setError(null);
                return result;
            } catch (e: any) {
                const err: DatabaseError = {
                    message: e.message || "Failed to export user data",
                };
                setError(err);
                throw err;
            }
        },
        [initDb],
    );

    const resetUserData = useCallback(
        async (userId: string) => {
            try {
                await initDb();
                await invoke("db_reset_user_data", { userId });
                setError(null);
            } catch (e: any) {
                const err: DatabaseError = {
                    message: e.message || "Failed to reset user data",
                };
                setError(err);
                throw err;
            }
        },
        [initDb],
    );

    // Notifications
    const addNotification = useCallback(
        async (input: NotificationInput) => {
            try {
                await initDb();
                const id = await invoke<string>("db_add_notification", {
                    userId: input.userId,
                    kind: input.kind,
                    notifType: input.notifType,
                    title: input.title,
                    subtitle: input.subtitle || null,
                    content: input.content || null,
                    relatedId: input.relatedId || null,
                });
                setError(null);
                return id;
            } catch (e: any) {
                const err: DatabaseError = {
                    message: e.message || "Failed to add notification",
                };
                setError(err);
                throw err;
            }
        },
        [initDb],
    );

    const getRecentNotifications = useCallback(
        async (
            userId: string,
            limit: number = 20,
            includeDismissed: boolean = false,
        ) => {
            try {
                await initDb();
                const rows = await invoke<any[]>(
                    "db_get_recent_notifications",
                    {
                        userId,
                        limit,
                        includeDismissed,
                    },
                );
                setError(null);
                return rows || [];
            } catch (e: any) {
                const err: DatabaseError = {
                    message: e.message || "Failed to get notifications",
                };
                setError(err);
                throw err;
            }
        },
        [initDb],
    );

    const markNotificationRead = useCallback(
        async (id: string) => {
            try {
                await initDb();
                await invoke("db_mark_notification_read", { id });
                setError(null);
            } catch (e: any) {
                const err: DatabaseError = {
                    message: e.message || "Failed to mark notification read",
                };
                setError(err);
                throw err;
            }
        },
        [initDb],
    );

    const dismissNotification = useCallback(
        async (id: string) => {
            try {
                await initDb();
                await invoke("db_dismiss_notification", { id });
                setError(null);
            } catch (e: any) {
                const err: DatabaseError = {
                    message: e.message || "Failed to dismiss notification",
                };
                setError(err);
                throw err;
            }
        },
        [initDb],
    );

    const clearNotifications = useCallback(
        async (userId: string) => {
            try {
                await initDb();
                await invoke("db_clear_notifications", { userId });
                setError(null);
            } catch (e: any) {
                const err: DatabaseError = {
                    message: e.message || "Failed to clear notifications",
                };
                setError(err);
                throw err;
            }
        },
        [initDb],
    );

    return useMemo(
        () => ({
            // User operations
            saveUser,
            getUser,

            // Adhkar progress
            saveAdhkarProgress,
            getAdhkarProgress,

            // Daily adhkar progress
            getDailyAdhkarProgress,
            incrementDailyAdhkar,
            setDailyAdhkarCount,

            // App settings
            saveAppSettings,
            getAppSettings,

            // Quran progress
            saveQuranProgress,
            getQuranProgress,

            // Voice recordings
            saveVoiceRecording,
            getVoiceRecordings,
            getVerseRecordings,
            deleteVoiceRecording,

            // Utility
            exportUserData,
            resetUserData,

            // Notifications
            addNotification,
            getRecentNotifications,
            markNotificationRead,
            dismissNotification,
            clearNotifications,

            // State
            isInitialized,
            error,
        }),
        [
            saveUser,
            getUser,
            saveAdhkarProgress,
            getAdhkarProgress,
            getDailyAdhkarProgress,
            incrementDailyAdhkar,
            setDailyAdhkarCount,
            saveAppSettings,
            getAppSettings,
            saveQuranProgress,
            getQuranProgress,
            saveVoiceRecording,
            getVoiceRecordings,
            getVerseRecordings,
            deleteVoiceRecording,
            exportUserData,
            resetUserData,
            addNotification,
            getRecentNotifications,
            markNotificationRead,
            dismissNotification,
            clearNotifications,
            isInitialized,
            error,
        ],
    );
}
