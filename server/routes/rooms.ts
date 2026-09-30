import { Router } from 'express';
import { db } from '../db/database.js';
import { optionalAuth, requireAuth, requireRegistered, AuthenticatedRequest } from '../middleware/auth.js';
import { createLiveKitToken } from '../services/livekit.js';

export const roomsRouter = Router();

// 1. Get Live Audio Debate Rooms
roomsRouter.get('/', optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const rooms = await db.rooms.findLive();

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
  } catch (err) {
    next(err);
  }
});

// 2. Join a Room
roomsRouter.post('/:roomId/join', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const currentUserId = req.user!.id;
    const { roomId } = req.params;

    const room = await db.rooms.findById(roomId);
    if (!room) {
      res.status(404).json({ error: 'ROOM_NOT_FOUND', message: 'Audio room not found.' });
      return;
    }

    // Add participant
    await db.roomParticipants.addOrUpdate({
      roomId,
      userId: currentUserId,
      role: 'listener',
      isMuted: true,
      isHandRaised: false
    });

    await db.rooms.incrementListeners(roomId, 1);

    res.json({ success: true, role: 'listener', isMuted: true });
  } catch (err) {
    next(err);
  }
});

// 3. Leave Room
roomsRouter.post('/:roomId/leave', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const currentUserId = req.user!.id;
    const { roomId } = req.params;

    await db.roomParticipants.remove(roomId, currentUserId);
    await db.rooms.incrementListeners(roomId, -1);

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// 4. Toggle Mic
roomsRouter.post('/:roomId/mic', requireAuth, requireRegistered, async (req: AuthenticatedRequest, res, next) => {
  try {
    const currentUserId = req.user!.id;
    const { roomId } = req.params;

    const participant = await db.roomParticipants.findByRoomAndUser(roomId, currentUserId);
    const newMuted = participant ? (participant.is_muted ? false : true) : false;

    await db.roomParticipants.updateMic(roomId, currentUserId, newMuted);

    res.json({ success: true, isMuted: Boolean(newMuted), isMicActive: !Boolean(newMuted) });
  } catch (err) {
    next(err);
  }
});

// 5. Get Room Messages
roomsRouter.get('/:roomId/messages', optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { roomId } = req.params;
    const rawMsgs = await db.roomMessages.findByRoomId(roomId);
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
  } catch (err) {
    next(err);
  }
});

// 6. Send Room Message / Reaction
roomsRouter.post('/:roomId/messages', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const currentUserId = req.user!.id;
    const { roomId } = req.params;
    const { text, stance } = req.body;

    if (!text || !text.trim()) {
      res.status(400).json({ error: 'EMPTY_TEXT', message: 'Message cannot be blank.' });
      return;
    }

    const msgId = `m-${Date.now()}`;
    await db.roomMessages.create({
      id: msgId,
      room_id: roomId,
      sender_id: currentUserId,
      text: text.trim(),
      stance: stance || null
    });

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
  } catch (err) {
    next(err);
  }
});

// 7. Issue LiveKit WebRTC Audio Token
roomsRouter.get('/:roomId/token', optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const roomId = Array.isArray(req.params.roomId) ? req.params.roomId[0] : req.params.roomId;
    const room = await db.rooms.findById(roomId);

    if (!room) {
      res.status(404).json({ error: 'ROOM_NOT_FOUND', message: 'Audio room not found.' });
      return;
    }

    const userId = req.user ? req.user.id : `guest-${Date.now().toString(36)}`;
    const userHandle = req.user ? req.user.handle : `anonymous_${userId.slice(-4)}`;

    // Determine if participant can speak
    const participant = req.user ? await db.roomParticipants.findByRoomAndUser(roomId, userId) : null;
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
  } catch (err) {
    next(err);
  }
});
