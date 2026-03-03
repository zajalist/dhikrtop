# Troubleshooting Notes

## libEGL / MESA / ZINK warnings
These are GPU / Mesa / EGL warnings coming from the WebView / GTK stack on Linux.
They are usually environmental driver issues and typically do **not** affect SQLite persistence.

If the app works visually, these can be ignored for now.

Potential fixes (system-level):
- Install correct mesa drivers for your GPU
- Ensure `libEGL` and `mesa-vulkan-drivers` are installed

## Dhikr daily persistence debugging
Dhikr page now logs errors if daily DB calls fail:
- `incrementDailyAdhkar failed ...`
- `getDailyAdhkarProgress failed`

Check the devtools console (or terminal logs) when the count fails to persist.
