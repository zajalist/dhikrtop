# Database + Frontend Integration Status

**Date**: 2026-03-03

## Fixes applied

### Rust backend
- Fixed Tauri `Send` requirement errors by ensuring we never hold a `std::sync::MutexGuard` across `.await` in `src-tauri/src/commands.rs`.
- Implemented double-check initialization pattern in `get_db()`.

### Frontend
- Updated `src/lib/useDatabase.ts` to send **camelCase** payload keys matching Rust command function argument names.
  - Example: `userId` not `user_id`, `surahNumber` not `surah_number`, etc.

## How to run

```bash
cd /home/zajalist/projects/dhikrtop/src-tauri
cargo clean
cargo test

cd /home/zajalist/projects/dhikrtop
npm run tauri dev
```

## Next

- Add a small UI screen to exercise DB commands from the app (dev-only route).
- Implement Phase 1 Task 1.3 playback.
