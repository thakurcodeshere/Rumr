import { Router } from 'express';
import { db } from '../db/database.js';
import { optionalAuth, requireAuth, requireRegistered, AuthenticatedRequest } from '../middleware/auth.js';
import { validateTopicTitle } from '../middleware/sentinel.js';

export const topicsRouter = Router();

// 1. Get Topics Taxonomy
topicsRouter.get('/', optionalAuth, (req: AuthenticatedRequest, res) => {
  const currentUserId = req.user ? req.user.id : null;
  const { category, search } = req.query;

  let query = 'SELECT * FROM topics WHERE 1=1';
  const params: any[] = [];

  if (category && category !== 'All') {
    query += ' AND category = ?';
    params.push(category);
  }

  if (search && typeof search === 'string' && search.trim()) {
    query += ' AND (title LIKE ? OR description LIKE ?)';
    const term = `%${search.trim()}%`;
    params.push(term, term);
  }

  query += ' ORDER BY heat_score DESC';

  const topics = db.prepare(query).all(...params) as any[];

  // Get user subscriptions if authenticated
  let userSubSet = new Set<string>();
  if (currentUserId) {
    const subs = db.prepare('SELECT topic_id FROM user_topics WHERE user_id = ?').all(currentUserId) as { topic_id: string }[];
    userSubSet = new Set(subs.map(s => s.topic_id));
  }

  const result = topics.map(t => ({
    id: t.id,
    title: t.title,
    category: t.category,
    debaterCount: t.debater_count,
    heatScore: t.heat_score,
    matchRate: t.match_rate,
    isHot: Boolean(t.is_hot),
    isSubscribed: userSubSet.has(t.id),
    description: t.description || ''
  }));

  res.json({ topics: result });
});

// 2. Create Custom <=3-Word Topic
topicsRouter.post('/', requireAuth, requireRegistered, (req: AuthenticatedRequest, res) => {
  const currentUserId = req.user!.id;
  const { title, category = 'Tech', description } = req.body;

  if (!title || typeof title !== 'string') {
    res.status(400).json({ error: 'MISSING_TITLE', message: 'Topic title is required.' });
    return;
  }

  // Server-side AI Sentinel validation (<= 3 words, anti-defamation)
  const validation = validateTopicTitle(title);
  if (!validation.allowed) {
    res.status(422).json({
      error: 'AI_SENTINEL_VIOLATION',
      message: validation.reason,
      suggestedAlternative: validation.suggestedAlternative
    });
    return;
  }

  const cleanTitle = title.trim();
  const validCategories = ['Tech', 'Workplace', 'Social', 'Spicy', 'Crypto', 'Startups'];
  const finalCategory = validCategories.includes(category) ? category : 'Tech';

  const topicId = `topic-${Date.now()}`;
  db.prepare(`
    INSERT INTO topics (id, title, category, description, debater_count, heat_score, match_rate, is_hot, creator_id)
    VALUES (?, ?, ?, ?, 1, 75, 88, 1, ?)
  `).run(topicId, cleanTitle, finalCategory, description || 'Community debate node initiated.', currentUserId);

  // Automatically subscribe creator
  db.prepare('INSERT OR IGNORE INTO user_topics (user_id, topic_id) VALUES (?, ?)').run(currentUserId, topicId);

  const created = db.prepare('SELECT * FROM topics WHERE id = ?').get(topicId) as any;

  res.json({
    success: true,
    topic: {
      id: created.id,
      title: created.title,
      category: created.category,
      debaterCount: 1,
      heatScore: created.heat_score,
      matchRate: created.match_rate,
      isHot: true,
      isSubscribed: true,
      description: created.description
    }
  });
});

// 3. Toggle Topic Subscription
topicsRouter.post('/:topicId/subscribe', requireAuth, requireRegistered, (req: AuthenticatedRequest, res) => {
  const currentUserId = req.user!.id;
  const { topicId } = req.params;

  const topic = db.prepare('SELECT * FROM topics WHERE id = ?').get(topicId) as any;
  if (!topic) {
    res.status(404).json({ error: 'TOPIC_NOT_FOUND', message: 'Topic node not found.' });
    return;
  }

  const existingSub = db.prepare('SELECT * FROM user_topics WHERE user_id = ? AND topic_id = ?').get(currentUserId, topicId);

  let isSubscribed = false;
  if (existingSub) {
    // Unsubscribe
    db.prepare('DELETE FROM user_topics WHERE user_id = ? AND topic_id = ?').run(currentUserId, topicId);
    db.prepare('UPDATE topics SET debater_count = MAX(1, debater_count - 1) WHERE id = ?').run(topicId);
    isSubscribed = false;
  } else {
    // Subscribe
    db.prepare('INSERT INTO user_topics (user_id, topic_id) VALUES (?, ?)').run(currentUserId, topicId);
    db.prepare('UPDATE topics SET debater_count = debater_count + 1 WHERE id = ?').run(topicId);
    isSubscribed = true;
  }

  const updated = db.prepare('SELECT debater_count FROM topics WHERE id = ?').get(topicId) as { debater_count: number };

  res.json({
    success: true,
    topicId,
    isSubscribed,
    debaterCount: updated.debater_count
  });
});
