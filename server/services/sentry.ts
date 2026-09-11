import * as Sentry from '@sentry/node';
import dotenv from 'dotenv';

dotenv.config();

const dsn = process.env.SENTRY_DSN;
const isConfigured = Boolean(dsn);

if (isConfigured) {
  try {
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
      release: 'rumr@2.4.0-prod',
    });
  } catch (err) {
    console.warn('[SENTRY_INIT_WARN] Failed to initialize Sentry:', err);
  }
}

export const sentryService = {
  isConfigured(): boolean {
    return isConfigured;
  },

  captureException(err: any, extra?: Record<string, any>): void {
    if (isConfigured) {
      Sentry.captureException(err, { extra });
    } else {
      console.error('[SENTRY_MOCK_CAPTURE]', err);
    }
  },

  captureMessage(msg: string, level: Sentry.SeverityLevel = 'info'): void {
    if (isConfigured) {
      Sentry.captureMessage(msg, level);
    } else {
      console.log(`[SENTRY_MOCK_MSG] [${level}] ${msg}`);
    }
  }
};
