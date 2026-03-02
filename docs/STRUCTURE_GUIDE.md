# Dhikrtop Project Structure Overview

## Repository Organization

```
/dhikrtop
├── /docs/                          # 📚 Documentation (agentic-ready)
│   ├── COMPREHENSIVE_PLAN.md       # Full 4-phase development roadmap
│   ├── ARCHITECTURE.md             # System design & data flow
│   ├── ALGORITHMS.md               # Algorithm specifications & logic
│   ├── API_AND_TESTING.md          # API reference & test strategy
│   ├── USER_GUIDE.md               # User documentation
│   └── [DEVELOPER_SETUP.md]        # (To be created in Phase 1)
│
├── /tests/                         # 🧪 Test Suite (agentic-ready)
│   ├── /unit/                      # Unit tests (Phase 2)
│   ├── /integration/               # Integration tests (Phase 3)
│   ├── /e2e/                       # End-to-end tests (Phase 4)
│   └── /fixtures/                  # Test data & mocks (Phase 1)
│
├── /src/                           # 💻 Source Code (To be created)
│   ├── /background/                # Service Worker (MV3)
│   │   ├── index.ts
│   │   ├── listeners.ts
│   │   ├── activityDetector.ts
│   │   ├── smartEngine.ts
│   │   ├── shortcuts.ts
│   │   └── storage.ts
│   ├── /content/                   # Content Scripts
│   │   └── index.ts
│   ├── /popup/                     # Extension Popup UI (React)
│   │   ├── App.tsx
│   │   ├── index.tsx
│   │   └── /styles
│   ├── /options/                   # Settings Page (React)
│   │   ├── App.tsx
│   │   ├── index.tsx
│   │   └── /styles
│   ├── /sidepanel/                 # Side Panel UI (React)
│   │   ├── App.tsx
│   │   ├── index.tsx
│   │   ├── components/
│   │   │   ├── AdhkarDisplay.tsx
│   │   │   └── QuranSession.tsx
│   │   └── /styles
│   ├── /shared/                    # Shared Code
│   │   ├── /types                  # TypeScript interfaces
│   │   ├── /constants              # App constants
│   │   ├── /storage                # Database & storage layer
│   │   │   ├── adhkarDB.ts
│   │   │   └── userPrefs.ts
│   │   ├── /utils                  # Helper functions
│   │   ├── /quran                  # Quran logic
│   │   ├── /voice                  # Voice recognition
│   │   └── /activityDetection      # Activity monitoring
│   └── /manifest.json              # Chrome Extension Manifest v3
│
├── /public/                        # Static Assets (To be created)
│   ├── /icons/                     # Extension icons
│   └── /images/                    # Other images
│
├── .gitignore                      # Git ignore rules
├── README.md                       # Project overview
├── [package.json]                  # Node dependencies (Phase 1)
├── [tsconfig.json]                 # TypeScript config (Phase 1)
├── [vite.config.ts]                # Vite config (Phase 1)
└── [tailwind.config.js]            # Tailwind config (Phase 1)
```

## Files Currently Created ✅

✅ `/docs/COMPREHENSIVE_PLAN.md` - Full 4-phase development roadmap with timelines
✅ `/docs/ARCHITECTURE.md` - System architecture, data flows, and module responsibilities
✅ `/docs/ALGORITHMS.md` - Detailed algorithm specifications (5 core algorithms)
✅ `/docs/API_AND_TESTING.md` - API reference and testing strategies
✅ `/docs/USER_GUIDE.md` - Complete user documentation
✅ `/README.md` - Project overview
✅ `/.gitignore` - Git ignore rules
✅ `/src/.gitkeep` - Source folder placeholder
✅ `/docs/.gitkeep` - Documentation placeholder
✅ `/tests/.gitkeep` - Tests folder placeholder

## What's Ready for Agentic Development

### ✨ Phase 1: Foundation Setup
- **Documentation**: Complete ✅
- **Project Structure**: Defined ✅
- **Ready to execute**:
  - Initialize package.json with dependencies
  - Configure TypeScript, Vite, and build tools
  - Set up Chrome Manifest v3
  - Create base React components
  - Set up CI/CD pipeline (GitHub Actions)

### 📋 Phase 2: Core Intelligence & Adhkar
- **Algorithms**: Fully specified ✅
- **Data structures**: Defined ✅
- **API specs**: Complete ✅
- **Ready to execute**:
  - Activity detection implementation
  - Adhkar database seeding
  - Smart display algorithm
  - Notification UI
  - IndexedDB storage layer

### 🎓 Phase 3: Quran & Voice
- **Algorithms**: Fully specified ✅
- **Voice integration**: Planned ✅
- **Session management**: Designed ✅
- **Ready to execute**:
  - Quran data integration
  - Session manager
  - Voice recognition layer
  - Keyboard shortcut routing
  - Settings panel

### 🚀 Phase 4: Testing & Deployment
- **Test strategy**: Complete ✅
- **Benchmarks**: Defined ✅
- **Coverage goals**: Set ✅
- **Ready to execute**:
  - Test suite implementation
  - Documentation finalization
  - Chrome Web Store submission
  - Release notes

---

## Development Workflow

### For Agents to Follow:

1. **Phase 1 Agent** (`setup-agent`):
   - Read: `/docs/COMPREHENSIVE_PLAN.md` (Phase 1 section)
   - Execute: Initialize project structure
   - Create: `package.json`, `tsconfig.json`, `vite.config.ts`, etc.

2. **Phase 2 Agent** (`detection-and-adhkar-agent`):
   - Read: `/docs/ALGORITHMS.md` (Sections 1-2)
   - Read: `/docs/ARCHITECTURE.md` (Activity Detection & Data Storage)
   - Read: `/docs/API_AND_TESTING.md` (Module APIs 1-2)
   - Execute: Implement ActivityDetector, AdhkarDatabase, SmartDisplayEngine

3. **Phase 3 Agent** (`quran-and-voice-agent`):
   - Read: `/docs/ALGORITHMS.md` (Sections 3-5)
   - Read: `/docs/ARCHITECTURE.md` (Quran module)
   - Read: `/docs/API_AND_TESTING.md` (Module APIs 3-6)
   - Execute: Implement Quran sessions, voice, shortcuts

4. **Phase 4 Agent** (`testing-deployment-agent`):
   - Read: `/docs/API_AND_TESTING.md` (Testing Strategy & CI/CD)
   - Read: `/docs/COMPREHENSIVE_PLAN.md` (Phase 4 section)
   - Execute: Tests, documentation, Chrome Web Store setup

---

## Key Decision Points (Pre-Execution)

Before starting Phase 1, confirm:

1. **Package Manager**: npm (default), yarn, or pnpm?
2. **React Version**: 18.x or 19.x?
3. **Styling**: Tailwind CSS + CSS Modules, or alternatives?
4. **Testing**: Vitest + Playwright, or Jest + Cypress?
5. **Linting**: ESLint + Prettier, or Biome?
6. **Cloud Sync**: Firebase (Phase 4+), or local-only?
7. **Analytics**: None (default), or Privacy-first alternative?

---

## Code Quality Standards

### Linting & Formatting
- ESLint (config ready in Phase 1)
- Prettier (single config for all languages)
- GitHub pre-commit hooks

### Testing
- Min 70% code coverage (Phase 4)
- 100% critical path coverage
- Integration tests for all user flows
- E2E smoke tests

### TypeScript
- Strict mode enabled
- No implicit `any`
- 100% type coverage for APIs

### Security
- Content Security Policy (CSP) headers
- XSS prevention (input sanitization)
- No eval() or dynamic code execution
- Regular CVE dependency checks

---

## Success Criteria

### Phase 1
- ✅ Project builds without errors
- ✅ TypeScript strict mode passes
- ✅ All linters pass
- ✅ Hello world extension loads in Chrome

### Phase 2
- ✅ Activity detection accurate (>90%)
- ✅ 200 adhkar in database
- ✅ Adhkar display tests pass
- ✅ UI looks good in dark/light mode

### Phase 3
- ✅ Quran data fully integrated
- ✅ Voice recognition works (>75% accuracy)
- ✅ Sessions complete and score correctly
- ✅ All keyboard shortcuts functional

### Phase 4
- ✅ 70%+ code coverage
- ✅ All tests passing
- ✅ Performance benchmarks met
- ✅ Ready for Chrome Web Store submission

---

## Communication Between Agents

### Message Protocol
```typescript
interface AgentHandoff {
  phase: number;
  previousAgent: string;
  currentAgent: string;
  status: 'complete' | 'blocked' | 'partial';
  blockers?: string[];
  deliverables: string[];
  nextSteps: string[];
  readDocuments: string[];
}
```

### Checkpoints
- Phase 1 → Phase 2: After setup, before implementation
- Phase 2 → Phase 3: After adhkar, before voice
- Phase 3 → Phase 4: After voice, before testing
- Phase 4 → Ready: After full test suite

---

## Quick Reference Links

- 📖 [User Guide](docs/USER_GUIDE.md) - For user-facing features
- 🏗️ [Architecture](docs/ARCHITECTURE.md) - For system design
- 🔬 [Algorithms](docs/ALGORITHMS.md) - For implementation details
- 🧪 [Testing & API](docs/API_AND_TESTING.md) - For development

---

## Contact & Contributions

- **Author**: zajalist
- **Status**: Phase 1 Pending (Foundation Setup)
- **GitHub**: https://github.com/zajalist/dhikrtop
- **Issues**: Report via GitHub or email

---

**Last Updated**: March 1, 2026  
**Workspace Status**: Ready for Agentic Development ✅
