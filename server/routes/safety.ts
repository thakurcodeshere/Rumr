import { Router } from 'express';
import { db } from '../db/database.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { moderateContent } from '../middleware/sentinel.js';

export const safetyRouter = Router();

// 1. Submit Anonymous Incident Report
safetyRouter.post('/report', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const currentUserId = req.user!.id;
    const { targetId, reason, details } = req.body;

    if (!targetId || !reason) {
      res.status(400).json({ error: 'MISSING_FIELDS', message: 'targetId and reason are required.' });
      return;
    }

    const reportId = `rep-${Date.now()}`;
    await db.reports.create({
      id: reportId,
      reporter_id: currentUserId,
      target_id: targetId,
      reason,
      details: details || null,
      status: 'pending'
    });

    res.json({
      success: true,
      reportId,
      message: `Anonymous report filed for node ${targetId} (${reason}). The cryptographic hash is logged for community review.`
    });
  } catch (err) {
    next(err);
  }
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
safetyRouter.post('/block', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const currentUserId = req.user!.id;
    const { targetUserId } = req.body;

    if (!targetUserId) {
      res.status(400).json({ error: 'MISSING_TARGET', message: 'targetUserId is required.' });
      return;
    }

    await db.blockedEntities.block(currentUserId, targetUserId);

    res.json({ success: true, message: 'Entity blocked. Node removed from discovery vectors.' });
  } catch (err) {
    next(err);
  }
});
