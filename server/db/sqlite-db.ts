import Database from 'better-sqlite3';
import { DatabaseAdapter } from './interface.js';
import {
  User,
  AuthOtp,
  Topic,
  UserTopic,
  UserResonanceTag,
  Rumor,
  RumorVote,
  Swipe,
  Match,
  UnmaskConsent,
  ChatMessage,
  Room,
  RoomParticipant,
  RoomMessage,
  Transaction,
  Report,
  BlockedEntity
} from './types.js';

export class SqliteDatabase implements DatabaseAdapter {
  public providerName: 'sqlite' = 'sqlite';
  private db: Database.Database;

  constructor(db: Database.Database) {
    if (process.env.NODE_ENV === 'production' || !!process.env.VERCEL) {
      throw new Error('[FATAL_PRODUCTION_VIOLATION] SqliteDatabase cannot be instantiated in production mode.');
    }
    this.db = db;
  }

  async ping(): Promise<{ healthy: boolean; latencyMs: number; error?: string }> {
    const start = Date.now();
    try {
      this.db.prepare('SELECT 1').get();
      return { healthy: true, latencyMs: Date.now() - start };
    } catch (err: any) {
      return { healthy: false, latencyMs: Date.now() - start, error: err?.message || String(err) };
    }
  }

  users = {
    findById: async (id: string): Promise<User | null> => {
      const row = this.db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
      return row || null;
    },

    findByEmail: async (email: string): Promise<User | null> => {
      const row = this.db.prepare('SELECT * FROM users WHERE email = ?').get(email.trim().toLowerCase()) as User | undefined;
      return row || null;
    },

    findByHandle: async (handle: string): Promise<User | null> => {
      const row = this.db.prepare('SELECT * FROM users WHERE handle = ?').get(handle) as User | undefined;
      return row || null;
    },

    findByHandleExcludingUser: async (handle: string, excludeUserId: string): Promise<User | null> => {
      const row = this.db.prepare('SELECT * FROM users WHERE handle = ? AND id != ?').get(handle, excludeUserId) as User | undefined;
      return row || null;
    },

    create: async (userData: Partial<User>): Promise<User> => {
      const keys = Object.keys(userData);
      const placeholders = keys.map(() => '?').join(', ');
      const values = keys.map(k => (userData as any)[k]);
      this.db.prepare(`INSERT INTO users (${keys.join(', ')}) VALUES (${placeholders})`).run(...values);
      return this.users.findById(userData.id!) as Promise<User>;
    },

    update: async (id: string, updates: Partial<User>): Promise<User> => {
      const keys = Object.keys(updates);
      if (keys.length > 0) {
        const setClauses = keys.map(k => `${k} = ?`).concat("updated_at = datetime('now')");
        const values = keys.map(k => (updates as any)[k]).concat(id);
        this.db.prepare(`UPDATE users SET ${setClauses.join(', ')} WHERE id = ?`).run(...values);
      }
      return this.users.findById(id) as Promise<User>;
    },

    updateBoost: async (id: string, boostTier: string, expiresAt: string): Promise<void> => {
      this.db.prepare(`UPDATE users SET boost_tier = ?, boost_expires_at = ?, updated_at = datetime('now') WHERE id = ?`).run(boostTier, expiresAt, id);
    },

    delete: async (id: string): Promise<void> => {
      this.db.prepare('DELETE FROM users WHERE id = ?').run(id);
    },

    findDiscoveryCandidates: async (options: {
      currentUserId: string;
      minAge: number;
      maxAge: number;
      gender?: string;
    }): Promise<Array<Pick<User, 'id' | 'handle' | 'age' | 'gender' | 'city' | 'latitude' | 'longitude' | 'chaos_index' | 'role'>>> => {
      let query = `
        SELECT u.id, u.handle, u.age, u.gender, u.city, u.latitude, u.longitude, u.chaos_index, u.role
        FROM users u
        WHERE u.id != ?
          AND u.is_guest = 0
          AND u.ghost_mode = 0
          AND u.id NOT IN (SELECT blocked_user_id FROM blocked_entities WHERE user_id = ?)
          AND u.id NOT IN (SELECT target_user_id FROM swipes WHERE user_id = ?)
          AND u.age >= ? AND u.age <= ?
      `;
      const params: any[] = [options.currentUserId, options.currentUserId, options.currentUserId, options.minAge, options.maxAge];

      if (options.gender && options.gender !== 'everyone') {
        query += ' AND (u.gender = ? OR u.gender = "Non-binary")';
        params.push(options.gender === 'women' ? 'Women' : 'Men');
      }

      return this.db.prepare(query).all(...params) as any[];
    },

    getPeerCandidates: async (currentUserId: string, limit = 3): Promise<Array<Pick<User, 'id' | 'handle' | 'age' | 'city'>>> => {
      return this.db.prepare('SELECT id, handle, age, city FROM users WHERE id != ? LIMIT ?').all(currentUserId, limit) as any[];
    }
  };

  authOtps = {
    create: async (otp: { id: string; email: string; otp_code_hash: string; expires_at: string; consumed?: number; attempts?: number }): Promise<void> => {
      this.db.prepare(`
        INSERT INTO auth_otps (id, email, otp_code_hash, expires_at, consumed, attempts)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(otp.id, otp.email.trim().toLowerCase(), otp.otp_code_hash, otp.expires_at, otp.consumed ?? 0, otp.attempts ?? 0);
    },

    findLatestActive: async (email: string): Promise<AuthOtp | null> => {
      const row = this.db.prepare(`
        SELECT * FROM auth_otps
        WHERE email = ? AND consumed = 0 AND expires_at > datetime('now')
        ORDER BY created_at DESC LIMIT 1
      `).get(email.trim().toLowerCase()) as AuthOtp | undefined;
      return row || null;
    },

    incrementAttempts: async (id: string): Promise<void> => {
      this.db.prepare('UPDATE auth_otps SET attempts = attempts + 1 WHERE id = ?').run(id);
    },

    markConsumed: async (id: string): Promise<void> => {
      this.db.prepare('UPDATE auth_otps SET consumed = 1 WHERE id = ?').run(id);
    }
  };

  topics = {
    findAll: async (options?: { category?: string; search?: string }): Promise<Topic[]> => {
      let query = 'SELECT * FROM topics WHERE 1=1';
      const params: any[] = [];
      if (options?.category && options.category !== 'All') {
        query += ' AND category = ?';
        params.push(options.category);
      }
      if (options?.search && options.search.trim()) {
        query += ' AND (title LIKE ? OR description LIKE ?)';
        const term = `%${options.search.trim()}%`;
        params.push(term, term);
      }
      query += ' ORDER BY heat_score DESC';
      return this.db.prepare(query).all(...params) as Topic[];
    },

    findById: async (id: string): Promise<Topic | null> => {
      const row = this.db.prepare('SELECT * FROM topics WHERE id = ?').get(id) as Topic | undefined;
      return row || null;
    },

    findByIdOrTitle: async (identifier: string): Promise<Topic | null> => {
      const row = this.db.prepare('SELECT * FROM topics WHERE id = ? OR title = ?').get(identifier, identifier) as Topic | undefined;
      return row || null;
    },

    create: async (topic: Partial<Topic>): Promise<Topic> => {
      this.db.prepare(`
        INSERT INTO topics (id, title, category, description, debater_count, heat_score, match_rate, is_hot, creator_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        topic.id,
        topic.title,
        topic.category || 'Tech',
        topic.description || null,
        topic.debater_count ?? 1,
        topic.heat_score ?? 75,
        topic.match_rate ?? 88,
        topic.is_hot ?? 1,
        topic.creator_id || null
      );
      return this.topics.findById(topic.id!) as Promise<Topic>;
    },

    incrementDebaters: async (id: string, delta: number): Promise<number> => {
      if (delta < 0) {
        this.db.prepare('UPDATE topics SET debater_count = MAX(1, debater_count - 1) WHERE id = ?').run(id);
      } else {
        this.db.prepare('UPDATE topics SET debater_count = debater_count + ? WHERE id = ?').run(delta, id);
      }
      const updated = this.db.prepare('SELECT debater_count FROM topics WHERE id = ?').get(id) as { debater_count: number };
      return updated?.debater_count ?? 1;
    }
  };

  userTopics = {
    findTopicIdsByUserId: async (userId: string): Promise<string[]> => {
      const rows = this.db.prepare('SELECT topic_id FROM user_topics WHERE user_id = ?').all(userId) as { topic_id: string }[];
      return rows.map(r => r.topic_id);
    },

    findTopicsByUserId: async (userId: string): Promise<Array<{ id: string; title: string; category: string; match_rate: number }>> => {
      return this.db.prepare(`
        SELECT t.id, t.title, t.category, t.match_rate
        FROM topics t
        JOIN user_topics ut ON ut.topic_id = t.id
        WHERE ut.user_id = ?
      `).all(userId) as any[];
    },

    subscribe: async (userId: string, topicId: string): Promise<void> => {
      this.db.prepare('INSERT OR IGNORE INTO user_topics (user_id, topic_id) VALUES (?, ?)').run(userId, topicId);
    },

    unsubscribe: async (userId: string, topicId: string): Promise<void> => {
      this.db.prepare('DELETE FROM user_topics WHERE user_id = ? AND topic_id = ?').run(userId, topicId);
    },

    isSubscribed: async (userId: string, topicId: string): Promise<boolean> => {
      const row = this.db.prepare('SELECT * FROM user_topics WHERE user_id = ? AND topic_id = ?').get(userId, topicId);
      return Boolean(row);
    },

    findSharedTopics: async (userId1: string, userId2: string): Promise<Array<{ title: string }>> => {
      return this.db.prepare(`
        SELECT t.title FROM topics t
        JOIN user_topics ut1 ON ut1.topic_id = t.id AND ut1.user_id = ?
        JOIN user_topics ut2 ON ut2.topic_id = t.id AND ut2.user_id = ?
      `).all(userId1, userId2) as { title: string }[];
    }
  };

  userResonanceTags = {
    findByUserId: async (userId: string): Promise<string[]> => {
      const rows = this.db.prepare('SELECT tag FROM user_resonance_tags WHERE user_id = ?').all(userId) as { tag: string }[];
      return rows.map(r => r.tag);
    },

    addTag: async (userId: string, tag: string): Promise<void> => {
      const tagId = `tag-${userId}-${Date.now()}`;
      this.db.prepare('INSERT OR IGNORE INTO user_resonance_tags (id, user_id, tag) VALUES (?, ?, ?)').run(tagId, userId, tag);
    },

    removeTag: async (userId: string, tag: string): Promise<void> => {
      this.db.prepare('DELETE FROM user_resonance_tags WHERE user_id = ? AND tag = ?').run(userId, tag);
    }
  };

  rumors = {
    findAll: async (options?: { category?: string; search?: string }): Promise<Array<Rumor & { topic_title: string; category: string; author_handle?: string; author_chaos_index?: number }>> => {
      let query = `
        SELECT r.*, t.title as topic_title, t.category, u.handle as author_handle, u.chaos_index as author_chaos_index
        FROM rumors r
        JOIN topics t ON t.id = r.topic_id
        LEFT JOIN users u ON u.id = r.author_id
        WHERE 1=1
      `;
      const params: any[] = [];
      if (options?.category && options.category !== 'All') {
        query += ' AND t.category = ?';
        params.push(options.category);
      }
      if (options?.search && options.search.trim()) {
        query += ' AND (r.content LIKE ? OR t.title LIKE ?)';
        const term = `%${options.search.trim()}%`;
        params.push(term, term);
      }
      query += ' ORDER BY r.created_at DESC';
      return this.db.prepare(query).all(...params) as any[];
    },

    findById: async (id: string): Promise<Rumor | null> => {
      const row = this.db.prepare('SELECT * FROM rumors WHERE id = ?').get(id) as Rumor | undefined;
      return row || null;
    },

    create: async (rumor: Partial<Rumor>): Promise<Rumor> => {
      this.db.prepare(`
        INSERT INTO rumors (id, topic_id, author_id, content, encrypted_content, is_encrypted, match_rate, agrees, debates, tags)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        rumor.id,
        rumor.topic_id,
        rumor.author_id || null,
        rumor.content,
        rumor.encrypted_content || null,
        rumor.is_encrypted ?? 1,
        rumor.match_rate ?? 88,
        rumor.agrees ?? 0,
        rumor.debates ?? 0,
        rumor.tags || '[]'
      );
      return this.rumors.findById(rumor.id!) as Promise<Rumor>;
    },

    updateVoteCount: async (id: string, agreesDelta: number, debatesDelta: number): Promise<void> => {
      if (agreesDelta !== 0) {
        this.db.prepare(`UPDATE rumors SET agrees = MAX(0, agrees + ?) WHERE id = ?`).run(agreesDelta, id);
      }
      if (debatesDelta !== 0) {
        this.db.prepare(`UPDATE rumors SET debates = MAX(0, debates + ?) WHERE id = ?`).run(debatesDelta, id);
      }
    },

    decrypt: async (id: string): Promise<void> => {
      this.db.prepare('UPDATE rumors SET is_encrypted = 0 WHERE id = ?').run(id);
    }
  };

  rumorVotes = {
    findByRumorAndUser: async (rumorId: string, userId: string): Promise<RumorVote | null> => {
      const row = this.db.prepare('SELECT * FROM rumor_votes WHERE rumor_id = ? AND user_id = ?').get(rumorId, userId) as RumorVote | undefined;
      return row || null;
    },

    upsert: async (vote: { rumorId: string; userId: string; voteType: 'agree' | 'debate' }): Promise<void> => {
      const voteId = `vote-${vote.rumorId}-${vote.userId}`;
      this.db.prepare(`
        INSERT INTO rumor_votes (id, rumor_id, user_id, vote_type)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(rumor_id, user_id) DO UPDATE SET vote_type = excluded.vote_type
      `).run(voteId, vote.rumorId, vote.userId, vote.voteType);
    }
  };

  swipes = {
    recordSwipe: async (swipe: { userId: string; targetUserId: string; direction: 'like' | 'pass' }): Promise<void> => {
      const swipeId = `swipe-${swipe.userId}-${swipe.targetUserId}`;
      this.db.prepare(`
        INSERT INTO swipes (id, user_id, target_user_id, direction)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(user_id, target_user_id) DO UPDATE SET direction = excluded.direction
      `).run(swipeId, swipe.userId, swipe.targetUserId, swipe.direction);
    },

    findSwipe: async (userId: string, targetUserId: string): Promise<Swipe | null> => {
      const row = this.db.prepare('SELECT * FROM swipes WHERE user_id = ? AND target_user_id = ?').get(userId, targetUserId) as Swipe | undefined;
      return row || null;
    },

    countByUserId: async (userId: string): Promise<number> => {
      const row = this.db.prepare('SELECT count(*) as c FROM swipes WHERE user_id = ?').get(userId) as { c: number };
      return row?.c ?? 0;
    }
  };

  matches = {
    findActiveByUserId: async (userId: string): Promise<Array<Match & { partner_id: string }>> => {
      return this.db.prepare(`
        SELECT m.*,
          CASE WHEN m.user1_id = ? THEN m.user2_id ELSE m.user1_id END as partner_id
        FROM matches m
        WHERE (m.user1_id = ? OR m.user2_id = ?) AND m.status = 'active'
        ORDER BY m.updated_at DESC
      `).all(userId, userId, userId) as any[];
    },

    findById: async (id: string): Promise<Match | null> => {
      const row = this.db.prepare('SELECT * FROM matches WHERE id = ?').get(id) as Match | undefined;
      return row || null;
    },

    create: async (match: Partial<Match>): Promise<Match> => {
      this.db.prepare(`
        INSERT OR IGNORE INTO matches (id, user1_id, user2_id, compatibility, unmask_stage, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        match.id,
        match.user1_id,
        match.user2_id,
        match.compatibility ?? 88,
        match.unmask_stage ?? 0,
        match.status || 'active'
      );
      return this.matches.findById(match.id!) as Promise<Match>;
    },

    updateStatus: async (id: string, status: 'active' | 'unmatched' | 'blocked'): Promise<void> => {
      this.db.prepare("UPDATE matches SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, id);
    },

    updateUnmaskStage: async (id: string, stage: number): Promise<void> => {
      this.db.prepare("UPDATE matches SET unmask_stage = ?, updated_at = datetime('now') WHERE id = ?").run(stage, id);
    },

    touchMatch: async (id: string): Promise<void> => {
      this.db.prepare("UPDATE matches SET updated_at = datetime('now') WHERE id = ?").run(id);
    },

    countByUserId: async (userId: string): Promise<number> => {
      const row = this.db.prepare('SELECT count(*) as c FROM matches WHERE user1_id = ? OR user2_id = ?').get(userId, userId) as { c: number };
      return row?.c ?? 0;
    }
  };

  unmaskConsents = {
    findByMatchId: async (matchId: string): Promise<UnmaskConsent[]> => {
      return this.db.prepare('SELECT * FROM unmask_consents WHERE match_id = ?').all(matchId) as UnmaskConsent[];
    },

    addConsent: async (consent: { matchId: string; userId: string; stage: number }): Promise<void> => {
      const consentId = `consent-${consent.matchId}-${consent.userId}-${consent.stage}`;
      this.db.prepare(`
        INSERT OR IGNORE INTO unmask_consents (id, match_id, user_id, stage)
        VALUES (?, ?, ?, ?)
      `).run(consentId, consent.matchId, consent.userId, consent.stage);
    },

    getBilateralCount: async (matchId: string, stage: number): Promise<number> => {
      const row = this.db.prepare(`
        SELECT count(DISTINCT user_id) as count
        FROM unmask_consents
        WHERE match_id = ? AND stage = ?
      `).get(matchId, stage) as { count: number };
      return row?.count ?? 0;
    }
  };

  chatMessages = {
    findByMatchId: async (matchId: string): Promise<Array<ChatMessage & { sender_handle?: string }>> => {
      return this.db.prepare(`
        SELECT m.*, u.handle as sender_handle
        FROM chat_messages m
        LEFT JOIN users u ON u.id = m.sender_id
        WHERE m.match_id = ? AND m.expires_at > datetime('now')
        ORDER BY m.created_at ASC
      `).all(matchId) as any[];
    },

    getLatestByMatchId: async (matchId: string): Promise<ChatMessage | null> => {
      const row = this.db.prepare(`
        SELECT * FROM chat_messages
        WHERE match_id = ? AND expires_at > datetime('now')
        ORDER BY created_at DESC LIMIT 1
      `).get(matchId) as ChatMessage | undefined;
      return row || null;
    },

    create: async (msg: Partial<ChatMessage>): Promise<ChatMessage> => {
      this.db.prepare(`
        INSERT INTO chat_messages (id, match_id, sender_id, text, expires_at, is_warning)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        msg.id,
        msg.match_id,
        msg.sender_id,
        msg.text,
        msg.expires_at,
        msg.is_warning ?? 0
      );
      const row = this.db.prepare('SELECT * FROM chat_messages WHERE id = ?').get(msg.id) as ChatMessage;
      return row;
    },

    hasMessages: async (matchId: string): Promise<boolean> => {
      const row = this.db.prepare('SELECT id FROM chat_messages WHERE match_id = ? LIMIT 1').get(matchId);
      return Boolean(row);
    },

    countExpired: async (): Promise<number> => {
      const row = this.db.prepare("SELECT count(*) as c FROM chat_messages WHERE expires_at <= datetime('now')").get() as { c: number };
      return row?.c ?? 0;
    },

    purgeExpired: async (): Promise<number> => {
      const count = await this.chatMessages.countExpired();
      if (count > 0) {
        this.db.prepare("DELETE FROM chat_messages WHERE expires_at <= datetime('now')").run();
      }
      return count;
    }
  };

  rooms = {
    findLive: async (): Promise<Array<Room & { host_handle?: string }>> => {
      return this.db.prepare(`
        SELECT r.*, u.handle as host_handle
        FROM rooms r
        LEFT JOIN users u ON u.id = r.host_id
        WHERE r.is_live = 1
        ORDER BY r.listeners DESC
      `).all() as any[];
    },

    findById: async (id: string): Promise<Room | null> => {
      const row = this.db.prepare('SELECT * FROM rooms WHERE id = ?').get(id) as Room | undefined;
      return row || null;
    },

    incrementListeners: async (id: string, delta: number): Promise<void> => {
      if (delta > 0) {
        this.db.prepare('UPDATE rooms SET listeners = listeners + ? WHERE id = ?').run(delta, id);
      } else {
        this.db.prepare('UPDATE rooms SET listeners = MAX(0, listeners - ?) WHERE id = ?').run(Math.abs(delta), id);
      }
    }
  };

  roomParticipants = {
    findByRoomAndUser: async (roomId: string, userId: string): Promise<RoomParticipant | null> => {
      const row = this.db.prepare('SELECT * FROM room_participants WHERE room_id = ? AND user_id = ?').get(roomId, userId) as RoomParticipant | undefined;
      return row || null;
    },

    addOrUpdate: async (participant: {
      roomId: string;
      userId: string;
      role?: 'host' | 'speaker' | 'listener';
      isMuted?: boolean;
      isHandRaised?: boolean;
    }): Promise<void> => {
      this.db.prepare(`
        INSERT OR REPLACE INTO room_participants (room_id, user_id, role, is_muted, is_hand_raised)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        participant.roomId,
        participant.userId,
        participant.role || 'listener',
        participant.isMuted !== false ? 1 : 0,
        participant.isHandRaised ? 1 : 0
      );
    },

    remove: async (roomId: string, userId: string): Promise<void> => {
      this.db.prepare('DELETE FROM room_participants WHERE room_id = ? AND user_id = ?').run(roomId, userId);
    },

    updateMic: async (roomId: string, userId: string, isMuted: boolean): Promise<void> => {
      this.db.prepare('UPDATE room_participants SET is_muted = ? WHERE room_id = ? AND user_id = ?').run(isMuted ? 1 : 0, roomId, userId);
    },

    pruneInactive: async (hours: number): Promise<number> => {
      const info = this.db.prepare(`
        DELETE FROM room_participants 
        WHERE joined_at < datetime('now', '-${hours} hours')
      `).run();
      return info.changes;
    }
  };

  roomMessages = {
    findByRoomId: async (roomId: string): Promise<Array<RoomMessage & { sender_handle?: string }>> => {
      return this.db.prepare(`
        SELECT m.*, u.handle as sender_handle
        FROM room_messages m
        LEFT JOIN users u ON u.id = m.sender_id
        WHERE m.room_id = ?
        ORDER BY m.created_at ASC
      `).all(roomId) as any[];
    },

    create: async (msg: Partial<RoomMessage>): Promise<RoomMessage> => {
      this.db.prepare(`
        INSERT INTO room_messages (id, room_id, sender_id, text, stance)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        msg.id,
        msg.room_id,
        msg.sender_id,
        msg.text,
        msg.stance || null
      );
      const row = this.db.prepare('SELECT * FROM room_messages WHERE id = ?').get(msg.id) as RoomMessage;
      return row;
    }
  };

  transactions = {
    findByUserId: async (userId: string): Promise<Transaction[]> => {
      return this.db.prepare(`
        SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC
      `).all(userId) as Transaction[];
    },

    create: async (tx: Partial<Transaction>): Promise<Transaction> => {
      this.db.prepare(`
        INSERT INTO transactions (id, user_id, tier_name, amount, status)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        tx.id,
        tx.user_id,
        tx.tier_name,
        tx.amount,
        tx.status || 'completed'
      );
      const row = this.db.prepare('SELECT * FROM transactions WHERE id = ?').get(tx.id) as Transaction;
      return row;
    }
  };

  reports = {
    create: async (report: Partial<Report>): Promise<Report> => {
      this.db.prepare(`
        INSERT INTO reports (id, reporter_id, target_id, reason, details, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        report.id,
        report.reporter_id || null,
        report.target_id,
        report.reason,
        report.details || null,
        report.status || 'pending'
      );
      const row = this.db.prepare('SELECT * FROM reports WHERE id = ?').get(report.id) as Report;
      return row;
    }
  };

  blockedEntities = {
    block: async (userId: string, blockedUserId: string): Promise<void> => {
      const blockId = `block-${userId}-${blockedUserId}`;
      this.db.prepare(`
        INSERT OR IGNORE INTO blocked_entities (id, user_id, blocked_user_id)
        VALUES (?, ?, ?)
      `).run(blockId, userId, blockedUserId);
    },

    isBlocked: async (userId: string, targetUserId: string): Promise<boolean> => {
      const row = this.db.prepare('SELECT id FROM blocked_entities WHERE user_id = ? AND blocked_user_id = ?').get(userId, targetUserId);
      return Boolean(row);
    },

    getBlockedUserIds: async (userId: string): Promise<string[]> => {
      const rows = this.db.prepare('SELECT blocked_user_id FROM blocked_entities WHERE user_id = ?').all(userId) as { blocked_user_id: string }[];
      return rows.map(r => r.blocked_user_id);
    },

    countByUserId: async (userId: string): Promise<number> => {
      const row = this.db.prepare('SELECT count(*) as count FROM blocked_entities WHERE user_id = ?').get(userId) as { count: number };
      return row?.count ?? 0;
    }
  };
}
