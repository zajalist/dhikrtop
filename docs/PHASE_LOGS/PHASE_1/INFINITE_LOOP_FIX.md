# Fixed: Infinite Loop in getDailyAdhkarProgress

## Problem
When navigating to /dhikr, `getDailyAdhkarProgress` was failing and causing an infinite loop.

## Root Causes

### 1. Infinite Re-render Loop
The useEffect dependency arrays included `db` from `useDatabase()`. When `initDb()` ran and set `isInitialized=true`, it caused the memoized `db` object to change reference, triggering the effects again, creating an infinite loop:

```
Mount → Effect runs → getDailyAdhkarProgress called → initDb runs → 
isInitialized changes → db object changes → Effect re-runs → Loop
```

### 2. SQLite RETURNING * Syntax
The `increment_daily_adhkar` and `set_daily_adhkar_count` functions used `RETURNING *` which is not supported in older SQLite versions (< 3.35.0).

## Fixes Applied

### 1. Removed `db` from all dependency arrays
**Files changed:**
- `src/components/dhikr/DhikrSession.tsx` - 2 effects
- `src/components/home/Home.tsx` - 1 effect
- `src/components/notifications/FloatingNotification.tsx` - 1 effect

The `db` methods are stable via `useCallback([initDb])`, so we don't need to re-run effects when the db object reference changes.

### 2. Replaced RETURNING * with execute + SELECT
**File:** `src-tauri/src/db.rs`

Changed both `increment_daily_adhkar` and `set_daily_adhkar_count` to:
1. Execute the INSERT/UPDATE statement
2. Then SELECT the row explicitly

This is compatible with all SQLite versions.

## Test
```bash
npm run tauri dev
```

1. Go to /dhikr
2. Tap an adhkar 3 times
3. Switch to /home then back to /dhikr → counts should persist
4. Refresh page → counts should persist
5. Check console → no infinite loop errors
