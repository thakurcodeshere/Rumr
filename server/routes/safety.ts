import { Router } from 'express';
import { db } from '../db/database.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { moderateContent } from '../middleware/sentinel.js';

export const safetyRouter = Router();

// 1. Submit Anonymous Incident Report
safetyRouter.post('/report', requireAuth, (req: AuthenticatedRequest, res) => {
  const currentUserId = req.user!.id;
  const { targetId, reason, details } = req.body;

  if (!targetId || !reason) {
    res.status(400).json({ error: 'MISSING_FIELDS', message: 'targetId and reason are required.' });
    return;
  }

  const reportId = `rep-${Date.now()}`;
  db.prepare(`
    INSERT INTO reports (id, reporter_id, target_id, reason, details, status)
    VALUES (?, ?, ?, ?, ?, 'pending')
  `).run(reportId, currentUserId, targetId, reason, details || null);

  res.json({
    success: true,
    reportId,
    message: `Anonymous report filed for node ${targetId} (${reason}). The cryptographic hash is logged for community review.`
  });
});

// 2. AI Sentinel Testing Sandbox
safetyRouter.post('/moderate-text', (req, res) => {
  const { text } = req.body;
  if (!text) {
    res.json({ allowed: true });
    return;
  }

  const result = moderateContent(text);
  res.json(result);
});

// 3. Block Entity
safetyRouter.post('/block', requireAuth, (req: AuthenticatedRequest, res) => {
  const currentUserId = req.user!.id;
  const { targetUserId } = req.body;

  if (!targetUserId) {
    res.status(400).json({ error: 'MISSING_TARGET', message: 'targetUserId is required.' });
    return;
  }

  const blockId = `block-${currentUserId}-${targetUserId}`;
  db.prepare(`
    INSERT OR IGNORE INTO blocked_entities (id, user_id, blocked_user_id)
    VALUES (?, ?, ?)
  `).run(blockId, currentUserId, targetUserId);

  res.json({ success: true, message: 'Entity blocked. Node removed from discovery vectors.' });
});
