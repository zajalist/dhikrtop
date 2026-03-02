# Building Dhikrtop for Windows

This guide explains how to build and distribute Dhikrtop as a Windows app with an installer.

## Prerequisites

On your **Windows machine**, you need:

1. **Rust & Cargo** — https://rustup.rs/
   - Choose "Default Installation"
   - Verify: `rustc --version && cargo --version`

2. **Node.js & npm** — https://nodejs.org/ (LTS version)
   - Verify: `node --version && npm --version`

3. **Visual Studio Build Tools** (for C++ compilation)
   - Option A: Install [Visual Studio 2022 Community](https://visualstudio.microsoft.com/downloads/) with "Desktop development with C++"
   - Option B: Install [Visual Studio Code](https://code.visualstudio.com/) + [C++ extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cpptools)

4. **WebView2 Runtime** (usually installed with Windows 11)
   - Download: https://developer.microsoft.com/en-us/microsoft-edge/webview2/

## Setup Steps

### 1. Clone the Project on Windows

```bash
git clone https://github.com/yourusername/dhikrtop.git
cd dhikrtop
```

### 2. Install Dependencies

```bash
# Install Node dependencies
npm install

# Install Rust dependencies (this will take time on first build)
cd src-tauri
cargo build
cd ..
```

### 3. Build for Windows Development

To test the app locally on Windows before building the installer:

```bash
npm run app:dev
```

This will:
- Start the Vue dev server
- Open the Tauri app in dev mode
- Show a setup wizard on first run
- Create system tray integration

### 4. Build the Installer

To create a Windows installer (.msi or .exe):

```bash
npm run app:build
```

This creates:
- **NSIS Installer**: `src-tauri/target/release/Dhikrtop_<version>_x64-setup.exe` (recommended)
- **MSI Installer**: `src-tauri/target/release/Dhikrtop_<version>_x64.msi`

### 5. Distribute the Installer

The installer file is ready to download and share. Users can:
1. Download `Dhikrtop_<version>_x64-setup.exe`
2. Run it to install Dhikrtop
3. Launch from Start Menu or desktop shortcut
4. See the setup wizard on first run

## Features Included

### First-Time Setup
- 4-step setup wizard
- Language selection (English/Arabic)
- Reminder interval configuration
- Popup & sound preferences
- Windows startup option

### System Tray Integration
- App runs in system tray
- Click tray icon to toggle adhkar popup
- Right-click menu: Settings, Quit
- Launches automatically if "Start on Boot" enabled

### Auto-Updates (Optional)
To add auto-updates, configure Tauri's updater in `src-tauri/tauri.conf.json`:

```json
{
  "updater": {
    "active": true,
    "endpoints": ["https://updates.example.com/{{target}}/{{current_version}}"],
    "dialog": true,
    "pubkey": "..."
  }
}
```

## Troubleshooting

### "Microsoft Visual C++ Redistributable Required"
- Download from: https://support.microsoft.com/en-us/help/2977003/

### WebView2 Issues
- Ensure WebView2 Runtime is installed: https://developer.microsoft.com/en-us/microsoft-edge/webview2/

### Build Fails with Rust Errors
```bash
# Clear build cache
cargo clean

# Update Rust
rustup update

# Try again
npm run app:build
```

### Tray Icon Not Showing
- Ensure `icons/tray.png` exists in `src-tauri/` directory
- Try restarting Windows Explorer: `taskkill /f /im explorer.exe && explorer.exe`

## File Structure for Release

```
Dhikrtop_0.1.0_x64-setup.exe      ← Users download this
├─ Installs to: C:\Users\<user>\AppData\Local\Dhikrtop
├─ Creates: Start Menu shortcut
├─ Creates: Desktop shortcut (optional)
└─ Registers: Startup registry entry (if enabled)
```

## Next Steps

1. **Code Sign the Installer** (for enterprise/distribution)
   - Obtain a code signing certificate
   - Update `src-tauri/tauri.conf.json` with signing details

2. **Set Up Auto-Update** (for easy version distribution)
   - Configure updater endpoints
   - Host releases on a server

3. **Customize Installer**
   - Add company logo
   - Customize welcome screens
   - Add license agreement

## Building on Different Architectures

### For 64-bit (x86_64) - Recommended
```bash
npm run app:build
```

### For 32-bit (i686)
```bash
cargo install cargo-ndk
cargo ndk --target i386-pc-windows-msvc build --release
```

## Performance Tips

- First build: **15-30 minutes** (downloads dependencies)
- Subsequent builds: **3-5 minutes**
- Use SSD for faster compilation
- Close unnecessary programs to free RAM

## Support

For issues:
1. Check Tauri docs: https://tauri.app/
2. Check Rust/Cargo issues: https://github.com/rust-lang/rust
3. Review WebView2 documentation: https://learn.microsoft.com/en-us/microsoft-edge/webview2/
