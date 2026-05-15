import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadow } from '@/theme';
import type { RootStackScreenProps } from '@/types/navigation';

type Props = RootStackScreenProps<'ChangePassword'>;

function validatePassword(pw: string): string | null {
  if (pw.length < 8)          return '비밀번호는 8자 이상이어야 합니다.';
  if (!/[A-Za-z]/.test(pw))   return '영문자를 포함해야 합니다.';
  if (!/[0-9]/.test(pw))      return '숫자를 포함해야 합니다.';
  return null;
}

export default function ChangePasswordScreen({ navigation }: Props) {
  const [currentPw, setCurrentPw]         = useState('');
  const [newPw, setNewPw]                 = useState('');
  const [confirmPw, setConfirmPw]         = useState('');
  const [showCurrent, setShowCurrent]     = useState(false);
  const [showNew, setShowNew]             = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);

  const [currentErr, setCurrentErr]       = useState('');
  const [newErr, setNewErr]               = useState('');
  const [confirmErr, setConfirmErr]       = useState('');
  const [isSaving, setIsSaving]           = useState(false);

  const newPwValid   = validatePassword(newPw) === null;
  const confirmMatch = newPw === confirmPw && confirmPw.length > 0;

  const handleSave = async () => {
    let hasError = false;

    if (!currentPw.trim()) {
      setCurrentErr('현재 비밀번호를 입력해주세요.'); hasError = true;
    } else { setCurrentErr(''); }

    const pwErr = validatePassword(newPw);
    if (pwErr) { setNewErr(pwErr); hasError = true; }
    else { setNewErr(''); }

    if (!confirmMatch) {
      setConfirmErr('새 비밀번호가 일치하지 않습니다.'); hasError = true;
    } else { setConfirmErr(''); }

    if (hasError) return;

    setIsSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      Alert.alert('변경 완료', '비밀번호가 성공적으로 변경되었습니다.', [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('오류', '비밀번호 변경 중 문제가 발생했습니다. 다시 시도해주세요.');
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
          <Text style={styles.headerTitle}>비밀번호 변경</Text>
          <TouchableOpacity
            style={[styles.saveBtn, (isSaving || !currentPw) && { opacity: 0.4 }]}
            onPress={handleSave}
            disabled={isSaving || !currentPw}
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
          {/* 안내 배너 */}
          <View style={styles.infoBanner}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.primary} />
            <Text style={styles.infoText}>
              비밀번호는 <Text style={styles.infoBold}>8자 이상, 영문·숫자</Text>를 포함해야 합니다
            </Text>
          </View>

          <View style={styles.formCard}>
            {/* 현재 비밀번호 */}
            <PwField
              label="현재 비밀번호"
              value={currentPw}
              onChangeText={(t) => { setCurrentPw(t); if (currentErr) setCurrentErr(''); }}
              show={showCurrent}
              onToggleShow={() => setShowCurrent(!showCurrent)}
              placeholder="현재 비밀번호를 입력해주세요"
              error={currentErr}
            />

            <View style={styles.sectionDivider} />

            {/* 새 비밀번호 */}
            <PwField
              label="새 비밀번호"
              value={newPw}
              onChangeText={(t) => { setNewPw(t); if (newErr) setNewErr(''); }}
              show={showNew}
              onToggleShow={() => setShowNew(!showNew)}
              placeholder="새 비밀번호를 입력해주세요"
              error={newErr}
              success={newPw.length > 0 && newPwValid}
            />

            <View style={styles.sectionDivider} />

            {/* 새 비밀번호 확인 */}
            <PwField
              label="새 비밀번호 확인"
              value={confirmPw}
              onChangeText={(t) => { setConfirmPw(t); if (confirmErr) setConfirmErr(''); }}
              show={showConfirm}
              onToggleShow={() => setShowConfirm(!showConfirm)}
              placeholder="새 비밀번호를 한 번 더 입력해주세요"
              error={confirmErr}
              success={confirmMatch}
              isLast
            />
          </View>

          {/* 비밀번호 강도 표시 */}
          {newPw.length > 0 && (
            <View style={styles.strengthCard}>
              <StrengthRow ok={newPw.length >= 8} label="8자 이상" />
              <StrengthRow ok={/[A-Za-z]/.test(newPw)} label="영문자 포함" />
              <StrengthRow ok={/[0-9]/.test(newPw)} label="숫자 포함" />
            </View>
          )}

          <TouchableOpacity
            style={[styles.submitBtn, (isSaving || !currentPw) && { opacity: 0.5 }]}
            onPress={handleSave}
            disabled={isSaving || !currentPw}
            activeOpacity={0.85}
          >
            {isSaving
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text style={styles.submitBtnText}>비밀번호 변경</Text>
            }
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

function PwField({
  label, value, onChangeText, show, onToggleShow,
  placeholder, error, success, isLast,
}: {
  label: string; value: string; onChangeText: (t: string) => void;
  show: boolean; onToggleShow: () => void; placeholder: string;
  error?: string; success?: boolean; isLast?: boolean;
}) {
  return (
    <View style={[fStyles.fieldRow, isLast && { borderBottomWidth: 0 }]}>
      <View style={fStyles.fieldContent}>
        <Text style={fStyles.label}>{label}</Text>
        <View style={fStyles.inputRow}>
          <TextInput
            style={[fStyles.input, error && fStyles.inputError, success && fStyles.inputSuccess]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={Colors.textMuted}
            secureTextEntry={!show}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={onToggleShow} style={fStyles.eyeBtn}>
            <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textMuted} />
          </TouchableOpacity>
          {success && (
            <Ionicons name="checkmark-circle" size={20} color={Colors.primary} style={{ marginLeft: 4 }} />
          )}
        </View>
        {!!error && <Text style={fStyles.errorText}>{error}</Text>}
      </View>
    </View>
  );
}

function StrengthRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <View style={strStyles.row}>
      <Ionicons name={ok ? 'checkmark-circle' : 'ellipse-outline'} size={15} color={ok ? Colors.primary : Colors.textMuted} />
      <Text style={[strStyles.label, ok && { color: Colors.primary }]}>{label}</Text>
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
  saveBtn: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm },
  saveBtnText: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.primary },
  scroll: { padding: Spacing.xl, gap: Spacing.lg, paddingBottom: 60 },
  infoBanner: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.primaryPale, borderRadius: Radius.xl,
    padding: Spacing.lg,
  },
  infoText: { flex: 1, fontSize: FontSize.sm, color: Colors.primary },
  infoBold: { fontWeight: FontWeight.bold },
  formCard: {
    backgroundColor: Colors.backgroundCard, borderRadius: Radius.xl,
    overflow: 'hidden', ...Shadow.sm,
  },
  sectionDivider: { height: 1, backgroundColor: Colors.borderLight, marginLeft: Spacing.xl },
  strengthCard: {
    backgroundColor: Colors.backgroundCard, borderRadius: Radius.xl,
    padding: Spacing.lg, gap: Spacing.sm, ...Shadow.sm,
  },
  submitBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.xl,
    paddingVertical: 17, alignItems: 'center', ...Shadow.md,
  },
  submitBtnText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff' },
});

const fStyles = StyleSheet.create({
  fieldRow: {
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  fieldContent: { gap: 6 },
  label: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  input: {
    flex: 1, fontSize: FontSize.base, color: Colors.textPrimary,
    paddingVertical: 4,
  },
  inputError: { color: Colors.error },
  inputSuccess: { color: Colors.primary },
  eyeBtn: { padding: 4 },
  errorText: { fontSize: FontSize.xs, color: Colors.error },
});

const strStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  label: { fontSize: FontSize.sm, color: Colors.textMuted },
});
