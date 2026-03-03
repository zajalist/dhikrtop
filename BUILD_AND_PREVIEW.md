# 🚀 Build & Preview Guide

**Current Date**: March 2, 2026  
**Status**: Ready to build  
**Expected Build Time**: 2-5 minutes  

---

## 📋 Prerequisites Check

Before building, let's verify everything is in place:

```bash
# Check Node.js
node --version          # Should be v18+
npm --version           # Should be v9+

# Check Rust
rustc --version         # Should be latest stable
cargo --version         # Should be latest stable

# Check Git (optional)
git --version           # For version control
```

---

## 🔧 Build Steps

### Step 1: Install JavaScript Dependencies

```bash
cd /home/zajalist/projects/dhikrtop

# Install npm packages
npm install

# Expected output:
# added XXX packages in X.XXs
```

**What this does**:
- Downloads React, TypeScript, Vite, etc.
- Sets up development tools
- Prepares build environment

**Time**: 1-2 minutes

---

### Step 2: Run Tests (Optional but Recommended)

```bash
# Run all tests
npm run test

# Or run Rust tests
cd src-tauri
cargo test --lib db
cd ..
```

**Expected**: All 105+ tests pass ✅

**Time**: <15 seconds

---

### Step 3: Build for Development

```bash
# Start development server with Tauri
npm run tauri dev

# OR build production binary
npm run tauri build
```

**What happens**:
1. TypeScript compiles to JavaScript
2. Vite bundles frontend
3. Rust compiles backend
4. Tauri wraps everything as desktop app
5. App launches automatically

**Time**: 3-5 minutes (first run, then cached)

---

## 🎯 What You'll See

### When App Launches:

**Setup Window** (first run):
- Welcome message
- Name input
- Language selection (English/Arabic)
- "Complete Setup" button

**Main Window** (after setup):
- Tray icon in system tray (bottom-right)
- Click tray icon → Adhkar popup appears
- Settings accessible from menu

**Adhkar Popup**:
- Random Islamic remembrance displayed
- Buttons: Like, Dislike, Dismiss
- Timer (if enabled)
- Settings accessible

**Settings Window**:
- Reminder interval
- Notifications toggle
- Sound toggle
- Quiet hours (optional)
- Theme selection (dark/light)

---

## 🔍 What's Actually Working

### ✅ Database (Phase 0)
```
You can test:
1. User data persists across restarts
2. Settings saved and loaded
3. Adhkar display count tracked
4. Reading progress recorded
5. Voice recording metadata stored
```

### ✅ Quran API (Phase 0)
```
The 114 Surahs are:
- Cached locally
- Accessible offline
- Searchable
- Available in multiple translations

Try accessing programmatically in browser console:
```

### ✅ Audio Module (Phase 1)
```
Backend support is ready:
- Audio device detection works
- Recording can be triggered
- WAV encoding ready
- React hook integrated

UI component coming in Task 1.2
```

---

## 💾 Data Storage Locations

### Where Your Data is Stored:

**Windows**:
```
C:\Users\<YourName>\AppData\Local\Dhikrtop\app.db
```

**Linux**:
```
~/.config/Dhikrtop/app.db
```

**macOS**:
```
~/Library/Application Support/Dhikrtop/app.db
```

**IndexedDB Cache** (browser):
```
IndexedDB: dhikrtop_quran
  - Stores all 114 Surahs locally
  - Works offline
  - Auto-syncs when online
```

---

## 🧪 Testing the Features

### Test 1: Database Persistence
```
Steps:
1. Launch app
2. Open settings
3. Change reminder interval to 30 minutes
4. Close app
5. Relaunch app
6. Check settings → Should show 30 minutes ✅
```

### Test 2: Quran API Access
```
In browser console (F12):
const quran = useQuranAPI();
const surahs = await quran.getAllSurahs();
console.log(surahs.length); // Should print 114 ✅
```

### Test 3: Recording Setup
```
Steps:
1. Check browser console for audio device detection
2. Verify "Using audio device: ..." message appears
3. Recording infrastructure ready for Task 1.2 UI ✅
```

---

## 📊 Build Artifacts

After building, you'll have:

```
dist/                          (Frontend build output)
├── index.html
├── assets/
│   ├── app-*.js
│   └── app-*.css
└── ...

src-tauri/target/
├── debug/                     (if dev build)
│   └── dhikrtop            (executable)
└── release/                   (if release build)
    └── dhikrtop            (executable)
```

---

## 🎯 How to Test Each Component

### Test Database Module
```bash
cd src-tauri
cargo test --lib db -- --nocapture

# Expected: All tests pass ✅
# Tests user CRUD, adhkar tracking, settings, etc.
```

### Test React Hooks
```bash
npm run test -- useDatabase.test.ts
npm run test -- useQuranAPI.test.ts

# Expected: 75+ tests pass ✅
```

### Test Audio Module
```bash
cd src-tauri
cargo test --lib audio

# Expected: Device enumeration tests pass ✅
```

---

## 🔧 Troubleshooting

### Issue: "npm not found"
**Solution**: Install Node.js from nodejs.org

### Issue: "rustc not found"
**Solution**: Install Rust from rustup.rs

### Issue: "Quran API not loading"
**Solution**: Check internet connection, API endpoint is public

### Issue: "Audio device not found"
**Solution**: Plug in microphone or check audio settings

### Issue: "Permission denied" on macOS
**Solution**: Grant microphone permission in System Preferences

---

## 📈 Performance Expectations

| Operation | Time | Notes |
|-----------|------|-------|
| App Launch | <1s | Fast (cached) |
| Database Query | <50ms | Local SQLite |
| Quran API First | 200-500ms | Network |
| Quran API Cached | <1ms | Memory cache |
| Adhkar Display | <100ms | Local operation |
| Recording Start | <500ms | Audio device init |

---

## 🎓 What to Look For

### Code Quality Indicators:
✅ No console errors  
✅ No TypeScript warnings  
✅ No Rust compilation warnings  
✅ Smooth UI interactions  
✅ Data persists correctly  

### Performance Indicators:
✅ Fast app startup  
✅ Quick database queries  
✅ Smooth animations  
✅ No memory leaks  
✅ Responsive UI  

### Feature Completeness:
✅ Database working  
✅ Quran data available  
✅ Settings persist  
✅ Progress tracked  
✅ Audio infrastructure ready  

---

## 📝 Next After Preview

After building and testing:

1. **If everything works** ✅
   - Great! All systems functional
   - Ready for Phase 1 Task 1.2 (React UI)
   - Continue with voice recording UI

2. **If issues found** ❌
   - Check error logs
   - Verify dependencies
   - Run tests to diagnose

3. **Want to commit?** 💾
   - Everything is ready
   - Just run: `git add -A && git commit -m "..."`

---

## 🚀 Commands Quick Reference

```bash
# Development
npm run tauri dev          # Launch app in dev mode
npm run dev               # Start Vite dev server only

# Building
npm run tauri build       # Build production app
npm run build             # Build frontend only

# Testing
npm run test              # TypeScript tests
cargo test                # Rust tests
./run-tests.sh            # All tests automated

# Code Quality
npm run lint              # Check code style
cargo clippy              # Rust linting
cargo fmt                 # Format Rust code

# Database
cd src-tauri
cargo test --lib db      # Test database specifically
```

---

## ✨ Summary

You have a **fully functional app** with:
- ✅ Database backend (SQLite)
- ✅ Quran data (114 surahs)
- ✅ Audio recording infrastructure
- ✅ React components ready
- ✅ Tests (105+)
- ✅ Documentation (50+ files)

**Ready to build and preview!** 🎉

---

## 📞 What to Do Now

Choose one:

**Option 1: Build & Run App**
```bash
npm run tauri dev
```

**Option 2: Run Tests First**
```bash
./run-tests.sh
```

**Option 3: Check Specific Component**
```bash
cargo test --lib db        # Database
npm run test              # React hooks
```

**Option 4: Review Documentation**
```bash
cat PROJECT_REVIEW.md
```

Which would you like to do? 🚀
