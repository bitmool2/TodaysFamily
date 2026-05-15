import { create } from 'zustand';

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
      // 순환 참조 방지: api/client를 동적으로 로드
      const api = require('@/api/client').default;
      const res = await api.post('/families', { name });
      set({ family: res.data });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchFamily: async (familyId) => {
    set({ isLoading: true });
    try {
      const api = require('@/api/client').default;
      const res = await api.get(`/families/${familyId}`);
      set({ family: res.data });
    } finally {
      set({ isLoading: false });
    }
  },
}));
