export interface User {
  id: string;
  email: string | null;
  handle: string;
  chaos_index: number;
  is_verified: number;
  boost_tier: string | null;
  boost_expires_at: string | null;
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
  created_at: string;
  updated_at: string;
}

export interface AuthOtp {
  id: string;
  email: string;
  otp_code_hash: string;
  expires_at: string;
  consumed: number;
  attempts: number;
  created_at: string;
}

export interface Topic {
  id: string;
  title: string;
  category: 'Tech' | 'Workplace' | 'Social' | 'Spicy' | 'Crypto' | 'Startups';
  description: string | null;
  debater_count: number;
  heat_score: number;
  match_rate: number;
  is_hot: number;
  creator_id: string | null;
  created_at: string;
}

export interface UserTopic {
  user_id: string;
  topic_id: string;
  created_at: string;
}

export interface UserResonanceTag {
  id: string;
  user_id: string;
  tag: string;
  created_at: string;
}

export interface Rumor {
  id: string;
  topic_id: string;
  author_id: string | null;
  content: string;
  encrypted_content: string | null;
  is_encrypted: number;
  match_rate: number;
  agrees: number;
  debates: number;
  tags: string | null; // JSON string or text
  created_at: string;
}

export interface RumorVote {
  id: string;
  rumor_id: string;
  user_id: string;
  vote_type: 'agree' | 'debate';
  created_at: string;
}

export interface Swipe {
  id: string;
  user_id: string;
  target_user_id: string;
  direction: 'like' | 'pass';
  created_at: string;
}

export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  primary_topic_id: string | null;
  compatibility: number;
  unmask_stage: number;
  status: 'active' | 'unmatched' | 'blocked';
  created_at: string;
  updated_at: string;
}

export interface UnmaskConsent {
  id: string;
  match_id: string;
  user_id: string;
  stage: number;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  match_id: string;
  sender_id: string;
  text: string;
  created_at: string;
  expires_at: string;
  is_warning: number;
}

export interface Room {
  id: string;
  title: string;
  category: string;
  host_id: string | null;
  is_live: number;
  is_private: number;
  active_speakers: number;
  listeners: number;
  recent_debate: string | null;
  created_at: string;
}

export interface RoomParticipant {
  room_id: string;
  user_id: string;
  role: 'host' | 'speaker' | 'listener';
  is_muted: number;
  is_hand_raised: number;
  joined_at: string;
}

export interface RoomMessage {
  id: string;
  room_id: string;
  sender_id: string;
  text: string;
  stance: 'agree' | 'debate' | null;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  tier_name: string;
  amount: string;
  status: string;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string | null;
  target_id: string;
  reason: string;
  details: string | null;
  status: 'pending' | 'reviewed' | 'actioned';
  created_at: string;
}

export interface BlockedEntity {
  id: string;
  user_id: string;
  blocked_user_id: string;
  created_at: string;
}
