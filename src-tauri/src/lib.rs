// Audio recording is optional on Linux because it requires system deps (e.g., ALSA dev libs).
// Enable with: `cargo build --features audio` or `cargo tauri dev --features audio`
#[cfg(feature = "audio")]
pub mod audio;

// Stub audio module when feature is disabled (keeps compilation working)
#[cfg(not(feature = "audio"))]
pub mod audio {
    use std::path::Path;
    use thiserror::Error;

    #[derive(Error, Debug, Clone)]
    pub enum AudioError {
        #[error("Audio feature is disabled. Rebuild with `--features audio`.")]
        AudioFeatureDisabled,
    }

    #[derive(Debug, Clone, Copy, PartialEq, Eq)]
    pub enum RecordingState {
        Idle,
        Recording,
        Paused,
        Stopped,
    }

    pub struct Recorder;

    impl Recorder {
        pub fn new() -> Result<Self, AudioError> {
            Err(AudioError::AudioFeatureDisabled)
        }

        pub fn list_devices(&self) -> Result<Vec<String>, AudioError> {
            Err(AudioError::AudioFeatureDisabled)
        }

        pub fn supported_configs(&self) -> Result<Vec<String>, AudioError> {
            Err(AudioError::AudioFeatureDisabled)
        }

        pub fn start_recording(&mut self) -> Result<(), AudioError> {
            Err(AudioError::AudioFeatureDisabled)
        }

        pub fn pause_recording(&mut self) -> Result<(), AudioError> {
            Err(AudioError::AudioFeatureDisabled)
        }

        pub fn resume_recording(&mut self) -> Result<(), AudioError> {
            Err(AudioError::AudioFeatureDisabled)
        }

        pub fn stop_recording(&mut self) -> Result<(), AudioError> {
            Err(AudioError::AudioFeatureDisabled)
        }

        pub fn save_recording<P: AsRef<Path>>(&self, _output_path: P) -> Result<u32, AudioError> {
            Err(AudioError::AudioFeatureDisabled)
        }

        pub fn state(&self) -> RecordingState {
            RecordingState::Idle
        }

        pub fn get_duration_ms(&self) -> u32 {
            0
        }

        pub fn get_sample_count(&self) -> usize {
            0
        }
    }
}
mod commands;
pub mod db;
mod idle;
pub mod schema;

#[cfg(test)]
mod tests;

#[cfg(test)]
mod command_tests;

use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Emitter, Manager,
};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, ShortcutState};

fn show_adhkar_left(app: &tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("adhkar") {
        let w = 460.0_f64;
        let h = 620.0_f64;
        let prefs_store = tauri_plugin_store::StoreBuilder::new(app, "preferences.json")
            .build()
            .ok();
        let popup_position = prefs_store
            .as_ref()
            .and_then(|s| s.get("preferences"))
            .and_then(|p| p.get("popupPosition").and_then(|v| v.as_str()).map(str::to_string))
            .unwrap_or_else(|| "top-left".to_string());

        let x = if let Ok(Some(monitor)) = window.primary_monitor() {
            let screen = monitor.size();
            let scale = monitor.scale_factor();
            let screen_w = screen.width as f64 / scale;
            match popup_position.as_str() {
                "top-center" => ((screen_w - w) / 2.0).max(0.0),
                "top-right" => (screen_w - w - 16.0).max(0.0),
                _ => 16.0,
            }
        } else {
            16.0
        };
        let y = 0.0_f64;
        let _ = window.set_position(tauri::LogicalPosition { x, y });
        let _ = window.set_size(tauri::LogicalSize {
            width: w as u32,
            height: h as u32,
        });
        let _ = window.show();
        let _ = app.emit("trigger-adhkar", ());
    }
}

fn toggle_adhkar_left(app: &tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("adhkar") {
        if window.is_visible().unwrap_or(false) {
            let _ = window.hide();
        } else {
            show_adhkar_left(app);
        }
    }
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            // Existing commands
            commands::show_adhkar,
            commands::hide_adhkar,
            commands::hide_setup_window,
            commands::open_settings,
            commands::get_preferences,
            commands::save_preferences,
            commands::is_first_install,
            commands::mark_setup_complete,
            commands::reset_all_data,
            commands::get_startup_status,
            commands::set_startup,
            // Database commands
            commands::db_init,
            commands::db_save_user,
            commands::db_get_user,
            commands::db_save_adhkar_progress,
            commands::db_get_adhkar_progress,
            // Daily calendar-based progress
            commands::db_increment_daily_adhkar,
            commands::db_set_daily_adhkar_count,
            commands::db_get_daily_adhkar_progress,
            commands::db_save_app_settings,
            commands::db_get_app_settings,
            commands::db_save_quran_progress,
            commands::db_get_quran_progress,
            commands::db_save_voice_recording,
            commands::db_get_voice_recordings,
            commands::db_get_verse_recordings,
            commands::db_delete_voice_recording,
            commands::db_export_user_data,
            commands::db_reset_user_data,
            // Notifications
            commands::db_add_notification,
            commands::db_get_recent_notifications,
            commands::db_mark_notification_read,
            commands::db_dismiss_notification,
            commands::db_clear_notifications,
        ])
        .setup(|app| {
            // ── Ensure GTK initialization on Linux ──────────────────────────
            #[cfg(target_os = "linux")]
            {
                std::thread::sleep(std::time::Duration::from_millis(200));
            }

            // ── Check if first install and show setup ────────────────────────
            let store = tauri_plugin_store::StoreBuilder::new(app, "app-state.json").build()?;

            let is_first_install = !store
                .get("setupCompleted")
                .and_then(|v| v.as_bool())
                .unwrap_or(false);

            if is_first_install {
                // Show setup window on first install at top-left corner
                if let Some(setup_window) = app.get_webview_window("setup") {
                    // Position at top-left corner
                    let _ = setup_window.set_position(tauri::LogicalPosition { x: 0.0, y: 0.0 });
                    let _ = setup_window.set_size(tauri::LogicalSize { width: 380, height: 900 });
                    let _ = setup_window.show();
                    let _ = setup_window.set_focus();
                }
            } else {
                // On subsequent launches, hide all windows initially
                // They will be shown from JS or user interaction
                if let Some(adhkar_window) = app.get_webview_window("adhkar") {
                    let _ = adhkar_window.hide();
                }
                if let Some(settings_window) = app.get_webview_window("settings") {
                    let _ = settings_window.hide();
                }
            }

            // ── System Tray ────────────────────────────────────────────────
            let show_settings = MenuItem::with_id(app, "settings", "Settings", true, None::<&str>)?;
            let sep = PredefinedMenuItem::separator(app)?;
            let quit = MenuItem::with_id(app, "quit", "Quit Dhikrtop", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_settings, &sep, &quit])?;

            let _tray = TrayIconBuilder::new()
                .menu(&menu)
                .show_menu_on_left_click(false)
                .tooltip("Dhikrtop — Islamic Remembrances")
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        toggle_adhkar_left(&app);
                    }
                })
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "settings" => {
                        if let Some(window) = app.get_webview_window("settings") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .build(app)?;

            // ── Global Shortcut (Windows + Shift + D) ─────────────────────
            let _ = app
                .global_shortcut()
                .on_shortcut("Shift+Super+D", move |app, _shortcut, event| {
                    if event.state == ShortcutState::Pressed {
                        toggle_adhkar_left(app);
                    }
                });

            // ── Idle Monitor ───────────────────────────────────────────────
            idle::start(app.handle().clone());

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running dhikrtop");
}
