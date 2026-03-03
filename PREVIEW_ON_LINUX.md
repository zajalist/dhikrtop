# Previewing the app on Linux (ALSA error fix)

You hit an `alsa-sys` build error when running `npm run tauri dev`. That happens because the voice recording backend uses `cpal`, which on Linux needs the ALSA development headers.

I implemented an **optional audio feature** so you can preview the app *without* installing ALSA, and you can optionally enable audio later.

---

## ✅ Option 1: Preview the app now (no audio)

From the project root:

```bash
cd /home/zajalist/projects/dhikrtop
npm run tauri dev
```

This now builds without the `audio` Cargo feature, so `cpal` (and `alsa-sys`) are not compiled.

---

## ✅ Option 2: Enable audio recording on Linux (install ALSA dev libs)

```bash
sudo apt-get update
sudo apt-get install -y pkg-config libasound2-dev
```

Then run:

```bash
cd /home/zajalist/projects/dhikrtop
npm run tauri dev -- --features audio
```

(or directly)

```bash
cd /home/zajalist/projects/dhikrtop/src-tauri
cargo tauri dev --features audio
```

---

## What changed

- `src-tauri/Cargo.toml`
  - `cpal` + `hound` are **optional dependencies**
  - feature `audio = ["cpal", "hound"]`
  - `default = []` so audio is OFF by default

- `src-tauri/src/lib.rs`
  - Audio module is only compiled with `--features audio`
  - Stub audio module exists when feature disabled

- `src-tauri/src/audio.rs`
  - Feature-gated and uses `hound` for WAV writing

---

## If `npm run tauri dev` still tries to compile ALSA

Run a clean build:

```bash
cd /home/zajalist/projects/dhikrtop/src-tauri
cargo clean
cd ..
npm run tauri dev
```

---

## Quick one-liner builds

```bash
# Without audio
cd /home/zajalist/projects/dhikrtop/src-tauri
cargo build

# With audio (after installing ALSA dev libs)
cd /home/zajalist/projects/dhikrtop/src-tauri
cargo build --features audio
```
