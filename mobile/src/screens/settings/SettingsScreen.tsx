import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadow } from '@/theme';
import { useAuthStore } from '@/store/authStore';
import { useUploadStore } from '@/store/uploadStore';
import type { TabScreenProps } from '@/types/navigation';

type Props = TabScreenProps<'SettingsTab'>;

export default function SettingsScreen({ navigation }: Props) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const autoUploadEnabled = useUploadStore((s) => s.autoUploadEnabled);
  const wifiOnlyUpload = useUploadStore((s) => s.wifiOnlyUpload);
  const recentAutoUpload = useUploadStore((s) => s.recentAutoUpload);
  const setAutoUploadEnabled = useUploadStore((s) => s.setAutoUploadEnabled);
  const setWifiOnlyUpload = useUploadStore((s) => s.setWifiOnlyUpload);
  const setRecentAutoUpload = useUploadStore((s) => s.setRecentAutoUpload);

  const handleLogout = () => {
    Alert.alert('로그아웃', '로그아웃 하시겠어요?', [
      { text: '취소', style: 'cancel' },
      { text: '로그아웃', style: 'destructive', onPress: () => {
        logout();
        navigation.replace('Login');
      }},
    ]);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <Text style={styles.pageTitle}>설정</Text>

          {/* ─── Profile card ─── */}
          <TouchableOpacity style={styles.profileCard} activeOpacity={0.85} onPress={() => navigation.navigate('EditProfile')}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileEmoji}>👩</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name ?? '사용자'}</Text>
              <Text style={styles.profileEmail}>{user?.email ?? 'user@example.com'}</Text>
              <View style={styles.profileBadge}>
                <Text style={styles.profileBadgeText}>프리미엄 구독 중 ✨</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          {/* ─── 업로드 설정 ─── */}
          <SectionCard title="업로드 설정" icon="cloud-upload-outline">
            <ToggleRow
              icon="wifi-outline"
              iconBg="#E8F0FB"
              label="Wi-Fi에서만 업로드"
              desc="모바일 데이터 절약을 위해 Wi-Fi 연결 시에만"
              value={wifiOnlyUpload}
              onChange={setWifiOnlyUpload}
            />
            <Divider />
            <ToggleRow
              icon="cloud-upload-outline"
              iconBg="#E8F2EC"
              label="자동 업로드"
              desc="새로 저장된 사진을 자동으로 업로드해요"
              value={autoUploadEnabled}
              onChange={setAutoUploadEnabled}
            />
            <Divider />
            <LinkRow
              icon="folder-open-outline"
              iconBg={Colors.primaryPale}
              label="자동 업로드 앨범 선택"
              value={autoUploadAlbum}
              disabled={!autoUploadEnabled}
              onPress={() => navigation.navigate('AlbumPicker')}
            />
            <Divider />
            <ToggleRow
              icon="images-outline"
              iconBg="#FBE8DC"
              label="최근 사진 자동 업로드"
              desc="최근 10분 이내 저장된 사진을 자동 업로드해요"
              value={recentAutoUpload}
              onChange={setRecentAutoUpload}
              disabled={!autoUploadEnabled}
            />
            {autoUploadEnabled && (
              <View style={styles.uploadLimitBanner}>
                <Ionicons name="warning-outline" size={14} color="#C4693A" />
                <Text style={styles.uploadLimitText}>
                  자동 업로드는 한 번에 최근 추가된 사진 <Text style={styles.uploadLimitBold}>최대 5장</Text>까지만 가능합니다
                </Text>
              </View>
            )}
          </SectionCard>

          {/* ─── 키즈노트 연동 ─── */}
          <SectionCard title="키즈노트 연동" icon="scan-outline">
            <ToggleRow
              icon="scan-outline"
              iconBg="#E8F0FB"
              label="키즈노트 자동 감지"
              desc="갤러리에 저장된 키즈노트 사진을 자동으로 감지해요"
              value={autoUploadEnabled}
              onChange={setAutoUploadEnabled}
            />
            <Divider />
            <LinkRow
              icon="book-outline"
              iconBg={Colors.primaryPale}
              label="키즈노트 사용 방법 안내"
              badge="가이드"
            />
          </SectionCard>

          {/* ─── AI 캡션 ─── */}
          <SectionCard title="AI 캡션" icon="sparkles-outline">
            <ToggleRow
              icon="sparkles-outline"
              iconBg="#E8E4FB"
              label="AI 자동 캡션 생성"
              desc="사진 업로드 시 AI가 캡션을 자동으로 작성해요"
              value={true}
              onChange={() => {}}
            />
            <Divider />
            <ToggleRow
              icon="trophy-outline"
              iconBg="#FBE8DC"
              label="AI 베스트 사진 추천"
              desc="매주 가장 좋은 사진을 추천해드려요"
              value={true}
              onChange={() => {}}
            />
          </SectionCard>

          {/* ─── 알림 설정 ─── */}
          <SectionCard title="알림 설정" icon="notifications-outline">
            <ToggleRow
              icon="images-outline"
              iconBg={Colors.primaryPale}
              label="새 사진 업로드 알림"
              value={true}
              onChange={() => {}}
            />
            <Divider />
            <ToggleRow
              icon="chatbubble-outline"
              iconBg="#FBE8DC"
              label="댓글 알림"
              value={true}
              onChange={() => {}}
            />
            <Divider />
            <ToggleRow
              icon="heart-outline"
              iconBg="#FDE8E8"
              label="반응 알림"
              value={false}
              onChange={() => {}}
            />
          </SectionCard>

          {/* ─── 가족 그룹 관리 ─── */}
          <SectionCard title="가족 그룹 관리" icon="people-outline">
            <LinkRow icon="people-outline"      iconBg={Colors.primaryPale} label="그룹 멤버 관리" />
            <Divider />
            <LinkRow icon="link-outline"        iconBg="#E8F0FB"            label="초대 링크 생성" />
            <Divider />
            <LinkRow icon="notifications-outline" iconBg="#FBE8DC"          label="그룹별 알림 설정" />
          </SectionCard>

          {/* ─── 앱 정보 ─── */}
          <SectionCard title="앱 정보" icon="information-circle-outline">
            <LinkRow icon="star-outline"        iconBg="#FBE8DC"            label="앱 평가하기" />
            <Divider />
            <LinkRow icon="help-circle-outline" iconBg={Colors.primaryPale} label="고객센터 / 문의" />
            <Divider />
            <LinkRow icon="document-text-outline" iconBg={Colors.backgroundMuted} label="이용약관" />
            <Divider />
            <LinkRow icon="shield-checkmark-outline" iconBg={Colors.backgroundMuted} label="개인정보처리방침" />
          </SectionCard>

          {/* ─── 로그아웃 ─── */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
            <Ionicons name="log-out-outline" size={20} color={Colors.error} />
            <Text style={styles.logoutText}>로그아웃</Text>
          </TouchableOpacity>

          <Text style={styles.version}>오늘의가족 v1.0.0  •  오늘의가족 팀</Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

/* ── Sub-components ─────────────────────────────────────────── */

function SectionCard({ title, icon, children }: {
  title: string; icon: string; children: React.ReactNode;
}) {
  return (
    <View style={sectionStyles.wrapper}>
      <View style={sectionStyles.titleRow}>
        <Ionicons name={icon as any} size={15} color={Colors.textSecondary} />
        <Text style={sectionStyles.title}>{title}</Text>
      </View>
      <View style={sectionStyles.card}>{children}</View>
    </View>
  );
}

function ToggleRow({ icon, iconBg, label, desc, value, onChange, disabled }: {
  icon: string; iconBg: string; label: string; desc?: string;
  value: boolean; onChange: (v: boolean) => void; disabled?: boolean;
}) {
  return (
    <View style={[rowStyles.row, disabled && rowStyles.rowDisabled]}>
      <View style={[rowStyles.iconBox, { backgroundColor: disabled ? Colors.backgroundMuted : iconBg }]}>
        <Ionicons name={icon as any} size={19} color={disabled ? Colors.textMuted : Colors.primary} />
      </View>
      <View style={rowStyles.content}>
        <Text style={[rowStyles.label, disabled && rowStyles.labelDisabled]}>{label}</Text>
        {desc && <Text style={[rowStyles.desc, disabled && rowStyles.labelDisabled]}>{desc}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={disabled ? undefined : onChange}
        disabled={disabled}
        trackColor={{ false: Colors.border, true: Colors.primaryLight }}
        thumbColor={Colors.backgroundCard}
        ios_backgroundColor={Colors.border}
      />
    </View>
  );
}

function LinkRow({ icon, iconBg, label, value, badge, disabled, onPress }: {
  icon: string; iconBg: string; label: string; value?: string; badge?: string; disabled?: boolean; onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={[rowStyles.row, disabled && rowStyles.rowDisabled]} activeOpacity={disabled ? 1 : 0.75} disabled={disabled} onPress={disabled ? undefined : onPress}>
      <View style={[rowStyles.iconBox, { backgroundColor: disabled ? Colors.backgroundMuted : iconBg }]}>
        <Ionicons name={icon as any} size={19} color={disabled ? Colors.textMuted : Colors.primary} />
      </View>
      <View style={rowStyles.content}>
        <Text style={[rowStyles.label, disabled && rowStyles.labelDisabled]}>{label}</Text>
        {value && <Text style={[rowStyles.desc, disabled && rowStyles.labelDisabled]}>{value}</Text>}
      </View>
      {badge && (
        <View style={rowStyles.badge}>
          <Text style={rowStyles.badgeText}>{badge}</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={16} color={disabled ? Colors.borderLight : Colors.textMuted} />
    </TouchableOpacity>
  );
}

function Divider() {
  return <View style={rowStyles.divider} />;
}

/* ── Styles ─────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  safeArea: { flex: 1 },
  scroll: { paddingHorizontal: Spacing.xl, paddingBottom: 100 },
  pageTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    gap: Spacing.lg,
    marginBottom: Spacing.xxl,
    ...Shadow.sm,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primaryPale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileEmoji: { fontSize: 30 },
  profileInfo: { flex: 1, gap: 3 },
  profileName: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  profileEmail: { fontSize: FontSize.sm, color: Colors.textSecondary },
  profileBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryPale,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
    marginTop: 4,
  },
  profileBadgeText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.semibold },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: '#FDE8E8',
    borderRadius: Radius.xl,
    paddingVertical: Spacing.xl,
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  logoutText: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.error },
  version: {
    textAlign: 'center',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    paddingBottom: Spacing.xl,
  },
  uploadLimitBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.xs,
    backgroundColor: '#FBE8DC', marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg, borderRadius: Radius.md,
    paddingHorizontal: Spacing.md, paddingVertical: 8,
  },
  uploadLimitText: { flex: 1, fontSize: FontSize.xs, color: '#C4693A', lineHeight: 16 },
  uploadLimitBold: { fontWeight: FontWeight.bold },
});

const sectionStyles = StyleSheet.create({
  wrapper: { marginBottom: Spacing.xl },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  card: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadow.sm,
  },
});

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flex: 1 },
  label: { fontSize: FontSize.base, fontWeight: FontWeight.medium, color: Colors.textPrimary },
  desc: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2, lineHeight: 16 },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginLeft: Spacing.lg + 36 + Spacing.md,
  },
  badge: {
    backgroundColor: Colors.primaryPale,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  badgeText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.semibold },
  rowDisabled: { opacity: 0.45 },
  labelDisabled: { color: Colors.textMuted },
});
