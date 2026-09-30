import { Router } from 'express';
import { db } from '../db/database.js';
import { optionalAuth, requireAuth, requireRegistered, AuthenticatedRequest } from '../middleware/auth.js';
import { validateTopicTitle } from '../middleware/sentinel.js';

export const topicsRouter = Router();

// 1. Get Topics Taxonomy
topicsRouter.get('/', optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const currentUserId = req.user ? req.user.id : null;
    const { category, search } = req.query;

    const topics = await db.topics.findAll({
      category: typeof category === 'string' ? category : undefined,
      search: typeof search === 'string' ? search : undefined
    });

    // Get user subscriptions if authenticated
    let userSubSet = new Set<string>();
    if (currentUserId) {
      const subs = await db.userTopics.findTopicIdsByUserId(currentUserId);
      userSubSet = new Set(subs);
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
  } catch (err) {
    next(err);
  }
});

// 2. Create Custom <=3-Word Topic
topicsRouter.post('/', requireAuth, requireRegistered, async (req: AuthenticatedRequest, res, next) => {
  try {
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
    const validCategories = ['Tech', 'Workplace', 'Social', 'Spicy', 'Crypto', 'Startups'] as const;
    const finalCategory = validCategories.includes(category) ? category : 'Tech';

    const topicId = `topic-${Date.now()}`;
    const created = await db.topics.create({
      id: topicId,
      title: cleanTitle,
      category: finalCategory as any,
      description: description || 'Community debate node initiated.',
      debater_count: 1,
      heat_score: 75,
      match_rate: 88,
      is_hot: 1,
      creator_id: currentUserId
    });

    // Automatically subscribe creator
    await db.userTopics.subscribe(currentUserId, topicId);

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
  } catch (err) {
    next(err);
  }
});

// 3. Toggle Topic Subscription
topicsRouter.post('/:topicId/subscribe', requireAuth, requireRegistered, async (req: AuthenticatedRequest, res, next) => {
  try {
    const currentUserId = req.user!.id;
    const { topicId } = req.params;

    const topic = await db.topics.findById(topicId);
    if (!topic) {
      res.status(404).json({ error: 'TOPIC_NOT_FOUND', message: 'Topic node not found.' });
      return;
    }

    const isSub = await db.userTopics.isSubscribed(currentUserId, topicId);

    let isSubscribed = false;
    let newDebaterCount = topic.debater_count;

    if (isSub) {
      // Unsubscribe
      await db.userTopics.unsubscribe(currentUserId, topicId);
      newDebaterCount = await db.topics.incrementDebaters(topicId, -1);
      isSubscribed = false;
    } else {
      // Subscribe
      await db.userTopics.subscribe(currentUserId, topicId);
      newDebaterCount = await db.topics.incrementDebaters(topicId, 1);
      isSubscribed = true;
    }

    res.json({
      success: true,
      topicId,
      isSubscribed,
      debaterCount: newDebaterCount
    });
  } catch (err) {
    next(err);
  }
});
