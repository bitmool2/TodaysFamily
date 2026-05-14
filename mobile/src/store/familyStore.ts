import { create } from 'zustand';
import type { Family, Group, FamilyMember, Child, GroupType } from '@/types';

interface FamilyStore {
  family: Family | null;
  groups: Group[];
  members: FamilyMember[];
  children: Child[];
  selectedGroupType: GroupType;

  setFamily: (family: Family) => void;
  setGroups: (groups: Group[]) => void;
  setMembers: (members: FamilyMember[]) => void;
  setChildren: (children: Child[]) => void;
  setSelectedGroupType: (type: GroupType) => void;
  reset: () => void;
}

export const useFamilyStore = create<FamilyStore>((set) => ({
  family: null,
  groups: [],
  members: [],
  children: [],
  selectedGroupType: 'ALL',

  setFamily: (family) => set({ family }),
  setGroups: (groups) => set({ groups }),
  setMembers: (members) => set({ members }),
  setChildren: (children) => set({ children }),
  setSelectedGroupType: (type) => set({ selectedGroupType: type }),
  reset: () =>
    set({ family: null, groups: [], members: [], children: [] }),
}));
