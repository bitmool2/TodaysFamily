import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Animated,
  ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackScreenProps } from '@/types/navigation';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/theme';

const { width: W } = Dimensions.get('window');

type Props = RootStackScreenProps<'Onboarding'>;

interface Page {
  id: string;
  emoji: string;
  bgColor: string;
  accentColor: string;
  title: string;
  subtitle: string;
  features: { icon: string; label: string; desc: string }[];
}

const PAGES: Page[] = [
  {
    id: '1',
    emoji: '🏠',
    bgColor: Colors.primaryPale,
    accentColor: Colors.primary,
    title: '손주 사진과 어린이집 기록을\n자동으로 가족에게 공유하세요',
    subtitle: '어린이집 사진을 가족 단톡방에\n매번 보내지 마세요.\n오늘의가족이 앨범으로 정리해드려요.',
    features: [
      { icon: '🔍', label: '키즈노트 사진 자동 감지', desc: '저장하는 순간 자동으로 감지' },
      { icon: '👨‍👩‍👧', label: '친정/시댁 분리 공유',  desc: '그룹별 맞춤 공유' },
      { icon: '📁', label: '가족 앨범 자동 정리',     desc: '날짜별로 깔끔하게 정리' },
    ],
  },
  {
    id: '2',
    emoji: '⬆️',
    bgColor: '#FBE8DC',
    accentColor: '#D4845A',
    title: '사진을 저장만 하면\n자동으로 업로드돼요',
    subtitle: '키즈노트에서 사진을 저장하면\n앱이 자동으로 감지해\n가족 앨범에 올려드려요.',
    features: [
      { icon: '🤖', label: '사진 자동 업로드',   desc: '앱 실행 없이도 자동으로' },
      { icon: '📋', label: '키즈노트 공유 연동', desc: '한 번 설정으로 영원히 자동' },
      { icon: '👪', label: '친정 / 시댁 분리',  desc: '원하는 그룹에만 공유' },
    ],
  },
  {
    id: '3',
    emoji: '✨',
    bgColor: '#E8E4FB',
    accentColor: '#7C5CBF',
    title: 'AI가 소중한 순간을\n더 특별하게 만들어줘요',
    subtitle: 'AI가 사진을 분석해 감동적인\n한줄 캡션을 자동으로 작성하고\n특별한 추억을 찾아드려요.',
    features: [
      { icon: '✍️', label: 'AI 한줄 메모 추천',       desc: '사진마다 맞춤 캡션 자동 생성' },
      { icon: '🏆', label: 'AI 베스트 사진 추천',      desc: '가장 예쁜 사진을 골라드려요' },
      { icon: '🗓️', label: 'AI 추억 리마인드',         desc: '1년 전 오늘을 알려드려요' },
    ],
  },
];

export default function OnboardingScreen({ navigation }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const idx = viewableItems[0]?.index ?? 0;
      setActiveIndex(idx);
      Animated.spring(progressAnim, {
        toValue: idx / (PAGES.length - 1),
        useNativeDriver: false,
        tension: 80,
        friction: 10,
      }).start();
    }
  ).current;

  const goNext = () => {
    if (activeIndex < PAGES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1 });
    } else {
      navigation.replace('Login');
    }
  };

  const page = PAGES[activeIndex];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Skip */}
        <View style={styles.topBar}>
          <View style={styles.logoRow}>
            <Text style={styles.logoText}>오늘의가족</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.replace('Login')}>
            <Text style={styles.skipText}>건너뛰기</Text>
          </TouchableOpacity>
        </View>

        {/* Pages */}
        <FlatList
          ref={flatListRef}
          data={PAGES}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
          renderItem={({ item }) => <OnboardingPage item={item} />}
        />

        {/* Bottom nav */}
        <View style={styles.bottomNav}>
          {/* Dots */}
          <View style={styles.dotsRow}>
            {PAGES.map((_, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.dot, i === activeIndex && styles.dotActive]}
                onPress={() => flatListRef.current?.scrollToIndex({ index: i })}
              />
            ))}
          </View>

          {/* CTA Button */}
          <TouchableOpacity
            style={[styles.ctaBtn, { backgroundColor: page.accentColor }]}
            onPress={goNext}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaBtnText}>
              {activeIndex === PAGES.length - 1 ? '시작하기' : '다음'}
            </Text>
            <Ionicons
              name={activeIndex === PAGES.length - 1 ? 'checkmark-circle-outline' : 'arrow-forward'}
              size={20}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

function OnboardingPage({ item }: { item: Page }) {
  return (
    <View style={[styles.page]}>
      {/* Illustration blob */}
      <View style={[styles.illustrationBlob, { backgroundColor: item.bgColor }]}>
        <Text style={styles.illustrationEmoji}>{item.emoji}</Text>
        {/* Decorative small icons */}
        <View style={[styles.floatIcon, { top: 18, right: 24 }]}>
          <Text style={{ fontSize: 20 }}>📸</Text>
        </View>
        <View style={[styles.floatIcon, { bottom: 24, left: 20 }]}>
          <Text style={{ fontSize: 18 }}>❤️</Text>
        </View>
      </View>

      {/* Text */}
      <View style={styles.textSection}>
        <Text style={[styles.title, { color: item.accentColor }]}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </View>

      {/* Feature list */}
      <View style={styles.featureList}>
        {item.features.map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <View style={[styles.featureIconBg, { backgroundColor: item.bgColor }]}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureLabel}>{f.label}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  safeArea: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  logoText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.primary },
  skipText: { fontSize: FontSize.sm, color: Colors.textMuted, fontWeight: FontWeight.medium },
  page: {
    width: W,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    gap: Spacing.xl,
  },
  illustrationBlob: {
    width: '100%',
    height: 200,
    borderRadius: Radius.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  illustrationEmoji: { fontSize: 80 },
  floatIcon: {
    position: 'absolute',
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textSection: { gap: Spacing.md },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  featureList: { gap: Spacing.md },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  featureIconBg: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIcon: { fontSize: 22 },
  featureText: { flex: 1 },
  featureLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  featureDesc: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  bottomNav: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    gap: Spacing.lg,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.primary,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 17,
    borderRadius: Radius.full,
  },
  ctaBtnText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: '#fff',
  },
});
