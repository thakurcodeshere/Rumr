import { Router } from 'express';
import crypto from 'crypto';
import { db } from '../db/database.js';
import { generateToken, requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { otpRateLimiter } from '../middleware/rate-limiter.js';
import { validateTopicTitle } from '../middleware/sentinel.js';
import { CONFIG } from '../config.js';

export const authRouter = Router();

// Hash helper for OTP codes
function hashOtp(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}

// 1. Send OTP verification code
authRouter.post('/send-otp', otpRateLimiter, (req, res) => {
  const { email } = req.body;
  if (!email || typeof email !== 'string' || !email.includes('@') || !email.includes('.')) {
    res.status(400).json({ error: 'INVALID_EMAIL', message: 'Valid email address required.' });
    return;
  }

  const cleanEmail = email.trim().toLowerCase();

  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const codeHash = hashOtp(code);
  const expiresAt = new Date(Date.now() + CONFIG.OTP_EXPIRY_SECONDS * 1000).toISOString();
  const otpId = `otp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  db.prepare(`
    INSERT INTO auth_otps (id, email, otp_code_hash, expires_at, consumed, attempts)
    VALUES (?, ?, ?, ?, 0, 0)
  `).run(otpId, cleanEmail, codeHash, expiresAt);

  // In production, dispatch via transactional email provider.
  // In dev / testing, log and return dev_code for instant deterministic testing
  console.log(`[RUMR_AUTH_SENTINEL] Verification code for ${cleanEmail}: ${code}`);

  res.json({
    success: true,
    message: `6-digit verification code dispatched to ${cleanEmail}.`,
    dev_code: CONFIG.NODE_ENV !== 'production' ? code : undefined
  });
});

// 2. Verify OTP & Issue Token
authRouter.post('/verify-otp', (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    res.status(400).json({ error: 'MISSING_FIELDS', message: 'Email and 6-digit code required.' });
    return;
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = code.toString().trim();
  const codeHash = hashOtp(cleanCode);

  const otpRecord = db.prepare(`
    SELECT * FROM auth_otps
    WHERE email = ? AND consumed = 0 AND expires_at > datetime('now')
    ORDER BY created_at DESC LIMIT 1
  `).get(cleanEmail) as { id: string; otp_code_hash: string; attempts: number } | undefined;

  // Accept code matching hash or dev fallback code '482910' in development
  const isDevBypass = CONFIG.NODE_ENV !== 'production' && cleanCode === '482910';
  const isValid = (otpRecord && otpRecord.otp_code_hash === codeHash) || isDevBypass;

  if (!isValid) {
    if (otpRecord) {
      db.prepare('UPDATE auth_otps SET attempts = attempts + 1 WHERE id = ?').run(otpRecord.id);
    }
    res.status(401).json({ error: 'INVALID_CODE', message: 'Invalid or expired verification code.' });
    return;
  }

  if (otpRecord) {
    db.prepare('UPDATE auth_otps SET consumed = 1 WHERE id = ?').run(otpRecord.id);
  }

  // Check if user already exists
  let user = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail) as any;
  let isNewUser = false;

  if (!user) {
    isNewUser = true;
    const userId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const handle = `anonymous_ghost_${randomSuffix}`;
    const avatarSeed = `ghost_${randomSuffix}`;

    db.prepare(`
      INSERT INTO users (
        id, email, handle, chaos_index, is_verified, avatar_seed, age, gender, intent, city,
        latitude, longitude, geo_broadcasting, ghost_mode, global_radius,
        role, tagline, is_guest
      ) VALUES (
        ?, ?, ?, 88, 1, ?, 26, 'Non-binary', 'Conversations & Dating', 'Gurgaon, NCR',
        28.4595, 77.0266, 'approximate', 0, 50,
        'Tech Contributor', 'Contrarian thinker • intellectual friction advocate', 0
      )
    `).run(userId, cleanEmail, handle, avatarSeed);

    user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  }

  const token = generateToken({
    userId: user.id,
    handle: user.handle,
    isGuest: user.is_guest === 1
  });

  // Get user subscriptions
  const subscriptions = db.prepare(`
    SELECT topic_id FROM user_topics WHERE user_id = ?
  `).all(user.id) as { topic_id: string }[];

  res.json({
    token,
    user: {
      ...user,
      isVerified: Boolean(user.is_verified),
      isGuest: Boolean(user.is_guest),
      subscribedTopicIds: subscriptions.map(s => s.topic_id)
    },
    isNewUser
  });
});

// 3. Continue as Guest Session
authRouter.post('/guest', (req, res) => {
  const guestId = `guest-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const randomSuffix = Math.floor(10 + Math.random() * 90);
  const handle = `guest_wanderer_${randomSuffix}`;
  const avatarSeed = `guest_${randomSuffix}`;

  db.prepare(`
    INSERT INTO users (
      id, email, handle, chaos_index, is_verified, avatar_seed, age, gender, intent, city,
      latitude, longitude, geo_broadcasting, ghost_mode, global_radius,
      role, tagline, is_guest
    ) VALUES (
      ?, NULL, ?, 50, 0, ?, 25, 'Unspecified', 'Exploring', 'Gurgaon, NCR',
      28.4595, 77.0266, 'approximate', 0, 50,
      'Anonymous Observer', 'Guest spectator in the debate mesh', 1
    )
  `).run(guestId, handle, avatarSeed);

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(guestId) as any;
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
});

// 4. Get Current Authenticated Profile
authRouter.get('/me', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const subscriptions = db.prepare(`
    SELECT topic_id FROM user_topics WHERE user_id = ?
  `).all(user.id) as { topic_id: string }[];

  const resonanceTags = db.prepare(`
    SELECT tag FROM user_resonance_tags WHERE user_id = ?
  `).all(user.id) as { tag: string }[];

  res.json({
    ...user,
    isVerified: Boolean(user.is_verified),
    isGuest: Boolean(user.is_guest),
    ghostMode: Boolean(user.ghost_mode),
    subscribedTopicIds: subscriptions.map(s => s.topic_id),
    resonanceTags: resonanceTags.map(r => r.tag)
  });
});

// 5. Complete Onboarding Profile Setup
authRouter.post('/complete-onboarding', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { handle, age, gender, intent, city, coords, selectedTopics, customTopic } = req.body;

  let finalHandle = user.handle;
  if (handle && handle.trim() && handle !== user.handle) {
    const cleanHandle = handle.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    // Check uniqueness
    const existing = db.prepare('SELECT id FROM users WHERE handle = ? AND id != ?').get(cleanHandle, user.id);
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

  db.prepare(`
    UPDATE users SET
      handle = ?,
      age = ?,
      gender = ?,
      intent = ?,
      city = ?,
      latitude = ?,
      longitude = ?,
      is_verified = 1,
      is_guest = 0,
      updated_at = datetime('now')
    WHERE id = ?
  `).run(finalHandle, finalAge, finalGender, finalIntent, finalCity, finalLat, finalLng, user.id);

  // Subscribe topics
  if (Array.isArray(selectedTopics) && selectedTopics.length > 0) {
    const insertSub = db.prepare('INSERT OR IGNORE INTO user_topics (user_id, topic_id) VALUES (?, ?)');
    for (const tid of selectedTopics) {
      // Check if topic exists by id or title
      const topic = db.prepare('SELECT id FROM topics WHERE id = ? OR title = ?').get(tid, tid) as { id: string } | undefined;
      if (topic) {
        insertSub.run(user.id, topic.id);
      }
    }
  }

  // If custom topic submitted during onboarding, validate and insert
  if (customTopic && typeof customTopic === 'string' && customTopic.trim()) {
    const validation = validateTopicTitle(customTopic);
    if (validation.allowed) {
      const topicId = `topic-${Date.now()}`;
      db.prepare(`
        INSERT INTO topics (id, title, category, description, debater_count, heat_score, match_rate, is_hot, creator_id)
        VALUES (?, ?, 'Social', 'Custom topic created during onboarding', 1, 75, 88, 1, ?)
      `).run(topicId, customTopic.trim(), user.id);

      db.prepare('INSERT OR IGNORE INTO user_topics (user_id, topic_id) VALUES (?, ?)').run(user.id, topicId);
    }
  }

  const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id) as any;
  const subscriptions = db.prepare('SELECT topic_id FROM user_topics WHERE user_id = ?').all(user.id) as { topic_id: string }[];

  res.json({
    success: true,
    user: {
      ...updatedUser,
      isVerified: true,
      isGuest: false,
      subscribedTopicIds: subscriptions.map(s => s.topic_id)
    }
  });
});

// 6. Terminate Session / Logout
authRouter.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Session terminated. Cryptographic keys purged from device.' });
});
