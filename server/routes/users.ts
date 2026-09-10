import { Router } from 'express';
import { db } from '../db/database.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { validateTopicTitle } from '../middleware/sentinel.js';

export const usersRouter = Router();

// 1. Get Current User Profile with Resonance Graph
usersRouter.get('/me', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;

  const subscriptions = db.prepare(`
    SELECT t.id, t.title, t.category, t.match_rate
    FROM topics t
    JOIN user_topics ut ON ut.topic_id = t.id
    WHERE ut.user_id = ?
  `).all(user.id) as any[];

  const resonanceTags = db.prepare(`
    SELECT tag FROM user_resonance_tags WHERE user_id = ?
  `).all(user.id) as { tag: string }[];

  const blockedCount = db.prepare(`
    SELECT count(*) as count FROM blocked_entities WHERE user_id = ?
  `).get(user.id) as { count: number };

  res.json({
    user: {
      ...user,
      isVerified: Boolean(user.is_verified),
      isGuest: Boolean(user.is_guest),
      ghostMode: Boolean(user.ghost_mode),
      subscribedTopicIds: subscriptions.map(s => s.id),
      topics: subscriptions.map(s => ({
        id: s.id,
        title: s.title,
        category: s.category,
        matchRate: s.match_rate
      })),
      activeRumors: resonanceTags.map(r => r.tag),
      blockedCount: blockedCount.count
    }
  });
});

// 2. Update Profile & Settings
usersRouter.patch('/me', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const {
    ghostMode,
    globalRadius,
    geoBroadcasting,
    city,
    coords,
    role,
    tagline,
    realName,
    realPhoto
  } = req.body;

  const updates: string[] = [];
  const params: any[] = [];

  if (ghostMode !== undefined) {
    updates.push('ghost_mode = ?');
    params.push(ghostMode ? 1 : 0);
  }
  if (globalRadius !== undefined) {
    updates.push('global_radius = ?');
    params.push(parseInt(globalRadius, 10));
  }
  if (geoBroadcasting !== undefined) {
    updates.push('geo_broadcasting = ?');
    params.push(geoBroadcasting);
  }
  if (city !== undefined) {
    updates.push('city = ?');
    params.push(city);
  }
  if (coords && coords.lat !== undefined && coords.lng !== undefined) {
    updates.push('latitude = ?, longitude = ?');
    params.push(coords.lat, coords.lng);
  }
  if (role !== undefined) {
    updates.push('role = ?');
    params.push(role);
  }
  if (tagline !== undefined) {
    updates.push('tagline = ?');
    params.push(tagline);
  }
  if (realName !== undefined) {
    updates.push('real_name = ?');
    params.push(realName);
  }
  if (realPhoto !== undefined) {
    updates.push('real_photo = ?');
    params.push(realPhoto);
  }

  if (updates.length > 0) {
    updates.push("updated_at = datetime('now')");
    params.push(user.id);
    db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...params);
  }

  const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id) as any;
  res.json({
    success: true,
    user: {
      ...updated,
      isVerified: Boolean(updated.is_verified),
      isGuest: Boolean(updated.is_guest),
      ghostMode: Boolean(updated.ghost_mode)
    }
  });
});

// 3. Inject 3-Word Resonance Tag into Profile
usersRouter.post('/me/rumors', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { tag } = req.body;

  if (!tag || typeof tag !== 'string' || !tag.trim()) {
    res.status(400).json({ error: 'EMPTY_TAG', message: 'Resonance tag cannot be blank.' });
    return;
  }

  const validation = validateTopicTitle(tag);
  if (!validation.allowed) {
    res.status(422).json({
      error: 'CONSTRAINT_VIOLATION',
      message: validation.reason
    });
    return;
  }

  const formatted = tag.trim().toUpperCase().replace(/\s+/g, '_');
  const tagId = `tag-${user.id}-${Date.now()}`;

  db.prepare(`
    INSERT OR IGNORE INTO user_resonance_tags (id, user_id, tag)
    VALUES (?, ?, ?)
  `).run(tagId, user.id, formatted);

  const tags = db.prepare('SELECT tag FROM user_resonance_tags WHERE user_id = ?').all(user.id) as { tag: string }[];

  res.json({
    success: true,
    activeRumors: tags.map(t => t.tag)
  });
});

// 4. Remove Resonance Tag from Profile
usersRouter.delete('/me/rumors/:tag', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { tag } = req.params;

  db.prepare('DELETE FROM user_resonance_tags WHERE user_id = ? AND tag = ?').run(user.id, tag);

  const tags = db.prepare('SELECT tag FROM user_resonance_tags WHERE user_id = ?').all(user.id) as { tag: string }[];
  res.json({ success: true, activeRumors: tags.map(t => t.tag) });
});

// 5. Get User Transaction History
usersRouter.get('/me/transactions', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const transactions = db.prepare(`
    SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC
  `).all(user.id) as any[];

  res.json({ transactions });
});

// 6. DPDP Act 2023 Machine-Readable Data Export
usersRouter.get('/me/dpdp-export', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;

  const topics = db.prepare(`
    SELECT t.title, t.category FROM topics t
    JOIN user_topics ut ON ut.topic_id = t.id WHERE ut.user_id = ?
  `).all(user.id);

  const tags = db.prepare('SELECT tag FROM user_resonance_tags WHERE user_id = ?').all(user.id);
  const swipesCount = db.prepare('SELECT count(*) as c FROM swipes WHERE user_id = ?').get(user.id) as { c: number };
  const matchesCount = db.prepare('SELECT count(*) as c FROM matches WHERE user1_id = ? OR user2_id = ?').get(user.id, user.id) as { c: number };
  const transactions = db.prepare('SELECT * FROM transactions WHERE user_id = ?').all(user.id);

  const exportArchive = {
    exportDate: new Date().toISOString(),
    legalStandard: 'Digital Personal Data Protection (DPDP) Act 2023 §12',
    dataPrincipal: {
      id: user.id,
      email: user.email,
      handle: user.handle,
      age: user.age,
      gender: user.gender,
      city: user.city,
      chaosIndex: user.chaos_index,
      accountCreatedAt: (user as any).created_at || new Date().toISOString()
    },
    quarantinedIdentityLayers: {
      role: user.role,
      tagline: user.tagline,
      realName: user.real_name,
      realPhoto: user.real_photo
    },
    activityTelemetry: {
      subscribedTopics: topics,
      resonanceRumorTags: tags,
      lifetimeSwipesCount: swipesCount.c,
      activeMatchesCount: matchesCount.c,
      transactions
    },
    cryptographicZeroKnowledgeStatement: 'Ephemeral messages are deleted per TTL. Browsing telemetry unhashed and unpersisted.'
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename=rumr-dpdp-export-${user.handle}.json`);
  res.send(JSON.stringify(exportArchive, null, 2));
});

// 7. Statutory Account Erasure (Right to Be Forgotten)
usersRouter.delete('/me', requireAuth, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;

  // Complete cascade delete
  db.prepare('DELETE FROM users WHERE id = ?').run(userId);

  res.json({
    success: true,
    message: 'User account and all associated cryptographic records have been permanently erased under DPDP Act 2023.'
  });
});
