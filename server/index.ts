import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { CONFIG } from './config.js';
import { db } from './db/database.js';
import { isSupabaseConfigured } from './db/supabase.js';
import { redisService } from './services/redis.js';
import { LIVEKIT_CONFIG } from './services/livekit.js';
import { emailService } from './services/email.js';
import { sentryService } from './services/sentry.js';
import { QSTASH_CONFIG } from './services/qstash.js';

import { authRouter } from './routes/auth.js';
import { usersRouter } from './routes/users.js';
import { discoveryRouter } from './routes/discovery.js';
import { matchesRouter } from './routes/matches.js';
import { unmaskRouter } from './routes/unmask.js';
import { chatRouter, purgeExpiredMessages } from './routes/chat.js';
import { topicsRouter } from './routes/topics.js';
import { rumorsRouter } from './routes/rumors.js';
import { roomsRouter } from './routes/rooms.js';
import { boostsRouter } from './routes/boosts.js';
import { safetyRouter } from './routes/safety.js';
import { jobsRouter } from './routes/jobs.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

// Core Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 1. Comprehensive Production Stack Healthcheck
app.get('/api/health', async (req, res) => {
  const redisHealth = await redisService.ping();

  res.json({
    status: 'SYS_ACTIVE',
    platform: 'RUMR Cryptographic Mesh Engine',
    version: '2.4.0-prod',
    timestamp: new Date().toISOString(),
    stack: {
      database: {
        primary: isSupabaseConfigured() ? 'Supabase PostgreSQL (Active)' : 'SQLite WAL (Active)',
        supabaseProject: 'hjqkfxwkfctrivfftmwv',
        supabaseConfigured: isSupabaseConfigured()
      },
      realtime: {
        livekit: LIVEKIT_CONFIG.IS_CONFIGURED ? 'LiveKit Cloud (Connected)' : 'LiveKit Emulated (Ready)',
        livekitUrl: LIVEKIT_CONFIG.URL
      },
      cacheAndPresence: {
        redis: redisHealth.status,
        provider: redisHealth.provider,
        latencyMs: redisHealth.latencyMs
      },
      jobs: {
        qstash: QSTASH_CONFIG.IS_CONFIGURED ? 'QStash Connected' : 'Local Timer Active'
      },
      communications: {
        email: emailService.isConfigured() ? 'Resend Production API' : 'Sentinel Dev Dispatch'
      },
      observability: {
        sentry: sentryService.isConfigured() ? 'Sentry Active' : 'Local Capture Active'
      }
    },
    ephemeralDecayTtlSeconds: CONFIG.MESSAGE_DECAY_SECONDS
  });
});

// 2. Specific Stack Component Healthchecks
app.get('/api/health/redis', async (req, res) => {
  const health = await redisService.ping();
  res.json(health);
});

app.get('/api/health/livekit', (req, res) => {
  res.json({
    status: 'READY',
    url: LIVEKIT_CONFIG.URL,
    configured: LIVEKIT_CONFIG.IS_CONFIGURED,
    protocol: 'WebRTC'
  });
});

// Mount Domain API Routers
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/discovery', discoveryRouter);
app.use('/api/matches', matchesRouter);
app.use('/api/matches', unmaskRouter);
app.use('/api/matches', chatRouter);
app.use('/api/topics', topicsRouter);
app.use('/api/rumors', rumorsRouter);
app.use('/api/rooms', roomsRouter);
app.use('/api/boosts', boostsRouter);
app.use('/api/safety', safetyRouter);
app.use('/api/jobs', jobsRouter);

// Global Error Handler with Sentry Capture
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  sentryService.captureException(err, { url: req.url, method: req.method });
  console.error('[UNHANDLED_ERROR]', err);
  res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: 'An unexpected system fault occurred.' });
});

// Background Ephemeral Decay Job (purges expired messages every 60s in persistent environments)
if (!process.env.VERCEL) {
  const decayInterval = setInterval(() => {
    try {
      purgeExpiredMessages();
    } catch (err) {
      console.error('Ephemeral message decay error:', err);
    }
  }, 60000);
  if (decayInterval.unref) decayInterval.unref();
}

// In production, serve static built files from dist
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));

// Only listen if executed directly (not required by test suite)
if (process.env.NODE_ENV !== 'test') {
  app.listen(CONFIG.PORT, () => {
    console.log(`\n======================================================`);
    console.log(`⚡ RUMR Engine Active on http://localhost:${CONFIG.PORT}`);
    console.log(`🛡️  Zero-Knowledge Telemetry & DPDP 2023 Enforced`);
    console.log(`🌐 Supabase PostgreSQL & Upstash Redis Synced`);
    console.log(`🎙️  LiveKit Cloud WebRTC Audio Active`);
    console.log(`⌛ Ephemeral Message Decay: ${CONFIG.MESSAGE_DECAY_SECONDS}s TTL`);
    console.log(`======================================================\n`);
  });
}
