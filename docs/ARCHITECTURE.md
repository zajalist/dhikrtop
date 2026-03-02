# Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Chrome Browser                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Background Service Worker (MV3)             │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │ Activity Detection Engine                      │  │   │
│  │  │ - Idle detector                                │  │   │
│  │  │ - Page load detector                           │  │   │
│  │  │ - Concentration heuristics                     │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │                        ↓                              │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │ Smart Display Algorithm                        │  │   │
│  │  │ - Trigger decision engine                      │  │   │
│  │  │ - Quran session generator                      │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │                        ↓                              │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │ Message Router                                 │  │   │
│  │  │ - Keyboard shortcut handler                    │  │   │
│  │  │ - Content script communicator                  │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Content Script                          │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │ DOM Injector                                   │  │   │
│  │  │ - Side panel container                        │  │   │
│  │  │ - Overlay notifier                            │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                 UI Layer (React)                     │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │   │
│  │  │ Side Panel  │  │   Popup     │  │   Options   │  │   │
│  │  │ - Adhkar    │  │  - Quick    │  │  - Settings │  │   │
│  │  │   display   │  │    access   │  │  - Prefs    │  │   │
│  │  │ - Quran     │  │  - Toggle   │  │  - Stats    │  │   │
│  │  │   sessions  │  │             │  │             │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Data Layer                             │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │ IndexedDB                                      │  │   │
│  │  │ - Adhkar database                             │  │   │
│  │  │ - User progress                               │  │   │
│  │  │ - Session history                             │  │   │
│  │  │ - Voice recordings (temporary)                │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │                        ↕                              │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │ Chrome Storage API                             │  │   │
│  │  │ - User preferences                            │  │   │
│  │  │ - Settings                                    │  │   │
│  │  │ - State (enabled/disabled)                    │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### Adhkar Display Flow

```
Background Service Worker
  ↓
Checks Activity Detection
  ├─ Idle for X seconds?
  ├─ Page is loaded?
  └─ Browser window focused?
  ↓ (All true)
Smart Display Algorithm
  ├─ Select adhkar from DB (based on preferences)
  ├─ Check minimum display interval
  └─ Generate trigger event
  ↓
Message Router
  ├─ Send message to content script
  └─ Pass adhkar data
  ↓
Content Script
  ├─ Inject side panel if not present
  └─ Send data to React component
  ↓
Side Panel React Component
  ├─ Display adhkar (Arabic + translation)
  ├─ Show dismiss/snooze/like buttons
  └─ Log interaction to DB
  ↓
IndexedDB
  └─ Update adhkar progress
```

### Quran Session Flow

```
User Triggers Session (keyboard shortcut or manual)
  ↓
Background Service Worker
  ├─ Check for memorized surahs
  ├─ Random surah selection
  └─ Calculate random starting verse
  ↓
Message Router
  └─ Send session data to content script
  ↓
Content Script
  └─ Activate side panel with session UI
  ↓
Session Component
  ├─ Display current verse range
  ├─ Show prompt: "Continue from here"
  ├─ Start microphone if enabled
  └─ Record user input/recitation
  ↓
Voice Recognition Engine (Web Speech API)
  ├─ Convert speech to text
  ├─ Match against expected verses
  └─ Calculate confidence score
  ↓
Session Logic
  ├─ If confidence > 75%: Mark as correct, advance verse
  ├─ If confidence 50-75%: Show partial match, offer retry
  └─ If confidence < 50%: Show mismatch, offer manual completion
  ↓
Session Complete
  └─ Save session to IndexedDB with stats
```

## Module Responsibilities

### Background Service Worker (`src/background/`)
- **Activity Detection**: Monitor user activity and page states
- **Trigger Engine**: Decide when to show adhkar or start Quran sessions
- **Event Handling**: Listen for keyboard shortcuts and messages
- **Data Synchronization**: Sync changes to IndexedDB

### Content Script (`src/content/`)
- **DOM Manipulation**: Inject UI containers into page
- **Message Passing**: Bridge between background and UI
- **Page Analysis**: Gather page state information for activity detection

### Popup UI (`src/popup/`)
- **Quick Access**: Show current adhkar or session status
- **Toggle Controls**: Enable/disable extension
- **Badge**: Display unseen adhkar count

### Options Page (`src/options/`)
- **Settings**: User preferences and customization
- **Data Management**: View/export history and progress
- **Keyboard Shortcuts**: Customize shortcuts
- **About/Help**: Documentation and troubleshooting

### Side Panel (`src/sidepanel/`)
- **Primary Display**: Main area for adhkar and Quran sessions
- **Theme Toggle**: Dark/light mode
- **Interactions**: Dismiss, snooze, rate adhkar
- **Session Management**: Quran memorization UI

### Shared Module (`src/shared/`)
- **Types**: TypeScript interfaces for all data structures
- **Constants**: Enum values, default settings
- **Storage Layer**: IndexedDB and Chrome Storage API wrappers
- **Utilities**: Helper functions and loggers

## Storage Schema

### IndexedDB

#### Store: `adhkar`
```javascript
{
  keyPath: 'id',
  indexes: [
    { name: 'category', unique: false },
    { name: 'lastDisplayed', unique: false }
  ]
}
// Record:
{
  id: string,
  arabic: string,
  english: string,
  transliteration: string,
  category: string,
  source: string,
  frequency: string
}
```

#### Store: `adhkarProgress`
```javascript
{
  keyPath: 'id',
  indexes: [
    { name: 'adhkarId', unique: false },
    { name: 'lastDisplayed', unique: false }
  ]
}
// Record:
{
  id: string,
  adhkarId: string,
  lastDisplayed: number,
  displayCount: number,
  userRating: 'liked' | 'disliked' | 'neutral'
}
```

#### Store: `memorizedSurahs`
```javascript
{
  keyPath: 'surahNumber'
}
// Record:
{
  surahNumber: number,
  surahName: string,
  verseCount: number,
  memorized: boolean,
  confidenceLevel: 'beginner' | 'intermediate' | 'advanced',
  startedDate: number,
  completedDate: number | null
}
```

#### Store: `quranSessions`
```javascript
{
  keyPath: 'id',
  indexes: [
    { name: 'surahNumber', unique: false },
    { name: 'createdAt', unique: false }
  ]
}
// Record:
{
  id: string,
  surahNumber: number,
  startVerse: number,
  endVerse: number,
  duration: number,
  completed: boolean,
  recordedAudio: Blob | null,
  accuracy: number | null,
  createdAt: number,
  transcript: string | null
}
```

### Chrome Storage API (Sync)

```javascript
{
  // User Preferences
  enabled: boolean,
  theme: 'light' | 'dark',
  displayProbability: number (0-100),
  minDisplayInterval: number (seconds),
  
  // Feature Toggles
  features: {
    adhkardisplay: boolean,
    quranMemorization: boolean,
    voiceRecognition: boolean,
    keyboardShortcuts: boolean,
    analytics: boolean
  },
  
  // Category Preferences
  adhkarCategories: {
    morning: boolean,
    evening: boolean,
    sleep: boolean,
    general: boolean,
    work: boolean
  },
  
  // Keyboard Shortcuts
  shortcuts: {
    toggleExtension: 'Ctrl+Shift+D',
    showPanel: 'Ctrl+Shift+A',
    startQuranSession: 'Ctrl+Shift+Q',
    toggleMicrophone: 'Ctrl+Shift+M'
  }
}
```

## Communication Patterns

### Message Types

#### `DISPLAY_ADHKAR`
```javascript
{
  type: 'DISPLAY_ADHKAR',
  payload: {
    adhkarId: string,
    adhkar: AdhkarRecord
  }
}
```

#### `START_QURAN_SESSION`
```javascript
{
  type: 'START_QURAN_SESSION',
  payload: {
    sessionId: string,
    surahNumber: number,
    startVerse: number,
    endVerse: number
  }
}
```

#### `TOGGLE_EXTENSION`
```javascript
{
  type: 'TOGGLE_EXTENSION',
  payload: {
    enabled: boolean
  }
}
```

#### `UPDATE_SESSION_RESULT`
```javascript
{
  type: 'UPDATE_SESSION_RESULT',
  payload: {
    sessionId: string,
    completed: boolean,
    accuracy: number,
    transcript: string
  }
}
```

## Security Considerations

1. **Content Security Policy (CSP)**
   - Restrict inline scripts
   - Allow only necessary external resources
   - No `eval()` or dynamic code execution

2. **Data Privacy**
   - No analytics by default (user opt-in)
   - No cloud sync without explicit user consent
   - Local-first data storage
   - Auto-delete voice recordings after session

3. **Input Validation**
   - Sanitize all user input from forms
   - Validate Quran verse ranges
   - Verify voice transcript matches expected format

4. **Permissions**
   - Request microphone only when needed
   - Minimum required Chrome permissions
   - Clear permission prompts for users

## Performance Optimizations

1. **Background Service Worker**
   - Minimize wake-up frequency
   - Use debounced event listeners
   - Lazy load detection modules

2. **UI Rendering**
   - React.memo for components
   - Virtualization for long lists (session history)
   - CSS animations instead of JS animations

3. **Storage**
   - Index frequently queried fields
   - Batch writes to IndexedDB
   - Compress old voice recordings

4. **Memory**
   - Cleanup event listeners
   - Release voice recording resources
   - Limit session history to 30 days
