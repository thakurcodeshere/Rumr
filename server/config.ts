import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const CONFIG = {
  PORT: parseInt(process.env.PORT || '3001', 10),
  JWT_SECRET: process.env.JWT_SECRET || 'rumr-cryptographic-mesh-secret-key-2026-dpdp-ready',
  DB_PATH: process.env.DB_PATH || (process.env.VERCEL ? '/tmp/rumr.db' : path.resolve(__dirname, '../data/rumr.db')),
  NODE_ENV: process.env.NODE_ENV || 'development',
  MESSAGE_DECAY_SECONDS: 300, // 5 minutes
  OTP_EXPIRY_SECONDS: 600, // 10 minutes
  DEFAULT_LOCATION: {
    city: 'Gurgaon, NCR',
    lat: 28.4595,
    lng: 77.0266
  }
};
