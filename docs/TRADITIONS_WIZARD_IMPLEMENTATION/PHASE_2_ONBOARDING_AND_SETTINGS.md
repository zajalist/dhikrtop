# Phase 2 - Onboarding + Settings

## Setup Wizard UX Flow (3 Steps)

1. Discover Your Path
   - Tradition cards with origin and primary source.
   - Select one spiritual path/book profile.
2. Daily Goal Setting
   - Essential / Standard / Complete tiers.
   - Tier filters active litanies by predefined level.
3. Notification Sync
   - Pre-fills morning/evening/night windows from selected tradition.
   - User can tune times before completion.

## Minimalist UI Notes

- Soft glass panels over dark gradient background.
- Gold accent for selected cards and CTAs.
- Dense but readable cards: title, description, source, region.
- Single progress bar for wizard completion.

## React Tradition Selector

Implemented reusable component:

- `src/components/setup/TraditionSelector.tsx`

Used in:

- `src/components/setup/SetupWizard.tsx`
- `src/components/settings/SettingsPage.tsx`

## Settings Management

Implemented controls:

- Tradition switcher (swaps active book/profile)
- Daily goal tier selector
- Modular litanies toggles per tradition

Behavior:

- Tradition switch resets toggle defaults for that tradition.
- User can override each module by checkbox.
- Toggle + tier determine active dhikr list used by session/home.
