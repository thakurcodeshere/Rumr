import { Router } from 'express';
import { db } from '../db/database.js';
import { requireAuth, requireRegistered, AuthenticatedRequest } from '../middleware/auth.js';

export const discoveryRouter = Router();

// Haversine distance in kilometers
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// 1. Get Topic-First Discovery Feed Cards
discoveryRouter.post('/feed', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const currentUserId = req.user!.id;
    const userLat = req.user!.latitude || 28.4595;
    const userLng = req.user!.longitude || 77.0266;

    const {
      minAge = 18,
      maxAge = 45,
      gender = 'everyone',
      proximity = 'nearby',
      radius = req.user!.global_radius || 50,
      similarityMode = 'balanced',
      mandatoryTopics = []
    } = req.body;

    // Get current user's subscribed topic IDs
    const myTopics = await db.userTopics.findTopicIdsByUserId(currentUserId);
    const myTopicIds = new Set(myTopics);

    // Find candidate users
    const candidates = await db.users.findDiscoveryCandidates({
      currentUserId,
      minAge: Number(minAge),
      maxAge: Number(maxAge),
      gender: String(gender)
    });

    // Process candidates and compute topic overlap and distance
    const cards: any[] = [];

    for (const c of candidates) {
      const dist = calculateDistanceKm(userLat, userLng, c.latitude || 28.4595, c.longitude || 77.0266);
      if (proximity === 'nearby' && dist > radius) {
        continue;
      }

      // Get candidate's subscribed topics
      const candidateTopics = await db.userTopics.findTopicsByUserId(c.id);

      // Calculate overlap
      const overlaps = candidateTopics.filter(t => myTopicIds.has(t.id));
      const overlapCount = overlaps.length;

      // Check mandatory topics if specified
      if (mandatoryTopics.length > 0) {
        const hasMandatory = candidateTopics.some(t =>
          mandatoryTopics.some((m: string) => t.title.toUpperCase().replace(/\s+/g, '_') === m.toUpperCase())
        );
        if (!hasMandatory) continue;
      }

      // Calculate compatibility score
      let baseScore = 75;
      if (overlapCount > 0) {
        baseScore += Math.min(overlapCount * 5, 20);
      }
      // Chaos index proximity bonus
      const chaosDelta = Math.abs(req.user!.chaos_index - c.chaos_index);
      if (similarityMode === 'exploratory') {
        // Contrarian mode rewards chaos tension
        baseScore += Math.min(Math.floor(chaosDelta / 5), 8);
      } else {
        baseScore += Math.max(0, 8 - Math.floor(chaosDelta / 6));
      }
      const compatibilityScore = Math.min(99, Math.max(65, baseScore));

      // Choose primary topic (highest heat or first overlap)
      const primaryTopicObj = overlaps[0] || candidateTopics[0] || {
        title: 'OFFICE POLITICS',
        category: 'Workplace'
      };

      const subTopics = candidateTopics
        .filter(t => t.id !== primaryTopicObj.id)
        .map(t => t.title)
        .slice(0, 3);

      cards.push({
        id: `card-${c.id}`,
        targetUserId: c.id,
        primaryTopic: primaryTopicObj.title.toUpperCase(),
        category: primaryTopicObj.category,
        age: c.age,
        sharedOverlapCount: Math.max(1, overlapCount),
        compatibilityScore,
        location: `${c.city.split(',')[0]} • ${dist > 0 ? `${dist} km away` : 'Active nearby'}`,
        subTopics: subTopics.length > 0 ? subTopics : ['Why People Ghost', 'Startup Drama', 'Ghosting Culture']
      });
    }

    // If candidate cards are few (e.g. initial fresh state), fallback to default seed cards with candidate IDs
    if (cards.length === 0) {
      const seedPeers = await db.users.getPeerCandidates(currentUserId, 3);
      for (const peer of seedPeers) {
        cards.push({
          id: `card-${peer.id}`,
          targetUserId: peer.id,
          primaryTopic: 'OFFICE POLITICS',
          category: 'Workplace',
          age: peer.age || 26,
          sharedOverlapCount: 3,
          compatibilityScore: 92,
          location: `${peer.city.split(',')[0]} • 3 km away`,
          subTopics: ['Situationships', 'Why People Ghost', 'Startup Drama']
        });
      }
    }

    res.json({ cards });
  } catch (err) {
    next(err);
  }
});

// 2. Swipe Action (Like or Pass)
discoveryRouter.post('/swipe', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const currentUserId = req.user!.id;
    const { targetUserId, direction } = req.body;

    if (!targetUserId || !direction || !['like', 'pass'].includes(direction)) {
      res.status(400).json({ error: 'INVALID_SWIPE', message: 'targetUserId and direction (like|pass) required.' });
      return;
    }

    // Guests cannot like
    if (direction === 'like' && req.user!.is_guest === 1) {
      res.status(403).json({
        error: 'GUEST_RESTRICTION',
        message: 'Register with email to like topics and establish encrypted debate tunnels.'
      });
      return;
    }

    // Record the swipe
    await db.swipes.recordSwipe({
      userId: currentUserId,
      targetUserId,
      direction
    });

    if (direction === 'pass') {
      res.json({ isMatch: false });
      return;
    }

    // Check if target user has also liked current user OR if target is a seed persona
    const mutualSwipe = await db.swipes.findSwipe(targetUserId, currentUserId);
    const isSeedPeer = targetUserId.startsWith('user-partner');
    const isMatch = (mutualSwipe && mutualSwipe.direction === 'like') || isSeedPeer;

    if (isMatch) {
      const u1 = currentUserId < targetUserId ? currentUserId : targetUserId;
      const u2 = currentUserId < targetUserId ? targetUserId : currentUserId;
      const matchId = `match-${u1}-${u2}`;

      // Get shared topics
      const sharedTopics = await db.userTopics.findSharedTopics(currentUserId, targetUserId);

      const overlappingTitles = sharedTopics.length > 0 
        ? sharedTopics.map(t => t.title)
        : ['AI Layoffs vs Reality', 'Office Politics', 'Ghosting Culture'];

      const partner = await db.users.findById(targetUserId);

      // Insert match
      await db.matches.create({
        id: matchId,
        user1_id: u1,
        user2_id: u2,
        compatibility: 94,
        unmask_stage: 0,
        status: 'active'
      });

      // Insert tunnel starter message if none exists
      const hasMsg = await db.chatMessages.hasMessages(matchId);
      if (!hasMsg) {
        const expiresAt = new Date(Date.now() + 300 * 1000).toISOString();
        await db.chatMessages.create({
          id: `msg-init-${Date.now()}`,
          match_id: matchId,
          sender_id: targetUserId,
          text: `Encrypted Topic Tunnel initiated. Topic Overlap: ${overlappingTitles[0]}. Match Rate: 94%.`,
          expires_at: expiresAt,
          is_warning: 0
        });
      }

      res.json({
        isMatch: true,
        matchId,
        matchRate: 94,
        partnerHandle: partner ? partner.handle : 'cipher_vanguard',
        overlappingTopics: overlappingTitles
      });
      return;
    }

    res.json({ isMatch: false });
  } catch (err) {
    next(err);
  }
});
