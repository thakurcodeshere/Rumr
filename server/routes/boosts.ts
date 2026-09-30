import { Router } from 'express';
import { db } from '../db/database.js';
import { requireAuth, requireRegistered, AuthenticatedRequest } from '../middleware/auth.js';

export const boostsRouter = Router();

const PLANS = [
  {
    id: 'tier-pulse',
    name: 'Topic Pulse',
    price: '$4.99',
    multiplier: '3x Impressions',
    features: ['Priority in regional Discovery Feed', 'Encrypted fast-lane AI matching', 'Badge: Verified Whisperer']
  },
  {
    id: 'tier-supercharged',
    name: 'Supercharged Node',
    price: '$12.99',
    multiplier: '10x Impressions',
    isPopular: true,
    features: ['Pinned to Top Debate Carousel for 48h', 'Unlimited mutual unmasking requests', 'Access to Private Audio Rooms', 'Deep AI Telemetry Analytics']
  },
  {
    id: 'tier-dominance',
    name: 'Network Dominance',
    price: '$29.99',
    multiplier: '25x Global Reach',
    features: ['Global Syndicate Feed Distribution', 'Host Multi-speaker Public Rooms', 'Custom Cipher Badge', 'Zero Message Rate Limiting']
  }
];

// 1. Get Boost Plans
boostsRouter.get('/plans', (req, res) => {
  res.json({ plans: PLANS });
});

// 2. Purchase / Unlock Boost Tier
boostsRouter.post('/purchase', requireAuth, requireRegistered, async (req: AuthenticatedRequest, res, next) => {
  try {
    const currentUserId = req.user!.id;
    const { tierName } = req.body;

    const plan = PLANS.find(p => p.name === tierName || p.id === tierName) || PLANS[0];
    const txId = `tx-${Date.now()}`;
    const expiresAt = new Date(Date.now() + 24 * 3600 * 1000).toISOString();

    // Record transaction
    await db.transactions.create({
      id: txId,
      user_id: currentUserId,
      tier_name: plan.name,
      amount: plan.price,
      status: 'completed'
    });

    // Update user boost status
    await db.users.updateBoost(currentUserId, plan.name, expiresAt);

    res.json({
      success: true,
      boostTier: plan.name,
      expiresAt,
      message: `Successfully unlocked ${plan.name}. Your debates are prioritized across all regional feeds.`
    });
  } catch (err) {
    next(err);
  }
});
