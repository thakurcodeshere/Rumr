import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { CONFIG } from './config.js';
import { db } from './db/database.js';
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

// Healthcheck & Metadata
app.get('/api/health', (req, res) => {
  res.json({
    status: 'SYS_ACTIVE',
    platform: 'RUMR Cryptographic Mesh Engine',
    version: '2.4.0-prod',
    timestamp: new Date().toISOString(),
    ephemeralDecayTtlSeconds: CONFIG.MESSAGE_DECAY_SECONDS
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

// Background Ephemeral Decay Job (purges expired messages every 60s)
const decayInterval = setInterval(() => {
  try {
    purgeExpiredMessages();
  } catch (err) {
    console.error('Ephemeral message decay error:', err);
  }
}, 60000);

// In production, serve static built files from dist
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));

// Only listen if executed directly (not required by test suite)
if (process.env.NODE_ENV !== 'test') {
  app.listen(CONFIG.PORT, () => {
    console.log(`\n======================================================`);
    console.log(`⚡ RUMR Engine Active on http://localhost:${CONFIG.PORT}`);
    console.log(`🛡️  Zero-Knowledge Telemetry & DPDP 2023 Enforced`);
    console.log(`⌛ Ephemeral Message Decay: ${CONFIG.MESSAGE_DECAY_SECONDS}s TTL`);
    console.log(`======================================================\n`);
  });
}
