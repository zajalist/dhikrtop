# Phase 3 - UI Polish + Validation

## Dhikr UI Improvements

- Session view now derives categories from active tradition modules.
- Tradition label is shown in session header.
- Empty-state card guides users to enable modules in settings.
- Daily progress on home now uses active dhikr item count.

## Counter Logic

- Counter target uses each item's `targetCount`.
- Completion checks per item remain target-aware.
- Category completion and progress dots are still item-level.

## Validation Checklist

- [ ] On fresh install, setup wizard completes and persists preferences.
- [ ] Switching tradition changes active modules immediately.
- [ ] Home progress ring denominator equals active daily dhikr count.
- [ ] DB rows continue to save by day/item and survive app restarts.
- [ ] Notification windows reflect selected tradition defaults.

## Known Follow-ups

- Add optional prayer-time based dynamic windows per location.
- Add import/export for tradition profiles.
- Add migration utility if v1 user data has custom quiet-hour fields.
