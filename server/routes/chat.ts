import { Router } from 'express';
import { db } from '../db/database.js';
import { requireAuth, requireRegistered, AuthenticatedRequest } from '../middleware/auth.js';
import { moderateContent } from '../middleware/sentinel.js';
import { chatRateLimiter } from '../middleware/rate-limiter.js';
import { CONFIG } from '../config.js';

export const chatRouter = Router();

// Ephemeral message purge helper
export async function purgeExpiredMessages(): Promise<number> {
  return db.chatMessages.purgeExpired();
}

// 1. Get Messages in a Topic Tunnel
chatRouter.get('/:matchId/messages', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const currentUserId = req.user!.id;
    const { matchId } = req.params;

    const match = await db.matches.findById(matchId);
    if (!match || (match.user1_id !== currentUserId && match.user2_id !== currentUserId)) {
      res.status(403).json({ error: 'FORBIDDEN', message: 'Not authorized for this tunnel.' });
      return;
    }

    // Active ephemeral cleanup
    await purgeExpiredMessages();

    const rawMessages = await db.chatMessages.findByMatchId(matchId);

    const nowMs = Date.now();
    const messages = rawMessages.map(m => {
      const expiresMs = new Date(m.expires_at).getTime();
      const remainingSeconds = Math.max(0, Math.round((expiresMs - nowMs) / 1000));
      const isMe = m.sender_id === currentUserId;

      return {
        id: m.id,
        sender: isMe ? 'me' : 'them',
        senderHandle: m.sender_handle || (isMe ? req.user!.handle : 'partner'),
        text: m.text,
        timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        expiresInSeconds: remainingSeconds,
        isWarning: Boolean(m.is_warning)
      };
    });

    res.json({ messages });
  } catch (err) {
    next(err);
  }
});

// 2. Send Message in Topic Tunnel
chatRouter.post('/:matchId/messages', requireAuth, requireRegistered, chatRateLimiter, async (req: AuthenticatedRequest, res, next) => {
  try {
    const currentUserId = req.user!.id;
    const { matchId } = req.params;
    const { text } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      res.status(400).json({ error: 'EMPTY_MESSAGE', message: 'Message content cannot be blank.' });
      return;
    }

    const match = await db.matches.findById(matchId);
    if (!match || (match.user1_id !== currentUserId && match.user2_id !== currentUserId)) {
      res.status(403).json({ error: 'FORBIDDEN', message: 'Not authorized for this tunnel.' });
      return;
    }

    // Server-side AI Sentinel moderation
    const moderation = moderateContent(text);
    if (!moderation.allowed) {
      res.status(422).json({
        error: 'AI_SENTINEL_VIOLATION',
        message: moderation.reason,
        category: moderation.category
      });
      return;
    }

    const msgId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const expiresAt = new Date(Date.now() + CONFIG.MESSAGE_DECAY_SECONDS * 1000).toISOString();

    await db.chatMessages.create({
      id: msgId,
      match_id: matchId,
      sender_id: currentUserId,
      text: text.trim(),
      expires_at: expiresAt,
      is_warning: 0
    });

    // Update match activity timestamp
    await db.matches.touchMatch(matchId);

    const partnerId = match.user1_id === currentUserId ? match.user2_id : match.user1_id;

    // If partner is a seed peer persona, schedule automated response
    if (partnerId.startsWith('user-partner')) {
      setTimeout(async () => {
        try {
          const replies = [
            "That contradicts the telemetry data I analyzed in Q1.",
            "Spot on. And the VP level is deliberately masking it.",
            "Interesting angle. What's your take on the private equity angle?",
            "If you check the anonymous repo commits, the evidence is everywhere.",
            "Completely aligned. We saw the exact same margin squeeze in our infra audits."
          ];
          const replyText = replies[Math.floor(Math.random() * replies.length)];
          const replyExpiresAt = new Date(Date.now() + CONFIG.MESSAGE_DECAY_SECONDS * 1000).toISOString();

          await db.chatMessages.create({
            id: `msg-reply-${Date.now()}`,
            match_id: matchId,
            sender_id: partnerId,
            text: replyText,
            expires_at: replyExpiresAt,
            is_warning: 0
          });
        } catch (err) {
          console.error('Error generating peer reply:', err);
        }
      }, 1500);
    }

    res.json({
      success: true,
      message: {
        id: msgId,
        sender: 'me',
        senderHandle: req.user!.handle,
        text: text.trim(),
        timestamp: 'Just now',
        expiresInSeconds: CONFIG.MESSAGE_DECAY_SECONDS
      }
    });
  } catch (err) {
    next(err);
  }
});
