import { Client, Receiver } from '@upstash/qstash';
import dotenv from 'dotenv';

dotenv.config();

const qstashToken = process.env.QSTASH_TOKEN;
const currentSigningKey = process.env.QSTASH_CURRENT_SIGNING_KEY;
const nextSigningKey = process.env.QSTASH_NEXT_SIGNING_KEY;

export const QSTASH_CONFIG = {
  IS_CONFIGURED: Boolean(qstashToken),
  HAS_SIGNING_KEYS: Boolean(currentSigningKey && nextSigningKey),
};

let qstashClient: Client | null = null;
let qstashReceiver: Receiver | null = null;

if (QSTASH_CONFIG.IS_CONFIGURED) {
  try {
    qstashClient = new Client({ token: qstashToken! });
  } catch (err) {
    console.warn('[QSTASH_CLIENT_INIT] Failed to init client:', err);
  }
}

if (QSTASH_CONFIG.HAS_SIGNING_KEYS) {
  try {
    qstashReceiver = new Receiver({
      currentSigningKey: currentSigningKey!,
      nextSigningKey: nextSigningKey!,
    });
  } catch (err) {
    console.warn('[QSTASH_RECEIVER_INIT] Failed to init receiver:', err);
  }
}

export const qstashService = {
  isConfigured(): boolean {
    return QSTASH_CONFIG.IS_CONFIGURED && qstashClient !== null;
  },

  async verifySignature(signature: string | undefined, body: string): Promise<boolean> {
    if (!qstashReceiver || !signature) {
      // In dev / test or when keys are unconfigured, allow local loopback
      return true;
    }
    try {
      return await qstashReceiver.verify({ signature, body });
    } catch (err) {
      console.warn('[QSTASH_VERIFY] Webhook signature verification error:', err);
      return false;
    }
  },

  async enqueueDecayJob(targetUrl: string, delaySeconds: number = 60): Promise<{ messageId: string; status: string }> {
    if (this.isConfigured() && qstashClient) {
      try {
        const res = await qstashClient.publishJSON({
          url: targetUrl,
          body: { action: 'PURGE_EXPIRED_MESSAGES', timestamp: new Date().toISOString() },
          delay: delaySeconds,
        });
        return { messageId: res.messageId, status: 'enqueued' };
      } catch (err) {
        console.warn('[QSTASH_ENQUEUE] Error publishing job:', err);
      }
    }

    return {
      messageId: `mock-qstash-job-${Date.now()}`,
      status: 'simulated_local'
    };
  }
};
