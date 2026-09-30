import { Router } from 'express';
import { db } from '../db/database.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { sanitizePartnerProfile } from './matches.js';

export const unmaskRouter = Router();

// 1. Get Unmasking Status for a Match
unmaskRouter.get('/:matchId/unmask', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const currentUserId = req.user!.id;
    const { matchId } = req.params;

    const match = await db.matches.findById(matchId);
    if (!match || (match.user1_id !== currentUserId && match.user2_id !== currentUserId)) {
      res.status(403).json({ error: 'FORBIDDEN', message: 'Not authorized for this tunnel.' });
      return;
    }

    const partnerId = match.user1_id === currentUserId ? match.user2_id : match.user1_id;
    const rawPartner = await db.users.findById(partnerId);

    // Get consents
    const consents = await db.unmaskConsents.findByMatchId(matchId);

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

    const partner = sanitizePartnerProfile(rawPartner || {}, match.unmask_stage);

    res.json({
      matchId,
      currentStage: match.unmask_stage,
      myConsent,
      partnerConsent,
      partner
    });
  } catch (err) {
    next(err);
  }
});

// 2. Grant Progressive Unmasking Consent
unmaskRouter.post('/:matchId/unmask/consent', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const currentUserId = req.user!.id;
    const { matchId } = req.params;
    const { stage } = req.body;

    const stageNum = parseInt(stage, 10);
    if (![1, 2, 3].includes(stageNum)) {
      res.status(400).json({ error: 'INVALID_STAGE', message: 'Stage must be 1, 2, or 3.' });
      return;
    }

    const match = await db.matches.findById(matchId);
    if (!match || (match.user1_id !== currentUserId && match.user2_id !== currentUserId)) {
      res.status(403).json({ error: 'FORBIDDEN', message: 'Not authorized for this tunnel.' });
      return;
    }

    const partnerId = match.user1_id === currentUserId ? match.user2_id : match.user1_id;

    // Save current user consent
    await db.unmaskConsents.addConsent({
      matchId,
      userId: currentUserId,
      stage: stageNum
    });

    // If partner is a seed peer persona, reciprocate consent automatically
    if (partnerId.startsWith('user-partner')) {
      await db.unmaskConsents.addConsent({
        matchId,
        userId: partnerId,
        stage: stageNum
      });
    }

    // Check bilateral consent
    const bilateralCount = await db.unmaskConsents.getBilateralCount(matchId, stageNum);

    let advanced = false;
    if (bilateralCount >= 2) {
      if (stageNum > match.unmask_stage) {
        await db.matches.updateUnmaskStage(matchId, stageNum);
        advanced = true;

        // Add system message
        const layerNames = {
          1: 'Signals (City & Role)',
          2: 'Resonance (Tagline & Worldview)',
          3: 'Decryption (Verified Portrait & Legal Name)'
        };
        const expiresAt = new Date(Date.now() + 300 * 1000).toISOString();
        await db.chatMessages.create({
          id: `msg-unmask-${Date.now()}`,
          match_id: matchId,
          sender_id: partnerId,
          text: `[CRYPTOGRAPHIC HANDSHAKE] Layer ${stageNum}: ${layerNames[stageNum as keyof typeof layerNames]} unlocked by bilateral consent.`,
          expires_at: expiresAt,
          is_warning: 0
        });
      }
    }

    const updatedMatch = (await db.matches.findById(matchId)) || match;
    const rawPartner = await db.users.findById(partnerId);
    const partner = sanitizePartnerProfile(rawPartner || {}, updatedMatch.unmask_stage);

    res.json({
      success: true,
      stage: updatedMatch.unmask_stage,
      advanced,
      partner
    });
  } catch (err) {
    next(err);
  }
});
