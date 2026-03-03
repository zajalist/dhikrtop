# Phase 1: Voice Recording & Audio - Overview

**Duration**: Weeks 2-4  
**Status**: 🟢 Starting Now  
**Current Date**: March 2, 2026 (End of Week 1)  
**Target Completion**: Week 4 (3 weeks)  

---

## 🎯 Phase 1 Objective

Build a complete voice recording system that allows users to:
- Record themselves reading Quranic verses
- Playback recordings with timing
- Get transcription of recorded audio
- Store recordings in database (Phase 0 ready!)
- Track recording progress

---

## 📋 Phase 1 Tasks

### Task 1.1: Audio Recording Module (Rust) 🔴 START HERE
**File**: `src-tauri/src/audio.rs`  
**Status**: NOT STARTED  
**Priority**: CRITICAL  
**Deadline**: Week 2 (3 days)  

**What to build:**
- Audio device enumeration
- Recording start/stop/pause/resume
- WAV file encoding
- PCM data handling
- Error recovery

**Dependencies:**
- `cpal` - audio device abstraction
- `wav` - WAV encoding
- Tokio async runtime (already have)

**Output:**
- Module with RecorderHandle
- Async methods for recording control
- File save functionality

---

### Task 1.2: React Recording UI Component
**File**: `src/components/VoiceRecorder.tsx`  
**Status**: NOT STARTED  
**Priority**: HIGH  
**Deadline**: Week 2 (3 days)  

**What to build:**
- Record button UI
- Recording timer
- Playback controls
- Visual feedback (waveform preview)
- Status indicator

**Integration:**
- Use audio recording module via Tauri
- Display current recording status
- Show wave visualization

---

### Task 1.3: Audio Playback Module
**File**: `src-tauri/src/playback.rs`  
**Status**: NOT STARTED  
**Priority**: HIGH  
**Deadline**: Week 2 (3 days)  

**What to build:**
- Play WAV files
- Pause/resume support
- Duration calculation
- Progress tracking
- Volume control

**Dependencies:**
- `cpal` for playback
- Timing/sync functionality

---

### Task 1.4: Voice Recording Hooks (React)
**File**: `src/lib/useVoiceRecorder.ts`  
**Status**: NOT STARTED  
**Priority**: HIGH  
**Deadline**: Week 3 (3 days)  

**What to build:**
- Record verse audio
- Get recording from database
- Playback functionality
- Delete recordings
- List user recordings

**Integration:**
- Use Tauri commands for audio
- Store in database (Phase 0)
- Real-time status updates

---

### Task 1.5: Integration & Testing
**File**: Multiple  
**Status**: NOT STARTED  
**Priority**: MEDIUM  
**Deadline**: Week 3-4 (5 days)  

**What to do:**
- Connect UI to audio module
- Add error handling
- Create test suites
- Performance optimization
- User testing

---

### Task 1.6: Transcription (Optional Week 4)
**File**: `src-tauri/src/transcription.rs`  
**Status**: NOT STARTED  
**Priority**: LOW  
**Deadline**: Week 4 (optional)  

**Note**: Can be deferred to Phase 2 if timing is tight

---

## 📊 Phase 1 Structure

```
Week 2 (Mon-Wed):
├── Task 1.1: Audio recording module (Rust)
├── Task 1.2: React UI component
└── Task 1.3: Playback module

Week 2-3 (Thu-Fri + Mon-Tue):
├── Task 1.4: Voice recorder hooks
└── Integration testing

Week 3-4 (Wed-Fri):
├── Performance optimization
├── Error handling
├── Unit tests (50+ tests)
└── Documentation

Week 4 (Optional):
└── Task 1.6: Transcription (defer if needed)
```

---

## 🔧 Technical Stack

### Audio Libraries
```toml
cpal = "0.18"              # Cross-platform audio
wav = "0.11"               # WAV format encoding
hound = "3.5"              # WAV reading/writing (alternative)
byteorder = "1.5"          # Byte order handling
```

### Frontend
```typescript
// HTML5 Web Audio API
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const recorder = new MediaRecorder(stream);

// Or use recordrtc for better compatibility
// npm install recordrtc
```

---

## 🎯 Phase 1 Success Criteria

### Users Can:
- ✅ Record their voice reading a Quranic verse
- ✅ See recording in progress (timer)
- ✅ Stop and save recording
- ✅ Playback recording with pause/resume
- ✅ Delete unwanted recordings
- ✅ See list of all recordings
- ✅ Data persists (stored in Phase 0 database)

### Developers Can:
- ✅ Record any verse from any Surah (Phase 0 data)
- ✅ Multiple recordings per verse
- ✅ Track recording metadata (duration, quality)
- ✅ Easy to extend for transcription

### Code Quality:
- ✅ >80% test coverage
- ✅ Error handling for audio failures
- ✅ Type-safe (Rust + TypeScript)
- ✅ Performance optimized
- ✅ Well documented

---

## 🔄 Integration Points

### With Phase 0:
```
useQuranAPI()  ──→  Get verse to read
useDatabase()  ──→  Store recording metadata
```

### Within Phase 1:
```
Audio Module (Rust)
    ↓
Tauri Commands
    ↓
useVoiceRecorder (React Hook)
    ↓
VoiceRecorder Component (UI)
```

---

## 📈 Architecture

```
User Records Verse
    ↓
VoiceRecorder Component (UI)
    ↓
useVoiceRecorder Hook (React)
    ↓
Tauri Commands
    ↓
Audio Recording Module (Rust)
    ↓
WAV File + PCM Data
    ↓
Database Storage (Phase 0)
    ↓
Metadata + File Path
```

---

## ⚠️ Challenges & Solutions

### Challenge 1: Cross-Platform Audio
**Solution**: Use `cpal` library (works on Windows, macOS, Linux)

### Challenge 2: Permission Handling
**Solution**: Request microphone permissions on first use
- Windows: Automatic
- macOS: Shows dialog
- Linux: May need explicit permissions

### Challenge 3: File Storage
**Solution**: Use user's app data directory (Phase 0 handles this)

### Challenge 4: Audio Quality
**Solution**: 
- Record at 44.1kHz or 48kHz
- 16-bit PCM format
- Mono or stereo

---

## 📚 Dependencies to Add

```toml
# In src-tauri/Cargo.toml
[dependencies]
cpal = "0.18"              # Audio I/O
wav = "0.11"               # WAV format
tokio = { version = "1", features = ["full"] }  # Already have

# Optional
byteorder = "1.5"          # Byte handling
thiserror = "1.0"          # Better errors
```

```bash
# In JavaScript (optional, can use Web Audio API)
npm install recordrtc --save
```

---

## 🗓️ Weekly Schedule

### Week 2
- **Day 1-2**: Task 1.1 (Audio module)
- **Day 3**: Task 1.2 (UI component)
- **Day 4-5**: Task 1.3 (Playback)

### Week 3
- **Day 1-2**: Task 1.4 (React hooks)
- **Day 3-5**: Integration + Testing

### Week 4
- **Day 1-3**: Optimization + Testing
- **Day 4-5**: Documentation + Task 1.6 (optional)

---

## 🎓 Key Concepts

### PCM Audio Data
- Raw audio samples
- 16-bit signed integer
- Sample rate: 44.1kHz or 48kHz
- Channels: 1 (mono) or 2 (stereo)

### WAV Format
- Header with sample rate, channels, bit depth
- Audio data in PCM format
- Easy to parse and play

### Recording States
- Idle (ready)
- Recording (capturing audio)
- Paused (can resume)
- Stopped (ready to save)

---

## 🚀 Getting Started

1. **Add dependencies** to Cargo.toml
2. **Create audio module** with recording functionality
3. **Test recording** with simple Tauri command
4. **Build UI** for recording
5. **Add playback** support
6. **Integrate** everything
7. **Add tests** (>80% coverage)

---

## 💡 Pro Tips

1. **Start simple**: Get basic recording working first
2. **Test often**: Record/playback test files
3. **Use defaults**: 44.1kHz, 16-bit mono is fine
4. **Error handling**: Graceful degradation
5. **Performance**: Don't block UI during recording
6. **Offline**: Works without network

---

## 📝 Documentation Needed

- Audio module API docs
- Component usage examples
- Recording file format specs
- Error handling guide
- Testing instructions

---

## ✅ Phase 1 Readiness

**Prerequisites Met:**
- ✅ Phase 0 complete (database ready)
- ✅ Quran API ready (verses available)
- ✅ Rust/Tauri setup ready
- ✅ React + TypeScript ready
- ✅ Test infrastructure ready

**Ready to Start**: YES ✅

---

**Status**: Ready to begin Phase 1  
**Start Date**: March 2, 2026 (end of Week 1)  
**Target**: Week 4  
**Confidence**: VERY HIGH 🟢  

**Let's build voice recording! 🎤**
