import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { TabParamList } from '@/types/navigation';
import CustomTabBar from './CustomTabBar';

import HomeScreen from '@/screens/home/HomeScreen';
import FeedScreen from '@/screens/feed/FeedScreen';
import FamilyScreen from '@/screens/family/FamilyScreen';
import SettingsScreen from '@/screens/settings/SettingsScreen';

const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="HomeTab"     component={HomeScreen} />
      <Tab.Screen name="FeedTab"     component={FeedScreen} />
      <Tab.Screen name="FamilyTab"   component={FamilyScreen} />
      <Tab.Screen name="SettingsTab" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
