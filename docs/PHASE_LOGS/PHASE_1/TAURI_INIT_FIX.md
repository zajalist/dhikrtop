# Fix Summary: Tauri Initialization Race Condition

## Problem
`useDatabase()` hook methods were being called before Tauri's `invoke` was available,
causing "Cannot read properties of undefined (reading 'invoke')" errors.

## Root Cause
- React components mount and run effects immediately
- Tauri's IPC bridge (`invoke`) may not be available yet
- Components tried to call DB methods before Tauri was ready

## Solution

### 1. Added Tauri readiness check in useDatabase.ts
```typescript
const isTauri = () => {
    return typeof window !== "undefined" && "__TAURI__" in window;
};

// In the hook:
const [tauriReady, setTauriReady] = useState(false);

useEffect(() => {
    const checkTauri = () => {
        if (isTauri()) {
            setTauriReady(true);
        } else {
            setTimeout(checkTauri, 100);
        }
    };
    checkTauri();
}, []);
```

### 2. All components now check `db.isInitialized` before calling DB methods
- DhikrSession.tsx
- Home.tsx  
- FloatingNotification.tsx

### 3. Added `db.isInitialized` to useEffect dependency arrays
So effects re-run when DB becomes ready.

## Test
Run `npm run tauri dev` and navigate to /dhikr.
Should no longer see infinite loop of errors.
