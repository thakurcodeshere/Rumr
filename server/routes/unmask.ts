import { Router } from 'express';
import { db } from '../db/database.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { sanitizePartnerProfile } from './matches.js';

export const unmaskRouter = Router();

// 1. Get Unmasking Status for a Match
unmaskRouter.get('/:matchId/unmask', requireAuth, (req: AuthenticatedRequest, res) => {
  const currentUserId = req.user!.id;
  const { matchId } = req.params;

  const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(matchId) as any;
  if (!match || (match.user1_id !== currentUserId && match.user2_id !== currentUserId)) {
    res.status(403).json({ error: 'FORBIDDEN', message: 'Not authorized for this tunnel.' });
    return;
  }

  const partnerId = match.user1_id === currentUserId ? match.user2_id : match.user1_id;
  const rawPartner = db.prepare('SELECT * FROM users WHERE id = ?').get(partnerId) as any;

  // Get consents
  const consents = db.prepare(`
    SELECT user_id, stage FROM unmask_consents WHERE match_id = ?
  `).all(matchId) as { user_id: string; stage: number }[];

  const myConsent: Record<number, boolean> = {
    1: consents.some(c => c.user_id === currentUserId && c.stage === 1),
    2: consents.some(c => c.user_id === currentUserId && c.stage === 2),
    3: consents.some(c => c.user_id === currentUserId && c.stage === 3)
  };

  const partnerConsent: Record<number, boolean> = {
    1: consents.some(c => c.user_id === partnerId && c.stage === 1),
    2: consents.some(c => c.user_id === partnerId && c.stage === 2),
    3: consents.some(c => c.user_id === partnerId && c.stage === 3)
  };

  const partner = sanitizePartnerProfile(rawPartner, match.unmask_stage);

  res.json({
    matchId,
    currentStage: match.unmask_stage,
    myConsent,
    partnerConsent,
    partner
  });
});

// 2. Grant Progressive Unmasking Consent
unmaskRouter.post('/:matchId/unmask/consent', requireAuth, (req: AuthenticatedRequest, res) => {
  const currentUserId = req.user!.id;
  const { matchId } = req.params;
  const { stage } = req.body;

  const stageNum = parseInt(stage, 10);
  if (![1, 2, 3].includes(stageNum)) {
    res.status(400).json({ error: 'INVALID_STAGE', message: 'Stage must be 1, 2, or 3.' });
    return;
  }

  const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(matchId) as any;
  if (!match || (match.user1_id !== currentUserId && match.user2_id !== currentUserId)) {
    res.status(403).json({ error: 'FORBIDDEN', message: 'Not authorized for this tunnel.' });
    return;
  }

  const partnerId = match.user1_id === currentUserId ? match.user2_id : match.user1_id;

  // Save current user consent
  db.prepare(`
    INSERT OR IGNORE INTO unmask_consents (id, match_id, user_id, stage)
    VALUES (?, ?, ?, ?)
  `).run(`consent-${matchId}-${currentUserId}-${stageNum}`, matchId, currentUserId, stageNum);

  // If partner is a seed peer persona, reciprocate consent automatically
  if (partnerId.startsWith('user-partner')) {
    db.prepare(`
      INSERT OR IGNORE INTO unmask_consents (id, match_id, user_id, stage)
      VALUES (?, ?, ?, ?)
    `).run(`consent-${matchId}-${partnerId}-${stageNum}`, matchId, partnerId, stageNum);
  }

  // Check bilateral consent
  const bilateralCount = db.prepare(`
    SELECT count(DISTINCT user_id) as count
    FROM unmask_consents
    WHERE match_id = ? AND stage = ?
  `).get(matchId, stageNum) as { count: number };

  let advanced = false;
  if (bilateralCount.count >= 2) {
    if (stageNum > match.unmask_stage) {
      db.prepare(`
        UPDATE matches SET unmask_stage = ?, updated_at = datetime('now') WHERE id = ?
      `).run(stageNum, matchId);
      advanced = true;

      // Add system message
      const layerNames = { 1: 'Signals (City & Role)', 2: 'Resonance (Tagline & Worldview)', 3: 'Decryption (Verified Portrait & Legal Name)' };
      const expiresAt = new Date(Date.now() + 300 * 1000).toISOString();
      db.prepare(`
        INSERT INTO chat_messages (id, match_id, sender_id, text, expires_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        `msg-unmask-${Date.now()}`,
        matchId,
        partnerId,
        `[CRYPTOGRAPHIC HANDSHAKE] Layer ${stageNum}: ${layerNames[stageNum as keyof typeof layerNames]} unlocked by bilateral consent.`,
        expiresAt
      );
    }
  }

  const updatedMatch = db.prepare('SELECT * FROM matches WHERE id = ?').get(matchId) as any;
  const rawPartner = db.prepare('SELECT * FROM users WHERE id = ?').get(partnerId) as any;
  const partner = sanitizePartnerProfile(rawPartner, updatedMatch.unmask_stage);

  res.json({
    success: true,
    stage: updatedMatch.unmask_stage,
    advanced,
    partner
  });
});
