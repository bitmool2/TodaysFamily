import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadow } from '@/theme';
import type { TabScreenProps } from '@/types/navigation';
import type { GroupType, Post } from '@/types';
import { useFeedStore } from '@/store/feedStore';
import PostCard from '@/components/common/PostCard';
import GroupTabBar from '@/components/common/GroupTabBar';
import api from '@/api/client';
import { useAuthStore } from '@/store/authStore';
import { useFamilyStore } from '@/store/familyStore';

const { width: W } = Dimensions.get('window');
type Props = TabScreenProps<'FeedTab'>;

const GROUP_TABS: { type: GroupType; label: string; emoji: string }[] = [
  { type: 'ALL',      label: '전체', emoji: '👨‍👩‍👧‍👦' },
  { type: 'MATERNAL', label: '친정', emoji: '👩‍👧' },
  { type: 'PATERNAL', label: '시댁', emoji: '👴'  },
];

const GROUP_CONFIG: Record<GroupType, { label: string; color: string; bg: string }> = {
  ALL:      { label: '전체', color: Colors.primary, bg: Colors.primaryPale },
  MATERNAL: { label: '친정', color: '#C4693A',      bg: '#FBE8DC'          },
  PATERNAL: { label: '시댁', color: '#3A6CB5',      bg: '#DCE8FB'          },
};

export default function FeedScreen({ navigation }: Props) {
  const activeTab = useFeedStore((s) => s.activeTab);
  const setActiveTab = useFeedStore((s) => s.setActiveTab);
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<{ posts: number; comments: number; reactions: number }>({ posts: 0, comments: 0, reactions: 0 });

  const user = useAuthStore((s) => s.user);
  const family = useFamilyStore((s) => s.family);
  const config = GROUP_CONFIG[activeTab];

  const loadPosts = useCallback(async () => {
    const familyId = user?.familyId ?? family?.id;
    if (!familyId) { setPosts([]); return; }
    setIsLoading(true);
    try {
      const params: any = { familyId, limit: 30 };
      if (activeTab !== 'ALL') params.group = activeTab;
      const res = await api.get('/posts', { params });
      const data: any[] = res.data.data ?? [];
      const mapped: Post[] = data.map((p: any) => ({
        id: p.id,
        familyId: p.familyId ?? familyId,
        groupId: p.group?.id ?? '',
        groupType: (p.group?.type ?? 'ALL') as GroupType,
        author: { id: p.author?.id, email: '', name: p.author?.name ?? '?', provider: 'EMAIL' as const, createdAt: '' },
        imageUrl: p.imageUrl,
        caption: p.caption ?? '',
        source: p.source ?? 'GALLERY',
        reactions: p.reactions ?? [],
        comments: [],
        reactionCount: p._count?.reactions ?? 0,
        commentCount: p._count?.comments ?? 0,
        createdAt: p.createdAt,
      }));
      setPosts(mapped);
      // 그룹 통계 계산
      const reactionTotal = mapped.reduce((s, p) => s + p.reactionCount, 0);
      const commentTotal  = mapped.reduce((s, p) => s + p.commentCount, 0);
      setStats({ posts: mapped.length, comments: commentTotal, reactions: reactionTotal });
    } catch {
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, user?.familyId, family?.id]);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  }, [loadPosts]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* ─── Header ─── */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>기록</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="search-outline" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="filter-outline" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconBtn, styles.addBtn]}
              onPress={() => navigation.navigate('UploadModal' as any)}
            >
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── Group Tabs ─── */}
        <View style={styles.tabsContainer}>
          <GroupTabBar tabs={GROUP_TABS} active={activeTab} onChange={setActiveTab} />
          <View style={styles.countPill}>
            <Text style={styles.countText}>{posts.length}개</Text>
          </View>
        </View>

        {/* ─── Feed List ─── */}
        {isLoading && !refreshing
          ? <View style={styles.loadingCenter}><ActivityIndicator size="large" color={Colors.primary} /></View>
          : <FlatList
              data={posts}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.list}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} colors={[Colors.primary]} />
              }
              ItemSeparatorComponent={() => <View style={{ height: Spacing.lg }} />}
              renderItem={({ item }) => (
                <PostCard
                  post={item}
                  onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
                  onComment={() => navigation.navigate('Comments', { postId: item.id })}
                />
              )}
              ListHeaderComponent={<GroupStatsBanner stats={stats} config={config} />}
              ListEmptyComponent={<EmptyFeed />}
              ListFooterComponent={<View style={{ height: 20 }} />}
            />
        }
      </SafeAreaView>
    </View>
  );
}

function GroupStatsBanner({
  stats,
  config,
}: {
  stats: { posts: number; comments: number; reactions: number };
  config: { label: string; color: string; bg: string };
}) {
  return (
    <View style={[styles.statsBanner, { backgroundColor: config.bg }]}>
      <View style={styles.statsItem}>
        <Text style={[styles.statsValue, { color: config.color }]}>{stats.posts}</Text>
        <Text style={[styles.statsLabel, { color: config.color }]}>게시글</Text>
      </View>
      <View style={[styles.statsDivider, { backgroundColor: config.color + '33' }]} />
      <View style={styles.statsItem}>
        <Text style={[styles.statsValue, { color: config.color }]}>{stats.comments}</Text>
        <Text style={[styles.statsLabel, { color: config.color }]}>댓글</Text>
      </View>
      <View style={[styles.statsDivider, { backgroundColor: config.color + '33' }]} />
      <View style={styles.statsItem}>
        <Text style={[styles.statsValue, { color: config.color }]}>{stats.reactions}</Text>
        <Text style={[styles.statsLabel, { color: config.color }]}>반응</Text>
      </View>
    </View>
  );
}

function EmptyFeed() {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyEmoji}>📭</Text>
      <Text style={styles.emptyTitle}>아직 공유된 기록이 없어요</Text>
      <Text style={styles.emptyDesc}>사진을 업로드해서 가족과 소중한 순간을 나눠보세요</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  safeArea: { flex: 1 },
  loadingCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, paddingBottom: Spacing.sm,
  },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  headerActions: { flexDirection: 'row', gap: Spacing.sm },
  iconBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.backgroundMuted, alignItems: 'center', justifyContent: 'center' },
  addBtn: { backgroundColor: Colors.primary },
  tabsContainer: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.xl, paddingBottom: Spacing.sm,
  },
  countPill: { backgroundColor: Colors.backgroundMuted, paddingHorizontal: Spacing.md, paddingVertical: 4, borderRadius: Radius.full },
  countText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.semibold },
  list: { paddingHorizontal: Spacing.xl, paddingBottom: 100 },
  statsBanner: {
    flexDirection: 'row', alignItems: 'center', borderRadius: Radius.xl,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg,
  },
  statsItem: { flex: 1, alignItems: 'center', gap: 2 },
  statsValue: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  statsLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  statsDivider: { width: 1, height: 28, marginHorizontal: Spacing.sm },
  empty: { alignItems: 'center', paddingTop: 80, gap: Spacing.md },
  emptyEmoji: { fontSize: 52 },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  emptyDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20, paddingHorizontal: Spacing.xxxl },
});
