import { Router } from 'express';
import { db } from '../db/database.js';
import { purgeExpiredMessages } from './chat.js';
import { qstashService, QSTASH_CONFIG } from '../services/qstash.js';

export const jobsRouter = Router();

// 1. Scheduled Decay Webhook (Triggered by Upstash QStash or cron)
jobsRouter.post('/decay', async (req, res) => {
  const signature = req.headers['upstash-signature'] as string | undefined;
  const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

  if (QSTASH_CONFIG.HAS_SIGNING_KEYS) {
    const isValid = await qstashService.verifySignature(signature, rawBody);
    if (!isValid) {
      res.status(401).json({ error: 'UNAUTHORIZED_SIGNATURE', message: 'QStash signature verification failed.' });
      return;
    }
  }

  try {
    // 1. Purge expired chat messages
    const beforeCount = (db.prepare(`SELECT count(*) as c FROM chat_messages WHERE expires_at <= datetime('now')`).get() as any)?.c || 0;
    purgeExpiredMessages();

    // 2. Prune inactive audio room participants (>2 hours joined)
    db.prepare(`
      DELETE FROM room_participants 
      WHERE joined_at < datetime('now', '-2 hours')
    `).run();

    res.json({
      success: true,
      action: 'EPHEMERAL_PURGE_COMPLETE',
      messagesPurged: beforeCount,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('[JOBS_DECAY_ERROR]', err);
    res.status(500).json({ error: 'DECAY_JOB_FAILED', message: String(err) });
  }
});

// 2. Job Engine Status
jobsRouter.get('/status', (req, res) => {
  res.json({
    status: 'ACTIVE',
    qstashConfigured: QSTASH_CONFIG.IS_CONFIGURED,
    hasSigningKeys: QSTASH_CONFIG.HAS_SIGNING_KEYS,
    endpoints: {
      decayWebhook: '/api/jobs/decay',
      scheduleInterval: '60s (Every minute)'
    },
    timestamp: new Date().toISOString()
  });
});
