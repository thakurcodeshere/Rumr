import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../server/index.js';

describe('Auth & Session Security API', () => {
  it('rejects invalid email formats', async () => {
    const res = await request(app)
      .post('/api/auth/send-otp')
      .send({ email: 'not-an-email' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('INVALID_EMAIL');
  });

  it('dispatches OTP code for valid email', async () => {
    const res = await request(app)
      .post('/api/auth/send-otp')
      .send({ email: 'test.user@rumr.io' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.dev_code).toBeDefined();
  });

  it('rejects verification with wrong OTP code', async () => {
    const res = await request(app)
      .post('/api/auth/verify-otp')
      .send({ email: 'test.user@rumr.io', code: '000000' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('INVALID_CODE');
  });

  it('verifies valid OTP and returns JWT token and user profile', async () => {
    // 1. Send OTP
    const sendRes = await request(app)
      .post('/api/auth/send-otp')
      .send({ email: 'alice.tester@rumr.io' });

    const code = sendRes.body.dev_code;

    // 2. Verify OTP
    const verifyRes = await request(app)
      .post('/api/auth/verify-otp')
      .send({ email: 'alice.tester@rumr.io', code });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.token).toBeDefined();
    expect(verifyRes.body.user).toBeDefined();
    expect(verifyRes.body.user.email).toBe('alice.tester@rumr.io');
    expect(verifyRes.body.user.handle).toContain('anonymous_ghost');
  });

  it('issues guest token with restricted permissions', async () => {
    const res = await request(app)
      .post('/api/auth/guest')
      .send();

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.isGuest).toBe(true);
    expect(res.body.user.handle).toContain('guest_wanderer');
  });

  it('restricts guest from posting custom topic', async () => {
    const guestRes = await request(app)
      .post('/api/auth/guest')
      .send();

    const guestToken = guestRes.body.token;

    const topicRes = await request(app)
      .post('/api/topics')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ title: 'Guest Take', category: 'Tech' });

    expect(topicRes.status).toBe(403);
    expect(topicRes.body.error).toBe('GUEST_RESTRICTION');
  });
});
