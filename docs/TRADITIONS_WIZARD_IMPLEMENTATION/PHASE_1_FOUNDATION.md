# Phase 1 - Foundation Data + State

## Scope

- Introduce tradition model and litany modules.
- Define stable user-data schema with migration-friendly defaults.
- Ensure each dhikr item has tradition-safe IDs for progress isolation.

## Data Model

```json
{
  "tradition_id": "tarimi_baalawi",
  "title": "The Yemeni (Tarimi) Path",
  "primary_source": "Khulasat al-Madad al-Nabawi",
  "adhkar": [
    {
      "id": "wird_al_latif",
      "category": "morning",
      "items": [
        {
          "text": "...",
          "translation": "...",
          "targetCount": 3,
          "audioUrl": "..."
        }
      ]
    }
  ]
}
```

## Implemented Structure

- Tradition registry: `src/data/traditions.ts`
  - Includes: Global/Hisn, Classical/Nawawi, Tarimi/Ba 'Alawi, Maghribi/Shadhili, Ottoman/Ahzab
  - Supports notification windows, goal tiers, and litany defaults
- User preferences: `src/lib/userData.ts`
  - `version: 2`
  - `traditionId`, `goalTier`, `litanyToggles`, `reminderWindows`
  - helper selectors for active dhikr items

## Persistence Strategy

- Primary key: `dhikr_user_data` in local storage
- Versioned object with safe defaults from selected tradition
- Progress persistence remains in DB (`daily_adhkar_progress`) keyed by:
  - `userId`
  - `dayKey`
  - `adhkarId` (now namespaced per tradition/litany)
