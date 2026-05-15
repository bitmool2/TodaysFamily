import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { useUploadStore } from '@/store/uploadStore';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadow } from '@/theme';
import type { TabScreenProps } from '@/types/navigation';
import api from '@/api/client';
import { useFamilyStore } from '@/store/familyStore';

const { width: W } = Dimensions.get('window');
type Props = TabScreenProps<'HomeTab'>;

interface RecentUpload {
  id: string;
  uri: string;
  date: string;
  group: string;
  reactions: number;
}

function formatDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const day = Math.floor(diff / 86400000);
  if (day === 0) return '오늘';
  if (day === 1) return '어제';
  return `${day}일 전`;
}

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

export default function HomeScreen({ navigation }: Props) {
  const user = useAuthStore((s) => s.user);
  const autoUploadEnabled = useUploadStore((s) => s.autoUploadEnabled);
  const recentAutoUpload = useUploadStore((s) => s.recentAutoUpload);
  const newPhotoActive = autoUploadEnabled && recentAutoUpload;
  const family = useFamilyStore((s) => s.family);

  const [recentUploads, setRecentUploads] = useState<RecentUpload[]>([]);
  const [reactionTotal, setReactionTotal] = useState(0);

  const loadRecent = useCallback(async () => {
    const familyId = user?.familyId ?? family?.id;
    if (!familyId) return;
    try {
      const res = await api.get('/posts', { params: { familyId, limit: 5 } });
      const data: any[] = res.data.data ?? [];
      const GROUP_LABEL: Record<string, string> = { ALL: '전체', MATERNAL: '친정', PATERNAL: '시댁' };
      const uploads: RecentUpload[] = data.map((p: any) => ({
        id: p.id,
        uri: p.imageUrl,
        date: formatDate(p.createdAt),
        group: GROUP_LABEL[p.group?.type ?? 'ALL'] ?? '전체',
        reactions: p._count?.reactions ?? 0,
      }));
      setRecentUploads(uploads);
      setReactionTotal(uploads.reduce((sum, u) => sum + u.reactions, 0));
    } catch {
      setRecentUploads([]);
    }
  }, [user?.familyId, family?.id]);

  useEffect(() => { loadRecent(); }, [loadRecent]);

  const today = new Date();
  const dateStr = `${today.getMonth() + 1}월 ${today.getDate()}일 (${['일', '월', '화', '수', '목', '금', '토'][today.getDay()]})`;

  const handleNewPhotoPress = () => {
    if (newPhotoActive) return;
    navigation.navigate('SettingsTab' as any);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* ─── Header ─── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerDate}>{dateStr}</Text>
            <Text style={styles.greeting}>안녕하세요, {user?.name ?? '가족'}님 👋</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn} onPress={() => navigation.navigate('Main')}>
            <Ionicons name="notifications-outline" size={24} color={Colors.textPrimary} />
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* ─── 오늘의 소식 ─── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>오늘의 소식</Text>
            <View style={styles.statGrid}>
              {/* 새 사진: 자동업로드 + 최근사진자동업로드 ON일 때만 활성 */}
              <TouchableOpacity
                style={[styles.statCard, { backgroundColor: newPhotoActive ? Colors.primaryPale : Colors.backgroundMuted }]}
                onPress={handleNewPhotoPress}
                activeOpacity={newPhotoActive ? 1 : 0.75}
              >
                <Text style={styles.statEmoji}>{newPhotoActive ? '📸' : '📵'}</Text>
                {newPhotoActive ? (
                  <>
                    <Text style={[styles.statValue, { color: Colors.primary }]}>12장</Text>
                    <Text style={styles.statLabel}>새 사진</Text>
                  </>
                ) : (
                  <>
                    <Text style={[styles.statValue, { color: Colors.textMuted, fontSize: FontSize.xs }]}>꺼짐</Text>
                    <Text style={[styles.statLabel, { color: Colors.textMuted, textAlign: 'center' }]}>
                      최근사진{'\n'}업로드 설정
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <StatCard emoji="📋" label="키즈노트" value="1건" bg="#FBE8DC" accent="#C4693A" />

              {/* 가족 반응: 최근 업로드 5건 기준 */}
              <StatCard
                emoji="❤️"
                label={`최근업로드\n가족 반응`}
                value={`${reactionTotal}개`}
                bg="#FDE8E8"
                accent="#D94F3D"
              />
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
              <TouchableOpacity style={styles.kdShareBtn} onPress={() => navigation.navigate('UploadModal')}>
                <Text style={styles.kdShareBtnText}>공유하기</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </View>

          {/* ─── 최근 업로드 ─── */}
          <View style={styles.sectionNoH}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>최근 업로드</Text>
              <TouchableOpacity onPress={() => navigation.navigate('FeedTab' as any)}>
                <Text style={styles.seeAll}>전체 보기</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={recentUploads}
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
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.memoryScroll}>
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
              {/* 실제 알림은 별도 API 연동 예정 */}
              <View style={styles.emptyAlert}>
                <Text style={styles.emptyAlertText}>새로운 소식이 없어요 🌿</Text>
              </View>
            </View>
          </View>

        </ScrollView>

        {/* ─── FAB ─── */}
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('UploadModal')} activeOpacity={0.85}>
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
      <Text style={[styles.statLabel, { textAlign: 'center' }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, paddingBottom: Spacing.lg,
  },
  headerDate: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: 2 },
  greeting: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  notifBtn: { position: 'relative', padding: 6 },
  notifBadge: {
    position: 'absolute', top: 4, right: 4, minWidth: 16, height: 16, borderRadius: 8,
    backgroundColor: Colors.error, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: Colors.background,
  },
  notifBadgeText: { color: '#fff', fontSize: 9, fontWeight: FontWeight.bold },
  scroll: { paddingBottom: 110 },
  section: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.xxl },
  sectionNoH: { marginBottom: Spacing.xxl },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: Spacing.md, paddingHorizontal: Spacing.xl,
  },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.md },
  seeAll: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semibold },
  statGrid: { flexDirection: 'row', gap: Spacing.md },
  statCard: { flex: 1, borderRadius: Radius.xl, padding: Spacing.lg, alignItems: 'center', gap: 4 },
  statEmoji: { fontSize: 24 },
  statValue: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  statLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 15 },
  kidsnoteDetect: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.primaryPale, borderRadius: Radius.xl, padding: Spacing.lg,
    borderWidth: 1.5, borderColor: Colors.primary + '33',
  },
  kdLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  kdIconBg: { width: 44, height: 44, borderRadius: Radius.md, backgroundColor: Colors.backgroundCard, alignItems: 'center', justifyContent: 'center' },
  kdIcon: { fontSize: 22 },
  kdTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.primary },
  kdSub: { fontSize: FontSize.xs, color: Colors.primary, opacity: 0.75, marginTop: 2 },
  kdShareBtn: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radius.full },
  kdShareBtnText: { color: '#fff', fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  recentList: { paddingHorizontal: Spacing.xl },
  recentCard: { width: 108, gap: 6 },
  recentImg: { width: 108, height: 108, borderRadius: Radius.lg },
  recentOverlay: {
    position: 'absolute', top: 7, left: 7, backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: Radius.full,
  },
  recentGroup: { color: '#fff', fontSize: 10, fontWeight: FontWeight.bold },
  recentDate: { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'center' },
  aiBadge: { backgroundColor: Colors.accentLight, paddingHorizontal: Spacing.md, paddingVertical: 3, borderRadius: Radius.full },
  aiBadgeText: { fontSize: FontSize.xs, color: Colors.accent, fontWeight: FontWeight.bold },
  memoryScroll: { paddingHorizontal: Spacing.xl, gap: Spacing.md },
  memoryCard: { width: W * 0.72, borderRadius: Radius.xl, overflow: 'hidden', ...Shadow.sm },
  memoryTop: { padding: Spacing.md },
  memoryLabel: { alignSelf: 'flex-start', paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Radius.full },
  memoryLabelText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  memoryImg: { width: '100%', height: 140 },
  memoryBottom: { padding: Spacing.lg, gap: 4 },
  memoryTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold },
  memoryCaption: { fontSize: FontSize.sm, color: Colors.textSecondary },
  memoryLink: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, marginTop: 4 },
  alertList: { backgroundColor: Colors.backgroundCard, borderRadius: Radius.xl, overflow: 'hidden', ...Shadow.sm },
  emptyAlert: { padding: Spacing.xl, alignItems: 'center' },
  emptyAlertText: { fontSize: FontSize.sm, color: Colors.textMuted },
  alertRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.lg,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  alertAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryPale, alignItems: 'center', justifyContent: 'center' },
  alertEmoji: { fontSize: 20 },
  alertContent: { flex: 1 },
  alertText: { fontSize: FontSize.sm, color: Colors.textPrimary, lineHeight: 19 },
  alertTime: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 3 },
  fab: {
    position: 'absolute', right: Spacing.xl, bottom: 88, width: 58, height: 58,
    borderRadius: 29, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', ...Shadow.lg,
  },
});
