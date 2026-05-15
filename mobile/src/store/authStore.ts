import { create } from 'zustand';
import type { User, AuthState } from '@/types';
import axios from 'axios';
import { Platform } from 'react-native';

// api/client의 순환 참조를 피하기 위해 axios 직접 사용
const DEV_HOST = Platform.OS === 'android' ? '10.100.0.230' : 'localhost';
const BASE_URL = __DEV__
  ? `http://${DEV_HOST}:3031/api/v1`
  : 'https://your-render-url.onrender.com/api/v1';

function authAxios(token?: string | null) {
  return axios.create({
    baseURL: BASE_URL,
    timeout: 10_000,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

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
    const res = await authAxios().post('/auth/login', { email, password });
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
    const res = await authAxios().post('/auth/register', {
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
    const token = useAuthStore.getState().token;
    const res = await authAxios(token).get('/auth/me');
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
