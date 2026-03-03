/// SQLite Database Schema
///
/// Defines all tables for local Dhikrtop database storage.
/// Data is stored locally on the user's machine (no cloud).

pub const SCHEMA_SQL: &str = r#"
-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    language TEXT DEFAULT 'en',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

-- Adhkar progress tracking
CREATE TABLE IF NOT EXISTS adhkar_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    adhkar_id TEXT NOT NULL,
    display_count INTEGER DEFAULT 0,
    last_displayed INTEGER,
    user_rating TEXT,  -- 'liked' | 'disliked' | 'neutral'
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, adhkar_id)
);

-- Daily adhkar progress (per calendar day)
-- Enables calendar navigation and ensures counts persist per-day.
CREATE TABLE IF NOT EXISTS adhkar_daily_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    day_key TEXT NOT NULL,        -- YYYY-MM-DD in user's local timezone
    adhkar_id TEXT NOT NULL,
    count INTEGER DEFAULT 0,
    target_count INTEGER DEFAULT 0,
    completed_at INTEGER,
    last_tapped_at INTEGER,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, day_key, adhkar_id)
);

-- Application settings per user
CREATE TABLE IF NOT EXISTS app_settings (
    user_id TEXT PRIMARY KEY,
    reminder_interval INTEGER DEFAULT 60,  -- minutes
    enable_notifications BOOLEAN DEFAULT 1,
    enable_sound BOOLEAN DEFAULT 1,
    quiet_hours_start TEXT,  -- HH:MM
    quiet_hours_end TEXT,    -- HH:MM
    language TEXT DEFAULT 'en',
    theme TEXT DEFAULT 'dark',
    latitude REAL,
    longitude REAL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Quran reading progress
CREATE TABLE IF NOT EXISTS quran_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    surah_number INTEGER NOT NULL,
    verse_number INTEGER NOT NULL,
    last_read INTEGER,
    read_count INTEGER DEFAULT 0,
    bookmarked BOOLEAN DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, surah_number, verse_number)
);

-- Voice recordings for Quran practice
CREATE TABLE IF NOT EXISTS voice_recordings (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    surah_number INTEGER NOT NULL,
    verse_number INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    duration REAL,
    confidence_score REAL,
    transcription TEXT,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Notifications / Activity feed
-- Stores both reminder notifications and activity events locally.
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    kind TEXT NOT NULL,          -- 'reminder' | 'activity'
    notif_type TEXT NOT NULL,    -- 'success' | 'info' | 'warning' | 'error'
    title TEXT NOT NULL,
    subtitle TEXT,
    content TEXT,
    related_id TEXT,             -- adhkar_id or other reference
    created_at INTEGER NOT NULL,
    read_at INTEGER,
    dismissed_at INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_adhkar_progress_user_id ON adhkar_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_adhkar_progress_adhkar_id ON adhkar_progress(adhkar_id);
CREATE INDEX IF NOT EXISTS idx_adhkar_progress_last_displayed ON adhkar_progress(last_displayed);
CREATE INDEX IF NOT EXISTS idx_adhkar_daily_user_day ON adhkar_daily_progress(user_id, day_key);
CREATE INDEX IF NOT EXISTS idx_adhkar_daily_adhkar_id ON adhkar_daily_progress(adhkar_id);
CREATE INDEX IF NOT EXISTS idx_quran_progress_user_id ON quran_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_quran_progress_surah ON quran_progress(surah_number);
CREATE INDEX IF NOT EXISTS idx_voice_recordings_user_id ON voice_recordings(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_recordings_surah_verse ON voice_recordings(surah_number, verse_number);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON notifications(read_at);
"#;
