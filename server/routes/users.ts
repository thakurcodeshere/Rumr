import { Router } from 'express';
import { db } from '../db/database.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { validateTopicTitle } from '../middleware/sentinel.js';

export const usersRouter = Router();

// 1. Get Current User Profile with Resonance Graph
usersRouter.get('/me', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = req.user!;

    const [subscriptions, resonanceTags, blockedCount] = await Promise.all([
      db.userTopics.findTopicsByUserId(user.id),
      db.userResonanceTags.findByUserId(user.id),
      db.blockedEntities.countByUserId(user.id)
    ]);

    res.json({
      user: {
        ...user,
        isVerified: Boolean(user.is_verified),
        isGuest: Boolean(user.is_guest),
        ghostMode: Boolean(user.ghost_mode),
        subscribedTopicIds: subscriptions.map(s => s.id),
        topics: subscriptions.map(s => ({
          id: s.id,
          title: s.title,
          category: s.category,
          matchRate: s.match_rate
        })),
        activeRumors: resonanceTags,
        blockedCount
      }
    });
  } catch (err) {
    next(err);
  }
});

// 2. Update Profile & Settings
usersRouter.patch('/me', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = req.user!;
    const {
      ghostMode,
      globalRadius,
      geoBroadcasting,
      city,
      coords,
      role,
      tagline,
      realName,
      realPhoto
    } = req.body;

    const updates: any = {};

    if (ghostMode !== undefined) {
      updates.ghost_mode = ghostMode ? 1 : 0;
    }
    if (globalRadius !== undefined) {
      updates.global_radius = parseInt(globalRadius, 10);
    }
    if (geoBroadcasting !== undefined) {
      updates.geo_broadcasting = geoBroadcasting;
    }
    if (city !== undefined) {
      updates.city = city;
    }
    if (coords && coords.lat !== undefined && coords.lng !== undefined) {
      updates.latitude = coords.lat;
      updates.longitude = coords.lng;
    }
    if (role !== undefined) {
      updates.role = role;
    }
    if (tagline !== undefined) {
      updates.tagline = tagline;
    }
    if (realName !== undefined) {
      updates.real_name = realName;
    }
    if (realPhoto !== undefined) {
      updates.real_photo = realPhoto;
    }

    let updated = user;
    if (Object.keys(updates).length > 0) {
      updated = (await db.users.update(user.id, updates)) as any;
    }

    res.json({
      success: true,
      user: {
        ...updated,
        isVerified: Boolean(updated.is_verified),
        isGuest: Boolean(updated.is_guest),
        ghostMode: Boolean(updated.ghost_mode)
      }
    });
  } catch (err) {
    next(err);
  }
});

// 3. Inject 3-Word Resonance Tag into Profile
usersRouter.post('/me/rumors', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = req.user!;
    const { tag } = req.body;

    if (!tag || typeof tag !== 'string' || !tag.trim()) {
      res.status(400).json({ error: 'EMPTY_TAG', message: 'Resonance tag cannot be blank.' });
      return;
    }

    const validation = validateTopicTitle(tag);
    if (!validation.allowed) {
      res.status(422).json({
        error: 'CONSTRAINT_VIOLATION',
        message: validation.reason
      });
      return;
    }

    const formatted = tag.trim().toUpperCase().replace(/\s+/g, '_');
    await db.userResonanceTags.addTag(user.id, formatted);
    const tags = await db.userResonanceTags.findByUserId(user.id);

    res.json({
      success: true,
      activeRumors: tags
    });
  } catch (err) {
    next(err);
  }
});

// 4. Remove Resonance Tag from Profile
usersRouter.delete('/me/rumors/:tag', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = req.user!;
    const { tag } = req.params;

    await db.userResonanceTags.removeTag(user.id, tag);
    const tags = await db.userResonanceTags.findByUserId(user.id);

    res.json({ success: true, activeRumors: tags });
  } catch (err) {
    next(err);
  }
});

// 5. Get User Transaction History
usersRouter.get('/me/transactions', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = req.user!;
    const transactions = await db.transactions.findByUserId(user.id);
    res.json({ transactions });
  } catch (err) {
    next(err);
  }
});

// 6. DPDP Act 2023 Machine-Readable Data Export
usersRouter.get('/me/dpdp-export', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = req.user!;

    const [topics, tags, swipesCount, matchesCount, transactions] = await Promise.all([
      db.userTopics.findTopicsByUserId(user.id),
      db.userResonanceTags.findByUserId(user.id),
      db.swipes.countByUserId(user.id),
      db.matches.countByUserId(user.id),
      db.transactions.findByUserId(user.id)
    ]);

    const exportArchive = {
      exportDate: new Date().toISOString(),
      legalStandard: 'Digital Personal Data Protection (DPDP) Act 2023 §12',
      dataPrincipal: {
        id: user.id,
        email: user.email,
        handle: user.handle,
        age: user.age,
        gender: user.gender,
        city: user.city,
        chaosIndex: user.chaos_index,
        accountCreatedAt: (user as any).created_at || new Date().toISOString()
      },
      quarantinedIdentityLayers: {
        role: user.role,
        tagline: user.tagline,
        realName: user.real_name,
        realPhoto: user.real_photo
      },
      activityTelemetry: {
        subscribedTopics: topics.map(t => ({ title: t.title, category: t.category })),
        resonanceRumorTags: tags,
        lifetimeSwipesCount: swipesCount,
        activeMatchesCount: matchesCount,
        transactions
      },
      cryptographicZeroKnowledgeStatement: 'Ephemeral messages are deleted per TTL. Browsing telemetry unhashed and unpersisted.'
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=rumr-dpdp-export-${user.handle}.json`);
    res.send(JSON.stringify(exportArchive, null, 2));
  } catch (err) {
    next(err);
  }
});

// 7. Statutory Account Erasure (Right to Be Forgotten)
usersRouter.delete('/me', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    await db.users.delete(userId);

    res.json({
      success: true,
      message: 'User account and all associated cryptographic records have been permanently erased under DPDP Act 2023.'
    });
  } catch (err) {
    next(err);
  }
});
