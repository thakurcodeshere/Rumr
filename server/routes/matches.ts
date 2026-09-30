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
matchesRouter.get('/', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const currentUserId = req.user!.id;
    const matches = await db.matches.findActiveByUserId(currentUserId);

    const matchesList = await Promise.all(matches.map(async m => {
      const rawPartner = await db.users.findById(m.partner_id);
      const partner = sanitizePartnerProfile(rawPartner || {}, m.unmask_stage);

      // Get shared topics
      const shared = await db.userTopics.findSharedTopics(currentUserId, m.partner_id);

      const topics = shared.length > 0
        ? shared.map(s => s.title)
        : ['AI Layoffs vs Reality', 'Office Politics', 'Ghosting'];

      // Get latest message
      const latestMsg = await db.chatMessages.getLatestByMatchId(m.id);

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
    }));

    res.json({ matches: matchesList });
  } catch (err) {
    next(err);
  }
});

// 2. Get Specific Match Detail
matchesRouter.get('/:matchId', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const currentUserId = req.user!.id;
    const { matchId } = req.params;

    const match = await db.matches.findById(matchId);

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
    const rawPartner = await db.users.findById(partnerId);
    const partner = sanitizePartnerProfile(rawPartner || {}, match.unmask_stage);

    // Get topic affinities
    const sharedTopics = await db.userTopics.findSharedTopics(currentUserId, partnerId);

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
  } catch (err) {
    next(err);
  }
});

// 3. Unmatch / Delete Connection
matchesRouter.delete('/:matchId', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const currentUserId = req.user!.id;
    const { matchId } = req.params;

    const match = await db.matches.findById(matchId);
    if (!match || (match.user1_id !== currentUserId && match.user2_id !== currentUserId)) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Match not found.' });
      return;
    }

    await db.matches.updateStatus(matchId, 'unmatched');
    res.json({ success: true, message: 'Connection severed. Tunnel erased.' });
  } catch (err) {
    next(err);
  }
});
