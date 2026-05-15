import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
  ActivityIndicator, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadow } from '@/theme';
import { useAuthStore } from '@/store/authStore';
import type { RootStackScreenProps } from '@/types/navigation';

type Props = RootStackScreenProps<'EditProfile'>;

const PROFILE_EMOJIS = ['👩', '👨', '👵', '👴', '👧', '👦', '🧑', '👶', '🐶', '🐱', '🌸', '⭐', '🦊', '🐼', '🌻', '🍀'];

export default function EditProfileScreen({ navigation }: Props) {
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);

  const [name, setName] = useState(user?.name ?? '');
  const [email] = useState(user?.email ?? '');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [profileEmoji, setProfileEmoji] = useState('👩');
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);

  const [nameError, setNameError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '사진 접근 권한이 필요합니다.'); return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setProfileImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || name.trim().length < 2) {
      setNameError('이름은 2자 이상 입력해주세요.'); return;
    }
    setNameError('');
    setIsSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 700));
      if (user) {
        setAuth({ ...user, name: name.trim() }, 'mock-token');
      }
      Alert.alert('저장 완료', '내 정보가 업데이트되었어요.', [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('오류', '저장 중 문제가 발생했어요. 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* ─── Header ─── */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>내 정보 수정</Text>
          <TouchableOpacity
            style={[styles.saveBtn, isSaving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving
              ? <ActivityIndicator size="small" color={Colors.primary} />
              : <Text style={styles.saveBtnText}>저장</Text>
            }
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ─── 프로필 아바타 ─── */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarCircle}>
                <Text style={{ fontSize: 52 }}>{profileEmoji}</Text>
              </View>
              <View style={styles.avatarActions}>
                <TouchableOpacity style={styles.avatarActionBtn} onPress={() => setEmojiPickerVisible(true)}>
                  <Ionicons name="happy-outline" size={16} color={Colors.primary} />
                  <Text style={styles.avatarActionText}>이모지</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.avatarActionBtn} onPress={handlePickImage}>
                  <Ionicons name="camera-outline" size={16} color={Colors.primary} />
                  <Text style={styles.avatarActionText}>사진</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* ─── 회원 정보 폼 ─── */}
          <View style={styles.formCard}>
            <SectionLabel>기본 정보</SectionLabel>

            <FormField
              label="이름"
              icon="person-outline"
              value={name}
              onChangeText={(t) => { setName(t); if (nameError) setNameError(''); }}
              placeholder="이름을 입력해주세요"
              error={nameError}
            />

            <Divider />

            <FormField
              label="이메일"
              icon="mail-outline"
              value={email}
              onChangeText={() => {}}
              placeholder="이메일 주소"
              editable={false}
              hint="이메일은 변경할 수 없어요"
            />

            <Divider />

            <FormField
              label="전화번호"
              icon="call-outline"
              value={phone}
              onChangeText={setPhone}
              placeholder="010-0000-0000"
              keyboardType="phone-pad"
            />

            <Divider />

            <FormField
              label="한 줄 소개"
              icon="chatbubble-ellipses-outline"
              value={bio}
              onChangeText={setBio}
              placeholder="가족에게 소개 한 마디 남겨보세요"
              multiline
            />
          </View>

          {/* ─── 계정 정보 ─── */}
          <View style={styles.formCard}>
            <SectionLabel>계정 정보</SectionLabel>

            <InfoRow icon="mail-outline"    label="이메일"     value={email} />
            <Divider />
            <InfoRow icon="shield-outline"  label="가입 방법"  value="이메일" />
            <Divider />
            <InfoRow icon="calendar-outline" label="가입일"    value="2026년 5월" />
          </View>

          {/* ─── 비밀번호 변경 ─── */}
          <View style={styles.formCard}>
            <SectionLabel>보안</SectionLabel>
            <TouchableOpacity style={styles.menuRow} activeOpacity={0.75}>
              <View style={styles.menuRowLeft}>
                <View style={[styles.menuIcon, { backgroundColor: '#E8E4FB' }]}>
                  <Ionicons name="lock-closed-outline" size={18} color="#6C5CE7" />
                </View>
                <View>
                  <Text style={styles.menuLabel}>비밀번호 변경</Text>
                  <Text style={styles.menuDesc}>마지막 변경일: 2026년 5월</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
            <Divider />
            <TouchableOpacity
              style={styles.menuRow}
              activeOpacity={0.75}
              onPress={() => Alert.alert('계정 탈퇴', '탈퇴 시 모든 데이터가 삭제됩니다. 정말 탈퇴하시겠어요?', [
                { text: '취소', style: 'cancel' },
                { text: '탈퇴', style: 'destructive', onPress: () => {} },
              ])}
            >
              <View style={styles.menuRowLeft}>
                <View style={[styles.menuIcon, { backgroundColor: '#FDE8E8' }]}>
                  <Ionicons name="trash-outline" size={18} color={Colors.error} />
                </View>
                <Text style={[styles.menuLabel, { color: Colors.error }]}>계정 탈퇴</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

        </ScrollView>
      </SafeAreaView>

      {/* ─── Emoji Picker Modal ─── */}
      <Modal
        visible={emojiPickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEmojiPickerVisible(false)}
      >
        <TouchableOpacity style={styles.emojiBackdrop} activeOpacity={1} onPress={() => setEmojiPickerVisible(false)} />
        <View style={styles.emojiSheet}>
          <View style={styles.emojiHandle} />
          <Text style={styles.emojiTitle}>이모지 선택</Text>
          <View style={styles.emojiGrid}>
            {PROFILE_EMOJIS.map((e) => (
              <TouchableOpacity
                key={e}
                style={[styles.emojiItem, profileEmoji === e && styles.emojiItemSelected]}
                onPress={() => { setProfileEmoji(e); setProfileImageUri(null); setEmojiPickerVisible(false); }}
              >
                <Text style={{ fontSize: 30 }}>{e}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

/* ── Sub-components ── */
function SectionLabel({ children }: { children: string }) {
  return <Text style={sStyles.sectionLabel}>{children}</Text>;
}

function FormField({
  label, icon, value, onChangeText, placeholder, editable = true,
  keyboardType, error, hint, multiline,
}: {
  label: string; icon: string; value: string;
  onChangeText: (t: string) => void; placeholder: string;
  editable?: boolean; keyboardType?: any; error?: string; hint?: string; multiline?: boolean;
}) {
  return (
    <View style={sStyles.fieldGroup}>
      <View style={sStyles.fieldRow}>
        <View style={sStyles.fieldIconBox}>
          <Ionicons name={icon as any} size={16} color={Colors.textMuted} />
        </View>
        <View style={sStyles.fieldContent}>
          <Text style={sStyles.fieldLabel}>{label}</Text>
          <TextInput
            style={[sStyles.fieldInput, !editable && sStyles.fieldInputDisabled, multiline && { minHeight: 60 }]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={Colors.textMuted}
            editable={editable}
            keyboardType={keyboardType}
            autoCapitalize="none"
            multiline={multiline}
          />
          {hint && <Text style={sStyles.hint}>{hint}</Text>}
          {error && <Text style={sStyles.error}>{error}</Text>}
        </View>
      </View>
    </View>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={sStyles.infoRow}>
      <View style={sStyles.fieldIconBox}>
        <Ionicons name={icon as any} size={16} color={Colors.textMuted} />
      </View>
      <View style={sStyles.fieldContent}>
        <Text style={sStyles.fieldLabel}>{label}</Text>
        <Text style={sStyles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function Divider() {
  return <View style={sStyles.divider} />;
}

/* ── Styles ── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
    backgroundColor: Colors.background,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  saveBtn: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm },
  saveBtnText: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.primary },
  scroll: { paddingBottom: 60 },
  avatarSection: { alignItems: 'center', paddingVertical: Spacing.xxl, backgroundColor: Colors.background },
  avatarWrapper: { alignItems: 'center', gap: Spacing.lg },
  avatarCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: Colors.primaryPale, alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: Colors.primary + '44', ...Shadow.md,
  },
  avatarActions: { flexDirection: 'row', gap: Spacing.md },
  avatarActionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.backgroundCard, borderRadius: Radius.full,
    paddingHorizontal: Spacing.lg, paddingVertical: 8,
    borderWidth: 1, borderColor: Colors.border, ...Shadow.sm,
  },
  avatarActionText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semibold },
  formCard: {
    backgroundColor: Colors.backgroundCard, marginHorizontal: Spacing.xl,
    borderRadius: Radius.xl, marginBottom: Spacing.lg, overflow: 'hidden', ...Shadow.sm,
  },
  menuRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg,
  },
  menuRowLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  menuIcon: { width: 36, height: 36, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { fontSize: FontSize.base, fontWeight: FontWeight.medium, color: Colors.textPrimary },
  menuDesc: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  emojiBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  emojiSheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.backgroundCard, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 40,
  },
  emojiHandle: { width: 44, height: 5, backgroundColor: Colors.border, borderRadius: 3, alignSelf: 'center', marginTop: Spacing.md },
  emojiTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, textAlign: 'center', paddingVertical: Spacing.lg, color: Colors.textPrimary },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.lg, gap: Spacing.md, justifyContent: 'center' },
  emojiItem: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.backgroundMuted },
  emojiItemSelected: { backgroundColor: Colors.primaryPale, borderWidth: 2, borderColor: Colors.primary },
});

const sStyles = StyleSheet.create({
  sectionLabel: {
    fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.6,
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: Spacing.sm,
  },
  fieldGroup: {},
  fieldRow: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, gap: Spacing.md },
  fieldIconBox: { width: 28, alignItems: 'center', paddingTop: 18 },
  fieldContent: { flex: 1 },
  fieldLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.semibold, marginBottom: 4 },
  fieldInput: { fontSize: FontSize.base, color: Colors.textPrimary, paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  fieldInputDisabled: { color: Colors.textMuted, backgroundColor: 'transparent' },
  hint: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 4 },
  error: { fontSize: FontSize.xs, color: Colors.error, marginTop: 4 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, gap: Spacing.md },
  infoValue: { fontSize: FontSize.base, color: Colors.textPrimary, paddingTop: 2 },
  divider: { height: 1, backgroundColor: Colors.borderLight, marginLeft: Spacing.xl + 28 + Spacing.md },
});
