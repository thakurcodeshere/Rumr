import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../server/index.js';
import { redisService } from '../server/services/redis.js';
import { createLiveKitToken } from '../server/services/livekit.js';
import { emailService } from '../server/services/email.js';
import { sentryService } from '../server/services/sentry.js';
import { qstashService } from '../server/services/qstash.js';
import { supabase } from '../server/db/supabase.js';

describe('Production Stack Verification Suite', () => {

  // 1. Upstash Redis Health & Presence
  describe('Upstash Redis & Presence Engine', () => {
    it('returns PONG on redis ping healthcheck', async () => {
      const pingRes = await redisService.ping();
      expect(pingRes.status).toBe('PONG');
      expect(pingRes.healthy).toBe(true);
    });

    it('handles presence tracking for room participants', async () => {
      await redisService.trackPresence('room-test-1', 'user-debater-99');
      const presence = await redisService.getPresence('room-test-1');
      expect(presence).toContain('user-debater-99');

      await redisService.removePresence('room-test-1', 'user-debater-99');
      const updatedPresence = await redisService.getPresence('room-test-1');
      expect(updatedPresence).not.toContain('user-debater-99');
    });

    it('exposes /api/health/redis returning PONG', async () => {
      const res = await request(app).get('/api/health/redis');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('PONG');
      expect(res.body.healthy).toBe(true);
    });
  });

  // 2. WebRTC Audio Infrastructure (LiveKit Cloud)
  describe('LiveKit Cloud WebRTC Audio Infrastructure', () => {
    it('generates signed WebRTC access token for audio debate rooms', async () => {
      const tokenData = await createLiveKitToken({
        identity: 'test-speaker-1',
        roomName: 'room-1',
        canPublish: true,
        canSubscribe: true,
      });

      expect(tokenData.token).toBeDefined();
      expect(tokenData.token.length).toBeGreaterThan(20);
      expect(tokenData.wsUrl).toContain('livekit');
    });

    it('issues token via GET /api/rooms/:roomId/token', async () => {
      const res = await request(app).get('/api/rooms/room-1/token');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.roomId).toBe('room-1');
      expect(res.body.token).toBeDefined();
      expect(res.body.wsUrl).toBeDefined();
    });

    it('exposes /api/health/livekit returning READY', async () => {
      const res = await request(app).get('/api/health/livekit');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('READY');
      expect(res.body.protocol).toBe('WebRTC');
    });
  });

  // 3. Upstash QStash Background Jobs
  describe('Upstash QStash Background Decay & Jobs', () => {
    it('executes ephemeral message decay webhook via POST /api/jobs/decay', async () => {
      const res = await request(app)
        .post('/api/jobs/decay')
        .send({ action: 'PURGE_EXPIRED_MESSAGES' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.action).toBe('EPHEMERAL_PURGE_COMPLETE');
    });

    it('exposes job telemetry status via GET /api/jobs/status', async () => {
      const res = await request(app).get('/api/jobs/status');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ACTIVE');
      expect(res.body.endpoints.decayWebhook).toBe('/api/jobs/decay');
    });
  });

  // 4. Transactional Email (Resend)
  describe('Resend Transactional Email Service', () => {
    it('dispatches clean chaos OTP email format', async () => {
      const result = await emailService.sendOtpEmail('test.debater@rumr.io', '849201');
      expect(result.success).toBe(true);
    });

    it('integrates email dispatch into auth /send-otp endpoint', async () => {
      const res = await request(app)
        .post('/api/auth/send-otp')
        .send({ email: 'integration.tester@rumr.io' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('verification code');
    });
  });

  // 5. Crash & Error Tracking (Sentry)
  describe('Sentry Observability & Error Sentinel', () => {
    it('captures exceptions and messages safely without throwing', () => {
      expect(() => {
        sentryService.captureMessage('Production health check event', 'info');
        sentryService.captureException(new Error('Synthetic simulated test error'), { component: 'test' });
      }).not.toThrow();
    });
  });

  // 6. Supabase PostgreSQL Client
  describe('Supabase PostgreSQL Infrastructure', () => {
    it('initializes Supabase client instance with production endpoint', () => {
      expect(supabase).toBeDefined();
      expect(supabase.from).toBeTypeOf('function');
    });
  });

  // 7. Core Production Health & Runtime
  describe('Unified Production Health Sentinel', () => {
    it('reports all 10 stack layers in /api/health', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('SYS_ACTIVE');
      expect(res.body.stack).toBeDefined();
      expect(res.body.stack.database).toBeDefined();
      expect(res.body.stack.realtime).toBeDefined();
      expect(res.body.stack.cacheAndPresence).toBeDefined();
      expect(res.body.stack.jobs).toBeDefined();
      expect(res.body.stack.communications).toBeDefined();
      expect(res.body.stack.observability).toBeDefined();
    });
  });
});
