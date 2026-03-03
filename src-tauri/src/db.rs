use serde::{Deserialize, Serialize};
/// SQLite Database Module
///
/// Handles all local database operations for Dhikrtop.
/// Database is stored locally on the user's machine at:
/// - Windows: C:\Users\<YourName>\AppData\Local\Dhikrtop\app.db
/// - Linux: ~/.config/Dhikrtop/app.db
/// - macOS: ~/Library/Application Support/Dhikrtop/app.db
use sqlx::sqlite::{SqliteConnectOptions, SqlitePool, SqlitePoolOptions};
use std::str::FromStr;
use std::time::{SystemTime, UNIX_EPOCH};

use crate::schema::SCHEMA_SQL;

/// Error type for database operations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DbError {
    pub message: String,
}

impl From<sqlx::Error> for DbError {
    fn from(err: sqlx::Error) -> Self {
        DbError {
            message: format!("Database error: {}", err),
        }
    }
}

/// User model
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct User {
    pub id: String,
    pub name: String,
    pub language: String,
    pub created_at: i64,
    pub updated_at: i64,
}

/// Adhkar progress model
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct AdhkarProgress {
    pub id: i64,
    pub user_id: String,
    pub adhkar_id: String,
    pub display_count: i32,
    pub last_displayed: Option<i64>,
    pub user_rating: Option<String>,
    pub created_at: i64,
    pub updated_at: i64,
}

/// Daily adhkar progress (per calendar day)
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct AdhkarDailyProgress {
    pub id: i64,
    pub user_id: String,
    pub day_key: String, // YYYY-MM-DD
    pub adhkar_id: String,
    pub count: i32,
    pub target_count: i32,
    pub completed_at: Option<i64>,
    pub last_tapped_at: Option<i64>,
    pub created_at: i64,
    pub updated_at: i64,
}

/// App settings model
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct AppSettings {
    pub user_id: String,
    pub reminder_interval: i32,
    pub enable_notifications: bool,
    pub enable_sound: bool,
    pub quiet_hours_start: Option<String>,
    pub quiet_hours_end: Option<String>,
    pub language: String,
    pub theme: String,
    pub latitude: Option<f64>,
    pub longitude: Option<f64>,
    pub updated_at: i64,
}

/// Quran progress model
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct QuranProgress {
    pub id: i64,
    pub user_id: String,
    pub surah_number: i32,
    pub verse_number: i32,
    pub last_read: Option<i64>,
    pub read_count: i32,
    pub bookmarked: bool,
    pub created_at: i64,
    pub updated_at: i64,
}

/// Voice recording model
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct VoiceRecording {
    pub id: String,
    pub user_id: String,
    pub surah_number: i32,
    pub verse_number: i32,
    pub file_path: String,
    pub duration: Option<f64>,
    pub confidence_score: Option<f64>,
    pub transcription: Option<String>,
    pub created_at: i64,
}

/// Notification / activity feed event
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Notification {
    pub id: String,
    pub user_id: String,
    pub kind: String,
    pub notif_type: String,
    pub title: String,
    pub subtitle: Option<String>,
    pub content: Option<String>,
    pub related_id: Option<String>,
    pub created_at: i64,
    pub read_at: Option<i64>,
    pub dismissed_at: Option<i64>,
}

/// Database connection pool and operations
#[derive(Clone)]
pub struct Database {
    pool: SqlitePool,
}

impl Database {
    /// Create new database connection pool with default path
    pub async fn new_default() -> Result<Self, DbError> {
        let db_path = if cfg!(target_os = "windows") {
            let app_data = std::env::var("LOCALAPPDATA").unwrap_or_else(|_| ".".to_string());
            format!("{}\\Dhikrtop\\app.db", app_data)
        } else if cfg!(target_os = "macos") {
            let home = std::env::var("HOME").unwrap_or_else(|_| ".".to_string());
            format!("{}/Library/Application Support/Dhikrtop/app.db", home)
        } else {
            let home = std::env::var("HOME").unwrap_or_else(|_| ".".to_string());
            format!("{}/.config/Dhikrtop/app.db", home)
        };

        Self::new(&db_path).await
    }

    /// Create new database connection pool
    pub async fn new(db_path: &str) -> Result<Self, DbError> {
        // Create directory if it doesn't exist
        if let Some(parent) = std::path::Path::new(db_path).parent() {
            std::fs::create_dir_all(parent).ok();
        }

        let connection_options = SqliteConnectOptions::from_str(&format!("sqlite://{}", db_path))?
            .create_if_missing(true);

        let pool = SqlitePoolOptions::new()
            .max_connections(5)
            .connect_with(connection_options)
            .await?;

        Ok(Database { pool })
    }

    /// Initialize database schema
    pub async fn init(&self) -> Result<(), DbError> {
        sqlx::query(SCHEMA_SQL).execute(&self.pool).await?;

        Ok(())
    }

    /// Get current timestamp in seconds since epoch
    fn now() -> i64 {
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs() as i64
    }

    // ── User Operations ────────────────────────────────────────────────

    /// Create or get user
    pub async fn upsert_user(&self, user: &User) -> Result<User, DbError> {
        let now = Self::now();

        sqlx::query_as::<_, User>(
            "INSERT INTO users (id, name, language, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET
             name=excluded.name, language=excluded.language, updated_at=?",
        )
        .bind(&user.id)
        .bind(&user.name)
        .bind(&user.language)
        .bind(user.created_at)
        .bind(now)
        .bind(now)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| e.into())
    }

    /// Get user by ID
    pub async fn get_user(&self, user_id: &str) -> Result<Option<User>, DbError> {
        sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = ?")
            .bind(user_id)
            .fetch_optional(&self.pool)
            .await
            .map_err(|e| e.into())
    }

    // ── Adhkar Progress Operations ──────────────────────────────────────

    /// Save adhkar progress
    pub async fn save_adhkar_progress(
        &self,
        progress: &AdhkarProgress,
    ) -> Result<AdhkarProgress, DbError> {
        let now = Self::now();

        sqlx::query_as::<_, AdhkarProgress>(
            "INSERT INTO adhkar_progress
             (user_id, adhkar_id, display_count, last_displayed, user_rating, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(user_id, adhkar_id) DO UPDATE SET
             display_count=display_count+1,
             last_displayed=excluded.last_displayed,
             user_rating=excluded.user_rating,
             updated_at=?"
        )
        .bind(&progress.user_id)
        .bind(&progress.adhkar_id)
        .bind(progress.display_count)
        .bind(progress.last_displayed)
        .bind(&progress.user_rating)
        .bind(progress.created_at)
        .bind(now)
        .bind(now)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| e.into())
    }

    /// Get adhkar progress for user
    pub async fn get_adhkar_progress(&self, user_id: &str) -> Result<Vec<AdhkarProgress>, DbError> {
        sqlx::query_as::<_, AdhkarProgress>(
            "SELECT * FROM adhkar_progress WHERE user_id = ? ORDER BY last_displayed DESC",
        )
        .bind(user_id)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| e.into())
    }

    // ── Daily Adhkar Progress (calendar) ─────────────────────────────

    /// Increment daily adhkar count for a given day_key and adhkar_id.
    pub async fn increment_daily_adhkar(
        &self,
        user_id: &str,
        day_key: &str,
        adhkar_id: &str,
        target_count: i32,
        increment: i32,
    ) -> Result<AdhkarDailyProgress, DbError> {
        let now = Self::now();

        // Ensure the user exists to satisfy FK constraints on adhkar_daily_progress.
        sqlx::query(
            "INSERT OR IGNORE INTO users (id, name, language, created_at, updated_at)
             VALUES (?, ?, 'en', ?, ?)",
        )
        .bind(user_id)
        .bind(user_id)
        .bind(now)
        .bind(now)
        .execute(&self.pool)
        .await?;

        // Execute the INSERT/UPDATE
        sqlx::query(
            "INSERT INTO adhkar_daily_progress (user_id, day_key, adhkar_id, count, target_count, completed_at, last_tapped_at, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, NULL, ?, ?, ?)
             ON CONFLICT(user_id, day_key, adhkar_id) DO UPDATE SET
             count = count + ?,
             target_count = ?,
             last_tapped_at = ?,
             completed_at = CASE
               WHEN (count + ? >= ? AND ? > 0) THEN COALESCE(completed_at, ?)
               ELSE NULL
             END,
             updated_at = ?"
        )
        .bind(user_id)
        .bind(day_key)
        .bind(adhkar_id)
        .bind(increment)
        .bind(target_count)
        .bind(now)
        .bind(now)
        .bind(now)
        .bind(increment)
        .bind(target_count)
        .bind(now)
        .bind(increment)
        .bind(target_count)
        .bind(target_count)
        .bind(now)
        .bind(now)
        .execute(&self.pool)
        .await?;

        // Then SELECT the row
        sqlx::query_as::<_, AdhkarDailyProgress>(
            "SELECT * FROM adhkar_daily_progress WHERE user_id = ? AND day_key = ? AND adhkar_id = ?"
        )
        .bind(user_id)
        .bind(day_key)
        .bind(adhkar_id)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| e.into())
    }

    /// Set daily adhkar count explicitly (used for reset).
    pub async fn set_daily_adhkar_count(
        &self,
        user_id: &str,
        day_key: &str,
        adhkar_id: &str,
        target_count: i32,
        count: i32,
    ) -> Result<AdhkarDailyProgress, DbError> {
        let now = Self::now();

        // Ensure the user exists to satisfy FK constraints on adhkar_daily_progress.
        sqlx::query(
            "INSERT OR IGNORE INTO users (id, name, language, created_at, updated_at)
             VALUES (?, ?, 'en', ?, ?)",
        )
        .bind(user_id)
        .bind(user_id)
        .bind(now)
        .bind(now)
        .execute(&self.pool)
        .await?;

        // Execute the INSERT/UPDATE
        sqlx::query(
            "INSERT INTO adhkar_daily_progress (user_id, day_key, adhkar_id, count, target_count, completed_at, last_tapped_at, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, NULL, ?, ?, ?)
             ON CONFLICT(user_id, day_key, adhkar_id) DO UPDATE SET
             count = ?,
             target_count = ?,
             last_tapped_at = ?,
             completed_at = CASE
               WHEN (? >= ? AND ? > 0) THEN ?
               ELSE NULL
             END,
             updated_at = ?"
        )
        .bind(user_id)
        .bind(day_key)
        .bind(adhkar_id)
        .bind(count)
        .bind(target_count)
        .bind(now)
        .bind(now)
        .bind(now)
        .bind(count)
        .bind(target_count)
        .bind(now)
        .bind(count)
        .bind(target_count)
        .bind(target_count)
        .bind(now)
        .bind(now)
        .execute(&self.pool)
        .await?;

        // Then SELECT the row
        sqlx::query_as::<_, AdhkarDailyProgress>(
            "SELECT * FROM adhkar_daily_progress WHERE user_id = ? AND day_key = ? AND adhkar_id = ?"
        )
        .bind(user_id)
        .bind(day_key)
        .bind(adhkar_id)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| e.into())
    }

    pub async fn get_daily_adhkar_progress(
        &self,
        user_id: &str,
        day_key: &str,
    ) -> Result<Vec<AdhkarDailyProgress>, DbError> {
        sqlx::query_as::<_, AdhkarDailyProgress>(
            "SELECT * FROM adhkar_daily_progress WHERE user_id = ? AND day_key = ?",
        )
        .bind(user_id)
        .bind(day_key)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| e.into())
    }

    /// Get specific adhkar progress
    pub async fn get_adhkar(
        &self,
        user_id: &str,
        adhkar_id: &str,
    ) -> Result<Option<AdhkarProgress>, DbError> {
        sqlx::query_as::<_, AdhkarProgress>(
            "SELECT * FROM adhkar_progress WHERE user_id = ? AND adhkar_id = ?",
        )
        .bind(user_id)
        .bind(adhkar_id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| e.into())
    }

    // ── App Settings Operations ────────────────────────────────────────

    /// Save app settings
    pub async fn save_app_settings(&self, settings: &AppSettings) -> Result<AppSettings, DbError> {
        let now = Self::now();

        sqlx::query_as::<_, AppSettings>(
            "INSERT INTO app_settings
             (user_id, reminder_interval, enable_notifications, enable_sound,
              quiet_hours_start, quiet_hours_end, language, theme, latitude, longitude, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(user_id) DO UPDATE SET
             reminder_interval=excluded.reminder_interval,
             enable_notifications=excluded.enable_notifications,
             enable_sound=excluded.enable_sound,
             quiet_hours_start=excluded.quiet_hours_start,
             quiet_hours_end=excluded.quiet_hours_end,
             language=excluded.language,
             theme=excluded.theme,
             latitude=excluded.latitude,
             longitude=excluded.longitude,
             updated_at=?",
        )
        .bind(&settings.user_id)
        .bind(settings.reminder_interval)
        .bind(settings.enable_notifications)
        .bind(settings.enable_sound)
        .bind(&settings.quiet_hours_start)
        .bind(&settings.quiet_hours_end)
        .bind(&settings.language)
        .bind(&settings.theme)
        .bind(settings.latitude)
        .bind(settings.longitude)
        .bind(now)
        .bind(now)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| e.into())
    }

    /// Get app settings
    pub async fn get_app_settings(&self, user_id: &str) -> Result<Option<AppSettings>, DbError> {
        sqlx::query_as::<_, AppSettings>("SELECT * FROM app_settings WHERE user_id = ?")
            .bind(user_id)
            .fetch_optional(&self.pool)
            .await
            .map_err(|e| e.into())
    }

    // ── Quran Progress Operations ──────────────────────────────────────

    /// Save quran reading progress
    pub async fn save_quran_progress(
        &self,
        progress: &QuranProgress,
    ) -> Result<QuranProgress, DbError> {
        let now = Self::now();

        sqlx::query_as::<_, QuranProgress>(
            "INSERT INTO quran_progress
             (user_id, surah_number, verse_number, last_read, read_count, bookmarked, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(user_id, surah_number, verse_number) DO UPDATE SET
             last_read=excluded.last_read,
             read_count=read_count+1,
             bookmarked=excluded.bookmarked,
             updated_at=?"
        )
        .bind(&progress.user_id)
        .bind(progress.surah_number)
        .bind(progress.verse_number)
        .bind(progress.last_read)
        .bind(progress.read_count)
        .bind(progress.bookmarked)
        .bind(progress.created_at)
        .bind(now)
        .bind(now)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| e.into())
    }

    /// Get quran progress for user
    pub async fn get_quran_progress(&self, user_id: &str) -> Result<Vec<QuranProgress>, DbError> {
        sqlx::query_as::<_, QuranProgress>(
            "SELECT * FROM quran_progress WHERE user_id = ? ORDER BY last_read DESC",
        )
        .bind(user_id)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| e.into())
    }

    /// Get quran progress for specific surah
    pub async fn get_surah_progress(
        &self,
        user_id: &str,
        surah_number: i32,
    ) -> Result<Vec<QuranProgress>, DbError> {
        sqlx::query_as::<_, QuranProgress>(
            "SELECT * FROM quran_progress WHERE user_id = ? AND surah_number = ? ORDER BY verse_number"
        )
        .bind(user_id)
        .bind(surah_number)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| e.into())
    }

    // ── Voice Recording Operations ──────────────────────────────────────

    /// Save voice recording
    pub async fn save_voice_recording(
        &self,
        recording: &VoiceRecording,
    ) -> Result<VoiceRecording, DbError> {
        sqlx::query_as::<_, VoiceRecording>(
            "INSERT INTO voice_recordings
             (id, user_id, surah_number, verse_number, file_path, duration, confidence_score, transcription, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
        )
        .bind(&recording.id)
        .bind(&recording.user_id)
        .bind(recording.surah_number)
        .bind(recording.verse_number)
        .bind(&recording.file_path)
        .bind(recording.duration)
        .bind(recording.confidence_score)
        .bind(&recording.transcription)
        .bind(recording.created_at)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| e.into())
    }

    /// Get voice recordings for user
    pub async fn get_voice_recordings(
        &self,
        user_id: &str,
    ) -> Result<Vec<VoiceRecording>, DbError> {
        sqlx::query_as::<_, VoiceRecording>(
            "SELECT * FROM voice_recordings WHERE user_id = ? ORDER BY created_at DESC",
        )
        .bind(user_id)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| e.into())
    }

    /// Get voice recordings for specific verse
    pub async fn get_verse_recordings(
        &self,
        user_id: &str,
        surah_number: i32,
        verse_number: i32,
    ) -> Result<Vec<VoiceRecording>, DbError> {
        sqlx::query_as::<_, VoiceRecording>(
            "SELECT * FROM voice_recordings
             WHERE user_id = ? AND surah_number = ? AND verse_number = ?
             ORDER BY created_at DESC",
        )
        .bind(user_id)
        .bind(surah_number)
        .bind(verse_number)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| e.into())
    }

    /// Delete voice recording
    pub async fn delete_voice_recording(&self, recording_id: &str) -> Result<(), DbError> {
        sqlx::query("DELETE FROM voice_recordings WHERE id = ?")
            .bind(recording_id)
            .execute(&self.pool)
            .await?;

        Ok(())
    }

    // ── Utility Operations ────────────────────────────────────────────

    /// Clear all user data (reset app)
    pub async fn reset_user_data(&self, user_id: &str) -> Result<(), DbError> {
        sqlx::query("DELETE FROM adhkar_progress WHERE user_id = ?")
            .bind(user_id)
            .execute(&self.pool)
            .await?;

        sqlx::query("DELETE FROM quran_progress WHERE user_id = ?")
            .bind(user_id)
            .execute(&self.pool)
            .await?;

        sqlx::query("DELETE FROM voice_recordings WHERE user_id = ?")
            .bind(user_id)
            .execute(&self.pool)
            .await?;

        Ok(())
    }

    // ── Notifications / Activity Feed ─────────────────────────────────

    pub async fn add_notification(&self, notif: &Notification) -> Result<(), DbError> {
        sqlx::query(
            "INSERT INTO notifications (id, user_id, kind, notif_type, title, subtitle, content, related_id, created_at, read_at, dismissed_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        )
        .bind(&notif.id)
        .bind(&notif.user_id)
        .bind(&notif.kind)
        .bind(&notif.notif_type)
        .bind(&notif.title)
        .bind(&notif.subtitle)
        .bind(&notif.content)
        .bind(&notif.related_id)
        .bind(notif.created_at)
        .bind(notif.read_at)
        .bind(notif.dismissed_at)
        .execute(&self.pool)
        .await
        .map(|_| ())
        .map_err(|e| e.into())
    }

    pub async fn get_recent_notifications(
        &self,
        user_id: &str,
        limit: i64,
        include_dismissed: bool,
    ) -> Result<Vec<Notification>, DbError> {
        let base = if include_dismissed {
            "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?"
        } else {
            "SELECT * FROM notifications WHERE user_id = ? AND dismissed_at IS NULL ORDER BY created_at DESC LIMIT ?"
        };

        sqlx::query_as::<_, Notification>(base)
            .bind(user_id)
            .bind(limit)
            .fetch_all(&self.pool)
            .await
            .map_err(|e| e.into())
    }

    pub async fn mark_notification_read(&self, id: &str, read_at: i64) -> Result<(), DbError> {
        sqlx::query("UPDATE notifications SET read_at = ? WHERE id = ?")
            .bind(read_at)
            .bind(id)
            .execute(&self.pool)
            .await
            .map(|_| ())
            .map_err(|e| e.into())
    }

    pub async fn dismiss_notification(&self, id: &str, dismissed_at: i64) -> Result<(), DbError> {
        sqlx::query("UPDATE notifications SET dismissed_at = ? WHERE id = ?")
            .bind(dismissed_at)
            .bind(id)
            .execute(&self.pool)
            .await
            .map(|_| ())
            .map_err(|e| e.into())
    }

    pub async fn clear_notifications(&self, user_id: &str) -> Result<(), DbError> {
        sqlx::query("DELETE FROM notifications WHERE user_id = ?")
            .bind(user_id)
            .execute(&self.pool)
            .await
            .map(|_| ())
            .map_err(|e| e.into())
    }

    /// Export user data as JSON
    pub async fn export_user_data(&self, user_id: &str) -> Result<serde_json::Value, DbError> {
        let user = self.get_user(user_id).await?;
        let settings = self.get_app_settings(user_id).await?;
        let adhkar = self.get_adhkar_progress(user_id).await?;
        let quran = self.get_quran_progress(user_id).await?;
        let recordings = self.get_voice_recordings(user_id).await?;

        Ok(serde_json::json!({
            "user": user,
            "settings": settings,
            "adhkar_progress": adhkar,
            "quran_progress": quran,
            "voice_recordings": recordings
        }))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_database_init() {
        let db = Database::new(":memory:").await.unwrap();
        db.init().await.unwrap();

        // If we reach here, schema initialized successfully
        assert!(true);
    }

    #[tokio::test]
    async fn test_user_operations() {
        let db = Database::new(":memory:").await.unwrap();
        db.init().await.unwrap();

        let user = User {
            id: "test-user".to_string(),
            name: "Test User".to_string(),
            language: "en".to_string(),
            created_at: Database::now(),
            updated_at: Database::now(),
        };

        let saved = db.upsert_user(&user).await.unwrap();
        assert_eq!(saved.id, user.id);
        assert_eq!(saved.name, user.name);

        let retrieved = db.get_user("test-user").await.unwrap();
        assert!(retrieved.is_some());
        assert_eq!(retrieved.unwrap().name, user.name);
    }
}
