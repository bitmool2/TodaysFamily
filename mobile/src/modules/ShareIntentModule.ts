import { NativeModules, Platform } from 'react-native';

export interface SharePayload {
  /** 'image' for photo shares, 'text' for URL/text shares */
  type: 'image' | 'text';
  /** file:// URIs (iOS) or absolute paths (Android) of shared images */
  uris: string[];
  /** URL or text content when type === 'text' */
  text: string | null;
}

interface NativeShareIntentModule {
  getShareIntent(): Promise<SharePayload | null>;
  clearShareIntent(): void;
}

/**
 * Access the native ShareIntentModule.
 *
 * Android: defined in ShareIntentModule.kt / ShareIntentPackage.kt
 * iOS:     defined in ShareIntentModule.swift / ShareIntentModule.m
 *
 * Falls back to a no-op stub when running in Expo Go (no native module).
 */
const native: NativeShareIntentModule =
  NativeModules.ShareIntentModule ?? {
    getShareIntent: async () => null,
    clearShareIntent: () => {},
  };

export const ShareIntentModule: NativeShareIntentModule = {
  getShareIntent: () => native.getShareIntent(),
  clearShareIntent: () => native.clearShareIntent(),
};
