import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadow } from '@/theme';
import type { Post } from '@/types';
import SourceBadge from './SourceBadge';
import Avatar from './Avatar';

const { width: SCREEN_W } = Dimensions.get('window');

interface Props {
  post: Post;
  onPress?: () => void;
  onComment?: () => void;
  onReact?: () => void;
  onShare?: () => void;
}

const REACTION_EMOJIS = ['❤️', '😊', '👏'];

function formatKoreanDate(dateStr: string): string {
  const d = new Date(dateStr);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
}

export default function PostCard({ post, onPress, onComment, onReact, onShare }: Props) {
  const [liked, setLiked] = useState(false);
  const [localCount, setLocalCount] = useState(post.reactionCount);

  const handleReact = () => {
    setLiked((prev) => {
      setLocalCount((c) => (prev ? c - 1 : c + 1));
      return !prev;
    });
    onReact?.();
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.97}>
      {/* Author row */}
      <View style={styles.authorRow}>
        <Avatar emoji="👩" size={36} />
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>{post.author.name}</Text>
          <Text style={styles.postDate}>{formatKoreanDate(post.createdAt)}</Text>
        </View>
        <SourceBadge source={post.source} />
      </View>

      {/* Image */}
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: post.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        {/* Group badge overlay */}
        <View style={styles.groupBadge}>
          <Text style={styles.groupBadgeText}>
            {post.groupType === 'ALL' ? '👨‍👩‍👧‍👦 전체' : post.groupType === 'MATERNAL' ? '👩‍👧 친정' : '👴 시댁'}
          </Text>
        </View>
      </View>

      {/* Caption */}
      <View style={styles.captionRow}>
        <Text style={styles.caption} numberOfLines={3}>{post.caption}</Text>
      </View>

      {/* Reaction row */}
      <View style={styles.reactionRow}>
        {/* Emoji reactions */}
        <View style={styles.emojiReactions}>
          {REACTION_EMOJIS.map((emoji, i) => (
            <View key={i} style={styles.emojiChip}>
              <Text style={styles.emojiChipText}>{emoji}</Text>
            </View>
          ))}
          <Text style={styles.reactionTotal}>{localCount}</Text>
        </View>
        <Text style={styles.commentHint}>댓글 {post.commentCount}개</Text>
      </View>

      {/* Action bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleReact}>
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={22}
            color={liked ? '#E85454' : Colors.textSecondary}
          />
          <Text style={[styles.actionLabel, liked && { color: '#E85454' }]}>좋아요</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={onComment}>
          <Ionicons name="chatbubble-outline" size={20} color={Colors.textSecondary} />
          <Text style={styles.actionLabel}>댓글</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={onShare}>
          <Ionicons name="share-social-outline" size={20} color={Colors.textSecondary} />
          <Text style={styles.actionLabel}>공유</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  authorInfo: { flex: 1 },
  authorName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  postDate: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 1,
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: SCREEN_W * 0.72,
  },
  groupBadge: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  groupBadgeText: {
    color: '#fff',
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  captionRow: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  caption: {
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    lineHeight: 23,
  },
  reactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  emojiReactions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  emojiChip: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.backgroundMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiChipText: { fontSize: 13 },
  reactionTotal: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  commentHint: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  actionBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
  },
  actionLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
});
