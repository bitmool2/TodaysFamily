import { useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { useUploadStore } from '@/store/uploadStore';
import type { UploadAsset } from '@/types';

const DETECTION_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MIN_BATCH_SIZE = 2;
const TIMESTAMP_GAP_MS = 30 * 1000; // 30 seconds gap = same batch

function isBatchSaved(assets: MediaLibrary.Asset[]): boolean {
  if (assets.length < MIN_BATCH_SIZE) return false;

  // Check if timestamps are continuous (within 30s gaps)
  const sorted = [...assets].sort((a, b) => a.creationTime - b.creationTime);
  for (let i = 1; i < sorted.length; i++) {
    const gap = sorted[i].creationTime - sorted[i - 1].creationTime;
    if (gap > TIMESTAMP_GAP_MS) return false;
  }
  return true;
}

export function usePhotoDetection() {
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const lastCheckedAt = useRef<number>(Date.now());
  const uploadedIds = useRef<Set<string>>(new Set());

  const setDetectedAssets = useUploadStore((s) => s.setDetectedAssets);
  const setShowDetectionPopup = useUploadStore((s) => s.setShowDetectionPopup);

  const checkRecentPhotos = useCallback(async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') return;

    const now = Date.now();
    const since = now - DETECTION_WINDOW_MS;

    const { assets } = await MediaLibrary.getAssetsAsync({
      first: 50,
      sortBy: MediaLibrary.SortBy.creationTime,
      mediaType: MediaLibrary.MediaType.photo,
      createdAfter: since,
    });

    if (!assets || assets.length === 0) return;

    // Filter out already uploaded
    const newAssets = assets.filter((a) => !uploadedIds.current.has(a.id));
    if (newAssets.length === 0) return;

    // Check batch save pattern (approximates KidsNote behavior)
    if (!isBatchSaved(newAssets)) return;

    const uploadAssets: UploadAsset[] = newAssets.map((a) => ({
      uri: a.uri,
      filename: a.filename,
      width: a.width,
      height: a.height,
      creationTime: a.creationTime,
      id: a.id,
    }));

    setDetectedAssets(uploadAssets);
    setShowDetectionPopup(true);
    lastCheckedAt.current = now;
  }, [setDetectedAssets, setShowDetectionPopup]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      const prev = appState.current;
      appState.current = nextState;

      // App came to foreground
      if (prev.match(/inactive|background/) && nextState === 'active') {
        checkRecentPhotos();
      }
    });

    return () => subscription.remove();
  }, [checkRecentPhotos]);

  const markAsUploaded = useCallback((ids: string[]) => {
    ids.forEach((id) => uploadedIds.current.add(id));
  }, []);

  return { markAsUploaded };
}
