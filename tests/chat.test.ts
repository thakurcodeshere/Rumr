import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../server/index.js';

describe('Chat Tunnels, Ephemeral Decay & AI Sentinel API', () => {
  let authToken: string;
  let matchId: string;

  beforeAll(async () => {
    const testEmail = `chat.tester.${Date.now()}@rumr.io`;
    const authRes = await request(app)
      .post('/api/auth/verify-otp')
      .send({ email: testEmail, code: '482910' });
    authToken = authRes.body.token;

    const swipeRes = await request(app)
      .post('/api/discovery/swipe')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ targetUserId: 'user-partner-1', direction: 'like' });

    matchId = swipeRes.body.matchId;
  });

  it('sends valid message in encrypted topic tunnel with 300s TTL', async () => {
    const res = await request(app)
      .post(`/api/matches/${matchId}/messages`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ text: 'Cloud infrastructure margins are driving executive layoffs.' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message.text).toBe('Cloud infrastructure margins are driving executive layoffs.');
    expect(res.body.message.expiresInSeconds).toBe(300);
  });

  it('server-side AI Sentinel intercepts hostile ad-hominem patterns (422)', async () => {
    const res = await request(app)
      .post(`/api/matches/${matchId}/messages`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ text: 'You are so stupid and an idiot.' });

    expect(res.status).toBe(422);
    expect(res.body.error).toBe('AI_SENTINEL_VIOLATION');
    expect(res.body.category).toBe('toxicity');
    expect(res.body.message).toContain('AI Moderation Sentinel detected hostile');
  });

  it('server-side AI Sentinel intercepts phone doxxing attempts (422)', async () => {
    const res = await request(app)
      .post(`/api/matches/${matchId}/messages`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ text: 'Call my cell at 987-654-3210 right now.' });

    expect(res.status).toBe(422);
    expect(res.body.error).toBe('AI_SENTINEL_VIOLATION');
    expect(res.body.category).toBe('doxxing');
  });

  it('retrieves active messages with live decay countdown', async () => {
    const res = await request(app)
      .get(`/api/matches/${matchId}/messages`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.messages).toBeDefined();
    expect(res.body.messages.length).toBeGreaterThan(0);
    const lastMsg = res.body.messages[res.body.messages.length - 1];
    expect(lastMsg.expiresInSeconds).toBeGreaterThan(0);
    expect(lastMsg.expiresInSeconds).toBeLessThanOrEqual(300);
  });

  it('rejects message attempt by non-participant (403 Forbidden)', async () => {
    const rogueRes = await request(app)
      .post('/api/auth/verify-otp')
      .send({ email: 'intruder@rumr.io', code: '482910' });

    const res = await request(app)
      .post(`/api/matches/${matchId}/messages`)
      .set('Authorization', `Bearer ${rogueRes.body.token}`)
      .send({ text: 'I should not be able to write here.' });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('FORBIDDEN');
  });
});
