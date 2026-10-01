import { Request, Response, NextFunction } from 'express';
import { redisService } from '../services/redis.js';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const memoryStore = new Map<string, RateLimitRecord>();

// Cleanup expired windows every 5 minutes
if (typeof setInterval !== 'undefined') {
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of memoryStore.entries()) {
      if (now > record.resetTime) {
        memoryStore.delete(key);
      }
    }
  }, 300000);
  if (cleanupTimer.unref) cleanupTimer.unref();
}

export function resetRateLimits(): void {
  memoryStore.clear();
}

export function createRateLimiter(options: { windowMs: number; max: number; message: string; keyPrefix?: string }) {
  const prefix = options.keyPrefix || 'rl';

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Rely on Express-sanitized req.ip governed by 'trust proxy' setting
    const ip = req.ip || req.socket.remoteAddress || 'unknown-ip';
    const key = `${prefix}:${ip}:${req.baseUrl || ''}${req.path}`;
    const now = Date.now();

    // Check Redis if configured (bypass in test mode for local deterministic isolation)
    if (redisService.isConfigured() && process.env.NODE_ENV !== 'test') {
      try {
        const currentCount = await redisService.get<number>(key) || 0;
        if (currentCount >= options.max) {
          res.status(429).json({
            error: 'RATE_LIMIT_EXCEEDED',
            message: options.message,
            retryAfterSeconds: Math.ceil(options.windowMs / 1000)
          });
          return;
        }
        await redisService.set(key, currentCount + 1, Math.ceil(options.windowMs / 1000));
        next();
        return;
      } catch {
        // Fall back to memoryStore
      }
    }

    const record = memoryStore.get(key);
    if (!record || now > record.resetTime) {
      memoryStore.set(key, { count: 1, resetTime: now + options.windowMs });
      next();
      return;
    }

    if (record.count >= options.max) {
      res.status(429).json({
        error: 'RATE_LIMIT_EXCEEDED',
        message: options.message,
        retryAfterSeconds: Math.ceil((record.resetTime - now) / 1000)
      });
      return;
    }

    record.count++;
    next();
  };
}

export const otpRateLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  message: 'Too many verification code requests. Please wait before trying again.',
  keyPrefix: 'otp-send'
});

export const otpVerifyRateLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10,
  message: 'Too many verification attempts from this network. Please wait before retrying.',
  keyPrefix: 'otp-verify'
});

export const chatRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: 'Message velocity exceeded. Keep debate cadence measured.',
  keyPrefix: 'chat'
});

export async function checkEmailOtpRateLimit(email: string): Promise<{ allowed: boolean; retryAfterSeconds?: number }> {
  const cleanEmail = email.trim().toLowerCase();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const max = 3; // max 3 OTP requests per 15 minutes per email
  const key = `rl:email-otp:${cleanEmail}`;
  const now = Date.now();

  if (redisService.isConfigured() && process.env.NODE_ENV !== 'test') {
    try {
      const current = await redisService.get<number>(key) || 0;
      if (current >= max) {
        return { allowed: false, retryAfterSeconds: Math.ceil(windowMs / 1000) };
      }
      await redisService.set(key, current + 1, Math.ceil(windowMs / 1000));
      return { allowed: true };
    } catch {
      // Fall back to memory
    }
  }

  const record = memoryStore.get(key);
  if (!record || now > record.resetTime) {
    memoryStore.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true };
  }

  if (record.count >= max) {
    return { allowed: false, retryAfterSeconds: Math.ceil((record.resetTime - now) / 1000) };
  }

  record.count++;
  return { allowed: true };
}
