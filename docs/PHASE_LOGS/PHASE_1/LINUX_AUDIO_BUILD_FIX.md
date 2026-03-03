# Preview on Linux: Fixing ALSA (`alsa-sys`) build error

You hit this error while running `npm run tauri dev`:

> The system library `alsa` required by crate `alsa-sys` was not found.

This happens because `cpal` (audio backend) pulls in `alsa-sys` on Linux, which requires ALSA *development headers*.

---

## ✅ Fix Option 1 (Recommended): Install ALSA dev libs

```bash
sudo apt-get update
sudo apt-get install -y pkg-config libasound2-dev
```

Then rebuild with audio enabled:

```bash
cd /home/zajalist/projects/dhikrtop
npm run tauri dev -- --features audio
```

(or directly)

```bash
cd src-tauri
cargo tauri dev --features audio
```

---

## ✅ Fix Option 2: Preview the app now (without audio)

Audio is now feature-gated in the codebase, so you can preview the app without installing ALSA.

```bash
cd /home/zajalist/projects/dhikrtop
npm run tauri dev
```

This will build without the `audio` feature, avoiding `alsa-sys`.

---

## What I changed in the repo

1. `src-tauri/Cargo.toml`
   - `cpal` and `hound` are now `optional = true`
   - Added Cargo feature:
     - `audio = ["cpal", "hound"]`
   - `default = []` (so audio is OFF by default)

2. `src-tauri/src/lib.rs`
   - `pub mod audio;` is now behind `#[cfg(feature = "audio")]`
   - Added a stub `audio` module when feature is disabled
   - Removed duplicate `.invoke_handler(...)`

3. `src-tauri/src/audio.rs`
   - Feature-gated (`#![cfg(feature = "audio")]`)
   - Uses `hound` to write WAV
   - No `alsa-sys` dependency unless audio feature enabled

---

## Quick verification commands

### Build without audio
```bash
cd src-tauri
cargo clean
cargo build
```

### Build with audio (after installing ALSA dev libs)
```bash
sudo apt-get install -y pkg-config libasound2-dev
cd src-tauri
cargo clean
cargo build --features audio
```

---

If you want, tell me which option you prefer:

- **A)** Install ALSA dev libs and test voice recording soon
- **B)** Preview app immediately without audio
