import React, { useEffect, Component } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ScrollView } from 'react-native';
import RootNavigator from '@/navigation/RootNavigator';
import { linking } from '@/navigation/RootNavigator';
import AutoDetectionPopup from '@/components/upload/AutoDetectionPopup';
import { usePhotoDetection } from '@/hooks/usePhotoDetection';
import { useShareIntent } from '@/hooks/useShareIntent';
import { useUploadStore } from '@/store/uploadStore';

// ── Error Boundary: 오류 발생 시 화면에 상세 메시지 표시 ──────────────────────
class ErrorBoundary extends Component<{ children: React.ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      const err = this.state.error as Error;
      return (
        <View style={{ flex: 1, padding: 24, backgroundColor: '#fff', paddingTop: 60 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'red', marginBottom: 12 }}>
            🚨 앱 오류 발생
          </Text>
          <Text style={{ fontSize: 14, color: '#333', marginBottom: 8 }}>{err.message}</Text>
          <ScrollView>
            <Text style={{ fontSize: 11, color: '#666', fontFamily: 'monospace' }}>
              {err.stack}
            </Text>
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}

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
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <NavigationContainer linking={linking}>
            <StatusBar style="dark" />
            <AppContent />
          </NavigationContainer>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
