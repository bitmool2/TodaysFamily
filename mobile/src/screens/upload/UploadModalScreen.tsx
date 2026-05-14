import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadow } from '@/theme';
import type { RootStackScreenProps } from '@/types/navigation';
import { useUploadStore } from '@/store/uploadStore';
import type { UploadAsset } from '@/types';

type Props = RootStackScreenProps<'UploadModal'>;

const { height: H } = Dimensions.get('window');

interface Option {
  id: 'camera' | 'gallery' | 'kidsnote';
  icon: string;
  emoji: string;
  label: string;
  description: string;
  stepLabel: string;
  color: string;
  bg: string;
}

const OPTIONS: Option[] = [
  {
    id: 'camera',
    icon: 'camera-outline',
    emoji: '📷',
    label: '카메라로 촬영',
    description: '앱에서 바로 촬영하고 즉시 기록해요',
    stepLabel: '1',
    color: Colors.cameraBadge,
    bg: '#FBE8DC',
  },
  {
    id: 'gallery',
    icon: 'images-outline',
    emoji: '🖼',
    label: '앨범에서 선택',
    description: '갤러리에서 공유 버튼만 누르면 끝!',
    stepLabel: '2',
    color: Colors.galleryBadge,
    bg: '#F0E8FB',
  },
  {
    id: 'kidsnote',
    icon: 'share-social-outline',
    emoji: '📋',
    label: '키즈노트에서 공유하기',
    description: '지정한 앨범에 넣으면 자동으로 업로드!',
    stepLabel: '3',
    color: Colors.kidsnoteBadge,
    bg: '#E8F0FB',
  },
];

export default function UploadModalScreen({ navigation }: Props) {
  const setSelectedAssets = useUploadStore((s) => s.setSelectedAssets);
  const setSource = useUploadStore((s) => s.setSource);

  const pickFromGallery = async (source: 'GALLERY' | 'KIDSNOTE') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.9,
    });
    if (!result.canceled) {
      const assets: UploadAsset[] = result.assets.map((a) => ({
        uri: a.uri,
        filename: a.fileName ?? undefined,
        width: a.width,
        height: a.height,
      }));
      setSelectedAssets(assets);
      setSource(source);
      navigation.replace('Preview', { assets, source });
    }
  };

  const handlePress = (id: Option['id']) => {
    if (id === 'camera') navigation.navigate('Camera');
    else if (id === 'gallery') pickFromGallery('GALLERY');
    else pickFromGallery('KIDSNOTE');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        {/* Handle bar */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>사진 업로드</Text>
            <Text style={styles.subtitle}>어떤 방법으로 기록할까요?</Text>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Top banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerEmoji}>💡</Text>
          <Text style={styles.bannerText}>
            어떤 방법을 사용해도 우리 가족에게 바로 공유돼요!
          </Text>
        </View>

        {/* Options */}
        <View style={styles.options}>
          {OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.id}
              style={styles.optionCard}
              onPress={() => handlePress(opt.id)}
              activeOpacity={0.8}
            >
              {/* Step number */}
              <View style={styles.stepBadge}>
                <Text style={styles.stepText}>{opt.stepLabel}</Text>
              </View>

              {/* Icon */}
              <View style={[styles.optionIcon, { backgroundColor: opt.bg }]}>
                <Text style={styles.optionEmoji}>{opt.emoji}</Text>
              </View>

              {/* Text */}
              <View style={styles.optionContent}>
                <Text style={styles.optionLabel}>{opt.label}</Text>
                <Text style={styles.optionDesc}>{opt.description}</Text>
              </View>

              <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Auto-upload hint */}
        <TouchableOpacity style={styles.autoHint}>
          <Ionicons name="refresh-circle-outline" size={18} color={Colors.primary} />
          <Text style={styles.autoHintText}>자동 업로드 설정하기 →</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
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
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.backgroundMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
    backgroundColor: Colors.primaryPale,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  bannerEmoji: { fontSize: 16 },
  bannerText: { flex: 1, fontSize: FontSize.xs, color: Colors.primary, lineHeight: 17 },
  options: { paddingHorizontal: Spacing.xl, gap: Spacing.md },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    ...Shadow.sm,
    position: 'relative',
  },
  stepBadge: {
    position: 'absolute',
    top: -8,
    left: Spacing.xl - 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { color: '#fff', fontSize: 10, fontWeight: FontWeight.bold },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionEmoji: { fontSize: 28 },
  optionContent: { flex: 1 },
  optionLabel: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  optionDesc: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 3, lineHeight: 17 },
  autoHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  autoHintText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium },
});
