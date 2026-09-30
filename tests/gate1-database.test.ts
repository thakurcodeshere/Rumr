import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { app } from '../server/index.js';
import { db } from '../server/db/database.js';
import { seedDatabase } from '../server/db/seed.js';
import { SqliteDatabase } from '../server/db/sqlite-db.js';
import { validateProductionSupabaseConfig } from '../server/db/supabase.js';

describe('RUMR Production Gate 1: Database Architecture Suite', () => {

  describe('1. Production Fail-Closed Guards', () => {
    const originalEnv = process.env.NODE_ENV;
    const originalUrl = process.env.SUPABASE_URL;
    const originalKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const originalAnon = process.env.SUPABASE_ANON_KEY;

    const originalVercel = process.env.VERCEL;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
      process.env.SUPABASE_URL = originalUrl;
      process.env.SUPABASE_SERVICE_ROLE_KEY = originalKey;
      process.env.SUPABASE_ANON_KEY = originalAnon;
      process.env.VERCEL = originalVercel;
    });

    it('rejects SqliteDatabase instantiation in production mode', () => {
      process.env.NODE_ENV = 'production';
      expect(() => {
        new SqliteDatabase({} as any);
      }).toThrow(/FATAL_PRODUCTION_VIOLATION/);
    });

    it('rejects SqliteDatabase instantiation in Vercel environment', () => {
      process.env.NODE_ENV = 'development';
      process.env.VERCEL = '1';
      expect(() => {
        new SqliteDatabase({} as any);
      }).toThrow(/FATAL_PRODUCTION_VIOLATION/);
    });

    it('rejects database seeding in production mode', () => {
      process.env.NODE_ENV = 'production';
      expect(() => {
        seedDatabase({} as any);
      }).toThrow(/FATAL_SECURITY_VIOLATION/);
    });

    it('fails closed when production Supabase credentials are missing', () => {
      process.env.NODE_ENV = 'production';
      delete process.env.SUPABASE_URL;
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;
      delete process.env.SUPABASE_ANON_KEY;

      expect(() => {
        validateProductionSupabaseConfig();
      }).toThrow(/FATAL_CONFIG_ERROR/);
    });

    it('fails closed when SUPABASE_SERVICE_ROLE_KEY is missing in production even if anon key is present', () => {
      process.env.NODE_ENV = 'production';
      process.env.SUPABASE_URL = 'https://hjqkfxwkfctrivfftmwv.supabase.co';
      process.env.SUPABASE_ANON_KEY = 'sb_publishable_test';
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;

      expect(() => {
        validateProductionSupabaseConfig();
      }).toThrow(/SUPABASE_SERVICE_ROLE_KEY is required in production/);
    });
  });

  describe('2. Truthful Health & Readiness Endpoints', () => {
    it('reports actual active database provider in /api/health', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('SYS_ACTIVE');
      expect(res.body.database).toBeDefined();
      expect(['supabase', 'sqlite']).toContain(res.body.database.provider);
      expect(res.body.database.status).toBe('connected');
      expect(res.body.stack.database.provider).toBe(res.body.database.provider);
    });

    it('verifies live database connection via /api/ready', async () => {
      const res = await request(app).get('/api/ready');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ready');
      expect(res.body.database).toBeDefined();
      expect(res.body.database.status).toBe('connected');
      expect(res.body.database.latencyMs).toBeTypeOf('number');
    });
  });

  describe('3. DatabaseAdapter CRUD Operations', () => {
    const testUserId = `test-user-${Date.now()}`;
    const testTopicId = `test-topic-${Date.now()}`;
    const testMatchId = `test-match-${Date.now()}`;

    it('creates and retrieves a user through the database adapter', async () => {
      const created = await db.users.create({
        id: testUserId,
        email: `test-${Date.now()}@rumr.io`,
        handle: `test_handle_${Date.now()}`,
        avatar_seed: 'seed123',
        age: 27,
        gender: 'Non-binary',
        intent: 'Conversations',
        city: 'Delhi NCR',
        chaos_index: 80,
        is_verified: 1,
        is_guest: 0
      });

      expect(created).toBeDefined();
      expect(created.id).toBe(testUserId);

      const fetched = await db.users.findById(testUserId);
      expect(fetched).toBeDefined();
      expect(fetched?.id).toBe(testUserId);
      expect(fetched?.age).toBe(27);
    });

    it('creates and subscribes to topics through the database adapter', async () => {
      const createdTopic = await db.topics.create({
        id: testTopicId,
        title: 'Quantum LLMs',
        category: 'Tech',
        description: 'Test topic description',
        debater_count: 1,
        heat_score: 80,
        match_rate: 90,
        is_hot: 1
      });

      expect(createdTopic.id).toBe(testTopicId);

      await db.userTopics.subscribe(testUserId, testTopicId);
      const isSub = await db.userTopics.isSubscribed(testUserId, testTopicId);
      expect(isSub).toBe(true);

      const subIds = await db.userTopics.findTopicIdsByUserId(testUserId);
      expect(subIds).toContain(testTopicId);
    });

    it('records swipes, matches, and chat messages through the database adapter', async () => {
      const partnerId = `partner-${Date.now()}`;
      await db.users.create({
        id: partnerId,
        handle: `partner_${Date.now()}`,
        avatar_seed: 'seed456',
        is_guest: 0
      });

      await db.swipes.recordSwipe({
        userId: testUserId,
        targetUserId: partnerId,
        direction: 'like'
      });

      const swipe = await db.swipes.findSwipe(testUserId, partnerId);
      expect(swipe?.direction).toBe('like');

      await db.matches.create({
        id: testMatchId,
        user1_id: testUserId,
        user2_id: partnerId,
        compatibility: 95,
        unmask_stage: 0,
        status: 'active'
      });

      const activeMatches = await db.matches.findActiveByUserId(testUserId);
      expect(activeMatches.some(m => m.id === testMatchId)).toBe(true);

      const msgId = `msg-test-${Date.now()}`;
      const expiresAt = new Date(Date.now() + 300000).toISOString();
      await db.chatMessages.create({
        id: msgId,
        match_id: testMatchId,
        sender_id: testUserId,
        text: 'Encrypted message test',
        expires_at: expiresAt,
        is_warning: 0
      });

      const messages = await db.chatMessages.findByMatchId(testMatchId);
      expect(messages.some(m => m.id === msgId)).toBe(true);
    });

    it('records incident reports and blocks entities safely', async () => {
      const targetId = `target-${Date.now()}`;
      await db.users.create({
        id: targetId,
        handle: `target_handle_${Date.now()}`,
        avatar_seed: 'seed789',
        is_guest: 0
      });

      const report = await db.reports.create({
        id: `rep-test-${Date.now()}`,
        reporter_id: testUserId,
        target_id: targetId,
        reason: 'Harassment',
        status: 'pending'
      });
      expect(report.status).toBe('pending');

      await db.blockedEntities.block(testUserId, targetId);
      const isBlocked = await db.blockedEntities.isBlocked(testUserId, targetId);
      expect(isBlocked).toBe(true);
    });
  });
});
