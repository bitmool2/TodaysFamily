import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadow } from '@/theme';
import type { UploadAsset, GroupType } from '@/types';
import { useUpload } from '@/hooks/useUpload';
import { useUploadStore } from '@/store/uploadStore';
import { useFamilyStore } from '@/store/familyStore';

const { height: H, width: W } = Dimensions.get('window');

interface Props {
  visible: boolean;
  assets: UploadAsset[];
  onShare: (groupType: GroupType, autoUpload: boolean, postIds: string[]) => void;
  onDismiss: () => void;
}

const GROUP_OPTIONS: {
  type: GroupType; label: string; emoji: string; color: string; bg: string;
}[] = [
  { type: 'ALL',      label: '전체 가족 앨범', emoji: '👨‍👩‍👧‍👦', color: Colors.primary, bg: Colors.primaryPale },
  { type: 'MATERNAL', label: '친정 앨범',      emoji: '👩‍👧',    color: '#C4693A',       bg: '#FBE8DC'         },
  { type: 'PATERNAL', label: '시댁 앨범',      emoji: '👴',      color: '#3A6CB5',       bg: '#DCE8FB'         },
];

const THUMB_SIZE = (W - Spacing.xl * 2 - Spacing.sm * 3) / 4;

export default function AutoDetectionPopup({ visible, assets, onShare, onDismiss }: Props) {
  const [selectedGroup, setSelectedGroup] = useState<GroupType>('ALL');
  const [autoUpload, setAutoUpload]       = useState(false);
  const [showPicker, setShowPicker]       = useState(false);
  const [uploading, setUploading]         = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);

  const slideAnim = useRef(new Animated.Value(H)).current;
  const bgAnim    = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const { upload } = useUpload();
  const { setAutoUploadEnabled } = useUploadStore();
  const { children } = useFamilyStore();

  useEffect(() => {
    if (visible) {
      setUploadedCount(0);
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
        Animated.timing(bgAnim,    { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,   duration: 700, useNativeDriver: true }),
        ])
      ).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: H, duration: 250, useNativeDriver: true }),
        Animated.timing(bgAnim,    { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const handleShare = useCallback(async () => {
    if (uploading || assets.length === 0) return;

    setUploading(true);
    setUploadedCount(0);

    if (autoUpload) setAutoUploadEnabled(true);

    try {
      const result = await upload({
        assets,
        groupType:  selectedGroup,
        source:     'KIDSNOTE',
        isAiCaption: false,
        childId:    children[0]?.id,
        onFileComplete: (done) => setUploadedCount(done),
      });

      if (result.succeeded === 0) {
        Alert.alert(
          '업로드 실패',
          result.errorMessage ?? '사진 업로드 중 문제가 생겼어요. 네트워크 연결을 확인하고 다시 시도해 주세요.',
        );
        setUploading(false);
        return;
      }

      onShare(selectedGroup, autoUpload, result.postIds);
    } catch {
      Alert.alert('오류', '업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  }, [uploading, assets, selectedGroup, autoUpload, upload, children, onShare, setAutoUploadEnabled]);

  const previewThumbs       = assets.slice(0, 4);
  const extraCount          = assets.length - 4;
  const selectedGroupInfo   = GROUP_OPTIONS.find((g) => g.type === selectedGroup)!;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onDismiss}>
      {/* Backdrop */}
      <Animated.View
        style={[
          styles.backdrop,
          { opacity: bgAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }) },
        ]}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={uploading ? undefined : onDismiss}
        />
      </Animated.View>

      {/* Sheet */}
      <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.handle} />

        {!uploading && (
          <TouchableOpacity style={styles.closeBtn} onPress={onDismiss}>
            <Ionicons name="close" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}

        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerIconWrap}>
            <Text style={styles.headerIconEmoji}>📷</Text>
            <Animated.View style={[styles.headerCountBadge, { transform: [{ scale: pulseAnim }] }]}>
              <Text style={styles.headerCount}>{assets.length}</Text>
            </Animated.View>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>새 사진 발견</Text>
            <Text style={styles.headerSub}>
              방금 저장한 어린이집 사진{' '}
              <Text style={styles.headerBold}>{assets.length}장</Text>을 발견했어요
            </Text>
          </View>
        </View>

        {/* ── Thumbnails ── */}
        <View style={styles.thumbGrid}>
          {previewThumbs.map((asset, i) => (
            <View key={i} style={styles.thumbCell}>
              <Image source={{ uri: asset.uri }} style={styles.thumbImg} resizeMode="cover" />
              {/* Upload progress overlay */}
              {uploading && i < uploadedCount && (
                <View style={styles.doneOverlay}>
                  <Ionicons name="checkmark-circle" size={28} color="#fff" />
                </View>
              )}
              {i === 3 && extraCount > 0 && !uploading && (
                <View style={styles.extraOverlay}>
                  <Text style={styles.extraText}>+{extraCount}</Text>
                </View>
              )}
              {i < 3 && !uploading && (
                <View style={styles.thumbCheck}>
                  <Ionicons name="checkmark" size={12} color="#fff" />
                </View>
              )}
            </View>
          ))}
        </View>

        {/* ── Upload progress bar ── */}
        {uploading && (
          <View style={styles.progressWrapper}>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.round((uploadedCount / assets.length) * 100)}%`,
                    backgroundColor: selectedGroupInfo.color,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {uploadedCount} / {assets.length} 장 업로드 중...
            </Text>
          </View>
        )}

        {/* ── Album selector (hidden while uploading) ── */}
        {!uploading && (
          <View style={styles.selectorWrapper}>
            <Text style={styles.selectorLabel}>공유할 앨범 선택</Text>
            <TouchableOpacity
              style={[styles.selectorBtn, { borderColor: selectedGroupInfo.color + '44' }]}
              onPress={() => setShowPicker(!showPicker)}
              activeOpacity={0.8}
            >
              <View style={[styles.selectorIconBg, { backgroundColor: selectedGroupInfo.bg }]}>
                <Text style={styles.selectorEmoji}>{selectedGroupInfo.emoji}</Text>
              </View>
              <Text style={[styles.selectorBtnText, { color: selectedGroupInfo.color }]}>
                {selectedGroupInfo.label}
              </Text>
              <Ionicons
                name={showPicker ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={selectedGroupInfo.color}
              />
            </TouchableOpacity>

            {showPicker && (
              <View style={styles.picker}>
                {GROUP_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.type}
                    style={[
                      styles.pickerItem,
                      selectedGroup === opt.type && { backgroundColor: opt.bg },
                    ]}
                    onPress={() => { setSelectedGroup(opt.type); setShowPicker(false); }}
                  >
                    <View style={[styles.pickerItemIcon, { backgroundColor: opt.bg }]}>
                      <Text style={{ fontSize: 16 }}>{opt.emoji}</Text>
                    </View>
                    <Text style={[styles.pickerItemText, { color: opt.color }]}>{opt.label}</Text>
                    {selectedGroup === opt.type && (
                      <Ionicons name="checkmark-circle" size={18} color={opt.color} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ── Auto-upload checkbox ── */}
        {!uploading && (
          <TouchableOpacity
            style={styles.autoRow}
            onPress={() => setAutoUpload(!autoUpload)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, autoUpload && styles.checkboxOn]}>
              {autoUpload && <Ionicons name="checkmark" size={13} color="#fff" />}
            </View>
            <View style={styles.autoTextBlock}>
              <Text style={styles.autoLabel}>다음부터 자동 업로드</Text>
              <Text style={styles.autoDesc}>키즈노트 사진 저장 시 자동으로 가족과 공유해요</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* ── Actions ── */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.shareBtn,
              { backgroundColor: selectedGroupInfo.color },
              uploading && styles.shareBtnDisabled,
            ]}
            onPress={handleShare}
            disabled={uploading}
            activeOpacity={0.85}
          >
            {uploading ? (
              <>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.shareBtnText}>업로드 중...</Text>
              </>
            ) : (
              <>
                <Ionicons name="people-outline" size={20} color="#fff" />
                <Text style={styles.shareBtnText}>가족에게 공유하기</Text>
              </>
            )}
          </TouchableOpacity>

          {!uploading && (
            <TouchableOpacity style={styles.laterBtn} onPress={onDismiss} activeOpacity={0.8}>
              <Text style={styles.laterBtnText}>나중에</Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.backgroundCard,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    gap: Spacing.lg,
    ...Shadow.lg,
  },
  handle: {
    width: 44,
    height: 5,
    backgroundColor: Colors.border,
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: Spacing.md,
  },
  closeBtn: {
    position: 'absolute',
    top: Spacing.xl,
    right: Spacing.xl,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.backgroundMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingTop: Spacing.xs,
  },
  headerIconWrap: {
    position: 'relative',
    width: 60,
    height: 60,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primaryPale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconEmoji: { fontSize: 30 },
  headerCountBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: Colors.backgroundCard,
  },
  headerCount: { color: '#fff', fontSize: 10, fontWeight: FontWeight.bold },
  headerText: { flex: 1 },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  headerSub: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 3,
    lineHeight: 20,
  },
  headerBold: { fontWeight: FontWeight.bold, color: Colors.textPrimary },
  thumbGrid: { flexDirection: 'row', gap: Spacing.sm },
  thumbCell: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.backgroundMuted,
    position: 'relative',
  },
  thumbImg: { width: '100%', height: '100%' },
  doneOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(76,175,80,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  extraOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.58)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  extraText: { color: '#fff', fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  thumbCheck: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressWrapper: { gap: 6 },
  progressTrack: {
    height: 8,
    backgroundColor: Colors.backgroundMuted,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  selectorWrapper: { gap: Spacing.sm },
  selectorLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1.5,
  },
  selectorIconBg: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorEmoji: { fontSize: 18 },
  selectorBtnText: { flex: 1, fontSize: FontSize.base, fontWeight: FontWeight.bold },
  picker: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  pickerItemIcon: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerItemText: { flex: 1, fontSize: FontSize.base, fontWeight: FontWeight.semibold },
  autoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    backgroundColor: Colors.primaryPale,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  checkboxOn: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  autoTextBlock: { flex: 1 },
  autoLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  autoDesc: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    opacity: 0.75,
    marginTop: 2,
    lineHeight: 17,
  },
  actions: { gap: Spacing.sm },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 17,
    borderRadius: Radius.full,
    ...Shadow.sm,
  },
  shareBtnDisabled: { opacity: 0.7 },
  shareBtnText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: '#fff',
  },
  laterBtn: { alignItems: 'center', paddingVertical: Spacing.md },
  laterBtnText: {
    fontSize: FontSize.base,
    color: Colors.textMuted,
    fontWeight: FontWeight.medium,
  },
});
