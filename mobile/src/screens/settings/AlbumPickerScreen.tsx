import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  Alert, ActivityIndicator, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadow } from '@/theme';
import { useUploadStore } from '@/store/uploadStore';
import type { RootStackScreenProps } from '@/types/navigation';

type Props = RootStackScreenProps<'AlbumPicker'>;

/** 자동 업로드 최대 사진 수 */
const AUTO_UPLOAD_MAX = 5;

type Phase = 'picking' | 'monitoring' | 'complete';

interface AlbumItem {
  id: string;
  title: string;
  assetCount: number;
  thumbnailUri?: string;
  isSelected?: boolean;
}

// 목업 완료 화면용 멤버 아바타
const FAMILY_AVATARS = ['👩', '👨', '👵', '👴'];

export default function AlbumPickerScreen({ navigation }: Props) {
  const [phase, setPhase] = useState<Phase>('picking');
  const [albums, setAlbums] = useState<AlbumItem[]>([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [loadingAlbums, setLoadingAlbums] = useState(true);
  const [uploadedCount, setUploadedCount] = useState(0);
  const autoUploadAlbum = useUploadStore((s) => s.autoUploadAlbum);
  const setAutoUploadAlbum = useUploadStore((s) => s.setAutoUploadAlbum);

  // 업로드 진행 애니메이션
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadAlbums();
  }, []);

  useEffect(() => {
    if (phase === 'monitoring') {
      // 아이콘 pulse 애니메이션
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        ])
      ).start();

      // 목업: 3초 후 5장 업로드 완료 시뮬레이션
      const timer = setTimeout(() => {
        setUploadedCount(AUTO_UPLOAD_MAX);
        setPhase('complete');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const loadAlbums = async () => {
    setLoadingAlbums(true);
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 필요', '갤러리 접근 권한이 필요합니다.', [
          { text: '확인', onPress: () => navigation.goBack() },
        ]);
        return;
      }
      const result = await MediaLibrary.getAlbumsAsync({ includeSmartAlbums: true });
      const albumItems: AlbumItem[] = result.map((a) => ({
        id: a.id,
        title: a.title,
        assetCount: a.assetCount,
      }));
      // 목업 앨범 추가 (스토리보드 예시처럼)
      const mockAlbums: AlbumItem[] = [
        { id: 'recents', title: '최근 항목', assetCount: 2358 },
        { id: 'favorites', title: '즐겨찾기', assetCount: 312 },
        { id: 'todaysfamily', title: '오늘의가족 자동업로드', assetCount: 128 },
        { id: 'minjun', title: '민준이 성장기록', assetCount: 84 },
        { id: 'family_trip', title: '가족여행', assetCount: 67 },
        ...albumItems.filter((a) => !['Recents', 'Favorites'].includes(a.title)).slice(0, 5),
      ];
      setAlbums(mockAlbums);
      // 현재 설정된 앨범 선택
      const current = mockAlbums.find((a) => a.title === autoUploadAlbum);
      if (current) setSelectedAlbumId(current.id);
    } catch {
      // 권한 없을 경우 목업만 표시
      setAlbums([
        { id: 'recents', title: '최근 항목', assetCount: 2358 },
        { id: 'favorites', title: '즐겨찾기', assetCount: 312 },
        { id: 'todaysfamily', title: '오늘의가족 자동업로드', assetCount: 128 },
        { id: 'minjun', title: '민준이 성장기록', assetCount: 84 },
        { id: 'family_trip', title: '가족여행', assetCount: 67 },
      ]);
    } finally {
      setLoadingAlbums(false);
    }
  };

  const handleSelectAlbum = (album: AlbumItem) => {
    setSelectedAlbumId(album.id);
  };

  const handleConfirm = () => {
    const album = albums.find((a) => a.id === selectedAlbumId);
    if (!album) {
      Alert.alert('앨범 선택', '앨범을 선택해주세요.'); return;
    }
    Alert.alert(
      '자동 업로드 설정',
      `"${album.title}" 앨범에 새 사진이 추가되면 자동으로 기록에 추가됩니다.\n\n최근 추가된 사진 최대 ${AUTO_UPLOAD_MAX}장까지만 자동 업로드됩니다.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '설정 완료',
          onPress: () => {
            setAutoUploadAlbum(album.title);
            setPhase('monitoring');
          },
        },
      ]
    );
  };

  // ─── Phase: picking ───────────────────────────────────────────
  if (phase === 'picking') {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>앨범</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* 안내 배너 */}
          <View style={styles.infoBanner}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.primary} />
            <Text style={styles.infoBannerText}>
              선택한 앨범에 사진이 추가되면 자동으로 기록에 올라가요.{'\n'}
              한 번에 최근 <Text style={styles.infoBold}>{AUTO_UPLOAD_MAX}장</Text>까지만 자동 업로드됩니다.
            </Text>
          </View>

          {loadingAlbums ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>앨범 불러오는 중...</Text>
            </View>
          ) : (
            <FlatList
              data={albums}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.albumList}
              ItemSeparatorComponent={() => <View style={styles.albumDivider} />}
              renderItem={({ item }) => {
                const isSelected = selectedAlbumId === item.id;
                return (
                  <TouchableOpacity
                    style={[styles.albumRow, isSelected && styles.albumRowSelected]}
                    onPress={() => handleSelectAlbum(item)}
                    activeOpacity={0.75}
                  >
                    {/* 썸네일 */}
                    <View style={[styles.albumThumb, isSelected && { backgroundColor: Colors.primary + '22' }]}>
                      {item.id === 'todaysfamily'
                        ? <Text style={{ fontSize: 24 }}>🏠</Text>
                        : item.id === 'recents'
                        ? <Text style={{ fontSize: 24 }}>🕐</Text>
                        : item.id === 'favorites'
                        ? <Text style={{ fontSize: 24 }}>⭐</Text>
                        : <Ionicons name="images-outline" size={24} color={Colors.textSecondary} />
                      }
                    </View>
                    <View style={styles.albumInfo}>
                      <Text style={[styles.albumTitle, isSelected && { color: Colors.primary }]}>{item.title}</Text>
                      <Text style={styles.albumCount}>{item.assetCount.toLocaleString()}장</Text>
                    </View>
                    {isSelected
                      ? <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
                      : <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
                    }
                  </TouchableOpacity>
                );
              }}
              ListFooterComponent={<View style={{ height: 120 }} />}
            />
          )}

          {/* 확인 버튼 */}
          {selectedAlbumId && (
            <View style={styles.confirmBtnWrap}>
              <View style={styles.confirmHint}>
                <Ionicons name="warning-outline" size={14} color="#C4693A" />
                <Text style={styles.confirmHintText}>
                  자동 업로드는 최근 추가된 사진 {AUTO_UPLOAD_MAX}장까지만 처리됩니다
                </Text>
              </View>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} activeOpacity={0.85}>
                <Ionicons name="checkmark" size={20} color="#fff" />
                <Text style={styles.confirmBtnText}>이 앨범으로 자동 업로드 설정</Text>
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      </View>
    );
  }

  // ─── Phase: monitoring ────────────────────────────────────────
  if (phase === 'monitoring') {
    const selectedAlbum = albums.find((a) => a.id === selectedAlbumId);
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>오늘의가족 자동업로드</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.monitorBody}>
            {/* 감지 결과 그리드 목업 */}
            <View style={styles.photoGrid}>
              {[51, 52, 53, 54].map((n, i) => (
                <View key={n} style={[styles.photoCell, i >= 2 && { opacity: 0.6 }]}>
                  <View style={styles.photoPlaceholder}>
                    <Text style={{ fontSize: 28 }}>{['🌳', '🎂', '🌿', '🌻'][i]}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.monitorInfo}>
              <Text style={styles.monitorAlbum}>"{selectedAlbum?.title}"</Text>
              <Text style={styles.monitorDesc}>
                새로 추가된 사진 <Text style={styles.monitorBold}>{AUTO_UPLOAD_MAX}장</Text> 감지됨
              </Text>
              <Text style={styles.monitorLimit}>최대 {AUTO_UPLOAD_MAX}장 자동 업로드</Text>
            </View>

            <Animated.View style={[styles.uploadIconWrap, { transform: [{ scale: pulseAnim }] }]}>
              <View style={styles.uploadIcon}>
                <Ionicons name="cloud-upload-outline" size={36} color={Colors.primary} />
              </View>
            </Animated.View>
            <Text style={styles.uploadingText}>자동 업로드 중...</Text>
            <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: 8 }} />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // ─── Phase: complete ──────────────────────────────────────────
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.completeBody}>
          {/* 체크 아이콘 */}
          <View style={styles.completeCheckWrap}>
            <View style={styles.completeCheck}>
              <Ionicons name="checkmark" size={40} color="#fff" />
            </View>
          </View>

          <Text style={styles.completeTitle}>업로드 완료!</Text>
          <Text style={styles.completeDesc}>
            새로 추가된 {uploadedCount}장의 사진을{'\n'}가족과 공유했어요
          </Text>

          {/* 가족 아바타 */}
          <View style={styles.avatarRow}>
            {FAMILY_AVATARS.slice(0, 3).map((e, i) => (
              <View key={i} style={[styles.completeMemberAvatar, { marginLeft: i === 0 ? 0 : -12, zIndex: 4 - i }]}>
                <Text style={{ fontSize: 24 }}>{e}</Text>
              </View>
            ))}
            <View style={[styles.completeMemberAvatar, styles.completeMemberMore, { marginLeft: -12 }]}>
              <Text style={styles.completeMemberMoreText}>+2</Text>
            </View>
          </View>

          <View style={styles.completeBtns}>
            <TouchableOpacity
              style={styles.completeSecondaryBtn}
              onPress={() => navigation.navigate('Main')}
              activeOpacity={0.85}
            >
              <Text style={styles.completeSecondaryBtnText}>업로드된 사진 보기</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.completePrimaryBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.85}
            >
              <Text style={styles.completePrimaryBtnText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  infoBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm,
    backgroundColor: Colors.primaryPale, margin: Spacing.xl,
    borderRadius: Radius.xl, padding: Spacing.lg,
  },
  infoBannerText: { flex: 1, fontSize: FontSize.sm, color: Colors.primary, lineHeight: 20 },
  infoBold: { fontWeight: FontWeight.bold },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  loadingText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  albumList: { paddingHorizontal: Spacing.xl },
  albumDivider: { height: 1, backgroundColor: Colors.borderLight, marginLeft: 68 + Spacing.xl },
  albumRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.lg,
    gap: Spacing.md, borderRadius: Radius.lg,
  },
  albumRowSelected: { backgroundColor: Colors.primaryPale + '66' },
  albumThumb: {
    width: 68, height: 68, borderRadius: Radius.lg,
    backgroundColor: Colors.backgroundMuted, alignItems: 'center', justifyContent: 'center',
  },
  albumInfo: { flex: 1 },
  albumTitle: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  albumCount: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 3 },
  confirmBtnWrap: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.background, paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md, paddingBottom: 32,
    borderTopWidth: 1, borderTopColor: Colors.borderLight,
    gap: Spacing.sm,
  },
  confirmHint: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
    backgroundColor: '#FBE8DC', borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: 8,
  },
  confirmHintText: { flex: 1, fontSize: FontSize.xs, color: '#C4693A', lineHeight: 16 },
  confirmBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.xl,
    paddingVertical: 16, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: Spacing.sm, ...Shadow.md,
  },
  confirmBtnText: { color: '#fff', fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  // Monitoring
  monitorBody: { flex: 1, alignItems: 'center', paddingTop: Spacing.xxl, gap: Spacing.xl },
  photoGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, width: 260,
  },
  photoCell: { width: 124, height: 124 },
  photoPlaceholder: {
    flex: 1, backgroundColor: Colors.backgroundMuted, borderRadius: Radius.lg,
    alignItems: 'center', justifyContent: 'center',
  },
  monitorInfo: { alignItems: 'center', gap: 6 },
  monitorAlbum: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  monitorDesc: { fontSize: FontSize.sm, color: Colors.textSecondary },
  monitorBold: { fontWeight: FontWeight.bold, color: Colors.primary },
  monitorLimit: { fontSize: FontSize.xs, color: '#C4693A', backgroundColor: '#FBE8DC', borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: 3 },
  uploadIconWrap: { alignItems: 'center' },
  uploadIcon: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.primaryPale,
    alignItems: 'center', justifyContent: 'center', ...Shadow.md,
  },
  uploadingText: { fontSize: FontSize.base, color: Colors.textSecondary, fontWeight: FontWeight.semibold },
  // Complete
  completeBody: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xxl, gap: Spacing.xl },
  completeCheckWrap: { marginBottom: Spacing.sm },
  completeCheck: {
    width: 88, height: 88, borderRadius: 44, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center', ...Shadow.lg,
  },
  completeTitle: { fontSize: FontSize.xxxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  completeDesc: { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', marginVertical: Spacing.sm },
  completeMemberAvatar: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primaryPale,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2.5, borderColor: Colors.background,
  },
  completeMemberMore: { backgroundColor: Colors.backgroundMuted },
  completeMemberMoreText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textSecondary },
  completeBtns: { width: '100%', gap: Spacing.md, marginTop: Spacing.sm },
  completeSecondaryBtn: {
    borderWidth: 1.5, borderColor: Colors.primary, borderRadius: Radius.xl,
    paddingVertical: 14, alignItems: 'center',
  },
  completeSecondaryBtnText: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.primary },
  completePrimaryBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.xl,
    paddingVertical: 16, alignItems: 'center', ...Shadow.md,
  },
  completePrimaryBtnText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff' },
});
