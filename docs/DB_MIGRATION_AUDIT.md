# RUMR Database Migration Audit (Gate 1)

This audit documents every file and database operation in the repository prior to the production migration to Supabase PostgreSQL.

## 1. Inventory Summary

| File | Module / Route | Database Operations Identified | Target Abstraction |
|---|---|---|---|
| `server/db/database.ts` | Database Initialization | `new Database()`, `db.pragma()`, `db.exec(SCHEMA_SQL)`, `seedDatabase(db)` | `server/db/database.ts` (Factory) |
| `server/db/seed.ts` | Database Seeder | `db.prepare()` (users, topics, user_topics, tags, rumors, rooms, messages) | Isolated `seed-cli.ts` with production guard |
| `server/db/schema-sql.ts` | SQLite Schema DDL | `SCHEMA_SQL` raw DDL string | Retained strictly for local dev SQLite fallback |
| `server/config.ts` | Configuration | `DB_PATH` fallback to `/tmp/rumr.db` | Removed production `/tmp/rumr.db` fallback |
| `server/middleware/auth.ts` | Auth Middleware | `SELECT * FROM users WHERE id = ?` | `db.users.findById(id)` |
| `server/routes/auth.ts` | Authentication Route | 18 SQLite operations (OTPs, user creation, user_topics, topics) | `db.authOtps.*`, `db.users.*`, `db.userTopics.*` |
| `server/routes/users.ts` | Users & Profile Route | 11 SQLite operations (profile, resonance tags, transactions, erasure) | `db.users.*`, `db.userResonanceTags.*`, `db.transactions.*` |
| `server/routes/discovery.ts` | Discovery Feed & Swipes | 8 SQLite operations (feed query, overlaps, swipes, mutual matches) | `db.users.*`, `db.userTopics.*`, `db.swipes.*`, `db.matches.*` |
| `server/routes/matches.ts` | Matches & Unmask Stages | 7 SQLite operations (active matches, unmatch, shared topics) | `db.matches.*`, `db.users.*`, `db.userTopics.*` |
| `server/routes/unmask.ts` | Unmasking Consents | 8 SQLite operations (consents, stage advancement, bilateral count) | `db.unmaskConsents.*`, `db.matches.*`, `db.chatMessages.*` |
| `server/routes/chat.ts` | Ephemeral Chat | 6 SQLite operations (purge expired, fetch messages, insert message) | `db.chatMessages.*`, `db.matches.*` |
| `server/routes/topics.ts` | Topics Taxonomy | 9 SQLite operations (list, search, subscribe, unsubscribe, counts) | `db.topics.*`, `db.userTopics.*` |
| `server/routes/rumors.ts` | Rumors & Whispers | 8 SQLite operations (list, post, vote, decrypt, score updates) | `db.rumors.*`, `db.rumorVotes.*` |
| `server/routes/rooms.ts` | Audio Rooms & Pods | 8 SQLite operations (rooms, participants, mic state, room messages) | `db.rooms.*`, `db.roomParticipants.*`, `db.roomMessages.*` |
| `server/routes/boosts.ts` | Monetization & Boosts | 2 SQLite operations (transactions, user boost updates) | `db.transactions.*`, `db.users.updateBoost()` |
| `server/routes/safety.ts` | Safety & Sentinel | 2 SQLite operations (reports, blocking) | `db.reports.*`, `db.blockedEntities.*` |
| `server/routes/jobs.ts` | Scheduled Jobs / Cron | 2 SQLite operations (message decay purge, inactive participant prune) | `db.chatMessages.purgeExpired()`, `db.roomParticipants.pruneInactive()` |

---

## 2. Detailed Route Operation Inventory

### `server/middleware/auth.ts`
- `db.prepare('SELECT * FROM users WHERE id = ?').get(payload.userId)` (Line 75)
- `db.prepare('SELECT * FROM users WHERE id = ?').get(payload.userId)` (Line 93)

### `server/routes/auth.ts`
- `INSERT INTO auth_otps ...` (Line 33)
- `SELECT * FROM auth_otps WHERE email = ? ...` (Line 64)
- `UPDATE auth_otps SET attempts = attempts + 1 ...` (Line 77)
- `UPDATE auth_otps SET consumed = 1 ...` (Line 84)
- `SELECT * FROM users WHERE email = ?` (Line 88)
- `INSERT INTO users (...) VALUES (...)` (Line 98)
- `SELECT * FROM users WHERE id = ?` (Line 110)
- `SELECT topic_id FROM user_topics WHERE user_id = ?` (Line 120)
- `INSERT INTO users (guest) ...` (Line 143)
- `SELECT * FROM users WHERE id = ?` (Line 155)
- `SELECT topic_id FROM user_topics WHERE user_id = ?` (Line 176)
- `SELECT tag FROM user_resonance_tags WHERE user_id = ?` (Line 180)
- `SELECT id FROM users WHERE handle = ? AND id != ?` (Line 203)
- `UPDATE users SET handle = ?, age = ?, ... WHERE id = ?` (Line 218)
- `INSERT OR IGNORE INTO user_topics ...` (Line 235)
- `SELECT id FROM topics WHERE id = ? OR title = ?` (Line 238)
- `INSERT INTO topics ...` (Line 250)
- `INSERT OR IGNORE INTO user_topics ...` (Line 255)
- `SELECT * FROM users WHERE id = ?` (Line 259)
- `SELECT topic_id FROM user_topics WHERE user_id = ?` (Line 260)

### `server/routes/users.ts`
- `SELECT t.id, t.title... FROM topics t JOIN user_topics ut ...` (Line 12)
- `SELECT tag FROM user_resonance_tags WHERE user_id = ?` (Line 19)
- `SELECT count(*) as count FROM blocked_entities WHERE user_id = ?` (Line 23)
- `UPDATE users SET ... WHERE id = ?` (Line 104)
- `SELECT * FROM users WHERE id = ?` (Line 107)
- `INSERT OR IGNORE INTO user_resonance_tags ...` (Line 141)
- `SELECT tag FROM user_resonance_tags WHERE user_id = ?` (Line 146)
- `DELETE FROM user_resonance_tags WHERE user_id = ? AND tag = ?` (Line 159)
- `SELECT tag FROM user_resonance_tags WHERE user_id = ?` (Line 161)
- `SELECT * FROM transactions WHERE user_id = ? ...` (Line 168)
- `SELECT t.title, t.category FROM topics t JOIN user_topics ut ...` (Line 179)
- `SELECT tag FROM user_resonance_tags WHERE user_id = ?` (Line 184)
- `SELECT count(*) as c FROM swipes WHERE user_id = ?` (Line 185)
- `SELECT count(*) as c FROM matches WHERE user1_id = ? OR user2_id = ?` (Line 186)
- `SELECT * FROM transactions WHERE user_id = ?` (Line 187)
- `DELETE FROM users WHERE id = ?` (Line 228)

### `server/routes/discovery.ts`
- `SELECT topic_id FROM user_topics WHERE user_id = ?` (Line 37)
- `SELECT u.id, u.handle... FROM users u WHERE ...` (Line 62)
- `SELECT t.id, t.title... FROM topics t JOIN user_topics ut ...` (Line 74)
- `SELECT id, handle, age, city FROM users WHERE id != ? LIMIT 3` (Line 134)
- `INSERT INTO swipes ... ON CONFLICT DO UPDATE ...` (Line 173)
- `SELECT * FROM swipes WHERE user_id = ? AND target_user_id = ?` (Line 185)
- `SELECT t.title FROM topics t JOIN user_topics ut1 ... JOIN user_topics ut2 ...` (Line 199)
- `SELECT handle FROM users WHERE id = ?` (Line 209)
- `INSERT OR IGNORE INTO matches ...` (Line 212)
- `SELECT id FROM chat_messages WHERE match_id = ? LIMIT 1` (Line 218)
- `INSERT INTO chat_messages ...` (Line 221)

### `server/routes/matches.ts`
- `SELECT m.*, CASE WHEN m.user1_id = ? THEN m.user2_id ELSE m.user1_id END as partner_id ...` (Line 43)
- `SELECT * FROM users WHERE id = ?` (Line 52)
- `SELECT t.title FROM topics t JOIN user_topics ut1 ... JOIN user_topics ut2 ...` (Line 56)
- `SELECT text, created_at FROM chat_messages WHERE match_id = ? ...` (Line 67)
- `SELECT * FROM matches WHERE id = ?` (Line 100)
- `SELECT * FROM users WHERE id = ?` (Line 116)
- `SELECT t.title FROM topics t JOIN user_topics ut1 ...` (Line 120)
- `SELECT * FROM matches WHERE id = ?` (Line 153)
- `UPDATE matches SET status = 'unmatched' WHERE id = ?` (Line 159)

### `server/routes/unmask.ts`
- `SELECT * FROM matches WHERE id = ?` (Line 13)
- `SELECT * FROM users WHERE id = ?` (Line 20)
- `SELECT user_id, stage FROM unmask_consents WHERE match_id = ?` (Line 23)
- `SELECT * FROM matches WHERE id = ?` (Line 62)
- `INSERT OR IGNORE INTO unmask_consents ...` (Line 71)
- `INSERT OR IGNORE INTO unmask_consents (seed partner) ...` (Line 78)
- `SELECT count(DISTINCT user_id) as count FROM unmask_consents WHERE match_id = ? AND stage = ?` (Line 85)
- `UPDATE matches SET unmask_stage = ?, updated_at = ... WHERE id = ?` (Line 94)
- `INSERT INTO chat_messages ...` (Line 102)
- `SELECT * FROM matches WHERE id = ?` (Line 115)
- `SELECT * FROM users WHERE id = ?` (Line 116)

### `server/routes/chat.ts`
- `DELETE FROM chat_messages WHERE expires_at <= datetime('now')` (Line 12)
- `SELECT * FROM matches WHERE id = ?` (Line 22)
- `SELECT m.*, u.handle as sender_handle FROM chat_messages m LEFT JOIN users u ...` (Line 31)
- `SELECT * FROM matches WHERE id = ?` (Line 70)
- `INSERT INTO chat_messages ...` (Line 90)
- `UPDATE matches SET updated_at = datetime('now') WHERE id = ?` (Line 96)
- `INSERT INTO chat_messages (seed partner reply) ...` (Line 114)

### `server/routes/topics.ts`
- `SELECT * FROM topics WHERE ... ORDER BY heat_score DESC` (Line 29)
- `SELECT topic_id FROM user_topics WHERE user_id = ?` (Line 34)
- `INSERT INTO topics ...` (Line 79)
- `INSERT OR IGNORE INTO user_topics ...` (Line 85)
- `SELECT * FROM topics WHERE id = ?` (Line 87)
- `SELECT * FROM topics WHERE id = ?` (Line 110)
- `SELECT * FROM user_topics WHERE user_id = ? AND topic_id = ?` (Line 116)
- `DELETE FROM user_topics WHERE user_id = ? AND topic_id = ?` (Line 121)
- `UPDATE topics SET debater_count = MAX(1, debater_count - 1) WHERE id = ?` (Line 122)
- `INSERT INTO user_topics ...` (Line 126)
- `UPDATE topics SET debater_count = debater_count + 1 WHERE id = ?` (Line 127)
- `SELECT debater_count FROM topics WHERE id = ?` (Line 131)

### `server/routes/rumors.ts`
- `SELECT r.*, t.title as topic_title, t.category, u.handle... FROM rumors r ...` (Line 34)
- `SELECT id, title, category FROM topics WHERE id = ?` (Line 75)
- `INSERT INTO rumors ...` (Line 96)
- `SELECT id, agrees, debates FROM rumors WHERE id = ?` (Line 133)
- `SELECT vote_type FROM rumor_votes WHERE rumor_id = ? AND user_id = ?` (Line 139)
- `UPDATE rumor_votes SET vote_type = ? WHERE ...` (Line 144)
- `UPDATE rumors SET agrees = ..., debates = ...` (Lines 146, 148, 155, 157)
- `INSERT INTO rumor_votes ...` (Line 153)
- `SELECT agrees, debates FROM rumors WHERE id = ?` (Line 161)
- `SELECT id, content FROM rumors WHERE id = ?` (Line 173)
- `UPDATE rumors SET is_encrypted = 0 WHERE id = ?` (Line 179)

### `server/routes/rooms.ts`
- `SELECT r.*, u.handle as host_handle FROM rooms r ...` (Line 10)
- `SELECT * FROM rooms WHERE id = ?` (Line 38)
- `INSERT OR REPLACE INTO room_participants ...` (Line 45)
- `UPDATE rooms SET listeners = listeners + 1 WHERE id = ?` (Line 50)
- `DELETE FROM room_participants WHERE room_id = ? AND user_id = ?` (Line 60)
- `UPDATE rooms SET listeners = MAX(0, listeners - 1) WHERE id = ?` (Line 61)
- `SELECT is_muted FROM room_participants WHERE room_id = ? AND user_id = ?` (Line 71)
- `UPDATE room_participants SET is_muted = ? WHERE ...` (Line 74)
- `SELECT m.*, u.handle as sender_handle FROM room_messages m ...` (Line 82)
- `INSERT INTO room_messages ...` (Line 116)
- `SELECT * FROM rooms WHERE id = ?` (Line 137)
- `SELECT role, is_muted FROM room_participants WHERE room_id = ? AND user_id = ?` (Line 148)

### `server/routes/boosts.ts`
- `INSERT INTO transactions ...` (Line 47)
- `UPDATE users SET boost_tier = ?, boost_expires_at = ? WHERE id = ?` (Line 53)

### `server/routes/safety.ts`
- `INSERT INTO reports ...` (Line 19)
- `INSERT OR IGNORE INTO blocked_entities ...` (Line 53)

### `server/routes/jobs.ts`
- `SELECT count(*) as c FROM chat_messages WHERE expires_at <= datetime('now')` (Line 23)
- `DELETE FROM chat_messages WHERE expires_at <= datetime('now')` (Line 24 via purgeExpiredMessages)
- `DELETE FROM room_participants WHERE joined_at < datetime('now', '-2 hours')` (Line 27)

---

## 3. Migration Invariants & Safety Contract
1. In `NODE_ENV=production`, only `server/db/supabase-db.ts` may be loaded.
2. In `NODE_ENV=production`, `seedDatabase()` must throw and abort process immediately.
3. No routes may call `db.prepare` or `db.exec`.
4. All entity access is performed through the typed `DatabaseAdapter` interface.
