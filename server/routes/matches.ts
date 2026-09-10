import { Router } from 'express';
import { db } from '../db/database.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';

export const matchesRouter = Router();

// Sanitizer for partner persona respecting progressive cryptographic unmask stage
export function sanitizePartnerProfile(rawUser: any, unmaskStage: number) {
  const sanitized: any = {
    id: rawUser.id,
    handle: rawUser.handle,
    avatarSeed: rawUser.avatar_seed,
    age: rawUser.age,
    distance: `${rawUser.city ? rawUser.city.split(',')[0] : 'Gurgaon'} • 4 km away`,
    chaosIndex: rawUser.chaos_index,
    unmaskStage
  };

  // Stage 1: Signals (City & Role)
  if (unmaskStage >= 1) {
    sanitized.city = rawUser.city;
    sanitized.role = rawUser.role;
  }

  // Stage 2: Persona (Tagline, Worldview resonance)
  if (unmaskStage >= 2) {
    sanitized.tagline = rawUser.tagline;
  }

  // Stage 3: Decrypted (Real Photo & Legal Name)
  if (unmaskStage >= 3) {
    sanitized.realName = rawUser.real_name;
    sanitized.realPhoto = rawUser.real_photo;
  }

  return sanitized;
}

// 1. List All Active Mutual Matches
matchesRouter.get('/', requireAuth, (req: AuthenticatedRequest, res) => {
  const currentUserId = req.user!.id;

  const matches = db.prepare(`
    SELECT m.*,
      CASE WHEN m.user1_id = ? THEN m.user2_id ELSE m.user1_id END as partner_id
    FROM matches m
    WHERE (m.user1_id = ? OR m.user2_id = ?) AND m.status = 'active'
    ORDER BY m.updated_at DESC
  `).all(currentUserId, currentUserId, currentUserId) as any[];

  const matchesList = matches.map(m => {
    const rawPartner = db.prepare('SELECT * FROM users WHERE id = ?').get(m.partner_id) as any;
    const partner = sanitizePartnerProfile(rawPartner || {}, m.unmask_stage);

    // Get shared topics
    const shared = db.prepare(`
      SELECT t.title FROM topics t
      JOIN user_topics ut1 ON ut1.topic_id = t.id AND ut1.user_id = ?
      JOIN user_topics ut2 ON ut2.topic_id = t.id AND ut2.user_id = ?
    `).all(currentUserId, m.partner_id) as { title: string }[];

    const topics = shared.length > 0
      ? shared.map(s => s.title)
      : ['AI Layoffs vs Reality', 'Office Politics', 'Ghosting'];

    // Get latest message
    const latestMsg = db.prepare(`
      SELECT text, created_at FROM chat_messages
      WHERE match_id = ? AND expires_at > datetime('now')
      ORDER BY created_at DESC LIMIT 1
    `).get(m.id) as { text: string; created_at: string } | undefined;

    return {
      id: m.id,
      matchId: m.id,
      partnerId: m.partner_id,
      handle: partner.handle,
      age: partner.age,
      distance: partner.distance,
      compatibility: m.compatibility || 94,
      sharedCount: topics.length,
      topics,
      lastActive: 'Active now',
      isHot: true,
      opener: `What's worse: being ghosted or slowly faded out?`,
      lastMessage: latestMsg ? latestMsg.text : 'Encrypted topic tunnel active.',
      unmaskStage: m.unmask_stage,
      partner
    };
  });

  res.json({ matches: matchesList });
});

// 2. Get Specific Match Detail
matchesRouter.get('/:matchId', requireAuth, (req: AuthenticatedRequest, res) => {
  const currentUserId = req.user!.id;
  const { matchId } = req.params;

  const match = db.prepare(`
    SELECT * FROM matches WHERE id = ?
  `).get(matchId) as any;

  if (!match) {
    res.status(404).json({ error: 'MATCH_NOT_FOUND', message: 'Match node does not exist.' });
    return;
  }

  // Authorization check: must be participant
  if (match.user1_id !== currentUserId && match.user2_id !== currentUserId) {
    res.status(403).json({ error: 'FORBIDDEN', message: 'Not authorized to access this encrypted match tunnel.' });
    return;
  }

  const partnerId = match.user1_id === currentUserId ? match.user2_id : match.user1_id;
  const rawPartner = db.prepare('SELECT * FROM users WHERE id = ?').get(partnerId) as any;
  const partner = sanitizePartnerProfile(rawPartner, match.unmask_stage);

  // Get topic affinities
  const sharedTopics = db.prepare(`
    SELECT t.title FROM topics t
    JOIN user_topics ut1 ON ut1.topic_id = t.id AND ut1.user_id = ?
    JOIN user_topics ut2 ON ut2.topic_id = t.id AND ut2.user_id = ?
  `).all(currentUserId, partnerId) as { title: string }[];

  const affinities = (sharedTopics.length > 0 ? sharedTopics : [
    { title: 'AI Layoffs vs Reality' },
    { title: 'Office Politics' },
    { title: 'Stealth Whistleblowing' }
  ]).map((t, i) => ({
    topic: t.title,
    score: 95 - i * 6
  }));

  partner.affinities = affinities;

  res.json({
    match: {
      id: match.id,
      partnerId,
      compatibility: match.compatibility,
      unmaskStage: match.unmask_stage,
      partner
    }
  });
});

// 3. Unmatch / Delete Connection
matchesRouter.delete('/:matchId', requireAuth, (req: AuthenticatedRequest, res) => {
  const currentUserId = req.user!.id;
  const { matchId } = req.params;

  const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(matchId) as any;
  if (!match || (match.user1_id !== currentUserId && match.user2_id !== currentUserId)) {
    res.status(404).json({ error: 'NOT_FOUND', message: 'Match not found.' });
    return;
  }

  db.prepare('UPDATE matches SET status = "unmatched" WHERE id = ?').run(matchId);
  res.json({ success: true, message: 'Connection severed. Tunnel erased.' });
});
