# Dhikrtop - Release & Version Management

## Current Version

**v0.1.0** - Initial Release  
**Released:** March 2, 2026

### Quick Links
- 📦 [Download Latest Release](./releases/RELEASES.md)
- 📝 [Changelog](./releases/RELEASES.md#v010-march-2-2026)
- 🐛 [Report Issues](https://github.com/yourusername/dhikrtop/issues)

## Version Scheme

We follow **Semantic Versioning** (MAJOR.MINOR.PATCH):

- **MAJOR** (v1, v2, ...): Significant changes or breaking updates
- **MINOR** (v0.1, v0.2, ...): New features, backwards compatible
- **PATCH** (v0.1.0, v0.1.1, ...): Bug fixes

## Build & Release Process

### Development
```bash
npm run dev          # Development server
npm run build        # Build for production
npm run app:build    # Build Tauri app
```

### Creating a Release

1. **Update version in `package.json` and `src-tauri/Cargo.toml`**
   ```json
   {
     "version": "0.2.0"
   }
   ```

2. **Build the installer**
   ```bash
   npm run app:build
   ```

3. **Create release folder**
   ```bash
   mkdir releases/v0.2.0
   cp src-tauri/target/release/bundle/msi/* releases/v0.2.0/
   cp src-tauri/target/release/bundle/nsis/* releases/v0.2.0/
   ```

4. **Update `releases/RELEASES.md`**
   - Add new version section at top
   - Document changes, features, downloads
   - Update "Current Release" section

5. **Commit & tag**
   ```bash
   git add .
   git commit -m "chore: release v0.2.0"
   git tag v0.2.0
   git push origin main --tags
   ```

## Archives Structure

```
releases/
├── RELEASES.md           # Main releases index & changelog
├── v0.1.0/              # First release folder
│   ├── Dhikrtop_0.1.0_x64-setup.exe
│   ├── Dhikrtop_0.1.0_x64.msi
│   └── RELEASE_NOTES.md
├── v0.2.0/              # Next release (template)
│   ├── Dhikrtop_0.2.0_x64-setup.exe
│   ├── Dhikrtop_0.2.0_x64.msi
│   └── RELEASE_NOTES.md
```

## File Naming Convention

Installers follow pattern: `Dhikrtop_[VERSION]_[ARCH]-[TYPE].[EXT]`

**Examples:**
- `Dhikrtop_0.1.0_x64-setup.exe` - 64-bit NSIS installer
- `Dhikrtop_0.1.0_x64.msi` - 64-bit MSI installer
- `Dhikrtop_0.2.0_x64-setup.exe` - Future 64-bit release

**Architecture codes:**
- `x64` = Windows 64-bit
- `arm64` = Windows ARM (if added in future)

## Installation Sources

Users can download releases from:
1. **GitHub Releases** (Recommended)
   - Direct download links
   - Full changelog visible
   - Automatic update check

2. **This Repository** (`releases/` folder)
   - Local archives
   - Version history
   - Development reference

## Update Notifications

When v0.2.0+ is released, users will see:
```
New version available: Dhikrtop 0.2.0
Current: v0.1.0

[View Release Notes]  [Update Now]  [Later]
```

---

## FAQ

**Q: Where do I download Dhikrtop?**  
A: Visit [releases/RELEASES.md](./releases/RELEASES.md) for download links.

**Q: How do I uninstall?**  
A: Use Windows Control Panel → Programs → Uninstall a Program → Dhikrtop

**Q: Can I use old versions?**  
A: Yes! Check [releases/RELEASES.md](./releases/RELEASES.md) for archived downloads.

**Q: How do I stay updated?**  
A: The app will notify you of new releases. Enable notifications in Settings.

---

**Last Updated:** March 2, 2026  
**Current Release:** [v0.1.0](./releases/RELEASES.md#v010-march-2-2026)
