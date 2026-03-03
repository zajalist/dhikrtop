# Fixing ALSA build errors on Linux (cpal / alsa-sys)

If you see:

> The system library `alsa` required by crate `alsa-sys` was not found.

That means your Linux system is missing the ALSA *development* headers.

---

## Option A (Recommended): Install system deps and enable audio

### Debian/Ubuntu

```bash
sudo apt-get update
sudo apt-get install -y pkg-config libasound2-dev
```

Then build with the audio feature:

```bash
cd src-tauri
cargo build --release --features audio
```

For Tauri dev:

```bash
cargo tauri dev --features audio
# or from root
npm run tauri dev -- --features audio
```

---

## Option B: Build without audio (works immediately)

Audio is now feature-gated so you can build the app without any ALSA deps:

```bash
cd src-tauri
cargo build --release
```

This will compile without voice recording support.

---

## What changed in this repo

- `cpal` and `hound` are now **optional dependencies**.
- A Cargo feature `audio` enables them.
- `src-tauri/src/audio.rs` is compiled only when `--features audio` is used.
- A stub `audio` module exists when the feature is disabled so the rest of the app still compiles.

---

## Confirm it works

### Without audio

```bash
cd src-tauri
cargo clean
cargo build --release
```

### With audio

```bash
sudo apt-get install -y pkg-config libasound2-dev
cd src-tauri
cargo clean
cargo build --release --features audio
```
