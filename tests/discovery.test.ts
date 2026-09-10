import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../server/index.js';

describe('Discovery Feed & Mutual Matching API', () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    const testEmail = `swiper.user.${Date.now()}@rumr.io`;
    const res = await request(app)
      .post('/api/auth/verify-otp')
      .send({ email: testEmail, code: '482910' });

    authToken = res.body.token;
    userId = res.body.user.id;
  });

  it('generates discovery cards deck with real topic overlap and distance', async () => {
    const res = await request(app)
      .post('/api/discovery/feed')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        minAge: 18,
        maxAge: 45,
        gender: 'everyone',
        radius: 100,
        similarityMode: 'balanced'
      });

    expect(res.status).toBe(200);
    expect(res.body.cards).toBeDefined();
    expect(res.body.cards.length).toBeGreaterThan(0);

    const firstCard = res.body.cards[0];
    expect(firstCard.primaryTopic).toBeDefined();
    expect(firstCard.sharedOverlapCount).toBeDefined();
    expect(firstCard.compatibilityScore).toBeGreaterThanOrEqual(65);
  });

  it('handles pass swipe without creating match', async () => {
    const res = await request(app)
      .post('/api/discovery/swipe')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ targetUserId: 'user-partner-2', direction: 'pass' });

    expect(res.status).toBe(200);
    expect(res.body.isMatch).toBe(false);
  });

  it('establishes mutual match on like swipe with seed partner', async () => {
    const res = await request(app)
      .post('/api/discovery/swipe')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ targetUserId: 'user-partner-1', direction: 'like' });

    expect(res.status).toBe(200);
    expect(res.body.isMatch).toBe(true);
    expect(res.body.matchId).toBeDefined();
    expect(res.body.partnerHandle).toBe('cipher_vanguard');
    expect(res.body.overlappingTopics).toBeDefined();
  });
});
