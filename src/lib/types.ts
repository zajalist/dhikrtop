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
}

export const DEFAULT_PREFERENCES: Preferences = {
  idleThresholdSec: 120,
  minIntervalSec: 600,
  categories: ['morning', 'evening', 'general', 'sleep'],
  language: 'all',
  enabled: true,
};
