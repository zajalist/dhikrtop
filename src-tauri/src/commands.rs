use crate::db::{AdhkarProgress, AppSettings, Database, QuranProgress, User, VoiceRecording};
use serde_json::{json, Value};
use std::sync::Mutex;
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::{AppHandle, Manager, WebviewWindow};
use uuid::Uuid;

/// Global database instance (lazy initialized)
lazy_static::lazy_static! {
    static ref DB_INSTANCE: Mutex<Option<Database>> = Mutex::new(None);
}

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
        let _ = window.set_size(tauri::LogicalSize {
            width: w as u32,
            height: h as u32,
        });
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

    let prefs = store.get("preferences").unwrap_or(serde_json::json!({
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
        use winreg::enums::HKEY_CURRENT_USER;
        use winreg::RegKey;

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
        use winreg::enums::{HKEY_CURRENT_USER, KEY_WRITE};
        use winreg::RegKey;

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

// ── Database Commands ──────────────────────────────────────────────

/// Initialize database at app startup
/// Call this once when the app starts
#[tauri::command]
pub async fn db_init(app: AppHandle) -> Result<(), String> {
    let app_dir = app.path()
        .app_local_data_dir()
        .map_err(|e| format!("Failed to get app dir: {}", e))?;

    let db_path = app_dir.join("app.db").to_string_lossy().to_string();

    let db = Database::new(&db_path)
        .await
        .map_err(|e| format!("Failed to create database: {}", e))?;

    db.init()
        .await
        .map_err(|e| format!("Failed to initialize schema: {}", e))?;

    let mut instance = DB_INSTANCE.lock().unwrap();
    *instance = Some(db);

    Ok(())
}

/// Save or update user
#[tauri::command]
pub async fn db_save_user(id: String, name: String, language: String) -> Result<Value, String> {
    let instance = DB_INSTANCE.lock().unwrap();
    let db = instance.as_ref().ok_or("Database not initialized")?;

    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs() as i64;

    let user = User {
        id,
        name,
        language,
        created_at: now,
        updated_at: now,
    };

    let saved = db.upsert_user(&user)
        .await
        .map_err(|e| e.message)?;

    Ok(serde_json::to_value(saved).unwrap())
}

/// Get user
#[tauri::command]
pub async fn db_get_user(id: String) -> Result<Option<Value>, String> {
    let instance = DB_INSTANCE.lock().unwrap();
    let db = instance.as_ref().ok_or("Database not initialized")?;

    let user = db.get_user(&id)
        .await
        .map_err(|e| e.message)?;

    Ok(user.map(|u| serde_json::to_value(u).unwrap()))
}

/// Save adhkar progress
#[tauri::command]
pub async fn db_save_adhkar_progress(
    user_id: String,
    adhkar_id: String,
    user_rating: Option<String>
) -> Result<Value, String> {
    let instance = DB_INSTANCE.lock().unwrap();
    let db = instance.as_ref().ok_or("Database not initialized")?;

    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs() as i64;

    let progress = AdhkarProgress {
        id: 0, // Will be auto-generated
        user_id,
        adhkar_id,
        display_count: 1,
        last_displayed: Some(now),
        user_rating,
        created_at: now,
        updated_at: now,
    };

    let saved = db.save_adhkar_progress(&progress)
        .await
        .map_err(|e| e.message)?;

    Ok(serde_json::to_value(saved).unwrap())
}

/// Get all adhkar progress for user
#[tauri::command]
pub async fn db_get_adhkar_progress(user_id: String) -> Result<Vec<Value>, String> {
    let instance = DB_INSTANCE.lock().unwrap();
    let db = instance.as_ref().ok_or("Database not initialized")?;

    let progress = db.get_adhkar_progress(&user_id)
        .await
        .map_err(|e| e.message)?;

    Ok(progress.into_iter()
        .map(|p| serde_json::to_value(p).unwrap())
        .collect())
}

/// Save app settings
#[tauri::command]
pub async fn db_save_app_settings(
    user_id: String,
    reminder_interval: i32,
    enable_notifications: bool,
    enable_sound: bool,
    quiet_hours_start: Option<String>,
    quiet_hours_end: Option<String>,
    language: String,
    theme: String,
    latitude: Option<f64>,
    longitude: Option<f64>
) -> Result<Value, String> {
    let instance = DB_INSTANCE.lock().unwrap();
    let db = instance.as_ref().ok_or("Database not initialized")?;

    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs() as i64;

    let settings = AppSettings {
        user_id,
        reminder_interval,
        enable_notifications,
        enable_sound,
        quiet_hours_start,
        quiet_hours_end,
        language,
        theme,
        latitude,
        longitude,
        updated_at: now,
    };

    let saved = db.save_app_settings(&settings)
        .await
        .map_err(|e| e.message)?;

    Ok(serde_json::to_value(saved).unwrap())
}

/// Get app settings
#[tauri::command]
pub async fn db_get_app_settings(user_id: String) -> Result<Option<Value>, String> {
    let instance = DB_INSTANCE.lock().unwrap();
    let db = instance.as_ref().ok_or("Database not initialized")?;

    let settings = db.get_app_settings(&user_id)
        .await
        .map_err(|e| e.message)?;

    Ok(settings.map(|s| serde_json::to_value(s).unwrap()))
}

/// Save quran reading progress
#[tauri::command]
pub async fn db_save_quran_progress(
    user_id: String,
    surah_number: i32,
    verse_number: i32,
    bookmarked: bool
) -> Result<Value, String> {
    let instance = DB_INSTANCE.lock().unwrap();
    let db = instance.as_ref().ok_or("Database not initialized")?;

    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs() as i64;

    let progress = QuranProgress {
        id: 0,
        user_id,
        surah_number,
        verse_number,
        last_read: Some(now),
        read_count: 1,
        bookmarked,
        created_at: now,
        updated_at: now,
    };

    let saved = db.save_quran_progress(&progress)
        .await
        .map_err(|e| e.message)?;

    Ok(serde_json::to_value(saved).unwrap())
}

/// Get all quran progress for user
#[tauri::command]
pub async fn db_get_quran_progress(user_id: String) -> Result<Vec<Value>, String> {
    let instance = DB_INSTANCE.lock().unwrap();
    let db = instance.as_ref().ok_or("Database not initialized")?;

    let progress = db.get_quran_progress(&user_id)
        .await
        .map_err(|e| e.message)?;

    Ok(progress.into_iter()
        .map(|p| serde_json::to_value(p).unwrap())
        .collect())
}

/// Save voice recording
#[tauri::command]
pub async fn db_save_voice_recording(
    user_id: String,
    surah_number: i32,
    verse_number: i32,
    file_path: String,
    duration: Option<f64>,
    confidence_score: Option<f64>,
    transcription: Option<String>
) -> Result<String, String> {
    let instance = DB_INSTANCE.lock().unwrap();
    let db = instance.as_ref().ok_or("Database not initialized")?;

    let recording_id = Uuid::new_v4().to_string();
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs() as i64;

    let recording = VoiceRecording {
        id: recording_id.clone(),
        user_id,
        surah_number,
        verse_number,
        file_path,
        duration,
        confidence_score,
        transcription,
        created_at: now,
    };

    db.save_voice_recording(&recording)
        .await
        .map_err(|e| e.message)?;

    Ok(recording_id)
}

/// Get voice recordings for user
#[tauri::command]
pub async fn db_get_voice_recordings(user_id: String) -> Result<Vec<Value>, String> {
    let instance = DB_INSTANCE.lock().unwrap();
    let db = instance.as_ref().ok_or("Database not initialized")?;

    let recordings = db.get_voice_recordings(&user_id)
        .await
        .map_err(|e| e.message)?;

    Ok(recordings.into_iter()
        .map(|r| serde_json::to_value(r).unwrap())
        .collect())
}

/// Get voice recordings for specific verse
#[tauri::command]
pub async fn db_get_verse_recordings(
    user_id: String,
    surah_number: i32,
    verse_number: i32
) -> Result<Vec<Value>, String> {
    let instance = DB_INSTANCE.lock().unwrap();
    let db = instance.as_ref().ok_or("Database not initialized")?;

    let recordings = db.get_verse_recordings(&user_id, surah_number, verse_number)
        .await
        .map_err(|e| e.message)?;

    Ok(recordings.into_iter()
        .map(|r| serde_json::to_value(r).unwrap())
        .collect())
}

/// Delete voice recording
#[tauri::command]
pub async fn db_delete_voice_recording(recording_id: String) -> Result<(), String> {
    let instance = DB_INSTANCE.lock().unwrap();
    let db = instance.as_ref().ok_or("Database not initialized")?;

    db.delete_voice_recording(&recording_id)
        .await
        .map_err(|e| e.message)?;

    Ok(())
}

/// Export all user data as JSON
#[tauri::command]
pub async fn db_export_user_data(user_id: String) -> Result<Value, String> {
    let instance = DB_INSTANCE.lock().unwrap();
    let db = instance.as_ref().ok_or("Database not initialized")?;

    let data = db.export_user_data(&user_id)
        .await
        .map_err(|e| e.message)?;

    Ok(data)
}

/// Reset all user data
#[tauri::command]
pub async fn db_reset_user_data(user_id: String) -> Result<(), String> {
    let instance = DB_INSTANCE.lock().unwrap();
    let db = instance.as_ref().ok_or("Database not initialized")?;

    db.reset_user_data(&user_id)
        .await
        .map_err(|e| e.message)?;

    Ok(())
}
