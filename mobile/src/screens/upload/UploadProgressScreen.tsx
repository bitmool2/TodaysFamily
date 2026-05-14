import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/theme';
import type { RootStackScreenProps } from '@/types/navigation';
import { useUploadStore } from '@/store/uploadStore';

type Props = RootStackScreenProps<'UploadProgress'>;

export default function UploadProgressScreen({ route }: Props) {
  const { total } = route.params;
  const progress = useUploadStore((s) => s.progress);

  const barAnim   = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const spinAnim  = useRef(new Animated.Value(0)).current;

  // Spin animation for cloud icon
  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  // Progress bar
  useEffect(() => {
    const pct = progress.total > 0 ? progress.uploaded / progress.total : 0;
    Animated.spring(barAnim, {
      toValue: pct,
      tension: 60,
      friction: 10,
      useNativeDriver: false,
    }).start();
    // Pulse on each upload
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.08, duration: 150, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1,    duration: 150, useNativeDriver: true }),
    ]).start();
  }, [progress.uploaded]);

  const pct     = progress.total > 0 ? Math.round((progress.uploaded / progress.total) * 100) : 0;
  const current = progress.uploaded;
  const ttl     = progress.total || total;

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.handle} />

        <View style={styles.content}>
          {/* Animated cloud */}
          <Animated.View style={[styles.cloudWrapper, { transform: [{ scale: pulseAnim }] }]}>
            <View style={styles.cloudBg}>
              <Text style={styles.cloudEmoji}>☁️</Text>
            </View>
            {/* Orbiting dot */}
            <Animated.View style={[
              styles.orbitDot,
              { transform: [{ rotate: spin }] },
            ]}>
              <View style={styles.orbitDotInner} />
            </Animated.View>
            {/* Arrow */}
            <View style={styles.arrowBadge}>
              <Text style={styles.arrowEmoji}>⬆️</Text>
            </View>
          </Animated.View>

          <View style={styles.textBlock}>
            <Text style={styles.title}>사진을 업로드중이에요</Text>
            <Text style={styles.subtitle}>
              어린이집 사진 {ttl}장을{'\n'}가족 앨범에 업로드 중이에요
            </Text>
          </View>

          {/* Progress bar */}
          <View style={styles.progressSection}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressLabel}>업로드 중...</Text>
              <Text style={styles.progressPct}>{pct}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: barAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
              {/* Glow dot */}
              <Animated.View
                style={[
                  styles.progressGlow,
                  {
                    left: barAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '96%'],
                    }),
                  },
                ]}
              />
            </View>
            <Text style={styles.progressCount}>
              {current} / {ttl} 장
            </Text>
          </View>

          {/* Photo thumbnails row */}
          <View style={styles.thumbRow}>
            {[...Array(Math.min(ttl, 5))].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.miniThumb,
                  i < current && styles.miniThumbDone,
                ]}
              >
                {i < current
                  ? <Text style={styles.miniThumbCheck}>✓</Text>
                  : <Text style={styles.miniThumbIcon}>📷</Text>
                }
              </View>
            ))}
            {ttl > 5 && <Text style={styles.moreCount}>+{ttl - 5}</Text>}
          </View>

          <Text style={styles.waitText}>잠시만 기다려주세요 😊</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const ORBIT_R = 52;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundCard },
  safeArea: { flex: 1 },
  handle: {
    width: 44,
    height: 5,
    backgroundColor: Colors.border,
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: Spacing.md,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxxl,
    gap: Spacing.xxl,
  },
  cloudWrapper: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cloudBg: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primaryPale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cloudEmoji: { fontSize: 48 },
  orbitDot: {
    position: 'absolute',
    width: ORBIT_R * 2,
    height: ORBIT_R * 2,
    top: (120 - ORBIT_R * 2) / 2,
    left: (120 - ORBIT_R * 2) / 2,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  orbitDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    marginRight: -5,
  },
  arrowBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowEmoji: { fontSize: 16 },
  textBlock: { alignItems: 'center', gap: Spacing.sm },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  progressSection: { width: '100%', gap: Spacing.sm },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  progressPct: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  progressTrack: {
    height: 12,
    backgroundColor: Colors.backgroundMuted,
    borderRadius: 6,
    overflow: 'visible',
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 6,
  },
  progressGlow: {
    position: 'absolute',
    top: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4,
  },
  progressCount: {
    textAlign: 'center',
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },
  thumbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  miniThumb: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.backgroundMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  miniThumbDone: {
    backgroundColor: Colors.primaryPale,
    borderColor: Colors.primary,
  },
  miniThumbCheck: { fontSize: 18, color: Colors.primary },
  miniThumbIcon: { fontSize: 18 },
  moreCount: { fontSize: FontSize.sm, color: Colors.textMuted, fontWeight: FontWeight.bold },
  waitText: { fontSize: FontSize.base, color: Colors.textSecondary },
});
