import {
  User,
  AuthOtp,
  Topic,
  UserTopic,
  UserResonanceTag,
  Rumor,
  RumorVote,
  Swipe,
  Match,
  UnmaskConsent,
  ChatMessage,
  Room,
  RoomParticipant,
  RoomMessage,
  Transaction,
  Report,
  BlockedEntity
} from './types.js';

export interface DatabaseAdapter {
  providerName: 'supabase' | 'sqlite';
  ping(): Promise<{ healthy: boolean; latencyMs: number; error?: string }>;

  users: {
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findByHandle(handle: string): Promise<User | null>;
    findByHandleExcludingUser(handle: string, excludeUserId: string): Promise<User | null>;
    create(userData: Partial<User>): Promise<User>;
    update(id: string, updates: Partial<User>): Promise<User>;
    updateBoost(id: string, boostTier: string, expiresAt: string): Promise<void>;
    delete(id: string): Promise<void>;
    findDiscoveryCandidates(options: {
      currentUserId: string;
      minAge: number;
      maxAge: number;
      gender?: string;
    }): Promise<Array<Pick<User, 'id' | 'handle' | 'age' | 'gender' | 'city' | 'latitude' | 'longitude' | 'chaos_index' | 'role'>>>;
    getPeerCandidates(currentUserId: string, limit?: number): Promise<Array<Pick<User, 'id' | 'handle' | 'age' | 'city'>>>;
  };

  authOtps: {
    create(otp: { id: string; email: string; otp_code_hash: string; expires_at: string; consumed?: number; attempts?: number }): Promise<void>;
    findLatestActive(email: string): Promise<AuthOtp | null>;
    incrementAttempts(id: string): Promise<void>;
    markConsumed(id: string): Promise<void>;
  };

  topics: {
    findAll(options?: { category?: string; search?: string }): Promise<Topic[]>;
    findById(id: string): Promise<Topic | null>;
    findByIdOrTitle(identifier: string): Promise<Topic | null>;
    create(topic: Partial<Topic>): Promise<Topic>;
    incrementDebaters(id: string, delta: number): Promise<number>;
  };

  userTopics: {
    findTopicIdsByUserId(userId: string): Promise<string[]>;
    findTopicsByUserId(userId: string): Promise<Array<{ id: string; title: string; category: string; match_rate: number }>>;
    subscribe(userId: string, topicId: string): Promise<void>;
    unsubscribe(userId: string, topicId: string): Promise<void>;
    isSubscribed(userId: string, topicId: string): Promise<boolean>;
    findSharedTopics(userId1: string, userId2: string): Promise<Array<{ title: string }>>;
  };

  userResonanceTags: {
    findByUserId(userId: string): Promise<string[]>;
    addTag(userId: string, tag: string): Promise<void>;
    removeTag(userId: string, tag: string): Promise<void>;
  };

  rumors: {
    findAll(options?: { category?: string; search?: string }): Promise<Array<Rumor & { topic_title: string; category: string; author_handle?: string; author_chaos_index?: number }>>;
    findById(id: string): Promise<Rumor | null>;
    create(rumor: Partial<Rumor>): Promise<Rumor>;
    updateVoteCount(id: string, agreesDelta: number, debatesDelta: number): Promise<void>;
    decrypt(id: string): Promise<void>;
  };

  rumorVotes: {
    findByRumorAndUser(rumorId: string, userId: string): Promise<RumorVote | null>;
    upsert(vote: { rumorId: string; userId: string; voteType: 'agree' | 'debate' }): Promise<void>;
  };

  swipes: {
    recordSwipe(swipe: { userId: string; targetUserId: string; direction: 'like' | 'pass' }): Promise<void>;
    findSwipe(userId: string, targetUserId: string): Promise<Swipe | null>;
    countByUserId(userId: string): Promise<number>;
  };

  matches: {
    findActiveByUserId(userId: string): Promise<Array<Match & { partner_id: string }>>;
    findById(id: string): Promise<Match | null>;
    create(match: Partial<Match>): Promise<Match>;
    updateStatus(id: string, status: 'active' | 'unmatched' | 'blocked'): Promise<void>;
    updateUnmaskStage(id: string, stage: number): Promise<void>;
    touchMatch(id: string): Promise<void>;
    countByUserId(userId: string): Promise<number>;
  };

  unmaskConsents: {
    findByMatchId(matchId: string): Promise<UnmaskConsent[]>;
    addConsent(consent: { matchId: string; userId: string; stage: number }): Promise<void>;
    getBilateralCount(matchId: string, stage: number): Promise<number>;
  };

  chatMessages: {
    findByMatchId(matchId: string): Promise<Array<ChatMessage & { sender_handle?: string }>>;
    getLatestByMatchId(matchId: string): Promise<ChatMessage | null>;
    create(msg: Partial<ChatMessage>): Promise<ChatMessage>;
    hasMessages(matchId: string): Promise<boolean>;
    countExpired(): Promise<number>;
    purgeExpired(): Promise<number>;
  };

  rooms: {
    findLive(): Promise<Array<Room & { host_handle?: string }>>;
    findById(id: string): Promise<Room | null>;
    incrementListeners(id: string, delta: number): Promise<void>;
  };

  roomParticipants: {
    findByRoomAndUser(roomId: string, userId: string): Promise<RoomParticipant | null>;
    addOrUpdate(participant: { roomId: string; userId: string; role?: 'host' | 'speaker' | 'listener'; isMuted?: boolean; isHandRaised?: boolean }): Promise<void>;
    remove(roomId: string, userId: string): Promise<void>;
    updateMic(roomId: string, userId: string, isMuted: boolean): Promise<void>;
    pruneInactive(hours: number): Promise<number>;
  };

  roomMessages: {
    findByRoomId(roomId: string): Promise<Array<RoomMessage & { sender_handle?: string }>>;
    create(msg: Partial<RoomMessage>): Promise<RoomMessage>;
  };

  transactions: {
    findByUserId(userId: string): Promise<Transaction[]>;
    create(tx: Partial<Transaction>): Promise<Transaction>;
  };

  reports: {
    create(report: Partial<Report>): Promise<Report>;
  };

  blockedEntities: {
    block(userId: string, blockedUserId: string): Promise<void>;
    isBlocked(userId: string, targetUserId: string): Promise<boolean>;
    getBlockedUserIds(userId: string): Promise<string[]>;
    countByUserId(userId: string): Promise<number>;
  };
}
