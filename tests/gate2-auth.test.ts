import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../server/index.js';
import { db } from '../server/db/database.js';
import { validateJwtSecret } from '../server/config.js';
import { emailService, getLatestMockEmailCode, clearMockEmailJournal } from '../server/services/email.js';
import { generateToken } from '../server/middleware/auth.js';
import { resetRateLimits } from '../server/middleware/rate-limiter.js';
import { createTestUserToken } from './test-auth-helper.js';

describe('Gate 2 Security Test Matrix: Authentication, Sessions & Secrets', () => {
  beforeEach(() => {
    clearMockEmailJournal();
    resetRateLimits();
  });

  describe('1. OTP Security & Lifecycle Invariants', () => {
    it('dispatches cryptographically secure 6-digit OTP without returning code or dev_code in response', async () => {
      const email = `gate2.test.${Date.now()}@rumr.io`;
      const res = await request(app)
        .post('/api/auth/send-otp')
        .send({ email });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.dev_code).toBeUndefined();
      expect(res.body.code).toBeUndefined();

      const dispatched = getLatestMockEmailCode(email);
      expect(dispatched).toBeDefined();
      expect(dispatched).toMatch(/^\d{6}$/);
    });

    it('rejects invalid OTP code format (not 6 digits)', async () => {
      const email = `gate2.format.${Date.now()}@rumr.io`;
      await request(app).post('/api/auth/send-otp').send({ email });

      const res1 = await request(app).post('/api/auth/verify-otp').send({ email, code: '123' });
      expect(res1.status).toBe(400);
      expect(res1.body.error).toBe('INVALID_FORMAT');

      const res2 = await request(app).post('/api/auth/verify-otp').send({ email, code: 'abcdef' });
      expect(res2.status).toBe(400);
      expect(res2.body.error).toBe('INVALID_FORMAT');
    });

    it('rejects wrong OTP code with 401 INVALID_CODE and tracks attempts', async () => {
      const email = `gate2.wrong.${Date.now()}@rumr.io`;
      await request(app).post('/api/auth/send-otp').send({ email });

      const res = await request(app)
        .post('/api/auth/verify-otp')
        .send({ email, code: '999999' });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('INVALID_CODE');
      expect(res.body.attemptsRemaining).toBe(4);
    });

    it('enforces single-use replay prevention (consumed OTP cannot be reused)', async () => {
      const email = `gate2.replay.${Date.now()}@rumr.io`;
      await request(app).post('/api/auth/send-otp').send({ email });
      const code = getLatestMockEmailCode(email)!;

      // First verification: success
      const firstRes = await request(app)
        .post('/api/auth/verify-otp')
        .send({ email, code });
      expect(firstRes.status).toBe(200);
      expect(firstRes.body.token).toBeDefined();

      // Second verification with identical code: rejected
      const replayRes = await request(app)
        .post('/api/auth/verify-otp')
        .send({ email, code });
      expect(replayRes.status).toBe(401);
      expect(replayRes.body.error).toBe('INVALID_CODE');
    });

    it('enforces supersession invariant (requesting new OTP invalidates previous active OTP)', async () => {
      const email = `gate2.supersede.${Date.now()}@rumr.io`;

      // Request first OTP
      await request(app).post('/api/auth/send-otp').send({ email });
      const firstCode = getLatestMockEmailCode(email)!;

      // Request second OTP
      await request(app).post('/api/auth/send-otp').send({ email });
      const secondCode = getLatestMockEmailCode(email)!;
      expect(secondCode).toBeDefined();

      // Attempt verification with firstCode (should be superseded and invalid)
      const oldRes = await request(app)
        .post('/api/auth/verify-otp')
        .send({ email, code: firstCode });
      expect(oldRes.status).toBe(401);
      expect(oldRes.body.error).toBe('INVALID_CODE');

      // Attempt verification with secondCode (active, should succeed)
      const newRes = await request(app)
        .post('/api/auth/verify-otp')
        .send({ email, code: secondCode });
      expect(newRes.status).toBe(200);
      expect(newRes.body.token).toBeDefined();
    });

    it('locks out after 5 consecutive failed attempts (MAX_ATTEMPTS_EXCEEDED)', async () => {
      const email = `gate2.lockout.${Date.now()}@rumr.io`;
      await request(app).post('/api/auth/send-otp').send({ email });
      const validCode = getLatestMockEmailCode(email)!;

      // Attempts 1 to 4: rejected with INVALID_CODE
      for (let i = 1; i <= 4; i++) {
        const failRes = await request(app)
          .post('/api/auth/verify-otp')
          .send({ email, code: '000000' });
        expect(failRes.status).toBe(401);
        expect(failRes.body.attemptsRemaining).toBe(5 - i);
      }

      // Attempt 5: triggers MAX_ATTEMPTS_EXCEEDED
      const fifthRes = await request(app)
        .post('/api/auth/verify-otp')
        .send({ email, code: '000000' });
      expect(fifthRes.status).toBe(429);
      expect(fifthRes.body.error).toBe('MAX_ATTEMPTS_EXCEEDED');

      // Attempt 6 with valid code: still locked out because record was consumed/invalidated
      const postLockoutRes = await request(app)
        .post('/api/auth/verify-otp')
        .send({ email, code: validCode });
      expect(postLockoutRes.status).toBe(401);
      expect(postLockoutRes.body.error).toBe('INVALID_CODE');
    });

    it('enforces email rate limit (max 3 requests per window)', async () => {
      const email = `gate2.ratelimit.${Date.now()}@rumr.io`;

      const res1 = await request(app).post('/api/auth/send-otp').send({ email });
      expect(res1.status).toBe(200);

      const res2 = await request(app).post('/api/auth/send-otp').send({ email });
      expect(res2.status).toBe(200);

      const res3 = await request(app).post('/api/auth/send-otp').send({ email });
      expect(res3.status).toBe(200);

      const res4 = await request(app).post('/api/auth/send-otp').send({ email });
      expect(res4.status).toBe(429);
      expect(res4.body.error).toBe('RATE_LIMIT_EXCEEDED');
    });
  });

  describe('2. JWT & Session Security Lifecycle', () => {
    it('authenticates valid token and allows access to /api/users/me', async () => {
      const auth = await createTestUserToken({ email: `valid.session.${Date.now()}@rumr.io` });

      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${auth.token}`);

      expect(res.status).toBe(200);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.id).toBe(auth.userId);
    });

    it('rejects tampered or forged JWT tokens', async () => {
      const auth = await createTestUserToken({ email: `tamper.test.${Date.now()}@rumr.io` });
      const forgedToken = auth.token.substring(0, auth.token.length - 6) + 'abcdef';

      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${forgedToken}`);

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('INVALID_TOKEN');
    });

    it('rejects missing or malformed authorization headers', async () => {
      const res1 = await request(app).get('/api/users/me');
      expect(res1.status).toBe(401);
      expect(res1.body.error).toBe('UNAUTHORIZED');

      const res2 = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'InvalidFormatHeader');
      expect(res2.status).toBe(401);
      expect(res2.body.error).toBe('UNAUTHORIZED');
    });

    it('enforces server-side session revocation on logout', async () => {
      const auth = await createTestUserToken({ email: `logout.test.${Date.now()}@rumr.io` });

      // Pre-logout: valid access
      const preRes = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${auth.token}`);
      expect(preRes.status).toBe(200);

      // Perform logout
      const logoutRes = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${auth.token}`);
      expect(logoutRes.status).toBe(200);

      // Post-logout: token must be rejected as revoked
      const postRes = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${auth.token}`);
      expect(postRes.status).toBe(401);
      expect(postRes.body.error).toBe('TOKEN_REVOKED');
    });

    it('rejects valid token if underlying user record was deleted (DPDP erasure)', async () => {
      const auth = await createTestUserToken({ email: `deleted.user.${Date.now()}@rumr.io` });

      // Delete user directly from DB
      await db.users.delete(auth.userId);

      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${auth.token}`);

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('USER_NOT_FOUND');
    });
  });

  describe('3. Production Fail-Closed Guards & Secret Hygiene', () => {
    it('throws fatal error if JWT_SECRET is missing in production mode', () => {
      expect(() => {
        validateJwtSecret('', true);
      }).toThrow('[FATAL_PRODUCTION_VIOLATION]');
    });

    it('throws fatal error if JWT_SECRET matches legacy fallback in production mode', () => {
      expect(() => {
        validateJwtSecret('rumr-cryptographic-mesh-secret-key-2026-dpdp-ready', true);
      }).toThrow('[FATAL_PRODUCTION_VIOLATION] Insecure legacy JWT_SECRET fallback detected in production.');
    });

    it('throws fatal error if JWT_SECRET has insufficient entropy (< 32 chars) in production mode', () => {
      expect(() => {
        validateJwtSecret('short-secret-key', true);
      }).toThrow('[FATAL_PRODUCTION_VIOLATION] JWT_SECRET in production must have at least 32 characters of high entropy.');
    });

    it('accepts compliant high-entropy JWT_SECRET in production mode', () => {
      const validSecret = 'a-super-secure-production-jwt-mesh-secret-key-with-high-entropy-2026';
      expect(validateJwtSecret(validSecret, true)).toBe(validSecret);
    });

    it('fails closed in production mode if Resend is unconfigured', async () => {
      const prevEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      try {
        const result = await emailService.sendOtpEmail('test@production.rumr.io', '123456');
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      } finally {
        process.env.NODE_ENV = prevEnv;
      }
    });
  });

  describe('4. Guest Session Upgrade & Identity Lifecycle', () => {
    it('seamlessly upgrades guest to registered account in-place, preserving user ID and subscriptions', async () => {
      // 1. Create guest session
      const guestRes = await request(app).post('/api/auth/guest');
      expect(guestRes.status).toBe(200);
      const guestToken = guestRes.body.token;
      const guestUser = guestRes.body.user;
      expect(guestUser.isGuest).toBe(true);

      // 2. Guest subscribes to a topic
      const allTopics = await db.topics.findAll();
      const testTopicId = allTopics.length > 0
        ? allTopics[0].id
        : (await db.topics.create({ id: `top-${Date.now()}`, title: 'AI Ethics', category: 'Tech' })).id;

      await db.userTopics.subscribe(guestUser.id, testTopicId);
      const guestSubs = await db.userTopics.findTopicIdsByUserId(guestUser.id);
      expect(guestSubs).toContain(testTopicId);

      // 3. Guest receives and verifies OTP with new email
      const newEmail = `guest.upgrade.${Date.now()}@rumr.io`;
      await request(app).post('/api/auth/send-otp').send({ email: newEmail });
      const code = getLatestMockEmailCode(newEmail)!;

      const verifyRes = await request(app)
        .post('/api/auth/verify-otp')
        .set('Authorization', `Bearer ${guestToken}`)
        .send({ email: newEmail, code });

      expect(verifyRes.status).toBe(200);
      expect(verifyRes.body.isNewUser).toBe(true);
      expect(verifyRes.body.user.id).toBe(guestUser.id); // Same user ID preserved!
      expect(verifyRes.body.user.email).toBe(newEmail);
      expect(verifyRes.body.user.isGuest).toBe(false);
      expect(verifyRes.body.user.isVerified).toBe(true);
      expect(verifyRes.body.user.subscribedTopicIds).toContain(testTopicId); // Subscriptions preserved!

      // 4. Verify DB state directly
      const dbUser = await db.users.findById(guestUser.id);
      expect(dbUser).toBeDefined();
      expect(dbUser!.is_guest).toBe(0);
      expect(dbUser!.is_verified).toBe(1);
      expect(dbUser!.email).toBe(newEmail);
    });

    it('retires transient guest account when verifying with an existing registered email', async () => {
      // 1. Create existing registered user
      const existingEmail = `existing.account.${Date.now()}@rumr.io`;
      await request(app).post('/api/auth/send-otp').send({ email: existingEmail });
      const regCode = getLatestMockEmailCode(existingEmail)!;
      const initialRegRes = await request(app)
        .post('/api/auth/verify-otp')
        .send({ email: existingEmail, code: regCode });
      expect(initialRegRes.status).toBe(200);
      const registeredUserId = initialRegRes.body.user.id;

      // 2. Later, user browses anonymously in a guest session
      const guestRes = await request(app).post('/api/auth/guest');
      const guestToken = guestRes.body.token;
      const guestId = guestRes.body.user.id;
      expect(guestId).not.toBe(registeredUserId);

      // 3. Guest logs in with existing account email
      await request(app).post('/api/auth/send-otp').send({ email: existingEmail });
      const loginCode = getLatestMockEmailCode(existingEmail)!;

      const loginRes = await request(app)
        .post('/api/auth/verify-otp')
        .set('Authorization', `Bearer ${guestToken}`)
        .send({ email: existingEmail, code: loginCode });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.isNewUser).toBe(false);
      expect(loginRes.body.user.id).toBe(registeredUserId); // Authenticated as registered user
      expect(loginRes.body.user.email).toBe(existingEmail);

      // 4. Transient guest record must be completely cleaned up from DB (no orphan)
      const orphanCheck = await db.users.findById(guestId);
      expect(orphanCheck).toBeNull();
    });
  });

  describe('5. Concurrency, Failure Ordering & CAS Invariants', () => {
    it('guarantees atomic CAS replay prevention under concurrent OTP verifications', async () => {
      const email = `concurrent.cas.${Date.now()}@rumr.io`;
      await request(app).post('/api/auth/send-otp').send({ email });
      const code = getLatestMockEmailCode(email)!;

      // Fire 2 concurrent verification attempts with the exact same valid code
      const [res1, res2] = await Promise.all([
        request(app).post('/api/auth/verify-otp').send({ email, code }),
        request(app).post('/api/auth/verify-otp').send({ email, code })
      ]);

      const statuses = [res1.status, res2.status].sort();
      // Exactly one must succeed with 200, and one must be rejected with 401
      expect(statuses).toEqual([200, 401]);

      const successRes = res1.status === 200 ? res1 : res2;
      const failRes = res1.status === 401 ? res1 : res2;

      expect(successRes.body.token).toBeDefined();
      expect(failRes.body.error).toBe('INVALID_CODE');
    });

    it('burns newly created OTP in DB if email dispatch fails (prevents orphaned active OTPs)', async () => {
      const email = `fail.delivery.${Date.now()}@rumr.io`;

      // Mock emailService.sendOtpEmail temporarily to fail
      const originalSend = emailService.sendOtpEmail;
      emailService.sendOtpEmail = async () => ({
        success: false,
        error: 'Simulated downstream Resend rate limit / network error'
      });

      try {
        const res = await request(app).post('/api/auth/send-otp').send({ email });
        expect(res.status).toBe(502);
        expect(res.body.error).toBe('EMAIL_DELIVERY_FAILED');

        // Verify that NO active OTP exists in DB for this email
        const activeOtp = await db.authOtps.findLatestActive(email);
        expect(activeOtp).toBeNull();
      } finally {
        emailService.sendOtpEmail = originalSend;
      }
    });

    it('returns sandboxMode and previewCode when Resend indicates sandbox domain restriction', async () => {
      const email = `sandbox.user.${Date.now()}@rumr.io`;

      const originalSend = emailService.sendOtpEmail;
      emailService.sendOtpEmail = async () => ({
        success: false,
        isSandboxRestriction: true,
        error: 'You can only send testing emails to your own email address'
      });

      try {
        const res = await request(app).post('/api/auth/send-otp').send({ email });
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.sandboxMode).toBe(true);
        expect(res.body.previewCode).toMatch(/^\d{6}$/);

        // Verify active OTP is retained in DB and can be verified
        const activeOtp = await db.authOtps.findLatestActive(email);
        expect(activeOtp).not.toBeNull();

        // Verify with the previewCode
        const verifyRes = await request(app).post('/api/auth/verify-otp').send({
          email,
          code: res.body.previewCode
        });
        expect(verifyRes.status).toBe(200);
        expect(verifyRes.body.token).toBeDefined();
      } finally {
        emailService.sendOtpEmail = originalSend;
      }
    });
  });
});
