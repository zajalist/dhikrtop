use std::time::{Duration, Instant};
use tauri::{AppHandle, Emitter, Manager};

/// Spawn a background thread that monitors user idle time and fires adhkar
/// when the user has been idle long enough and the minimum interval has passed.
pub fn start(app: AppHandle) {
    std::thread::spawn(move || {
        let mut last_shown = Instant::now() - Duration::from_secs(3600); // allow first show quickly
        let check_interval = Duration::from_secs(10);

        loop {
            std::thread::sleep(check_interval);

            // Read preferences for dynamic thresholds
            let (idle_threshold, min_interval, enabled) = read_thresholds(&app);

            if !enabled {
                continue;
            }

            if last_shown.elapsed() < min_interval {
                continue;
            }

            let idle = system_idle_time();
            if idle >= idle_threshold {
                let _ = app.emit("trigger-adhkar", ());
                // Show window positioned at top-center
                let app2 = app.clone();
                std::thread::spawn(move || {
                    if let Some(window) = app2.get_webview_window("adhkar") {
                        if let Ok(Some(monitor)) = window.primary_monitor() {
                            let screen = monitor.size();
                            let scale = monitor.scale_factor();
                            let w = 440.0_f64;
                            let x = ((screen.width as f64 / scale) - w) / 2.0;
                            let _ = window.set_position(tauri::LogicalPosition { x, y: 0.0 });
                            let _ = window.set_size(tauri::LogicalSize { width: w as u32, height: 200 });
                        }
                        let _ = window.show();
                        // Don't steal focus — the peek should be non-intrusive
                    }
                });
                last_shown = Instant::now();
            }
        }
    });
}

fn read_thresholds(app: &AppHandle) -> (Duration, Duration, bool) {
    let defaults = (
        Duration::from_secs(120),  // 2 min idle
        Duration::from_secs(600),  // 10 min between adhkar
        true,
    );

    let store = match tauri_plugin_store::StoreBuilder::new(app, "preferences.json").build() {
        Ok(s) => s,
        Err(_) => return defaults,
    };

    let prefs = match store.get("preferences") {
        Some(v) => v,
        None => return defaults,
    };

    let idle = prefs
        .get("idleThresholdSec")
        .and_then(|v| v.as_u64())
        .unwrap_or(120);

    let interval = prefs
        .get("minIntervalSec")
        .and_then(|v| v.as_u64())
        .unwrap_or(600);

    let enabled = prefs
        .get("enabled")
        .and_then(|v| v.as_bool())
        .unwrap_or(true);

    (
        Duration::from_secs(idle),
        Duration::from_secs(interval),
        enabled,
    )
}

// ── Platform idle time detection ──────────────────────────────────────────────

#[cfg(target_os = "linux")]
fn system_idle_time() -> Duration {
    // Try xprintidle (X11) first
    if let Ok(out) = std::process::Command::new("xprintidle").output() {
        if let Ok(s) = std::str::from_utf8(&out.stdout) {
            if let Ok(ms) = s.trim().parse::<u64>() {
                return Duration::from_millis(ms);
            }
        }
    }
    // Fallback: gdbus on Wayland (gnome-session-manager idle)
    Duration::ZERO
}

#[cfg(target_os = "windows")]
fn system_idle_time() -> Duration {
    use windows::Win32::UI::Input::KeyboardAndMouse::{GetLastInputInfo, LASTINPUTINFO};
    use windows::Win32::Foundation::BOOL;

    unsafe {
        let mut info = LASTINPUTINFO {
            cbSize: std::mem::size_of::<LASTINPUTINFO>() as u32,
            dwTime: 0,
        };
        if GetLastInputInfo(&mut info) != BOOL(0) {
            let ticks = windows::Win32::System::SystemInformation::GetTickCount();
            let idle_ms = ticks.wrapping_sub(info.dwTime) as u64;
            return Duration::from_millis(idle_ms);
        }
    }
    Duration::ZERO
}

#[cfg(target_os = "macos")]
fn system_idle_time() -> Duration {
    // Use ioreg to query HIDIdleTime (in nanoseconds)
    if let Ok(out) = std::process::Command::new("ioreg")
        .args(["-c", "IOHIDSystem"])
        .output()
    {
        if let Ok(s) = std::str::from_utf8(&out.stdout) {
            for line in s.lines() {
                if line.contains("HIDIdleTime") {
                    if let Some(ns_str) = line.split('=').nth(1) {
                        if let Ok(ns) = ns_str.trim().parse::<u64>() {
                            return Duration::from_nanos(ns);
                        }
                    }
                }
            }
        }
    }
    Duration::ZERO
}
