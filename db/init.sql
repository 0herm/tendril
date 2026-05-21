-- User table
CREATE TABLE IF NOT EXISTS Users (
    id SERIAL PRIMARY KEY,
    region TEXT NOT NULL DEFAULT 'GB',
    language TEXT NOT NULL DEFAULT 'en-GB',
    original_title BOOLEAN NOT NULL DEFAULT FALSE,
    include_adult BOOLEAN NOT NULL DEFAULT FALSE,
    timezone TEXT NOT NULL DEFAULT 'Europe/London',
    subscription TEXT DEFAULT NULL
);

-- Passkey credentials table
CREATE TABLE IF NOT EXISTS Credentials (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    public_key BYTEA NOT NULL,
    counter BIGINT NOT NULL DEFAULT 0,
    device_type TEXT NOT NULL DEFAULT 'singleDevice',
    backed_up BOOLEAN NOT NULL DEFAULT FALSE,
    transports TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Challenges table (temporary, per-request)
CREATE TABLE IF NOT EXISTS Challenges (
    id SERIAL PRIMARY KEY,
    challenge TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table
CREATE TABLE IF NOT EXISTS Sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Lists table
CREATE TABLE IF NOT EXISTS Lists (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Media table
CREATE TABLE IF NOT EXISTS Media (
    id SERIAL PRIMARY KEY,
    tmdb_id INTEGER NOT NULL,
    type TEXT CHECK (type IN ('movie', 'show')),
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    list_id INTEGER REFERENCES Lists(id) ON DELETE CASCADE
);

-- Watched table
CREATE TABLE IF NOT EXISTS Watched (
    id SERIAL PRIMARY KEY,
    tmdb_id INTEGER NOT NULL,
    type TEXT CHECK (type IN ('movie', 'show')),
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    name TEXT NOT NULL,
    watched_seasons INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    total_seasons INTEGER,
    show_status TEXT
);

-- Default lists
INSERT INTO Lists (name) VALUES ('Want to Watch')
ON CONFLICT DO NOTHING;

-- Notification dedup log
CREATE TABLE IF NOT EXISTS NotificationLog (
    id      SERIAL PRIMARY KEY,
    type    TEXT NOT NULL,
    tmdb_id INTEGER,
    meta    TEXT,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Unique per (type, tmdb_id, meta-or-empty) for item-specific entries only

CREATE UNIQUE INDEX IF NOT EXISTS notificationlog_unique
    ON NotificationLog (type, tmdb_id, COALESCE(meta, ''))
    WHERE tmdb_id IS NOT NULL;
