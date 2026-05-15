import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import type { RootStackParamList } from '@/types/navigation';

import SplashScreen from '@/screens/SplashScreen';
import OnboardingScreen from '@/screens/OnboardingScreen';
import LoginScreen from '@/screens/auth/LoginScreen';
import FamilyGroupSetupScreen from '@/screens/auth/FamilyGroupSetupScreen';
import TabNavigator from './TabNavigator';

// Upload flow
import UploadModalScreen from '@/screens/upload/UploadModalScreen';
import CameraScreen from '@/screens/upload/CameraScreen';
import PreviewScreen from '@/screens/upload/PreviewScreen';
import UploadProgressScreen from '@/screens/upload/UploadProgressScreen';
import UploadCompleteScreen from '@/screens/upload/UploadCompleteScreen';

// Detail
import PostDetailScreen from '@/screens/feed/PostDetailScreen';
import CommentsScreen from '@/screens/feed/CommentsScreen';
import FamilyInviteScreen from '@/screens/family/FamilyInviteScreen';
import KidsNoteGuideScreen from '@/screens/settings/KidsNoteGuideScreen';
import EditProfileScreen from '@/screens/settings/EditProfileScreen';
import AlbumPickerScreen from '@/screens/settings/AlbumPickerScreen';
import ChangePasswordScreen from '@/screens/settings/ChangePasswordScreen';

import { Colors } from '@/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Deep link 설정
 * todaysfamily://invite?adminEmail=xxx&groupType=MATERNAL
 * → Login 화면으로 params 전달
 */
const linking = {
  prefixes: ['todaysfamily://'],
  config: {
    screens: {
      Login: {
        path: 'invite',
        parse: {
          inviteAdminEmail: (value: string) => decodeURIComponent(value),
          inviteGroupType:  (value: string) => value,
        },
      },
    },
  },
};

export { linking };

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: 'fade',
      }}
    >
      {/* Auth flow */}
      <Stack.Screen name="Splash"           component={SplashScreen} />
      <Stack.Screen name="Onboarding"       component={OnboardingScreen} />
      <Stack.Screen name="Login"            component={LoginScreen} />
      <Stack.Screen name="FamilyGroupSetup" component={FamilyGroupSetupScreen} />

      {/* Main app */}
      <Stack.Screen
        name="Main"
        component={TabNavigator}
        options={{ animation: 'fade' }}
      />

      {/* Upload flow (modal stack) */}
      <Stack.Screen
        name="UploadModal"
        component={UploadModalScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="Camera"
        component={CameraScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Preview"
        component={PreviewScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="UploadProgress"
        component={UploadProgressScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom', gestureEnabled: false }}
      />
      <Stack.Screen
        name="UploadComplete"
        component={UploadCompleteScreen}
        options={{ presentation: 'modal', animation: 'fade', gestureEnabled: false }}
      />

      {/* Detail screens */}
      <Stack.Screen
        name="PostDetail"
        component={PostDetailScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Comments"
        component={CommentsScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="FamilyInvite"
        component={FamilyInviteScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="KidsNoteGuide"
        component={KidsNoteGuideScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="AlbumPicker"
        component={AlbumPickerScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
}
