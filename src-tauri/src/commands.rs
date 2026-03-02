use tauri::{AppHandle, Manager, WebviewWindow};

/// Show the adhkar popup, positioned to bottom-right of primary screen.
#[tauri::command]
pub fn show_adhkar(app: AppHandle) -> Result<(), String> {
    let window = app
        .get_webview_window("adhkar")
        .ok_or("adhkar window not found")?;

    // Position to bottom-right corner
    if let Ok(Some(monitor)) = window.primary_monitor() {
        let screen_size = monitor.size();
        let scale = monitor.scale_factor();
        let w = 420.0_f64;
        let h = 240.0_f64;
        let margin = 24.0_f64;
        let x = (screen_size.width as f64 / scale) - w - margin;
        let y = (screen_size.height as f64 / scale) - h - margin - 40.0; // 40px above taskbar

        let _ = window.set_position(tauri::LogicalPosition { x, y });
    }

    window.show().map_err(|e| e.to_string())?;
    window.set_focus().map_err(|e| e.to_string())?;
    Ok(())
}

/// Hide the adhkar popup (called by dismiss/like/dislike).
#[tauri::command]
pub fn hide_adhkar(window: WebviewWindow) -> Result<(), String> {
    window.hide().map_err(|e| e.to_string())
}

/// Open the settings window.
#[tauri::command]
pub fn open_settings(app: AppHandle) -> Result<(), String> {
    let window = app
        .get_webview_window("settings")
        .ok_or("settings window not found")?;
    window.show().map_err(|e| e.to_string())?;
    window.set_focus().map_err(|e| e.to_string())?;
    Ok(())
}

/// Load preferences from the Tauri store.
#[tauri::command]
pub fn get_preferences(app: AppHandle) -> Result<serde_json::Value, String> {
    let store = tauri_plugin_store::StoreBuilder::new(&app, "preferences.json")
        .build()
        .map_err(|e| e.to_string())?;

    let prefs = store
        .get("preferences")
        .unwrap_or(serde_json::json!({
            "idleThresholdSec": 120,
            "minIntervalSec": 600,
            "categories": ["morning", "evening", "general", "sleep"],
            "language": "all",
            "enabled": true
        }));

    Ok(prefs)
}

/// Persist preferences to the Tauri store.
#[tauri::command]
pub fn save_preferences(app: AppHandle, preferences: serde_json::Value) -> Result<(), String> {
    let store = tauri_plugin_store::StoreBuilder::new(&app, "preferences.json")
        .build()
        .map_err(|e| e.to_string())?;

    store.set("preferences", preferences);
    store.save().map_err(|e| e.to_string())?;
    Ok(())
}

/// Check if this is the first time the app is running.
#[tauri::command]
pub fn is_first_install(app: AppHandle) -> Result<bool, String> {
    let store = tauri_plugin_store::StoreBuilder::new(&app, "app-state.json")
        .build()
        .map_err(|e| e.to_string())?;

    let has_completed_setup = store
        .get("setupCompleted")
        .and_then(|v| v.as_bool())
        .unwrap_or(false);

    Ok(!has_completed_setup)
}

/// Mark the setup as completed.
#[tauri::command]
pub fn mark_setup_complete(app: AppHandle) -> Result<(), String> {
    let store = tauri_plugin_store::StoreBuilder::new(&app, "app-state.json")
        .build()
        .map_err(|e| e.to_string())?;

    store.set("setupCompleted", serde_json::json!(true));
    store.save().map_err(|e| e.to_string())?;
    Ok(())
}

/// Get Windows startup registry status.
#[tauri::command]
pub fn get_startup_status(app: AppHandle) -> Result<bool, String> {
    #[cfg(windows)]
    {
        use winreg::RegKey;
        use winreg::enums::HKEY_CURRENT_USER;

        let hkcu = RegKey::predef(HKEY_CURRENT_USER);
        let path = r"Software\Microsoft\Windows\CurrentVersion\Run";

        match hkcu.open_subkey(path) {
            Ok(key) => {
                let app_name = app.package_info().name.clone();
                match key.get_value::<String, _>(&app_name) {
                    Ok(_) => Ok(true),
                    Err(_) => Ok(false),
                }
            }
            Err(_) => Ok(false),
        }
    }

    #[cfg(not(windows))]
    {
        let _ = app; // Suppress unused warning on non-Windows
        Ok(false)
    }
}

/// Set Windows startup registry.
#[tauri::command]
pub fn set_startup(app: AppHandle, enabled: bool) -> Result<(), String> {
    #[cfg(windows)]
    {
        use winreg::RegKey;
        use winreg::enums::{HKEY_CURRENT_USER, KEY_WRITE};

        let hkcu = RegKey::predef(HKEY_CURRENT_USER);
        let path = r"Software\Microsoft\Windows\CurrentVersion\Run";

        match hkcu.open_subkey_with_flags(path, KEY_WRITE) {
            Ok(key) => {
                let app_name = app.package_info().name.clone();
                let exe_path = std::env::current_exe()
                    .map_err(|e| format!("Failed to get exe path: {}", e))?
                    .to_string_lossy()
                    .to_string();

                if enabled {
                    key.set_value(&app_name, &exe_path)
                        .map_err(|e| format!("Failed to set registry: {}", e))?;
                } else {
                    key.delete_value(&app_name)
                        .map_err(|e| format!("Failed to delete registry: {}", e))?;
                }
                Ok(())
            }
            Err(e) => Err(format!("Failed to open registry: {}", e)),
        }
    }

    #[cfg(not(windows))]
    {
        let _ = (app, enabled); // Suppress unused warning on non-Windows
        Ok(())
    }
}
