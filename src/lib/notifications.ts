/**
 * Notification and reminder management system
 * Handles user notifications based on configured triggers
 */

import {
    morningAdhkar,
    eveningAdhkar,
    afterPrayerAdhkar,
    generalDhikr,
} from "../data/dhikr";
import { getActiveDhikrItems, loadUserData } from "./userData";

export interface Reminder {
    id: string;
    type: "prayer" | "morning" | "evening" | "idle" | "custom";
    content: "adhkar" | "quran";
    triggered: boolean;
    timestamp: number;
}

export interface NotificationConfig {
    enabled: boolean;
    quietStart: string; // HH:MM format
    quietEnd: string; // HH:MM format
    triggers: string[]; // prayer-based, morning, evening, idle, location
    soundEnabled: boolean;
}

export interface AdhkarNotification {
    id: string;
    type: "success" | "info" | "warning";
    title: string;
    subtitle: string;
    content: string;
    timestamp: number;
    duration?: number; // in seconds
}

const IDLE_THRESHOLD = 5 * 60 * 1000; // 5 minutes idle
let lastActivityTime = Date.now();

/**
 * Get user preferences from localStorage
 */
export function getNotificationConfig(): NotificationConfig {
    try {
        const userData = loadUserData();
        return {
            enabled: true,
            quietStart: userData.reminderWindows?.night || "22:00",
            quietEnd: userData.reminderWindows?.morning || "06:00",
            triggers: userData.reminderTriggers || [
                "prayer-based",
                "morning",
                "evening",
            ],
            soundEnabled: true,
        };
    } catch {
        return {
            enabled: true,
            quietStart: "22:00",
            quietEnd: "06:00",
            triggers: ["prayer-based", "morning", "evening"],
            soundEnabled: true,
        };
    }
}

/**
 * Check if current time is within quiet hours
 */
export function isQuietHours(): boolean {
    const config = getNotificationConfig();
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const [quietStartHour, quietStartMin] = config.quietStart
        .split(":")
        .map(Number);
    const [quietEndHour, quietEndMin] = config.quietEnd.split(":").map(Number);
    const [currentHour, currentMin] = currentTime.split(":").map(Number);

    const quietStartMins = quietStartHour * 60 + quietStartMin;
    const quietEndMins = quietEndHour * 60 + quietEndMin;
    const currentMins = currentHour * 60 + currentMin;

    // Handle case where quiet hours span midnight
    if (quietStartMins > quietEndMins) {
        return currentMins >= quietStartMins || currentMins <= quietEndMins;
    }

    return currentMins >= quietStartMins && currentMins <= quietEndMins;
}

/**
 * Get random adhkar for notification
 */
export function getRandomAdhkar() {
    const userData = loadUserData();
    const active = getActiveDhikrItems(userData);
    const allAdhkar =
        active.length > 0
            ? active
            : [
                  ...morningAdhkar,
                  ...eveningAdhkar,
                  ...afterPrayerAdhkar,
                  ...generalDhikr,
              ];
    return allAdhkar[Math.floor(Math.random() * allAdhkar.length)];
}

/**
 * Get random Quran surah piece
 */
export function getRandomQuranMemo() {
    const quranData = [
        {
            surah: "Al-Fatiha",
            arabicName: "الفاتحة",
            verses: "Verses 1-7",
            ayah: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
        },
        {
            surah: "Ayat al-Kursi",
            arabicName: "آية الكرسي",
            verses: "Surah 2:255",
            ayah: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ",
        },
        {
            surah: "Surah Al-Ikhlas",
            arabicName: "الإخلاص",
            verses: "1-4",
            ayah: "قُلْ هُوَ اللَّهُ أَحَدٌ",
        },
    ];
    return quranData[Math.floor(Math.random() * quranData.length)];
}

/**
 * Check for idle state (no user activity)
 */
export function trackActivity() {
    lastActivityTime = Date.now();
}

export function isUserIdle(): boolean {
    return Date.now() - lastActivityTime >= IDLE_THRESHOLD;
}

/**
 * Determine which reminder should be shown
 */
export function shouldShowReminder(): { trigger: string; content: any } | null {
    const config = getNotificationConfig();

    // Check if in quiet hours
    if (isQuietHours()) {
        return null;
    }

    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();

    // Idle detection
    if (config.triggers.includes("idle") && isUserIdle()) {
        return {
            trigger: "idle",
            content: getRandomAdhkar(),
        };
    }

    // Morning reminder (around sunrise, typically 5-6 AM)
    if (config.triggers.includes("morning") && hour === 6 && minute === 0) {
        return {
            trigger: "morning",
            content: morningAdhkar[0] || getRandomAdhkar(),
        };
    }

    // Evening reminder (around sunset, typically 5-6 PM)
    if (config.triggers.includes("evening") && hour === 17 && minute === 0) {
        return {
            trigger: "evening",
            content: eveningAdhkar[0] || getRandomAdhkar(),
        };
    }

    return null;
}

/**
 * Create an adhkar notification object
 */
export function createAdhkarNotification(
    adhkar: any,
    trigger: string,
): AdhkarNotification {
    return {
        id: `notif_${Date.now()}_${Math.random()}`,
        type: "info",
        title: `Time for Dhikr (${trigger})`,
        subtitle: `${adhkar.transliteration || adhkar.arabic}`,
        content: adhkar.translation || adhkar.arabic,
        timestamp: Date.now(),
        duration: 10, // 10 seconds
    };
}

/**
 * Get stored activity duration for reminders
 */
export function getActivityStats() {
    try {
        const stats = JSON.parse(
            localStorage.getItem("dhikr_activity_stats") || "{}",
        );
        return {
            todayDhikr: stats.todayDhikr || 0,
            thisWeekDhikr: stats.thisWeekDhikr || 0,
            totalDhikr: stats.totalDhikr || 0,
            currentStreak: stats.currentStreak || 0,
        };
    } catch {
        return {
            todayDhikr: 0,
            thisWeekDhikr: 0,
            totalDhikr: 0,
            currentStreak: 0,
        };
    }
}

/**
 * Update activity stats
 */
export function updateActivityStats(increment: number = 1) {
    try {
        const stats = getActivityStats();
        stats.todayDhikr += increment;
        stats.thisWeekDhikr += increment;
        stats.totalDhikr += increment;
        localStorage.setItem("dhikr_activity_stats", JSON.stringify(stats));
    } catch (e) {
        console.error("Failed to update activity stats", e);
    }
}
