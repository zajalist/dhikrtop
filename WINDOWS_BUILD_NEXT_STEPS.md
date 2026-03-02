# 📦 Next: Build Dhikrtop on Windows

Everything is configured and ready! Here's what to do next:

## Step 1: Get the Code to Windows

### Option A: Using Git
```powershell
git clone https://github.com/yourusername/dhikrtop.git
cd dhikrtop
```

### Option B: Copy from WSL
If code is already in WSL, copy to Windows:
```powershell
# On Windows PowerShell
robocopy "\\wsl$\Ubuntu\home\zajalist\projects\dhikrtop" "C:\Dev\dhikrtop" /E /XD node_modules src-tauri\target
```

---

## Step 2: Install Prerequisites (Windows Machine)

Wait ⏳ You mentioned you're working **in WSL**. Here's important info:

### Option A: Build on Windows Natively (Recommended)
If you can access a Windows machine:

1. **Install Rust**
   ```powershell
   # Download installer from https://rustup.rs/
   # Run the installer, choose Default installation
   ```

2. **Install Node.js**
   ```powershell
   # Download from https://nodejs.org/
   # Get LTS version
   ```

3. **Install Visual Studio Build Tools**
   ```powershell
   # Download from:
   # https://visualstudio.microsoft.com/visual-cpp-build-tools/
   # Run installer, select "Desktop development with C++"
   ```

4. **Install WebView2 Runtime**
   ```powershell
   # Download from:
   # https://developer.microsoft.com/en-us/microsoft-edge/webview2/
   ```

### Option B: Cross-Compile from WSL (Advanced)
If you want to build Windows .exe from Linux:

```bash
# In WSL, install Windows Rust toolchain
rustup target add x86_64-pc-windows-msvc

# Install mingw-w64
sudo apt install mingw-w64

# Then build for Windows
npm run app:build -- --target x86_64-pc-windows-msvc
```

---

## Step 3: Build on Windows

Once prerequisites are installed, run on Windows PowerShell:

```powershell
# Navigate to project
cd C:\Dev\dhikrtop

# Install dependencies (first time takes a while)
npm install

# Build the installer
npm run app:build
```

**First build takes 15-30 minutes** (downloads Rust, Node packages, WebView2)

Subsequent builds: 3-5 minutes

---

## Step 4: Test the App

### Development Mode
```powershell
npm run app:dev
```
This opens the app with hot-reload enabled. You'll see:
- Setup wizard on first launch
- System tray icon
- Live code updates

### Building Installer
```powershell
npm run app:build
```

Creates:
- `src-tauri/target/release/Dhikrtop_0.1.0_x64-setup.exe` ← **Share this file**
- `src-tauri/target/release/Dhikrtop_0.1.0_x64.msi` (alternative)

---

## Step 5: Test the Installer

1. **Distribute** the `.exe` file to testers
2. **Users run** the installer
3. **Setup wizard** appears automatically
4. **Configure preferences** (language, reminders, etc.)
5. **App launches** in system tray

---

## 🎯 What Users Will See

### Installation
```
1. Download Dhikrtop_0.1.0_x64-setup.exe
2. Click to run installer
3. Click "Install"
4. App launches automatically
5. Setup wizard appears
```

### Setup Wizard (4 Steps)
```
Step 1: Welcome message
Step 2: Choose language (English/العربية)
Step 3: Configure reminders & notifications
Step 4: Set startup preferences
```

### After Setup
```
✓ App minimizes to system tray
✓ Click tray icon to show/hide reminders
✓ Right-click for menu (Settings, Quit)
✓ Can adjust settings at any time
```

---

## 📋 Configuration Files

After install, user settings are stored in:
```
C:\Users\<YourName>\AppData\Local\Dhikrtop\
├─ preferences.json       (user settings)
├─ app-state.json         (setup completed)
└─ logs/                  (app logs)
```

---

## 🔧 Customization (Before Building)

Want to change anything before release?

### Change App Name
Edit `src-tauri/tauri.conf.json`:
```json
{
  "productName": "My Custom Name",
  ...
}
```

### Change App Icon
Replace these files:
- `src-tauri/icons/icon.ico` (app icon)
- `src-tauri/icons/tray.png` (tray icon)

### Change Setup Wizard Colors
Edit `src/windows/setup/SetupWindow.css`:
```css
.setup-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### Change Default Preferences
Edit `src-tauri/src/commands.rs`:
```rust
let prefs = store.get("preferences").unwrap_or(serde_json::json!({
  "notificationInterval": 30,  // Change default
  "enableSound": true,
  // ...
}));
```

---

## ❓ Common Questions

**Q: Can I build on WSL and run on Windows?**
- A: Yes, use cross-compilation. See "Option B" above.

**Q: How do I add auto-updates?**
- A: Configure Tauri updater in `tauri.conf.json`. [Learn more](https://tauri.app/develop/calling-rust/)

**Q: How do users uninstall?**
- A: Windows Add/Remove Programs (automatic with installer)

**Q: Can I code-sign the installer?**
- A: Yes, for enterprise. See [Tauri docs](https://tauri.app/distribute/sign/).

**Q: How do I distribute updates?**
- A: Users either:
  - Download new .exe and reinstall, or
  - Use auto-update feature (if configured)

---

## 📚 Documentation Files

I've created several guides for you:

1. **[BUILD_FOR_WINDOWS.md](BUILD_FOR_WINDOWS.md)**
   - Detailed build instructions
   - Troubleshooting guide
   - Architecture explanation

2. **[WINDOWS_QUICK_START.md](WINDOWS_QUICK_START.md)**
   - Quick reference card
   - Command reference
   - Configuration paths

3. **[WINDOWS_SETUP_COMPLETE.md](WINDOWS_SETUP_COMPLETE.md)**
   - Complete feature overview
   - What I implemented
   - Next steps

4. **[THIS FILE: WINDOWS_BUILD_NEXT_STEPS.md](WINDOWS_BUILD_NEXT_STEPS.md)**
   - How to build on Windows
   - Step-by-step instructions

---

## ✅ Ready to Go!

Your Dhikrtop app is **fully configured for Windows**:

- ✅ Setup wizard on first install
- ✅ System tray integration
- ✅ Auto-start with Windows option
- ✅ Installer (.exe & .msi)
- ✅ Windows registry integration
- ✅ Preference persistence
- ✅ Multi-language support (EN/AR)

**Next:** Get on a Windows machine and run `npm run app:build`!

---

## 🆘 Issues?

If you encounter problems:

1. **Check**: [BUILD_FOR_WINDOWS.md](BUILD_FOR_WINDOWS.md) troubleshooting section
2. **Verify**: All prerequisites are installed correctly
3. **Try**: `cargo clean && npm install` (full rebuild)
4. **Check**: WebView2 Runtime is installed
5. **Ask**: Tauri community https://github.com/tauri-apps/tauri

---

**You're all set! 🚀**
