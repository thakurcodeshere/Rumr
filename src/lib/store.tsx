import React, { createContext, useContext, useState, useEffect } from 'react';
import { ViewType, Topic, RumorPost, ChatMessage, UserPersona, TopicRoom, CatalogScreenItem, ScreenFrameId } from '../types';
import { ALL_66_SCREENS } from './mock-data';
import { SCREEN_FRAME_SPECS } from './frame-specs';
import { api, ApiError } from './api';

const DEFAULT_PARTNER: UserPersona = {
  id: 'user-partner-1',
  handle: 'cipher_vanguard',
  tagline: 'Contrarian systems architect • AI safety cynic',
  city: 'Gurgaon, NCR',
  role: 'Staff ML Infrastructure Engineer',
  realName: 'Elena Rostova',
  chaosIndex: 94,
  avatarSeed: 'cipher',
  realPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
  affinities: [
    { topic: 'AI Layoffs vs Reality', score: 96 },
    { topic: 'Office Politics', score: 89 },
    { topic: 'Stealth Whistleblowing', score: 92 },
    { topic: 'Modern Dating Friction', score: 84 }
  ]
};

interface AppContextType {
  currentView: ViewType;
  selectedCatalogScreen: CatalogScreenItem | null;
  activeTopic: Topic | null;
  topics: Topic[];
  rumors: RumorPost[];
  rooms: TopicRoom[];
  user: {
    id?: string;
    handle: string;
    chaosIndex: number;
    isVerified: boolean;
    boostTier: string | null;
    subscribedTopicIds: string[];
    avatarSeed: string;
    email?: string;
    activeRumors?: string[];
  };
  chatMessages: ChatMessage[];
  partner: UserPersona;
  revealStage: number;
  revealConsent: { me: boolean; them: boolean };
  isMobileFrame: boolean;
  selectedFrame: ScreenFrameId;
  compareFrame: ScreenFrameId | null;
  activeAudioRoom: TopicRoom | null;
  isMicActive: boolean;
  aiNudge: { isOpen: boolean; message: string; severity: 'warning' | 'info' } | null;
  copyToast: string | null;
  activeMatchId: string | null;
  matches: any[];
  
  // Actions
  navigate: (view: ViewType) => void;
  selectCatalogScreen: (screen: CatalogScreenItem) => void;
  clearSelectedCatalogScreen: () => void;
  setActiveTopic: (topic: Topic | null) => void;
  setActiveMatchId: (id: string | null) => void;
  toggleSubscribeTopic: (topicId: string) => Promise<void>;
  createCustomTopic: (title: string, category: Topic['category'], description: string) => Promise<void>;
  toggleRumorAgree: (rumorId: string) => Promise<void>;
  toggleRumorDebate: (rumorId: string) => Promise<void>;
  decryptRumor: (rumorId: string) => Promise<void>;
  sendChatMessage: (text: string) => Promise<void>;
  requestRevealConsent: () => Promise<void>;
  advanceReveal: () => Promise<void>;
  resetReveal: () => void;
  joinRoom: (room: TopicRoom) => Promise<void>;
  leaveRoom: () => Promise<void>;
  toggleMic: () => Promise<void>;
  purchaseBoost: (tier: string) => Promise<void>;
  reportContent: (targetId: string, reason: string) => Promise<void>;
  dismissNudge: () => void;
  triggerNudge: (message: string) => void;
  toggleMobileFrame: () => void;
  setSelectedFrame: (frame: ScreenFrameId) => void;
  setCompareFrame: (frame: ScreenFrameId | null) => void;
  isRegistered: boolean;
  isGuest: boolean;
  guestLock: { isOpen: boolean; featureName: string; description: string } | null;
  triggerGuestLock: (featureName: string, description?: string) => void;
  dismissGuestLock: () => void;
  continueAsGuest: () => Promise<void>;
  setRegistered: (registered: boolean) => void;
  resetToBeforeRegister: () => Promise<void>;
  completeOnboarding: (
    handle?: string, 
    email?: string, 
    location?: { city: string; coords?: { lat: number; lng: number } },
    selectedTopics?: string[],
    customTopic?: string
  ) => Promise<void>;
  copyFigmaTokens: () => void;
  copyCurrentScreenCode: () => void;
  clearToast: () => void;
  userLocation: {
    city: string;
    coords?: { lat: number; lng: number };
    isGranted: boolean;
  };
  isLocationModalOpen: boolean;
  setIsLocationModalOpen: (isOpen: boolean) => void;
  updateUserLocation: (city: string, coords?: { lat: number; lng: number }) => void;
  openLocationPrompt: () => void;
  refreshFeedData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [guestLock, setGuestLock] = useState<{ isOpen: boolean; featureName: string; description: string } | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('onboarding');

  const [selectedCatalogScreen, setSelectedCatalogScreen] = useState<CatalogScreenItem | null>(null);
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [rumors, setRumors] = useState<RumorPost[]>([]);
  const [rooms, setRooms] = useState<TopicRoom[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);

  const [userLocation, setUserLocation] = useState<{
    city: string;
    coords?: { lat: number; lng: number };
    isGranted: boolean;
  }>(() => {
    const savedCity = typeof window !== 'undefined' ? localStorage.getItem('rumr_user_city') : null;
    const perm = typeof window !== 'undefined' ? localStorage.getItem('rumr_location_permission') : null;
    return {
      city: savedCity || 'Gurgaon, NCR',
      isGranted: perm === 'granted'
    };
  });

  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);

  const updateUserLocation = (city: string, coords?: { lat: number; lng: number }) => {
    setUserLocation({
      city,
      coords,
      isGranted: true
    });
    localStorage.setItem('rumr_user_city', city);
    if (api.getToken()) {
      api.users.updateMe({ city, coords }).catch(() => {});
    }
  };

  const openLocationPrompt = () => {
    setIsLocationModalOpen(true);
  };

  const [user, setUser] = useState({
    id: undefined as string | undefined,
    handle: 'anonymous_ghost_42',
    chaosIndex: 88,
    isVerified: false,
    boostTier: null as string | null,
    subscribedTopicIds: [] as string[],
    avatarSeed: 'ghost_42',
    email: undefined as string | undefined,
    activeRumors: ['CYBERNETICS', 'NEO_TOKYO_NIGHTS', 'ENCRYPTED_COMMS', 'OFFICE_POLITICS']
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [partner, setPartner] = useState<UserPersona>(DEFAULT_PARTNER);
  const [revealStage, setRevealStage] = useState<number>(0);
  const [revealConsent, setRevealConsent] = useState<{ me: boolean; them: boolean }>({ me: false, them: false });
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(true);
  const [selectedFrame, setSelectedFrame] = useState<ScreenFrameId>('iphone-16-pro');
  const [compareFrame, setCompareFrame] = useState<ScreenFrameId | null>(null);
  const [activeAudioRoom, setActiveAudioRoom] = useState<TopicRoom | null>(null);
  const [isMicActive, setIsMicActive] = useState<boolean>(false);
  const [aiNudge, setAiNudge] = useState<{ isOpen: boolean; message: string; severity: 'warning' | 'info' } | null>(null);
  const [copyToast, setCopyToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setCopyToast(msg);
    setTimeout(() => {
      setCopyToast(null);
    }, 3000);
  };

  const clearToast = () => setCopyToast(null);

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

  const triggerGuestLock = (featureName: string, description?: string) => {
    setGuestLock({
      isOpen: true,
      featureName,
      description: description || 'Create an account with your email to unlock this feature.'
    });
  };

  const dismissGuestLock = () => {
    setGuestLock(null);
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

  // 1. Initial Data & Session Hydration
  const refreshFeedData = async () => {
    try {
      const [topicsRes, rumorsRes, roomsRes] = await Promise.all([
        api.topics.getTopics(),
        api.rumors.getRumors(),
        api.rooms.getRooms()
      ]);
      setTopics(topicsRes.topics || []);
      setRumors(rumorsRes.rumors || []);
      setRooms(roomsRes.rooms || []);
    } catch (err) {
      console.error('Failed to load live feed data:', err);
    }
  };

  const refreshMatches = async () => {
    if (!api.getToken() || isGuest) return;
    try {
      const res = await api.matches.getMatches();
      const mList = res.matches || [];
      setMatches(mList);
      if (mList.length > 0 && !activeMatchId) {
        setActiveMatchId(mList[0].id);
      }
    } catch (err) {
      console.error('Failed to load matches:', err);
    }
  };

  useEffect(() => {
    const initSession = async () => {
      const token = api.getToken();
      if (token) {
        try {
          const res = await api.auth.getMe();
          if (res && res.id) {
            setUser({
              id: res.id,
              handle: res.handle,
              chaosIndex: res.chaos_index,
              isVerified: Boolean(res.is_verified),
              boostTier: res.boost_tier,
              subscribedTopicIds: res.subscribedTopicIds || [],
              avatarSeed: res.avatar_seed,
              email: res.email,
              activeRumors: res.resonanceTags || []
            });
            setIsRegistered(Boolean(res.is_verified && !res.is_guest));
            setIsGuest(Boolean(res.is_guest));
            if (res.city) {
              setUserLocation(prev => ({ ...prev, city: res.city }));
            }
            setCurrentView('feed');
          }
        } catch {
          api.setToken(null);
          setIsRegistered(false);
          setIsGuest(false);
          setCurrentView('onboarding');
        }
      } else {
        setIsRegistered(false);
        setIsGuest(false);
        setCurrentView('onboarding');
      }

      await refreshFeedData();
    };

    initSession();
  }, []);

  // Sync matches whenever registration or active status changes
  useEffect(() => {
    if (isRegistered) {
      refreshMatches();
    }
  }, [isRegistered]);

  // Sync active match messages & unmask status
  useEffect(() => {
    if (!activeMatchId || !isRegistered) return;

    let isMounted = true;
    const loadMatchData = async () => {
      try {
        const [msgsRes, unmaskRes] = await Promise.all([
          api.chat.getMessages(activeMatchId),
          api.matches.getUnmaskStatus(activeMatchId)
        ]);

        if (isMounted) {
          setChatMessages(msgsRes.messages || []);
          if (unmaskRes) {
            setRevealStage(unmaskRes.currentStage || 0);
            setRevealConsent({
              me: Boolean(unmaskRes.myConsent?.[unmaskRes.currentStage + 1]),
              them: Boolean(unmaskRes.partnerConsent?.[unmaskRes.currentStage + 1])
            });
            if (unmaskRes.partner) {
              setPartner(prev => ({ ...prev, ...unmaskRes.partner }));
            }
          }
        }
      } catch (err) {
        console.error('Error syncing match data:', err);
      }
    };

    loadMatchData();
    const interval = setInterval(loadMatchData, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [activeMatchId, isRegistered]);

  // Actions wired to API
  const continueAsGuest = async () => {
    try {
      const res = await api.auth.guest();
      setUser({
        id: res.user.id,
        handle: res.user.handle,
        chaosIndex: res.user.chaos_index || 50,
        isVerified: false,
        boostTier: null,
        subscribedTopicIds: [],
        avatarSeed: res.user.avatar_seed,
        email: undefined,
        activeRumors: []
      });
      setIsGuest(true);
      setIsRegistered(false);
      setCurrentView('feed');
    } catch (err) {
      console.error('Failed to start guest session:', err);
    }
  };

  const resetToBeforeRegister = async () => {
    await api.auth.logout();
    setIsRegistered(false);
    setIsGuest(false);
    setCurrentView('onboarding');
  };

  const setRegistered = (registered: boolean) => {
    setIsRegistered(registered);
    if (registered) {
      setCurrentView('feed');
    } else {
      setCurrentView('onboarding');
    }
  };

  const completeOnboarding = async (
    handle?: string, 
    email?: string, 
    location?: { city: string; coords?: { lat: number; lng: number } },
    selectedTopics?: string[],
    customTopic?: string
  ) => {
    try {
      const res = await api.auth.completeOnboarding({
        handle,
        city: location?.city,
        coords: location?.coords,
        selectedTopics,
        customTopic
      });

      if (res && res.user) {
        setUser({
          id: res.user.id,
          handle: res.user.handle,
          chaosIndex: res.user.chaos_index || 88,
          isVerified: true,
          boostTier: res.user.boost_tier,
          subscribedTopicIds: res.user.subscribedTopicIds || [],
          avatarSeed: res.user.avatar_seed,
          email: res.user.email || email,
          activeRumors: user.activeRumors
        });
        setIsRegistered(true);
        setIsGuest(false);
        if (location) {
          updateUserLocation(location.city, location.coords);
        }
        await refreshFeedData();
        await refreshMatches();
        navigate('feed');
      }
    } catch (err: any) {
      console.error('Error completing onboarding:', err);
      setIsRegistered(true);
      navigate('feed');
    }
  };

  const toggleSubscribeTopic = async (topicId: string) => {
    if (isGuest) {
      triggerGuestLock('Topic Subscription', 'Register to follow debate nodes and build your resonance graph.');
      return;
    }

    try {
      const res = await api.topics.subscribe(topicId);
      setTopics(prev => prev.map(t => {
        if (t.id === topicId) {
          return { ...t, isSubscribed: res.isSubscribed, debaterCount: res.debaterCount };
        }
        return t;
      }));

      setUser(prev => ({
        ...prev,
        subscribedTopicIds: res.isSubscribed
          ? [...prev.subscribedTopicIds, topicId]
          : prev.subscribedTopicIds.filter(id => id !== topicId)
      }));
    } catch (err) {
      console.error('Failed to toggle topic subscription:', err);
    }
  };

  const createCustomTopic = async (title: string, category: Topic['category'], description: string) => {
    if (isGuest) {
      triggerGuestLock('Create Custom Topic', 'Register to broadcast <= 3-word debate nodes into the mesh.');
      return;
    }

    try {
      const res = await api.topics.createTopic(title, category, description);
      if (res && res.topic) {
        setTopics(prev => [res.topic, ...prev]);
        setUser(prev => ({
          ...prev,
          subscribedTopicIds: [...prev.subscribedTopicIds, res.topic.id]
        }));
      }
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 422) {
        setAiNudge({
          isOpen: true,
          message: err.message,
          severity: 'warning'
        });
      } else {
        console.error('Failed to create topic:', err);
      }
    }
  };

  const toggleRumorAgree = async (rumorId: string) => {
    try {
      const res = await api.rumors.vote(rumorId, 'agree');
      setRumors(prev => prev.map(r => r.id === rumorId ? { ...r, agrees: res.agrees, debates: res.debates } : r));
    } catch (err) {
      console.error('Failed to vote agree:', err);
    }
  };

  const toggleRumorDebate = async (rumorId: string) => {
    try {
      const res = await api.rumors.vote(rumorId, 'debate');
      setRumors(prev => prev.map(r => r.id === rumorId ? { ...r, agrees: res.agrees, debates: res.debates } : r));
    } catch (err) {
      console.error('Failed to vote debate:', err);
    }
  };

  const decryptRumor = async (rumorId: string) => {
    try {
      const res = await api.rumors.decrypt(rumorId);
      setRumors(prev => prev.map(r => r.id === rumorId ? { ...r, content: res.content, isEncrypted: false } : r));
    } catch (err) {
      console.error('Failed to decrypt rumor:', err);
    }
  };

  const sendChatMessage = async (text: string) => {
    if (!text.trim()) return;

    if (isGuest) {
      triggerGuestLock('Encrypted Topic Tunnel Chat', 'Register to send messages in encrypted tunnels.');
      return;
    }

    const currentMatch = activeMatchId || (matches[0]?.id) || 'match-default';

    try {
      const res = await api.chat.sendMessage(currentMatch, text);
      if (res && res.message) {
        setChatMessages(prev => [...prev, res.message]);
      }
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 422) {
        setAiNudge({
          isOpen: true,
          message: err.message,
          severity: 'warning'
        });
      } else {
        console.error('Failed to send message:', err);
      }
    }
  };

  const requestRevealConsent = async () => {
    if (!activeMatchId) return;
    const nextStage = Math.min(revealStage + 1, 3);
    try {
      const res = await api.matches.grantConsent(activeMatchId, nextStage);
      setRevealStage(res.stage);
      setPartner(prev => ({ ...prev, ...res.partner }));
    } catch (err) {
      console.error('Failed to grant unmasking consent:', err);
    }
  };

  const advanceReveal = async () => {
    await requestRevealConsent();
  };

  const resetReveal = () => {
    setRevealStage(0);
    setRevealConsent({ me: false, them: false });
  };

  const joinRoom = async (room: TopicRoom) => {
    setActiveAudioRoom(room);
    navigate('rooms');
    try {
      await api.rooms.join(room.id);
    } catch (err) {
      console.error('Failed to join audio room:', err);
    }
  };

  const leaveRoom = async () => {
    if (activeAudioRoom) {
      api.rooms.leave(activeAudioRoom.id).catch(() => {});
    }
    setActiveAudioRoom(null);
    setIsMicActive(false);
  };

  const toggleMic = async () => {
    if (!activeAudioRoom) return;
    try {
      const res = await api.rooms.toggleMic(activeAudioRoom.id);
      setIsMicActive(res.isMicActive);
    } catch (err) {
      console.error('Failed to toggle mic:', err);
    }
  };

  const purchaseBoost = async (tier: string) => {
    try {
      const res = await api.boosts.purchase(tier);
      setUser(prev => ({ ...prev, boostTier: res.boostTier }));
      setAiNudge({
        isOpen: true,
        message: res.message,
        severity: 'info'
      });
    } catch (err) {
      console.error('Failed to purchase boost:', err);
    }
  };

  const reportContent = async (targetId: string, reason: string) => {
    try {
      const res = await api.safety.report(targetId, reason);
      setAiNudge({
        isOpen: true,
        message: res.message,
        severity: 'info'
      });
    } catch (err) {
      console.error('Failed to file report:', err);
    }
  };

  const copyFigmaTokens = async () => {
    try {
      const res = await fetch('/tokens/figma-tokens.json');
      if (res.ok) {
        const text = await res.text();
        await navigator.clipboard.writeText(text);
        showToast('✓ Figma Tokens copied! Paste directly into Tokens Studio.');
      } else {
        showToast('Tokens file ready in tokens/figma-tokens.json');
      }
    } catch {
      showToast('Tokens ready in tokens/figma-tokens.json');
    }
  };

  const copyCurrentScreenCode = async () => {
    const spec = SCREEN_FRAME_SPECS[selectedFrame];
    const frameInfo = `Frame: ${spec.name} (${spec.width}x${spec.height}px, ${spec.ratio})`;
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast(`✓ Link copied for html.to.design! [${frameInfo}]`);
    } catch {
      showToast(`Frame info: ${frameInfo}`);
    }
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
      selectedFrame,
      compareFrame,
      isRegistered,
      isGuest,
      guestLock,
      triggerGuestLock,
      dismissGuestLock,
      continueAsGuest,
      setRegistered,
      resetToBeforeRegister,
      activeAudioRoom,
      isMicActive,
      aiNudge,
      copyToast,
      activeMatchId,
      matches,
      navigate,
      selectCatalogScreen,
      clearSelectedCatalogScreen,
      setActiveTopic,
      setActiveMatchId,
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
      setSelectedFrame,
      setCompareFrame,
      completeOnboarding,
      copyFigmaTokens,
      copyCurrentScreenCode,
      clearToast,
      userLocation,
      isLocationModalOpen,
      setIsLocationModalOpen,
      updateUserLocation,
      openLocationPrompt,
      refreshFeedData
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
