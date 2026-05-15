import { create } from 'zustand';
import type { User, AuthState } from '@/types';

interface AuthStore extends AuthState {
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (params: {
    name: string; email: string; password: string;
    role?: 'ADMIN' | 'MEMBER'; adminEmail?: string;
    profileEmoji?: string;
  }) => Promise<void>;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setAuth: (user, token) =>
    set({ user, token, isAuthenticated: true }),

  logout: () =>
    set({ user: null, token: null, isAuthenticated: false }),

  setUser: (user) => set({ user }),

  loginWithEmail: async (email, password) => {
    // api/client는 authStore를 런타임에 require하므로 여기선 동적 로드로 순환 방지
    const api = require('@/api/client').default;
    const res = await api.post('/auth/login', { email, password });
    const { accessToken, user } = res.data;
    set({
      token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role ?? 'ADMIN',
        provider: 'EMAIL',
        createdAt: user.createdAt ?? new Date().toISOString(),
      },
      isAuthenticated: true,
    });
  },

  registerWithEmail: async ({ name, email, password, role = 'ADMIN', adminEmail }) => {
    const api = require('@/api/client').default;
    const res = await api.post('/auth/register', {
      name, email, password, role,
      ...(adminEmail ? { adminEmail } : {}),
    });
    const { accessToken, user } = res.data;
    set({
      token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role ?? role,
        provider: 'EMAIL',
        createdAt: user.createdAt ?? new Date().toISOString(),
      },
      isAuthenticated: true,
    });
  },

  fetchMe: async () => {
    const api = require('@/api/client').default;
    const res = await api.get('/auth/me');
    const u = res.data;
    set((state) => ({
      user: {
        ...state.user,
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role ?? 'ADMIN',
        profileImage: u.profileImage ?? undefined,
        provider: u.provider ?? 'EMAIL',
        createdAt: u.createdAt,
      } as User,
    }));
  },
}));
