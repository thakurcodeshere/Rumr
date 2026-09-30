import { db } from '../server/db/database.js';
import { generateToken } from '../server/middleware/auth.js';

export async function createTestUserToken(options: {
  email: string;
  handle?: string;
  isGuest?: boolean;
}): Promise<{ token: string; userId: string; handle: string }> {
  const cleanEmail = options.email.trim().toLowerCase();
  let user = await db.users.findByEmail(cleanEmail);

  if (!user) {
    const userId = `user-test-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const handle = options.handle || `tester_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
    user = await db.users.create({
      id: userId,
      email: cleanEmail,
      handle,
      chaos_index: 85,
      is_verified: 1,
      avatar_seed: `seed_${userId}`,
      age: 26,
      gender: 'Non-binary',
      intent: 'Conversations & Dating',
      city: 'Gurgaon, NCR',
      latitude: 28.4595,
      longitude: 77.0266,
      geo_broadcasting: 'approximate',
      ghost_mode: 0,
      global_radius: 50,
      role: 'Tech Contributor',
      tagline: 'Test debater',
      is_guest: options.isGuest ? 1 : 0
    });
  }

  const token = generateToken({
    userId: user.id,
    handle: user.handle,
    isGuest: Boolean(user.is_guest)
  });

  return { token, userId: user.id, handle: user.handle };
}
