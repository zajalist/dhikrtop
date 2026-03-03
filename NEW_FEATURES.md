# New Features Summary

## 🎉 Enhanced Dhikrtop Features

This document summarizes all the new features and improvements made to Dhikrtop.

---

## 1. System Tray Integration ✅

### What's New
- **Minimizes to system tray** instead of closing
- **Tray icon** shows app status at all times
- **Menu integration** with right-click

### How to Use
- **Windows/Linux:** Look for tray icon in bottom-right
- **macOS:** Menu bar icon at top-right
- **Left-click:** Toggle main window visibility
- **Right-click:** Access Settings or Quit

### Implementation Details
- Built with Tauri's native tray API
- Cross-platform icon support (PNG/ICO/ICNS)
- Non-intrusive background operation

---

## 2. Smart Notification System 🔔

### Features
- **Wiggling animation** to grab attention
- **Hover to preview** full adhkar content
- **Click to navigate** directly to `/dhikr` page
- **Auto-dismiss** after configured duration
- **Multiple notifications** stacked vertically

### Customization Options
1. **Enable/Disable** notifications globally
2. **Idle Time Trigger** (30s - 10min)
   - How long you need to be inactive before reminder
3. **Minimum Interval** (5min - 60min)
   - Prevent notification spam
4. **Category Filtering**
   - Morning Adhkar
   - Evening Adhkar
   - General Remembrance
   - Before Sleep

### Technical Implementation
- React component with Motion animations
- Tauri event system integration
- Persistent storage of preferences
- Real-time idle detection (Windows/Linux/macOS)

### Smart Algorithm
```
1. Monitor user activity (mouse, keyboard, scroll)
2. When idle > threshold AND interval elapsed:
   → Trigger notification
3. Show wiggling cell at top-center
4. On hover: Expand to show full adhkar
5. On click: Navigate to /dhikr page
6. Reset timer for next notification
```

---

## 3. Auto-Start on Boot 🚀

### Platform Support
- ✅ **Windows** - Registry-based startup
- ✅ **Linux** - Desktop entry autostart
- ✅ **macOS** - LaunchAgent integration

### How to Enable
1. Open Dhikrtop
2. Go to **Settings** → **System**
3. Toggle **Launch at Startup**
4. Click **Save All Changes**

### File Locations
- **Windows:** `HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Run`
- **Linux:** `~/.config/autostart/dhikrtop.desktop`
- **macOS:** `~/Library/LaunchAgents/com.dhikrtop.app.plist`

---

## 4. Installation Wizards 📦

### Windows Installers
1. **MSI Installer**
   - Windows Installer standard
   - Enterprise deployment ready
   - Silent install support
   
2. **NSIS Installer**
   - Modern setup wizard
   - Custom branding
   - Uninstaller included

### Linux Packages
1. **DEB Package**
   - For Debian/Ubuntu systems
   - Dependency auto-resolution
   - System integration

2. **AppImage**
   - Universal Linux binary
   - No installation required
   - Portable and self-contained

### macOS Bundles
1. **DMG Disk Image**
   - Standard macOS distribution
   - Drag-to-install interface
   - Code-signed (when configured)

2. **APP Bundle**
   - Native macOS application
   - Full system integration
   - Notarization ready

---

## 5. Enhanced UI/UX 🎨

### Cleaner Interface
- Refined color palette (maroon/gold theme)
- Smooth animations throughout
- Responsive design for all screen sizes
- RTL support for Arabic text

### Improved Settings Page
- Organized into logical sections
- Visual toggle switches
- Slider controls with live values
- Category selection chips
- Instant feedback on save

### Notification Cell Design
```
┌─────────────────────────┐
│  [Icon] Time for Dhikr  │  ← Compact state (wiggles)
│  Your daily remembrance │
└─────────────────────────┘
         ↓ (on hover)
┌─────────────────────────┐
│  بِسْمِ اللَّهِ الرَّحْمَٰنِ   │  ← Expanded state
│  الرَّحِيمِ                │
│  [Perform Now] [🔊]     │
└─────────────────────────┘
```

---

## 6. Cross-Platform Compatibility 🌍

### Full Support For:
- ✅ Windows 10/11 (x64)
- ✅ Linux (Ubuntu 20.04+, Fedora, Arch)
- ✅ macOS 10.13+ (Intel & Apple Silicon)

### Platform-Specific Features:
| Feature | Windows | Linux | macOS |
|---------|---------|-------|-------|
| System Tray | ✅ | ✅ | ✅ |
| Auto-Start | ✅ | ✅ | ✅ |
| Notifications | ✅ | ✅ | ✅ |
| Idle Detection | ✅ | ✅ | ✅ |
| MSI Installer | ✅ | ❌ | ❌ |
| NSIS Installer | ✅ | ❌ | ❌ |
| DEB Package | ❌ | ✅ | ❌ |
| AppImage | ❌ | ✅ | ❌ |
| DMG | ❌ | ❌ | ✅ |

---

## 7. Persistence & Storage 💾

### Settings Storage
All preferences saved using Tauri Plugin Store:
- Notification enabled/disabled
- Idle threshold
- Minimum interval
- Selected categories
- User profile data

### Storage Locations
- **Windows:** `%APPDATA%\com.dhikrtop\`
- **Linux:** `~/.local/share/com.dhikrtop/`
- **macOS:** `~/Library/Application Support/com.dhikrtop/`

### Files
- `preferences.json` - User notification settings
- `app-state.json` - App state (setup complete, etc.)
- `dhikr_user_data` - LocalStorage for UI state

---

## 8. Developer Experience 🛠️

### New NPM Scripts
```bash
npm run app:dev           # Development mode
npm run app:build         # Build for current platform
npm run app:build:win     # Windows (MSI + NSIS)
npm run app:build:linux   # Linux (DEB + AppImage)
npm run app:build:mac     # macOS (DMG + APP)
```

### Hot Reload
- Frontend changes reload instantly
- Rust changes require restart
- Settings changes apply immediately

### Testing Notifications
```javascript
// Manual trigger in browser console
window.dispatchEvent(new CustomEvent('dhikr:notify', {
  detail: {
    id: `test_${Date.now()}`,
    title: 'Test Notification',
    subtitle: 'Testing',
    content: 'بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
    duration: 10
  }
}));
```

---

## 9. Architecture Improvements 🏗️

### Tauri Backend
- **Command System:** Type-safe Rust commands
- **Event Emitter:** Real-time communication
- **Plugin Store:** Persistent storage
- **Tray Icon Builder:** Native system integration

### React Frontend
- **React Router:** Multi-page navigation
- **Motion:** Smooth animations
- **Context-free state:** LocalStorage + Tauri Store
- **TypeScript:** Full type safety

### Idle Detection System
```rust
// Background thread monitors system idle time
loop {
    sleep(10_seconds);
    let idle = get_system_idle_time();
    let elapsed = now - last_shown;
    
    if idle >= threshold && elapsed >= min_interval {
        emit("trigger-adhkar");
        show_notification_window();
        last_shown = now;
    }
}
```

---

## 10. Security & Privacy 🔒

### Data Privacy
- ✅ All data stored locally
- ✅ No cloud sync or telemetry
- ✅ No internet connection required
- ✅ Open source and auditable

### Permissions
- **Windows:** User-level registry access only
- **Linux:** Standard file permissions
- **macOS:** Sandbox-compatible (when signed)

---

## Quick Start Guide

### For Users
1. Download installer for your platform
2. Run installation wizard
3. Complete setup wizard
4. Customize notification settings
5. Enable auto-start if desired
6. Let the app run in background

### For Developers
1. Clone repository
2. `npm install`
3. `npm run app:dev`
4. Make changes
5. Test thoroughly
6. Build: `npm run app:build`

---

## What's Next?

### Planned Features
- [ ] Multiple language support (beyond Arabic/English)
- [ ] Qibla direction finder
- [ ] Prayer time integration
- [ ] Advanced scheduling (specific times of day)
- [ ] Sound effects for notifications
- [ ] Custom adhkar collections
- [ ] Cloud sync (optional)
- [ ] Mobile companion app

### Feedback Welcome
Open an issue on GitHub with suggestions or bug reports!

---

**Version:** 0.1.0  
**Last Updated:** March 3, 2026  
**Tech Stack:** Tauri 2.0 • React 18 • TypeScript • Rust • Vite
