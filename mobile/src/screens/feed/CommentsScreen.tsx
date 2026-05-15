import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackScreenProps } from '@/types/navigation';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/theme';
import { useAuthStore } from '@/store/authStore';
import api from '@/api/client';

type Props = RootStackScreenProps<'Comments'>;

interface Comment {
  id: string;
  authorId: string;
  emoji: string;
  name: string;
  text: string;
  time: string;
}

function formatTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return '방금';
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  return `${Math.floor(hr / 24)}일 전`;
}

export default function CommentsScreen({ navigation, route }: Props) {
  const { postId } = route.params;
  const user = useAuthStore((s) => s.user);
  const myId = user?.id ?? '';

  const [text, setText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const inputRef = useRef<TextInput>(null);

  const loadComments = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/comments/post/${postId}`);
      const data: any[] = res.data ?? [];
      setComments(data.map((c: any) => ({
        id: c.id,
        authorId: c.userId ?? c.user?.id ?? '',
        emoji: c.user?.profileImage ? '' : '👤',
        name: c.user?.name ?? '?',
        text: c.content,
        time: formatTime(c.createdAt),
      })));
    } catch {
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => { loadComments(); }, [loadComments]);

  // ── 댓글 등록 ──────────────────────────────────────────────────────────────
  const sendComment = async () => {
    if (!text.trim()) return;
    try {
      const res = await api.post('/comments', { postId, content: text.trim() });
      const c = res.data;
      setComments((prev) => [...prev, {
        id: c.id,
        authorId: myId,
        emoji: '👤',
        name: user?.name ?? '나',
        text: c.content,
        time: '방금',
      }]);
      setText('');
    } catch {
      Alert.alert('오류', '댓글 등록에 실패했습니다.');
    }
  };

  // ── 수정 시작 ──────────────────────────────────────────────────────────────
  const startEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditText(comment.text);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // ── 수정 완료 ──────────────────────────────────────────────────────────────
  const submitEdit = async () => {
    if (!editText.trim()) return;
    try {
      await api.patch(`/comments/${editingId}`, { content: editText.trim() });
      setComments((prev) =>
        prev.map((c) => (c.id === editingId ? { ...c, text: editText.trim(), time: '방금 수정됨' } : c))
      );
      setEditingId(null);
      setEditText('');
    } catch {
      Alert.alert('오류', '댓글 수정에 실패했습니다.');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  // ── 삭제 ──────────────────────────────────────────────────────────────────
  const deleteComment = (id: string) => {
    Alert.alert('댓글 삭제', '이 댓글을 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/comments/${id}`);
            setComments((prev) => prev.filter((c) => c.id !== id));
          } catch {
            Alert.alert('오류', '댓글 삭제에 실패했습니다.');
          }
        },
      },
    ]);
  };

  const isEditing = editingId !== null;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'android' ? 0 : 0}
    >
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        {/* Handle */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>댓글 {comments.length}개</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Comment list */}
        {isLoading
          ? <View style={styles.loadingCenter}><ActivityIndicator size="large" color={Colors.primary} /></View>
          : <FlatList
              data={comments}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
              ItemSeparatorComponent={() => <View style={{ height: Spacing.lg }} />}
          renderItem={({ item }) => {
            const isMine = item.authorId === myId;
            const isBeingEdited = editingId === item.id;

            return (
              <View style={styles.commentRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarEmoji}>{item.emoji}</Text>
                </View>

                <View style={[styles.bubble, isMine && styles.bubbleMine]}>
                  <View style={styles.bubbleTop}>
                    <View style={styles.bubbleTopLeft}>
                      <Text style={styles.name}>{item.name}</Text>
                      {isMine && (
                        <View style={styles.meBadge}>
                          <Text style={styles.meBadgeText}>나</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.bubbleTopRight}>
                      <Text style={styles.time}>{item.time}</Text>
                      {/* 본인 댓글에만 수정/삭제 버튼 노출 */}
                      {isMine && !isBeingEdited && (
                        <View style={styles.commentActions}>
                          <TouchableOpacity style={styles.actionBtn} onPress={() => startEdit(item)}>
                            <Ionicons name="pencil-outline" size={13} color={Colors.primary} />
                            <Text style={styles.actionBtnText}>수정</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.actionBtn} onPress={() => deleteComment(item.id)}>
                            <Ionicons name="trash-outline" size={13} color={Colors.error} />
                            <Text style={[styles.actionBtnText, { color: Colors.error }]}>삭제</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* 수정 중인 댓글은 인라인 에디터로 표시 */}
                  {isBeingEdited ? (
                    <View style={styles.editBox}>
                      <TextInput
                        ref={inputRef}
                        style={styles.editInput}
                        value={editText}
                        onChangeText={setEditText}
                        multiline
                        maxLength={200}
                        autoFocus
                      />
                      <View style={styles.editActions}>
                        <TouchableOpacity style={styles.editCancelBtn} onPress={cancelEdit}>
                          <Text style={styles.editCancelText}>취소</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.editSubmitBtn, !editText.trim() && { opacity: 0.4 }]}
                          onPress={submitEdit}
                          disabled={!editText.trim()}
                        >
                          <Text style={styles.editSubmitText}>저장</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <Text style={styles.commentText}>{item.text}</Text>
                  )}
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>💬</Text>
              <Text style={styles.emptyText}>첫 댓글을 남겨보세요!</Text>
            </View>
          }
        />
        }

        {/* Input */}
        <View style={styles.inputRow}>
          <View style={styles.inputAvatar}>
            <Text style={{ fontSize: 18 }}>👩</Text>
          </View>
          <View style={styles.inputBubble}>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={setText}
              placeholder="따뜻한 댓글을 남겨보세요..."
              placeholderTextColor={Colors.textMuted}
              multiline
              maxLength={200}
              editable={!isEditing}
            />
          </View>
          <TouchableOpacity
            style={[styles.sendBtn, text.trim() && !isEditing && styles.sendBtnActive]}
            onPress={sendComment}
            disabled={!text.trim() || isEditing}
          >
            <Ionicons name="send" size={18} color={text.trim() && !isEditing ? '#fff' : Colors.textMuted} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundCard },
  safeArea: { flex: 1 },
  loadingCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  handle: {
    width: 44, height: 5, backgroundColor: Colors.border, borderRadius: 3,
    alignSelf: 'center', marginTop: Spacing.md, marginBottom: Spacing.sm,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.backgroundMuted,
    alignItems: 'center', justifyContent: 'center',
  },
  list: { padding: Spacing.xl, paddingBottom: 20 },
  commentRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  avatar: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.primaryPale,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  avatarEmoji: { fontSize: 20 },
  bubble: {
    flex: 1, backgroundColor: Colors.backgroundMuted,
    borderRadius: Radius.xl, borderTopLeftRadius: 4,
    padding: Spacing.md, gap: Spacing.xs,
  },
  bubbleMine: {
    backgroundColor: Colors.primaryPale,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: 4,
  },
  bubbleTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  bubbleTopLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  bubbleTopRight: { alignItems: 'flex-end', gap: 4 },
  name: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  meBadge: {
    backgroundColor: Colors.primary, borderRadius: Radius.full,
    paddingHorizontal: 6, paddingVertical: 1,
  },
  meBadgeText: { fontSize: 9, color: '#fff', fontWeight: FontWeight.bold },
  time: { fontSize: FontSize.xs, color: Colors.textMuted },
  commentActions: { flexDirection: 'row', gap: Spacing.sm },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  actionBtnText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.medium },
  commentText: { fontSize: FontSize.sm, color: Colors.textPrimary, lineHeight: 20 },
  editBox: { gap: Spacing.sm, marginTop: 4 },
  editInput: {
    fontSize: FontSize.sm, color: Colors.textPrimary, lineHeight: 20,
    backgroundColor: Colors.backgroundCard, borderRadius: Radius.md,
    borderWidth: 1.5, borderColor: Colors.primary,
    padding: Spacing.sm, minHeight: 52,
  },
  editActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.sm },
  editCancelBtn: {
    paddingHorizontal: Spacing.lg, paddingVertical: 6,
    borderRadius: Radius.full, backgroundColor: Colors.backgroundMuted,
  },
  editCancelText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.semibold },
  editSubmitBtn: {
    paddingHorizontal: Spacing.lg, paddingVertical: 6,
    borderRadius: Radius.full, backgroundColor: Colors.primary,
  },
  editSubmitText: { fontSize: FontSize.xs, color: '#fff', fontWeight: FontWeight.bold },
  empty: { alignItems: 'center', paddingTop: 60, gap: Spacing.md },
  emptyEmoji: { fontSize: 40 },
  emptyText: { fontSize: FontSize.base, color: Colors.textSecondary },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm,
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg, paddingBottom: 24,
    borderTopWidth: 1, borderTopColor: Colors.borderLight,
    backgroundColor: Colors.backgroundCard,
  },
  inputAvatar: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primaryPale,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  inputBubble: {
    flex: 1, backgroundColor: Colors.backgroundMuted, borderRadius: 20,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, maxHeight: 100,
  },
  input: { fontSize: FontSize.base, color: Colors.textPrimary, padding: 0, lineHeight: 22 },
  sendBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.backgroundMuted,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  sendBtnActive: { backgroundColor: Colors.primary },
});
