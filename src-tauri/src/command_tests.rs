/// Integration Tests for Tauri Commands
///
/// Tests all database commands through the Tauri command layer
/// Run with: cargo test --lib commands

#[cfg(test)]
mod command_tests {
    use crate::db::Database;
    use std::time::{SystemTime, UNIX_EPOCH};

    fn get_now() -> i64 {
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs() as i64
    }

    #[tokio::test]
    async fn test_database_initialization() {
        let db = Database::new(":memory:").await;
        assert!(db.is_ok(), "Database creation should succeed");

        let db = db.unwrap();
        let result = db.init().await;
        assert!(result.is_ok(), "Database initialization should succeed");
    }

    #[tokio::test]
    async fn test_new_default_path() {
        // Test that new_default creates appropriate path
        let result = Database::new_default().await;
        // Should work even if directory doesn't exist
        assert!(result.is_ok(), "new_default should create database");
    }

    #[tokio::test]
    async fn test_complete_user_workflow() {
        let db = Database::new(":memory:").await.unwrap();
        db.init().await.unwrap();

        // Create user
        let user = crate::db::User {
            id: "test-user-123".to_string(),
            name: "Test User".to_string(),
            language: "en".to_string(),
            created_at: get_now(),
            updated_at: get_now(),
        };

        let saved = db.upsert_user(&user).await.unwrap();
        assert_eq!(saved.id, "test-user-123");
        assert_eq!(saved.name, "Test User");

        // Retrieve user
        let retrieved = db.get_user("test-user-123").await.unwrap();
        assert!(retrieved.is_some());
        assert_eq!(retrieved.unwrap().name, "Test User");

        // Update user
        let updated_user = crate::db::User {
            id: "test-user-123".to_string(),
            name: "Updated Name".to_string(),
            language: "ar".to_string(),
            created_at: get_now(),
            updated_at: get_now(),
        };

        let saved = db.upsert_user(&updated_user).await.unwrap();
        assert_eq!(saved.name, "Updated Name");
    }

    #[tokio::test]
    async fn test_adhkar_progress_workflow() {
        let db = Database::new(":memory:").await.unwrap();
        db.init().await.unwrap();

        // Save multiple adhkar progress entries
        for i in 1..=5 {
            let progress = crate::db::AdhkarProgress {
                id: 0,
                user_id: "user-123".to_string(),
                adhkar_id: format!("adhkar-{}", i),
                display_count: i as i32,
                last_displayed: Some(get_now()),
                user_rating: if i % 2 == 0 {
                    Some("liked".to_string())
                } else {
                    None
                },
                created_at: get_now(),
                updated_at: get_now(),
            };

            let result = db.save_adhkar_progress(&progress).await;
            assert!(result.is_ok());
        }

        // Retrieve all progress
        let all_progress = db.get_adhkar_progress("user-123").await.unwrap();
        assert_eq!(all_progress.len(), 5);

        // Verify ratings
        let liked_count = all_progress
            .iter()
            .filter(|p| p.user_rating.is_some())
            .count();
        assert_eq!(liked_count, 2);
    }

    #[tokio::test]
    async fn test_app_settings_persistence() {
        let db = Database::new(":memory:").await.unwrap();
        db.init().await.unwrap();

        let settings = crate::db::AppSettings {
            user_id: "user-456".to_string(),
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

        // Save settings
        let saved = db.save_app_settings(&settings).await.unwrap();
        assert_eq!(saved.reminder_interval, 30);
        assert_eq!(saved.language, "ar");

        // Retrieve settings
        let retrieved = db.get_app_settings("user-456").await.unwrap();
        assert!(retrieved.is_some());
        let retrieved = retrieved.unwrap();
        assert_eq!(retrieved.theme, "dark");
        assert_eq!(retrieved.latitude, Some(24.7136));

        // Update settings
        let updated = crate::db::AppSettings {
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

        let saved = db.save_app_settings(&updated).await.unwrap();
        assert_eq!(saved.reminder_interval, 60);
        assert_eq!(saved.theme, "light");
    }

    #[tokio::test]
    async fn test_quran_progress_tracking() {
        let db = Database::new(":memory:").await.unwrap();
        db.init().await.unwrap();

        // Read multiple verses from Surah Al-Fatiha
        for verse in 1..=7 {
            let progress = crate::db::QuranProgress {
                id: 0,
                user_id: "user-123".to_string(),
                surah_number: 1,
                verse_number: verse,
                last_read: Some(get_now()),
                read_count: 1,
                bookmarked: verse == 3 || verse == 5, // Bookmark verses 3 and 5
                created_at: get_now(),
                updated_at: get_now(),
            };

            db.save_quran_progress(&progress).await.unwrap();
        }

        // Get all progress
        let all_progress = db.get_quran_progress("user-123").await.unwrap();
        assert_eq!(all_progress.len(), 7);

        // Get surah-specific progress
        let surah_progress = db.get_surah_progress("user-123", 1).await.unwrap();
        assert_eq!(surah_progress.len(), 7);

        // Verify bookmarks
        let bookmarks: Vec<_> = surah_progress.iter().filter(|p| p.bookmarked).collect();
        assert_eq!(bookmarks.len(), 2);
    }

    #[tokio::test]
    async fn test_voice_recording_management() {
        let db = Database::new(":memory:").await.unwrap();
        db.init().await.unwrap();

        // Save multiple recordings for different verses
        let mut recording_ids: Vec<String> = Vec::new();
        for i in 1..=3 {
            let rec = crate::db::VoiceRecording {
                id: format!("rec-{}", i),
                user_id: "user-123".to_string(),
                surah_number: 1,
                verse_number: i,
                file_path: format!("/recordings/surah1_verse{}.wav", i),
                duration: Some(5.0 + i as f64),
                confidence_score: Some(0.85 + (i as f64 * 0.05)),
                transcription: Some(format!("Transcription {}", i)),
                created_at: get_now(),
            };
            db.save_voice_recording(&rec).await.unwrap();
            recording_ids.push(format!("rec-{}", i));
        }

        // Get all recordings
        let all_recordings = db.get_voice_recordings("user-123").await.unwrap();
        assert_eq!(all_recordings.len(), 3);

        // Get verse-specific recordings
        let verse_1_recordings = db.get_verse_recordings("user-123", 1, 1).await.unwrap();
        assert_eq!(verse_1_recordings.len(), 1);
        assert_eq!(
            verse_1_recordings[0].file_path,
            "/recordings/surah1_verse1.wav"
        );

        // Delete one recording
        db.delete_voice_recording(&recording_ids[0]).await.unwrap();

        // Verify deletion
        let remaining = db.get_voice_recordings("user-123").await.unwrap();
        assert_eq!(remaining.len(), 2);
    }

    #[tokio::test]
    async fn test_data_export_and_reset() {
        let db = Database::new(":memory:").await.unwrap();
        db.init().await.unwrap();

        let user_id = "export-test-user";

        // Create user
        let user = crate::db::User {
            id: user_id.to_string(),
            name: "Export Test".to_string(),
            language: "en".to_string(),
            created_at: get_now(),
            updated_at: get_now(),
        };
        db.upsert_user(&user).await.unwrap();

        // Add some data
        let progress = crate::db::AdhkarProgress {
            id: 0,
            user_id: user_id.to_string(),
            adhkar_id: "test-adhkar".to_string(),
            display_count: 5,
            last_displayed: Some(get_now()),
            user_rating: Some("liked".to_string()),
            created_at: get_now(),
            updated_at: get_now(),
        };
        db.save_adhkar_progress(&progress).await.unwrap();

        // Export data
        let exported = db.export_user_data(user_id).await.unwrap();
        assert!(exported["user"].is_object());
        assert!(exported["adhkar_progress"].is_array());

        // Reset user data
        db.reset_user_data(user_id).await.unwrap();

        // Verify data is cleared
        let adhkar_after_reset = db.get_adhkar_progress(user_id).await.unwrap();
        assert_eq!(adhkar_after_reset.len(), 0);
    }

    #[tokio::test]
    async fn test_notifications_crud() {
        let db = Database::new(":memory:").await.unwrap();
        db.init().await.unwrap();

        let now = get_now();
        let n = crate::db::Notification {
            id: "n1".to_string(),
            user_id: "user-n".to_string(),
            kind: "reminder".to_string(),
            notif_type: "info".to_string(),
            title: "Test".to_string(),
            subtitle: Some("Hello".to_string()),
            content: Some("Body".to_string()),
            related_id: Some("m1".to_string()),
            created_at: now,
            read_at: None,
            dismissed_at: None,
        };

        db.add_notification(&n).await.unwrap();

        let recent = db
            .get_recent_notifications("user-n", 10, false)
            .await
            .unwrap();
        assert_eq!(recent.len(), 1);
        assert_eq!(recent[0].id, "n1");

        db.mark_notification_read("n1", now + 1).await.unwrap();
        let recent = db
            .get_recent_notifications("user-n", 10, false)
            .await
            .unwrap();
        assert!(recent[0].read_at.is_some());

        db.dismiss_notification("n1", now + 2).await.unwrap();
        let recent = db
            .get_recent_notifications("user-n", 10, false)
            .await
            .unwrap();
        assert_eq!(recent.len(), 0); // dismissed filtered out

        // include dismissed
        let recent = db
            .get_recent_notifications("user-n", 10, true)
            .await
            .unwrap();
        assert_eq!(recent.len(), 1);

        db.clear_notifications("user-n").await.unwrap();
        let recent = db
            .get_recent_notifications("user-n", 10, true)
            .await
            .unwrap();
        assert_eq!(recent.len(), 0);
    }

    #[tokio::test]
    async fn test_daily_adhkar_calendar_progress_and_reset() {
        let db = Database::new(":memory:").await.unwrap();
        db.init().await.unwrap();

        let user_id = "user-cal";
        let day1 = "2026-03-01";
        let day2 = "2026-03-02";

        // Increment day1 twice
        let r1 = db
            .increment_daily_adhkar(user_id, day1, "m1", 3, 1)
            .await
            .unwrap();
        assert_eq!(r1.count, 1);
        let r2 = db
            .increment_daily_adhkar(user_id, day1, "m1", 3, 1)
            .await
            .unwrap();
        assert_eq!(r2.count, 2);

        // Increment a different day should not affect day1
        let r3 = db
            .increment_daily_adhkar(user_id, day2, "m1", 3, 1)
            .await
            .unwrap();
        assert_eq!(r3.count, 1);

        let day1_rows = db.get_daily_adhkar_progress(user_id, day1).await.unwrap();
        assert_eq!(day1_rows.len(), 1);
        assert_eq!(day1_rows[0].count, 2);

        // Reset day1 count to 0
        let r0 = db
            .set_daily_adhkar_count(user_id, day1, "m1", 3, 0)
            .await
            .unwrap();
        assert_eq!(r0.count, 0);
    }

    #[tokio::test]
    async fn test_concurrent_operations() {
        let db = Database::new(":memory:").await.unwrap();
        db.init().await.unwrap();

        let db_clone1 = db.clone();
        let db_clone2 = db.clone();
        let db_clone3 = db.clone();

        // Concurrent user saves
        let handle1 = tokio::spawn(async move {
            for i in 0..10 {
                let user = crate::db::User {
                    id: format!("user-{}", i),
                    name: format!("User {}", i),
                    language: "en".to_string(),
                    created_at: get_now(),
                    updated_at: get_now(),
                };
                db_clone1.upsert_user(&user).await.unwrap();
            }
        });

        let handle2 = tokio::spawn(async move {
            for i in 10..20 {
                let user = crate::db::User {
                    id: format!("user-{}", i),
                    name: format!("User {}", i),
                    language: "ar".to_string(),
                    created_at: get_now(),
                    updated_at: get_now(),
                };
                db_clone2.upsert_user(&user).await.unwrap();
            }
        });

        let handle3 = tokio::spawn(async move {
            for i in 20..30 {
                let user = crate::db::User {
                    id: format!("user-{}", i),
                    name: format!("User {}", i),
                    language: "en".to_string(),
                    created_at: get_now(),
                    updated_at: get_now(),
                };
                db_clone3.upsert_user(&user).await.unwrap();
            }
        });

        handle1.await.unwrap();
        handle2.await.unwrap();
        handle3.await.unwrap();

        // All users should be saved
        for i in 0..30 {
            let user = db.get_user(&format!("user-{}", i)).await.unwrap();
            assert!(user.is_some());
        }
    }

    #[tokio::test]
    async fn test_concurrent_default_db_init_is_send_safe() {
        // This test exists specifically to ensure we do not hold a MutexGuard
        // across .await in the command-layer DB initializer.
        //
        // We can't easily invoke actual tauri commands here without a runtime,
        // but we can stress the underlying Database::new_default + init by doing
        // concurrent initializations.

        let handles: Vec<_> = (0..10)
            .map(|_| {
                tokio::spawn(async {
                    let db = Database::new_default().await.unwrap();
                    db.init().await.unwrap();
                })
            })
            .collect();

        for h in handles {
            h.await.unwrap();
        }
    }

    #[tokio::test]
    async fn test_edge_cases() {
        let db = Database::new(":memory:").await.unwrap();
        db.init().await.unwrap();

        // Test with empty strings
        let user = crate::db::User {
            id: "".to_string(),
            name: "".to_string(),
            language: "".to_string(),
            created_at: get_now(),
            updated_at: get_now(),
        };
        let result = db.upsert_user(&user).await;
        assert!(result.is_ok());

        // Test with very long strings
        let long_string = "a".repeat(1000);
        let user = crate::db::User {
            id: "long-test".to_string(),
            name: long_string.clone(),
            language: "en".to_string(),
            created_at: get_now(),
            updated_at: get_now(),
        };
        let result = db.upsert_user(&user).await;
        assert!(result.is_ok());

        // Test with special characters
        let user = crate::db::User {
            id: "special-test".to_string(),
            name: "Test 你好 مرحبا 🎉".to_string(),
            language: "multi".to_string(),
            created_at: get_now(),
            updated_at: get_now(),
        };
        let result = db.upsert_user(&user).await;
        assert!(result.is_ok());

        // Verify retrieval
        let retrieved = db.get_user("special-test").await.unwrap();
        assert!(retrieved.is_some());
        assert_eq!(retrieved.unwrap().name, "Test 你好 مرحبا 🎉");
    }

    #[tokio::test]
    async fn test_large_dataset_performance() {
        let db = Database::new(":memory:").await.unwrap();
        db.init().await.unwrap();

        // Insert 100 adhkar progress entries
        let start = std::time::Instant::now();
        for i in 0..100 {
            let progress = crate::db::AdhkarProgress {
                id: 0,
                user_id: "perf-test".to_string(),
                adhkar_id: format!("adhkar-{}", i),
                display_count: i % 10,
                last_displayed: Some(get_now()),
                user_rating: if i % 3 == 0 {
                    Some("liked".to_string())
                } else {
                    None
                },
                created_at: get_now(),
                updated_at: get_now(),
            };
            db.save_adhkar_progress(&progress).await.unwrap();
        }
        let duration = start.elapsed();

        // Should complete in reasonable time (< 1 second)
        assert!(
            duration.as_secs() < 1,
            "100 inserts took too long: {:?}",
            duration
        );

        // Retrieve all
        let start = std::time::Instant::now();
        let all = db.get_adhkar_progress("perf-test").await.unwrap();
        let duration = start.elapsed();

        assert_eq!(all.len(), 100);
        assert!(
            duration.as_millis() < 100,
            "Retrieval took too long: {:?}",
            duration
        );
    }
}
