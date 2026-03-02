# Dhikrtop - Comprehensive Development Plan

## Executive Summary

**Dhikrtop** is a browser extension that intelligently detects optimal moments to display Islamic adhkar (remembrances) and provides a Quran memorization aide feature with voice integration and keyboard shortcuts.

---

## Phase 1: Project Foundation & MVP Setup (Weeks 1-2)

### 1.1 Technology Stack

#### Frontend
- **Build Tool:** Vite (fast, minimal config)
- **Language:** TypeScript
- **UI Framework:** React 18+
- **CSS:** Tailwind CSS + CSS Modules
- **Extension Framework:** Chrome Manifest v3 (WXT wrapper optional)

#### Backend/Data
- **Local Storage:** IndexedDB + Chrome Storage API
- **Voice API:** Web Speech API (browser native)
- **Cross-origin:** Consider Firebase for future cloud sync (Phase 4)

#### Testing & Build
- **Unit Testing:** Vitest + React Testing Library
- **Integration:** Playwright (extension testing)
- **Build:** Webpack/Vite with extension manifest builder
- **CI/CD:** GitHub Actions

### 1.2 Project Structure

```
/dhikrtop
├── src/
│   ├── background/          # Service worker (MV3)
│   │   ├── index.ts
│   │   ├── listeners.ts
│   │   └── storage.ts
│   ├── content/            # Content scripts
│   │   └── index.ts
│   ├── popup/              # Extension popup UI
│   │   ├── App.tsx
│   │   ├── index.tsx
│   │   └── styles/
│   ├── options/            # Settings page
│   │   ├── App.tsx
│   │   ├── index.tsx
│   │   └── styles/
│   ├── sidepanel/          # Side panel UI (new adhkar display)
│   │   ├── App.tsx
│   │   ├── index.tsx
│   │   └── styles/
│   ├── shared/             # Shared utilities
│   │   ├── types.ts
│   │   ├── constants.ts
│   │   ├── storage/
│   │   │   ├── adhkarDB.ts
│   │   │   └── userPrefs.ts
│   │   └── utils/
│   │       ├── logger.ts
│   │       └── helpers.ts
│   └── manifest.json       # Chrome extension manifest
├── docs/                   # Documentation
│   ├── COMPREHENSIVE_PLAN.md
│   ├── ARCHITECTURE.md
│   ├── ALGORITHMS.md
│   ├── API.md
│   └── USER_GUIDE.md
├── tests/                  # Test files
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── public/                 # Static assets
│   └── icons/
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
└── package.json
```

### 1.3 Setup Tasks

- [ ] Initialize Node.js project with TypeScript
- [ ] Configure Vite with Chrome extension plugin (or WXT)
- [ ] Set up React + Tailwind CSS
- [ ] Create Chrome Manifest v3 configuration
- [ ] Initialize Git and GitHub repo
- [ ] Set up GitHub Actions for CI/CD
- [ ] Create base ESLint + Prettier config

---

## Phase 2: Core Intelligence & Adhkar System (Weeks 3-5)

### 2.1 Smart Detection Engine

#### Activity Detection Module
```
Activity Detection Strategy:
├── Idle Detection
│   ├── No mouse/keyboard input (configurable: 30s-5m)
│   ├── Tab visibility detection (focus/blur)
│   └── Page scroll inactivity
├── Page Load Detection
│   ├── Monitor network activity (slow pages)
│   ├── Detect "loading" states (skeleton screens, spinners)
│   └── Monitor DOM changes for load completeness
└── Concentration Detection (Phase 2+)
    ├── Input frequency heuristics
    ├── Scroll pattern analysis
    └── Time-of-day patterns
```

#### Implementation Tasks
- [ ] Create `ActivityDetector` class with event listeners
- [ ] Implement idle timer (configurable)
- [ ] Add page load detection via PerformanceObserver API
- [ ] Build detection module interface for extensibility
- [ ] Write unit tests for each detection type

### 2.2 Adhkar Database & Management

#### Data Structure
```typescript
interface Adhkar {
  id: string;
  arabic: string;
  transliteration: string;
  english: string;
  category: 'morning' | 'evening' | 'sleep' | 'general' | 'work';
  source: string; // e.g., "Sahih Al-Bukhari"
  frequency: 'once' | 'multiple';
  dua?: string;
}

interface AdhkarProgress {
  adhkarId: string;
  lastDisplayed: number; // timestamp
  displayCount: number;
  userRating?: 'liked' | 'disliked' | 'neutral';
}
```

#### Tasks
- [ ] Create adhkar database seed file (~200 common adhkar)
- [ ] Implement IndexedDB schema and CRUD operations
- [ ] Build adhkar selection algorithm (smart rotation)
- [ ] Track user preferences per adhkar
- [ ] Write tests for data persistence

### 2.3 Notification & Display System

#### UI Components
1. **Side Panel** (primary display location)
   - Arabic text with large font
   - English translation
   - Transliteration toggle
   - Audio playback (optional Phase 2.5)

2. **Popup Icon** (indicator)
   - Badge with count of unseen adhkar
   - Quick access to current adhkar

3. **Customization Panel**
   - Enable/disable specific categories
   - Notification frequency
   - Display duration
   - Sound toggle

#### Implementation Tasks
- [ ] Design side panel React component
- [ ] Implement dark/light theme toggle
- [ ] Add category filters
- [ ] Build trigger mechanism (call from background service worker)
- [ ] Create dismiss/snooze functionality
- [ ] Write E2E tests for UI flow

---

## Phase 3: Quran Memorization Module & Advanced Controls (Weeks 6-8)

### 3.1 Surah Management System

#### Data Structure
```typescript
interface UserMemorizedSurah {
  surahNumber: number;
  surahName: string;
  verseCount: number;
  memorized: boolean;
  startedDate: number;
  completedDate?: number;
  confidenceLevel: 'beginner' | 'intermediate' | 'advanced'; // 0-100
}

interface QuranSession {
  id: string;
  surahNumber: number;
  startVerse: number;
  endVerse: number;
  duration: number;
  completed: boolean;
  recordedAudio?: Blob;
  accuracy?: number; // 0-100
  createdAt: number;
}
```

#### Tasks
- [ ] Integrate Quran data (API: quran.com API or local JSON)
- [ ] Create surah selection UI (mark which surahs you've memorized)
- [ ] Implement memorized surah storage in IndexedDB
- [ ] Build random verse selection algorithm
- [ ] Write tests for surah data management

### 3.2 Memorization Session Engine

#### Algorithm
```
Session Trigger Decision:
1. Check if user has any memorized surahs
2. Check idle/activity detection
3. Random surah selection from memorized list
4. Random starting verse within surah (±10 verses from start)
5. Display verses and prompt user to continue
6. Record session metadata
7. Optional: Voice recording + evaluation
```

#### Implementation Tasks
- [ ] Build SessionEngine class
- [ ] Implement random surah/verse selection
- [ ] Create verse display UI component
- [ ] Add session timer
- [ ] Integrate Web Speech API for voice input
- [ ] Implement completion detection logic

### 3.3 Voice Integration & Recitation

#### Web Speech API Integration
```typescript
interface RecitationResult {
  transcript: string;
  confidence: number; // 0-1
  isFinal: boolean;
  verses: VerseMatch[];
}
```

#### Tasks
- [ ] Implement speech recognition listener
- [ ] Add microphone permission handling
- [ ] Build transcript-to-verse matching algorithm
- [ ] Create confidence scoring
- [ ] Add fallback for manual completion
- [ ] Write tests for speech recognition flow

### 3.4 User Controls Layer

#### Keyboard Shortcuts
```
Ctrl+Shift+D     -> Toggle extension on/off
Ctrl+Shift+A     -> Show/hide side panel
Ctrl+Shift+Q     -> Start Quran session
Ctrl+Shift+M     -> Toggle microphone
Space            -> Pause/resume session (when focused)
```

#### Implementation Tasks
- [ ] Create keyboard handler module
- [ ] Implement background service worker listeners
- [ ] Add shortcut customization in settings
- [ ] Write tests for keyboard input
- [ ] Add onboarding UI showing shortcuts

#### Settings Panel Features
- [ ] Toggle detection types (idle, load, concentration)
- [ ] Adjust detection thresholds
- [ ] Category preferences for adhkar
- [ ] Audio/sound preferences
- [ ] Keyboard shortcut customization
- [ ] About/help section

---

## Phase 4: Advanced Features & Deployment (Weeks 9-10)

### 4.1 Analytics & Telemetry

#### Metrics to Track (Optional, User-consent based)
- Adhkar display frequency and engagement
- Session duration and completion rate
- Voice recognition accuracy trends
- Most viewed adhkar categories

#### Implementation
- [ ] Implement telemetry module (privacy-first)
- [ ] Add opt-in dialog
- [ ] Create dashboard in options page
- [ ] Data retention policy (90 days local only)

### 4.2 Cloud Sync (Optional Phase 4.5)

#### Firebase Integration
- [ ] Implement Firebase authentication (optional)
- [ ] Sync user preferences across devices
- [ ] Cloud backup of memorization progress
- [ ] Cross-device session history

### 4.3 Testing & QA

#### Test Strategy
```
Unit Tests (60% coverage):
├── Activity detection logic
├── Adhkar selection algorithm
├── Storage operations
├── Voice recognition matching
└── Keyboard shortcut handling

Integration Tests (40% coverage):
├── End-to-end adhkar flow
├── Quran session lifecycle
├── Settings persistence
└── Voice recording + recognition
```

#### Tasks
- [ ] Write unit tests for core modules
- [ ] Write integration tests for user flows
- [ ] Test cross-browser compatibility (Chrome, Edge, Brave)
- [ ] Load testing for background service worker
- [ ] Accessibility audit (WCAG 2.1 AA)

### 4.4 Documentation & User Guides

#### Documentation Files
- [ ] API Reference (`API.md`)
- [ ] User Manual (`USER_GUIDE.md`)
- [ ] Architecture Deep-dive (`ARCHITECTURE.md`)
- [ ] Algorithm Specifications (`ALGORITHMS.md`)
- [ ] Developer Setup (`DEVELOPER_SETUP.md`)

### 4.5 Deployment & Chrome Web Store

#### Pre-deployment Tasks
- [ ] Final code review
- [ ] Security audit (XSS, data privacy)
- [ ] Performance optimization
- [ ] Create store listing copy & screenshots
- [ ] Prepare privacy policy

#### Deployment
- [ ] Package extension for Chrome Web Store
- [ ] Submit to review process
- [ ] Create release notes
- [ ] Set up automatic updates

---

## Key Algorithms Breakdown

### 1. Smart Display Timing Algorithm

```
Function: ShouldDisplayAdhkar()
  IF user.isIdle(threshold: 30s-5m) AND browser.isActive THEN
    IF random(0, 100) < user.displayProbability THEN
      IF lastDisplayedAdhkar > user.minDisplayInterval THEN
        SELECT adhkar FROM database BASED ON:
          - User preferences (categories)
          - Time of day
          - Adhkar frequency (already displayed today?)
          - Last displayed timestamp
        RETURN selected_adhkar
      ELSE
        RETURN null (too soon)
    ELSE
      RETURN null (random probability not met)
  ELSE
    RETURN null (not idle or browser not active)
```

### 2. Quran Session Randomization

```
Function: GenerateQuranSession(surah: number)
  total_verses = Quran[surah].total_verses
  start_verse = random(1, max(1, total_verses - 10))
  session = {
    surah: surah,
    start_verse: start_verse,
    display_range: [start_verse, start_verse + 10], // Display ~10 verses as context
    required_range: [start_verse, total_verses] // User must complete to end
  }
  RETURN session
```

### 3. Voice Recognition Confidence Scoring

```
Function: EvaluateRecitation(transcript, expected_verses)
  raw_similarity = levenshteinDistance(transcript, expected_verses)
  normalized_score = 1 - (raw_similarity / expected_verses.length)
  
  confidence = normalized_score * speech_recognition_confidence
  
  IF confidence > 0.75 THEN
    status = 'CORRECT'
  ELSE IF confidence > 0.5 THEN
    status = 'PARTIAL'
  ELSE
    status = 'INCORRECT'
    
  RETURN { confidence, status, transcript }
```

---

## Development Milestones

| Phase | Timeline | Key Deliverables | MVP? |
|-------|----------|------------------|------|
| 1 | Weeks 1-2 | Project setup, build pipeline, basic UI | No |
| 2 | Weeks 3-5 | Detection engine, adhkar system, notifications | **YES** |
| 3 | Weeks 6-8 | Quran sessions, voice, keyboard shortcuts | Enhanced |
| 4 | Weeks 9-10 | Testing, documentation, deployment | Final |

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Web Speech API support varies | High | Use fallback for manual completion |
| Background service worker limitations (MV3) | Medium | Use Chrome's declarative handlers where possible |
| IndexedDB quota limits | Low | Compress voice recordings; limit session history to 30 days |
| Cross-site script injection via content script | High | Strict CSP policy; sanitize user input; use message passing |
| Performance of activity detection | Medium | Debounce listeners; use efficient DOM queries |

---

## Success Metrics

1. **User Engagement:** >3 adhkar views per session
2. **Quran Sessions:** >50% completion rate
3. **Voice Accuracy:** >75% confidence threshold met
4. **Load Time:** <500ms side panel open
5. **Extension Size:** <2MB unpacked
6. **Test Coverage:** >70% code coverage

---

## Next Steps

1. Review and confirm tech stack preferences
2. Create initial setup branch with tooling
3. Design adhkar database content
4. Begin Phase 1 implementation
5. Weekly sprint reviews and adjustments
