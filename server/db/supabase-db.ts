import { SupabaseClient } from '@supabase/supabase-js';
import { DatabaseAdapter } from './interface.js';
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

export class SupabaseDatabase implements DatabaseAdapter {
  public providerName: 'supabase' = 'supabase';
  private client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  async ping(): Promise<{ healthy: boolean; latencyMs: number; error?: string }> {
    const start = Date.now();
    try {
      const { error } = await this.client.from('users').select('id', { count: 'exact', head: true }).limit(1);
      const latencyMs = Date.now() - start;
      if (error) {
        return { healthy: false, latencyMs, error: error.message };
      }
      return { healthy: true, latencyMs };
    } catch (err: any) {
      return { healthy: false, latencyMs: Date.now() - start, error: err?.message || String(err) };
    }
  }

  users = {
    findById: async (id: string): Promise<User | null> => {
      const { data, error } = await this.client.from('users').select('*').eq('id', id).maybeSingle();
      if (error) throw new Error(`[SupabaseDB.users.findById] ${error.message}`);
      return (data as User) || null;
    },

    findByEmail: async (email: string): Promise<User | null> => {
      const { data, error } = await this.client.from('users').select('*').eq('email', email.trim().toLowerCase()).maybeSingle();
      if (error) throw new Error(`[SupabaseDB.users.findByEmail] ${error.message}`);
      return (data as User) || null;
    },

    findByHandle: async (handle: string): Promise<User | null> => {
      const { data, error } = await this.client.from('users').select('*').eq('handle', handle).maybeSingle();
      if (error) throw new Error(`[SupabaseDB.users.findByHandle] ${error.message}`);
      return (data as User) || null;
    },

    findByHandleExcludingUser: async (handle: string, excludeUserId: string): Promise<User | null> => {
      const { data, error } = await this.client
        .from('users')
        .select('*')
        .eq('handle', handle)
        .neq('id', excludeUserId)
        .maybeSingle();
      if (error) throw new Error(`[SupabaseDB.users.findByHandleExcludingUser] ${error.message}`);
      return (data as User) || null;
    },

    create: async (userData: Partial<User>): Promise<User> => {
      const { data, error } = await this.client.from('users').insert(userData).select().single();
      if (error) throw new Error(`[SupabaseDB.users.create] ${error.message}`);
      return data as User;
    },

    update: async (id: string, updates: Partial<User>): Promise<User> => {
      const cleanUpdates = { ...updates, updated_at: new Date().toISOString() };
      const { data, error } = await this.client.from('users').update(cleanUpdates).eq('id', id).select().single();
      if (error) throw new Error(`[SupabaseDB.users.update] ${error.message}`);
      return data as User;
    },

    updateBoost: async (id: string, boostTier: string, expiresAt: string): Promise<void> => {
      const { error } = await this.client
        .from('users')
        .update({ boost_tier: boostTier, boost_expires_at: expiresAt, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw new Error(`[SupabaseDB.users.updateBoost] ${error.message}`);
    },

    delete: async (id: string): Promise<void> => {
      const { error } = await this.client.from('users').delete().eq('id', id);
      if (error) throw new Error(`[SupabaseDB.users.delete] ${error.message}`);
    },

    findDiscoveryCandidates: async (options: {
      currentUserId: string;
      minAge: number;
      maxAge: number;
      gender?: string;
    }): Promise<Array<Pick<User, 'id' | 'handle' | 'age' | 'gender' | 'city' | 'latitude' | 'longitude' | 'chaos_index' | 'role'>>> => {
      const blockedIds = await this.blockedEntities.getBlockedUserIds(options.currentUserId);
      const { data: swipesData } = await this.client
        .from('swipes')
        .select('target_user_id')
        .eq('user_id', options.currentUserId);
      const swipedIds = new Set((swipesData || []).map((s: any) => s.target_user_id));

      let query = this.client
        .from('users')
        .select('id, handle, age, gender, city, latitude, longitude, chaos_index, role')
        .neq('id', options.currentUserId)
        .eq('is_guest', 0)
        .eq('ghost_mode', 0)
        .gte('age', options.minAge)
        .lte('age', options.maxAge);

      if (options.gender && options.gender !== 'everyone') {
        const targetGender = options.gender === 'women' ? 'Women' : 'Men';
        query = query.in('gender', [targetGender, 'Non-binary']);
      }

      const { data, error } = await query;
      if (error) throw new Error(`[SupabaseDB.users.findDiscoveryCandidates] ${error.message}`);

      const blockedSet = new Set(blockedIds);
      return ((data || []) as any[]).filter(u => !blockedSet.has(u.id) && !swipedIds.has(u.id));
    },

    getPeerCandidates: async (currentUserId: string, limit = 3): Promise<Array<Pick<User, 'id' | 'handle' | 'age' | 'city'>>> => {
      const { data, error } = await this.client
        .from('users')
        .select('id, handle, age, city')
        .neq('id', currentUserId)
        .limit(limit);
      if (error) throw new Error(`[SupabaseDB.users.getPeerCandidates] ${error.message}`);
      return (data || []) as any[];
    }
  };

  authOtps = {
    create: async (otp: { id: string; email: string; otp_code_hash: string; expires_at: string; consumed?: number; attempts?: number }): Promise<void> => {
      const { error } = await this.client.from('auth_otps').insert({
        id: otp.id,
        email: otp.email.trim().toLowerCase(),
        otp_code_hash: otp.otp_code_hash,
        expires_at: otp.expires_at,
        consumed: otp.consumed ?? 0,
        attempts: otp.attempts ?? 0
      });
      if (error) throw new Error(`[SupabaseDB.authOtps.create] ${error.message}`);
    },

    findLatestActive: async (email: string): Promise<AuthOtp | null> => {
      const cleanEmail = email.trim().toLowerCase();
      const nowIso = new Date().toISOString();
      const { data, error } = await this.client
        .from('auth_otps')
        .select('*')
        .eq('email', cleanEmail)
        .eq('consumed', 0)
        .lt('attempts', 5)
        .gt('expires_at', nowIso)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw new Error(`[SupabaseDB.authOtps.findLatestActive] ${error.message}`);
      return (data as AuthOtp) || null;
    },

    incrementAttempts: async (id: string): Promise<void> => {
      const { data } = await this.client.from('auth_otps').select('attempts').eq('id', id).maybeSingle();
      const current = data?.attempts ?? 0;
      const { error } = await this.client.from('auth_otps').update({ attempts: current + 1 }).eq('id', id);
      if (error) throw new Error(`[SupabaseDB.authOtps.incrementAttempts] ${error.message}`);
    },

    markConsumed: async (id: string): Promise<boolean> => {
      const { data, error } = await this.client
        .from('auth_otps')
        .update({ consumed: 1 })
        .eq('id', id)
        .eq('consumed', 0)
        .select('id');
      if (error) throw new Error(`[SupabaseDB.authOtps.markConsumed] ${error.message}`);
      return Boolean(data && data.length > 0);
    },

    invalidateActiveOtps: async (email: string): Promise<void> => {
      const cleanEmail = email.trim().toLowerCase();
      const { error } = await this.client
        .from('auth_otps')
        .update({ consumed: 1 })
        .eq('email', cleanEmail)
        .eq('consumed', 0);
      if (error) throw new Error(`[SupabaseDB.authOtps.invalidateActiveOtps] ${error.message}`);
    }
  };

  topics = {
    findAll: async (options?: { category?: string; search?: string }): Promise<Topic[]> => {
      let query = this.client.from('topics').select('*');
      if (options?.category && options.category !== 'All') {
        query = query.eq('category', options.category);
      }
      if (options?.search && options.search.trim()) {
        const term = options.search.trim();
        query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`);
      }
      query = query.order('heat_score', { ascending: false });

      const { data, error } = await query;
      if (error) throw new Error(`[SupabaseDB.topics.findAll] ${error.message}`);
      return (data || []) as Topic[];
    },

    findById: async (id: string): Promise<Topic | null> => {
      const { data, error } = await this.client.from('topics').select('*').eq('id', id).maybeSingle();
      if (error) throw new Error(`[SupabaseDB.topics.findById] ${error.message}`);
      return (data as Topic) || null;
    },

    findByIdOrTitle: async (identifier: string): Promise<Topic | null> => {
      const { data, error } = await this.client
        .from('topics')
        .select('*')
        .or(`id.eq.${identifier},title.eq.${identifier}`)
        .maybeSingle();
      if (error) throw new Error(`[SupabaseDB.topics.findByIdOrTitle] ${error.message}`);
      return (data as Topic) || null;
    },

    create: async (topic: Partial<Topic>): Promise<Topic> => {
      const { data, error } = await this.client.from('topics').insert(topic).select().single();
      if (error) throw new Error(`[SupabaseDB.topics.create] ${error.message}`);
      return data as Topic;
    },

    incrementDebaters: async (id: string, delta: number): Promise<number> => {
      const { data: current } = await this.client.from('topics').select('debater_count').eq('id', id).maybeSingle();
      const currentCount = current?.debater_count ?? 1;
      const newCount = Math.max(1, currentCount + delta);
      const { error } = await this.client.from('topics').update({ debater_count: newCount }).eq('id', id);
      if (error) throw new Error(`[SupabaseDB.topics.incrementDebaters] ${error.message}`);
      return newCount;
    }
  };

  userTopics = {
    findTopicIdsByUserId: async (userId: string): Promise<string[]> => {
      const { data, error } = await this.client.from('user_topics').select('topic_id').eq('user_id', userId);
      if (error) throw new Error(`[SupabaseDB.userTopics.findTopicIdsByUserId] ${error.message}`);
      return (data || []).map((row: any) => row.topic_id);
    },

    findTopicsByUserId: async (userId: string): Promise<Array<{ id: string; title: string; category: string; match_rate: number }>> => {
      const { data: userTopicRows, error: utError } = await this.client
        .from('user_topics')
        .select('topic_id')
        .eq('user_id', userId);
      if (utError) throw new Error(`[SupabaseDB.userTopics.findTopicsByUserId] ${utError.message}`);
      if (!userTopicRows || userTopicRows.length === 0) return [];

      const topicIds = userTopicRows.map((r: any) => r.topic_id);
      const { data: topicsData, error: tError } = await this.client
        .from('topics')
        .select('id, title, category, match_rate')
        .in('id', topicIds);
      if (tError) throw new Error(`[SupabaseDB.userTopics.findTopicsByUserId] ${tError.message}`);

      return (topicsData || []) as any[];
    },

    subscribe: async (userId: string, topicId: string): Promise<void> => {
      const { error } = await this.client
        .from('user_topics')
        .upsert({ user_id: userId, topic_id: topicId }, { onConflict: 'user_id,topic_id' });
      if (error) throw new Error(`[SupabaseDB.userTopics.subscribe] ${error.message}`);
    },

    unsubscribe: async (userId: string, topicId: string): Promise<void> => {
      const { error } = await this.client
        .from('user_topics')
        .delete()
        .eq('user_id', userId)
        .eq('topic_id', topicId);
      if (error) throw new Error(`[SupabaseDB.userTopics.unsubscribe] ${error.message}`);
    },

    isSubscribed: async (userId: string, topicId: string): Promise<boolean> => {
      const { data, error } = await this.client
        .from('user_topics')
        .select('topic_id')
        .eq('user_id', userId)
        .eq('topic_id', topicId)
        .maybeSingle();
      if (error) throw new Error(`[SupabaseDB.userTopics.isSubscribed] ${error.message}`);
      return Boolean(data);
    },

    findSharedTopics: async (userId1: string, userId2: string): Promise<Array<{ title: string }>> => {
      const [ids1, ids2] = await Promise.all([
        this.userTopics.findTopicIdsByUserId(userId1),
        this.userTopics.findTopicIdsByUserId(userId2)
      ]);
      const set2 = new Set(ids2);
      const sharedIds = ids1.filter(id => set2.has(id));
      if (sharedIds.length === 0) return [];

      const { data, error } = await this.client.from('topics').select('title').in('id', sharedIds);
      if (error) throw new Error(`[SupabaseDB.userTopics.findSharedTopics] ${error.message}`);
      return (data || []) as { title: string }[];
    }
  };

  userResonanceTags = {
    findByUserId: async (userId: string): Promise<string[]> => {
      const { data, error } = await this.client.from('user_resonance_tags').select('tag').eq('user_id', userId);
      if (error) throw new Error(`[SupabaseDB.userResonanceTags.findByUserId] ${error.message}`);
      return (data || []).map((row: any) => row.tag);
    },

    addTag: async (userId: string, tag: string): Promise<void> => {
      const tagId = `tag-${userId}-${Date.now()}`;
      const { error } = await this.client
        .from('user_resonance_tags')
        .upsert({ id: tagId, user_id: userId, tag }, { onConflict: 'user_id,tag' });
      if (error) throw new Error(`[SupabaseDB.userResonanceTags.addTag] ${error.message}`);
    },

    removeTag: async (userId: string, tag: string): Promise<void> => {
      const { error } = await this.client
        .from('user_resonance_tags')
        .delete()
        .eq('user_id', userId)
        .eq('tag', tag);
      if (error) throw new Error(`[SupabaseDB.userResonanceTags.removeTag] ${error.message}`);
    }
  };

  rumors = {
    findAll: async (options?: { category?: string; search?: string }): Promise<Array<Rumor & { topic_title: string; category: string; author_handle?: string; author_chaos_index?: number }>> => {
      const { data: rumorsData, error: rError } = await this.client
        .from('rumors')
        .select('*')
        .order('created_at', { ascending: false });
      if (rError) throw new Error(`[SupabaseDB.rumors.findAll] ${rError.message}`);
      if (!rumorsData || rumorsData.length === 0) return [];

      const topicIds = Array.from(new Set(rumorsData.map((r: any) => r.topic_id)));
      const authorIds = Array.from(new Set(rumorsData.map((r: any) => r.author_id).filter(Boolean)));

      const [topicsRes, authorsRes] = await Promise.all([
        this.client.from('topics').select('id, title, category').in('id', topicIds),
        authorIds.length > 0
          ? this.client.from('users').select('id, handle, chaos_index').in('id', authorIds)
          : { data: [] }
      ]);

      const topicsMap = new Map((topicsRes.data || []).map((t: any) => [t.id, t]));
      const authorsMap = new Map((authorsRes.data || []).map((u: any) => [u.id, u]));

      let result = rumorsData.map((r: any) => {
        const topic = topicsMap.get(r.topic_id);
        const author = authorsMap.get(r.author_id);
        return {
          ...r,
          topic_title: topic?.title || 'Unknown Topic',
          category: topic?.category || 'Social',
          author_handle: author?.handle,
          author_chaos_index: author?.chaos_index
        };
      });

      if (options?.category && options.category !== 'All') {
        result = result.filter(r => r.category === options.category);
      }
      if (options?.search && options.search.trim()) {
        const term = options.search.trim().toLowerCase();
        result = result.filter(r => r.content.toLowerCase().includes(term) || r.topic_title.toLowerCase().includes(term));
      }

      return result;
    },

    findById: async (id: string): Promise<Rumor | null> => {
      const { data, error } = await this.client.from('rumors').select('*').eq('id', id).maybeSingle();
      if (error) throw new Error(`[SupabaseDB.rumors.findById] ${error.message}`);
      return (data as Rumor) || null;
    },

    create: async (rumor: Partial<Rumor>): Promise<Rumor> => {
      const { data, error } = await this.client.from('rumors').insert(rumor).select().single();
      if (error) throw new Error(`[SupabaseDB.rumors.create] ${error.message}`);
      return data as Rumor;
    },

    updateVoteCount: async (id: string, agreesDelta: number, debatesDelta: number): Promise<void> => {
      const { data: current } = await this.client.from('rumors').select('agrees, debates').eq('id', id).maybeSingle();
      const currentAgrees = current?.agrees ?? 0;
      const currentDebates = current?.debates ?? 0;
      const { error } = await this.client
        .from('rumors')
        .update({
          agrees: Math.max(0, currentAgrees + agreesDelta),
          debates: Math.max(0, currentDebates + debatesDelta)
        })
        .eq('id', id);
      if (error) throw new Error(`[SupabaseDB.rumors.updateVoteCount] ${error.message}`);
    },

    decrypt: async (id: string): Promise<void> => {
      const { error } = await this.client.from('rumors').update({ is_encrypted: 0 }).eq('id', id);
      if (error) throw new Error(`[SupabaseDB.rumors.decrypt] ${error.message}`);
    }
  };

  rumorVotes = {
    findByRumorAndUser: async (rumorId: string, userId: string): Promise<RumorVote | null> => {
      const { data, error } = await this.client
        .from('rumor_votes')
        .select('*')
        .eq('rumor_id', rumorId)
        .eq('user_id', userId)
        .maybeSingle();
      if (error) throw new Error(`[SupabaseDB.rumorVotes.findByRumorAndUser] ${error.message}`);
      return (data as RumorVote) || null;
    },

    upsert: async (vote: { rumorId: string; userId: string; voteType: 'agree' | 'debate' }): Promise<void> => {
      const voteId = `vote-${vote.rumorId}-${vote.userId}`;
      const { error } = await this.client.from('rumor_votes').upsert({
        id: voteId,
        rumor_id: vote.rumorId,
        user_id: vote.userId,
        vote_type: vote.voteType
      }, { onConflict: 'rumor_id,user_id' });
      if (error) throw new Error(`[SupabaseDB.rumorVotes.upsert] ${error.message}`);
    }
  };

  swipes = {
    recordSwipe: async (swipe: { userId: string; targetUserId: string; direction: 'like' | 'pass' }): Promise<void> => {
      const swipeId = `swipe-${swipe.userId}-${swipe.targetUserId}`;
      const { error } = await this.client.from('swipes').upsert({
        id: swipeId,
        user_id: swipe.userId,
        target_user_id: swipe.targetUserId,
        direction: swipe.direction
      }, { onConflict: 'user_id,target_user_id' });
      if (error) throw new Error(`[SupabaseDB.swipes.recordSwipe] ${error.message}`);
    },

    findSwipe: async (userId: string, targetUserId: string): Promise<Swipe | null> => {
      const { data, error } = await this.client
        .from('swipes')
        .select('*')
        .eq('user_id', userId)
        .eq('target_user_id', targetUserId)
        .maybeSingle();
      if (error) throw new Error(`[SupabaseDB.swipes.findSwipe] ${error.message}`);
      return (data as Swipe) || null;
    },

    countByUserId: async (userId: string): Promise<number> => {
      const { count, error } = await this.client
        .from('swipes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      if (error) throw new Error(`[SupabaseDB.swipes.countByUserId] ${error.message}`);
      return count ?? 0;
    }
  };

  matches = {
    findActiveByUserId: async (userId: string): Promise<Array<Match & { partner_id: string }>> => {
      const { data, error } = await this.client
        .from('matches')
        .select('*')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .eq('status', 'active')
        .order('updated_at', { ascending: false });
      if (error) throw new Error(`[SupabaseDB.matches.findActiveByUserId] ${error.message}`);

      return (data || []).map((m: any) => ({
        ...m,
        partner_id: m.user1_id === userId ? m.user2_id : m.user1_id
      }));
    },

    findById: async (id: string): Promise<Match | null> => {
      const { data, error } = await this.client.from('matches').select('*').eq('id', id).maybeSingle();
      if (error) throw new Error(`[SupabaseDB.matches.findById] ${error.message}`);
      return (data as Match) || null;
    },

    create: async (match: Partial<Match>): Promise<Match> => {
      const { data, error } = await this.client
        .from('matches')
        .upsert(match, { onConflict: 'user1_id,user2_id' })
        .select()
        .single();
      if (error) throw new Error(`[SupabaseDB.matches.create] ${error.message}`);
      return data as Match;
    },

    updateStatus: async (id: string, status: 'active' | 'unmatched' | 'blocked'): Promise<void> => {
      const { error } = await this.client
        .from('matches')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw new Error(`[SupabaseDB.matches.updateStatus] ${error.message}`);
    },

    updateUnmaskStage: async (id: string, stage: number): Promise<void> => {
      const { error } = await this.client
        .from('matches')
        .update({ unmask_stage: stage, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw new Error(`[SupabaseDB.matches.updateUnmaskStage] ${error.message}`);
    },

    touchMatch: async (id: string): Promise<void> => {
      const { error } = await this.client
        .from('matches')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw new Error(`[SupabaseDB.matches.touchMatch] ${error.message}`);
    },

    countByUserId: async (userId: string): Promise<number> => {
      const { count, error } = await this.client
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);
      if (error) throw new Error(`[SupabaseDB.matches.countByUserId] ${error.message}`);
      return count ?? 0;
    }
  };

  unmaskConsents = {
    findByMatchId: async (matchId: string): Promise<UnmaskConsent[]> => {
      const { data, error } = await this.client.from('unmask_consents').select('*').eq('match_id', matchId);
      if (error) throw new Error(`[SupabaseDB.unmaskConsents.findByMatchId] ${error.message}`);
      return (data || []) as UnmaskConsent[];
    },

    addConsent: async (consent: { matchId: string; userId: string; stage: number }): Promise<void> => {
      const consentId = `consent-${consent.matchId}-${consent.userId}-${consent.stage}`;
      const { error } = await this.client.from('unmask_consents').upsert({
        id: consentId,
        match_id: consent.matchId,
        user_id: consent.userId,
        stage: consent.stage
      }, { onConflict: 'match_id,user_id,stage' });
      if (error) throw new Error(`[SupabaseDB.unmaskConsents.addConsent] ${error.message}`);
    },

    getBilateralCount: async (matchId: string, stage: number): Promise<number> => {
      const { data, error } = await this.client
        .from('unmask_consents')
        .select('user_id')
        .eq('match_id', matchId)
        .eq('stage', stage);
      if (error) throw new Error(`[SupabaseDB.unmaskConsents.getBilateralCount] ${error.message}`);
      const uniqueUsers = new Set((data || []).map((row: any) => row.user_id));
      return uniqueUsers.size;
    }
  };

  chatMessages = {
    findByMatchId: async (matchId: string): Promise<Array<ChatMessage & { sender_handle?: string }>> => {
      const nowIso = new Date().toISOString();
      const { data: messages, error: mError } = await this.client
        .from('chat_messages')
        .select('*')
        .eq('match_id', matchId)
        .gt('expires_at', nowIso)
        .order('created_at', { ascending: true });
      if (mError) throw new Error(`[SupabaseDB.chatMessages.findByMatchId] ${mError.message}`);
      if (!messages || messages.length === 0) return [];

      const senderIds = Array.from(new Set(messages.map((m: any) => m.sender_id)));
      const { data: usersData } = await this.client.from('users').select('id, handle').in('id', senderIds);
      const userMap = new Map((usersData || []).map((u: any) => [u.id, u.handle]));

      return messages.map((m: any) => ({
        ...m,
        sender_handle: userMap.get(m.sender_id)
      }));
    },

    getLatestByMatchId: async (matchId: string): Promise<ChatMessage | null> => {
      const nowIso = new Date().toISOString();
      const { data, error } = await this.client
        .from('chat_messages')
        .select('*')
        .eq('match_id', matchId)
        .gt('expires_at', nowIso)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw new Error(`[SupabaseDB.chatMessages.getLatestByMatchId] ${error.message}`);
      return (data as ChatMessage) || null;
    },

    create: async (msg: Partial<ChatMessage>): Promise<ChatMessage> => {
      const { data, error } = await this.client.from('chat_messages').insert(msg).select().single();
      if (error) throw new Error(`[SupabaseDB.chatMessages.create] ${error.message}`);
      return data as ChatMessage;
    },

    hasMessages: async (matchId: string): Promise<boolean> => {
      const { count, error } = await this.client
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('match_id', matchId);
      if (error) throw new Error(`[SupabaseDB.chatMessages.hasMessages] ${error.message}`);
      return (count ?? 0) > 0;
    },

    countExpired: async (): Promise<number> => {
      const nowIso = new Date().toISOString();
      const { count, error } = await this.client
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .lte('expires_at', nowIso);
      if (error) throw new Error(`[SupabaseDB.chatMessages.countExpired] ${error.message}`);
      return count ?? 0;
    },

    purgeExpired: async (): Promise<number> => {
      const nowIso = new Date().toISOString();
      const count = await this.chatMessages.countExpired();
      if (count > 0) {
        const { error } = await this.client.from('chat_messages').delete().lte('expires_at', nowIso);
        if (error) throw new Error(`[SupabaseDB.chatMessages.purgeExpired] ${error.message}`);
      }
      return count;
    }
  };

  rooms = {
    findLive: async (): Promise<Array<Room & { host_handle?: string }>> => {
      const { data: roomsData, error: rError } = await this.client
        .from('rooms')
        .select('*')
        .eq('is_live', 1)
        .order('listeners', { ascending: false });
      if (rError) throw new Error(`[SupabaseDB.rooms.findLive] ${rError.message}`);
      if (!roomsData || roomsData.length === 0) return [];

      const hostIds = Array.from(new Set(roomsData.map((r: any) => r.host_id).filter(Boolean)));
      const { data: hosts } = hostIds.length > 0
        ? await this.client.from('users').select('id, handle').in('id', hostIds)
        : { data: [] };
      const hostMap = new Map((hosts || []).map((h: any) => [h.id, h.handle]));

      return roomsData.map((r: any) => ({
        ...r,
        host_handle: hostMap.get(r.host_id)
      }));
    },

    findById: async (id: string): Promise<Room | null> => {
      const { data, error } = await this.client.from('rooms').select('*').eq('id', id).maybeSingle();
      if (error) throw new Error(`[SupabaseDB.rooms.findById] ${error.message}`);
      return (data as Room) || null;
    },

    incrementListeners: async (id: string, delta: number): Promise<void> => {
      const { data: current } = await this.client.from('rooms').select('listeners').eq('id', id).maybeSingle();
      const currentListeners = current?.listeners ?? 0;
      const nextListeners = Math.max(0, currentListeners + delta);
      const { error } = await this.client.from('rooms').update({ listeners: nextListeners }).eq('id', id);
      if (error) throw new Error(`[SupabaseDB.rooms.incrementListeners] ${error.message}`);
    }
  };

  roomParticipants = {
    findByRoomAndUser: async (roomId: string, userId: string): Promise<RoomParticipant | null> => {
      const { data, error } = await this.client
        .from('room_participants')
        .select('*')
        .eq('room_id', roomId)
        .eq('user_id', userId)
        .maybeSingle();
      if (error) throw new Error(`[SupabaseDB.roomParticipants.findByRoomAndUser] ${error.message}`);
      return (data as RoomParticipant) || null;
    },

    addOrUpdate: async (participant: {
      roomId: string;
      userId: string;
      role?: 'host' | 'speaker' | 'listener';
      isMuted?: boolean;
      isHandRaised?: boolean;
    }): Promise<void> => {
      const { error } = await this.client.from('room_participants').upsert({
        room_id: participant.roomId,
        user_id: participant.userId,
        role: participant.role || 'listener',
        is_muted: participant.isMuted !== false ? 1 : 0,
        is_hand_raised: participant.isHandRaised ? 1 : 0,
        joined_at: new Date().toISOString()
      }, { onConflict: 'room_id,user_id' });
      if (error) throw new Error(`[SupabaseDB.roomParticipants.addOrUpdate] ${error.message}`);
    },

    remove: async (roomId: string, userId: string): Promise<void> => {
      const { error } = await this.client
        .from('room_participants')
        .delete()
        .eq('room_id', roomId)
        .eq('user_id', userId);
      if (error) throw new Error(`[SupabaseDB.roomParticipants.remove] ${error.message}`);
    },

    updateMic: async (roomId: string, userId: string, isMuted: boolean): Promise<void> => {
      const { error } = await this.client
        .from('room_participants')
        .update({ is_muted: isMuted ? 1 : 0 })
        .eq('room_id', roomId)
        .eq('user_id', userId);
      if (error) throw new Error(`[SupabaseDB.roomParticipants.updateMic] ${error.message}`);
    },

    pruneInactive: async (hours: number): Promise<number> => {
      const cutoff = new Date(Date.now() - hours * 3600 * 1000).toISOString();
      const { count } = await this.client
        .from('room_participants')
        .select('*', { count: 'exact', head: true })
        .lt('joined_at', cutoff);
      if ((count || 0) > 0) {
        const { error } = await this.client.from('room_participants').delete().lt('joined_at', cutoff);
        if (error) throw new Error(`[SupabaseDB.roomParticipants.pruneInactive] ${error.message}`);
      }
      return count || 0;
    }
  };

  roomMessages = {
    findByRoomId: async (roomId: string): Promise<Array<RoomMessage & { sender_handle?: string }>> => {
      const { data: messages, error: mError } = await this.client
        .from('room_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });
      if (mError) throw new Error(`[SupabaseDB.roomMessages.findByRoomId] ${mError.message}`);
      if (!messages || messages.length === 0) return [];

      const senderIds = Array.from(new Set(messages.map((m: any) => m.sender_id)));
      const { data: usersData } = await this.client.from('users').select('id, handle').in('id', senderIds);
      const userMap = new Map((usersData || []).map((u: any) => [u.id, u.handle]));

      return messages.map((m: any) => ({
        ...m,
        sender_handle: userMap.get(m.sender_id)
      }));
    },

    create: async (msg: Partial<RoomMessage>): Promise<RoomMessage> => {
      const { data, error } = await this.client.from('room_messages').insert(msg).select().single();
      if (error) throw new Error(`[SupabaseDB.roomMessages.create] ${error.message}`);
      return data as RoomMessage;
    }
  };

  transactions = {
    findByUserId: async (userId: string): Promise<Transaction[]> => {
      const { data, error } = await this.client
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw new Error(`[SupabaseDB.transactions.findByUserId] ${error.message}`);
      return (data || []) as Transaction[];
    },

    create: async (tx: Partial<Transaction>): Promise<Transaction> => {
      const { data, error } = await this.client.from('transactions').insert(tx).select().single();
      if (error) throw new Error(`[SupabaseDB.transactions.create] ${error.message}`);
      return data as Transaction;
    }
  };

  reports = {
    create: async (report: Partial<Report>): Promise<Report> => {
      const { data, error } = await this.client.from('reports').insert(report).select().single();
      if (error) throw new Error(`[SupabaseDB.reports.create] ${error.message}`);
      return data as Report;
    }
  };

  blockedEntities = {
    block: async (userId: string, blockedUserId: string): Promise<void> => {
      const blockId = `block-${userId}-${blockedUserId}`;
      const { error } = await this.client
        .from('blocked_entities')
        .upsert({ id: blockId, user_id: userId, blocked_user_id: blockedUserId }, { onConflict: 'user_id,blocked_user_id' });
      if (error) throw new Error(`[SupabaseDB.blockedEntities.block] ${error.message}`);
    },

    isBlocked: async (userId: string, targetUserId: string): Promise<boolean> => {
      const { data, error } = await this.client
        .from('blocked_entities')
        .select('id')
        .eq('user_id', userId)
        .eq('blocked_user_id', targetUserId)
        .maybeSingle();
      if (error) throw new Error(`[SupabaseDB.blockedEntities.isBlocked] ${error.message}`);
      return Boolean(data);
    },

    getBlockedUserIds: async (userId: string): Promise<string[]> => {
      const { data, error } = await this.client
        .from('blocked_entities')
        .select('blocked_user_id')
        .eq('user_id', userId);
      if (error) throw new Error(`[SupabaseDB.blockedEntities.getBlockedUserIds] ${error.message}`);
      return (data || []).map((row: any) => row.blocked_user_id);
    },

    countByUserId: async (userId: string): Promise<number> => {
      const { count, error } = await this.client
        .from('blocked_entities')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      if (error) throw new Error(`[SupabaseDB.blockedEntities.countByUserId] ${error.message}`);
      return count ?? 0;
    }
  };
}
