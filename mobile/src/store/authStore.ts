import { create } from 'zustand';
import type { User, AuthState } from '@/types';
import api from '@/api/client';

interface AuthStore extends AuthState {
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  // 실제 API 호출
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (params: {
    name: string; email: string; password: string;
    role?: 'ADMIN' | 'MEMBER'; adminEmail?: string;
    profileEmoji?: string;
  }) => Promise<void>;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setAuth: (user, token) =>
    set({ user, token, isAuthenticated: true }),

  logout: () =>
    set({ user: null, token: null, isAuthenticated: false }),

  setUser: (user) => set({ user }),

  // ── 이메일 로그인 ──────────────────────────────────────────────────────────
  loginWithEmail: async (email, password) => {
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

  // ── 회원가입 ────────────────────────────────────────────────────────────────
  registerWithEmail: async ({ name, email, password, role = 'ADMIN', adminEmail, profileEmoji }) => {
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

  // ── 내 정보 재조회 (토큰 유지 후 앱 재실행 시 사용) ───────────────────────
  fetchMe: async () => {
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
