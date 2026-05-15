import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Dimensions,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import type { RootStackScreenProps } from '@/types/navigation';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadow } from '@/theme';
import { useAuthStore } from '@/store/authStore';
import api from '@/api/client';

const { height: H } = Dimensions.get('window');

type Props = RootStackScreenProps<'Login'>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PROFILE_EMOJIS = ['👩', '👨', '👵', '👴', '👧', '👦', '🧑', '👶', '🐶', '🐱', '🌸', '⭐'];

function validatePassword(pw: string): string | null {
  if (pw.length < 8) return '비밀번호는 8자 이상이어야 합니다.';
  if (!/[A-Za-z]/.test(pw)) return '영문자를 포함해야 합니다.';
  if (!/[0-9]/.test(pw)) return '숫자를 포함해야 합니다.';
  return null;
}

export default function LoginScreen({ navigation }: Props) {
  const [mode, setMode] = useState<'main' | 'email' | 'signup'>('main');

  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);

  // Signup fields
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupPasswordConfirm, setSignupPasswordConfirm] = useState('');
  const [showSignupPw, setShowSignupPw] = useState(false);
  const [showSignupPwConfirm, setShowSignupPwConfirm] = useState(false);

  // Profile avatar (emoji or image URI)
  const [profileEmoji, setProfileEmoji] = useState('👩');
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);

  // Validation errors
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwConfirmError, setPwConfirmError] = useState('');
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleSocialLogin = (provider: 'KAKAO' | 'GOOGLE') => {
    Alert.alert(
      provider === 'KAKAO' ? '카카오 로그인' : 'Google 로그인',
      '소셜 로그인 SDK를 연동해주세요.',
    );
  };

  const handleEmailLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('입력 오류', '이메일과 비밀번호를 입력해주세요.'); return;
    }
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      setAuth(
        { id: '1', email, name: '사용자', provider: 'EMAIL', createdAt: new Date().toISOString() },
        'mock-token',
      );
      navigation.replace('FamilyGroupSetup');
    } catch {
      Alert.alert('로그인 실패', '이메일 또는 비밀번호를 확인해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailCheck = async () => {
    if (!EMAIL_REGEX.test(signupEmail)) {
      setEmailError('올바른 이메일 형식이 아닙니다.');
      setEmailAvailable(null);
      return;
    }
    setEmailError('');
    setEmailCheckLoading(true);
    try {
      const res = await api.get('/auth/check-email', { params: { email: signupEmail } });
      if (res.data.available) {
        setEmailAvailable(true);
      } else {
        setEmailError('이미 가입된 메일주소입니다.');
        setEmailAvailable(false);
      }
    } catch {
      // 네트워크 오류 등 — 서버 미연결 상태에서는 중복 없는 것으로 처리
      setEmailAvailable(true);
    } finally {
      setEmailCheckLoading(false);
    }
  };

  const handleSignup = async () => {
    let hasError = false;

    if (!signupName.trim() || signupName.trim().length < 2) {
      setNameError('이름은 2자 이상 입력해주세요.');
      hasError = true;
    } else {
      setNameError('');
    }

    if (!EMAIL_REGEX.test(signupEmail)) {
      setEmailError('올바른 이메일 형식이 아닙니다.');
      hasError = true;
    } else if (emailAvailable !== true) {
      setEmailError('이메일 중복 확인을 해주세요.');
      hasError = true;
    } else {
      setEmailError('');
    }

    const pwValidation = validatePassword(signupPassword);
    if (pwValidation) {
      setPwError(pwValidation);
      hasError = true;
    } else {
      setPwError('');
    }

    if (signupPassword !== signupPasswordConfirm) {
      setPwConfirmError('비밀번호가 일치하지 않습니다.');
      hasError = true;
    } else {
      setPwConfirmError('');
    }

    if (hasError) return;

    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 900));
      setAuth(
        { id: '1', email: signupEmail, name: signupName.trim(), provider: 'EMAIL', createdAt: new Date().toISOString() },
        'mock-token',
      );
      navigation.replace('FamilyGroupSetup');
    } catch {
      Alert.alert('가입 실패', '잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetSignupForm = () => {
    setSignupName(''); setSignupEmail(''); setSignupPassword('');
    setSignupPasswordConfirm(''); setNameError(''); setEmailError('');
    setPwError(''); setPwConfirmError(''); setEmailAvailable(null);
    setProfileEmoji('👩'); setProfileImageUri(null);
  };

  const handlePickProfileImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '사진 접근 권한이 필요합니다.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setProfileImageUri(result.assets[0].uri);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'android' ? 0 : 0}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          bounces={false}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* Hero section */}
          <View style={styles.hero}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🏠</Text>
            </View>
            <Text style={styles.appName}>오늘의가족</Text>
            <Text style={styles.heroSub}>소중한 순간을 가족과 함께해요</Text>
          </View>

          {/* ─── Main buttons ─── */}
          {mode === 'main' && (
            <View style={styles.buttonsSection}>
              <TouchableOpacity style={styles.kakaoBtn} onPress={() => handleSocialLogin('KAKAO')} activeOpacity={0.85}>
                <Text style={styles.kakaoIcon}>💬</Text>
                <Text style={styles.kakaoBtnText}>카카오로 시작하기</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.googleBtn} onPress={() => handleSocialLogin('GOOGLE')} activeOpacity={0.85}>
                <View style={styles.googleG}><Text style={styles.googleGText}>G</Text></View>
                <Text style={styles.googleBtnText}>Google로 시작하기</Text>
              </TouchableOpacity>

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>또는</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity style={styles.emailBtn} onPress={() => setMode('email')} activeOpacity={0.85}>
                <Ionicons name="mail-outline" size={20} color={Colors.textSecondary} />
                <Text style={styles.emailBtnText}>이메일로 로그인</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ─── Email login ─── */}
          {mode === 'email' && (
            <View style={styles.formSection}>
              <TouchableOpacity style={styles.backRow} onPress={() => setMode('main')}>
                <Ionicons name="arrow-back" size={18} color={Colors.primary} />
                <Text style={styles.backText}>다른 방법으로 로그인</Text>
              </TouchableOpacity>

              <InputField
                label="이메일"
                icon="mail-outline"
                value={email}
                onChangeText={setEmail}
                placeholder="이메일 주소를 입력해주세요"
                keyboardType="email-address"
              />
              <InputField
                label="비밀번호"
                icon="lock-closed-outline"
                value={password}
                onChangeText={setPassword}
                placeholder="비밀번호를 입력해주세요"
                secureTextEntry={!showPw}
                rightIcon={showPw ? 'eye-off-outline' : 'eye-outline'}
                onRightIconPress={() => setShowPw(!showPw)}
              />

              <TouchableOpacity
                style={[styles.submitBtn, isLoading && styles.submitBtnLoading]}
                onPress={handleEmailLogin}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={styles.submitBtnText}>로그인</Text>
                }
              </TouchableOpacity>

              <TouchableOpacity style={styles.forgotBtn}>
                <Text style={styles.forgotText}>비밀번호를 잊으셨나요?</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ─── Signup ─── */}
          {mode === 'signup' && (
            <View style={styles.formSection}>
              <TouchableOpacity style={styles.backRow} onPress={() => { setMode('main'); resetSignupForm(); }}>
                <Ionicons name="arrow-back" size={18} color={Colors.primary} />
                <Text style={styles.backText}>뒤로 가기</Text>
              </TouchableOpacity>

              <Text style={styles.signupTitle}>회원가입</Text>

              {/* 프로필 아바타 선택 */}
              <View style={styles.avatarSection}>
                <TouchableOpacity
                  style={styles.avatarCircle}
                  onPress={() => setEmojiPickerVisible(true)}
                  activeOpacity={0.8}
                >
                  {profileImageUri ? (
                    <View style={styles.avatarImageWrap}>
                      {/* expo-image 없어도 기본 Image로 표시 */}
                      <Text style={{ fontSize: 44 }}>{profileEmoji}</Text>
                    </View>
                  ) : (
                    <Text style={{ fontSize: 44 }}>{profileEmoji}</Text>
                  )}
                  <View style={styles.avatarEditBadge}>
                    <Ionicons name="pencil" size={12} color="#fff" />
                  </View>
                </TouchableOpacity>
                <Text style={styles.avatarHint}>프로필 사진을 선택해주세요</Text>
                <View style={styles.avatarActions}>
                  <TouchableOpacity style={styles.avatarActionBtn} onPress={() => setEmojiPickerVisible(true)}>
                    <Text style={styles.avatarActionText}>😊 이모지 선택</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.avatarActionBtn} onPress={handlePickProfileImage}>
                    <Text style={styles.avatarActionText}>📷 사진 선택</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 사용자명 */}
              <InputField
                label="사용자명"
                icon="person-outline"
                value={signupName}
                onChangeText={(t) => { setSignupName(t); if (nameError) setNameError(''); }}
                placeholder="이름을 입력해주세요 (2자 이상)"
                error={nameError}
              />

              {/* 이메일 + 중복확인 */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>이메일</Text>
                <View style={styles.emailCheckRow}>
                  <View style={[styles.inputWrapper, styles.inputWrapperFlex, emailAvailable === true && styles.inputWrapperSuccess, !!emailError && styles.inputWrapperError]}>
                    <Ionicons name="mail-outline" size={18} color={Colors.textMuted} />
                    <TextInput
                      style={styles.input}
                      placeholder="이메일 주소를 입력해주세요"
                      placeholderTextColor={Colors.textMuted}
                      value={signupEmail}
                      onChangeText={(t) => { setSignupEmail(t); setEmailAvailable(null); setEmailError(''); }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                    {emailAvailable === true && (
                      <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
                    )}
                  </View>
                  <TouchableOpacity
                    style={[styles.checkBtn, emailCheckLoading && { opacity: 0.6 }]}
                    onPress={handleEmailCheck}
                    disabled={emailCheckLoading}
                  >
                    {emailCheckLoading
                      ? <ActivityIndicator size="small" color="#fff" />
                      : <Text style={styles.checkBtnText}>중복확인</Text>
                    }
                  </TouchableOpacity>
                </View>
                {emailAvailable === true && (
                  <Text style={styles.successText}>✓ 사용 가능한 이메일입니다.</Text>
                )}
                {!!emailError && <Text style={styles.fieldError}>{emailError}</Text>}
              </View>

              {/* 비밀번호 */}
              <InputField
                label="비밀번호"
                icon="lock-closed-outline"
                value={signupPassword}
                onChangeText={(t) => { setSignupPassword(t); setPwError(''); }}
                placeholder="8자 이상, 영문·숫자 포함"
                secureTextEntry={!showSignupPw}
                rightIcon={showSignupPw ? 'eye-off-outline' : 'eye-outline'}
                onRightIconPress={() => setShowSignupPw(!showSignupPw)}
                error={pwError}
              />

              {/* 비밀번호 확인 */}
              <InputField
                label="비밀번호 확인"
                icon="lock-closed-outline"
                value={signupPasswordConfirm}
                onChangeText={(t) => { setSignupPasswordConfirm(t); setPwConfirmError(''); }}
                placeholder="비밀번호를 한 번 더 입력해주세요"
                secureTextEntry={!showSignupPwConfirm}
                rightIcon={showSignupPwConfirm ? 'eye-off-outline' : 'eye-outline'}
                onRightIconPress={() => setShowSignupPwConfirm(!showSignupPwConfirm)}
                error={pwConfirmError}
                success={signupPasswordConfirm.length > 0 && signupPassword === signupPasswordConfirm}
              />

              <View style={styles.pwHint}>
                <Text style={styles.pwHintText}>· 8자 이상  · 영문 포함  · 숫자 포함</Text>
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, (isLoading || emailAvailable === false) && styles.submitBtnLoading]}
                onPress={handleSignup}
                disabled={isLoading || emailAvailable === false}
                activeOpacity={0.85}
              >
                {isLoading
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={styles.submitBtnText}>가입하기</Text>
                }
              </TouchableOpacity>
            </View>
          )}

          {/* Footer */}
          {mode !== 'signup' && (
            <View style={styles.footer}>
              <Text style={styles.footerText}>처음 방문하셨나요?</Text>
              <TouchableOpacity onPress={() => { setMode('signup'); resetSignupForm(); }}>
                <Text style={styles.signupLink}>회원가입</Text>
              </TouchableOpacity>
            </View>
          )}

          {mode === 'signup' && (
            <View style={styles.footer}>
              <Text style={styles.footerText}>이미 계정이 있으신가요?</Text>
              <TouchableOpacity onPress={() => { setMode('email'); resetSignupForm(); }}>
                <Text style={styles.signupLink}>로그인</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.terms}>
            가입 시 <Text style={styles.termsLink}>이용약관</Text> 및{' '}
            <Text style={styles.termsLink}>개인정보처리방침</Text>에 동의하게 됩니다
          </Text>
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
          <View style={styles.emojiSheetHandle} />
          <Text style={styles.emojiSheetTitle}>이모지 선택</Text>
          <View style={styles.emojiGrid}>
            {PROFILE_EMOJIS.map((e) => (
              <TouchableOpacity
                key={e}
                style={[styles.emojiItem, profileEmoji === e && !profileImageUri && styles.emojiItemSelected]}
                onPress={() => { setProfileEmoji(e); setProfileImageUri(null); setEmojiPickerVisible(false); }}
              >
                <Text style={{ fontSize: 32 }}>{e}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

function InputField({
  label, icon, value, onChangeText, placeholder,
  secureTextEntry, rightIcon, onRightIconPress,
  keyboardType, error, success,
}: {
  label: string; icon: string; value: string;
  onChangeText: (t: string) => void; placeholder: string;
  secureTextEntry?: boolean; rightIcon?: string;
  onRightIconPress?: () => void; keyboardType?: any;
  error?: string; success?: boolean;
}) {
  const borderColor = error ? Colors.error : success ? Colors.primary : Colors.border;
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[styles.inputWrapper, { borderColor }]}>
        <Ionicons name={icon as any} size={18} color={Colors.textMuted} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize="none"
        />
        {success && !rightIcon && <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />}
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress}>
            <Ionicons name={rightIcon as any} size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>
      {!!error && <Text style={styles.fieldError}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  safeArea: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.xl },
  hero: {
    alignItems: 'center',
    paddingTop: H * 0.07,
    paddingBottom: Spacing.xxl,
    gap: 12,
  },
  logoCircle: {
    width: 96, height: 96, borderRadius: 28,
    backgroundColor: Colors.primaryPale,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4, ...Shadow.md,
  },
  logoEmoji: { fontSize: 48 },
  appName: { fontSize: FontSize.xxxl, fontWeight: FontWeight.bold, color: Colors.primary, letterSpacing: -0.5 },
  heroSub: { fontSize: FontSize.sm, color: Colors.textSecondary },
  buttonsSection: { gap: Spacing.md },
  kakaoBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, backgroundColor: '#FEE500',
    paddingVertical: 16, borderRadius: Radius.xl, ...Shadow.sm,
  },
  kakaoIcon: { fontSize: 20 },
  kakaoBtnText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#3A1D1D' },
  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, backgroundColor: Colors.backgroundCard,
    paddingVertical: 16, borderRadius: Radius.xl,
    borderWidth: 1, borderColor: Colors.border, ...Shadow.sm,
  },
  googleG: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#4285F4', alignItems: 'center', justifyContent: 'center' },
  googleGText: { color: '#fff', fontSize: 14, fontWeight: FontWeight.bold },
  googleBtnText: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginVertical: Spacing.sm },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.borderLight },
  dividerText: { fontSize: FontSize.sm, color: Colors.textMuted },
  emailBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, backgroundColor: Colors.backgroundCard,
    paddingVertical: 16, borderRadius: Radius.xl,
    borderWidth: 1, borderColor: Colors.border,
  },
  emailBtnText: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
  formSection: { gap: Spacing.lg },
  signupTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.xs },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.xs },
  backText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium },
  inputGroup: { gap: Spacing.sm },
  inputLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.backgroundCard, borderWidth: 1.5,
    borderColor: Colors.border, borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg, paddingVertical: 14,
  },
  inputWrapperFlex: { flex: 1 },
  inputWrapperSuccess: { borderColor: Colors.primary },
  inputWrapperError: { borderColor: Colors.error },
  input: { flex: 1, fontSize: FontSize.base, color: Colors.textPrimary, padding: 0 },
  emailCheckRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'stretch' },
  checkBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg, justifyContent: 'center', alignItems: 'center',
    minWidth: 80,
  },
  checkBtnText: { color: '#fff', fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  fieldError: { fontSize: FontSize.xs, color: Colors.error, marginTop: 2 },
  successText: { fontSize: FontSize.xs, color: Colors.primary, marginTop: 2 },
  pwHint: { backgroundColor: Colors.backgroundMuted, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  pwHintText: { fontSize: FontSize.xs, color: Colors.textMuted, lineHeight: 18 },
  submitBtn: {
    backgroundColor: Colors.primary, paddingVertical: 17,
    borderRadius: Radius.xl, alignItems: 'center', marginTop: Spacing.sm,
  },
  submitBtnLoading: { opacity: 0.7 },
  submitBtnText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff' },
  forgotBtn: { alignItems: 'center', paddingVertical: Spacing.sm },
  forgotText: { fontSize: FontSize.sm, color: Colors.textMuted },
  footer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, marginTop: Spacing.xxl, paddingBottom: Spacing.xl,
  },
  footerText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  signupLink: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.primary },
  terms: {
    textAlign: 'center', fontSize: FontSize.xs, color: Colors.textMuted,
    lineHeight: 18, paddingBottom: Spacing.xl,
  },
  termsLink: { color: Colors.primary, textDecorationLine: 'underline' },
  // Avatar section
  avatarSection: { alignItems: 'center', paddingVertical: Spacing.md, gap: Spacing.sm },
  avatarCircle: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: Colors.primaryPale, alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: Colors.primary + '44', position: 'relative',
  },
  avatarImageWrap: { width: 88, height: 88, borderRadius: 44, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  avatarEditBadge: {
    position: 'absolute', bottom: 2, right: 2, width: 24, height: 24, borderRadius: 12,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  avatarHint: { fontSize: FontSize.xs, color: Colors.textMuted },
  avatarActions: { flexDirection: 'row', gap: Spacing.md },
  avatarActionBtn: {
    backgroundColor: Colors.backgroundMuted, paddingHorizontal: Spacing.lg, paddingVertical: 8,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border,
  },
  avatarActionText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  // Emoji picker
  emojiBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  emojiSheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.backgroundCard, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  emojiSheetHandle: { width: 44, height: 5, backgroundColor: Colors.border, borderRadius: 3, alignSelf: 'center', marginTop: Spacing.md },
  emojiSheetTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, textAlign: 'center', paddingVertical: Spacing.lg },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.lg, gap: Spacing.md, justifyContent: 'center' },
  emojiItem: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.backgroundMuted },
  emojiItemSelected: { backgroundColor: Colors.primaryPale, borderWidth: 2, borderColor: Colors.primary },
});
