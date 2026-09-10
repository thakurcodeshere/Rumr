import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../server/index.js';

describe('Bilateral Progressive Cryptographic Unmasking API', () => {
  let authToken: string;
  let matchId: string;

  beforeAll(async () => {
    // 1. Authenticate test user with unique email
    const testEmail = `unmask.tester.${Date.now()}@rumr.io`;
    const authRes = await request(app)
      .post('/api/auth/verify-otp')
      .send({ email: testEmail, code: '482910' });
    authToken = authRes.body.token;

    // 2. Establish match with user-partner-1
    const swipeRes = await request(app)
      .post('/api/discovery/swipe')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ targetUserId: 'user-partner-1', direction: 'like' });

    matchId = swipeRes.body.matchId;
  });

  it('quarantines PII at Stage 0 (no cleartext portrait or full name)', async () => {
    const res = await request(app)
      .get(`/api/matches/${matchId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    const partner = res.body.match.partner;
    expect(partner.unmaskStage).toBe(0);
    expect(partner.realName).toBeUndefined();
    expect(partner.realPhoto).toBeUndefined();
    expect(partner.role).toBeUndefined();
    expect(partner.tagline).toBeUndefined();
  });

  it('unlocks Layer 1 (Signals: City & Role) upon mutual consent', async () => {
    const res = await request(app)
      .post(`/api/matches/${matchId}/unmask/consent`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ stage: 1 });

    expect(res.status).toBe(200);
    expect(res.body.stage).toBeGreaterThanOrEqual(1);
    expect(res.body.partner.city).toBeDefined();
    expect(res.body.partner.role).toBeDefined();
    // Portrait and real name remain quarantined!
    expect(res.body.partner.realName).toBeUndefined();
    expect(res.body.partner.realPhoto).toBeUndefined();
  });

  it('unlocks Layer 2 (Resonance: Tagline) upon mutual consent', async () => {
    const res = await request(app)
      .post(`/api/matches/${matchId}/unmask/consent`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ stage: 2 });

    expect(res.status).toBe(200);
    expect(res.body.stage).toBeGreaterThanOrEqual(2);
    expect(res.body.partner.tagline).toBeDefined();
    // Portrait still quarantined
    expect(res.body.partner.realName).toBeUndefined();
  });

  it('unlocks Layer 3 (Decrypted: Verified Portrait & Legal Name)', async () => {
    const res = await request(app)
      .post(`/api/matches/${matchId}/unmask/consent`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ stage: 3 });

    expect(res.status).toBe(200);
    expect(res.body.stage).toBe(3);
    expect(res.body.partner.realName).toBe('Elena Rostova');
    expect(res.body.partner.realPhoto).toContain('unsplash');
  });

  it('rejects unmasking consent from unauthorized third-party user', async () => {
    // Generate different user token
    const otherRes = await request(app)
      .post('/api/auth/verify-otp')
      .send({ email: 'eavesdropper@rumr.io', code: '482910' });
    const rogueToken = otherRes.body.token;

    const res = await request(app)
      .post(`/api/matches/${matchId}/unmask/consent`)
      .set('Authorization', `Bearer ${rogueToken}`)
      .send({ stage: 1 });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('FORBIDDEN');
  });
});
