import { Router } from 'express';
import { db } from '../db/database.js';
import { optionalAuth, requireAuth, requireRegistered, AuthenticatedRequest } from '../middleware/auth.js';
import { createLiveKitToken } from '../services/livekit.js';

export const roomsRouter = Router();

// 1. Get Live Audio Debate Rooms
roomsRouter.get('/', optionalAuth, (req: AuthenticatedRequest, res) => {
  const rooms = db.prepare(`
    SELECT r.*, u.handle as host_handle
    FROM rooms r
    LEFT JOIN users u ON u.id = r.host_id
    WHERE r.is_live = 1
    ORDER BY r.listeners DESC
  `).all() as any[];

  res.json({
    rooms: rooms.map(r => ({
      id: r.id,
      title: r.title,
      category: r.category,
      activeSpeakers: r.active_speakers,
      listeners: r.listeners,
      isLive: Boolean(r.is_live),
      isPrivate: Boolean(r.is_private),
      hostHandle: r.host_handle || 'void_host',
      recentDebate: r.recent_debate || 'Broadcasting live topic debate.'
    }))
  });
});

// 2. Join a Room
roomsRouter.post('/:roomId/join', requireAuth, (req: AuthenticatedRequest, res) => {
  const currentUserId = req.user!.id;
  const { roomId } = req.params;

  const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(roomId) as any;
  if (!room) {
    res.status(404).json({ error: 'ROOM_NOT_FOUND', message: 'Audio room not found.' });
    return;
  }

  // Add participant
  db.prepare(`
    INSERT OR REPLACE INTO room_participants (room_id, user_id, role, is_muted, is_hand_raised)
    VALUES (?, ?, 'listener', 1, 0)
  `).run(roomId, currentUserId);

  db.prepare('UPDATE rooms SET listeners = listeners + 1 WHERE id = ?').run(roomId);

  res.json({ success: true, role: 'listener', isMuted: true });
});

// 3. Leave Room
roomsRouter.post('/:roomId/leave', requireAuth, (req: AuthenticatedRequest, res) => {
  const currentUserId = req.user!.id;
  const { roomId } = req.params;

  db.prepare('DELETE FROM room_participants WHERE room_id = ? AND user_id = ?').run(roomId, currentUserId);
  db.prepare('UPDATE rooms SET listeners = MAX(0, listeners - 1) WHERE id = ?').run(roomId);

  res.json({ success: true });
});

// 4. Toggle Mic
roomsRouter.post('/:roomId/mic', requireAuth, requireRegistered, (req: AuthenticatedRequest, res) => {
  const currentUserId = req.user!.id;
  const { roomId } = req.params;

  const participant = db.prepare('SELECT is_muted FROM room_participants WHERE room_id = ? AND user_id = ?').get(roomId, currentUserId) as { is_muted: number } | undefined;

  const newMuted = participant ? (participant.is_muted ? 0 : 1) : 0;
  db.prepare('UPDATE room_participants SET is_muted = ? WHERE room_id = ? AND user_id = ?').run(newMuted, roomId, currentUserId);

  res.json({ success: true, isMuted: Boolean(newMuted), isMicActive: !Boolean(newMuted) });
});

// 5. Get Room Messages
roomsRouter.get('/:roomId/messages', optionalAuth, (req: AuthenticatedRequest, res) => {
  const { roomId } = req.params;
  const rawMsgs = db.prepare(`
    SELECT m.*, u.handle as sender_handle
    FROM room_messages m
    LEFT JOIN users u ON u.id = m.sender_id
    WHERE m.room_id = ?
    ORDER BY m.created_at ASC
  `).all(roomId) as any[];

  const currentUserId = req.user ? req.user.id : null;

  res.json({
    messages: rawMsgs.map(m => ({
      id: m.id,
      sender: m.sender_handle || 'anonymous_debater',
      isMe: currentUserId === m.sender_id,
      text: m.text,
      stance: m.stance,
      timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }))
  });
});

// 6. Send Room Message / Reaction
roomsRouter.post('/:roomId/messages', requireAuth, (req: AuthenticatedRequest, res) => {
  const currentUserId = req.user!.id;
  const { roomId } = req.params;
  const { text, stance } = req.body;

  if (!text || !text.trim()) {
    res.status(400).json({ error: 'EMPTY_TEXT', message: 'Message cannot be blank.' });
    return;
  }

  const msgId = `m-${Date.now()}`;
  db.prepare(`
    INSERT INTO room_messages (id, room_id, sender_id, text, stance)
    VALUES (?, ?, ?, ?, ?)
  `).run(msgId, roomId, currentUserId, text.trim(), stance || null);

  res.json({
    success: true,
    message: {
      id: msgId,
      sender: req.user!.handle,
      isMe: true,
      text: text.trim(),
      stance,
      timestamp: 'Just now'
    }
  });
});

// 7. Issue LiveKit WebRTC Audio Token
roomsRouter.get('/:roomId/token', optionalAuth, async (req: AuthenticatedRequest, res) => {
  const { roomId } = req.params;
  const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(roomId) as any;

  if (!room) {
    res.status(404).json({ error: 'ROOM_NOT_FOUND', message: 'Audio room not found.' });
    return;
  }

  const userId = req.user ? req.user.id : `guest-${Date.now().toString(36)}`;
  const userHandle = req.user ? req.user.handle : `anonymous_${userId.slice(-4)}`;

  // Determine if participant can speak
  const participant = req.user ? db.prepare('SELECT role, is_muted FROM room_participants WHERE room_id = ? AND user_id = ?').get(roomId, userId) as any : null;
  const canPublish = participant ? participant.role === 'speaker' || participant.role === 'host' : false;

  const tokenResult = await createLiveKitToken({
    identity: userId,
    roomName: roomId,
    participantName: userHandle,
    canPublish,
    canSubscribe: true,
    metadata: {
      handle: userHandle,
      role: participant?.role || 'listener',
      isVerified: req.user?.is_verified ? true : false
    }
  });

  res.json({
    success: true,
    roomId,
    token: tokenResult.token,
    wsUrl: tokenResult.wsUrl,
    canPublish,
    identity: userId,
    isMock: tokenResult.isMock
  });
});
