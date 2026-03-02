# Windows Build Quick Start

## For Users Installing Dhikrtop

Simply **download and run** the installer:
- `Dhikrtop_0.1.0_x64-setup.exe`

The installer will:
1. Install the app to `C:\Users\<YourName>\AppData\Local\Dhikrtop`
2. Create shortcuts on Desktop and Start Menu
3. Launch the setup wizard on first run
4. Configure tray integration and preferences

## For Developers Building on Windows

### Prerequisites (First Time Only)

```powershell
# 1. Install Rust (https://rustup.rs/)
# 2. Install Node.js (https://nodejs.org/)
# 3. Install Visual Studio Build Tools
```

### Build Commands

```powershell
# Clone the repository
git clone <repo-url>
cd dhikrtop

# Install dependencies
npm install

# Test the app in dev mode (opens app window)
npm run app:dev

# Build the installer
npm run app:build
```

### Output Files

After `npm run app:build`, installers are in:
```
src-tauri/target/release/
├─ Dhikrtop_0.1.0_x64-setup.exe      ← NSIS Installer (recommended)
└─ Dhikrtop_0.1.0_x64.msi             ← MSI Installer (alternative)
```

## Features on First Install

✅ **Setup Wizard** (4 steps)
- Select language (English/Arabic)
- Configure reminder interval
- Enable/disable popups & sounds
- Choose to start on boot

✅ **System Tray**
- Click icon to toggle reminders
- Right-click menu: Settings, Quit
- Minimizes to tray (not taskbar)

✅ **Auto-Start**
- If enabled in setup, app launches with Windows
- Runs silently in background

## Building for Release

To create a release build:

```powershell
# Build with optimizations
npm run app:build

# Sign the installer (optional, for distribution)
# Set up code signing certificate in tauri.conf.json
```

## Troubleshooting

| Error | Solution |
|-------|----------|
| "CC environment variable not set" | Install Visual Studio Build Tools |
| WebView2 not found | Download WebView2 Runtime |
| Tray icon missing | Ensure `icons/tray.png` exists |

## Configuration Files

- **App settings**: `%APPDATA%\Dhikrtop\preferences.json`
- **App state**: `%APPDATA%\Dhikrtop\app-state.json`
- **Logs**: `%APPDATA%\Dhikrtop\logs\`

## Next Steps

- Customize reminds content in React components
- Add more Quranic verses in database
- Configure auto-updates
- Set up distribution servers
