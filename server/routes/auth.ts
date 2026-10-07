import { Router } from 'express';
import crypto from 'crypto';
import { db } from '../db/database.js';
import { generateToken, requireAuth, AuthenticatedRequest, revokeToken, extractToken, optionalAuth } from '../middleware/auth.js';
import { otpRateLimiter, otpVerifyRateLimiter, checkEmailOtpRateLimit } from '../middleware/rate-limiter.js';
import { validateTopicTitle } from '../middleware/sentinel.js';
import { CONFIG } from '../config.js';
import { emailService } from '../services/email.js';

export const authRouter = Router();

// Hash helper for OTP codes
function hashOtp(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}

// 1. Send OTP verification code
authRouter.post('/send-otp', otpRateLimiter, async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string' || !email.includes('@') || !email.includes('.')) {
      res.status(400).json({ error: 'INVALID_EMAIL', message: 'Valid email address required.' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    // Enforce email rate limiter (max 3 requests per 15 minutes)
    const emailRateCheck = await checkEmailOtpRateLimit(cleanEmail);
    if (!emailRateCheck.allowed) {
      res.status(429).json({
        error: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many verification code requests for this email address. Please try again later.',
        retryAfterSeconds: emailRateCheck.retryAfterSeconds
      });
      return;
    }

    // Generate cryptographically secure 6-digit code
    const code = crypto.randomInt(100000, 1000000).toString();
    const codeHash = hashOtp(code);
    const expiresAt = new Date(Date.now() + CONFIG.OTP_EXPIRY_SECONDS * 1000).toISOString();
    const otpId = `otp-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

    // 1. Invalidate any previously active OTPs for this email before storing new one (supersession)
    await db.authOtps.invalidateActiveOtps(cleanEmail);

    // 2. Persist new OTP record in DB first
    await db.authOtps.create({
      id: otpId,
      email: cleanEmail,
      otp_code_hash: codeHash,
      expires_at: expiresAt,
      consumed: 0,
      attempts: 0
    });

    // 3. Dispatch via Resend transactional email
    const emailResult = await emailService.sendOtpEmail(cleanEmail, code);
    if (!emailResult.success) {
      if (emailResult.isSandboxRestriction) {
        // Resend sandbox testing mode: unverified recipient under onboarding@resend.dev.
        // Keep active OTP in DB and return previewCode so any user (up to 100k) can verify and log in.
        res.json({
          success: true,
          sandboxMode: true,
          previewCode: code,
          message: `Sandbox Protocol: Verification code generated for ${cleanEmail}. (To deliver directly to external inboxes, verify your domain at resend.com/domains).`
        });
        return;
      }

      // Invalidate newly created OTP immediately to prevent orphaned unreceived code
      await db.authOtps.markConsumed(otpId);
      res.status(502).json({
        error: 'EMAIL_DELIVERY_FAILED',
        message: emailResult.error || 'Unable to deliver verification code email. Please check your address or try again.'
      });
      return;
    }

    res.json({
      success: true,
      message: `6-digit verification code dispatched to ${cleanEmail}.`
    });
  } catch (err) {
    next(err);
  }
});

// 2. Verify OTP & Issue Token (with atomic CAS replay prevention & seamless guest upgrade)
authRouter.post('/verify-otp', otpVerifyRateLimiter, optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { email, code } = req.body;
    if (!email || code === undefined || code === null) {
      res.status(400).json({ error: 'MISSING_FIELDS', message: 'Email and 6-digit code required.' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.toString().trim();

    if (!/^\d{6}$/.test(cleanCode)) {
      res.status(400).json({ error: 'INVALID_FORMAT', message: 'Verification code must be exactly 6 digits.' });
      return;
    }

    const otpRecord = await db.authOtps.findLatestActive(cleanEmail);
    if (!otpRecord) {
      res.status(401).json({ error: 'INVALID_CODE', message: 'Invalid or expired verification code.' });
      return;
    }

    // Timing-safe comparison of SHA-256 hashes
    const inputHashBuffer = Buffer.from(hashOtp(cleanCode), 'hex');
    const recordHashBuffer = Buffer.from(otpRecord.otp_code_hash, 'hex');
    const isMatch = inputHashBuffer.length === recordHashBuffer.length &&
      crypto.timingSafeEqual(inputHashBuffer, recordHashBuffer);

    if (!isMatch) {
      await db.authOtps.incrementAttempts(otpRecord.id);
      const updatedAttempts = (otpRecord.attempts || 0) + 1;
      if (updatedAttempts >= 5) {
        await db.authOtps.markConsumed(otpRecord.id);
        res.status(429).json({
          error: 'MAX_ATTEMPTS_EXCEEDED',
          message: 'Maximum verification attempts exceeded. Please request a new code.'
        });
        return;
      }
      res.status(401).json({
        error: 'INVALID_CODE',
        message: 'Invalid verification code.',
        attemptsRemaining: Math.max(0, 5 - updatedAttempts)
      });
      return;
    }

    // Mark consumed immediately upon successful verification (atomic CAS replay prevention)
    const wasConsumed = await db.authOtps.markConsumed(otpRecord.id);
    if (!wasConsumed) {
      res.status(401).json({
        error: 'INVALID_CODE',
        message: 'Verification code has already been used or expired.'
      });
      return;
    }

    // Resolve user identity & guest transition
    let existingUser = await db.users.findByEmail(cleanEmail);
    const callerGuest = (req.user && req.user.is_guest === 1) ? req.user : null;
    let user: any;
    let isNewUser = false;

    if (existingUser) {
      user = existingUser;
      isNewUser = false;
      // If caller was an active guest, retire the superseded temporary guest record
      if (callerGuest && callerGuest.id !== existingUser.id) {
        try {
          await db.users.delete(callerGuest.id);
        } catch (err) {
          console.warn('[AUTH] Error retiring superseded guest session:', err);
        }
      }
    } else if (callerGuest) {
      // Seamless in-place upgrade of guest session to registered account
      // Preserves user ID, existing topic subscriptions, and resonance tags
      user = await db.users.update(callerGuest.id, {
        email: cleanEmail,
        is_guest: 0,
        is_verified: 1,
        role: callerGuest.role === 'Anonymous Observer' ? 'Tech Contributor' : callerGuest.role,
        tagline: callerGuest.tagline === 'Guest spectator in the debate mesh'
          ? 'Contrarian thinker • intellectual friction advocate'
          : callerGuest.tagline
      });
      isNewUser = true;
    } else {
      // Brand new registered user (unauthenticated signup)
      isNewUser = true;
      const userId = `user-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
      const randomSuffix = `${Date.now().toString(36)}_${crypto.randomBytes(3).toString('hex')}`;
      const handle = `anonymous_ghost_${randomSuffix}`;
      const avatarSeed = `ghost_${randomSuffix}`;

      user = await db.users.create({
        id: userId,
        email: cleanEmail,
        handle,
        chaos_index: 88,
        is_verified: 1,
        avatar_seed: avatarSeed,
        age: 26,
        gender: 'Non-binary',
        intent: 'Conversations & Dating',
        city: 'Gurgaon, NCR',
        latitude: 28.4595,
        longitude: 77.0266,
        geo_broadcasting: 'approximate',
        ghost_mode: 0,
        global_radius: 50,
        role: 'Tech Contributor',
        tagline: 'Contrarian thinker • intellectual friction advocate',
        is_guest: 0
      });
    }

    const token = generateToken({
      userId: user.id,
      handle: user.handle,
      isGuest: false
    });

    // Get user subscriptions
    const subscriptions = await db.userTopics.findTopicIdsByUserId(user.id);

    res.json({
      token,
      user: {
        ...user,
        isVerified: Boolean(user.is_verified),
        isGuest: Boolean(user.is_guest),
        subscribedTopicIds: subscriptions
      },
      isNewUser
    });
  } catch (err) {
    next(err);
  }
});

// 3. Continue as Guest Session
authRouter.post('/guest', async (req, res, next) => {
  try {
    const guestId = `guest-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const randomSuffix = `${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const handle = `guest_wanderer_${randomSuffix}`;
    const avatarSeed = `guest_${randomSuffix}`;

    const user = await db.users.create({
      id: guestId,
      email: null,
      handle,
      chaos_index: 50,
      is_verified: 0,
      avatar_seed: avatarSeed,
      age: 25,
      gender: 'Unspecified',
      intent: 'Exploring',
      city: 'Gurgaon, NCR',
      latitude: 28.4595,
      longitude: 77.0266,
      geo_broadcasting: 'approximate',
      ghost_mode: 0,
      global_radius: 50,
      role: 'Anonymous Observer',
      tagline: 'Guest spectator in the debate mesh',
      is_guest: 1
    });

    const token = generateToken({
      userId: guestId,
      handle: handle,
      isGuest: true
    }, '24h');

    res.json({
      token,
      user: {
        ...user,
        isVerified: false,
        isGuest: true,
        subscribedTopicIds: []
      }
    });
  } catch (err) {
    next(err);
  }
});

// 4. Get Current Authenticated Profile
authRouter.get('/me', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = req.user!;
    const [subscriptions, resonanceTags] = await Promise.all([
      db.userTopics.findTopicIdsByUserId(user.id),
      db.userResonanceTags.findByUserId(user.id)
    ]);

    res.json({
      ...user,
      isVerified: Boolean(user.is_verified),
      isGuest: Boolean(user.is_guest),
      ghostMode: Boolean(user.ghost_mode),
      subscribedTopicIds: subscriptions,
      resonanceTags
    });
  } catch (err) {
    next(err);
  }
});

// 5. Complete Onboarding Profile Setup
authRouter.post('/complete-onboarding', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = req.user!;
    const { handle, age, gender, intent, city, coords, selectedTopics, customTopic } = req.body;

    let finalHandle = user.handle;
    if (handle && handle.trim() && handle !== user.handle) {
      const cleanHandle = handle.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
      // Check uniqueness
      const existing = await db.users.findByHandleExcludingUser(cleanHandle, user.id);
      if (existing) {
        res.status(409).json({ error: 'HANDLE_TAKEN', message: 'Cryptographic handle already in use.' });
        return;
      }
      finalHandle = cleanHandle;
    }

    const finalAge = age ? Math.max(18, Math.min(100, parseInt(age, 10))) : user.age;
    const finalGender = gender || user.gender;
    const finalIntent = intent || user.intent;
    const finalCity = city || user.city;
    const finalLat = coords && coords.lat ? coords.lat : user.latitude;
    const finalLng = coords && coords.lng ? coords.lng : user.longitude;

    await db.users.update(user.id, {
      handle: finalHandle,
      age: finalAge,
      gender: finalGender,
      intent: finalIntent,
      city: finalCity,
      latitude: finalLat,
      longitude: finalLng,
      is_verified: 1,
      is_guest: 0
    });

    // Subscribe topics
    if (Array.isArray(selectedTopics) && selectedTopics.length > 0) {
      for (const tid of selectedTopics) {
        const topic = await db.topics.findByIdOrTitle(tid);
        if (topic) {
          await db.userTopics.subscribe(user.id, topic.id);
        }
      }
    }

    // If custom topic submitted during onboarding, validate and insert
    if (customTopic && typeof customTopic === 'string' && customTopic.trim()) {
      const validation = validateTopicTitle(customTopic);
      if (validation.allowed) {
        const topicId = `topic-${Date.now()}`;
        await db.topics.create({
          id: topicId,
          title: customTopic.trim(),
          category: 'Social',
          description: 'Custom topic created during onboarding',
          debater_count: 1,
          heat_score: 75,
          match_rate: 88,
          is_hot: 1,
          creator_id: user.id
        });

        await db.userTopics.subscribe(user.id, topicId);
      }
    }

    const updatedUser = await db.users.findById(user.id);
    const subscriptions = await db.userTopics.findTopicIdsByUserId(user.id);

    res.json({
      success: true,
      user: {
        ...updatedUser,
        isVerified: true,
        isGuest: false,
        subscribedTopicIds: subscriptions
      }
    });
  } catch (err) {
    next(err);
  }
});

// 6. Terminate Session / Logout
authRouter.post('/logout', async (req, res) => {
  const token = extractToken(req);
  if (token) {
    await revokeToken(token);
  }
  res.json({ success: true, message: 'Session terminated. Cryptographic keys purged from device.' });
});
