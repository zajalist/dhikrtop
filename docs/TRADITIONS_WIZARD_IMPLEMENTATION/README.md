# Traditions & Custom Wird — Implementation Docs

## Overview

This folder documents the phased implementation of full-book tradition data, the custom wird builder, and the Seen-Arabic DB integration.

---

## Phase 1 — Book Data Foundation ✅

### What was built
- `src/data/books/types.ts` — `AdhkarBook`, `BookSection`, `BookAdhkarItem` types  
- `src/data/books/hisn-al-muslim.ts` — Full Hisn al-Muslim (22 morning, 12 evening, 10 after-prayer, 6 sleep, 5 general items + Seen DB sections)  
- `src/data/books/wird-al-latif.ts` — Complete Wird al-Latif (6 sections, 12 items)  
- `src/data/books/ratib-al-haddad.ts` — Complete Ratib al-Haddad (6 sections)  
- `src/data/books/dalail-khayrat.ts` — Dala'il al-Khayrat (9 sections, 7 daily hizbs + opening/closing)  
- `src/data/books/nawawi-adhkar.ts` — Al-Adhkar by Imam al-Nawawi (6 chapters)  
- `src/data/books/index.ts` — `BOOK_REGISTRY`, `getAllBookItems()`, `getBookById()`, `getBooksForTradition()`

### How to add a new book
1. Create `src/data/books/your-book.ts` implementing `AdhkarBook`  
2. Export it from `src/data/books/index.ts` and add to `BOOK_REGISTRY`  
3. Set `tradition` field to the matching `TraditionDefinition.id`

---

## Phase 2 — Seen-Arabic DB Integration ✅

### Source
https://github.com/Seen-Arabic/Morning-And-Evening-Adhkar-DB

### Files
- `src/data/seenArabicDb.ts` — **Placeholder** (empty arrays until you fetch)  
- `scripts/fetch-seen-db.mjs` — Fetcher script

### Load the real data
```bash
npm run fetch:seen-db
```

This will:
1. Try all known repo path patterns automatically  
2. Normalise every field naming convention the repo uses  
3. De-duplicate by arabic text  
4. Write `src/data/seenArabicDb.ts` (auto-generated, do not edit)  
5. Rebuild: `npm run build`

If the network fetch fails (firewall / rate limit), clone the repo locally and run:
```bash
node scripts/fetch-seen-db.mjs --local /path/to/Morning-And-Evening-Adhkar-DB
```

### How it connects
- `SEEN_MORNING_ADHKAR` and `SEEN_EVENING_ADHKAR` are imported into:
  - `src/data/books/hisn-al-muslim.ts` — adds two extra browsable book sections  
  - `src/data/traditions.ts` — adds two extra litanies (`hisn_morning_seen`, `hisn_evening_seen`) in the Global tradition under **Goal: Complete**

Users enable them via **Settings → Daily Goal → Complete** or **Settings → Daily Sections**.

---

## Phase 3 — Custom Wird Builder ✅

### Files
- `src/lib/wirdTypes.ts` — `Wird`, `WirdItem`, `createWird()`, `createWirdItem()`  
- `src/components/dhikr/WirdBuilder.tsx` — Full UI  
- Route: `/wird` — added to `src/routes.tsx`  
- Nav: **My Wird** tab — added to `src/components/layout/RootLayout.tsx`

### User flow
1. Go to **My Wird** in the nav  
2. Tap **Create New Wird** → name it  
3. Switch to **Add Adhkar** tab — browse all books, expand sections, tap **Add**  
4. Switch to **My Wird** tab — reorder (↑/↓), toggle items, override counts (tap ×N)  
5. **Settings** tab — choose which daily sessions the wird applies to, set *Append* or *Replace* mode  
6. Tap **Save Wird**  
7. On the wird card, tap session badges to **activate** it for that session  

### Append vs Replace
| Mode | Behaviour |
|------|-----------|
| **Append** | Custom wird items added *after* tradition items in that session |
| **Replace** | Custom wird items *replace* all tradition items for that session |

---

## Phase 4 — Section-Based Daily Selection ✅

Users can now choose **which original book sections** appear in their daily carousel:

- **Settings → Daily Sections** — checkboxes grouped by source book  
- Sections persist per-tradition in `localStorage` under `selectedSectionsByTradition`  
- DhikrSession shows a second filter bar: **All Sections** + individual section chips

---

## User Data Schema — version 4

```typescript
interface DhikrUserData {
  version: 4;
  traditionId: string;
  goalTier: "essential" | "standard" | "complete";
  litanyToggles: Record<string, boolean>;           // per-litany on/off
  selectedSectionsByTradition: Record<string, string[]>; // per-tradition section picks
  customWirds: Wird[];                              // user-created wird profiles
  activeWirdIdBySession: Record<DhikrCategory, string | null>; // active wird per session
  // ... profile fields
}
```

Migration from v3: on load, `customWirds` defaults to `[]` and `activeWirdIdBySession` defaults to all `null`.
