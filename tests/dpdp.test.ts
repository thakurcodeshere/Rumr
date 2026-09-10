import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../server/index.js';

describe('DPDP 2023 Compliance & User Data Rights API', () => {
  let authToken: string;

  beforeAll(async () => {
    const authRes = await request(app)
      .post('/api/auth/verify-otp')
      .send({ email: 'dpdp.principal@rumr.io', code: '482910' });
    authToken = authRes.body.token;
  });

  it('injects 3-word uppercase resonance tag into profile', async () => {
    const res = await request(app)
      .post('/api/users/me/rumors')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ tag: 'OFFICE POLITICS' });

    expect(res.status).toBe(200);
    expect(res.body.activeRumors).toContain('OFFICE_POLITICS');
  });

  it('updates ghost mode and discovery radius', async () => {
    const res = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ ghostMode: true, globalRadius: 75 });

    expect(res.status).toBe(200);
    expect(res.body.user.ghostMode).toBe(true);
    expect(res.body.user.global_radius).toBe(75);
  });

  it('generates machine-readable DPDP archive', async () => {
    const res = await request(app)
      .get('/api/users/me/dpdp-export')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.header['content-type']).toContain('application/json');
    expect(res.body.legalStandard).toContain('Digital Personal Data Protection');
    expect(res.body.dataPrincipal).toBeDefined();
    expect(res.body.activityTelemetry).toBeDefined();
  });

  it('executes statutory erasure (Right to be Forgotten)', async () => {
    const res = await request(app)
      .delete('/api/users/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Subsequent access returns 401
    const checkRes = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(checkRes.status).toBe(401);
  });
});
