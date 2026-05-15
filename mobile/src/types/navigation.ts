import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { GroupType, UploadAsset } from './index';

// ─── Root Stack ───────────────────────────────────────────────────────────────

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: { inviteAdminEmail?: string; inviteGroupType?: string } | undefined;
  FamilyGroupSetup: undefined;
  Main: undefined;
  // Upload sub-stack (modal)
  UploadModal: undefined;
  Camera: undefined;
  Preview: { assets: UploadAsset[]; source: 'CAMERA' | 'GALLERY' | 'KIDSNOTE' };
  UploadProgress: { total: number };
  UploadComplete: { count: number; groupType: GroupType };
  // Feed detail
  PostDetail: { postId: string };
  // Comments
  Comments: { postId: string };
  // Family invite
  FamilyInvite: { groupType: GroupType };
  // Guide
  KidsNoteGuide: undefined;
  // Profile edit
  EditProfile: undefined;
  // Album picker for auto-upload
  AlbumPicker: undefined;
  // Change password
  ChangePassword: undefined;
};

// ─── Bottom Tab ───────────────────────────────────────────────────────────────

export type TabParamList = {
  HomeTab: undefined;
  FeedTab: undefined;
  FamilyTab: undefined;
  SettingsTab: undefined;
};

// ─── Screen Props helpers ─────────────────────────────────────────────────────

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type TabScreenProps<T extends keyof TabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;
