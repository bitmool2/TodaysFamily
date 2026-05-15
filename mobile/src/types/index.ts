// ─── Enums ────────────────────────────────────────────────────────────────────

export type GroupType = 'ALL' | 'MATERNAL' | 'PATERNAL';

export type SourceType = 'CAMERA' | 'GALLERY' | 'KIDSNOTE';

export type ReactionType = 'HEART' | 'SMILE' | 'CLAP';

export type AuthProvider = 'KAKAO' | 'GOOGLE' | 'EMAIL';

// ─── User & Auth ──────────────────────────────────────────────────────────────

export type UserRole = 'ADMIN' | 'MEMBER';

export interface UserGroup {
  adminEmail: string;
  adminName: string;
  groupType: GroupType;
  groupLabel: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  bio?: string;
  role?: UserRole;
  groups?: UserGroup[];          // 소속 그룹 목록 (멤버인 경우)
  profileImage?: string;
  provider: AuthProvider;
  createdAt: string;
  familyId?: string;             // 생성/가입한 가족 ID
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// ─── Family & Groups ──────────────────────────────────────────────────────────

export interface Family {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
}

export interface Group {
  id: string;
  familyId: string;
  type: GroupType;
  name: string;
  memberCount: number;
}

export interface FamilyMember {
  id: string;
  familyId: string;
  userId: string;
  user: User;
  role: string;
  joinedAt: string;
}

export interface Child {
  id: string;
  familyId: string;
  name: string;
  birthDate: string;
  profileImage?: string;
}

// ─── Posts & Feed ─────────────────────────────────────────────────────────────

export interface Post {
  id: string;
  familyId: string;
  groupId: string;
  groupType: GroupType;
  childId?: string;
  child?: Child;
  author: User;
  imageUrl: string;
  caption: string;
  source: SourceType;
  reactions: Reaction[];
  comments: Comment[];
  reactionCount: number;
  commentCount: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  user: User;
  content: string;
  createdAt: string;
}

export interface Reaction {
  id: string;
  postId: string;
  userId: string;
  user: User;
  type: ReactionType;
}

// ─── Upload ───────────────────────────────────────────────────────────────────

export interface UploadAsset {
  uri: string;
  filename?: string;
  width?: number;
  height?: number;
  creationTime?: number;
  id?: string;
}

export interface UploadPayload {
  assets: UploadAsset[];
  groupType: GroupType;
  caption?: string;
  source: SourceType;
  childId?: string;
  useAiCaption: boolean;
}

export interface UploadProgress {
  total: number;
  uploaded: number;
  isComplete: boolean;
  isFailed: boolean;
}

// ─── Notifications ────────────────────────────────────────────────────────────

export interface AppNotification {
  id: string;
  type: 'NEW_PHOTO' | 'NEW_KIDSNOTE' | 'NEW_COMMENT' | 'NEW_REACTION';
  title: string;
  body: string;
  data?: Record<string, string>;
  isRead: boolean;
  createdAt: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
}
