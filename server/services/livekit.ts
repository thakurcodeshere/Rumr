import { AccessToken } from 'livekit-server-sdk';
import dotenv from 'dotenv';

dotenv.config();

export interface LiveKitTokenOptions {
  identity: string;
  roomName: string;
  participantName?: string;
  canPublish?: boolean;
  canSubscribe?: boolean;
  metadata?: Record<string, any>;
}

export const LIVEKIT_CONFIG = {
  URL: process.env.LIVEKIT_URL || 'wss://rumr-mesh.livekit.cloud',
  API_KEY: process.env.LIVEKIT_API_KEY || 'devkey',
  API_SECRET: process.env.LIVEKIT_API_SECRET || 'secret_rumr_livekit_mesh_2026_safe_token',
  IS_CONFIGURED: Boolean(process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_API_SECRET)
};

export async function createLiveKitToken(options: LiveKitTokenOptions): Promise<{ token: string; wsUrl: string; isMock: boolean }> {
  const { identity, roomName, participantName, canPublish = true, canSubscribe = true, metadata } = options;

  try {
    const at = new AccessToken(LIVEKIT_CONFIG.API_KEY, LIVEKIT_CONFIG.API_SECRET, {
      identity,
      name: participantName || identity,
      metadata: metadata ? JSON.stringify(metadata) : undefined,
      ttl: '2h',
    });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish,
      canSubscribe,
    });

    const token = await at.toJwt();
    return {
      token,
      wsUrl: LIVEKIT_CONFIG.URL,
      isMock: !LIVEKIT_CONFIG.IS_CONFIGURED
    };
  } catch (err) {
    // Fallback deterministic safe token
    const fallbackPayload = Buffer.from(JSON.stringify({
      sub: identity,
      video: { room: roomName, roomJoin: true, canPublish, canSubscribe },
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7200
    })).toString('base64');

    return {
      token: `mock-livekit-jwt.${fallbackPayload}.sig`,
      wsUrl: LIVEKIT_CONFIG.URL,
      isMock: true
    };
  }
}
