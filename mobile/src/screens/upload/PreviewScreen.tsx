import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  FlatList,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackScreenProps } from '@/types/navigation';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadow } from '@/theme';
import { useUploadStore } from '@/store/uploadStore';
import { useFamilyStore } from '@/store/familyStore';
import { useUpload } from '@/hooks/useUpload';
import { generateCaption } from '@/api/ai';
import type { GroupType } from '@/types';

const { width: W } = Dimensions.get('window');
type Props = RootStackScreenProps<'Preview'>;

const GROUP_OPTIONS: {
  type: GroupType; label: string; emoji: string;
  desc: string; color: string; bg: string;
}[] = [
  { type: 'ALL',      label: '전체',   emoji: '👨‍👩‍👧‍👦', desc: '모든 가족',  color: Colors.primary, bg: Colors.primaryPale },
  { type: 'MATERNAL', label: '친정',   emoji: '👩‍👧',    desc: '친정 가족', color: '#C4693A',       bg: '#FBE8DC'          },
  { type: 'PATERNAL', label: '시댁',   emoji: '👴',      desc: '시댁 가족', color: '#3A6CB5',       bg: '#DCE8FB'          },
];

export default function PreviewScreen({ route, navigation }: Props) {
  const { assets, source } = route.params;
  const {
    selectedGroupType, setSelectedGroupType,
    caption, setCaption,
    useAiCaption, setUseAiCaption,
    isUploading, error, setError,
  } = useUploadStore();
  const { children } = useFamilyStore();
  const { upload } = useUpload();

  const [aiLoading, setAiLoading]   = useState(false);
  const [selectedThumb, setSelectedThumb] = useState(0);
  const [captionIsAi, setCaptionIsAi]     = useState(false);

  // First child as default (most apps target the primary child)
  const defaultChild = children[0];

  const fetchAiCaption = useCallback(async () => {
    // We need a publicly accessible URL for GPT-4o — use the first asset's URI.
    // In production the asset would already be on S3; here we pass the local URI
    // and the backend gracefully falls back to a canned caption when it can't load it.
    const firstUri = assets[0]?.uri;
    if (!firstUri) return;

    setAiLoading(true);
    setCaption('');
    setCaptionIsAi(false);
    try {
      const result = await generateCaption(firstUri, defaultChild?.name);
      setCaption(result.caption);
      setCaptionIsAi(result.isAi);
    } catch {
      // Network error — fall back silently, user can type manually
      setCaption('');
    } finally {
      setAiLoading(false);
    }
  }, [assets, defaultChild, setCaption]);

  useEffect(() => {
    if (useAiCaption) fetchAiCaption();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clear any leftover error when screen mounts
  useEffect(() => { setError(null); }, [setError]);

  const handleUpload = async () => {
    navigation.navigate('UploadProgress', { total: assets.length });

    const result = await upload({
      assets,
      groupType:   selectedGroupType,
      source,
      caption:     caption || undefined,
      isAiCaption: captionIsAi,
      childId:     defaultChild?.id,
      onFileComplete: (_done, _total) => {},
    });

    if (result.succeeded === 0) {
      const errorMsg = result.errorMessage
        ?? '사진 업로드 중 문제가 발생했습니다. 네트워크 연결을 확인하고 다시 시도해 주세요.';
      Alert.alert('업로드 실패', errorMsg);
      navigation.goBack();
      return;
    }

    navigation.replace('UploadComplete', {
      count:     result.succeeded,
      groupType: selectedGroupType,
    });
  };

  const selectedGroup = GROUP_OPTIONS.find((g) => g.type === selectedGroupType)!;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            disabled={isUploading}
          >
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>업로드 미리보기</Text>
          <View style={styles.headerRight}>
            <Text style={styles.countBadge}>{assets.length}장</Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Main image ── */}
          <View style={styles.mainImageContainer}>
            <Image
              source={{ uri: assets[selectedThumb]?.uri }}
              style={styles.mainImage}
              resizeMode="cover"
            />
            <View style={styles.sourceOverlay}>
              <Text style={styles.sourceOverlayText}>
                {source === 'KIDSNOTE' ? '📋 키즈노트' : source === 'CAMERA' ? '📷 카메라' : '🖼 갤러리'}
              </Text>
            </View>
          </View>

          {/* ── Thumbnail strip ── */}
          {assets.length > 1 && (
            <FlatList
              data={assets}
              keyExtractor={(_, i) => String(i)}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbStrip}
              ItemSeparatorComponent={() => <View style={{ width: Spacing.sm }} />}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={[styles.thumb, selectedThumb === index && styles.thumbActive]}
                  onPress={() => setSelectedThumb(index)}
                >
                  <Image source={{ uri: item.uri }} style={styles.thumbImg} />
                </TouchableOpacity>
              )}
            />
          )}

          {/* ── Group selector ── */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>공유 그룹 선택</Text>
            <View style={styles.groupRow}>
              {GROUP_OPTIONS.map((opt) => {
                const isActive = selectedGroupType === opt.type;
                return (
                  <TouchableOpacity
                    key={opt.type}
                    style={[
                      styles.groupChip,
                      isActive && { borderColor: opt.color, backgroundColor: opt.bg },
                    ]}
                    onPress={() => setSelectedGroupType(opt.type)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.groupEmoji}>{opt.emoji}</Text>
                    <View>
                      <Text style={[styles.groupLabel, isActive && { color: opt.color }]}>
                        {opt.label}
                      </Text>
                      <Text style={styles.groupDesc}>{opt.desc}</Text>
                    </View>
                    {isActive && (
                      <View style={[styles.groupCheck, { backgroundColor: opt.color }]}>
                        <Ionicons name="checkmark" size={12} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ── AI Caption ── */}
          <View style={styles.section}>
            <View style={styles.captionHeader}>
              <Text style={styles.sectionLabel}>캡션</Text>
              <TouchableOpacity
                style={[styles.aiToggle, useAiCaption && styles.aiToggleOn]}
                onPress={() => {
                  const next = !useAiCaption;
                  setUseAiCaption(next);
                  if (next) fetchAiCaption();
                  else { setCaption(''); setCaptionIsAi(false); }
                }}
              >
                <Text style={styles.aiToggleIcon}>✨</Text>
                <Text style={[styles.aiToggleText, useAiCaption && { color: Colors.primary }]}>
                  AI 자동 생성
                </Text>
              </TouchableOpacity>
            </View>

            {aiLoading ? (
              <View style={styles.aiLoadingBox}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.aiLoadingText}>
                  AI가 사진을 분석해 캡션을 작성하고 있어요...
                </Text>
              </View>
            ) : (
              <View style={styles.captionBox}>
                {captionIsAi && caption.length > 0 && (
                  <View style={styles.aiGeneratedBadge}>
                    <Text style={styles.aiGeneratedText}>✨ AI 생성됨</Text>
                  </View>
                )}
                <TextInput
                  style={styles.captionInput}
                  value={caption}
                  onChangeText={(t) => { setCaption(t); setCaptionIsAi(false); }}
                  placeholder="캡션을 입력하거나 AI 자동 생성을 사용하세요..."
                  placeholderTextColor={Colors.textMuted}
                  multiline
                  maxLength={200}
                  textAlignVertical="top"
                />
                <Text style={styles.charCount}>{caption.length}/200</Text>
              </View>
            )}

            {useAiCaption && !aiLoading && (
              <TouchableOpacity style={styles.regenBtn} onPress={fetchAiCaption}>
                <Ionicons name="refresh-outline" size={14} color={Colors.primary} />
                <Text style={styles.regenText}>다시 생성하기</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* ── API error banner ── */}
          {error && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={16} color="#C0392B" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </ScrollView>

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => navigation.goBack()}
            disabled={isUploading}
          >
            <Text style={styles.cancelText}>취소</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.uploadBtn,
              { backgroundColor: selectedGroup.color },
              isUploading && styles.uploadBtnDisabled,
            ]}
            onPress={handleUpload}
            disabled={isUploading}
            activeOpacity={0.85}
          >
            {isUploading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
                <Text style={styles.uploadBtnText}>{selectedGroup.label}에 공유</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
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
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  headerRight: {},
  countBadge: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    backgroundColor: Colors.primaryPale,
    paddingHorizontal: Spacing.md,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  scroll: { paddingBottom: 120, gap: Spacing.xxl },
  mainImageContainer: { position: 'relative' },
  mainImage: { width: '100%', height: W * 0.85 },
  sourceOverlay: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
  },
  sourceOverlayText: {
    color: '#fff',
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  thumbStrip: { paddingHorizontal: Spacing.xl },
  thumb: {
    width: 68,
    height: 68,
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbActive: { borderColor: Colors.primary },
  thumbImg: { width: '100%', height: '100%' },
  section: { paddingHorizontal: Spacing.xl, gap: Spacing.md },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  groupRow: { gap: Spacing.sm },
  groupChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.borderLight,
    position: 'relative',
  },
  groupEmoji: { fontSize: 22 },
  groupLabel: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  groupDesc: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 1 },
  groupCheck: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aiToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.backgroundMuted,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: Radius.full,
  },
  aiToggleOn: { backgroundColor: Colors.primaryPale },
  aiToggleIcon: { fontSize: 13 },
  aiToggleText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },
  aiLoadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    ...Shadow.sm,
  },
  aiLoadingText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  captionBox: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  aiGeneratedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryPale,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  aiGeneratedText: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
  captionInput: {
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    lineHeight: 24,
    minHeight: 80,
    padding: 0,
  },
  charCount: { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'right' },
  regenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    alignSelf: 'flex-end',
  },
  regenText: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontWeight: FontWeight.medium,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.xl,
    backgroundColor: '#FDECEA',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
  },
  errorText: { flex: 1, fontSize: FontSize.sm, color: '#C0392B' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    paddingBottom: 32,
    backgroundColor: Colors.backgroundCard,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: Radius.full,
    alignItems: 'center',
    backgroundColor: Colors.backgroundMuted,
  },
  cancelText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },
  uploadBtn: {
    flex: 2.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 16,
    borderRadius: Radius.full,
    minHeight: 54,
  },
  uploadBtnDisabled: { opacity: 0.7 },
  uploadBtnText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: '#fff',
  },
});
