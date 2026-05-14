import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackScreenProps } from '@/types/navigation';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadow } from '@/theme';
import { useUploadStore } from '@/store/uploadStore';

type Props = RootStackScreenProps<'UploadComplete'>;
const { width: W } = Dimensions.get('window');

const GROUP_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  ALL:      { label: '전체 가족',  emoji: '👨‍👩‍👧‍👦', color: Colors.primary },
  MATERNAL: { label: '친정 가족',  emoji: '👩‍👧',    color: '#C4693A'       },
  PATERNAL: { label: '시댁 가족',  emoji: '👴',      color: '#3A6CB5'       },
};

// Floating photo positions
const FLOATS = [
  { x: -80, y: -60, rotate: '-15deg', delay: 0,   size: 72 },
  { x:  60, y: -80, rotate:  '10deg', delay: 100, size: 64 },
  { x: -90, y:  20, rotate: '-8deg',  delay: 200, size: 56 },
  { x:  80, y:  30, rotate: '12deg',  delay: 150, size: 68 },
  { x: -40, y:  90, rotate: '-5deg',  delay: 300, size: 60 },
  { x:  50, y:  85, rotate:  '8deg',  delay: 50,  size: 64 },
];

export default function UploadCompleteScreen({ route, navigation }: Props) {
  const { count, groupType } = route.params;
  const resetUpload = useUploadStore((s) => s.resetUpload);
  const groupInfo = GROUP_LABELS[groupType] ?? GROUP_LABELS.ALL;

  // Animations
  const circleScale  = useRef(new Animated.Value(0)).current;
  const checkOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity  = useRef(new Animated.Value(0)).current;
  const btnsOpacity  = useRef(new Animated.Value(0)).current;
  const floatAnims   = useRef(FLOATS.map(() => ({ scale: new Animated.Value(0), opacity: new Animated.Value(0) }))).current;

  useEffect(() => {
    Animated.sequence([
      // Circle bounce
      Animated.spring(circleScale, { toValue: 1, tension: 70, friction: 5, useNativeDriver: true }),
      // Check + text
      Animated.parallel([
        Animated.timing(checkOpacity,  { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(textOpacity,   { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      // Float photos
      Animated.stagger(60, floatAnims.map((a) =>
        Animated.parallel([
          Animated.spring(a.scale,   { toValue: 1, tension: 80, friction: 6, useNativeDriver: true }),
          Animated.timing(a.opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        ])
      )),
      // Buttons
      Animated.timing(btnsOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleViewAlbum = () => {
    resetUpload();
    navigation.navigate('Main');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.handle} />

        <View style={styles.content}>
          {/* Floating photos */}
          {FLOATS.map((f, i) => (
            <Animated.View
              key={i}
              style={[
                styles.floatPhoto,
                {
                  width: f.size,
                  height: f.size,
                  transform: [
                    { translateX: f.x },
                    { translateY: f.y },
                    { rotate: f.rotate },
                    { scale: floatAnims[i].scale },
                  ],
                  opacity: floatAnims[i].opacity,
                },
              ]}
            >
              <Text style={styles.floatEmoji}>📷</Text>
            </Animated.View>
          ))}

          {/* Success circle */}
          <Animated.View style={[styles.successCircle, { transform: [{ scale: circleScale }] }]}>
            <Animated.Text style={[styles.successEmoji, { opacity: checkOpacity }]}>🎉</Animated.Text>
          </Animated.View>

          {/* Text */}
          <Animated.View style={[styles.textBlock, { opacity: textOpacity }]}>
            <Text style={styles.title}>공유 완료!</Text>
            <Text style={styles.subtitle}>
              어린이집 사진 <Text style={[styles.highlight, { color: groupInfo.color }]}>{count}장</Text>이{'\n'}
              <Text style={[styles.highlight, { color: groupInfo.color }]}>{groupInfo.emoji} {groupInfo.label}</Text>에게 공유되었어요
            </Text>

            {/* Reaction preview */}
            <View style={styles.reactionPreview}>
              {['👵', '👴', '👨'].map((emoji, i) => (
                <View key={i} style={[styles.reactionAvatar, { marginLeft: i > 0 ? -10 : 0 }]}>
                  <Text style={{ fontSize: 20 }}>{emoji}</Text>
                </View>
              ))}
              <Text style={styles.reactionText}>가족이 곧 확인할 거예요!</Text>
            </View>
          </Animated.View>

          {/* Buttons */}
          <Animated.View style={[styles.btns, { opacity: btnsOpacity }]}>
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: groupInfo.color }]}
              onPress={handleViewAlbum}
              activeOpacity={0.85}
            >
              <Ionicons name="images-outline" size={20} color="#fff" />
              <Text style={styles.primaryBtnText}>앨범 보기</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.85}>
              <Ionicons name="link-outline" size={20} color={Colors.primary} />
              <Text style={styles.secondaryBtnText}>공유 링크 보내기</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleViewAlbum} style={styles.skipBtn}>
              <Text style={styles.skipBtnText}>홈으로 돌아가기</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}

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
    gap: Spacing.xl,
  },
  floatPhoto: {
    position: 'absolute',
    borderRadius: Radius.lg,
    backgroundColor: Colors.primaryPale,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  floatEmoji: { fontSize: 28 },
  successCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: Colors.primaryPale,
    borderWidth: 4,
    borderColor: Colors.primary + '30',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },
  successEmoji: { fontSize: 52 },
  textBlock: { alignItems: 'center', gap: Spacing.lg },
  title: {
    fontSize: 30,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
  },
  highlight: { fontWeight: FontWeight.bold },
  reactionPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.background,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  reactionAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.primaryPale,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.backgroundCard,
  },
  reactionText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  btns: { width: '100%', gap: Spacing.md },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 17,
    borderRadius: Radius.full,
    ...Shadow.sm,
  },
  primaryBtnText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff' },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 17,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryPale,
  },
  secondaryBtnText: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.primary },
  skipBtn: { alignItems: 'center', paddingVertical: Spacing.md },
  skipBtnText: { fontSize: FontSize.sm, color: Colors.textMuted },
});
