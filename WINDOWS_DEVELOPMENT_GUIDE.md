# Windows Testing Guide

This guide helps you easily test the Dhikrtop application on Windows from VS Code.

## Prerequisites on Windows

1. **Install Node.js** (v18 or later)
   - Download from https://nodejs.org/
   - Check installation: `node --version`

2. **Install Rust** (for Tauri development)
   - Download from https://rustup.rs/
   - During installation, choose the MSVC toolchain option
   - Check installation: `rustc --version`

3. **Install Visual Studio Build Tools** (required for MSVC)
   - Download from https://visualstudio.microsoft.com/visual-cpp-build-tools/
   - Install "Desktop development with C++"

4. **Install WebView2 Runtime** (required for Tauri)
   - Download from https://developer.microsoft.com/en-us/microsoft-edge/webview2/
   - Install the "Evergreen Standalone Installer"

## Quick Start on Windows

### 1. Open the project in VS Code
```bash
git clone https://github.com/zajalist/dhikrtop.git
cd dhikrtop
code .
```

### 2. Install Dependencies
- Press `Ctrl+Shift+B` → Select "Frontend: Install & Build"
- Or run in terminal: `npm install`

### 3. Run in Development Mode
- Press `Ctrl+Shift+D` → Select "Tauri: Dev (Windows)"
- Or press `F5` to start debugging
- The app window will open with hot-reload enabled

### 4. Build Release Version
- Press `Ctrl+Shift+B` → Select "Tauri: Build (Windows Release)"
- Binary will be at: `src-tauri/target/release/dhikrtop.exe`

### 5. Build Installers (MSI + NSIS)
- Press `Ctrl+Shift+B` → Select "Tauri: Build (Windows MSI + NSIS)"
- Installers will be at:
  - `src-tauri/target/release/bundle/msi/Dhikrtop_0.1.0_x64_en-US.msi`
  - `src-tauri/target/release/bundle/nsis/Dhikrtop_0.1.0_x64-setup.exe`

### 6. Open Release Folder
- Press `Ctrl+Shift+B` → Select "Open Release Folder"
- This opens the folder with built executables/installers

## Keyboard Shortcuts in VS Code (Windows)

- `Ctrl+Shift+B` - Open Task menu (Build tasks)
- `F5` - Start debugging (runs dev task)
- `Ctrl+Shift+D` - Open Debug/Run panel
- `Ctrl+\`` - Toggle terminal

## Troubleshooting

### "cargo not found"
- Restart VS Code or terminal after installing Rust
- Check: `rustc --version`

### "npm permission denied"
- Run VS Code as Administrator

### WebView2 errors
- Install WebView2 Runtime from: https://developer.microsoft.com/en-us/microsoft-edge/webview2/

### Build fails with MSVC errors
- Install Visual Studio Build Tools (see Prerequisites)
- Ensure "Desktop development with C++" workload is installed

## Testing Checklist

- [ ] App launches in dev mode (Ctrl+Shift+B → "Tauri: Dev")
- [ ] UI renders correctly
- [ ] Adhkar card displays
- [ ] Settings window opens
- [ ] App system tray integration works
- [ ] Release build succeeds
- [ ] Installer (setup.exe) installs correctly
- [ ] Installed app works standalone

## Next Steps

After building installers (setup.exe):
1. Test the installer on a clean Windows machine
2. Upload to GitHub Releases (automated via CI/CD)
3. Share with users!

Happy testing! 🎉
