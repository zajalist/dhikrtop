import type { DhikrCategory } from "../dhikr";

// ── Shared Book Data Types ──────────────────────────────────────────────────

export interface BookAdhkarItem {
  id: string;
  arabic: string;
  transliteration: string;
  translation: string;
  benefit?: string;
  targetCount: number;
  source: string;
}

export interface BookSection {
  id: string;
  title: string;
  titleArabic: string;
  description?: string;
  category: DhikrCategory | "sleep" | "prayer-specific" | "home" | "food" | "travel";
  adhkar: BookAdhkarItem[];
}

export interface AdhkarBook {
  id: string;
  title: string;
  titleArabic: string;
  author?: string;
  tradition: string;
  description: string;
  sections: BookSection[];
}
