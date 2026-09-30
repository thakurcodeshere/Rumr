import { Router } from 'express';
import { db } from '../db/database.js';
import { optionalAuth, requireAuth, requireRegistered, AuthenticatedRequest } from '../middleware/auth.js';
import { moderateContent } from '../middleware/sentinel.js';

export const rumorsRouter = Router();

// 1. Get Rumors / Whispers
rumorsRouter.get('/', optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { category, search } = req.query;

    const rows = await db.rumors.findAll({
      category: typeof category === 'string' ? category : undefined,
      search: typeof search === 'string' ? search : undefined
    });

    const rumors = rows.map(r => {
      let parsedTags: string[] = [];
      try {
        parsedTags = r.tags ? (typeof r.tags === 'string' ? JSON.parse(r.tags) : r.tags) : [];
      } catch {
        parsedTags = ['#UNFILTERED'];
      }

      return {
        id: r.id,
        topicId: r.topic_id,
        topicTitle: r.topic_title,
        category: r.category,
        authorHandle: r.author_handle || 'void_whisperer',
        authorChaosIndex: r.author_chaos_index || 88,
        content: r.content,
        encryptedContent: r.encrypted_content,
        isEncrypted: Boolean(r.is_encrypted),
        matchRate: r.match_rate,
        agrees: r.agrees,
        debates: r.debates,
        timestamp: 'Active today',
        tags: parsedTags
      };
    });

    res.json({ rumors });
  } catch (err) {
    next(err);
  }
});

// 2. Post New Rumor / Whisper
rumorsRouter.post('/', requireAuth, requireRegistered, async (req: AuthenticatedRequest, res, next) => {
  try {
    const currentUserId = req.user!.id;
    const { topicId, content, tags = [] } = req.body;

    if (!topicId || !content || !content.trim()) {
      res.status(400).json({ error: 'MISSING_FIELDS', message: 'Topic ID and content are required.' });
      return;
    }

    const topic = await db.topics.findById(topicId);
    if (!topic) {
      res.status(404).json({ error: 'TOPIC_NOT_FOUND', message: 'Topic not found.' });
      return;
    }

    // AI Moderation check
    const moderation = moderateContent(content);
    if (!moderation.allowed) {
      res.status(422).json({
        error: 'AI_SENTINEL_VIOLATION',
        message: moderation.reason,
        category: moderation.category
      });
      return;
    }

    const rumorId = `rumor-${Date.now()}`;
    const encryptedContent = content.replace(/\b([A-Z][a-z]+|\d+%?)\b/g, '[ENCRYPTED]');
    const tagsJson = JSON.stringify(Array.isArray(tags) && tags.length > 0 ? tags : ['#LEAK', '#WHISPR']);

    const created = await db.rumors.create({
      id: rumorId,
      topic_id: topicId,
      author_id: currentUserId,
      content: content.trim(),
      encrypted_content: encryptedContent,
      is_encrypted: 1,
      match_rate: 88,
      agrees: 0,
      debates: 0,
      tags: tagsJson
    });

    res.json({
      success: true,
      rumor: {
        id: created.id,
        topicId,
        topicTitle: topic.title,
        category: topic.category,
        authorHandle: req.user!.handle,
        authorChaosIndex: req.user!.chaos_index,
        content: content.trim(),
        encryptedContent,
        isEncrypted: true,
        matchRate: 88,
        agrees: 0,
        debates: 0,
        timestamp: 'Just now',
        tags: JSON.parse(tagsJson)
      }
    });
  } catch (err) {
    next(err);
  }
});

// 3. Vote on Rumor (Agree / Debate Idempotency)
rumorsRouter.post('/:rumorId/vote', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const currentUserId = req.user!.id;
    const { rumorId } = req.params;
    const { voteType } = req.body;

    if (!['agree', 'debate'].includes(voteType)) {
      res.status(400).json({ error: 'INVALID_VOTE', message: 'Vote must be agree or debate.' });
      return;
    }

    const rumor = await db.rumors.findById(rumorId);
    if (!rumor) {
      res.status(404).json({ error: 'RUMOR_NOT_FOUND', message: 'Rumor not found.' });
      return;
    }

    const existingVote = await db.rumorVotes.findByRumorAndUser(rumorId, currentUserId);

    if (existingVote) {
      if (existingVote.vote_type !== voteType) {
        await db.rumorVotes.upsert({ rumorId, userId: currentUserId, voteType });
        if (voteType === 'agree') {
          await db.rumors.updateVoteCount(rumorId, 1, -1);
        } else {
          await db.rumors.updateVoteCount(rumorId, -1, 1);
        }
      }
    } else {
      await db.rumorVotes.upsert({ rumorId, userId: currentUserId, voteType });
      if (voteType === 'agree') {
        await db.rumors.updateVoteCount(rumorId, 1, 0);
      } else {
        await db.rumors.updateVoteCount(rumorId, 0, 1);
      }
    }

    const updated = await db.rumors.findById(rumorId);

    res.json({
      success: true,
      agrees: updated?.agrees ?? 0,
      debates: updated?.debates ?? 0
    });
  } catch (err) {
    next(err);
  }
});

// 4. Decrypt Rumor
rumorsRouter.post('/:rumorId/decrypt', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { rumorId } = req.params;
    const rumor = await db.rumors.findById(rumorId);
    if (!rumor) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Rumor not found.' });
      return;
    }

    await db.rumors.decrypt(rumorId);

    res.json({
      success: true,
      rumorId,
      content: rumor.content,
      isEncrypted: false
    });
  } catch (err) {
    next(err);
  }
});
