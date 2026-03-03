To verify persistence now that DB init is reliable:

1) Start dev
npm run tauri dev

2) In Dhikr page, tap an adhkar 2-3 times.
3) Switch to Home, then back to Dhikr. Counts should restore.
4) Refresh. Counts should restore.

If it still doesn't restore, check console for:
- incrementDailyAdhkar failed ...
- getDailyAdhkarProgress failed ...

These will now show the full error object.
