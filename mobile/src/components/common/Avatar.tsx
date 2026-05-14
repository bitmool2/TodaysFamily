import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Colors, Radius } from '@/theme';

interface Props {
  emoji?: string;
  imageUri?: string;
  name?: string;
  size?: number;
  showBorder?: boolean;
}

export default function Avatar({ emoji = '👤', imageUri, name, size = 40, showBorder = false }: Props) {
  const initials = name ? name.charAt(0) : '';

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2 },
        showBorder && styles.border,
      ]}
    >
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={{ width: size, height: size, borderRadius: size / 2 }} />
      ) : name ? (
        <Text style={[styles.initials, { fontSize: size * 0.38 }]}>{initials}</Text>
      ) : (
        <Text style={{ fontSize: size * 0.5 }}>{emoji}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primaryPale,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  border: {
    borderWidth: 2,
    borderColor: Colors.backgroundCard,
  },
  initials: {
    fontWeight: '700',
    color: Colors.primary,
  },
});
