import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadow } from '@/theme';
import type { TabScreenProps } from '@/types/navigation';
import type { GroupType, Post } from '@/types';
import { useFeedStore } from '@/store/feedStore';
import PostCard from '@/components/common/PostCard';
import GroupTabBar from '@/components/common/GroupTabBar';

const { width: W } = Dimensions.get('window');
type Props = TabScreenProps<'FeedTab'>;

const GROUP_TABS: { type: GroupType; label: string; emoji: string }[] = [
  { type: 'ALL',      label: '전체', emoji: '👨‍👩‍👧‍👦' },
  { type: 'MATERNAL', label: '친정', emoji: '👩‍👧' },
  { type: 'PATERNAL', label: '시댁', emoji: '👴'  },
];

const MOCK_POSTS: Post[] = [
  {
    id: '1', familyId: '1', groupId: '1', groupType: 'ALL',
    author: { id: '1', email: '', name: '엄마', provider: 'EMAIL', createdAt: '' },
    imageUrl: 'https://picsum.photos/800/800?random=51',
    caption: '오늘 어린이집에서 즐거운 물감놀이를 했어요 🎨 민준이가 처음으로 손바닥 도장을 찍었답니다!',
    source: 'KIDSNOTE', reactions: [], comments: [], reactionCount: 25, commentCount: 7,
    createdAt: '2026-05-14T09:00:00Z',
  },
  {
    id: '2', familyId: '1', groupId: '2', groupType: 'MATERNAL',
    author: { id: '1', email: '', name: '엄마', provider: 'EMAIL', createdAt: '' },
    imageUrl: 'https://picsum.photos/800/800?random=52',
    caption: '민준이가 처음으로 수영을 한 날이에요! 무서워하면서도 용감하게 도전했어요 🏊 오늘 많이 컸네요 💪',
    source: 'CAMERA', reactions: [], comments: [], reactionCount: 18, commentCount: 5,
    createdAt: '2026-05-13T15:30:00Z',
  },
  {
    id: '3', familyId: '1', groupId: '3', groupType: 'PATERNAL',
    author: { id: '1', email: '', name: '엄마', provider: 'EMAIL', createdAt: '' },
    imageUrl: 'https://picsum.photos/800/800?random=53',
    caption: '공원에서 처음으로 자전거를 탄 날 ✨ 할머니 보여드리고 싶었어요 🚲',
    source: 'GALLERY', reactions: [], comments: [], reactionCount: 31, commentCount: 9,
    createdAt: '2026-05-12T11:00:00Z',
  },
  {
    id: '4', familyId: '1', groupId: '1', groupType: 'ALL',
    author: { id: '1', email: '', name: '엄마', provider: 'EMAIL', createdAt: '' },
    imageUrl: 'https://picsum.photos/800/800?random=54',
    caption: '어린이집 운동회날 🏅 달리기 1등 했어요! 온 가족이 응원해줘서 고마워요 ❤️',
    source: 'KIDSNOTE', reactions: [], comments: [], reactionCount: 42, commentCount: 12,
    createdAt: '2026-05-11T14:00:00Z',
  },
];

export default function FeedScreen({ navigation }: Props) {
  const activeTab = useFeedStore((s) => s.activeTab);
  const setActiveTab = useFeedStore((s) => s.setActiveTab);
  const [refreshing, setRefreshing] = useState(false);

  const filtered = activeTab === 'ALL' ? MOCK_POSTS : MOCK_POSTS.filter((p) => p.groupType === activeTab);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 900));
    setRefreshing(false);
  }, []);

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
          </View>
        </View>

        {/* ─── Group Tabs ─── */}
        <View style={styles.tabsContainer}>
          <GroupTabBar
            tabs={GROUP_TABS}
            active={activeTab}
            onChange={setActiveTab}
          />
          {/* Post count pill */}
          <View style={styles.countPill}>
            <Text style={styles.countText}>{filtered.length}개</Text>
          </View>
        </View>

        {/* ─── Feed List ─── */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
          ItemSeparatorComponent={() => <View style={{ height: Spacing.lg }} />}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
              onComment={() => navigation.navigate('Comments', { postId: item.id })}
            />
          )}
          ListHeaderComponent={<RealTimeShareBanner />}
          ListEmptyComponent={<EmptyFeed />}
          ListFooterComponent={<View style={{ height: 20 }} />}
        />
      </SafeAreaView>
    </View>
  );
}

function RealTimeShareBanner() {
  return (
    <TouchableOpacity style={styles.shareBanner} activeOpacity={0.85}>
      <View style={styles.bannerLeft}>
        <View style={styles.bannerDot} />
        <Text style={styles.bannerText}>기록은 쉽게, 추억은 특별하게</Text>
      </View>
      <Text style={styles.bannerEmoji}>❤️</Text>
    </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  headerActions: { flexDirection: 'row', gap: Spacing.sm },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.backgroundMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  countPill: {
    backgroundColor: Colors.backgroundMuted,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  countText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeight.semibold,
  },
  list: { paddingHorizontal: Spacing.xl, paddingBottom: 100 },
  shareBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primaryPale,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  bannerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  bannerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  bannerText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },
  bannerEmoji: { fontSize: 20 },
  empty: { alignItems: 'center', paddingTop: 80, gap: Spacing.md },
  emptyEmoji: { fontSize: 52 },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  emptyDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: Spacing.xxxl,
  },
});
