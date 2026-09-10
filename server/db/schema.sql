-- RUMR Production Relational Database Schema (SQLite WAL)
PRAGMA foreign_keys = ON;

-- 1. Users & Accounts
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    handle TEXT UNIQUE NOT NULL,
    chaos_index INTEGER DEFAULT 75,
    is_verified INTEGER DEFAULT 0,
    boost_tier TEXT,
    boost_expires_at TEXT,
    avatar_seed TEXT NOT NULL,
    age INTEGER DEFAULT 25,
    gender TEXT DEFAULT 'Non-binary',
    intent TEXT DEFAULT 'Conversations & Dating',
    city TEXT DEFAULT 'Gurgaon, NCR',
    latitude REAL DEFAULT 28.4595,
    longitude REAL DEFAULT 77.0266,
    geo_broadcasting TEXT DEFAULT 'approximate',
    ghost_mode INTEGER DEFAULT 0,
    global_radius INTEGER DEFAULT 50,
    similarity_mode TEXT DEFAULT 'balanced',
    -- Quarantined Identity Layers (Quarantined behind bilateral consent)
    role TEXT DEFAULT 'Tech & Product Contributor',
    tagline TEXT DEFAULT 'Contrarian thinker • intellectual friction advocate',
    real_name TEXT,
    real_photo TEXT,
    is_guest INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_handle ON users(handle);
CREATE INDEX IF NOT EXISTS idx_users_city ON users(city);

-- 2. Auth OTPs for Passwordless Verification
CREATE TABLE IF NOT EXISTS auth_otps (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    otp_code_hash TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    consumed INTEGER DEFAULT 0,
    attempts INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_auth_otps_email ON auth_otps(email);

-- 3. Topics Taxonomy
CREATE TABLE IF NOT EXISTS topics (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('Tech', 'Workplace', 'Social', 'Spicy', 'Crypto', 'Startups')),
    description TEXT,
    debater_count INTEGER DEFAULT 1,
    heat_score INTEGER DEFAULT 70,
    match_rate INTEGER DEFAULT 85,
    is_hot INTEGER DEFAULT 0,
    creator_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_topics_category ON topics(category);
CREATE INDEX IF NOT EXISTS idx_topics_heat ON topics(heat_score DESC);

-- 4. User Topic Subscriptions (Resonance Portfolio)
CREATE TABLE IF NOT EXISTS user_topics (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic_id TEXT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    created_at TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, topic_id)
);

CREATE INDEX IF NOT EXISTS idx_user_topics_user ON user_topics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_topics_topic ON user_topics(topic_id);

-- 5. User Resonance Tags (Chaos Profile Injected Tags)
CREATE TABLE IF NOT EXISTS user_resonance_tags (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tag TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, tag)
);

CREATE INDEX IF NOT EXISTS idx_resonance_tags_user ON user_resonance_tags(user_id);

-- 6. Rumors / Whispers (Discussions)
CREATE TABLE IF NOT EXISTS rumors (
    id TEXT PRIMARY KEY,
    topic_id TEXT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    author_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    encrypted_content TEXT,
    is_encrypted INTEGER DEFAULT 1,
    match_rate INTEGER DEFAULT 85,
    agrees INTEGER DEFAULT 0,
    debates INTEGER DEFAULT 0,
    tags TEXT, -- JSON array of tags e.g. ["#LEAK", "#CLOUD"]
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_rumors_topic ON rumors(topic_id);

-- 7. Rumor Votes (Agree / Debate Idempotency)
CREATE TABLE IF NOT EXISTS rumor_votes (
    id TEXT PRIMARY KEY,
    rumor_id TEXT NOT NULL REFERENCES rumors(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vote_type TEXT NOT NULL CHECK(vote_type IN ('agree', 'debate')),
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(rumor_id, user_id)
);

-- 8. Swipes & Topic Intent
CREATE TABLE IF NOT EXISTS swipes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    direction TEXT NOT NULL CHECK(direction IN ('like', 'pass')),
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, target_user_id)
);

CREATE INDEX IF NOT EXISTS idx_swipes_target ON swipes(target_user_id, direction);

-- 9. Matches (Mutual Connections)
CREATE TABLE IF NOT EXISTS matches (
    id TEXT PRIMARY KEY,
    user1_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user2_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    primary_topic_id TEXT REFERENCES topics(id) ON DELETE SET NULL,
    compatibility INTEGER DEFAULT 88,
    unmask_stage INTEGER DEFAULT 0 CHECK(unmask_stage BETWEEN 0 AND 3),
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'unmatched', 'blocked')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user1_id, user2_id)
);

CREATE INDEX IF NOT EXISTS idx_matches_user1 ON matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2 ON matches(user2_id);

-- 10. Bilateral Unmasking Consents
CREATE TABLE IF NOT EXISTS unmask_consents (
    id TEXT PRIMARY KEY,
    match_id TEXT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stage INTEGER NOT NULL CHECK(stage IN (1, 2, 3)),
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(match_id, user_id, stage)
);

CREATE INDEX IF NOT EXISTS idx_unmask_consents_match ON unmask_consents(match_id);

-- 11. Ephemeral Topic Tunnel Chat Messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    match_id TEXT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    expires_at TEXT NOT NULL,
    is_warning INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_messages_match_expires ON chat_messages(match_id, expires_at);

-- 12. Live Audio Rooms & Pods
CREATE TABLE IF NOT EXISTS rooms (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    host_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    is_live INTEGER DEFAULT 1,
    is_private INTEGER DEFAULT 0,
    active_speakers INTEGER DEFAULT 1,
    listeners INTEGER DEFAULT 0,
    recent_debate TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS room_participants (
    room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'listener' CHECK(role IN ('host', 'speaker', 'listener')),
    is_muted INTEGER DEFAULT 1,
    is_hand_raised INTEGER DEFAULT 0,
    joined_at TEXT DEFAULT (datetime('now')),
    PRIMARY KEY(room_id, user_id)
);

CREATE TABLE IF NOT EXISTS room_messages (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    stance TEXT CHECK(stance IN ('agree', 'debate', NULL)),
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_room_messages_room ON room_messages(room_id);

-- 13. Transactions & Boost Purchases
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tier_name TEXT NOT NULL,
    amount TEXT NOT NULL,
    status TEXT DEFAULT 'completed',
    created_at TEXT DEFAULT (datetime('now'))
);

-- 14. Safety Incident Reports & Blocked Entities
CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    reporter_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    target_id TEXT NOT NULL,
    reason TEXT NOT NULL,
    details TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'reviewed', 'actioned')),
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS blocked_entities (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blocked_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, blocked_user_id)
);
