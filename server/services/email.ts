import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.RESEND_API_KEY;
const isConfigured = Boolean(apiKey);

let resendClient: Resend | null = null;
if (isConfigured) {
  try {
    resendClient = new Resend(apiKey);
  } catch (err) {
    console.warn('[RESEND_INIT_WARN] Failed to initialize Resend client:', err);
  }
}

export const EMAIL_CONFIG = {
  FROM: process.env.EMAIL_FROM || 'RUMR Sentinel <onboarding@resend.dev>',
  IS_CONFIGURED: isConfigured,
};

export const emailService = {
  isConfigured(): boolean {
    return Boolean(resendClient);
  },

  async sendOtpEmail(toEmail: string, otpCode: string): Promise<{ success: boolean; id?: string; simulated?: boolean }> {
    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Inter', -apple-system, sans-serif; background-color: #0E0E0E; color: #E5E2E1; padding: 40px 20px; }
          .container { max-width: 520px; margin: 0 auto; background-color: #1A1A1A; border: 2px solid #333333; padding: 32px; border-radius: 4px; }
          .header { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 900; color: #FFFFFF; margin-bottom: 8px; }
          .badge { display: inline-block; background-color: #CCFF00; color: #000000; font-family: 'Courier New', monospace; font-weight: 700; font-size: 11px; padding: 4px 8px; margin-bottom: 24px; text-transform: uppercase; }
          .code-box { background-color: #000000; border: 2px solid #CCFF00; padding: 20px; text-align: center; margin: 24px 0; }
          .code { font-family: 'Courier New', monospace; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #CCFF00; }
          .footer { font-size: 12px; color: #777777; margin-top: 32px; border-top: 1px solid #282828; padding-top: 16px; font-family: 'Courier New', monospace; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">RUMR</div>
          <div class="badge">Decentralized Mesh • Passcode</div>
          <p>Your one-time authentication passcode to access the anonymous topic mesh:</p>
          <div class="code-box">
            <div class="code">${otpCode}</div>
          </div>
          <p style="font-size: 13px; color: #A0A0A0;">This code expires in 10 minutes. If you did not initiate this request, safely ignore this transmission.</p>
          <div class="footer">
            Zero-Knowledge Verification • DPDP 2023 Compliant • Topic &gt; Person
          </div>
        </div>
      </body>
      </html>
    `;

    if (this.isConfigured() && resendClient) {
      try {
        const { data, error } = await resendClient.emails.send({
          from: EMAIL_CONFIG.FROM,
          to: toEmail,
          subject: `[RUMR] Verification Code: ${otpCode}`,
          html: htmlTemplate,
        });

        if (error) {
          console.warn('[RESEND_SEND_ERROR] Falling back to log:', error);
        } else if (data) {
          return { success: true, id: data.id };
        }
      } catch (err) {
        console.warn('[RESEND_DISPATCH_EXCEPTION]', err);
      }
    }

    // Dev/fallback logger
    console.log(`[RESEND_SENTINEL_DISPATCH] To: ${toEmail} | Code: ${otpCode}`);
    return { success: true, id: `mock-email-${Date.now()}`, simulated: true };
  },

  async verifyService(): Promise<{ ready: boolean; provider: string; configured: boolean }> {
    return {
      ready: true,
      provider: 'resend',
      configured: this.isConfigured()
    };
  }
};
