# Installer Build Guide

This guide covers building Dhikrtop installers for Windows, Linux, and macOS.

## Features Implemented

### ✨ New Features

1. **System Tray Integration**
   - App minimizes to system tray
   - Right-click tray icon for menu (Settings, Quit)
   - Left-click to toggle main window

2. **Smart Notifications**
   - Wiggling notification cell at top-center of screen
   - Hover to preview the adhkar content
   - Click to navigate to `/dhikr` page
   - Fully customizable intervals and categories

3. **Auto-Start on Boot**
   - Windows: Registry-based startup
   - Linux: Desktop entry in `~/.config/autostart/`
   - macOS: Launch Agent plist
   - Toggle from Settings page

4. **Customizable Notification Settings**
   - Enable/disable notifications
   - Idle time trigger (0.5 - 10 minutes)
   - Minimum interval between notifications (5 - 60 minutes)
   - Category filtering (Morning, Evening, General, Sleep)
   - All settings persist across sessions

## Prerequisites

### Windows
- [Rust](https://rustup.rs/)
- [Node.js](https://nodejs.org/) (v18+)
- [Visual Studio Build Tools](https://visualstudio.microsoft.com/downloads/)
- [WiX Toolset](https://wixtoolset.org/) (for MSI installer)

### Linux
- Rust, Node.js
- Build essentials: `sudo apt install build-essential libssl-dev libgtk-3-dev libwebkit2gtk-4.1-dev librsvg2-dev`
- For AppImage: `sudo apt install libfuse2`

### macOS
- Xcode Command Line Tools: `xcode-select --install`
- Rust, Node.js

## Build Commands

### Development Mode
```bash
npm run app:dev
```

### Production Builds

#### Windows
Build both MSI and NSIS installers:
```bash
npm run app:build:win
```

Outputs:
- `src-tauri/target/release/bundle/msi/Dhikrtop_0.1.0_x64_en-US.msi`
- `src-tauri/target/release/bundle/nsis/Dhikrtop_0.1.0_x64-setup.exe`

#### Linux
Build DEB and AppImage:
```bash
npm run app:build:linux
```

Outputs:
- `src-tauri/target/release/bundle/deb/dhikrtop_0.1.0_amd64.deb`
- `src-tauri/target/release/bundle/appimage/dhikrtop_0.1.0_amd64.AppImage`

#### macOS
Build DMG and APP bundle:
```bash
npm run app:build:mac
```

Outputs:
- `src-tauri/target/release/bundle/dmg/Dhikrtop_0.1.0_x64.dmg`
- `src-tauri/target/release/bundle/macos/Dhikrtop.app`

#### All Platforms (Universal)
```bash
npm run app:build
```

## Installation

### Windows
1. Run the `.msi` or `.exe` installer
2. Follow the setup wizard
3. Enable "Launch at startup" in Settings if desired

### Linux
**DEB Package:**
```bash
sudo dpkg -i dhikrtop_0.1.0_amd64.deb
```

**AppImage:**
```bash
chmod +x dhikrtop_0.1.0_amd64.AppImage
./dhikrtop_0.1.0_amd64.AppImage
```

### macOS
1. Open the `.dmg` file
2. Drag Dhikrtop to Applications folder
3. Open from Applications (you may need to allow in Security & Privacy settings)

## Usage Guide

### First Launch
- Setup wizard will guide you through initial configuration
- Choose your preferred dhikr categories
- Set your name (optional)

### System Tray
- **Windows/Linux:** Look for the tray icon in the system tray
- **macOS:** Icon appears in the menu bar
- Click to show/hide main window
- Right-click for menu

### Smart Notifications
1. Go to **Settings** → **Smart Notifications**
2. Enable notifications
3. Adjust idle time trigger (how long you're inactive before reminder)
4. Set minimum interval (wait time between reminders)
5. Select dhikr categories you want
6. Click **Save All Changes**

### Auto-Start
1. Go to **Settings** → **System**
2. Toggle **Launch at Startup**
3. Click **Save All Changes**

### Notification Interaction
When a notification appears:
- **Wiggle animation** draws your attention
- **Hover** over it to preview the dhikr text
- **Click "Perform Now"** to open the dhikr page
- **Click X** to dismiss

## Troubleshooting

### Windows
- **Installer won't run:** Right-click → "Run as administrator"
- **Smart Screen warning:** Click "More info" → "Run anyway"
- **Startup not working:** Check Windows Task Manager → Startup tab

### Linux
- **AppImage won't run:** `chmod +x` and install `libfuse2`
- **Missing libraries:** Install GTK3 and WebKit2GTK dependencies
- **Autostart not working:** Check `~/.config/autostart/dhikrtop.desktop`

### macOS
- **"App can't be opened":** System Preferences → Security & Privacy → Open Anyway
- **Notifications not working:** Grant notification permissions in System Preferences
- **Autostart issues:** Check `~/Library/LaunchAgents/com.dhikrtop.app.plist`

## Advanced Configuration

### Custom Build Options

Target specific architecture:
```bash
cargo tauri build -- --target x86_64-pc-windows-msvc
cargo tauri build -- --target x86_64-unknown-linux-gnu
cargo tauri build -- --target aarch64-apple-darwin
```

Debug build for testing:
```bash
cargo tauri build --debug
```

### Environment Variables
- `TAURI_PRIVATE_KEY`: For update signing
- `TAURI_KEY_PASSWORD`: Key password for updates

## File Locations

### Windows
- Settings: `%APPDATA%\com.dhikrtop\preferences.json`
- App State: `%APPDATA%\com.dhikrtop\app-state.json`

### Linux
- Settings: `~/.local/share/com.dhikrtop/preferences.json`
- App State: `~/.local/share/com.dhikrtop/app-state.json`
- Autostart: `~/.config/autostart/dhikrtop.desktop`

### macOS
- Settings: `~/Library/Application Support/com.dhikrtop/preferences.json`
- App State: `~/Library/Application Support/com.dhikrtop/app-state.json`
- Launch Agent: `~/Library/LaunchAgents/com.dhikrtop.app.plist`

## Development Tips

### Hot Reload
Changes to frontend code hot-reload automatically in dev mode.

### Rust Changes
After modifying Rust code, restart dev server:
```bash
# Ctrl+C to stop
npm run app:dev
```

### Testing Notifications
Trigger manually in browser console:
```javascript
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

## Support

For issues or questions:
- Check the main [README.md](README.md)
- Review [DOCUMENTATION_INDEX.md](docs/DOCUMENTATION_INDEX.md)
- Open an issue on GitHub

---

**Built with:** Tauri 2.0 • React 18 • Vite • TypeScript
