import { create } from 'zustand';
import type { Post, GroupType } from '@/types';

interface FeedStore {
  posts: Post[];
  activeTab: GroupType;
  isLoading: boolean;
  hasNext: boolean;
  page: number;

  setPosts: (posts: Post[]) => void;
  appendPosts: (posts: Post[]) => void;
  setActiveTab: (tab: GroupType) => void;
  setLoading: (loading: boolean) => void;
  setHasNext: (hasNext: boolean) => void;
  setPage: (page: number) => void;
  prependPost: (post: Post) => void;
  reset: () => void;
}

export const useFeedStore = create<FeedStore>((set) => ({
  posts: [],
  activeTab: 'ALL',
  isLoading: false,
  hasNext: false,
  page: 1,

  setPosts: (posts) => set({ posts }),
  appendPosts: (posts) =>
    set((s) => ({ posts: [...s.posts, ...posts] })),
  setActiveTab: (tab) => set({ activeTab: tab, posts: [], page: 1 }),
  setLoading: (loading) => set({ isLoading: loading }),
  setHasNext: (hasNext) => set({ hasNext }),
  setPage: (page) => set({ page }),
  prependPost: (post) => set((s) => ({ posts: [post, ...s.posts] })),
  reset: () => set({ posts: [], page: 1, hasNext: false }),
}));
