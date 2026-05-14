import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackScreenProps } from '@/types/navigation';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadow } from '@/theme';

type Props = RootStackScreenProps<'FamilyInvite'>;

export default function FamilyInviteScreen({ route, navigation }: Props) {
  const { groupType } = route.params;

  const groupLabel = groupType === 'ALL' ? '전체' : groupType === 'MATERNAL' ? '친정' : '시댁';

  const handleKakaoInvite = () => Alert.alert('카카오 초대', '카카오 링크 공유가 실행됩니다.');
  const handleSmsInvite = () => Alert.alert('SMS 초대', 'SMS 발송이 실행됩니다.');

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>가족 초대</Text>
          <View style={{ width: 36 }} />
        </View>

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconEmoji}>💌</Text>
          </View>

          <Text style={styles.title}>{groupLabel} 가족을 초대해요</Text>
          <Text style={styles.subtitle}>
            초대 링크를 공유하면 가족이 쉽게 앱에 참여할 수 있어요
          </Text>

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.kakaoBtn} onPress={handleKakaoInvite} activeOpacity={0.85}>
              <Text style={styles.kakaoBtnIcon}>💬</Text>
              <Text style={styles.kakaoBtnText}>카카오 링크로 초대</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.smsBtn} onPress={handleSmsInvite} activeOpacity={0.85}>
              <Ionicons name="chatbubble-outline" size={22} color={Colors.primary} />
              <Text style={styles.smsBtnText}>SMS로 초대</Text>
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxxl,
    gap: Spacing.xl,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primaryPale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: { fontSize: 52 },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttons: { width: '100%', gap: Spacing.md, marginTop: Spacing.xl },
  kakaoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: '#FEE500',
    paddingVertical: Spacing.xl,
    borderRadius: Radius.full,
    ...Shadow.sm,
  },
  kakaoBtnIcon: { fontSize: 20 },
  kakaoBtnText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: '#3A1D1D',
  },
  smsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primaryPale,
    paddingVertical: Spacing.xl,
    borderRadius: Radius.full,
  },
  smsBtnText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },
});
