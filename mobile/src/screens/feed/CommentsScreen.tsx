import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackScreenProps } from '@/types/navigation';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/theme';

type Props = RootStackScreenProps<'Comments'>;

const MOCK_COMMENTS = [
  { id: '1', emoji: '👵', name: '외할머니', text: '오늘 물감놀이 너무 즐거웠겠다 ❤️ 민준이 사진 보니까 할머니 너무 기뻐요!', time: '10분 전' },
  { id: '2', emoji: '👴', name: '외할아버지', text: '우리 민준이 잘했어요~ 😊 더 많이 찍어줘요~', time: '8분 전' },
  { id: '3', emoji: '👨', name: '아빠', text: '오늘도 씩씩하게 잘 다녀왔네! 오늘 저녁에 칭찬해줘야겠다 💪', time: '5분 전' },
];

export default function CommentsScreen({ navigation }: Props) {
  const [text, setText] = useState('');
  const [comments, setComments] = useState(MOCK_COMMENTS);

  const sendComment = () => {
    if (!text.trim()) return;
    setComments((prev) => [
      ...prev,
      { id: String(Date.now()), emoji: '👩', name: '나', text: text.trim(), time: '방금' },
    ]);
    setText('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
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
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.lg }} />}
          renderItem={({ item }) => (
            <View style={styles.commentRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarEmoji}>{item.emoji}</Text>
              </View>
              <View style={styles.bubble}>
                <View style={styles.bubbleTop}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.time}>{item.time}</Text>
                </View>
                <Text style={styles.commentText}>{item.text}</Text>

                <View style={styles.commentActions}>
                  <TouchableOpacity style={styles.likeBtn}>
                    <Ionicons name="heart-outline" size={14} color={Colors.textMuted} />
                    <Text style={styles.likeBtnText}>좋아요</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.likeBtn}>
                    <Text style={styles.likeBtnText}>답글</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>💬</Text>
              <Text style={styles.emptyText}>첫 댓글을 남겨보세요!</Text>
            </View>
          }
        />

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
            />
          </View>
          <TouchableOpacity
            style={[styles.sendBtn, text.trim() && styles.sendBtnActive]}
            onPress={sendComment}
            disabled={!text.trim()}
          >
            <Ionicons name="send" size={18} color={text.trim() ? '#fff' : Colors.textMuted} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
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
    marginBottom: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.backgroundMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { padding: Spacing.xl, paddingBottom: 20 },
  commentRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primaryPale,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarEmoji: { fontSize: 20 },
  bubble: {
    flex: 1,
    backgroundColor: Colors.backgroundMuted,
    borderRadius: Radius.xl,
    borderTopLeftRadius: 4,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  bubbleTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  time: { fontSize: FontSize.xs, color: Colors.textMuted },
  commentText: { fontSize: FontSize.sm, color: Colors.textPrimary, lineHeight: 20 },
  commentActions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.xs },
  likeBtn: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  likeBtnText: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: FontWeight.medium },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
    gap: Spacing.md,
  },
  emptyEmoji: { fontSize: 40 },
  emptyText: { fontSize: FontSize.base, color: Colors.textSecondary },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    backgroundColor: Colors.backgroundCard,
  },
  inputAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryPale,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  inputBubble: {
    flex: 1,
    backgroundColor: Colors.backgroundMuted,
    borderRadius: 20,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    maxHeight: 100,
  },
  input: {
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    padding: 0,
    lineHeight: 22,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.backgroundMuted,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sendBtnActive: { backgroundColor: Colors.primary },
});
