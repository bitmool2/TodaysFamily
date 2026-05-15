import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackScreenProps } from '@/types/navigation';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadow } from '@/theme';
import { useAuthStore } from '@/store/authStore';

type Props = RootStackScreenProps<'FamilyInvite'>;

/** todaysfamily://invite?adminEmail=xxx&groupType=ALL 형태의 딥링크 생성 */
function buildInviteDeepLink(adminEmail: string, groupType: string) {
  const encoded = encodeURIComponent(adminEmail);
  return `todaysfamily://invite?adminEmail=${encoded}&groupType=${groupType}`;
}

/** 공유용 메시지 */
function buildInviteMessage(adminName: string, groupLabel: string, link: string) {
  return `${adminName}님이 오늘의가족 "${groupLabel}" 그룹에 초대했어요!\n\n아래 링크를 눌러 가입하면 자동으로 연결됩니다.\n${link}`;
}

export default function FamilyInviteScreen({ route, navigation }: Props) {
  const { groupType } = route.params;
  const user = useAuthStore((s) => s.user);

  const groupLabel =
    groupType === 'ALL' ? '전체' : groupType === 'MATERNAL' ? '친정' : '시댁';

  const adminEmail = user?.email ?? '';
  const adminName  = user?.name  ?? '관리자';
  const deepLink   = buildInviteDeepLink(adminEmail, groupType);
  const message    = buildInviteMessage(adminName, groupLabel, deepLink);

  const handleShare = async () => {
    try {
      await Share.share({ message, url: deepLink });
    } catch {
      Alert.alert('공유 오류', '공유 중 문제가 발생했습니다.');
    }
  };

  const handleKakaoInvite = () => {
    // 실제 카카오 SDK 연동 전 — Share로 대체
    handleShare();
  };

  const handleSmsInvite = () => {
    handleShare();
  };

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
            초대 링크를 공유하면 가족이 쉽게 앱에 참여할 수 있어요{'\n'}
            링크로 가입하면 관리자 이메일이 자동 입력됩니다
          </Text>

          {/* 초대 링크 미리보기 */}
          <View style={styles.linkPreview}>
            <Ionicons name="link-outline" size={15} color={Colors.primary} />
            <Text style={styles.linkText} numberOfLines={1}>{deepLink}</Text>
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.kakaoBtn} onPress={handleKakaoInvite} activeOpacity={0.85}>
              <Text style={styles.kakaoBtnIcon}>💬</Text>
              <Text style={styles.kakaoBtnText}>카카오 링크로 초대</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.smsBtn} onPress={handleSmsInvite} activeOpacity={0.85}>
              <Ionicons name="share-social-outline" size={22} color={Colors.primary} />
              <Text style={styles.smsBtnText}>링크 공유하기</Text>
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
  linkPreview: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
    backgroundColor: Colors.backgroundMuted, borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    width: '100%',
  },
  linkText: {
    flex: 1, fontSize: FontSize.xs, color: Colors.textSecondary, fontFamily: 'monospace',
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
