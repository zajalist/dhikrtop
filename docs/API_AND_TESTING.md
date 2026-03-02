# API Reference & Testing Strategy

## Module API Documentation

### 1. Activity Detection Module

**Location**: `src/shared/activityDetection/`

#### ActivityDetector Class

```typescript
interface ActivityDetector {
  // Initialize activity tracking
  start(): void;
  
  // Stop tracking and cleanup
  stop(): void;
  
  // Get current activity state
  getActivityState(): ActivityState;
  
  // Register callback for activity changes
  onActivityChange(callback: (state: ActivityState) => void): void;
  
  // Unregister callback
  offActivityChange(callback: Function): void;
}

interface ActivityState {
  isIdle: boolean;
  timeSinceActivity: number; // milliseconds
  idleThreshold: number; // milliseconds
  pageIsLoading: boolean;
  pageLoadProgress: number; // 0-100%
  tabIsVisible: boolean;
  lastActivityType: 'mouse' | 'keyboard' | 'scroll' | 'none';
}

// Usage
const detector = new ActivityDetector({
  idleThreshold: 60000, // 60 seconds
  debounceDelay: 500
});

detector.onActivityChange((state) => {
  console.log(state.isIdle); // true if idle
});

detector.start();
```

#### Methods

```typescript
// Get if user is idle
detector.isIdle(): boolean;

// Get time since last activity
detector.timeSinceActivity(): number;

// Set idle threshold dynamically
detector.setIdleThreshold(ms: number): void;

// Check if page is loading
detector.isPageLoading(): boolean;

// Get page load progress
detector.getPageLoadProgress(): number; // 0-100

// Check if tab is visible
detector.isTabVisible(): boolean;
```

---

### 2. Adhkar Database Module

**Location**: `src/shared/storage/adhkarDB.ts`

#### AdhkarDatabase Class

```typescript
interface AdhkarDatabase {
  // Initialize database
  initialize(): Promise<void>;
  
  // Get all adhkar
  getAllAdhkar(): Promise<Adhkar[]>;
  
  // Get adhkar by category
  getByCategory(category: string): Promise<Adhkar[]>;
  
  // Get random adhkar
  getRandomAdhkar(): Promise<Adhkar>;
  
  // Get adhkar by ID
  getById(id: string): Promise<Adhkar | undefined>;
  
  // Search adhkar
  search(query: string): Promise<Adhkar[]>;
}

interface Adhkar {
  id: string;
  arabic: string;
  transliteration: string;
  english: string;
  category: 'morning' | 'evening' | 'sleep' | 'general' | 'work';
  source: string;
  frequency: 'once' | 'multiple';
  dua?: string;
  createdAt: number;
}

// Usage
const db = new AdhkarDatabase();
await db.initialize();

const adhkar = await db.getRandomAdhkar();
console.log(adhkar.arabic);
```

#### Progress Tracking

```typescript
interface AdhkarProgress {
  id: string;
  adhkarId: string;
  lastDisplayed: number; // timestamp
  displayCount: number;
  userRating?: 'liked' | 'disliked' | 'neutral';
}

// Add progress record
await db.logDisplay(adhkarId: string): Promise<void>;

// Get progress for adhkar
const progress = await db.getProgress(adhkarId): Promise<AdhkarProgress>;

// Rate adhkar
await db.rateAdhkar(adhkarId: string, rating: 'liked' | 'disliked'): Promise<void>;

// Get statistics
const stats = await db.getStatistics(): Promise<{
  totalDisplays: number;
  likedCount: number;
  dislikedCount: number;
  mostViewed: Adhkar[]
}>;
```

---

### 3. Quran Module

**Location**: `src/shared/quran/`

#### QuranData Class

```typescript
interface QuranData {
  // Get all surahs
  getAllSurahs(): Promise<Surah[]>;
  
  // Get surah by number
  getSurah(surahNumber: number): Promise<Surah>;
  
  // Get verse
  getVerse(surahNumber: number, verseNumber: number): Promise<Verse>;
  
  // Get verse range
  getVerseRange(surahNumber: number, start: number, end: number): Promise<Verse[]>;
  
  // Get all verses in surah
  getSurahVersees(surahNumber: number): Promise<Verse[]>;
}

interface Surah {
  number: number;
  name: string;
  englishName: string;
  ayahCount: number;
  revelationType: 'Meccan' | 'Medinan';
}

interface Verse {
  surahNumber: number;
  verseNumber: number;
  text: string; // Arabic text
  englishTranslation: string;
  transliteration: string;
}

// Usage
const quran = new QuranData();
await quran.initialize(); // Load Quran data

const surah = await quran.getSurah(1); // Surah Al-Fatiha
const verses = await quran.getVerseRange(1, 1, 7);
```

#### Memorized Surahs Management

```typescript
interface MemorizedSurah {
  surahNumber: number;
  surahName: string;
  verseCount: number;
  memorized: boolean;
  confidenceLevel: 'beginner' | 'intermediate' | 'advanced';
  startedDate: number;
  completedDate?: number;
}

// Mark surah as memorized
await quran.markMemorized(surahNumber: number): Promise<void>;

// Get memorized surahs
const memorized = await quran.getMemorizedSurahs(): Promise<MemorizedSurah[]>;

// Get random memorized surah
const random = await quran.getRandomMemorizedSurah(): Promise<MemorizedSurah>;

// Set confidence level
await quran.setConfidenceLevel(
  surahNumber: number,
  level: 'beginner' | 'intermediate' | 'advanced'
): Promise<void>;
```

---

### 4. Voice Recognition Module

**Location**: `src/shared/voice/voiceRecognizer.ts`

#### VoiceRecognizer Class

```typescript
interface VoiceRecognizer {
  // Check browser support
  isSupported(): boolean;
  
  // Start listening
  startListening(): Promise<void>;
  
  // Stop listening
  stopListening(): void;
  
  // Register callbacks
  onResult(callback: (result: RecognitionResult) => void): void;
  onError(callback: (error: string) => void): void;
  onEnd(callback: () => void): void;
}

interface RecognitionResult {
  transcript: string;
  confidence: number; // 0-1
  isFinal: boolean;
  interimTranscript: string;
}

// Usage
const recognizer = new VoiceRecognizer({
  language: 'ar-SA', // Arabic
  continuous: false
});

recognizer.onResult((result) => {
  console.log(result.transcript);
  console.log(`Confidence: ${result.confidence * 100}%`);
});

recognizer.onError((error) => {
  console.error(error);
});

await recognizer.startListening();
```

#### Verse Matching

```typescript
interface VerseMatcher {
  // Match transcript to expected verses
  match(
    transcript: string,
    expectedVerses: Verse[]
  ): Promise<MatchResult>;
}

interface MatchResult {
  confidence: number; // 0-1
  accuracy: number; // 0-100%
  matchedVerses: number; // How many verses matched
  suggestions: string[]; // Suggestions for correction
  fullTranscript: string;
}

// Usage
const matcher = new VerseMatcher();
const result = await matcher.match(userTranscript, expectedVerse);

if (result.confidence > 0.75) {
  console.log('Correct recitation!');
} else if (result.confidence > 0.5) {
  console.log('Partial match. Try again.');
  console.log(result.suggestions);
}
```

---

### 5. Smart Display Engine

**Location**: `src/background/smartEngine.ts`

#### SmartDisplayEngine Class

```typescript
interface SmartDisplayEngine {
  // Start monitoring for display opportunities
  start(): void;
  
  // Stop monitoring
  stop(): void;
  
  // Check if should display adhkar now
  shouldDisplayAdhkar(): Promise<boolean>;
  
  // Get next adhkar to display
  getNextAdhkar(): Promise<Adhkar>;
  
  // Register display callback
  onReadyToDisplay(callback: (adhkar: Adhkar) => void): void;
}

// Usage
const engine = new SmartDisplayEngine();

engine.onReadyToDisplay((adhkar) => {
  console.log('Time to display:', adhkar.arabic);
  // Send message to content script to show adhkar
});

engine.start(); // Start monitoring
```

#### Configuration

```typescript
interface EngineConfig {
  idleThreshold: number; // milliseconds
  displayProbability: number; // 0-100
  minDisplayInterval: number; // milliseconds
  enablePageLoadDetection: boolean;
  enableConcentrationDetection: boolean;
  userPreferences: UserPreferences;
}

// Update configuration
engine.configure({
  idleThreshold: 45000,
  displayProbability: 60,
  minDisplayInterval: 600000 // 10 minutes
});
```

---

### 6. Keyboard Shortcut Handler

**Location**: `src/background/shortcuts.ts`

#### ShortcutManager Class

```typescript
interface ShortcutManager {
  // Initialize shortcut listeners
  initialize(): void;
  
  // Register callback for shortcut
  onShortcut(
    shortcut: string,
    callback: () => void
  ): void;
  
  // Update shortcut binding
  updateShortcut(oldKey: string, newKey: string): Promise<void>;
  
  // Get all registered shortcuts
  getShortcuts(): Promise<ShortcutMap>;
}

interface ShortcutMap {
  [key: string]: string; // e.g., 'Ctrl+Shift+D' => 'toggleExtension'
}

// Usage
const shortcuts = new ShortcutManager();
shortcuts.initialize();

shortcuts.onShortcut('Ctrl+Shift+D', () => {
  console.log('Toggle extension');
});

shortcuts.onShortcut('Ctrl+Shift+Q', () => {
  console.log('Start Quran session');
});
```

---

### 7. User Preferences Storage

**Location**: `src/shared/storage/userPrefs.ts`

#### UserPreferences Class

```typescript
interface UserPreferencesStore {
  // Get all preferences
  getAll(): Promise<UserPreferences>;
  
  // Get specific preference
  get(key: string): Promise<any>;
  
  // Update preferences
  set(key: string, value: any): Promise<void>;
  
  // Reset to defaults
  reset(): Promise<void>;
  
  // Register change listener
  onChange(callback: (prefs: UserPreferences) => void): void;
}

interface UserPreferences {
  enabled: boolean;
  theme: 'light' | 'dark';
  language: 'ar' | 'en' | 'transliteration';
  
  // Activity Detection
  idleThreshold: number;
  displayProbability: number;
  minDisplayInterval: number;
  displayAggressiveness: 'conservative' | 'normal' | 'aggressive';
  
  // Features
  enableAdhkar: boolean;
  enableQuranSessions: boolean;
  enableVoiceRecognition: boolean;
  enableKeyboardShortcuts: boolean;
  
  // Categories
  adhkarCategories: {
    morning: boolean;
    evening: boolean;
    sleep: boolean;
    general: boolean;
    work: boolean;
  };
  
  // Voice
  voiceLanguage: string; // e.g., 'ar-SA'
  voiceConfidenceThreshold: number; // 0-1
  
  // Shortcuts (can be customized)
  shortcuts: {
    toggleExtension: string;
    showPanel: string;
    startQuranSession: string;
    toggleMicrophone: string;
  };
}

// Usage
const prefs = new UserPreferencesStore();

const all = await prefs.getAll();
console.log(all.theme); // 'light'

await prefs.set('theme', 'dark');

prefs.onChange((updated) => {
  console.log('Preferences updated:', updated);
});
```

---

### 8. Quran Session Manager

**Location**: `src/shared/quran/sessionManager.ts`

#### SessionManager Class

```typescript
interface SessionManager {
  // Create new session
  createSession(config: SessionConfig): Promise<QuranSession>;
  
  // Get active session
  getActiveSession(): Promise<QuranSession | null>;
  
  // Submit recitation result
  submitResult(sessionId: string, result: RecitationResult): Promise<void>;
  
  // End session
  endSession(sessionId: string): Promise<void>;
  
  // Get session history
  getHistory(limit?: number): Promise<QuranSession[]>;
  
  // Get statistics
  getStatistics(): Promise<SessionStatistics>;
}

interface QuranSession {
  id: string;
  surahNumber: number;
  surahName: string;
  startVerse: number;
  endVerse: number;
  displayStart: number;
  displayEnd: number;
  duration: number;
  completed: boolean;
  accuracy?: number; // 0-100
  recordedAudio?: Blob;
  transcript?: string;
  createdAt: number;
  updatedAt: number;
}

interface RecitationResult {
  transcript: string;
  confidence: number; // 0-1
  accuracy: number; // 0-100%
  matchedVerses: number;
}

interface SessionStatistics {
  totalSessions: number;
  averageAccuracy: number;
  completionRate: number; // 0-1
  timeSpent: number; // milliseconds
  mostPracticedSurah: number;
  recentSessions: QuranSession[];
}

// Usage
const manager = new SessionManager();

const session = await manager.createSession({
  surahNumber: 2, // Surah Al-Baqarah
});

// ... user recites ...

await manager.submitResult(session.id, {
  transcript: userTranscript,
  confidence: 0.92,
  accuracy: 95,
  matchedVerses: 20
});

const stats = await manager.getStatistics();
console.log(`Average accuracy: ${stats.averageAccuracy}%`);
```

---

## Testing Strategy

### Unit Tests

**Test Framework**: Vitest + React Testing Library

#### Activity Detection Tests

```typescript
// tests/unit/activityDetection.test.ts

describe('ActivityDetector', () => {
  let detector: ActivityDetector;
  
  beforeEach(() => {
    detector = new ActivityDetector({ idleThreshold: 1000 });
  });
  
  test('should detect idle after threshold', async () => {
    detector.start();
    await wait(1100);
    expect(detector.isIdle()).toBe(true);
  });
  
  test('should reset idle on user activity', async () => {
    detector.start();
    await wait(1100);
    expect(detector.isIdle()).toBe(true);
    
    simulateMouseMove();
    expect(detector.isIdle()).toBe(false);
  });
  
  test('should not report idle when tab is hidden', async () => {
    detector.start();
    document.hidden = true;
    
    await wait(1100);
    expect(detector.isIdle()).toBe(false);
  });
  
  test('should ignore activity in fullscreen mode', async () => {
    detector.start();
    document.fullscreenElement = document.body;
    
    await wait(1100);
    expect(detector.isIdle()).toBe(true);
  });
});
```

#### Adhkar Selection Tests

```typescript
// tests/unit/adhkarSelection.test.ts

describe('AdhkarSelection', () => {
  let db: AdhkarDatabase;
  let selector: AdhkarSelector;
  
  beforeEach(async () => {
    db = new AdhkarDatabase();
    await db.initialize();
    selector = new AdhkarSelector(db);
  });
  
  test('should respect category preferences', async () => {
    const prefs = { morning: true, evening: false, sleep: false };
    const adhkar = await selector.select(prefs);
    
    expect(adhkar.category).toBe('morning');
  });
  
  test('should deprioritize recently shown adhkar', async () => {
    const adhkar1 = await selector.select();
    const adhkar2 = await selector.select();
    
    expect(adhkar1.id).not.toBe(adhkar2.id);
  });
  
  test('should boost liked adhkar', async () => {
    const adhkarId = 'test-id';
    await db.rateAdhkar(adhkarId, 'liked');
    
    const selected = await selector.select();
    // Should have higher probability of being selected
    const selectedCount = await countSelections(adhkarId, 1000);
    expect(selectedCount).toBeGreaterThan(500);
  });
});
```

#### Voice Matching Tests

```typescript
// tests/unit/voiceMatching.test.ts

describe('VerseMatcher', () => {
  let matcher: VerseMatcher;
  let verses: Verse[];
  
  beforeEach(async () => {
    matcher = new VerseMatcher();
    verses = await getTestVerses();
  });
  
  test('should recognize exact match', async () => {
    const transcript = verses[0].text;
    const result = await matcher.match(transcript, [verses[0]]);
    
    expect(result.confidence).toBeGreaterThan(0.9);
    expect(result.accuracy).toBeGreaterThan(90);
  });
  
  test('should handle diacritical marks', async () => {
    const textWithDiacritics = 'الْحَمْدُ لِلَّهِ';
    const textWithoutDiacritics = 'الحمد لله';
    
    const result = await matcher.match(
      textWithoutDiacritics,
      [{ text: textWithDiacritics }]
    );
    
    expect(result.confidence).toBeGreaterThan(0.85);
  });
  
  test('should reject incorrect recitation', async () => {
    const transcript = 'completely wrong text';
    const result = await matcher.match(transcript, [verses[0]]);
    
    expect(result.confidence).toBeLessThan(0.5);
  });
  
  test('should handle partial matches', async () => {
    const transcript = verses[0].text.substring(0, 10) + ' wrong';
    const result = await matcher.match(transcript, [verses[0]]);
    
    expect(result.confidence).toBeGreaterThan(0.4);
    expect(result.confidence).toBeLessThan(0.8);
  });
});
```

### Integration Tests

**Test Framework**: Playwright

#### Adhkar Display Flow

```typescript
// tests/integration/adhkarFlow.test.ts

describe('Adhkar Display Flow', () => {
  let browser: Browser;
  let context: BrowserContext;
  
  beforeAll(async () => {
    browser = await chromium.launch();
    context = await browser.newContext();
    
    // Load extension
    await loadExtension(context, './dist');
  });
  
  afterAll(async () => {
    await context.close();
    await browser.close();
  });
  
  test('should display adhkar when idle', async () => {
    const page = await context.newPage();
    await page.goto('https://example.com');
    
    // Wait 61 seconds (default idle threshold + buffer)
    await page.waitForTimeout(61000);
    
    // Check for side panel with adhkar
    const sidepanel = await page.waitForSelector('[data-testid="adhkar-panel"]');
    expect(sidepanel).toBeTruthy();
    
    // Verify adhkar content
    const arabicText = await page.textContent('[data-testid="adhkar-arabic"]');
    expect(arabicText?.length).toBeGreaterThan(0);
  });
  
  test('should dismiss adhkar on button click', async () => {
    const page = await context.newPage();
    await page.goto('https://example.com');
    await page.waitForTimeout(61000);
    
    // Click dismiss button
    await page.click('[data-testid="dismiss-button"]');
    
    // Verify panel is hidden
    const sidepanel = await page.$('[data-testid="adhkar-panel"]');
    expect(sidepanel).toBeNull();
  });
  
  test('should respect category preferences', async () => {
    const page = await context.newPage();
    
    // Disable evening and work categories
    await disableCategory('evening');
    await disableCategory('work');
    
    // Trigger 10 displays
    let eveningCount = 0;
    for (let i = 0; i < 10; i++) {
      await triggerDisplay();
      const category = await getDisplayedAdhkarCategory();
      if (category === 'evening' || category === 'work') {
        eveningCount++;
      }
    }
    
    // Should never show disabled categories
    expect(eveningCount).toBe(0);
  });
});
```

#### Quran Session Flow

```typescript
// tests/integration/quranSessionFlow.test.ts

describe('Quran Session Flow', () => {
  test('should create session with random verse', async () => {
    const session = await manager.createSession({ surahNumber: 2 });
    
    expect(session.surahNumber).toBe(2);
    expect(session.startVerse).toBeGreaterThanOrEqual(1);
    expect(session.startVerse).toBeLessThanOrEqual(286 - 5);
  });
  
  test('should complete session with voice recitation', async () => {
    const session = await manager.createSession({ surahNumber: 1 });
    
    // Simulate voice input
    const userTranscript = await getVerseText(1, session.startVerse, 7);
    
    await manager.submitResult(session.id, {
      transcript: userTranscript,
      confidence: 0.95,
      accuracy: 98,
      matchedVerses: 7
    });
    
    const updated = await manager.getActiveSession();
    expect(updated?.completed).toBe(true);
    expect(updated?.accuracy).toBeGreaterThan(95);
  });
  
  test('should allow manual completion', async () => {
    const session = await manager.createSession({ surahNumber: 1 });
    
    await manager.submitResult(session.id, {
      transcript: '',
      confidence: 0,
      accuracy: 100,
      matchedVerses: 7,
      manualCompletion: true
    });
    
    expect((await manager.getActiveSession())?.completed).toBe(true);
  });
});
```

### E2E Tests

```typescript
// tests/e2e/fullFlow.test.ts

describe('Full User Journey', () => {
  test('complete adhkar and quran workflow', async () => {
    // 1. Install extension
    // 2. Configure memorized surahs
    // 3. Wait for adhkar display
    // 4. Like an adhkar
    // 5. Start Quran session
    // 6. Complete recitation
    // 7. View statistics
    // 8. Export data
  });
});
```

### Test Coverage Goals

```
Overall: > 70%
├── Unit: 85%
├── Integration: 60%
└── E2E: Smoke tests

Critical Paths (100%):
├── Activity Detection
├── Adhkar Selection
├── Voice Matching
├── Quran Sessions
└── Keyboard Shortcuts
```

---

## Performance Benchmarks

### Load Times

| Metric | Target | Acceptable |
|--------|--------|-----------|
| Extension init | <500ms | <1s |
| Side panel open | <300ms | <500ms |
| Adhkar display | <200ms | <400ms |
| Voice recognition | <2s | <5s |
| Query 200 adhkar | <100ms | <200ms |

### Memory Usage

- Background service worker: <20MB
- Content script: <10MB
- Side panel (React): <30MB

### Storage

- Quran data: ~5MB
- Adhkar database: ~1MB
- User data (1 year history): <5MB
- Total quota used: <15MB / 50MB available

---

## Continuous Integration

### GitHub Actions Workflow

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
      - run: npm run test:unit
      - run: npm run test:integration
      - uses: codecov/codecov-action@v3
```

---

**Last Updated**: March 1, 2026
