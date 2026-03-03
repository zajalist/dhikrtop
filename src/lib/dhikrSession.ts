import { useMemo } from 'react';

export type DhikrCategory = 'morning' | 'evening' | 'after-prayer' | 'general';

export interface DhikrSessionWindow {
  category: DhikrCategory;
  label: string;
  startHour: number; // inclusive
  endHour: number;   // exclusive
}

// Simple, deterministic session windows. Later we can map to prayer times.
export const SESSION_WINDOWS: DhikrSessionWindow[] = [
  { category: 'morning', label: 'Morning', startHour: 4, endHour: 12 },
  { category: 'after-prayer', label: 'After Prayer', startHour: 12, endHour: 17 },
  { category: 'evening', label: 'Evening', startHour: 17, endHour: 22 },
  { category: 'general', label: 'General', startHour: 22, endHour: 4 },
];

export function getDhikrSessionForDate(date: Date = new Date()): DhikrCategory {
  const h = date.getHours();
  // Handle wrap-around windows (endHour < startHour)
  for (const w of SESSION_WINDOWS) {
    if (w.startHour < w.endHour) {
      if (h >= w.startHour && h < w.endHour) return w.category;
    } else {
      if (h >= w.startHour || h < w.endHour) return w.category;
    }
  }
  return 'general';
}

export function useDhikrSessionCategory(now: Date = new Date()) {
  return useMemo(() => getDhikrSessionForDate(now), [now]);
}
