import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import type { RootStackScreenProps } from '@/types/navigation';
import { Colors, FontSize, FontWeight } from '@/theme';

const { width: W, height: H } = Dimensions.get('window');

type Props = RootStackScreenProps<'Splash'>;

const FLOATING_DOTS = [
  { x: 0.12, y: 0.18, size: 8,  delay: 0   },
  { x: 0.85, y: 0.22, size: 12, delay: 200 },
  { x: 0.06, y: 0.55, size: 6,  delay: 400 },
  { x: 0.92, y: 0.60, size: 10, delay: 100 },
  { x: 0.20, y: 0.82, size: 8,  delay: 300 },
  { x: 0.78, y: 0.78, size: 6,  delay: 500 },
];

export default function SplashScreen({ navigation }: Props) {
  const logoScale  = useRef(new Animated.Value(0.75)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const dotAnims   = useRef(FLOATING_DOTS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // Logo entrance
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 70,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Floating dots
    dotAnims.forEach((anim, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(FLOATING_DOTS[i].delay),
          Animated.timing(anim, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      ).start();
    });

    const timer = setTimeout(() => navigation.replace('Onboarding'), 2600);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>
      {/* Decorative floating dots */}
      {FLOATING_DOTS.map((dot, i) => (
        <Animated.View
          key={i}
          style={[
            styles.dot,
            {
              width: dot.size,
              height: dot.size,
              borderRadius: dot.size / 2,
              left: W * dot.x,
              top:  H * dot.y,
              opacity: dotAnims[i].interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.7] }),
              transform: [{
                translateY: dotAnims[i].interpolate({ inputRange: [0, 1], outputRange: [0, -12] }),
              }],
            },
          ]}
        />
      ))}

      {/* Top decorative arc */}
      <View style={styles.topArc} />

      {/* Center content */}
      <View style={styles.center}>
        <Animated.View style={[styles.logoBox, { transform: [{ scale: logoScale }], opacity: logoOpacity }]}>
          {/* Outer ring */}
          <View style={styles.outerRing}>
            {/* Inner icon */}
            <View style={styles.innerIcon}>
              <Text style={styles.houseEmoji}>🏠</Text>
            </View>
          </View>
          {/* Heart badge */}
          <View style={styles.heartBadge}>
            <Text style={styles.heartEmoji}>❤️</Text>
          </View>
        </Animated.View>

        <Animated.View style={[styles.textBlock, { opacity: textOpacity }]}>
          <Text style={styles.appName}>오늘의가족</Text>
          <Text style={styles.tagline}>아이의 오늘을 가족과 함께 ❤️</Text>
        </Animated.View>
      </View>

      {/* Bottom illustration row */}
      <Animated.View style={[styles.bottomRow, { opacity: textOpacity }]}>
        {['📸', '👨‍👩‍👧', '📋', '✨'].map((emoji, i) => (
          <View key={i} style={styles.bottomChip}>
            <Text style={styles.bottomChipEmoji}>{emoji}</Text>
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topArc: {
    position: 'absolute',
    top: -100,
    width: W * 1.4,
    height: 320,
    borderRadius: W * 0.7,
    backgroundColor: Colors.primaryPale,
    alignSelf: 'center',
  },
  dot: {
    position: 'absolute',
    backgroundColor: Colors.primary,
  },
  center: {
    alignItems: 'center',
    gap: 28,
  },
  logoBox: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 3,
    borderColor: Colors.primaryLight + '40',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  innerIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primaryPale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  houseEmoji: { fontSize: 44 },
  heartBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  heartEmoji: { fontSize: 16 },
  textBlock: { alignItems: 'center', gap: 10 },
  appName: {
    fontSize: 32,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    letterSpacing: -0.8,
  },
  tagline: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    letterSpacing: 0.2,
  },
  bottomRow: {
    position: 'absolute',
    bottom: 72,
    flexDirection: 'row',
    gap: 12,
  },
  bottomChip: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  bottomChipEmoji: { fontSize: 24 },
});
