# Summary of fixes for db undefined error

## Root Cause
The `useDatabase()` hook returns a memoized object, but when callbacks capture `db` 
in their closure at component mount time, `db` might not be fully initialized yet.
When the callback is later invoked, it uses the stale undefined `db`.

## Solution: useRef Pattern
Instead of relying on `db` in dependency arrays (which causes re-creates of callbacks),
we use a ref that always points to the current `db`:

```tsx
const db = useDatabase();
const dbRef = useRef(db);
dbRef.current = db;  // Always update to latest

// In callbacks:
const currentDb = dbRef.current;
if (!currentDb) return;
currentDb.someMethod(...);
```

## Files Fixed
1. `src/components/dhikr/DhikrSession.tsx` - tap, resetCurrent, useEffects
2. `src/components/home/Home.tsx` - useEffect for loading stats
3. `src/components/notifications/FloatingNotification.tsx` - hydrate, handleNotification, onClose

## Test Steps
1. `npm run tauri dev`
2. Navigate to /dhikr
3. Tap adhkar - counts should increase without "Cannot read properties of undefined" errors
4. Switch tabs and return - counts should persist
