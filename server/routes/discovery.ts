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
discoveryRouter.post('/feed', requireAuth, (req: AuthenticatedRequest, res) => {
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
  const myTopics = db.prepare(`
    SELECT topic_id FROM user_topics WHERE user_id = ?
  `).all(currentUserId) as { topic_id: string }[];
  const myTopicIds = new Set(myTopics.map(t => t.topic_id));

  // Find candidate users:
  // Exclude current user, ghost mode users, blocked entities, and already swiped candidates
  let query = `
    SELECT u.id, u.handle, u.age, u.gender, u.city, u.latitude, u.longitude, u.chaos_index, u.role
    FROM users u
    WHERE u.id != ?
      AND u.is_guest = 0
      AND u.ghost_mode = 0
      AND u.id NOT IN (SELECT blocked_user_id FROM blocked_entities WHERE user_id = ?)
      AND u.id NOT IN (SELECT target_user_id FROM swipes WHERE user_id = ?)
      AND u.age >= ? AND u.age <= ?
  `;

  const params: any[] = [currentUserId, currentUserId, currentUserId, minAge, maxAge];

  if (gender !== 'everyone') {
    query += ' AND (u.gender = ? OR u.gender = "Non-binary")';
    params.push(gender === 'women' ? 'Women' : 'Men');
  }

  const candidates = db.prepare(query).all(...params) as any[];

  // Process candidates and compute topic overlap and distance
  const cards: any[] = [];

  for (const c of candidates) {
    const dist = calculateDistanceKm(userLat, userLng, c.latitude || 28.4595, c.longitude || 77.0266);
    if (proximity === 'nearby' && dist > radius) {
      continue;
    }

    // Get candidate's subscribed topics
    const candidateTopics = db.prepare(`
      SELECT t.id, t.title, t.category
      FROM topics t
      JOIN user_topics ut ON ut.topic_id = t.id
      WHERE ut.user_id = ?
    `).all(c.id) as { id: string; title: string; category: string }[];

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
    const seedPeers = db.prepare('SELECT id, handle, age, city FROM users WHERE id != ? LIMIT 3').all(currentUserId) as any[];
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
});

// 2. Swipe Action (Like or Pass)
discoveryRouter.post('/swipe', requireAuth, (req: AuthenticatedRequest, res) => {
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
  db.prepare(`
    INSERT INTO swipes (id, user_id, target_user_id, direction)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(user_id, target_user_id) DO UPDATE SET direction = excluded.direction
  `).run(`swipe-${currentUserId}-${targetUserId}`, currentUserId, targetUserId, direction);

  if (direction === 'pass') {
    res.json({ isMatch: false });
    return;
  }

  // Check if target user has also liked current user OR if target is a seed persona
  const mutualSwipe = db.prepare(`
    SELECT * FROM swipes WHERE user_id = ? AND target_user_id = ? AND direction = 'like'
  `).get(targetUserId, currentUserId);

  // In demo / fresh run, seed partner personas automatically reciprocal-match to create immediate working tunnels
  const isSeedPeer = targetUserId.startsWith('user-partner');
  const isMatch = Boolean(mutualSwipe) || isSeedPeer;

  if (isMatch) {
    const u1 = currentUserId < targetUserId ? currentUserId : targetUserId;
    const u2 = currentUserId < targetUserId ? targetUserId : currentUserId;
    const matchId = `match-${u1}-${u2}`;

    // Get shared topics
    const sharedTopics = db.prepare(`
      SELECT t.title FROM topics t
      JOIN user_topics ut1 ON ut1.topic_id = t.id AND ut1.user_id = ?
      JOIN user_topics ut2 ON ut2.topic_id = t.id AND ut2.user_id = ?
    `).all(currentUserId, targetUserId) as { title: string }[];

    const overlappingTitles = sharedTopics.length > 0 
      ? sharedTopics.map(t => t.title)
      : ['AI Layoffs vs Reality', 'Office Politics', 'Ghosting Culture'];

    const partner = db.prepare('SELECT handle FROM users WHERE id = ?').get(targetUserId) as { handle: string };

    // Insert match
    db.prepare(`
      INSERT OR IGNORE INTO matches (id, user1_id, user2_id, compatibility, unmask_stage, status)
      VALUES (?, ?, ?, 94, 0, 'active')
    `).run(matchId, u1, u2);

    // Insert tunnel starter message if none exists
    const existingMsg = db.prepare('SELECT id FROM chat_messages WHERE match_id = ? LIMIT 1').get(matchId);
    if (!existingMsg) {
      const expiresAt = new Date(Date.now() + 300 * 1000).toISOString();
      db.prepare(`
        INSERT INTO chat_messages (id, match_id, sender_id, text, expires_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        `msg-init-${Date.now()}`,
        matchId,
        targetUserId,
        `Encrypted Topic Tunnel initiated. Topic Overlap: ${overlappingTitles[0]}. Match Rate: 94%.`,
        expiresAt
      );
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
});
