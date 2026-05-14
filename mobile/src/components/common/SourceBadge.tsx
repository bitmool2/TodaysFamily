import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/theme';
import type { SourceType } from '@/types';

const CONFIG: Record<SourceType, { label: string; color: string; bg: string; icon: string }> = {
  CAMERA:   { label: '카메라',   color: Colors.cameraBadge,   bg: '#FBE8DC', icon: '📷' },
  GALLERY:  { label: '갤러리',   color: Colors.galleryBadge,  bg: '#F0E8FB', icon: '🖼' },
  KIDSNOTE: { label: '키즈노트', color: Colors.kidsnoteBadge, bg: '#E8F0FB', icon: '📋' },
};

interface Props {
  source: SourceType;
  size?: 'sm' | 'md';
}

export default function SourceBadge({ source, size = 'sm' }: Props) {
  const cfg = CONFIG[source];
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }, size === 'md' && styles.badgeMd]}>
      <Text style={[styles.icon, size === 'md' && styles.iconMd]}>{cfg.icon}</Text>
      <Text style={[styles.label, { color: cfg.color }, size === 'md' && styles.labelMd]}>
        {cfg.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  badgeMd: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
  },
  icon: { fontSize: 11 },
  iconMd: { fontSize: 13 },
  label: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  labelMd: { fontSize: FontSize.sm },
});
