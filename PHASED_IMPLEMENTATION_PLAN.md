# 🚀 Dhikrtop v0.2+ Phased Implementation Plan

**Created**: March 2, 2026  
**Current Version**: v0.1.0 (Production Ready - Tray App)  
**Target Release**: v0.2.0 (6-8 weeks)  
**Team**: Solo Development  
**Timeline**: Parallel execution of all 3 phases

---

## 📋 Executive Overview

Dhikrtop v0.1.0 is **production-ready** as a Windows tray app with core adhkar, Quran snippets, and beautiful UI. Your strategic direction:

1. **Prioritize equally** all three phases (database, voice, ML integration)
2. **v0.2.0 ships WITHOUT ML** - ML features added in v0.2.1 (when datasets finish downloading)
3. **Pull all 114 Surahs** from Quran.com API for complete Quran Reader
4. **Solo development** - focus on highest-impact features
5. **Sync with origin/main** before starting

---

## ✅ Pre-Implementation: Git Sync

### Current Status
- ✅ Repository: https://github.com/zajalist/dhikrtop.git
- ✅ Branch: main
- ✅ Remote configured: origin
- ✅ .gitignore: properly configured
- ⏳ **ACTION**: Pull latest from origin/main and check for conflicts

### Sync Steps (Execute in terminal)
```bash
cd /home/zajalist/projects/dhikrtop

# 1. Check status
git status

# 2. Stash any uncommitted changes (if any)
git stash

# 3. Fetch latest from origin
git fetch origin

# 4. Pull latest from main
git pull origin main

# 5. If you stashed, restore when ready
git stash pop

# 6. Verify all dependencies
npm install
cargo build --release  # (optional, just to verify)
```

---

# 🎯 Phase 0: Database Foundation (Weeks 1-2)

## Objective
Migrate from localStorage → SQLite persistent database. This is critical because current data is lost on app restart.

### Why This Phase First?
- ✅ Unblocks all subsequent features (voice recordings, progress tracking, analytics need persistence)
- ✅ Foundation for cloud sync (Phase 4)
- ✅ Enables reliable state management across updates
- ✅ Necessary for analytics and user metrics

### Tasks

#### Task 0.1: SQLite Schema Design
**File**: `src-tauri/src/schema.rs` (NEW)

```rust
// Core tables
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    language TEXT DEFAULT 'en',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS adhkar_progress (
    id INTEGER PRIMARY KEY,
    user_id TEXT NOT NULL,
    adhkar_id TEXT NOT NULL,
    display_count INTEGER DEFAULT 0,
    last_displayed INTEGER,
    user_rating TEXT, -- 'liked' | 'disliked' | 'neutral'
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS app_settings (
    user_id TEXT PRIMARY KEY,
    reminder_interval INTEGER DEFAULT 60, -- minutes
    enable_notifications BOOLEAN DEFAULT 1,
    enable_sound BOOLEAN DEFAULT 1,
    quiet_hours_start TEXT, -- HH:MM
    quiet_hours_end TEXT,
    language TEXT DEFAULT 'en',
    theme TEXT DEFAULT 'dark',
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS quran_progress (
    id INTEGER PRIMARY KEY,
    user_id TEXT NOT NULL,
    surah_number INTEGER NOT NULL,
    verse_number INTEGER NOT NULL,
    last_read INTEGER,
    read_count INTEGER DEFAULT 0,
    bookmarked BOOLEAN DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS voice_recordings (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    surah_number INTEGER NOT NULL,
    verse_number INTEGER NOT NULL,
    audio_data BLOB NOT NULL,
    duration REAL,
    confidence_score REAL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**Success Criteria**:
- [ ] Schema file created with all 5 tables
- [ ] Foreign key constraints verified
- [ ] Indexes added for common queries
- [ ] Migration script tested

#### Task 0.2: Rust Backend - Database Module
**File**: `src-tauri/src/db.rs` (NEW)

Implement SQLite connection pool and CRUD operations:
```rust
pub struct DbPool {
    pool: SqlitePool,
}

impl DbPool {
    pub async fn new(db_path: &str) -> Result<Self>;
    pub async fn migrate(&self) -> Result<()>;
}

// CRUD operations
pub async fn get_user(id: &str) -> Result<User>;
pub async fn save_adhkar_progress(progress: AdhkarProgress) -> Result<()>;
pub async fn get_quran_progress(user_id: &str) -> Result<Vec<QuranProgress>>;
pub async fn save_app_settings(settings: AppSettings) -> Result<()>;
pub async fn save_voice_recording(recording: VoiceRecording) -> Result<()>;
```

**Success Criteria**:
- [ ] Database module compiles without errors
- [ ] Connection pooling implemented
- [ ] All CRUD functions working
- [ ] Tests passing

#### Task 0.3: Tauri Commands - Expose Database
**File**: `src-tauri/src/commands.rs` (UPDATE)

Add new Tauri commands:
```rust
#[tauri::command]
pub async fn db_save_progress(adhkar_id: String, rating: String) -> Result<()>;

#[tauri::command]
pub async fn db_get_settings(user_id: String) -> Result<AppSettings>;

#[tauri::command]
pub async fn db_save_quran_progress(surah: i32, verse: i32) -> Result<()>;

#[tauri::command]
pub async fn db_save_voice_recording(recording: VoiceRecordingData) -> Result<String>;
```

**Success Criteria**:
- [ ] All commands callable from React frontend
- [ ] Error handling robust
- [ ] Type safety maintained

#### Task 0.4: React Frontend - Database Hooks
**File**: `src/lib/useDatabase.ts` (NEW)

TypeScript hooks for database access:
```typescript
export function useAdhkarProgress() {
  const saveProgress = async (adhkarId: string, rating: 'liked' | 'disliked' | 'neutral') => {
    return invoke('db_save_progress', { adhkarId, rating });
  };
  return { saveProgress };
}

export function useQuranProgress() {
  const saveProgress = async (surahNum: number, verseNum: number) => {
    return invoke('db_save_quran_progress', { surah: surahNum, verse: verseNum });
  };
  return { saveProgress };
}

export function useVoiceRecording() {
  const save = async (audioBlob: Blob, surah: number, verse: number) => {
    return invoke('db_save_voice_recording', { /*...*/ });
  };
  return { save };
}
```

**Success Criteria**:
- [ ] Hooks properly typed
- [ ] Error handling
- [ ] State management integrated

#### Task 0.5: Migrate Existing localStorage
**File**: `src/lib/migration.ts` (NEW)

One-time migration from localStorage → SQLite:
```typescript
export async function migrateLocalStorageToDatabase() {
  // Get all localStorage data
  const setupComplete = localStorage.getItem('dhikr_setup_complete');
  const userPrefs = localStorage.getItem('dhikr_user_prefs');
  const progress = localStorage.getItem('dhikr_progress');
  
  // Save to database
  if (userPrefs) {
    await invoke('db_save_settings', JSON.parse(userPrefs));
  }
  
  // Clear localStorage after successful migration
  // (keep backup for 1 version)
  
  // Mark migration complete
  localStorage.setItem('dhikr_db_migrated', 'true');
}
```

**Success Criteria**:
- [ ] All localStorage data migrated
- [ ] Rollback tested
- [ ] One-time execution verified

#### Task 0.6: QuranReader - Complete 114 Surahs
**File**: `src/lib/useQuranAPI.ts` (NEW) + `src/components/quran/QuranReader.tsx` (UPDATE)

Pull all 114 Surahs from Quran.com API:
```typescript
export async function fetchAllSurahs() {
  // Use: https://api.alquran.cloud/v1/surah
  // Fetches full Quran metadata
  const response = await fetch('https://api.alquran.cloud/v1/surah');
  const data = await response.json();
  
  // Caches in indexedDB for offline
  await cacheQuranData(data);
  
  return data;
}

export async function fetchSurahWithAya(surahNum: number) {
  // https://api.alquran.cloud/v1/surah/{surahNum}/en.asad
  return fetch(`https://api.alquran.cloud/v1/surah/${surahNum}/en.asad`)
    .then(r => r.json());
}
```

**Success Criteria**:
- [ ] All 114 Surahs loadable
- [ ] API caching working
- [ ] Offline mode verified
- [ ] QuranReader shows all Surahs

#### Task 0.7: Database Testing
**File**: `tests/database.test.ts` (NEW)

```typescript
describe('Database Operations', () => {
  test('should migrate localStorage data', async () => { /*...*/ });
  test('should save and retrieve adhkar progress', async () => { /*...*/ });
  test('should handle concurrent writes', async () => { /*...*/ });
  test('should retrieve Quran progress by user', async () => { /*...*/ });
});
```

**Success Criteria**:
- [ ] All tests passing
- [ ] Code coverage > 80%
- [ ] Edge cases handled

### Phase 0 Deliverables
- ✅ SQLite schema with 5 core tables
- ✅ Rust database module with connection pooling
- ✅ 10+ Tauri commands exposed to frontend
- ✅ React hooks for database access
- ✅ localStorage → SQLite migration script
- ✅ All 114 Surahs from Quran.com API
- ✅ Tests covering all major operations
- ✅ **Ready for**: Phase 1 (analytics), Phase 2 (voice recordings), Phase 4 (cloud sync)

### Phase 0 Timeline: **Weeks 1-2**

---

# 🎙️ Phase 1: Voice & Audio Integration (Weeks 2-4, Parallel)

## Objective
Add voice recording, playback, and speech-to-text validation for Quran recitation testing.

### Why Parallel?
- ✅ Independent from Phase 0 (uses database from Phase 0, but can be developed in parallel)
- ✅ Core feature differentiator
- ✅ Most users care about voice features

### Tasks

#### Task 1.1: Web Audio API Recording Module
**File**: `src/lib/useAudioRecording.ts` (NEW)

```typescript
export interface AudioRecorder {
  startRecording(): Promise<void>;
  stopRecording(): Promise<Blob>;
  getAudioLevel(): number;
  isRecording: boolean;
}

export function useAudioRecording() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: { 
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: false // Manual control for Quran
      } 
    });
    
    mediaRecorderRef.current = new MediaRecorder(stream);
    mediaRecorderRef.current.start();
  };
  
  const stopRecording = async (): Promise<Blob> => {
    return new Promise(resolve => {
      const recorder = mediaRecorderRef.current!;
      recorder.ondataavailable = event => resolve(event.data);
      recorder.stop();
    });
  };
  
  return { startRecording, stopRecording };
}
```

**Success Criteria**:
- [ ] Record from microphone
- [ ] Save as WAV/WebM
- [ ] Audio level visualization
- [ ] Microphone permissions handling

#### Task 1.2: Audio Playback with Waveform
**File**: `src/components/voice/AudioPlayer.tsx` (NEW)

```typescript
interface AudioPlayerProps {
  audioBlob: Blob;
  onPlay?: () => void;
  onPause?: () => void;
}

export function AudioPlayer({ audioBlob }: AudioPlayerProps) {
  // Show waveform
  // Play/pause/seek controls
  // Time display
  // Speed control (0.75x, 1x, 1.25x, 1.5x)
}
```

**Success Criteria**:
- [ ] Play recordings
- [ ] Show waveform visualization
- [ ] Speed controls
- [ ] Time markers

#### Task 1.3: Web Speech API Integration
**File**: `src/lib/useSpeechRecognition.ts` (NEW)

```typescript
export function useSpeechRecognition() {
  const recognize = async (audioBlob: Blob): Promise<string> => {
    // Use Web Speech API or external service
    // Return transcription
  };
  
  const validateArabic = (transcription: string): ValidationResult => {
    // Check if user recited correct Quranic text
    // Return confidence score + corrections
  };
  
  return { recognize, validateArabic };
}
```

**Success Criteria**:
- [ ] Transcribe audio to text
- [ ] Validate against Quranic text
- [ ] Return confidence scores

#### Task 1.4: Voice Recording UI
**File**: `src/components/voice/VoiceRecorder.tsx` (NEW)

```typescript
interface VoiceRecorderProps {
  surahNum: number;
  verseNum: number;
  expectedText: string; // Correct Quranic verse
  onSave?: (recording: VoiceRecordingData) => void;
}

export function VoiceRecorder({ surahNum, verseNum, expectedText, onSave }: VoiceRecorderProps) {
  // Record button (with visual feedback)
  // Waveform during recording
  // Play back what was recorded
  // Show transcription vs expected
  // Highlight differences
  // Save button with confidence score
}
```

**Success Criteria**:
- [ ] Recording UI functional
- [ ] Playback working
- [ ] Transcription shown
- [ ] Save to database

#### Task 1.5: Quran Reader - Voice Test Mode
**File**: `src/components/quran/QuranReader.tsx` (UPDATE)

Add "Voice Test" button to each verse:
```typescript
export function QuranReader() {
  const [testMode, setTestMode] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);
  
  return (
    <>
      {/* Surah selector, verses list... */}
      {testMode && selectedVerse && (
        <VoiceRecorder
          surahNum={selectedVerse.surah}
          verseNum={selectedVerse.number}
          expectedText={selectedVerse.arabic}
          onSave={(recording) => saveToDatabase(recording)}
        />
      )}
    </>
  );
}
```

**Success Criteria**:
- [ ] Voice test mode toggleable
- [ ] Recording per-verse
- [ ] Recordings saved to database

#### Task 1.6: Voice Analytics Dashboard
**File**: `src/components/dashboard/VoiceAnalytics.tsx` (NEW)

```typescript
export function VoiceAnalytics() {
  // Total recordings
  // Average confidence score
  // Most difficult verses
  // Weekly practice trends
  // Progress chart
}
```

**Success Criteria**:
- [ ] Analytics displayed
- [ ] Historical data shown
- [ ] Charts/graphs working

#### Task 1.7: Voice Testing
**File**: `tests/voice.test.ts` (NEW)

```typescript
describe('Voice Recording & Transcription', () => {
  test('should record audio from microphone', async () => { /*...*/ });
  test('should transcribe Arabic correctly', async () => { /*...*/ });
  test('should validate against Quranic text', async () => { /*...*/ });
  test('should save recordings to database', async () => { /*...*/ });
});
```

**Success Criteria**:
- [ ] All tests passing
- [ ] Coverage > 75%
- [ ] Edge cases covered

### Phase 1 Deliverables
- ✅ Audio recording with Web Audio API
- ✅ Playback with waveform visualization
- ✅ Speech-to-text transcription
- ✅ Quranic text validation
- ✅ VoiceRecorder UI component
- ✅ Per-verse voice testing
- ✅ Voice analytics dashboard
- ✅ Full test coverage

### Phase 1 Timeline: **Weeks 2-4 (Parallel with Phase 0)**

---

# 🧠 Phase 2: Core Feature Completion (Weeks 3-5, Parallel)

## Objective
Complete QuranReader, implement prayer time calculations, smart reminders, analytics dashboard, and tray polish.

### Why Parallel?
- ✅ Independent features
- ✅ Improves daily UX dramatically
- ✅ Sets foundation for v0.2.0

### Tasks

#### Task 2.1: Prayer Times Calculation
**File**: `src/lib/usePrayerTimes.ts` (NEW)

```typescript
export interface PrayerTimes {
  fajr: string;    // 05:30 AM
  dhuhr: string;   // 12:45 PM
  asr: string;     // 03:30 PM
  maghrib: string; // 06:45 PM
  isha: string;    // 08:00 PM
}

export function usePrayerTimes(latitude: number, longitude: number) {
  const calculateTimes = (): PrayerTimes => {
    // Use: Adhan library or manual calculation
    // Returns prayer times for today
  };
  
  const getNextPrayer = (): { name: string; time: string; minutesUntil: number } => {
    // Returns which prayer is next and countdown
  };
  
  return { calculateTimes, getNextPrayer };
}
```

**Library**: Use `adhan` npm package for accurate calculations

```bash
npm install adhan
```

**Success Criteria**:
- [ ] Accurate prayer times for any location
- [ ] Countdown timer working
- [ ] Next prayer highlighted

#### Task 2.2: Smart Reminder Engine
**File**: `src/lib/useSmartReminders.ts` (NEW)

```typescript
export interface SmartReminderConfig {
  enablePrayerReminders: boolean;
  enableIdleReminders: boolean;
  enableTimeBasedReminders: boolean;
  quietHoursStart: string;     // "22:00"
  quietHoursEnd: string;       // "06:00"
  minIntervalBetweenReminders: number; // minutes
}

export function useSmartReminders(config: SmartReminderConfig) {
  // Track idle time
  // Detect after prayers
  // Check time-based triggers
  // Respect quiet hours
  // Enforce minimum interval
  
  const shouldShowReminder = (): boolean => {
    // Complex logic: combines all detection methods
  };
  
  const getNextAdhkar = (): Adhkar => {
    // Smart rotation algorithm
  };
  
  return { shouldShowReminder, getNextAdhkar };
}
```

**Success Criteria**:
- [ ] All detection methods working
- [ ] Quiet hours respected
- [ ] Interval enforcement
- [ ] Smart rotation tested

#### Task 2.3: Analytics & Progress Dashboard
**File**: `src/components/dashboard/Dashboard.tsx` (NEW)

```typescript
export function Dashboard() {
  return (
    <div className="analytics">
      {/* Daily stats */}
      <StatsCard title="Today's Adhkar" value={5} goal={10} />
      <StatsCard title="Weekly Streak" value={4} unit="days" />
      <StatsCard title="Voice Tests" value={12} trend="up" />
      
      {/* Progress charts */}
      <AdhkarProgressChart data={chartData} />
      <VoiceProgressChart data={voiceChartData} />
      <QuranReadingChart data={quranChartData} />
      
      {/* Badges & achievements */}
      <AchievementsList achievements={achievements} />
    </div>
  );
}
```

**Success Criteria**:
- [ ] All metrics displaying
- [ ] Charts rendering
- [ ] Historical data loaded
- [ ] Achievements system working

#### Task 2.4: Enhanced Tray Notifications
**File**: `src-tauri/src/tray.rs` (UPDATE)

Improve tray popup system:
```rust
pub fn show_adhkar_popup(adhkar: Adhkar) {
  // Show 30-second auto-dismiss
  // Play notification sound (if enabled)
  // Store in notification history
  // Track if dismissed vs read vs liked
}

pub fn create_tray_menu() -> CustomMenu {
  // Settings
  // View History
  // Voice Tests
  // Statistics
  // Quit
}
```

**Success Criteria**:
- [ ] Popups auto-dismiss
- [ ] Sound notifications work
- [ ] Menu items functional
- [ ] History tracking

#### Task 2.5: QuranReader - Full UI Polish
**File**: `src/components/quran/QuranReader.tsx` (UPDATE)

Complete features:
```typescript
export function QuranReader() {
  return (
    <>
      {/* Surah selector dropdown - all 114 */}
      <SurahSelector onChange={setSurah} />
      
      {/* Display toggles */}
      <DisplayOptions
        showTajweed={showTajweed}
        showTranslit={showTranslit}
        showEnglish={showEnglish}
        fontSize={fontSize}
        onToggle={(key, val) => setDisplay({...display, [key]: val})}
      />
      
      {/* Verses with tajweed highlighting */}
      <VersesDisplay
        surah={surah}
        highlightTajweed={showTajweed}
        fontSize={fontSize}
      />
      
      {/* Bookmarks & voice test mode */}
      <VoiceTestButton onStart={startVoiceTest} />
    </>
  );
}
```

**Success Criteria**:
- [ ] All 114 Surahs selectable
- [ ] Tajweed highlighting working
- [ ] Display options functional
- [ ] Voice test mode integrated
- [ ] Bookmarking working

#### Task 2.6: Settings Page - Complete
**File**: `src/windows/settings/SettingsWindow.tsx` (UPDATE)

Add missing sections:
```typescript
export function SettingsWindow() {
  return (
    <div className="settings">
      {/* Profile */}
      <Section title="Profile">
        <Input label="Name" value={name} onChange={setName} />
        <Select label="Language" value={lang} options={['en', 'ar']} />
      </Section>
      
      {/* Prayer Times */}
      <Section title="Prayer Times">
        <Input label="Latitude" type="number" />
        <Input label="Longitude" type="number" />
      </Section>
      
      {/* Reminders */}
      <Section title="Reminders">
        <Toggle label="Prayer Reminders" value={prayerReminders} />
        <Toggle label="Idle Reminders" value={idleReminders} />
        <TimeInput label="Quiet Hours Start" value={quietStart} />
        <TimeInput label="Quiet Hours End" value={quietEnd} />
      </Section>
      
      {/* Voice Settings */}
      <Section title="Voice Recognition">
        <Select label="Language" value={voiceLang} />
        <Toggle label="Enable Transcription" value={enableSpeech} />
      </Section>
      
      {/* Data Management */}
      <Section title="Data">
        <Button onClick={exportData}>Export Data</Button>
        <Button onClick={resetApp} variant="destructive">Reset App</Button>
      </Section>
    </div>
  );
}
```

**Success Criteria**:
- [ ] All settings saveable
- [ ] Settings persist to database
- [ ] Validation working
- [ ] Export/reset functions

#### Task 2.7: Home Page - Complete
**File**: `src/components/home/Home.tsx` (UPDATE)

Finalize home page:
```typescript
export function Home() {
  return (
    <div className="home">
      {/* Prayer countdown */}
      <PrayerCountdown />
      
      {/* Daily goal */}
      <DailyGoalProgress />
      
      {/* Smart reminder banner */}
      <SmartReminderBanner />
      
      {/* Today's adhkar */}
      <TodayAdhkarSection />
      
      {/* Quick stats */}
      <QuickStats />
      
      {/* Upcoming features teaser */}
      <FeatureTeaser feature="Voice Testing" version="v0.2" />
    </div>
  );
}
```

**Success Criteria**:
- [ ] All components rendering
- [ ] Data flowing correctly
- [ ] Responsive design
- [ ] No performance issues

#### Task 2.8: Core Feature Testing
**File**: `tests/core-features.test.ts` (NEW)

```typescript
describe('Core Features', () => {
  test('prayer times calculate correctly', async () => { /*...*/ });
  test('smart reminders trigger appropriately', async () => { /*...*/ });
  test('analytics data aggregates correctly', async () => { /*...*/ });
  test('quran reader loads all 114 surahs', async () => { /*...*/ });
  test('settings persist across sessions', async () => { /*...*/ });
});
```

**Success Criteria**:
- [ ] All tests passing
- [ ] Coverage > 80%
- [ ] Integration tests included

### Phase 2 Deliverables
- ✅ Prayer times calculation (Adhan library)
- ✅ Smart reminder engine (multi-detection)
- ✅ Analytics dashboard (charts, trends, achievements)
- ✅ Enhanced tray system (popups, history, menu)
- ✅ Complete QuranReader (all 114 surahs)
- ✅ Complete Settings window
- ✅ Finished Home page
- ✅ Comprehensive test suite

### Phase 2 Timeline: **Weeks 3-5 (Parallel)**

---

# 🤖 Phase 3: ML Integration & v0.2.0 Release (Weeks 6-8)

## Objective
Integrate quranic_qiraat_ml module when datasets finish downloading. Release v0.2.0 with full desktop app features (no ML yet - ML features go in v0.2.1).

### Timeline Note
- 🚨 **ML datasets currently downloading** - expected completion Week 2-3
- ⏳ **ML processing**: Weeks 4-5 (preprocessing + feature extraction)
- ⏳ **ML training**: Weeks 5-6 (model training on RTX 5070 Ti)
- ⏳ **ML integration**: Weeks 6-8 (integrate trained models with main app)

### Recommendation
**Ship v0.2.0 in Week 6 WITHOUT ML features.** Users won't miss what they don't know exists yet. Add ML features in v0.2.1 (Weeks 8-10) as a surprise update.

### Tasks

#### Task 3.1: v0.2.0 Release Preparation
**File**: `RELEASE_NOTES_v0.2.0.md` (NEW)

```markdown
# Dhikrtop v0.2.0 Release Notes

## New Features
- ✅ Complete Quran Reader (all 114 Surahs)
- ✅ Voice recording & transcription
- ✅ Prayer times with smart reminders
- ✅ Analytics dashboard
- ✅ SQLite persistent database
- ✅ Enhanced settings panel
- ✅ Tray notifications with history

## Bug Fixes
- Fixed text overflow in tray window
- Improved performance of large datasets
- Better error handling

## Known Limitations
- Voice feature requires microphone access
- Prayer times require location setup
- Cloud sync coming in v0.3.0

## Installation
Download: Dhikrtop_0.2.0_x64-setup.exe

## Feedback
Found a bug? https://github.com/zajalist/dhikrtop/issues
```

**Success Criteria**:
- [ ] Release notes written
- [ ] Version updated in package.json & Cargo.toml
- [ ] Changelog entry added

#### Task 3.2: Version Bumping
**Files to Update:**
- `package.json` → `"version": "0.2.0"`
- `src-tauri/Cargo.toml` → `version = "0.2.0"`
- `src-tauri/tauri.conf.json` → `"productVersion": "0.2.0"`

**Success Criteria**:
- [ ] All version numbers synchronized
- [ ] Build works with new version

#### Task 3.3: Windows Installer Build
**Command**:
```bash
npm run app:build
```

**Outputs**:
```
src-tauri/target/release/bundle/
├── nsis/
│   └── Dhikrtop_0.2.0_x64-setup.exe
└── msi/
    └── Dhikrtop_0.2.0_x64.msi
```

**Success Criteria**:
- [ ] Build completes without errors
- [ ] Both installers created
- [ ] Installers tested on Windows

#### Task 3.4: Create Release Archive
**Directory**: `releases/v0.2.0/` (NEW)

```bash
mkdir releases/v0.2.0/
cp src-tauri/target/release/bundle/nsis/*.exe releases/v0.2.0/
cp src-tauri/target/release/bundle/msi/*.msi releases/v0.2.0/
cp RELEASE_NOTES_v0.2.0.md releases/v0.2.0/
```

**Success Criteria**:
- [ ] Archive created
- [ ] Files checksummed
- [ ] README included

#### Task 3.5: Update Main Changelog
**File**: `releases/RELEASES.md` (UPDATE)

Add v0.2.0 section at top:
```markdown
## v0.2.0 - March 15, 2026

**Major Features:**
- Voice recording & transcription for Quran recitation testing
- Complete Quran Reader with all 114 Surahs
- Prayer times calculation with smart reminders
- Analytics dashboard with progress tracking
- SQLite persistent database (no more data loss!)
- Enhanced settings and tray notifications

**Downloads:**
- [Windows x64 NSIS Installer](./v0.2.0/Dhikrtop_0.2.0_x64-setup.exe)
- [Windows x64 MSI Installer](./v0.2.0/Dhikrtop_0.2.0_x64.msi)
```

**Success Criteria**:
- [ ] Changelog updated
- [ ] Download links working
- [ ] Previous versions still accessible

#### Task 3.6: Git Commit & Tag
**Commands**:
```bash
git add .
git commit -m "feat: Release v0.2.0 - Voice, QuranReader, Analytics

- Add voice recording & transcription
- Complete Quran Reader (all 114 surahs)
- Prayer times & smart reminders
- Analytics dashboard
- SQLite persistent database
- Enhanced settings & tray notifications

BREAKING: localStorage deprecated, auto-migrates to database"

git tag -a v0.2.0 -m "Release v0.2.0 - Voice & Analytics"
git push origin main --tags
```

**Success Criteria**:
- [ ] Commit message clear and detailed
- [ ] Tag created
- [ ] Pushed to origin/main

#### Task 3.7: GitHub Release
**On GitHub.com:**
1. Go to https://github.com/zajalist/dhikrtop/releases
2. Click "Create a new release"
3. Select tag: v0.2.0
4. Title: "Dhikrtop v0.2.0 - Voice & Analytics"
5. Description: Copy RELEASE_NOTES_v0.2.0.md
6. Upload files: Both .exe and .msi
7. Mark as latest release

**Success Criteria**:
- [ ] Release published
- [ ] Downloads accessible
- [ ] Analytics showing downloads

#### Task 3.8: ML Datasets Monitoring
**Parallel Activity** (Not blocking v0.2.0)

Monitor quranic_qiraat_ml:
- ✅ Track dataset download progress
- ⏳ When complete: Start preprocessing
- ⏳ Weeks 5-6: Train models
- ⏳ Week 6+: Begin integration testing

**Check Progress**:
```bash
cd quranic_qiraat_ml/data/raw/
du -sh *  # Show download progress

# Monitor preprocessing
tail -f ../processed/progress.log
```

**Success Criteria**:
- [ ] Datasets downloaded
- [ ] Preprocessing complete
- [ ] Models trained
- [ ] Ready for integration in v0.2.1

### Phase 3 Deliverables
- ✅ v0.2.0 released on GitHub
- ✅ Windows installers available
- ✅ Release notes published
- ✅ NSIS + MSI installers tested
- ✅ Tagged in git
- ✅ ML datasets prepared for v0.2.1

### Phase 3 Timeline: **Week 6-7**

---

# 🔮 Phase 4: ML Features for v0.2.1 (Weeks 8-10)

## Objective
Integrate trained ML models for tajweed detection and Qira'at classification.

### Prerequisites
- ✅ ML models trained (scheduled for Week 6)
- ✅ Model inference API ready
- ✅ v0.2.0 stable in production

### Tasks

#### Task 4.1: ML Python Service Wrapper
**File**: `src-tauri/src/ml_service.rs` (NEW)

Spawn Python subprocess for ML inference:
```rust
pub struct MLService {
    process: Child,
}

impl MLService {
    pub async fn new() -> Result<Self>;
    pub async fn classify_qiraat(audio_path: &str) -> Result<QiraatPrediction>;
    pub async fn detect_tajweed_rules(audio_path: &str) -> Result<Vec<TajweedDetection>>;
    pub async fn shutdown(&mut self) -> Result<()>;
}
```

**Success Criteria**:
- [ ] Python service spawned
- [ ] IPC communication working
- [ ] Graceful shutdown

#### Task 4.2: ML Inference Tauri Commands
**File**: `src-tauri/src/commands.rs` (UPDATE)

Add new commands:
```rust
#[tauri::command]
pub async fn ml_classify_audio(audio_path: String) -> Result<QiraatResult>;

#[tauri::command]
pub async fn ml_detect_tajweed(audio_path: String) -> Result<TajweedResult>;

#[tauri::command]
pub async fn ml_batch_process(audio_files: Vec<String>) -> Result<Vec<MLResult>>;
```

**Success Criteria**:
- [ ] Commands working
- [ ] Results returning correctly
- [ ] Error handling robust

#### Task 4.3: QuranReader - ML Features
**File**: `src/components/quran/QuranReader.tsx` (UPDATE)

Add ML-powered features:
```typescript
export function QuranReader() {
  // ... existing code ...
  
  // NEW: Show detected qira'at (Hafs vs Warsh)
  const [detectedQiraat, setDetectedQiraat] = useState<string>('');
  
  // NEW: Show tajweed rules with ML confidence
  const [tajweedAnalysis, setTajweedAnalysis] = useState<TajweedDetection[]>([]);
  
  const analyzeRecording = async (audioBlob: Blob) => {
    const qiraat = await invoke('ml_classify_audio', { audioPath });
    const tajweed = await invoke('ml_detect_tajweed', { audioPath });
    
    setDetectedQiraat(qiraat.detected_qiraat);
    setTajweedAnalysis(tajweed.rules);
  };
  
  return (
    <>
      {/* ... existing verse display ... */}
      {tajweedAnalysis.length > 0 && (
        <TajweedAnalysisPanel
          rules={tajweedAnalysis}
          expectedVerse={currentVerse.arabic}
        />
      )}
    </>
  );
}
```

**Success Criteria**:
- [ ] ML predictions displayed
- [ ] Confidence scores shown
- [ ] UI responsive during inference

#### Task 4.4: VoiceRecorder - ML Validation
**File**: `src/components/voice/VoiceRecorder.tsx` (UPDATE)

Enhance with ML feedback:
```typescript
export function VoiceRecorder({ surah, verse }: Props) {
  const [mlAnalysis, setMlAnalysis] = useState<MLAnalysis | null>(null);
  
  const onRecordingComplete = async (audioBlob: Blob) => {
    // Existing: save to database
    await saveToDatabase(audioBlob);
    
    // NEW: Run ML analysis
    const analysis = await invoke('ml_detect_tajweed', { audioPath });
    setMlAnalysis(analysis);
    
    // Show detailed feedback
    return <MLFeedbackPanel analysis={analysis} />;
  };
}
```

**Success Criteria**:
- [ ] ML analysis triggers on save
- [ ] Feedback displayed to user
- [ ] No performance regression

#### Task 4.5: ML Analytics Dashboard
**File**: `src/components/dashboard/MLAnalytics.tsx` (NEW)

Show ML-powered insights:
```typescript
export function MLAnalytics() {
  return (
    <>
      {/* Qira'at Detection History */}
      <Section title="Your Qira'at Style">
        <QiraatChart data={qiraatHistory} />
        <p>You typically follow: Hafs (87%) vs Warsh (13%)</p>
      </Section>
      
      {/* Tajweed Rule Mastery */}
      <Section title="Tajweed Mastery">
        <TajweedMasteryGrid rules={masteryByRule} />
        {/* Strongest: Ghunnah (94%) */}
        {/* Needs work: Ikhfaa (62%) */}
      </Section>
      
      {/* ML Model Info */}
      <Section title="Model Info">
        <p>Using: quranic_qiraat_ml v1.0</p>
        <p>Last trained: 2026-03-10</p>
        <p>Accuracy: 92.3% (validation set)</p>
      </Section>
    </>
  );
}
```

**Success Criteria**:
- [ ] Analytics aggregated from database
- [ ] Charts displaying correctly
- [ ] User insights clear

#### Task 4.6: Batch Processing for Existing Recordings
**File**: `src/lib/useBatchMLAnalysis.ts` (NEW)

Retroactively analyze all saved voice recordings:
```typescript
export async function batchAnalyzeExistingRecordings() {
  // Get all voice recordings from database
  const recordings = await db.getAllVoiceRecordings();
  
  // Run ML on each
  for (const recording of recordings) {
    const analysis = await invoke('ml_detect_tajweed', { audioPath: recording.path });
    
    // Save analysis to database
    await db.saveMLAnalysis(recording.id, analysis);
  }
  
  // Update dashboard
  refreshAnalytics();
}
```

**Success Criteria**:
- [ ] All recordings processed
- [ ] Results saved
- [ ] Progress indicator shown
- [ ] Can be run in background

#### Task 4.7: ML Testing
**File**: `tests/ml-integration.test.ts` (NEW)

```typescript
describe('ML Integration', () => {
  test('should classify qira\'at correctly', async () => { /*...*/ });
  test('should detect tajweed rules', async () => { /*...*/ });
  test('should batch process files', async () => { /*...*/ });
  test('should handle inference errors gracefully', async () => { /*...*/ });
});
```

**Success Criteria**:
- [ ] All tests passing
- [ ] Coverage > 70%
- [ ] Edge cases covered

### Phase 4 Deliverables
- ✅ ML Python service integrated via Tauri
- ✅ Tajweed rule detection in QuranReader
- ✅ Qira'at classification feedback
- ✅ ML analytics dashboard
- ✅ Batch analysis for historical data
- ✅ v0.2.1 release with ML features

### Phase 4 Timeline: **Weeks 8-10**

---

# 🚀 Phase 5: Cloud Sync & Polish (Weeks 10-12, v0.3.0)

## Objective
Add cloud sync, multi-device support, and performance optimizations.

### Not Included in v0.2.0 or v0.2.1
- Users happy with local-only features
- Cloud sync is nice-to-have, not must-have
- Enables future premium features

### High-Level Tasks (Not Detailed Yet)
- [ ] Supabase/Firebase integration
- [ ] User authentication
- [ ] Multi-device sync
- [ ] Conflict resolution
- [ ] Offline-first architecture
- [ ] Performance profiling & optimization

### Timeline: **Weeks 10-12+**

---

# 📊 Summary Timeline

```
WEEK    PHASE 0         PHASE 1         PHASE 2         PHASE 3         PHASE 4
        (Database)      (Voice)         (Core)          (ML/Release)    (Cloud)
====================================================================================================

1-2     ▓▓▓▓▓▓▓▓▓▓      ░░░░░░░░░░      ░░░░░░░░░░      ░░░░░░░░░░      ░░░░░░░░░░
        Database        Design          Design          Monitor ML      Design
        SQLite          Voice UI        Prayer Times    Datasets        Auth

2-3     ▓▓▓▓▓▓▓▓▓▓      ▓▓▓▓▓▓▓▓▓▓      ▓▓▓▓▓▓▓▓▓▓      ░░░░░░░░░░      ░░░░░░░░░░
        Quran API       Recording       Analytics       ML Processing   Plan
                        Transcription   Dashboard

3-4     ▓▓▓▓▓░░░░      ▓▓▓▓▓▓▓▓▓▓      ▓▓▓▓▓▓▓▓▓▓      ░░░░░░░░░░      ░░░░░░░░░░
        Testing         Playback        Settings        ML Training     Design
                        Analytics                       Continues

4-5     ░░░░░░░░░░     ▓▓▓▓▓░░░░      ▓▓▓▓▓▓▓▓▓▓      ░░░░░░░░░░      ░░░░░░░░░░
        COMPLETE        Testing         Testing         ML Training     Plan
                                                        Continues

5-6     ░░░░░░░░░░     ░░░░░░░░░░      ░░░░░░░░░░      ▓▓▓▓▓▓▓▓▓▓      ░░░░░░░░░░
        ✅ DONE         ✅ DONE         ✅ DONE         Release v0.2.0  Start Dev

6-7     ░░░░░░░░░░     ░░░░░░░░░░      ░░░░░░░░░░      ░░░░░░░░░░      ░░░░░░░░░░
        ✅ DONE         ✅ DONE         ✅ DONE         v0.2.0 QA       ✅ Started
                                                        Integrate ML

7-8     ░░░░░░░░░░     ░░░░░░░░░░      ░░░░░░░░░░      ▓▓▓▓▓░░░░░░      ▓▓▓▓▓░░░░░░
        ✅ DONE         ✅ DONE         ✅ DONE         ML Features     Dev Auth

8-9     ░░░░░░░░░░     ░░░░░░░░░░      ░░░░░░░░░░      ▓▓▓▓▓▓▓▓▓▓      ▓▓▓▓▓▓▓▓░░░░
        ✅ DONE         ✅ DONE         ✅ DONE         Release v0.2.1  Dev Sync

9-10    ░░░░░░░░░░     ░░░░░░░░░░      ░░░░░░░░░░      ░░░░░░░░░░      ▓▓▓▓▓▓▓▓▓▓
        ✅ DONE         ✅ DONE         ✅ DONE         ✅ DONE         Testing

10-12   ░░░░░░░░░░     ░░░░░░░░░░      ░░░░░░░░░░      ░░░░░░░░░░      ▓▓▓▓▓▓▓▓▓▓
        ✅ DONE         ✅ DONE         ✅ DONE         ✅ DONE         Release v0.3.0
```

---

# 🎯 Next Steps - IMMEDIATE ACTIONS

## Week 1: THIS WEEK

### 1. Sync with origin/main
```bash
cd /home/zajalist/projects/dhikrtop
git fetch origin
git pull origin main
npm install
```

### 2. Create feature branches for parallel development
```bash
git branch feature/phase0-database
git branch feature/phase1-voice
git branch feature/phase2-core-features
```

### 3. Start Phase 0 Tasks (in order of priority)
1. Task 0.2 - Rust database module
2. Task 0.6 - Quran.com API integration
3. Task 0.1 - Schema design finalization
4. Task 0.3 - Tauri commands
5. Task 0.4 - React hooks
6. Task 0.5 - localStorage migration

### 4. Set up development workflow
```bash
# Terminal 1: Tauri app dev
npm run app:dev

# Terminal 2: Build monitoring
npm run build

# Terminal 3: Tests
npm run test:ui
```

### 5. Document progress
Create `DEVELOPMENT_LOG.md` to track:
- What you completed today
- What blockers you hit
- Next session's priorities

---

# ⚙️ Technical Stack Summary

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | React + TypeScript | 18.3 + 5.6 | UI components |
| **Styling** | Tailwind + CSS Modules | 4.1 + CSS3 | Responsive design |
| **Desktop App** | Tauri | 2.0 | Windows app shell |
| **Backend** | Rust | 1.75+ | System integration |
| **Database** | SQLite | 3.x | Local persistence |
| **APIs** | Quran.com, Web Audio, Speech API | - | External services |
| **Voice** | Web Audio API + Web Speech API | - | Recording & transcription |
| **ML** | PyTorch + transformers | 2.1+ | tajweed/qiraat detection |
| **Build** | Vite + Cargo | 6.0 + stable | Build tools |
| **Testing** | Vitest + Playwright | 1.0+ | Test framework |

---

# 🎓 Success Criteria for v0.2.0

User can:
- ✅ Install and setup app in 2 minutes
- ✅ See adhkar in tray at smart times (prayer times, idle detection)
- ✅ Read all 114 Surahs with tajweed colors
- ✅ Record their voice reading any verse
- ✅ See transcription of what they read
- ✅ Track progress with analytics dashboard
- ✅ Customize reminders and settings
- ✅ Data persists across app restarts
- ✅ Everything works offline
- ✅ No data loss on updates

---

# 🚨 Critical Path & Dependencies

```
Phase 0 (Database)
├── BLOCKS Phase 1 (Voice needs DB)
├── BLOCKS Phase 2 (Analytics needs DB)
├── BLOCKS Phase 4 (Cloud sync needs DB)
└── Must Complete: Weeks 1-2

Phase 1 (Voice)
├── Independent from Phase 2
├── Can start Week 2 (parallel)
└── Unblocks ML integration

Phase 2 (Core)
├── Independent from Phase 1
├── Can start Week 2 (parallel)
├── Quran.com API critical
└── Prayer times calculation needed

Phase 3 (ML)
├── Depends on: ML datasets (downloading)
├── Can integrate: Week 6+
└── v0.2.0 ships WITHOUT ML (Week 6)

Phase 4 (Cloud)
├── Depends on: Phase 0 completion
├── Nice-to-have for v0.2.0
└── Scheduled for v0.3.0 (Week 10+)
```

---

# 📞 Questions to Consider

1. **Deployment Strategy**: Auto-update or manual download?
2. **Privacy**: Should cloud sync be optional/disabled by default?
3. **Telemetry**: Collect usage analytics (anonymous)?
4. **Premium Features**: Want to monetize (cloud sync, advanced ML)?
5. **Windows Store**: Submit to Microsoft Store for v0.2.0?
6. **Support**: How will users report bugs?

---

## Final Notes

✅ **You have everything you need to start.** All files are documented, dependencies are listed, and the path forward is clear.

🚀 **This is achievable solo.** The phases are independent enough that you can jump between them to stay motivated.

📈 **v0.2.0 will be impressive.** Adding voice, full Quran, and analytics will make a huge difference.

🎯 **Start with Phase 0.** Everything else depends on the database layer working correctly.

**Good luck! 🙏**
