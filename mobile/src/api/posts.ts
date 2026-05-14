import api from './client';
import type { GroupType, SourceType } from '@/types';

export interface CreatePostPayload {
  familyId: string;
  groupId: string;
  childId?: string;
  imageUrl: string;
  imageKey: string;
  caption?: string;
  source: SourceType;
  isAiCaption: boolean;
}

export interface PostResponse {
  id: string;
  imageUrl: string;
  caption?: string;
  createdAt: string;
  group: { id: string; type: GroupType; name: string };
  author: { id: string; name: string; profileImage?: string };
}

export async function createPost(payload: CreatePostPayload): Promise<PostResponse> {
  const { data } = await api.post<PostResponse>('/posts', payload);
  return data;
}

export async function getPosts(params: {
  familyId?: string;
  group?: GroupType;
  page?: number;
  limit?: number;
}) {
  const { data } = await api.get('/posts', { params });
  return data;
}
