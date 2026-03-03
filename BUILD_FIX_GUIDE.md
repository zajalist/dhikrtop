# Build Instructions - Updated

**Issue Fixed**: cpal version changed from 0.18 → 0.17 (available on crates.io)

---

## Build Steps

### From src-tauri directory:

```bash
# Clear cargo cache
cargo clean

# Download all dependencies
cargo fetch

# Build release binary
cargo build --release

# Expected time: 3-5 minutes (first time, then cached)
```

### From project root:

```bash
cd /home/zajalist/projects/dhikrtop

# Build with Tauri (includes frontend)
npm run tauri build

# Or development mode
npm run tauri dev
```

---

## What's Being Built

✅ **Frontend**: React + TypeScript (Vite bundled)
✅ **Backend**: Rust (Tauri + all modules)
✅ **Database**: SQLite integration
✅ **Audio**: CPAL for recording
✅ **Tests**: Cargo test suite

---

## Expected Output

After successful build:

```
target/release/dhikrtop          (or .exe on Windows)
target/release/deps/
├── *.rlib files
└── *.so files (Linux) / .dylib (macOS) / .dll (Windows)
```

---

## Next Steps After Build

1. **Run the app**:
   ```bash
   cargo run --release
   ```

2. **Or use Tauri to run with UI**:
   ```bash
   cd ..
   npm run tauri dev
   ```

3. **Run tests to verify**:
   ```bash
   cargo test --lib db
   ```

---

## If You Get More Errors

Most common issues:

1. **Missing C++ compiler** (Windows)
   - Install Visual Studio Build Tools

2. **Rust outdated**
   - `rustup update`

3. **Dependency conflicts**
   - `cargo clean && cargo build --release`

---

Try the build now:

```bash
cd /home/zajalist/projects/dhikrtop/src-tauri
cargo build --release
```

Let me know if you hit any issues!
