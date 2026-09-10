import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { CONFIG } from '../config.js';
import { db } from '../db/database.js';

export interface UserTokenPayload {
  userId: string;
  handle: string;
  isGuest: boolean;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string | null;
    handle: string;
    chaos_index: number;
    is_verified: number;
    boost_tier: string | null;
    avatar_seed: string;
    age: number;
    gender: string;
    intent: string;
    city: string;
    latitude: number;
    longitude: number;
    geo_broadcasting: string;
    ghost_mode: number;
    global_radius: number;
    similarity_mode: string;
    role: string;
    tagline: string;
    real_name: string | null;
    real_photo: string | null;
    is_guest: number;
  };
}

export function generateToken(payload: UserTokenPayload, expiresIn = '30d'): string {
  return jwt.sign(payload, CONFIG.JWT_SECRET, { expiresIn: expiresIn as any });
}

export function verifyToken(token: string): UserTokenPayload | null {
  try {
    return jwt.verify(token, CONFIG.JWT_SECRET) as UserTokenPayload;
  } catch {
    return null;
  }
}

export function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  if (req.cookies && req.cookies.rumr_token) {
    return req.cookies.rumr_token;
  }
  return null;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({ error: 'UNAUTHORIZED', message: 'Authentication token required' });
    return;
  }

  const payload = verifyToken(token);
  if (!payload || !payload.userId) {
    res.status(401).json({ error: 'INVALID_TOKEN', message: 'Token expired or invalid' });
    return;
  }

  const user = db.prepare(`
    SELECT * FROM users WHERE id = ?
  `).get(payload.userId) as AuthenticatedRequest['user'];

  if (!user) {
    res.status(401).json({ error: 'USER_NOT_FOUND', message: 'User record no longer exists' });
    return;
  }

  req.user = user;
  next();
}

export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const token = extractToken(req);
  if (token) {
    const payload = verifyToken(token);
    if (payload && payload.userId) {
      const user = db.prepare(`
        SELECT * FROM users WHERE id = ?
      `).get(payload.userId) as AuthenticatedRequest['user'];
      if (user) {
        req.user = user;
      }
    }
  }
  next();
}

export function requireRegistered(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.is_guest === 1) {
    res.status(403).json({
      error: 'GUEST_RESTRICTION',
      message: 'This feature requires a registered account with email verification.'
    });
    return;
  }
  next();
}
