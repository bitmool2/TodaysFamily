import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import RootNavigator from '@/navigation/RootNavigator';
import { linking } from '@/navigation/RootNavigator';
import AutoDetectionPopup from '@/components/upload/AutoDetectionPopup';
import { usePhotoDetection } from '@/hooks/usePhotoDetection';
import { useShareIntent } from '@/hooks/useShareIntent';
import { useUploadStore } from '@/store/uploadStore';

function AppContent() {
  const { markAsUploaded } = usePhotoDetection();
  useShareIntent(); // handles Android intents + iOS share extension
  const showDetectionPopup    = useUploadStore((s) => s.showDetectionPopup);
  const detectedAssets        = useUploadStore((s) => s.detectedAssets);
  const setShowDetectionPopup = useUploadStore((s) => s.setShowDetectionPopup);

  // AutoDetectionPopup now handles the full upload internally.
  // onShare is called after upload completes — we just close the popup
  // and mark assets as uploaded so they won't be detected again.
  const handleShare = (
    _groupType: 'ALL' | 'MATERNAL' | 'PATERNAL',
    _autoUpload: boolean,
    _postIds: string[],
  ) => {
    setShowDetectionPopup(false);
    const ids = detectedAssets.map((a) => a.id).filter(Boolean) as string[];
    markAsUploaded(ids);
  };

  return (
    <>
      <RootNavigator />
      <AutoDetectionPopup
        visible={showDetectionPopup}
        assets={detectedAssets}
        onShare={handleShare}
        onDismiss={() => setShowDetectionPopup(false)}
      />
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer linking={linking}>
          <StatusBar style="dark" />
          <AppContent />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
