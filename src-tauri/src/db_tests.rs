/// Database Module Tests
///
/// Comprehensive test suite for SQLite database operations
/// Run with: cargo test --lib db
///
/// Coverage:
/// - Schema initialization
/// - User CRUD operations
/// - Adhkar progress tracking
/// - Settings persistence
/// - Quran progress tracking
/// - Voice recording management
/// - Error handling
/// - Concurrent operations

#[cfg(test)]
mod tests {
    use super::super::*;
    use std::time::{SystemTime, UNIX_EPOCH};

    // ── Helper Functions ────────────────────────────────────────────────

    async fn init_test_db() -> Database {
        let db = Database::new(":memory:")
            .await
            .expect("Failed to create in-memory database");
        db.init().await.expect("Failed to initialize schema");
        db
    }

    fn get_now() -> i64 {
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs() as i64
    }

    // ── Schema Tests ────────────────────────────────────────────────────

    #[tokio::test]
    async fn test_schema_initialization() {
        let db = Database::new(":memory:")
            .await
            .expect("Failed to create database");

        // Should initialize without errors
        let result = db.init().await;
        assert!(result.is_ok(), "Schema initialization failed");
    }

    #[tokio::test]
    async fn test_schema_creates_all_tables() {
        let db = init_test_db().await;

        // Verify tables exist by inserting test data
        let user = User {
            id: "test-user".to_string(),
            name: "Test User".to_string(),
            language: "en".to_string(),
            created_at: get_now(),
            updated_at: get_now(),
        };

        let result = db.upsert_user(&user).await;
        assert!(
            result.is_ok(),
            "Failed to insert user (table may not exist)"
        );
    }

    // ── User CRUD Tests ────────────────────────────────────────────────

    #[tokio::test]
    async fn test_user_create_and_retrieve() {
        let db = init_test_db().await;

        let user = User {
            id: "user-123".to_string(),
            name: "Ahmed Ali".to_string(),
            language: "en".to_string(),
            created_at: get_now(),
            updated_at: get_now(),
        };

        // Create user
        let saved = db.upsert_user(&user).await.expect("Failed to save user");
        assert_eq!(saved.id, "user-123");
        assert_eq!(saved.name, "Ahmed Ali");

        // Retrieve user
        let retrieved = db
            .get_user("user-123")
            .await
            .expect("Failed to get user")
            .expect("User not found");

        assert_eq!(retrieved.id, user.id);
        assert_eq!(retrieved.name, user.name);
    }

    #[tokio::test]
    async fn test_user_not_found() {
        let db = init_test_db().await;

        let result = db
            .get_user("nonexistent-user")
            .await
            .expect("Database error");

        assert!(result.is_none(), "User should not exist");
    }

    #[tokio::test]
    async fn test_user_update() {
        let db = init_test_db().await;

        let user1 = User {
            id: "user-456".to_string(),
            name: "Original Name".to_string(),
            language: "ar".to_string(),
            created_at: get_now(),
            updated_at: get_now(),
        };

        db.upsert_user(&user1).await.expect("Failed to create user");

        // Update user
        let user2 = User {
            id: "user-456".to_string(),
            name: "Updated Name".to_string(),
            language: "en".to_string(),
            created_at: get_now(),
            updated_at: get_now(),
        };

        let updated = db.upsert_user(&user2).await.expect("Failed to update user");
        assert_eq!(updated.name, "Updated Name");
        assert_eq!(updated.language, "en");
    }

    // ── Adhkar Progress Tests ────────────────────────────────────────────

    #[tokio::test]
    async fn test_save_adhkar_progress() {
        let db = init_test_db().await;

        let progress = AdhkarProgress {
            id: 0,
            user_id: "user-123".to_string(),
            adhkar_id: "adhkar-1".to_string(),
            display_count: 1,
            last_displayed: Some(get_now()),
            user_rating: Some("liked".to_string()),
            created_at: get_now(),
            updated_at: get_now(),
        };

        let saved = db
            .save_adhkar_progress(&progress)
            .await
            .expect("Failed to save adhkar progress");

        assert_eq!(saved.adhkar_id, "adhkar-1");
        assert_eq!(saved.user_rating, Some("liked".to_string()));
    }

    #[tokio::test]
    async fn test_get_adhkar_progress() {
        let db = init_test_db().await;

        let progress1 = AdhkarProgress {
            id: 0,
            user_id: "user-123".to_string(),
            adhkar_id: "adhkar-1".to_string(),
            display_count: 1,
            last_displayed: Some(get_now()),
            user_rating: None,
            created_at: get_now(),
            updated_at: get_now(),
        };

        let progress2 = AdhkarProgress {
            id: 0,
            user_id: "user-123".to_string(),
            adhkar_id: "adhkar-2".to_string(),
            display_count: 2,
            last_displayed: Some(get_now()),
            user_rating: Some("disliked".to_string()),
            created_at: get_now(),
            updated_at: get_now(),
        };

        db.save_adhkar_progress(&progress1).await.unwrap();
        db.save_adhkar_progress(&progress2).await.unwrap();

        let all_progress = db
            .get_adhkar_progress("user-123")
            .await
            .expect("Failed to get adhkar progress");

        assert_eq!(all_progress.len(), 2);
        assert!(all_progress.iter().any(|p| p.adhkar_id == "adhkar-1"));
        assert!(all_progress.iter().any(|p| p.adhkar_id == "adhkar-2"));
    }

    #[tokio::test]
    async fn test_adhkar_progress_unique_constraint() {
        let db = init_test_db().await;

        let progress1 = AdhkarProgress {
            id: 0,
            user_id: "user-123".to_string(),
            adhkar_id: "adhkar-1".to_string(),
            display_count: 1,
            last_displayed: Some(get_now()),
            user_rating: Some("liked".to_string()),
            created_at: get_now(),
            updated_at: get_now(),
        };

        db.save_adhkar_progress(&progress1).await.unwrap();

        // Update same adhkar
        let progress2 = AdhkarProgress {
            id: 0,
            user_id: "user-123".to_string(),
            adhkar_id: "adhkar-1".to_string(),
            display_count: 2,
            last_displayed: Some(get_now()),
            user_rating: Some("disliked".to_string()),
            created_at: get_now(),
            updated_at: get_now(),
        };

        let result = db.save_adhkar_progress(&progress2).await;
        assert!(result.is_ok(), "Should handle duplicate with upsert");

        let retrieved = db
            .get_adhkar("user-123", "adhkar-1")
            .await
            .unwrap()
            .unwrap();
        assert_eq!(retrieved.user_rating, Some("disliked".to_string()));
    }

    // ── App Settings Tests ────────────────────────────────────────────

    #[tokio::test]
    async fn test_save_app_settings() {
        let db = init_test_db().await;

        let settings = AppSettings {
            user_id: "user-123".to_string(),
            reminder_interval: 30,
            enable_notifications: true,
            enable_sound: false,
            quiet_hours_start: Some("22:00".to_string()),
            quiet_hours_end: Some("06:00".to_string()),
            language: "ar".to_string(),
            theme: "dark".to_string(),
            latitude: Some(24.7136),
            longitude: Some(46.6753),
            updated_at: get_now(),
        };

        let saved = db
            .save_app_settings(&settings)
            .await
            .expect("Failed to save settings");

        assert_eq!(saved.user_id, "user-123");
        assert_eq!(saved.reminder_interval, 30);
        assert_eq!(saved.language, "ar");
        assert_eq!(saved.latitude, Some(24.7136));
    }

    #[tokio::test]
    async fn test_get_app_settings() {
        let db = init_test_db().await;

        let settings = AppSettings {
            user_id: "user-456".to_string(),
            reminder_interval: 60,
            enable_notifications: false,
            enable_sound: true,
            quiet_hours_start: None,
            quiet_hours_end: None,
            language: "en".to_string(),
            theme: "light".to_string(),
            latitude: None,
            longitude: None,
            updated_at: get_now(),
        };

        db.save_app_settings(&settings).await.unwrap();

        let retrieved = db
            .get_app_settings("user-456")
            .await
            .unwrap()
            .expect("Settings not found");

        assert_eq!(retrieved.user_id, "user-456");
        assert_eq!(retrieved.reminder_interval, 60);
        assert_eq!(retrieved.enable_sound, true);
    }

    // ── Quran Progress Tests ────────────────────────────────────────────

    #[tokio::test]
    async fn test_save_quran_progress() {
        let db = init_test_db().await;

        let progress = QuranProgress {
            id: 0,
            user_id: "user-123".to_string(),
            surah_number: 1,
            verse_number: 5,
            last_read: Some(get_now()),
            read_count: 1,
            bookmarked: false,
            created_at: get_now(),
            updated_at: get_now(),
        };

        let saved = db
            .save_quran_progress(&progress)
            .await
            .expect("Failed to save quran progress");

        assert_eq!(saved.surah_number, 1);
        assert_eq!(saved.verse_number, 5);
    }

    #[tokio::test]
    async fn test_get_surah_progress() {
        let db = init_test_db().await;

        for verse in 1..=7 {
            let progress = QuranProgress {
                id: 0,
                user_id: "user-123".to_string(),
                surah_number: 1,
                verse_number: verse,
                last_read: Some(get_now()),
                read_count: 1,
                bookmarked: verse % 2 == 0,
                created_at: get_now(),
                updated_at: get_now(),
            };
            db.save_quran_progress(&progress).await.unwrap();
        }

        let surah_progress = db
            .get_surah_progress("user-123", 1)
            .await
            .expect("Failed to get surah progress");

        assert_eq!(surah_progress.len(), 7);
        assert!(surah_progress.iter().any(|p| p.bookmarked));
    }

    // ── Voice Recording Tests ────────────────────────────────────────────

    #[tokio::test]
    async fn test_save_voice_recording() {
        let db = init_test_db().await;

        let recording = VoiceRecording {
            id: "rec-123".to_string(),
            user_id: "user-123".to_string(),
            surah_number: 1,
            verse_number: 1,
            file_path: "/path/to/audio.wav".to_string(),
            duration: Some(10.5),
            confidence_score: Some(0.92),
            transcription: Some("الحمد لله".to_string()),
            created_at: get_now(),
        };

        let saved = db
            .save_voice_recording(&recording)
            .await
            .expect("Failed to save voice recording");

        assert_eq!(saved.id, "rec-123");
        assert_eq!(saved.confidence_score, Some(0.92));
    }

    #[tokio::test]
    async fn test_get_voice_recordings() {
        let db = init_test_db().await;

        let rec1 = VoiceRecording {
            id: "rec-1".to_string(),
            user_id: "user-123".to_string(),
            surah_number: 1,
            verse_number: 1,
            file_path: "/audio1.wav".to_string(),
            duration: Some(5.0),
            confidence_score: Some(0.9),
            transcription: None,
            created_at: get_now(),
        };

        let rec2 = VoiceRecording {
            id: "rec-2".to_string(),
            user_id: "user-123".to_string(),
            surah_number: 1,
            verse_number: 2,
            file_path: "/audio2.wav".to_string(),
            duration: Some(6.0),
            confidence_score: Some(0.85),
            transcription: None,
            created_at: get_now(),
        };

        db.save_voice_recording(&rec1).await.unwrap();
        db.save_voice_recording(&rec2).await.unwrap();

        let recordings = db
            .get_voice_recordings("user-123")
            .await
            .expect("Failed to get recordings");

        assert_eq!(recordings.len(), 2);
    }

    #[tokio::test]
    async fn test_get_verse_recordings() {
        let db = init_test_db().await;

        let rec1 = VoiceRecording {
            id: "rec-1".to_string(),
            user_id: "user-123".to_string(),
            surah_number: 1,
            verse_number: 5,
            file_path: "/audio1.wav".to_string(),
            duration: Some(5.0),
            confidence_score: None,
            transcription: None,
            created_at: get_now(),
        };

        let rec2 = VoiceRecording {
            id: "rec-2".to_string(),
            user_id: "user-123".to_string(),
            surah_number: 1,
            verse_number: 5,
            file_path: "/audio2.wav".to_string(),
            duration: Some(6.0),
            confidence_score: None,
            transcription: None,
            created_at: get_now(),
        };

        db.save_voice_recording(&rec1).await.unwrap();
        db.save_voice_recording(&rec2).await.unwrap();

        let verse_recordings = db
            .get_verse_recordings("user-123", 1, 5)
            .await
            .expect("Failed to get verse recordings");

        assert_eq!(verse_recordings.len(), 2);
    }

    #[tokio::test]
    async fn test_delete_voice_recording() {
        let db = init_test_db().await;

        let recording = VoiceRecording {
            id: "rec-123".to_string(),
            user_id: "user-123".to_string(),
            surah_number: 1,
            verse_number: 1,
            file_path: "/audio.wav".to_string(),
            duration: Some(5.0),
            confidence_score: None,
            transcription: None,
            created_at: get_now(),
        };

        db.save_voice_recording(&recording).await.unwrap();

        let before = db.get_voice_recordings("user-123").await.unwrap();
        assert_eq!(before.len(), 1);

        db.delete_voice_recording("rec-123").await.unwrap();

        let after = db.get_voice_recordings("user-123").await.unwrap();
        assert_eq!(after.len(), 0);
    }

    // ── Utility Tests ────────────────────────────────────────────────────

    #[tokio::test]
    async fn test_export_user_data() {
        let db = init_test_db().await;

        let user = User {
            id: "user-123".to_string(),
            name: "Test User".to_string(),
            language: "en".to_string(),
            created_at: get_now(),
            updated_at: get_now(),
        };

        db.upsert_user(&user).await.unwrap();

        let export = db
            .export_user_data("user-123")
            .await
            .expect("Failed to export user data");

        assert!(export["user"].is_object());
        assert!(export["settings"].is_null() || export["settings"].is_object());
        assert!(export["adhkar_progress"].is_array());
    }

    #[tokio::test]
    async fn test_reset_user_data() {
        let db = init_test_db().await;

        // Add test data
        let progress = AdhkarProgress {
            id: 0,
            user_id: "user-123".to_string(),
            adhkar_id: "adhkar-1".to_string(),
            display_count: 1,
            last_displayed: None,
            user_rating: None,
            created_at: get_now(),
            updated_at: get_now(),
        };

        db.save_adhkar_progress(&progress).await.unwrap();

        let before = db.get_adhkar_progress("user-123").await.unwrap();
        assert_eq!(before.len(), 1);

        db.reset_user_data("user-123").await.unwrap();

        let after = db.get_adhkar_progress("user-123").await.unwrap();
        assert_eq!(after.len(), 0);
    }

    // ── Concurrent Operations Tests ────────────────────────────────────

    #[tokio::test]
    async fn test_concurrent_user_saves() {
        let db = std::sync::Arc::new(init_test_db().await);

        let mut handles = vec![];

        for i in 0..10 {
            let db_clone = db.clone();
            let handle = tokio::spawn(async move {
                let user = User {
                    id: format!("user-{}", i),
                    name: format!("User {}", i),
                    language: "en".to_string(),
                    created_at: get_now(),
                    updated_at: get_now(),
                };
                db_clone.upsert_user(&user).await
            });
            handles.push(handle);
        }

        for handle in handles {
            let result = handle.await.expect("Task failed");
            assert!(result.is_ok());
        }
    }
}
