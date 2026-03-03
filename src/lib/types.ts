export interface Adhkar {
  id: string;
  arabic: string;
  transliteration: string;
  english: string;
  /** One of: morning | evening | sleep | general */
  category: 'morning' | 'evening' | 'sleep' | 'general';
  source: string;
  repeat?: number;
}

export interface Preferences {
  idleThresholdSec: number;
  minIntervalSec: number;
  categories: Array<Adhkar['category']>;
  /** 'all' | 'arabic' | 'english' */
  language: 'all' | 'arabic' | 'english';
  enabled: boolean;
  uiScale: number;
  popupPosition: 'top-left' | 'top-center' | 'top-right';
  reduceMotion: boolean;
  openExpanded: boolean;
}

export const DEFAULT_PREFERENCES: Preferences = {
  idleThresholdSec: 120,
  minIntervalSec: 600,
  categories: ['morning', 'evening', 'general', 'sleep'],
  language: 'all',
  enabled: true,
  uiScale: 1,
  popupPosition: 'top-left',
  reduceMotion: false,
  openExpanded: true,
};
