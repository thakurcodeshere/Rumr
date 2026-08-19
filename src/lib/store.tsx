import React, { createContext, useContext, useState, useEffect } from 'react';
import { ViewType, Topic, RumorPost, ChatMessage, UserPersona, TopicRoom, CatalogScreenItem } from '../types';
import { INITIAL_TOPICS, INITIAL_RUMORS, MOCK_MATCH_PARTNER, MOCK_ROOMS, ALL_66_SCREENS } from './mock-data';

interface AppContextType {
  currentView: ViewType;
  selectedCatalogScreen: CatalogScreenItem | null;
  activeTopic: Topic | null;
  topics: Topic[];
  rumors: RumorPost[];
  rooms: TopicRoom[];
  user: {
    handle: string;
    chaosIndex: number;
    isVerified: boolean;
    boostTier: string | null;
    subscribedTopicIds: string[];
    avatarSeed: string;
  };
  chatMessages: ChatMessage[];
  partner: UserPersona;
  revealStage: number;
  revealConsent: { me: boolean; them: boolean };
  isMobileFrame: boolean;
  activeAudioRoom: TopicRoom | null;
  isMicActive: boolean;
  aiNudge: { isOpen: boolean; message: string; severity: 'warning' | 'info' } | null;
  
  // Actions
  navigate: (view: ViewType) => void;
  selectCatalogScreen: (screen: CatalogScreenItem) => void;
  clearSelectedCatalogScreen: () => void;
  setActiveTopic: (topic: Topic | null) => void;
  toggleSubscribeTopic: (topicId: string) => void;
  createCustomTopic: (title: string, category: Topic['category'], description: string) => void;
  toggleRumorAgree: (rumorId: string) => void;
  toggleRumorDebate: (rumorId: string) => void;
  decryptRumor: (rumorId: string) => void;
  sendChatMessage: (text: string) => void;
  requestRevealConsent: () => void;
  advanceReveal: () => void;
  resetReveal: () => void;
  joinRoom: (room: TopicRoom) => void;
  leaveRoom: () => void;
  toggleMic: () => void;
  purchaseBoost: (tier: string) => void;
  reportContent: (targetId: string, reason: string) => void;
  dismissNudge: () => void;
  triggerNudge: (message: string) => void;
  toggleMobileFrame: () => void;
  completeOnboarding: (handle: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<ViewType>('feed');
  const [selectedCatalogScreen, setSelectedCatalogScreen] = useState<CatalogScreenItem | null>(null);
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);
  const [topics, setTopics] = useState<Topic[]>(INITIAL_TOPICS);
  const [rumors, setRumors] = useState<RumorPost[]>(INITIAL_RUMORS);
  const [rooms, setRooms] = useState<TopicRoom[]>(MOCK_ROOMS);
  
  const [user, setUser] = useState({
    handle: 'anonymous_ghost_42',
    chaosIndex: 88,
    isVerified: true,
    boostTier: null as string | null,
    subscribedTopicIds: ['topic-1', 'topic-2', 'topic-5'],
    avatarSeed: 'ghost_42'
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'system',
      senderHandle: 'RUMR_BOT',
      text: 'Encrypted Topic Tunnel initiated. Topic: AI Layoffs vs Reality. Match Rate: 94%.',
      timestamp: '5:00',
    },
    {
      id: 'msg-2',
      sender: 'them',
      senderHandle: 'cipher_vanguard',
      text: 'Most people blaming AI for headcount cuts are ignoring margin compressions in cloud infra.',
      timestamp: '4:42',
      expiresInSeconds: 280
    },
    {
      id: 'msg-3',
      sender: 'me',
      senderHandle: 'anonymous_ghost_42',
      text: 'True, but middle management is using LLMs as cover to offload contractor blame without severance.',
      timestamp: '4:15',
      expiresInSeconds: 255
    }
  ]);

  const [partner] = useState<UserPersona>(MOCK_MATCH_PARTNER);
  const [revealStage, setRevealStage] = useState<number>(0);
  const [revealConsent, setRevealConsent] = useState<{ me: boolean; them: boolean }>({ me: false, them: false });
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(true);
  const [activeAudioRoom, setActiveAudioRoom] = useState<TopicRoom | null>(null);
  const [isMicActive, setIsMicActive] = useState<boolean>(false);
  const [aiNudge, setAiNudge] = useState<{ isOpen: boolean; message: string; severity: 'warning' | 'info' } | null>(null);

  const navigate = (view: ViewType) => {
    setSelectedCatalogScreen(null);
    setCurrentView(view);
  };

  const selectCatalogScreen = (screen: CatalogScreenItem) => {
    setSelectedCatalogScreen(screen);
    setCurrentView(screen.viewTarget);
  };

  const clearSelectedCatalogScreen = () => {
    setSelectedCatalogScreen(null);
  };

  const toggleSubscribeTopic = (topicId: string) => {
    setTopics(prev => prev.map(t => {
      if (t.id === topicId) {
        const isSub = !t.isSubscribed;
        return { ...t, isSubscribed: isSub, debaterCount: isSub ? t.debaterCount + 1 : t.debaterCount - 1 };
      }
      return t;
    }));
    setUser(prev => {
      const exists = prev.subscribedTopicIds.includes(topicId);
      return {
        ...prev,
        subscribedTopicIds: exists 
          ? prev.subscribedTopicIds.filter(id => id !== topicId)
          : [...prev.subscribedTopicIds, topicId]
      };
    });
  };

  const createCustomTopic = (title: string, category: Topic['category'], description: string) => {
    const newTopic: Topic = {
      id: `topic-${Date.now()}`,
      title,
      category,
      debaterCount: 1,
      heatScore: 70,
      matchRate: 85,
      isHot: true,
      isSubscribed: true,
      description
    };
    setTopics(prev => [newTopic, ...prev]);
    setUser(prev => ({
      ...prev,
      subscribedTopicIds: [...prev.subscribedTopicIds, newTopic.id]
    }));
  };

  const toggleRumorAgree = (rumorId: string) => {
    setRumors(prev => prev.map(r => r.id === rumorId ? { ...r, agrees: r.agrees + 1 } : r));
  };

  const toggleRumorDebate = (rumorId: string) => {
    setRumors(prev => prev.map(r => r.id === rumorId ? { ...r, debates: r.debates + 1 } : r));
  };

  const decryptRumor = (rumorId: string) => {
    setRumors(prev => prev.map(r => r.id === rumorId ? { ...r, isEncrypted: false } : r));
  };

  const sendChatMessage = (text: string) => {
    if (!text.trim()) return;
    
    // Check for toxic triggers to demo AI moderation nudge
    const lower = text.toLowerCase();
    if (lower.includes('stupid') || lower.includes('idiot') || lower.includes('hate') || lower.includes('dox')) {
      setAiNudge({
        isOpen: true,
        message: 'AI Moderation Sentinel detected hostile or ad-hominem patterns. Rumr emphasizes intellectual friction over personal attacks.',
        severity: 'warning'
      });
      return;
    }

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'me',
      senderHandle: user.handle,
      text,
      timestamp: 'Just now',
      expiresInSeconds: 300
    };
    setChatMessages(prev => [...prev, newMsg]);

    // Simulated reply
    setTimeout(() => {
      const replies = [
        "That contradicts the telemetry data I analyzed in Q1.",
        "Spot on. And the VP level is deliberately masking it.",
        "Interesting angle. What's your take on the private equity angle?",
        "If you check the anonymous repo commits, the evidence is everywhere."
      ];
      const replyText = replies[Math.floor(Math.random() * replies.length)];
      setChatMessages(curr => [
        ...curr,
        {
          id: `msg-reply-${Date.now()}`,
          sender: 'them',
          senderHandle: partner.handle,
          text: replyText,
          timestamp: 'Just now',
          expiresInSeconds: 300
        }
      ]);
    }, 1200);
  };

  const requestRevealConsent = () => {
    setRevealConsent(prev => ({ ...prev, me: true }));
    setTimeout(() => {
      setRevealConsent({ me: true, them: true });
      advanceReveal();
    }, 1500);
  };

  const advanceReveal = () => {
    setRevealStage(prev => Math.min(prev + 1, 3));
  };

  const resetReveal = () => {
    setRevealStage(0);
    setRevealConsent({ me: false, them: false });
  };

  const joinRoom = (room: TopicRoom) => {
    setActiveAudioRoom(room);
    navigate('rooms');
  };

  const leaveRoom = () => {
    setActiveAudioRoom(null);
    setIsMicActive(false);
  };

  const toggleMic = () => {
    setIsMicActive(prev => !prev);
  };

  const purchaseBoost = (tier: string) => {
    setUser(prev => ({ ...prev, boostTier: tier }));
    setAiNudge({
      isOpen: true,
      message: `Successfully unlocked ${tier} Topic Boost. Your debates are prioritized across all regional feeds.`,
      severity: 'info'
    });
  };

  const reportContent = (targetId: string, reason: string) => {
    setAiNudge({
      isOpen: true,
      message: `Anonymous report filed for node ${targetId} (${reason}). The cryptographic hash is logged for community review.`,
      severity: 'info'
    });
  };

  const dismissNudge = () => {
    setAiNudge(null);
  };

  const triggerNudge = (message: string) => {
    setAiNudge({ isOpen: true, message, severity: 'warning' });
  };

  const toggleMobileFrame = () => {
    setIsMobileFrame(prev => !prev);
  };

  const completeOnboarding = (handle: string) => {
    setUser(prev => ({ ...prev, handle: handle || prev.handle }));
    navigate('feed');
  };

  return (
    <AppContext.Provider value={{
      currentView,
      selectedCatalogScreen,
      activeTopic,
      topics,
      rumors,
      rooms,
      user,
      chatMessages,
      partner,
      revealStage,
      revealConsent,
      isMobileFrame,
      activeAudioRoom,
      isMicActive,
      aiNudge,
      navigate,
      selectCatalogScreen,
      clearSelectedCatalogScreen,
      setActiveTopic,
      toggleSubscribeTopic,
      createCustomTopic,
      toggleRumorAgree,
      toggleRumorDebate,
      decryptRumor,
      sendChatMessage,
      requestRevealConsent,
      advanceReveal,
      resetReveal,
      joinRoom,
      leaveRoom,
      toggleMic,
      purchaseBoost,
      reportContent,
      dismissNudge,
      triggerNudge,
      toggleMobileFrame,
      completeOnboarding
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
