import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../server/index.js';

describe('Topics Taxonomy & Hard Constraint Sentinel API', () => {
  let authToken: string;

  beforeAll(async () => {
    const authRes = await request(app)
      .post('/api/auth/verify-otp')
      .send({ email: 'topic.creator@rumr.io', code: '482910' });
    authToken = authRes.body.token;
  });

  it('lists existing topics with category and heat scores', async () => {
    const res = await request(app).get('/api/topics');
    expect(res.status).toBe(200);
    expect(res.body.topics).toBeDefined();
    expect(res.body.topics.length).toBeGreaterThanOrEqual(8);
  });

  it('server-side AI Sentinel rejects topic titles with more than 3 words (422)', async () => {
    const res = await request(app)
      .post('/api/topics')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'This Topic Title Has Six Words Now',
        category: 'Workplace'
      });

    expect(res.status).toBe(422);
    expect(res.body.error).toBe('AI_SENTINEL_VIOLATION');
    expect(res.body.message).toContain('Maximum 3 words allowed');
  });

  it('server-side AI Sentinel intercepts personal targeted accusations (422)', async () => {
    const res = await request(app)
      .post('/api/topics')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Rahul cheated today',
        category: 'Social'
      });

    expect(res.status).toBe(422);
    expect(res.body.error).toBe('AI_SENTINEL_VIOLATION');
    expect(res.body.message).toContain('Personal accusations/targeting not permitted');
  });

  it('approves and creates valid <= 3 words custom topic node', async () => {
    const res = await request(app)
      .post('/api/topics')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Why People Ghost',
        category: 'Social',
        description: 'Debate on ghosting culture'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.topic.title).toBe('Why People Ghost');
    expect(res.body.topic.isSubscribed).toBe(true);
  });

  it('toggles subscription idempotently', async () => {
    // 1. First toggle subscribes
    const res1 = await request(app)
      .post('/api/topics/topic-1/subscribe')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res1.status).toBe(200);
    expect(res1.body.isSubscribed).toBe(true);

    // 2. Second toggle unsubscribes
    const res2 = await request(app)
      .post('/api/topics/topic-1/subscribe')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res2.status).toBe(200);
    expect(res2.body.isSubscribed).toBe(false);
  });
});
