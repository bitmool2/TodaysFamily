import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadow } from '@/theme';
import type { TabScreenProps } from '@/types/navigation';

const { width: W } = Dimensions.get('window');

type Props = TabScreenProps<'HomeTab'>;

const RECENT_UPLOADS = [
  { id: '1', uri: 'https://picsum.photos/200/200?random=31', date: '오늘', group: '전체' },
  { id: '2', uri: 'https://picsum.photos/200/200?random=32', date: '어제', group: '친정' },
  { id: '3', uri: 'https://picsum.photos/200/200?random=33', date: '어제', group: '시댁' },
  { id: '4', uri: 'https://picsum.photos/200/200?random=34', date: '3일 전', group: '전체' },
  { id: '5', uri: 'https://picsum.photos/200/200?random=35', date: '4일 전', group: '친정' },
];

const AI_MEMORIES = [
  {
    id: '1',
    label: '✨ 1년 전 오늘',
    title: '민준이의 즐거운 하루',
    caption: '오늘 물감놀이가 너무 즐거웠어요 🎨',
    uri: 'https://picsum.photos/160/160?random=40',
    color: Colors.accentLight,
    textColor: Colors.accent,
  },
  {
    id: '2',
    label: '🏆 이번 주 베스트',
    title: '가장 많은 반응을 받은 사진',
    caption: '외할머니가 너무 좋아하셨어요 ❤️',
    uri: 'https://picsum.photos/160/160?random=41',
    color: '#E8F0FB',
    textColor: '#3A6CB5',
  },
];

const ALERTS = [
  { id: '1', icon: '👵', text: '외할머니가 사진에 ❤️ 반응을 보내셨어요', time: '5분 전' },
  { id: '2', icon: '📋', text: '키즈노트 새 알림: 민준이의 오늘 기록이 도착했어요', time: '1시간 전' },
  { id: '3', icon: '💬', text: '할아버지가 댓글을 남기셨어요: "우리 손자 최고!"', time: '2시간 전' },
];

export default function HomeScreen({ navigation }: Props) {
  const user = useAuthStore((s) => s.user);
  const today = new Date();
  const dateStr = `${today.getMonth() + 1}월 ${today.getDate()}일 (${['일','월','화','수','목','금','토'][today.getDay()]})`;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* ─── Header ─── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerDate}>{dateStr}</Text>
            <Text style={styles.greeting}>안녕하세요, {user?.name ?? '회원'}님 👋</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn} onPress={() => navigation.navigate('Main')}>
            <Ionicons name="notifications-outline" size={24} color={Colors.textPrimary} />
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* ─── 오늘의 소식 (stat cards) ─── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>오늘의 소식</Text>
            <View style={styles.statGrid}>
              <StatCard emoji="📸" label="새 사진" value="12장" bg={Colors.primaryPale} accent={Colors.primary} />
              <StatCard emoji="📋" label="키즈노트" value="1건"  bg="#FBE8DC" accent="#C4693A" />
              <StatCard emoji="❤️"  label="가족 반응" value="3개"  bg="#FDE8E8" accent="#D94F3D" />
            </View>
          </View>

          {/* ─── KidsNote 감지 배너 ─── */}
          <View style={styles.section}>
            <TouchableOpacity style={styles.kidsnoteDetect} activeOpacity={0.85}>
              <View style={styles.kdLeft}>
                <View style={styles.kdIconBg}>
                  <Text style={styles.kdIcon}>📷</Text>
                </View>
                <View>
                  <Text style={styles.kdTitle}>키즈노트 사진 8장 감지됨</Text>
                  <Text style={styles.kdSub}>지금 가족에게 공유할까요?</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.kdShareBtn}
                onPress={() => navigation.navigate('UploadModal')}
              >
                <Text style={styles.kdShareBtnText}>공유하기</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </View>

          {/* ─── 최근 업로드 ─── */}
          <View style={styles.sectionNoH}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>최근 업로드</Text>
              <TouchableOpacity onPress={() => {}}>
                <Text style={styles.seeAll}>전체 보기</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={RECENT_UPLOADS}
              keyExtractor={(i) => i.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentList}
              ItemSeparatorComponent={() => <View style={{ width: Spacing.md }} />}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.recentCard} activeOpacity={0.9}>
                  <Image source={{ uri: item.uri }} style={styles.recentImg} />
                  <View style={styles.recentOverlay}>
                    <Text style={styles.recentGroup}>{item.group}</Text>
                  </View>
                  <Text style={styles.recentDate}>{item.date}</Text>
                </TouchableOpacity>
              )}
            />
          </View>

          {/* ─── AI 추천 추억 ─── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>AI 추천 추억</Text>
              <View style={styles.aiBadge}>
                <Text style={styles.aiBadgeText}>✨ AI</Text>
              </View>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.memoryScroll}
            >
              {AI_MEMORIES.map((mem) => (
                <TouchableOpacity key={mem.id} style={[styles.memoryCard, { backgroundColor: mem.color }]} activeOpacity={0.9}>
                  <View style={styles.memoryTop}>
                    <View style={[styles.memoryLabel, { backgroundColor: 'rgba(255,255,255,0.7)' }]}>
                      <Text style={[styles.memoryLabelText, { color: mem.textColor }]}>{mem.label}</Text>
                    </View>
                  </View>
                  <Image source={{ uri: mem.uri }} style={styles.memoryImg} />
                  <View style={styles.memoryBottom}>
                    <Text style={[styles.memoryTitle, { color: mem.textColor }]}>{mem.title}</Text>
                    <Text style={styles.memoryCaption}>{mem.caption}</Text>
                    <Text style={[styles.memoryLink, { color: mem.textColor }]}>추억 보러가기 →</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* ─── 실시간 알림 ─── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>실시간 공유</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>더보기</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.alertList}>
              {ALERTS.map((a) => (
                <TouchableOpacity key={a.id} style={styles.alertRow} activeOpacity={0.8}>
                  <View style={styles.alertAvatar}>
                    <Text style={styles.alertEmoji}>{a.icon}</Text>
                  </View>
                  <View style={styles.alertContent}>
                    <Text style={styles.alertText} numberOfLines={2}>{a.text}</Text>
                    <Text style={styles.alertTime}>{a.time}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

        </ScrollView>

        {/* ─── FAB ─── */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('UploadModal')}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={30} color="#fff" />
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

function StatCard({ emoji, label, value, bg, accent }: {
  emoji: string; label: string; value: string; bg: string; accent: string;
}) {
  return (
    <View style={[styles.statCard, { backgroundColor: bg }]}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={[styles.statValue, { color: accent }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  headerDate: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  greeting: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  notifBtn: { position: 'relative', padding: 6 },
  notifBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.background,
  },
  notifBadgeText: { color: '#fff', fontSize: 9, fontWeight: FontWeight.bold },
  scroll: { paddingBottom: 110 },
  section: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.xxl },
  sectionNoH: { marginBottom: Spacing.xxl },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  seeAll: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semibold },
  // Stat cards
  statGrid: { flexDirection: 'row', gap: Spacing.md },
  statCard: {
    flex: 1,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: 5,
  },
  statEmoji: { fontSize: 26 },
  statValue: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  statLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  // KidsNote detect
  kidsnoteDetect: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primaryPale,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.primary + '33',
  },
  kdLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  kdIconBg: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kdIcon: { fontSize: 22 },
  kdTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.primary },
  kdSub: { fontSize: FontSize.xs, color: Colors.primary, opacity: 0.75, marginTop: 2 },
  kdShareBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  kdShareBtnText: { color: '#fff', fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  // Recent uploads
  recentList: { paddingHorizontal: Spacing.xl },
  recentCard: { width: 108, gap: 6 },
  recentImg: {
    width: 108,
    height: 108,
    borderRadius: Radius.lg,
  },
  recentOverlay: {
    position: 'absolute',
    top: 7,
    left: 7,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  recentGroup: { color: '#fff', fontSize: 10, fontWeight: FontWeight.bold },
  recentDate: { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'center' },
  // AI memories
  aiBadge: {
    backgroundColor: Colors.accentLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  aiBadgeText: { fontSize: FontSize.xs, color: Colors.accent, fontWeight: FontWeight.bold },
  memoryScroll: { paddingHorizontal: Spacing.xl, gap: Spacing.md },
  memoryCard: {
    width: W * 0.72,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  memoryTop: { padding: Spacing.md },
  memoryLabel: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  memoryLabelText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  memoryImg: { width: '100%', height: 140 },
  memoryBottom: { padding: Spacing.lg, gap: 4 },
  memoryTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold },
  memoryCaption: { fontSize: FontSize.sm, color: Colors.textSecondary },
  memoryLink: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, marginTop: 4 },
  // Alerts
  alertList: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  alertAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryPale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertEmoji: { fontSize: 20 },
  alertContent: { flex: 1 },
  alertText: { fontSize: FontSize.sm, color: Colors.textPrimary, lineHeight: 19 },
  alertTime: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 3 },
  fab: {
    position: 'absolute',
    right: Spacing.xl,
    bottom: 88,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.lg,
  },
});
