import { create } from 'zustand';
import type { UploadAsset, UploadProgress, GroupType, SourceType } from '@/types';

interface UploadStore {
  // Auto detection
  detectedAssets: UploadAsset[];
  showDetectionPopup: boolean;

  // Current upload session
  selectedAssets: UploadAsset[];
  selectedGroupType: GroupType;
  caption: string;
  useAiCaption: boolean;
  source: SourceType;
  progress: UploadProgress;

  // Upload status
  isUploading: boolean;
  error: string | null;

  // Settings
  autoUploadEnabled: boolean;
  wifiOnlyUpload: boolean;
  autoUploadAlbum: string;
  recentAutoUpload: boolean;

  // Actions
  setDetectedAssets: (assets: UploadAsset[]) => void;
  setShowDetectionPopup: (show: boolean) => void;
  setSelectedAssets: (assets: UploadAsset[]) => void;
  setSelectedGroupType: (type: GroupType) => void;
  setCaption: (caption: string) => void;
  setUseAiCaption: (use: boolean) => void;
  setSource: (source: SourceType) => void;
  updateProgress: (uploaded: number, total: number) => void;
  setUploadComplete: () => void;
  setIsUploading: (v: boolean) => void;
  setError: (err: string | null) => void;
  setAutoUploadEnabled: (enabled: boolean) => void;
  setWifiOnlyUpload: (enabled: boolean) => void;
  setAutoUploadAlbum: (album: string) => void;
  setRecentAutoUpload: (enabled: boolean) => void;
  resetUpload: () => void;
}

const initialProgress: UploadProgress = {
  total: 0,
  uploaded: 0,
  isComplete: false,
  isFailed: false,
};

export const useUploadStore = create<UploadStore>((set) => ({
  detectedAssets: [],
  showDetectionPopup: false,
  selectedAssets: [],
  selectedGroupType: 'ALL',
  caption: '',
  useAiCaption: true,
  source: 'GALLERY',
  progress: initialProgress,
  isUploading: false,
  error: null,
  autoUploadEnabled: false,
  wifiOnlyUpload: true,
  autoUploadAlbum: '오늘의가족 자동업로드',
  recentAutoUpload: false,

  setDetectedAssets: (assets) => set({ detectedAssets: assets }),
  setShowDetectionPopup: (show) => set({ showDetectionPopup: show }),
  setSelectedAssets: (assets) => set({ selectedAssets: assets }),
  setSelectedGroupType: (type) => set({ selectedGroupType: type }),
  setCaption: (caption) => set({ caption }),
  setUseAiCaption: (use) => set({ useAiCaption: use }),
  setSource: (source) => set({ source }),
  updateProgress: (uploaded, total) =>
    set({ progress: { total, uploaded, isComplete: false, isFailed: false } }),
  setUploadComplete: () =>
    set((s) => ({ progress: { ...s.progress, isComplete: true } })),
  setIsUploading: (v) => set({ isUploading: v }),
  setError: (err) => set({ error: err }),
  setAutoUploadEnabled: (enabled) => set({ autoUploadEnabled: enabled }),
  setWifiOnlyUpload: (enabled) => set({ wifiOnlyUpload: enabled }),
  setAutoUploadAlbum: (album) => set({ autoUploadAlbum: album }),
  setRecentAutoUpload: (enabled) => set({ recentAutoUpload: enabled }),
  resetUpload: () =>
    set({
      selectedAssets: [],
      caption: '',
      source: 'GALLERY',
      progress: initialProgress,
      isUploading: false,
      error: null,
    }),
}));
