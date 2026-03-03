use crate::db::{
    AdhkarDailyProgress, AdhkarProgress, AppSettings, Database, Notification, QuranProgress, User,
    VoiceRecording,
};
use serde_json::Value;
use std::sync::Mutex;
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::{AppHandle, Manager, WebviewWindow};
use uuid::Uuid;

// Global database instance (lazy initialized)
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

// ══════════════════════════════════════════════════════════════════════
// Database Commands
// ══════════════════════════════════════════════════════════════════════

/// Helper function to get or initialize the database.
///
/// Important: Tauri commands require returned futures to be `Send`.
/// Never hold a `std::sync::MutexGuard` across an `.await`.
async fn get_db() -> Result<Database, String> {
    // Fast path: already initialized
    if let Some(db) = DB_INSTANCE.lock().unwrap().as_ref().cloned() {
        return Ok(db);
    }

    // Slow path: initialize outside the lock (to keep the future `Send`)
    let db = Database::new_default()
        .await
        .map_err(|e| format!("Failed to create database: {:?}", e))?;
    db.init()
        .await
        .map_err(|e| format!("Failed to initialize database: {:?}", e))?;

    // Store it (double-check in case another task won the race)
    let stored = {
        let mut guard = DB_INSTANCE.lock().unwrap();
        if guard.is_none() {
            *guard = Some(db.clone());
        }
        guard.as_ref().cloned()
    };

    stored.ok_or_else(|| "Database initialization failed".to_string())
}

/// Initialize the database
#[tauri::command]
pub async fn db_init() -> Result<(), String> {
    get_db().await?;
    Ok(())
}

/// Save or update a user
#[tauri::command]
pub async fn db_save_user(id: String, name: String, language: String) -> Result<User, String> {
    let db = get_db().await?;

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

    db.upsert_user(&user)
        .await
        .map_err(|e| format!("Failed to save user: {:?}", e))
}

/// Get a user by ID
#[tauri::command]
pub async fn db_get_user(id: String) -> Result<Option<User>, String> {
    let db = get_db().await?;
    db.get_user(&id)
        .await
        .map_err(|e| format!("Failed to get user: {:?}", e))
}

/// Save adhkar progress
#[tauri::command]
pub async fn db_save_adhkar_progress(
    user_id: String,
    adhkar_id: String,
    user_rating: Option<String>,
) -> Result<AdhkarProgress, String> {
    let db = get_db().await?;

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

    db.save_adhkar_progress(&progress)
        .await
        .map_err(|e| format!("Failed to save adhkar progress: {:?}", e))
}

/// Get adhkar progress for a user
#[tauri::command]
pub async fn db_get_adhkar_progress(user_id: String) -> Result<Vec<AdhkarProgress>, String> {
    let db = get_db().await?;
    db.get_adhkar_progress(&user_id)
        .await
        .map_err(|e| format!("Failed to get adhkar progress: {:?}", e))
}

// ── Daily Adhkar Progress (calendar) ────────────────────────────────

#[tauri::command]
pub async fn db_increment_daily_adhkar(
    user_id: String,
    day_key: String,
    adhkar_id: String,
    target_count: i32,
    increment: i32,
) -> Result<AdhkarDailyProgress, String> {
    let db = get_db().await?;
    db.increment_daily_adhkar(&user_id, &day_key, &adhkar_id, target_count, increment)
        .await
        .map_err(|e| format!("Failed to increment daily adhkar: {:?}", e))
}

#[tauri::command]
pub async fn db_set_daily_adhkar_count(
    user_id: String,
    day_key: String,
    adhkar_id: String,
    target_count: i32,
    count: i32,
) -> Result<AdhkarDailyProgress, String> {
    let db = get_db().await?;
    db.set_daily_adhkar_count(&user_id, &day_key, &adhkar_id, target_count, count)
        .await
        .map_err(|e| format!("Failed to set daily adhkar count: {:?}", e))
}

#[tauri::command]
pub async fn db_get_daily_adhkar_progress(
    user_id: String,
    day_key: String,
) -> Result<Vec<AdhkarDailyProgress>, String> {
    let db = get_db().await?;
    db.get_daily_adhkar_progress(&user_id, &day_key)
        .await
        .map_err(|e| format!("Failed to get daily adhkar progress: {:?}", e))
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
    longitude: Option<f64>,
) -> Result<AppSettings, String> {
    let db = get_db().await?;

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

    db.save_app_settings(&settings)
        .await
        .map_err(|e| format!("Failed to save settings: {:?}", e))
}

/// Get app settings for a user
#[tauri::command]
pub async fn db_get_app_settings(user_id: String) -> Result<Option<AppSettings>, String> {
    let db = get_db().await?;
    db.get_app_settings(&user_id)
        .await
        .map_err(|e| format!("Failed to get settings: {:?}", e))
}

/// Save quran progress
#[tauri::command]
pub async fn db_save_quran_progress(
    user_id: String,
    surah_number: i32,
    verse_number: i32,
    bookmarked: bool,
) -> Result<QuranProgress, String> {
    let db = get_db().await?;

    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs() as i64;

    let progress = QuranProgress {
        id: 0, // Will be auto-generated
        user_id,
        surah_number,
        verse_number,
        last_read: Some(now),
        read_count: 1,
        bookmarked,
        created_at: now,
        updated_at: now,
    };

    db.save_quran_progress(&progress)
        .await
        .map_err(|e| format!("Failed to save quran progress: {:?}", e))
}

/// Get quran progress for a user
#[tauri::command]
pub async fn db_get_quran_progress(user_id: String) -> Result<Vec<QuranProgress>, String> {
    let db = get_db().await?;
    db.get_quran_progress(&user_id)
        .await
        .map_err(|e| format!("Failed to get quran progress: {:?}", e))
}

/// Save voice recording metadata
#[tauri::command]
pub async fn db_save_voice_recording(
    user_id: String,
    surah_number: i32,
    verse_number: i32,
    file_path: String,
    duration: Option<f64>,
    confidence_score: Option<f64>,
    transcription: Option<String>,
) -> Result<String, String> {
    let db = get_db().await?;

    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs() as i64;

    let id = Uuid::new_v4().to_string();

    let recording = VoiceRecording {
        id: id.clone(),
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
        .map_err(|e| format!("Failed to save voice recording: {:?}", e))?;

    Ok(id)
}

/// Get all voice recordings for a user
#[tauri::command]
pub async fn db_get_voice_recordings(user_id: String) -> Result<Vec<VoiceRecording>, String> {
    let db = get_db().await?;
    db.get_voice_recordings(&user_id)
        .await
        .map_err(|e| format!("Failed to get voice recordings: {:?}", e))
}

/// Get voice recordings for a specific verse
#[tauri::command]
pub async fn db_get_verse_recordings(
    user_id: String,
    surah_number: i32,
    verse_number: i32,
) -> Result<Vec<VoiceRecording>, String> {
    let db = get_db().await?;
    db.get_verse_recordings(&user_id, surah_number, verse_number)
        .await
        .map_err(|e| format!("Failed to get verse recordings: {:?}", e))
}

/// Delete a voice recording
#[tauri::command]
pub async fn db_delete_voice_recording(recording_id: String) -> Result<(), String> {
    let db = get_db().await?;
    db.delete_voice_recording(&recording_id)
        .await
        .map_err(|e| format!("Failed to delete voice recording: {:?}", e))
}

/// Export all user data as JSON
#[tauri::command]
pub async fn db_export_user_data(user_id: String) -> Result<Value, String> {
    let db = get_db().await?;
    db.export_user_data(&user_id)
        .await
        .map_err(|e| format!("Failed to export user data: {:?}", e))
}

/// Reset all user data
#[tauri::command]
pub async fn db_reset_user_data(user_id: String) -> Result<(), String> {
    let db = get_db().await?;
    db.reset_user_data(&user_id)
        .await
        .map_err(|e| format!("Failed to reset user data: {:?}", e))
}

// ── Notifications / Activity Feed ───────────────────────────────────

#[tauri::command]
pub async fn db_add_notification(
    user_id: String,
    kind: String,
    notif_type: String,
    title: String,
    subtitle: Option<String>,
    content: Option<String>,
    related_id: Option<String>,
) -> Result<String, String> {
    let db = get_db().await?;
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs() as i64;
    let id = Uuid::new_v4().to_string();
    let n = Notification {
        id: id.clone(),
        user_id,
        kind,
        notif_type,
        title,
        subtitle,
        content,
        related_id,
        created_at: now,
        read_at: None,
        dismissed_at: None,
    };
    db.add_notification(&n)
        .await
        .map_err(|e| format!("Failed to add notification: {:?}", e))?;
    Ok(id)
}

#[tauri::command]
pub async fn db_get_recent_notifications(
    user_id: String,
    limit: i64,
    include_dismissed: bool,
) -> Result<Vec<Notification>, String> {
    let db = get_db().await?;
    db.get_recent_notifications(&user_id, limit, include_dismissed)
        .await
        .map_err(|e| format!("Failed to get recent notifications: {:?}", e))
}

#[tauri::command]
pub async fn db_mark_notification_read(id: String) -> Result<(), String> {
    let db = get_db().await?;
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs() as i64;
    db.mark_notification_read(&id, now)
        .await
        .map_err(|e| format!("Failed to mark notification read: {:?}", e))
}

#[tauri::command]
pub async fn db_dismiss_notification(id: String) -> Result<(), String> {
    let db = get_db().await?;
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs() as i64;
    db.dismiss_notification(&id, now)
        .await
        .map_err(|e| format!("Failed to dismiss notification: {:?}", e))
}

#[tauri::command]
pub async fn db_clear_notifications(user_id: String) -> Result<(), String> {
    let db = get_db().await?;
    db.clear_notifications(&user_id)
        .await
        .map_err(|e| format!("Failed to clear notifications: {:?}", e))
}
