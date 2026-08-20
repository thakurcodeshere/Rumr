export type ViewType = 
  | 'onboarding'
  | 'feed'
  | 'topics'
  | 'rooms'
  | 'matches'
  | 'matchmaker'
  | 'chat'
  | 'profile'
  | 'boost'
  | 'safety'
  | 'catalog'
  | 'workflow';

export type ScreenFrameId = 
  | 'iphone-16-pro'
  | 'iphone-14-15'
  | 'pixel-8'
  | 'galaxy-s24'
  | 'iphone-se'
  | 'fluid';

export interface ScreenFrameSpec {
  id: ScreenFrameId;
  name: string;
  width: number;
  height: number;
  ratio: string;
  os: 'iOS' | 'Android' | 'Responsive';
  cornerRadius: number;
  notchType: 'dynamic-island' | 'notch' | 'punch-hole' | 'none';
  safeAreaTop: number;
  safeAreaBottom: number;
  description: string;
}

export interface Topic {
  id: string;
  title: string;
  category: 'Tech' | 'Workplace' | 'Social' | 'Spicy' | 'Crypto' | 'Startups';
  debaterCount: number;
  heatScore: number;
  matchRate: number;
  isHot?: boolean;
  isSubscribed?: boolean;
  description: string;
}

export interface RumorPost {
  id: string;
  topicId: string;
  topicTitle: string;
  category: string;
  authorHandle: string;
  authorChaosIndex: number;
  content: string;
  encryptedContent?: string;
  isEncrypted: boolean;
  matchRate: number;
  agrees: number;
  debates: number;
  timestamp: string;
  tags: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'me' | 'them' | 'system';
  senderHandle: string;
  text: string;
  timestamp: string;
  expiresInSeconds?: number;
  isWarning?: boolean;
}

export interface UserPersona {
  id: string;
  handle: string;
  tagline: string;
  city: string;
  role: string;
  realName: string;
  chaosIndex: number;
  avatarSeed: string;
  realPhoto: string;
  affinities: { topic: string; score: number }[];
}

export interface TopicRoom {
  id: string;
  title: string;
  category: string;
  activeSpeakers: number;
  listeners: number;
  isLive: boolean;
  isPrivate?: boolean;
  hostHandle: string;
  recentDebate: string;
}

export interface CatalogScreenItem {
  index: number;
  id: string;
  title: string;
  category: string;
  viewTarget: ViewType;
  htmlFile: string;
  screenshotFile?: string;
  width: string;
  height: string;
}
