# Quick Reference: Dhikrtop Development

## 🚀 Start Here

**Goal**: Build v0.2.0 in 6-8 weeks with voice, full Quran, and analytics

**Your answers**:
- Prioritize: Database + Voice + Core features equally
- Release strategy: v0.2.0 without ML, v0.2.1 with ML
- Quran data: Pull all 114 surahs from Quran.com API
- Team: Solo development
- Action: Sync with origin/main first

---

## 📅 Timeline at a Glance

```
Weeks 1-2   → Phase 0: Database (SQLite, localStorage migration)
Weeks 2-4   → Phase 1: Voice (Recording, transcription, playback)
Weeks 3-5   → Phase 2: Core (QuranReader, prayer times, analytics)
Weeks 6-7   → Phase 3: v0.2.0 Release
Weeks 8-10  → Phase 4: ML features (v0.2.1)
Weeks 10-12 → Phase 5: Cloud sync (v0.3.0)
```

---

## 🔴 Critical Path: DO THESE FIRST

### Week 1 (This Week)
- [ ] Sync git: `git pull origin main`
- [ ] Task 0.2: Create Rust database module (`src-tauri/src/db.rs`)
- [ ] Task 0.6: Integrate Quran.com API (`src/lib/useQuranAPI.ts`)
- [ ] Task 0.1: Finalize SQLite schema (`src-tauri/src/schema.rs`)
- [ ] Task 0.3: Add Tauri database commands
- [ ] Task 0.4: Create React database hooks

### Week 2
- [ ] Task 0.5: Implement localStorage → SQLite migration
- [ ] Task 0.7: Database testing
- [ ] Start Tasks 1.1-1.2 (Voice recording module)
- [ ] Start Tasks 2.1-2.2 (Prayer times, smart reminders)

---

## 📂 File Structure (New Files to Create)

### Phase 0: Database
```
src-tauri/src/
├── schema.rs          (NEW) - SQLite schema
├── db.rs              (NEW) - Database module
└── commands.rs        (UPDATE) - Add DB commands

src/lib/
├── useDatabase.ts     (NEW) - React hooks
├── migration.ts       (NEW) - localStorage → SQLite
└── useQuranAPI.ts     (NEW) - Quran.com API

src/components/
└── dashboard/
    └── MLAnalytics.tsx (NEW) - Analytics component
```

### Phase 1: Voice
```
src/lib/
├── useAudioRecording.ts     (NEW) - Recording module
├── useSpeechRecognition.ts  (NEW) - Transcription

src/components/voice/
├── VoiceRecorder.tsx        (NEW) - Recording UI
└── AudioPlayer.tsx          (NEW) - Playback UI

tests/
└── voice.test.ts            (NEW) - Voice tests
```

### Phase 2: Core
```
src/lib/
├── usePrayerTimes.ts        (NEW) - Prayer calculation
└── useSmartReminders.ts     (NEW) - Reminder logic

src/components/dashboard/
├── Dashboard.tsx            (NEW) - Analytics dashboard
├── VoiceAnalytics.tsx       (NEW) - Voice stats
└── AchievementsList.tsx     (NEW) - Badges

src/components/quran/
└── QuranReader.tsx          (UPDATE) - Add all features

src/windows/settings/
└── SettingsWindow.tsx       (UPDATE) - Complete settings
```

---

## 🔧 Commands You'll Need

### Development
```bash
npm run app:dev           # Launch Tauri dev app
npm run build             # Build frontend
npm run test              # Run tests
npm run test:ui           # UI test runner
```

### Building for Release
```bash
npm run app:build         # Build Windows installers
# Outputs: src-tauri/target/release/bundle/nsis/*.exe
#          src-tauri/target/release/bundle/msi/*.msi
```

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/phase0-database

# Make changes...

# Commit
git add .
git commit -m "feat: Add SQLite database module

- Create schema with 5 tables
- Implement CRUD operations
- Add Tauri commands"

# When done, merge to main
git checkout main
git merge feature/phase0-database
git push origin main
```

---

## 🎯 Key Dependencies

### New npm packages to add:
```bash
npm install adhan                    # Prayer times calculation
npm install sqlx --save-dev          # Rust SQLite (in Cargo.toml)
```

### Quran.com API (Free, No Key Needed)
```
GET https://api.alquran.cloud/v1/surah
GET https://api.alquran.cloud/v1/surah/{number}/en.asad
```

### Already Installed
```
react@18.3           - UI
tauri@2.0           - Desktop
typescript@5.6      - Types
vitest@1.0          - Testing
lucide-react        - Icons
motion@12.23        - Animations
```

---

## 📊 Success Metrics per Phase

### Phase 0 (Database)
- [ ] All 5 tables created and working
- [ ] 100+ CRUD operations tested
- [ ] localStorage migration < 100ms
- [ ] All 114 Surahs loaded from API
- [ ] Zero data loss on app restart

### Phase 1 (Voice)
- [ ] Recording: 30+ minute sessions
- [ ] Transcription: 90%+ accuracy (Arabic)
- [ ] Playback: 0.75x-2.0x speed
- [ ] Database: Recordings persist
- [ ] UI: <200ms response time

### Phase 2 (Core)
- [ ] Prayer times: ±2 min accuracy
- [ ] Smart reminders: <5s trigger latency
- [ ] Analytics: <500ms to render
- [ ] QuranReader: All 114 surahs, <100ms load
- [ ] Settings: 100% persistence

### Phase 3 (Release)
- [ ] v0.2.0 builds without errors
- [ ] Both installers (NSIS + MSI) work
- [ ] Tagged in git
- [ ] GitHub release published
- [ ] Windows defender doesn't flag it

---

## ⚠️ Known Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Quran.com API downtime | Phase 0 blocked | Cache 114 surahs locally |
| SQLite migration corruption | Data loss | Backup localStorage first |
| Audio recording bugs | Phase 1 delayed | Test on real Windows machine early |
| Prayer time calculations off | Users frustrated | Validate against manual times |
| ML datasets download slow | Phase 4 delayed | Monitor weekly, parallel work on v0.2.0 |
| Windows installer won't uninstall | User support burden | Test uninstaller on VM |
| Bundle size too large | Update slow | Use lazy loading, tree shaking |

---

## 📞 External Resources

### Documentation
- Full plan: `PHASED_IMPLEMENTATION_PLAN.md` (this directory)
- Tauri docs: https://tauri.app/en/develop/
- Quran.com API: https://quran.com/api (open, no auth needed)
- SQLite Rust: https://github.com/launchbadge/sqlx
- Adhan library: https://github.com/batoulapps/Adhan_JavaScript

### Debugging
- Tauri dev: `npm run app:dev` then F12 for devtools
- Rust errors: Check `src-tauri/src/` compilation messages
- API issues: Test at https://api.alquran.cloud/v1/surah in browser

### Community
- GitHub Issues: Report bugs you find
- Stack Overflow: Tag with `tauri` + `typescript`
- Tauri Discord: Ask for help (link in tauri.app docs)

---

## 💡 Pro Tips

1. **Test on Windows Early**: Don't wait until Phase 3. Test voice, API calls, etc. on real Windows machine as soon as you have code.

2. **Database Backups**: Always commit git before major migrations. SQLite can corrupt if power lost.

3. **Parallel Development**: Don't wait for Phase 0 to 100% complete. Start Phase 1/2 tasks while testing Phase 0.

4. **Commit Often**: Small commits make debugging easier. Commit after each Task completes.

5. **Track Blockers**: If something takes >30 min to debug, note it and ask for help.

6. **Performance**: Test bundle size with `npm run build` each phase. Should stay under 300KB (gzipped).

7. **Version Numbers**: Keep package.json, Cargo.toml, and tauri.conf.json in sync during releases.

8. **User Data**: Never delete user data without warning. Always provide export option.

---

## 🎯 Definition of Done (Per Phase)

### Phase 0 Complete When:
- ✅ All database operations tested
- ✅ localStorage data migrates without errors
- ✅ All 114 Surahs fetch and cache correctly
- ✅ App restart: data still there
- ✅ Committed to git with clear messages

### Phase 1 Complete When:
- ✅ Record voice for 30+ minutes
- ✅ Playback with speed controls
- ✅ Transcription shown to user
- ✅ Saved to database
- ✅ Tests passing (>70% coverage)

### Phase 2 Complete When:
- ✅ Prayer times auto-calculate
- ✅ Smart reminders trigger
- ✅ Analytics dashboard shows all metrics
- ✅ QuranReader displays all 114 surahs
- ✅ Settings persist across restarts

### Phase 3 Complete When:
- ✅ v0.2.0 tagged in git
- ✅ Both installers built and tested
- ✅ GitHub release published
- ✅ Release notes in RELEASES.md
- ✅ Ready for users to download

---

## 🚀 Ready?

1. Open terminal: `cd /home/zajalist/projects/dhikrtop`
2. Sync git: `git pull origin main`
3. Start Phase 0: Read `PHASED_IMPLEMENTATION_PLAN.md` Week 1 section
4. Open VS Code: `code .`
5. Start Task 0.2: Create `src-tauri/src/db.rs`

**You've got this! 🎯**

---

**Created**: March 2, 2026  
**For**: Solo development  
**Duration**: 10-12 weeks to v0.3.0  
**Target**: Production-ready Windows app with voice, full Quran, analytics, ML features, and cloud sync
