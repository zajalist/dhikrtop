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

import { invoke } from '@tauri-apps/api/core';
import { useState, useCallback } from 'react';

export interface DatabaseError {
  message: string;
}

export interface UseDatabase {
  // User operations
  saveUser: (id: string, name: string, language: string) => Promise<any>;
  getUser: (id: string) => Promise<any | null>;

  // Adhkar progress
  saveAdhkarProgress: (userId: string, adhkarId: string, userRating?: string) => Promise<any>;
  getAdhkarProgress: (userId: string) => Promise<any[]>;

  // App settings
  saveAppSettings: (settings: AppSettingsInput) => Promise<any>;
  getAppSettings: (userId: string) => Promise<any | null>;

  // Quran progress
  saveQuranProgress: (userId: string, surahNumber: number, verseNumber: number, bookmarked?: boolean) => Promise<any>;
  getQuranProgress: (userId: string) => Promise<any[]>;

  // Voice recordings
  saveVoiceRecording: (voiceInput: VoiceRecordingInput) => Promise<string>;
  getVoiceRecordings: (userId: string) => Promise<any[]>;
  getVerseRecordings: (userId: string, surahNumber: number, verseNumber: number) => Promise<any[]>;
  deleteVoiceRecording: (recordingId: string) => Promise<void>;

  // Utility
  exportUserData: (userId: string) => Promise<any>;
  resetUserData: (userId: string) => Promise<void>;

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

export function useDatabase(): UseDatabase {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<DatabaseError | null>(null);

  // Initialize database on first use
  const initDb = useCallback(async () => {
    if (isInitialized) return;
    try {
      await invoke('db_init');
      setIsInitialized(true);
      setError(null);
    } catch (e: any) {
      const err: DatabaseError = {
        message: e.message || 'Failed to initialize database',
      };
      setError(err);
      throw err;
    }
  }, [isInitialized]);

  // User operations
  const saveUser = useCallback(
    async (id: string, name: string, language: string) => {
      try {
        await initDb();
        const result = await invoke<any>('db_save_user', { id, name, language });
        setError(null);
        return result;
      } catch (e: any) {
        const err: DatabaseError = {
          message: e.message || 'Failed to save user',
        };
        setError(err);
        throw err;
      }
    },
    [initDb]
  );

  const getUser = useCallback(
    async (id: string) => {
      try {
        await initDb();
        const result = await invoke<any | null>('db_get_user', { id });
        setError(null);
        return result;
      } catch (e: any) {
        const err: DatabaseError = {
          message: e.message || 'Failed to get user',
        };
        setError(err);
        throw err;
      }
    },
    [initDb]
  );

  // Adhkar progress operations
  const saveAdhkarProgress = useCallback(
    async (userId: string, adhkarId: string, userRating?: string) => {
      try {
        await initDb();
        const result = await invoke<any>('db_save_adhkar_progress', {
          user_id: userId,
          adhkar_id: adhkarId,
          user_rating: userRating || null,
        });
        setError(null);
        return result;
      } catch (e: any) {
        const err: DatabaseError = {
          message: e.message || 'Failed to save adhkar progress',
        };
        setError(err);
        throw err;
      }
    },
    [initDb]
  );

  const getAdhkarProgress = useCallback(
    async (userId: string) => {
      try {
        await initDb();
        const result = await invoke<any[]>('db_get_adhkar_progress', {
          user_id: userId,
        });
        setError(null);
        return result || [];
      } catch (e: any) {
        const err: DatabaseError = {
          message: e.message || 'Failed to get adhkar progress',
        };
        setError(err);
        throw err;
      }
    },
    [initDb]
  );

  // App settings operations
  const saveAppSettings = useCallback(
    async (settings: AppSettingsInput) => {
      try {
        await initDb();
        const result = await invoke<any>('db_save_app_settings', {
          user_id: settings.userId,
          reminder_interval: settings.reminderInterval || 60,
          enable_notifications: settings.enableNotifications !== false,
          enable_sound: settings.enableSound !== false,
          quiet_hours_start: settings.quietHoursStart || null,
          quiet_hours_end: settings.quietHoursEnd || null,
          language: settings.language || 'en',
          theme: settings.theme || 'dark',
          latitude: settings.latitude || null,
          longitude: settings.longitude || null,
        });
        setError(null);
        return result;
      } catch (e: any) {
        const err: DatabaseError = {
          message: e.message || 'Failed to save app settings',
        };
        setError(err);
        throw err;
      }
    },
    [initDb]
  );

  const getAppSettings = useCallback(
    async (userId: string) => {
      try {
        await initDb();
        const result = await invoke<any | null>('db_get_app_settings', {
          user_id: userId,
        });
        setError(null);
        return result;
      } catch (e: any) {
        const err: DatabaseError = {
          message: e.message || 'Failed to get app settings',
        };
        setError(err);
        throw err;
      }
    },
    [initDb]
  );

  // Quran progress operations
  const saveQuranProgress = useCallback(
    async (userId: string, surahNumber: number, verseNumber: number, bookmarked = false) => {
      try {
        await initDb();
        const result = await invoke<any>('db_save_quran_progress', {
          user_id: userId,
          surah_number: surahNumber,
          verse_number: verseNumber,
          bookmarked,
        });
        setError(null);
        return result;
      } catch (e: any) {
        const err: DatabaseError = {
          message: e.message || 'Failed to save quran progress',
        };
        setError(err);
        throw err;
      }
    },
    [initDb]
  );

  const getQuranProgress = useCallback(
    async (userId: string) => {
      try {
        await initDb();
        const result = await invoke<any[]>('db_get_quran_progress', {
          user_id: userId,
        });
        setError(null);
        return result || [];
      } catch (e: any) {
        const err: DatabaseError = {
          message: e.message || 'Failed to get quran progress',
        };
        setError(err);
        throw err;
      }
    },
    [initDb]
  );

  // Voice recording operations
  const saveVoiceRecording = useCallback(
    async (voiceInput: VoiceRecordingInput) => {
      try {
        await initDb();
        const result = await invoke<string>('db_save_voice_recording', {
          user_id: voiceInput.userId,
          surah_number: voiceInput.surahNumber,
          verse_number: voiceInput.verseNumber,
          file_path: voiceInput.filePath,
          duration: voiceInput.duration || null,
          confidence_score: voiceInput.confidenceScore || null,
          transcription: voiceInput.transcription || null,
        });
        setError(null);
        return result;
      } catch (e: any) {
        const err: DatabaseError = {
          message: e.message || 'Failed to save voice recording',
        };
        setError(err);
        throw err;
      }
    },
    [initDb]
  );

  const getVoiceRecordings = useCallback(
    async (userId: string) => {
      try {
        await initDb();
        const result = await invoke<any[]>('db_get_voice_recordings', {
          user_id: userId,
        });
        setError(null);
        return result || [];
      } catch (e: any) {
        const err: DatabaseError = {
          message: e.message || 'Failed to get voice recordings',
        };
        setError(err);
        throw err;
      }
    },
    [initDb]
  );

  const getVerseRecordings = useCallback(
    async (userId: string, surahNumber: number, verseNumber: number) => {
      try {
        await initDb();
        const result = await invoke<any[]>('db_get_verse_recordings', {
          user_id: userId,
          surah_number: surahNumber,
          verse_number: verseNumber,
        });
        setError(null);
        return result || [];
      } catch (e: any) {
        const err: DatabaseError = {
          message: e.message || 'Failed to get verse recordings',
        };
        setError(err);
        throw err;
      }
    },
    [initDb]
  );

  const deleteVoiceRecording = useCallback(
    async (recordingId: string) => {
      try {
        await initDb();
        await invoke('db_delete_voice_recording', {
          recording_id: recordingId,
        });
        setError(null);
      } catch (e: any) {
        const err: DatabaseError = {
          message: e.message || 'Failed to delete voice recording',
        };
        setError(err);
        throw err;
      }
    },
    [initDb]
  );

  // Utility operations
  const exportUserData = useCallback(
    async (userId: string) => {
      try {
        await initDb();
        const result = await invoke<any>('db_export_user_data', {
          user_id: userId,
        });
        setError(null);
        return result;
      } catch (e: any) {
        const err: DatabaseError = {
          message: e.message || 'Failed to export user data',
        };
        setError(err);
        throw err;
      }
    },
    [initDb]
  );

  const resetUserData = useCallback(
    async (userId: string) => {
      try {
        await initDb();
        await invoke('db_reset_user_data', {
          user_id: userId,
        });
        setError(null);
      } catch (e: any) {
        const err: DatabaseError = {
          message: e.message || 'Failed to reset user data',
        };
        setError(err);
        throw err;
      }
    },
    [initDb]
  );

  return {
    // User operations
    saveUser,
    getUser,

    // Adhkar progress
    saveAdhkarProgress,
    getAdhkarProgress,

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

    // State
    isInitialized,
    error,
  };
}
