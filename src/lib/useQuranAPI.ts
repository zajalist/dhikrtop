/**
 * React Hook: Quran.com API Integration
 *
 * Fetches complete Quran data (all 114 Surahs) from the free Quran.com API
 * Caches data in IndexedDB for offline support
 *
 * API Endpoint: https://api.alquran.cloud/v1/
 *
 * Usage:
 * const quran = useQuranAPI();
 * const surahs = await quran.getAllSurahs();
 * const surah = await quran.getSurah(1); // Surah Al-Fatiha
 * const verse = await quran.getVerse(1, 1);
 */

import { useState, useCallback, useRef } from 'react';

// ── Type Definitions ────────────────────────────────────────────────

export interface QuranApiError {
  message: string;
  code?: string;
}

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
}

export interface Verse {
  number: number;
  text: string;
  numberInSurah: number;
  juz?: number;
  manzil?: number;
  page?: number;
  ruku?: number;
  hizbQuarter?: number;
  sajdah?: boolean;
  // Translation
  translation?: string;
  // Transliteration
  transliteration?: string;
}

export interface SurahData {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
  ayahs: Verse[];
}

export interface UseQuranAPI {
  // Surah operations
  getAllSurahs: () => Promise<Surah[]>;
  getSurah: (surahNumber: number, edition?: string) => Promise<SurahData>;

  // Verse operations
  getVerse: (surahNumber: number, verseNumber: number) => Promise<Verse>;
  searchVerses: (query: string) => Promise<Verse[]>;

  // Metadata
  getEditions: () => Promise<any[]>;
  getLanguages: () => Promise<any[]>;

  // Cache management
  clearCache: () => Promise<void>;
  getCacheInfo: () => Promise<{ size: number; lastUpdated?: number }>;

  // State
  isLoading: boolean;
  error: QuranApiError | null;
  totalSurahs: number;
}

// ── Constants ──────────────────────────────────────────────────────

const QURAN_API_BASE = 'https://api.alquran.cloud/v1';
const DB_NAME = 'dhikrtop_quran';
const SURAHS_STORE = 'surahs';
const CACHE_METADATA_STORE = 'metadata';

// Default editions for translations
const DEFAULT_EDITIONS = {
  text: 'ar.alafasy', // Arabic text
  english: 'en.asad', // English translation
  transliteration: 'en.transliteration', // Transliteration
};

// ── IndexedDB Helper ───────────────────────────────────────────────

async function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(SURAHS_STORE)) {
        db.createObjectStore(SURAHS_STORE, { keyPath: 'number' });
      }

      if (!db.objectStoreNames.contains(CACHE_METADATA_STORE)) {
        db.createObjectStore(CACHE_METADATA_STORE, { keyPath: 'key' });
      }
    };
  });
}

async function getSurahFromCache(surahNumber: number): Promise<SurahData | null> {
  try {
    const db = await initDB();
    return new Promise((resolve) => {
      const request = db.transaction(SURAHS_STORE, 'readonly')
        .objectStore(SURAHS_STORE)
        .get(surahNumber);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function setSurahInCache(surah: SurahData): Promise<void> {
  try {
    const db = await initDB();
    db.transaction(SURAHS_STORE, 'readwrite')
      .objectStore(SURAHS_STORE)
      .put(surah);
  } catch {
    // Silently fail if caching doesn't work
  }
}

async function clearQuranCache(): Promise<void> {
  try {
    const db = await initDB();
    db.transaction(SURAHS_STORE, 'readwrite')
      .objectStore(SURAHS_STORE)
      .clear();
  } catch {
    // Silently fail
  }
}

async function getCacheMetadata(): Promise<any> {
  try {
    const db = await initDB();
    return new Promise((resolve) => {
      const request = db.transaction(CACHE_METADATA_STORE, 'readonly')
        .objectStore(CACHE_METADATA_STORE)
        .get('quran_cache');

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function setCacheMetadata(metadata: any): Promise<void> {
  try {
    const db = await initDB();
    db.transaction(CACHE_METADATA_STORE, 'readwrite')
      .objectStore(CACHE_METADATA_STORE)
      .put({ key: 'quran_cache', ...metadata });
  } catch {
    // Silently fail
  }
}

// ── Main Hook ──────────────────────────────────────────────────────

export function useQuranAPI(): UseQuranAPI {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<QuranApiError | null>(null);
  const [totalSurahs, setTotalSurahs] = useState(114);
  const surahsCacheRef = useRef<Map<number, SurahData>>(new Map());
  const allSurahsRef = useRef<Surah[] | null>(null);

  // Fetch all surahs metadata
  const getAllSurahs = useCallback(async (): Promise<Surah[]> => {
    if (allSurahsRef.current) {
      return allSurahsRef.current;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${QURAN_API_BASE}/surah`);
      if (!response.ok) throw new Error('Failed to fetch surahs');

      const data = await response.json();
      const surahs: Surah[] = data.data || [];

      allSurahsRef.current = surahs;
      setTotalSurahs(surahs.length);
      setIsLoading(false);

      return surahs;
    } catch (err: any) {
      const errorObj: QuranApiError = {
        message: err.message || 'Failed to fetch Quran data',
        code: 'FETCH_ERROR',
      };
      setError(errorObj);
      setIsLoading(false);
      throw errorObj;
    }
  }, []);

  // Fetch specific surah with verses
  const getSurah = useCallback(
    async (surahNumber: number, edition: string = DEFAULT_EDITIONS.text): Promise<SurahData> => {
      // Check memory cache first
      if (surahsCacheRef.current.has(surahNumber)) {
        return surahsCacheRef.current.get(surahNumber)!;
      }

      // Check IndexedDB cache
      const cachedSurah = await getSurahFromCache(surahNumber);
      if (cachedSurah) {
        surahsCacheRef.current.set(surahNumber, cachedSurah);
        return cachedSurah;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Fetch from API
        const response = await fetch(`${QURAN_API_BASE}/surah/${surahNumber}/${edition}`);
        if (!response.ok) throw new Error(`Failed to fetch surah ${surahNumber}`);

        const data = await response.json();
        const surah: SurahData = data.data;

        // Cache in memory
        surahsCacheRef.current.set(surahNumber, surah);

        // Cache in IndexedDB for offline
        await setSurahInCache(surah);

        setIsLoading(false);
        return surah;
      } catch (err: any) {
        const errorObj: QuranApiError = {
          message: err.message || `Failed to fetch surah ${surahNumber}`,
          code: 'SURAH_FETCH_ERROR',
        };
        setError(errorObj);
        setIsLoading(false);
        throw errorObj;
      }
    },
    []
  );

  // Fetch single verse
  const getVerse = useCallback(
    async (surahNumber: number, verseNumber: number): Promise<Verse> => {
      try {
        const surah = await getSurah(surahNumber);
        const verse = surah.ayahs.find((v) => v.numberInSurah === verseNumber);

        if (!verse) {
          throw new Error(`Verse ${verseNumber} not found in Surah ${surahNumber}`);
        }

        return verse;
      } catch (err: any) {
        const errorObj: QuranApiError = {
          message: err.message || `Failed to fetch verse ${surahNumber}:${verseNumber}`,
          code: 'VERSE_FETCH_ERROR',
        };
        setError(errorObj);
        throw errorObj;
      }
    },
    [getSurah]
  );

  // Simple verse search (searches in memory if loaded)
  const searchVerses = useCallback(
    async (query: string): Promise<Verse[]> => {
      const results: Verse[] = [];
      const queryLower = query.toLowerCase();

      // Search through cached surahs
      for (const [, surah] of surahsCacheRef.current) {
        for (const verse of surah.ayahs) {
          if (
            verse.text.toLowerCase().includes(queryLower) ||
            (verse.translation && verse.translation.toLowerCase().includes(queryLower))
          ) {
            results.push(verse);
          }
        }
      }

      return results;
    },
    []
  );

  // Get available editions (languages/translations)
  const getEditions = useCallback(async (): Promise<any[]> => {
    try {
      const response = await fetch(`${QURAN_API_BASE}/edition`);
      if (!response.ok) throw new Error('Failed to fetch editions');

      const data = await response.json();
      return data.data || [];
    } catch (err: any) {
      const errorObj: QuranApiError = {
        message: 'Failed to fetch editions',
        code: 'EDITIONS_ERROR',
      };
      setError(errorObj);
      throw errorObj;
    }
  }, []);

  // Get available languages
  const getLanguages = useCallback(async (): Promise<any[]> => {
    try {
      const response = await fetch(`${QURAN_API_BASE}/language`);
      if (!response.ok) throw new Error('Failed to fetch languages');

      const data = await response.json();
      return data.data || [];
    } catch (err: any) {
      const errorObj: QuranApiError = {
        message: 'Failed to fetch languages',
        code: 'LANGUAGES_ERROR',
      };
      setError(errorObj);
      throw errorObj;
    }
  }, []);

  // Clear all caches
  const clearCache = useCallback(async (): Promise<void> => {
    surahsCacheRef.current.clear();
    allSurahsRef.current = null;
    await clearQuranCache();
  }, []);

  // Get cache info
  const getCacheInfo = useCallback(async (): Promise<{ size: number; lastUpdated?: number }> => {
    try {
      const metadata = await getCacheMetadata();
      return {
        size: surahsCacheRef.current.size,
        lastUpdated: metadata?.timestamp,
      };
    } catch {
      return { size: surahsCacheRef.current.size };
    }
  }, []);

  return {
    // Operations
    getAllSurahs,
    getSurah,
    getVerse,
    searchVerses,
    getEditions,
    getLanguages,
    clearCache,
    getCacheInfo,

    // State
    isLoading,
    error,
    totalSurahs,
  };
}

// ── Preload Helper ────────────────────────────────────────────────

/**
 * Helper function to preload all surahs in the background
 * Call this on app startup to cache everything for offline use
 */
export async function preloadAllSurahs(onProgress?: (loaded: number, total: number) => void): Promise<void> {
  const quran = useQuranAPI();

  try {
    const surahs = await quran.getAllSurahs();

    for (let i = 0; i < surahs.length; i++) {
      await quran.getSurah(i + 1);
      onProgress?.(i + 1, surahs.length);

      // Stagger requests to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  } catch (error) {
    console.error('Failed to preload Quran:', error);
  }
}
