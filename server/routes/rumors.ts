import { Router } from 'express';
import { db } from '../db/database.js';
import { optionalAuth, requireAuth, requireRegistered, AuthenticatedRequest } from '../middleware/auth.js';
import { moderateContent } from '../middleware/sentinel.js';

export const rumorsRouter = Router();

// 1. Get Rumors / Whispers
rumorsRouter.get('/', optionalAuth, (req: AuthenticatedRequest, res) => {
  const { category, search } = req.query;

  let query = `
    SELECT r.*, t.title as topic_title, t.category, u.handle as author_handle, u.chaos_index as author_chaos_index
    FROM rumors r
    JOIN topics t ON t.id = r.topic_id
    LEFT JOIN users u ON u.id = r.author_id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (category && category !== 'All') {
    query += ' AND t.category = ?';
    params.push(category);
  }

  if (search && typeof search === 'string' && search.trim()) {
    query += ' AND (r.content LIKE ? OR t.title LIKE ?)';
    const term = `%${search.trim()}%`;
    params.push(term, term);
  }

  query += ' ORDER BY r.created_at DESC';

  const rows = db.prepare(query).all(...params) as any[];

  const rumors = rows.map(r => {
    let parsedTags: string[] = [];
    try {
      parsedTags = r.tags ? JSON.parse(r.tags) : [];
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
});

// 2. Post New Rumor / Whisper
rumorsRouter.post('/', requireAuth, requireRegistered, (req: AuthenticatedRequest, res) => {
  const currentUserId = req.user!.id;
  const { topicId, content, tags = [] } = req.body;

  if (!topicId || !content || !content.trim()) {
    res.status(400).json({ error: 'MISSING_FIELDS', message: 'Topic ID and content are required.' });
    return;
  }

  const topic = db.prepare('SELECT id, title, category FROM topics WHERE id = ?').get(topicId) as any;
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

  db.prepare(`
    INSERT INTO rumors (id, topic_id, author_id, content, encrypted_content, is_encrypted, match_rate, agrees, debates, tags)
    VALUES (?, ?, ?, ?, ?, 1, 88, 0, 0, ?)
  `).run(rumorId, topicId, currentUserId, content.trim(), encryptedContent, tagsJson);

  res.json({
    success: true,
    rumor: {
      id: rumorId,
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
});

// 3. Vote on Rumor (Agree / Debate Idempotency)
rumorsRouter.post('/:rumorId/vote', requireAuth, (req: AuthenticatedRequest, res) => {
  const currentUserId = req.user!.id;
  const { rumorId } = req.params;
  const { voteType } = req.body;

  if (!['agree', 'debate'].includes(voteType)) {
    res.status(400).json({ error: 'INVALID_VOTE', message: 'Vote must be agree or debate.' });
    return;
  }

  const rumor = db.prepare('SELECT id, agrees, debates FROM rumors WHERE id = ?').get(rumorId) as any;
  if (!rumor) {
    res.status(404).json({ error: 'RUMOR_NOT_FOUND', message: 'Rumor not found.' });
    return;
  }

  const existingVote = db.prepare('SELECT vote_type FROM rumor_votes WHERE rumor_id = ? AND user_id = ?').get(rumorId, currentUserId) as { vote_type: string } | undefined;

  if (existingVote) {
    if (existingVote.vote_type !== voteType) {
      // Switch vote
      db.prepare('UPDATE rumor_votes SET vote_type = ? WHERE rumor_id = ? AND user_id = ?').run(voteType, rumorId, currentUserId);
      if (voteType === 'agree') {
        db.prepare('UPDATE rumors SET agrees = agrees + 1, debates = MAX(0, debates - 1) WHERE id = ?').run(rumorId);
      } else {
        db.prepare('UPDATE rumors SET debates = debates + 1, agrees = MAX(0, agrees - 1) WHERE id = ?').run(rumorId);
      }
    }
  } else {
    // New vote
    db.prepare('INSERT INTO rumor_votes (id, rumor_id, user_id, vote_type) VALUES (?, ?, ?, ?)').run(`vote-${rumorId}-${currentUserId}`, rumorId, currentUserId, voteType);
    if (voteType === 'agree') {
      db.prepare('UPDATE rumors SET agrees = agrees + 1 WHERE id = ?').run(rumorId);
    } else {
      db.prepare('UPDATE rumors SET debates = debates + 1 WHERE id = ?').run(rumorId);
    }
  }

  const updated = db.prepare('SELECT agrees, debates FROM rumors WHERE id = ?').get(rumorId) as { agrees: number; debates: number };

  res.json({
    success: true,
    agrees: updated.agrees,
    debates: updated.debates
  });
});

// 4. Decrypt Rumor
rumorsRouter.post('/:rumorId/decrypt', requireAuth, (req: AuthenticatedRequest, res) => {
  const { rumorId } = req.params;
  const rumor = db.prepare('SELECT id, content FROM rumors WHERE id = ?').get(rumorId) as any;
  if (!rumor) {
    res.status(404).json({ error: 'NOT_FOUND', message: 'Rumor not found.' });
    return;
  }

  db.prepare('UPDATE rumors SET is_encrypted = 0 WHERE id = ?').run(rumorId);

  res.json({
    success: true,
    rumorId,
    content: rumor.content,
    isEncrypted: false
  });
});
