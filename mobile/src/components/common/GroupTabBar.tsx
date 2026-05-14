import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/theme';
import type { GroupType } from '@/types';

interface Tab { type: GroupType; label: string; emoji?: string }

interface Props {
  tabs: Tab[];
  active: GroupType;
  onChange: (type: GroupType) => void;
  style?: object;
}

export default function GroupTabBar({ tabs, active, onChange, style }: Props) {
  return (
    <View style={[styles.row, style]}>
      {tabs.map((tab) => {
        const isActive = active === tab.type;
        return (
          <TouchableOpacity
            key={tab.type}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onChange(tab.type)}
            activeOpacity={0.75}
          >
            {tab.emoji && <Text style={styles.emoji}>{tab.emoji}</Text>}
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: Colors.backgroundMuted,
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  emoji: { fontSize: 13 },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },
  labelActive: {
    color: Colors.textInverse,
  },
});
