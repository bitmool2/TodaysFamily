import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Share,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackScreenProps } from '@/types/navigation';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadow } from '@/theme';
import SourceBadge from '@/components/common/SourceBadge';

const { width: W } = Dimensions.get('window');
type Props = RootStackScreenProps<'PostDetail'>;

const BASE_URL = 'https://todaysfamily.app';

async function createShortLink(postId: string): Promise<string> {
  const longUrl = `${BASE_URL}/post/${postId}`;
  try {
    const res = await fetch(
      `https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`,
    );
    if (!res.ok) throw new Error();
    return await res.text();
  } catch {
    return longUrl;
  }
}

const MOCK_REACTIONS = [
  { emoji: '❤️', count: 12, active: false },
  { emoji: '😊', count: 5,  active: true  },
  { emoji: '👏', count: 8,  active: false },
];

export default function PostDetailScreen({ route, navigation }: Props) {
  const { postId } = route.params;
  const [reactions, setReactions] = useState(MOCK_REACTIONS);
  const [sharing, setSharing] = useState(false);

  const toggleReaction = (idx: number) => {
    setReactions((prev) =>
      prev.map((r, i) =>
        i === idx ? { ...r, active: !r.active, count: r.active ? r.count - 1 : r.count + 1 } : r
      )
    );
  };

  const handleShare = async () => {
    setSharing(true);
    try {
      const shortUrl = await createShortLink(postId);
      await Share.share({
        title: '오늘의가족',
        message: `📸 가족 사진을 공유했어요!\n\n${shortUrl}`,
        url: shortUrl,
      });
    } catch (err: any) {
      if (err?.message !== 'User did not share') {
        Alert.alert('공유 실패', '링크 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.');
      }
    } finally {
      setSharing(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>기록 상세</Text>
          <TouchableOpacity style={styles.moreBtn}>
            <Ionicons name="ellipsis-horizontal" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Author row */}
          <View style={styles.authorRow}>
            <View style={styles.authorAvatar}>
              <Text style={styles.authorEmoji}>👩</Text>
            </View>
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>엄마</Text>
              <Text style={styles.postDate}>2026년 5월 14일 (목)</Text>
            </View>
            <SourceBadge source="KIDSNOTE" size="md" />
          </View>

          {/* Image */}
          <Image
            source={{ uri: `https://picsum.photos/800/800?random=${postId}` }}
            style={styles.image}
            resizeMode="cover"
          />

          {/* Caption */}
          <View style={styles.captionSection}>
            <View style={styles.aiBadge}>
              <Text style={styles.aiBadgeText}>✨ AI 자동 생성</Text>
            </View>
            <Text style={styles.caption}>
              오늘 어린이집에서 즐거운 물감놀이를 했어요 🎨{'\n'}
              민준이가 처음으로 손바닥 도장을 찍었답니다! 색깔을 보고 너무 신나했어요 💕
            </Text>
          </View>

          {/* Group badge */}
          <View style={styles.groupBadgeRow}>
            <View style={styles.groupBadge}>
              <Text style={styles.groupBadgeEmoji}>👨‍👩‍👧‍👦</Text>
              <Text style={styles.groupBadgeText}>전체 가족 공유</Text>
            </View>
          </View>

          {/* Reactions */}
          <View style={styles.reactionsSection}>
            <Text style={styles.sectionLabel}>가족 반응</Text>
            <View style={styles.reactionBtns}>
              {reactions.map((r, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.reactionBtn, r.active && styles.reactionBtnActive]}
                  onPress={() => toggleReaction(i)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.reactionEmoji}>{r.emoji}</Text>
                  <Text style={[styles.reactionCount, r.active && styles.reactionCountActive]}>
                    {r.count}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Reactor avatars */}
            <View style={styles.reactorRow}>
              {['👵', '👴', '👨'].map((e, i) => (
                <View key={i} style={[styles.reactorAvatar, { marginLeft: i > 0 ? -8 : 0 }]}>
                  <Text style={{ fontSize: 16 }}>{e}</Text>
                </View>
              ))}
              <Text style={styles.reactorText}>외할머니 외 2명이 반응했어요</Text>
            </View>
          </View>

          {/* Comments preview */}
          <View style={styles.commentsSection}>
            <View style={styles.commentsHeader}>
              <Text style={styles.sectionLabel}>댓글 3개</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Comments', { postId })}>
                <Text style={styles.seeAllComments}>모두 보기</Text>
              </TouchableOpacity>
            </View>

            {[
              { emoji: '👵', name: '외할머니', text: '오늘 물감놀이 너무 즐거웠겠다 ❤️', time: '10분 전' },
              { emoji: '👴', name: '할아버지', text: '우리 민준이 잘했어요~ 😊', time: '5분 전' },
            ].map((c, i) => (
              <View key={i} style={styles.commentRow}>
                <View style={styles.commentAvatar}>
                  <Text style={{ fontSize: 16 }}>{c.emoji}</Text>
                </View>
                <View style={styles.commentBubble}>
                  <View style={styles.commentTop}>
                    <Text style={styles.commentName}>{c.name}</Text>
                    <Text style={styles.commentTime}>{c.time}</Text>
                  </View>
                  <Text style={styles.commentText}>{c.text}</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Footer actions */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.commentBtn}
            onPress={() => navigation.navigate('Comments', { postId })}
          >
            <Ionicons name="chatbubble-outline" size={20} color={Colors.primary} />
            <Text style={styles.commentBtnText}>댓글 달기</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.shareBtn} onPress={handleShare} disabled={sharing}>
            {sharing
              ? <ActivityIndicator size="small" color={Colors.textSecondary} />
              : <Ionicons name="share-social-outline" size={20} color={Colors.textSecondary} />
            }
          </TouchableOpacity>
        </View>
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
  },
  backBtn: { padding: Spacing.xs },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  moreBtn: { padding: Spacing.xs },
  scroll: { paddingBottom: 100 },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  authorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryPale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorEmoji: { fontSize: 22 },
  authorInfo: { flex: 1 },
  authorName: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  postDate: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  image: { width: '100%', height: W },
  captionSection: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    gap: Spacing.md,
  },
  aiBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryPale,
    paddingHorizontal: Spacing.md,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  aiBadgeText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.semibold },
  caption: {
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    lineHeight: 26,
  },
  groupBadgeRow: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.md },
  groupBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    alignSelf: 'flex-start',
    backgroundColor: Colors.backgroundMuted,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: Radius.full,
  },
  groupBadgeEmoji: { fontSize: 14 },
  groupBadgeText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  reactionsSection: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    gap: Spacing.md,
  },
  sectionLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textSecondary },
  reactionBtns: { flexDirection: 'row', gap: Spacing.md },
  reactionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.backgroundMuted,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  reactionBtnActive: {
    backgroundColor: Colors.primaryPale,
    borderColor: Colors.primary,
  },
  reactionEmoji: { fontSize: 18 },
  reactionCount: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
  reactionCountActive: { color: Colors.primary },
  reactorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  reactorAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.primaryPale,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.backgroundCard,
  },
  reactorText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  commentsSection: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    gap: Spacing.md,
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seeAllComments: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium },
  commentRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'flex-start',
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryPale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentBubble: {
    flex: 1,
    backgroundColor: Colors.backgroundMuted,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: 3,
  },
  commentTop: { flexDirection: 'row', justifyContent: 'space-between' },
  commentName: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  commentTime: { fontSize: FontSize.xs, color: Colors.textMuted },
  commentText: { fontSize: FontSize.sm, color: Colors.textPrimary, lineHeight: 20 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    paddingBottom: 28,
    backgroundColor: Colors.backgroundCard,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  commentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primaryPale,
    borderRadius: Radius.full,
    paddingVertical: Spacing.lg,
  },
  commentBtnText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },
  shareBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.backgroundMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
