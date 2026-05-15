import { create } from 'zustand';
import axios from 'axios';
import { Platform } from 'react-native';

const DEV_HOST = Platform.OS === 'android' ? '10.100.0.230' : 'localhost';
const BASE_URL = __DEV__
  ? `http://${DEV_HOST}:3031/api/v1`
  : 'https://your-render-url.onrender.com/api/v1';

function getAxios() {
  const token = require('@/store/authStore').useAuthStore.getState().token;
  return axios.create({
    baseURL: BASE_URL,
    timeout: 10_000,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

interface FamilyGroup {
  id: string;
  type: 'ALL' | 'MATERNAL' | 'PATERNAL';
  name: string;
  emoji?: string | null;
  imageUri?: string | null;
}

interface FamilyMember {
  id: string;
  userId: string;
  role: string;
  user: { id: string; name: string; email: string; profileImage: string | null };
}

interface Family {
  id: string;
  name: string;
  ownerId: string;
  groups: FamilyGroup[];
  members: FamilyMember[];
}

interface FamilyStore {
  family: Family | null;
  isLoading: boolean;
  createFamily: (name: string) => Promise<void>;
  fetchFamily: (familyId: string) => Promise<void>;
  setFamily: (family: Family) => void;
  clearFamily: () => void;
}

export const useFamilyStore = create<FamilyStore>((set) => ({
  family: null,
  isLoading: false,

  setFamily: (family) => set({ family }),
  clearFamily: () => set({ family: null }),

  createFamily: async (name) => {
    set({ isLoading: true });
    try {
      const res = await getAxios().post('/families', { name });
      set({ family: res.data });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchFamily: async (familyId) => {
    set({ isLoading: true });
    try {
      const res = await getAxios().get(`/families/${familyId}`);
      set({ family: res.data });
    } finally {
      set({ isLoading: false });
    }
  },
}));
