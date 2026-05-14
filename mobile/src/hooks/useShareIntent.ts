import { useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus, Linking, Platform } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { ShareIntentModule, SharePayload } from '@/modules/ShareIntentModule';
import type { RootStackParamList } from '@/types/navigation';
import type { UploadAsset } from '@/types';

/**
 * useShareIntent
 *
 * Listens for incoming share intents from:
 *   Android — ACTION_SEND / ACTION_SEND_MULTIPLE (images or text)
 *   iOS     — Share Extension writing to App Group UserDefaults
 *
 * When a pending share is detected (on mount OR when app enters foreground):
 *   1. Reads the payload via the native module
 *   2. Converts it to UploadAsset[]
 *   3. Navigates to the Preview screen with source = 'KIDSNOTE'
 *   4. Clears the pending intent so it won't fire again
 */
export function useShareIntent() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const handledRef = useRef<string | null>(null); // track last-processed timestamp

  const processIntent = useCallback(async () => {
    try {
      const payload = await ShareIntentModule.getShareIntent();
      if (!payload) return;

      // De-duplicate: skip if we already processed this payload this session
      const key = JSON.stringify(payload.uris) + (payload.text ?? '');
      if (handledRef.current === key) return;
      handledRef.current = key;

      ShareIntentModule.clearShareIntent();

      if (payload.type === 'image' && payload.uris.length > 0) {
        const assets: UploadAsset[] = payload.uris.map((uri, i) => ({
          id: `share_${Date.now()}_${i}`,
          uri: normaliseUri(uri),
          filename: `shared_${i + 1}.jpg`,
          width: 0,
          height: 0,
          creationTime: Date.now(),
        }));

        navigation.navigate('Preview', { assets, source: 'GALLERY' });
      }
      // text/URL shares (e.g. KidsNote notice URLs) — open KidsNote guide
      else if (payload.type === 'text' && payload.text) {
        navigation.navigate('KidsNoteGuide');
      }
    } catch (err) {
      // Silently ignore — user simply didn't share anything
    }
  }, [navigation]);

  // ── Check on mount (cold start via share intent) ─────────────────────────
  useEffect(() => {
    // Small delay so navigation is ready
    const timer = setTimeout(processIntent, 800);
    return () => clearTimeout(timer);
  }, [processIntent]);

  // ── Check when app enters foreground (warm start, iOS extension just ran) ──
  useEffect(() => {
    let prev = AppState.currentState;

    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (prev.match(/inactive|background/) && next === 'active') {
        processIntent();
      }
      prev = next;
    });

    return () => sub.remove();
  }, [processIntent]);

  // ── iOS deep link: todaysfamily://share ──────────────────────────────────
  useEffect(() => {
    const handleURL = ({ url }: { url: string }) => {
      if (url.startsWith('todaysfamily://share')) {
        // Brief delay lets ShareViewController finish writing to UserDefaults
        setTimeout(processIntent, 300);
      }
    };

    const sub = Linking.addEventListener('url', handleURL);

    // Handle cold-start URL
    Linking.getInitialURL().then((url) => {
      if (url?.startsWith('todaysfamily://share')) {
        setTimeout(processIntent, 800);
      }
    });

    return () => sub.remove();
  }, [processIntent]);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Ensure URI has a proper scheme that React Native Image can load */
function normaliseUri(uri: string): string {
  if (uri.startsWith('file://') || uri.startsWith('content://')) return uri;
  if (uri.startsWith('/')) return `file://${uri}`;
  return uri;
}
