// Rumr Production Client API Client

const BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  category?: string;
  suggestedAlternative?: string;
}

export class ApiError extends Error {
  status: number;
  data: any;
  category?: string;

  constructor(status: number, message: string, data: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.category = data?.category;
  }
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('rumr_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('rumr_token', token);
      } else {
        localStorage.removeItem('rumr_token');
      }
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('rumr_token');
    }
    return this.token;
  }

  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (res.status === 204) {
      return {} as T;
    }

    const contentType = res.headers.get('content-type');
    let data: any = null;
    if (contentType && contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    if (!res.ok) {
      const errorMsg = data?.message || data?.error || `HTTP error ${res.status}`;
      throw new ApiError(res.status, errorMsg, data);
    }

    return data as T;
  }

  // 1. Auth APIs
  auth = {
    sendOtp: async (email: string) => {
      return this.request<{ success: boolean; message: string; dev_code?: string }>('/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
    },

    verifyOtp: async (email: string, code: string) => {
      const data = await this.request<{ token: string; user: any; isNewUser: boolean }>('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, code })
      });
      if (data.token) {
        this.setToken(data.token);
      }
      return data;
    },

    guest: async () => {
      const data = await this.request<{ token: string; user: any }>('/auth/guest', {
        method: 'POST'
      });
      if (data.token) {
        this.setToken(data.token);
      }
      return data;
    },

    getMe: async () => {
      return this.request<any>('/auth/me');
    },

    completeOnboarding: async (profileData: {
      handle?: string;
      age?: number;
      gender?: string;
      intent?: string;
      city?: string;
      coords?: { lat: number; lng: number };
      selectedTopics?: string[];
      customTopic?: string;
    }) => {
      return this.request<{ success: boolean; user: any }>('/auth/complete-onboarding', {
        method: 'POST',
        body: JSON.stringify(profileData)
      });
    },

    logout: async () => {
      try {
        await this.request('/auth/logout', { method: 'POST' });
      } finally {
        this.setToken(null);
      }
    }
  };

  // 2. Discovery & Swiping
  discovery = {
    getFeed: async (filters: any) => {
      return this.request<{ cards: any[] }>('/discovery/feed', {
        method: 'POST',
        body: JSON.stringify(filters || {})
      });
    },

    swipe: async (targetUserId: string, direction: 'like' | 'pass') => {
      return this.request<{
        isMatch: boolean;
        matchId?: string;
        matchRate?: number;
        partnerHandle?: string;
        overlappingTopics?: string[];
      }>('/discovery/swipe', {
        method: 'POST',
        body: JSON.stringify({ targetUserId, direction })
      });
    }
  };

  // 3. Matches & Unmasking
  matches = {
    getMatches: async () => {
      return this.request<{ matches: any[] }>('/matches');
    },

    getMatch: async (matchId: string) => {
      return this.request<{ match: any }>(`/matches/${matchId}`);
    },

    unmatch: async (matchId: string) => {
      return this.request<{ success: boolean }>(`/matches/${matchId}`, {
        method: 'DELETE'
      });
    },

    getUnmaskStatus: async (matchId: string) => {
      return this.request<{
        matchId: string;
        currentStage: number;
        myConsent: Record<number, boolean>;
        partnerConsent: Record<number, boolean>;
        partner: any;
      }>(`/matches/${matchId}/unmask`);
    },

    grantConsent: async (matchId: string, stage: number) => {
      return this.request<{
        success: boolean;
        stage: number;
        advanced: boolean;
        partner: any;
      }>(`/matches/${matchId}/unmask/consent`, {
        method: 'POST',
        body: JSON.stringify({ stage })
      });
    }
  };

  // 4. Topic Tunnel Chat
  chat = {
    getMessages: async (matchId: string) => {
      return this.request<{ messages: any[] }>(`/matches/${matchId}/messages`);
    },

    sendMessage: async (matchId: string, text: string) => {
      return this.request<{ success: boolean; message: any }>(`/matches/${matchId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ text })
      });
    }
  };

  // 5. Topics
  topics = {
    getTopics: async (category?: string, search?: string) => {
      const params = new URLSearchParams();
      if (category && category !== 'All') params.append('category', category);
      if (search) params.append('search', search);
      const query = params.toString() ? `?${params.toString()}` : '';
      return this.request<{ topics: any[] }>(`/topics${query}`);
    },

    createTopic: async (title: string, category: string, description?: string) => {
      return this.request<{ success: boolean; topic: any }>('/topics', {
        method: 'POST',
        body: JSON.stringify({ title, category, description })
      });
    },

    subscribe: async (topicId: string) => {
      return this.request<{ success: boolean; isSubscribed: boolean; debaterCount: number }>(
        `/topics/${topicId}/subscribe`,
        { method: 'POST' }
      );
    }
  };

  // 6. Rumors & Whispers
  rumors = {
    getRumors: async (category?: string, search?: string) => {
      const params = new URLSearchParams();
      if (category && category !== 'All') params.append('category', category);
      if (search) params.append('search', search);
      const query = params.toString() ? `?${params.toString()}` : '';
      return this.request<{ rumors: any[] }>(`/rumors${query}`);
    },

    postRumor: async (topicId: string, content: string, tags?: string[]) => {
      return this.request<{ success: boolean; rumor: any }>('/rumors', {
        method: 'POST',
        body: JSON.stringify({ topicId, content, tags })
      });
    },

    vote: async (rumorId: string, voteType: 'agree' | 'debate') => {
      return this.request<{ success: boolean; agrees: number; debates: number }>(`/rumors/${rumorId}/vote`, {
        method: 'POST',
        body: JSON.stringify({ voteType })
      });
    },

    decrypt: async (rumorId: string) => {
      return this.request<{ success: boolean; rumorId: string; content: string; isEncrypted: boolean }>(
        `/rumors/${rumorId}/decrypt`,
        { method: 'POST' }
      );
    }
  };

  // 7. Live Audio Rooms
  rooms = {
    getRooms: async () => {
      return this.request<{ rooms: any[] }>('/rooms');
    },

    join: async (roomId: string) => {
      return this.request<{ success: boolean; role: string; isMuted: boolean }>(`/rooms/${roomId}/join`, {
        method: 'POST'
      });
    },

    leave: async (roomId: string) => {
      return this.request<{ success: boolean }>(`/rooms/${roomId}/leave`, {
        method: 'POST'
      });
    },

    toggleMic: async (roomId: string) => {
      return this.request<{ success: boolean; isMuted: boolean; isMicActive: boolean }>(`/rooms/${roomId}/mic`, {
        method: 'POST'
      });
    },

    getMessages: async (roomId: string) => {
      return this.request<{ messages: any[] }>(`/rooms/${roomId}/messages`);
    },

    sendMessage: async (roomId: string, text: string, stance?: string) => {
      return this.request<{ success: boolean; message: any }>(`/rooms/${roomId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ text, stance })
      });
    }
  };

  // 8. User Profile & Settings
  users = {
    getMe: async () => {
      return this.request<{ user: any }>('/users/me');
    },

    updateMe: async (updates: any) => {
      return this.request<{ success: boolean; user: any }>('/users/me', {
        method: 'PATCH',
        body: JSON.stringify(updates)
      });
    },

    injectRumor: async (tag: string) => {
      return this.request<{ success: boolean; activeRumors: string[] }>('/users/me/rumors', {
        method: 'POST',
        body: JSON.stringify({ tag })
      });
    },

    removeRumor: async (tag: string) => {
      return this.request<{ success: boolean; activeRumors: string[] }>(`/users/me/rumors/${tag}`, {
        method: 'DELETE'
      });
    },

    getTransactions: async () => {
      return this.request<{ transactions: any[] }>('/users/me/transactions');
    },

    downloadDpdpExport: async () => {
      const token = this.getToken();
      const res = await fetch(`${BASE_URL}/users/me/dpdp-export`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error('Failed to generate DPDP export');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rumr-dpdp-export.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    },

    eraseAccount: async () => {
      const res = await this.request<{ success: boolean; message: string }>('/users/me', {
        method: 'DELETE'
      });
      this.setToken(null);
      return res;
    }
  };

  // 9. Boosts & Monetization
  boosts = {
    getPlans: async () => {
      return this.request<{ plans: any[] }>('/boosts/plans');
    },

    purchase: async (tierName: string) => {
      return this.request<{ success: boolean; boostTier: string; expiresAt: string; message: string }>(
        '/boosts/purchase',
        {
          method: 'POST',
          body: JSON.stringify({ tierName })
        }
      );
    }
  };

  // 10. Safety & Reports
  safety = {
    report: async (targetId: string, reason: string, details?: string) => {
      return this.request<{ success: boolean; reportId: string; message: string }>('/safety/report', {
        method: 'POST',
        body: JSON.stringify({ targetId, reason, details })
      });
    },

    moderateText: async (text: string) => {
      return this.request<any>('/safety/moderate-text', {
        method: 'POST',
        body: JSON.stringify({ text })
      });
    },

    block: async (targetUserId: string) => {
      return this.request<{ success: boolean; message: string }>('/safety/block', {
        method: 'POST',
        body: JSON.stringify({ targetUserId })
      });
    }
  };
}

export const api = new ApiClient();
