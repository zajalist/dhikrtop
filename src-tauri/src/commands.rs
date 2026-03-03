use tauri::{AppHandle, Manager, WebviewWindow};

/// Show the adhkar popup, positioned at top-center of primary screen.
#[tauri::command]
pub fn show_adhkar(app: AppHandle) -> Result<(), String> {
    let window = app
        .get_webview_window("adhkar")
        .ok_or("adhkar window not found")?;

    // Position at top-center
    if let Ok(Some(monitor)) = window.primary_monitor() {
        let screen_size = monitor.size();
        let scale = monitor.scale_factor();
        let w = 460.0_f64;
        let h = 420.0_f64;
        let x = ((screen_size.width as f64 / scale) - w) / 2.0;

        let _ = window.set_position(tauri::LogicalPosition { x, y: 0.0 });
        let _ = window.set_size(tauri::LogicalSize { width: w as u32, height: h as u32 });
    }

    window.show().map_err(|e| e.to_string())?;
    // Don't steal focus for the peek notification
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
    #[cfg(target_os = "windows")]
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

    #[cfg(target_os = "linux")]
    {
        let home = std::env::var("HOME").unwrap_or_default();
        let autostart_path = format!("{}/.config/autostart/dhikrtop.desktop", home);
        Ok(std::path::Path::new(&autostart_path).exists())
    }

    #[cfg(target_os = "macos")]
    {
        let home = std::env::var("HOME").unwrap_or_default();
        let plist_path = format!("{}/Library/LaunchAgents/com.dhikrtop.app.plist", home);
        Ok(std::path::Path::new(&plist_path).exists())
    }
}

/// Set Windows startup registry.
#[tauri::command]
pub fn set_startup(app: AppHandle, enabled: bool) -> Result<(), String> {
    #[cfg(target_os = "windows")]
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

    #[cfg(target_os = "linux")]
    {
        use std::fs;
        let home = std::env::var("HOME").map_err(|_| "HOME not set")?;
        let autostart_dir = format!("{}/.config/autostart", home);
        let autostart_path = format!("{}/dhikrtop.desktop", autostart_dir);

        if enabled {
            // Create autostart directory if it doesn't exist
            fs::create_dir_all(&autostart_dir)
                .map_err(|e| format!("Failed to create autostart dir: {}", e))?;

            let exe_path = std::env::current_exe()
                .map_err(|e| format!("Failed to get exe path: {}", e))?
                .to_string_lossy()
                .to_string();

            let desktop_entry = format!(
                "[Desktop Entry]\nType=Application\nName=Dhikrtop\nExec={}\nIcon=dhikrtop\nComment=Islamic remembrance desktop app\nX-GNOME-Autostart-enabled=true\n",
                exe_path
            );

            fs::write(&autostart_path, desktop_entry)
                .map_err(|e| format!("Failed to write desktop file: {}", e))?;
        } else {
            let _ = fs::remove_file(&autostart_path);
        }
        Ok(())
    }

    #[cfg(target_os = "macos")]
    {
        use std::fs;
        let home = std::env::var("HOME").map_err(|_| "HOME not set")?;
        let launch_agents_dir = format!("{}/Library/LaunchAgents", home);
        let plist_path = format!("{}/com.dhikrtop.app.plist", launch_agents_dir);

        if enabled {
            // Create directory if it doesn't exist
            fs::create_dir_all(&launch_agents_dir)
                .map_err(|e| format!("Failed to create LaunchAgents dir: {}", e))?;

            let exe_path = std::env::current_exe()
                .map_err(|e| format!("Failed to get exe path: {}", e))?
                .to_string_lossy()
                .to_string();

            let plist_content = format!(
                r#"<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.dhikrtop.app</string>
    <key>ProgramArguments</key>
    <array>
        <string>{}</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <false/>
</dict>
</plist>
"#,
                exe_path
            );

            fs::write(&plist_path, plist_content)
                .map_err(|e| format!("Failed to write plist: {}", e))?;
        } else {
            let _ = fs::remove_file(&plist_path);
        }
        Ok(())
    }
}
