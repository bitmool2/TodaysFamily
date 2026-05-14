import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadow } from '@/theme';

const { width: W } = Dimensions.get('window');

interface StepProps {
  number: string;
  emoji: string;
  title: string;
  desc: string;
  color: string;
  bg: string;
}

const STEPS: StepProps[] = [
  {
    number: '01',
    emoji: '📋',
    title: '키즈노트 앱 열기',
    desc: '키즈노트 앱을 열어 오늘 올라온 아이 사진을 확인해요.',
    color: Colors.kidsnoteBadge,
    bg: '#E8F0FB',
  },
  {
    number: '02',
    emoji: '⬇️',
    title: '사진 저장하기',
    desc: '사진을 길게 눌러 "사진 저장" 또는 다운로드 버튼을 탭하세요. 여러 장도 한 번에 저장할 수 있어요.',
    color: Colors.primary,
    bg: Colors.primaryPale,
  },
  {
    number: '03',
    emoji: '🔔',
    title: '오늘의가족 알림 확인',
    desc: '사진이 저장되면 오늘의가족이 자동으로 감지하고 팝업을 띄워드려요.',
    color: Colors.accent,
    bg: Colors.accentLight,
  },
  {
    number: '04',
    emoji: '👨‍👩‍👧',
    title: '가족에게 공유하기',
    desc: '"가족에게 공유하기" 버튼을 누르면 끝! 친정·시댁을 선택해서 원하는 그룹에 공유해요.',
    color: Colors.primary,
    bg: Colors.primaryPale,
  },
];

const TIPS = [
  { emoji: '⚡', text: '"다음부터 자동 업로드"를 체크하면 한 번만 설정해도 매번 자동으로 공유돼요' },
  { emoji: '📶', text: 'Wi-Fi에서만 업로드 설정으로 모바일 데이터를 절약할 수 있어요' },
  { emoji: '🔒', text: '친정/시댁 그룹을 분리해서 원하는 가족에게만 공유할 수 있어요' },
  { emoji: '🎨', text: 'AI 캡션으로 사진마다 감동적인 한줄 메모가 자동으로 생성돼요' },
];

export default function KidsNoteGuideScreen({ navigation }: { navigation: any }) {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>키즈노트 공유 방법</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Hero */}
          <View style={styles.hero}>
            <View style={styles.heroIcon}>
              <Text style={styles.heroEmoji}>📋</Text>
            </View>
            <Text style={styles.heroTitle}>키즈노트 사진을{'\n'}쉽게 가족과 공유해요</Text>
            <Text style={styles.heroSub}>
              저장만 하면 오늘의가족이 알아서 감지하고{'\n'}가족 앨범에 올려드려요
            </Text>
          </View>

          {/* Steps */}
          <View style={styles.stepsSection}>
            <Text style={styles.sectionTitle}>사용 방법</Text>
            {STEPS.map((step, i) => (
              <View key={i} style={styles.stepCard}>
                {/* Connector line */}
                {i < STEPS.length - 1 && <View style={styles.connector} />}

                <View style={[styles.stepNumber, { backgroundColor: step.bg }]}>
                  <Text style={[styles.stepNumberText, { color: step.color }]}>{step.number}</Text>
                </View>

                <View style={[styles.stepBody, { backgroundColor: step.bg }]}>
                  <View style={styles.stepTop}>
                    <Text style={styles.stepEmoji}>{step.emoji}</Text>
                    <Text style={[styles.stepTitle, { color: step.color }]}>{step.title}</Text>
                  </View>
                  <Text style={styles.stepDesc}>{step.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Auto-upload tip callout */}
          <View style={styles.autoCallout}>
            <View style={styles.autoCalloutLeft}>
              <Text style={styles.autoCalloutEmoji}>✨</Text>
              <View>
                <Text style={styles.autoCalloutTitle}>자동 업로드 켜기</Text>
                <Text style={styles.autoCalloutDesc}>
                  한 번만 체크하면 앞으로 자동으로 공유돼요
                </Text>
              </View>
            </View>
            <View style={styles.autoToggleMock}>
              <View style={styles.autoToggleOn} />
            </View>
          </View>

          {/* Tips */}
          <View style={styles.tipsSection}>
            <Text style={styles.sectionTitle}>💡 꿀팁</Text>
            <View style={styles.tipsCard}>
              {TIPS.map((tip, i) => (
                <View key={i} style={[styles.tipRow, i < TIPS.length - 1 && styles.tipBorder]}>
                  <Text style={styles.tipEmoji}>{tip.emoji}</Text>
                  <Text style={styles.tipText}>{tip.text}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* CTA */}
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
          >
            <Ionicons name="checkmark-circle-outline" size={22} color="#fff" />
            <Text style={styles.ctaBtnText}>이해했어요, 시작하기!</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backBtn: { padding: Spacing.xs },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  scroll: { padding: Spacing.xl, paddingBottom: 40, gap: Spacing.xxl },
  hero: {
    alignItems: 'center',
    gap: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  heroIcon: {
    width: 88,
    height: 88,
    borderRadius: Radius.xl,
    backgroundColor: '#E8F0FB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEmoji: { fontSize: 44 },
  heroTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 32,
  },
  heroSub: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  stepsSection: { gap: 0 },
  stepCard: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'flex-start',
    position: 'relative',
    paddingBottom: Spacing.lg,
  },
  connector: {
    position: 'absolute',
    left: 21,
    top: 44,
    width: 2,
    bottom: 0,
    backgroundColor: Colors.borderLight,
    zIndex: 0,
  },
  stepNumber: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    zIndex: 1,
  },
  stepNumberText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  stepBody: {
    flex: 1,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  stepTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  stepEmoji: { fontSize: 20 },
  stepTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, flex: 1 },
  stepDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  autoCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primaryPale,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    borderWidth: 1.5,
    borderColor: Colors.primary + '33',
  },
  autoCalloutLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  autoCalloutEmoji: { fontSize: 28 },
  autoCalloutTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.primary },
  autoCalloutDesc: { fontSize: FontSize.xs, color: Colors.primary, opacity: 0.8, marginTop: 2 },
  autoToggleMock: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 3,
  },
  autoToggleOn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
  },
  tipsSection: {},
  tipsCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    padding: Spacing.lg,
  },
  tipBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  tipEmoji: { fontSize: 18, width: 24, textAlign: 'center' },
  tipText: { flex: 1, fontSize: FontSize.sm, color: Colors.textPrimary, lineHeight: 20 },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingVertical: 17,
    ...Shadow.md,
  },
  ctaBtnText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff' },
});
