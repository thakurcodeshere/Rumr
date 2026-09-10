import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

export function createRateLimiter(options: { windowMs: number; max: number; message: string }) {
  const store = new Map<string, RateLimitRecord>();

  // Cleanup expired windows every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      if (now > record.resetTime) {
        store.delete(key);
      }
    }
  }, 300000);

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown-ip';
    const key = `${ip}:${req.path}`;
    const now = Date.now();

    const record = store.get(key);
    if (!record || now > record.resetTime) {
      store.set(key, { count: 1, resetTime: now + options.windowMs });
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
  message: 'Too many verification code requests. Please wait before trying again.'
});

export const chatRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: 'Message velocity exceeded. Keep debate cadence measured.'
});
