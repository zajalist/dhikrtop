# Dhikrtop - Windows Desktop App for Islamic Adhkar & Quran

A beautiful, intelligent **Windows desktop app** (Tauri + React) that displays Islamic adhkar (remembrances) at smart times and provides voice-powered Quran memorization features.

## 🚀 Current Status

**v0.1.0** - Production Ready ✅
- Windows tray application
- Smart adhkar reminders
- Quran reader (4 surahs)
- Beautiful Islamic UI (maroon + gold theme)
- Windows installer (NSIS + MSI)

**v0.2.0** - In Development 🚧 (Weeks 1-6)
- Voice recording & transcription
- Full Quran reader (all 114 surahs)
- Prayer times & smart reminders
- Analytics dashboard
- SQLite persistent database

## 📋 Documentation

### For Development
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** ⭐ **START HERE** - Quick commands, file structure, success criteria
- **[PHASED_IMPLEMENTATION_PLAN.md](./PHASED_IMPLEMENTATION_PLAN.md)** - Detailed 12-week roadmap for v0.2.0 → v0.3.0

### For Users
- **[WINDOWS_QUICK_START.md](./WINDOWS_QUICK_START.md)** - Installation & setup
- **[releases/RELEASES.md](./releases/RELEASES.md)** - Download links & changelog

### Technical Documentation
- **[docs/COMPREHENSIVE_PLAN.md](./docs/COMPREHENSIVE_PLAN.md)** - Original architecture & design
- **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - System design
- **[docs/ALGORITHMS.md](./docs/ALGORITHMS.md)** - Algorithm specifications

## 🏗️ Project Structure

```
/dhikrtop
├── 📖 QUICK_REFERENCE.md              ← Start here for development
├── 📖 PHASED_IMPLEMENTATION_PLAN.md    ← 12-week roadmap
├── 📦 package.json                    ← npm dependencies
├── 🦀 src-tauri/                      ← Rust backend (Tauri)
│   ├── Cargo.toml
│   ├── src/                           ← Rust source
│   └── target/                        ← Build output
├── 💻 src/                            ← React frontend
│   ├── components/                    ← React components
│   ├── windows/                       ← Setup, settings windows
│   ├── styles/                        ← CSS & tailwind
│   ├── data/                          ← Adhkar & Quran data
│   └── lib/                           ← Utilities & hooks
├── 🧪 tests/                          ← Test files
├── 📚 docs/                           ← Detailed documentation
├── 🎨 assets/                         ← Icons & designs
└── 📤 releases/                       ← Release archives
```

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Desktop**: Tauri 2.0 (Rust backend)
- **Database**: SQLite (Phase 0)
- **Voice**: Web Audio API + Web Speech API (Phase 1)
- **ML**: PyTorch (quranic_qiraat_ml module, Phase 4)
- **Build**: Vite + Cargo
- **Testing**: Vitest + Playwright

## 🚀 Quick Start (Development)

### Prerequisites
- Node.js 18+ (https://nodejs.org/)
- Rust 1.75+ (https://rustup.rs/)

### Setup
```bash
# Clone & install
git clone https://github.com/zajalist/dhikrtop.git
cd dhikrtop
npm install

# Test the app
npm run app:dev

# Build installers
npm run app:build
```

## 📅 Development Roadmap

| Version | Timeline | Features |
|---------|----------|----------|
| **v0.1.0** ✅ | March 2026 | Tray app, adhkar display, 4 surahs |
| **v0.2.0** 🚧 | Weeks 1-6 | Voice, full Quran, analytics, database |
| **v0.2.1** 📋 | Weeks 8-10 | ML tajweed detection, qiraat classification |
| **v0.3.0** 📋 | Weeks 10-12 | Cloud sync, multi-device |

See **[PHASED_IMPLEMENTATION_PLAN.md](./PHASED_IMPLEMENTATION_PLAN.md)** for detailed tasks, timelines, and success criteria.

## 💡 Key Features

### Current (v0.1.0)
✅ Windows tray integration  
✅ Smart adhkar reminders  
✅ Beautiful Islamic UI  
✅ Setup wizard  
✅ Settings panel  
✅ Quran snippets (4 surahs)  

### Coming Soon (v0.2.0)
🚧 Voice recording & playback  
🚧 Full Quran reader (114 surahs)  
🚧 Prayer time calculations  
🚧 Analytics dashboard  
🚧 SQLite persistence  

### Future (v0.3.0+)
📋 ML-powered tajweed detection  
📋 Qira'at classification  
📋 Cloud sync & multi-device  
📋 Premium features  

## 📞 Support

- **Issues**: https://github.com/zajalist/dhikrtop/issues
- **Discussions**: https://github.com/zajalist/dhikrtop/discussions
- **Docs**: See `/docs` folder for comprehensive guides

## 📄 License

MIT - See LICENSE file

---

**Created**: March 2, 2026  
**Current Version**: v0.1.0  
**Team**: Solo Development  
**Target**: Production Windows app with voice & AI features
