import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LEGACY_FALLBACK_JWT = 'rumr-cryptographic-mesh-secret-key-2026-dpdp-ready';

export function validateJwtSecret(envSecret?: string, isProd?: boolean): string {
  const secret = envSecret || process.env.JWT_SECRET;
  const isProduction = isProd !== undefined ? isProd : (process.env.NODE_ENV === 'production' || !!process.env.VERCEL);

  if (isProduction) {
    if (!secret) {
      throw new Error('[FATAL_PRODUCTION_VIOLATION] JWT_SECRET must be set in production mode.');
    }
    if (secret === LEGACY_FALLBACK_JWT) {
      throw new Error('[FATAL_PRODUCTION_VIOLATION] Insecure legacy JWT_SECRET fallback detected in production.');
    }
    if (secret.length < 32) {
      throw new Error('[FATAL_PRODUCTION_VIOLATION] JWT_SECRET in production must have at least 32 characters of high entropy.');
    }
    return secret;
  }

  return secret || LEGACY_FALLBACK_JWT;
}

export const CONFIG = {
  PORT: parseInt(process.env.PORT || '3001', 10),
  JWT_SECRET: validateJwtSecret(),
  DB_PATH: process.env.DB_PATH || path.resolve(__dirname, '../data/rumr.db'),
  NODE_ENV: process.env.NODE_ENV || 'development',
  MESSAGE_DECAY_SECONDS: 300, // 5 minutes
  OTP_EXPIRY_SECONDS: 600, // 10 minutes
  DEFAULT_LOCATION: {
    city: 'Gurgaon, NCR',
    lat: 28.4595,
    lng: 77.0266
  }
};
