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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackScreenProps } from '@/types/navigation';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadow } from '@/theme';
import { useAuthStore } from '@/store/authStore';

const { height: H } = Dimensions.get('window');

type Props = RootStackScreenProps<'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [mode, setMode] = useState<'main' | 'email' | 'signup'>('main');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
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
      await new Promise((r) => setTimeout(r, 800)); // mock
      setAuth({ id: '1', email, name: name || '사용자', provider: 'EMAIL', createdAt: new Date().toISOString() }, 'mock-token');
      navigation.replace('FamilyGroupSetup');
    } catch {
      Alert.alert('로그인 실패', '이메일 또는 비밀번호를 확인해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scroll} bounces={false} keyboardShouldPersistTaps="handled">

          {/* Hero section */}
          <View style={styles.hero}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🏠</Text>
            </View>
            <Text style={styles.appName}>오늘의가족</Text>
            <Text style={styles.heroSub}>소중한 순간을 가족과 함께해요</Text>
          </View>

          {mode === 'main' && (
            <View style={styles.buttonsSection}>
              {/* Kakao */}
              <TouchableOpacity
                style={styles.kakaoBtn}
                onPress={() => handleSocialLogin('KAKAO')}
                activeOpacity={0.85}
              >
                <Text style={styles.kakaoIcon}>💬</Text>
                <Text style={styles.kakaoBtnText}>카카오로 시작하기</Text>
              </TouchableOpacity>

              {/* Google */}
              <TouchableOpacity
                style={styles.googleBtn}
                onPress={() => handleSocialLogin('GOOGLE')}
                activeOpacity={0.85}
              >
                <View style={styles.googleG}>
                  <Text style={styles.googleGText}>G</Text>
                </View>
                <Text style={styles.googleBtnText}>Google로 시작하기</Text>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>또는</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Email */}
              <TouchableOpacity
                style={styles.emailBtn}
                onPress={() => setMode('email')}
                activeOpacity={0.85}
              >
                <Ionicons name="mail-outline" size={20} color={Colors.textSecondary} />
                <Text style={styles.emailBtnText}>이메일로 로그인</Text>
              </TouchableOpacity>
            </View>
          )}

          {mode === 'email' && (
            <View style={styles.formSection}>
              <TouchableOpacity style={styles.backRow} onPress={() => setMode('main')}>
                <Ionicons name="arrow-back" size={18} color={Colors.primary} />
                <Text style={styles.backText}>다른 방법으로 로그인</Text>
              </TouchableOpacity>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>이메일</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={18} color={Colors.textMuted} />
                  <TextInput
                    style={styles.input}
                    placeholder="이메일 주소를 입력해주세요"
                    placeholderTextColor={Colors.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>비밀번호</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} />
                  <TextInput
                    style={styles.input}
                    placeholder="비밀번호를 입력해주세요"
                    placeholderTextColor={Colors.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPw}
                  />
                  <TouchableOpacity onPress={() => setShowPw(!showPw)}>
                    <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, isLoading && styles.submitBtnLoading]}
                onPress={handleEmailLogin}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading
                  ? <Text style={styles.submitBtnText}>로그인 중...</Text>
                  : <Text style={styles.submitBtnText}>로그인</Text>
                }
              </TouchableOpacity>

              <TouchableOpacity style={styles.forgotBtn}>
                <Text style={styles.forgotText}>비밀번호를 잊으셨나요?</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>처음 방문하셨나요?</Text>
            <TouchableOpacity onPress={() => setMode('email')}>
              <Text style={styles.signupLink}>회원가입</Text>
            </TouchableOpacity>
          </View>

          {/* Terms */}
          <Text style={styles.terms}>
            로그인 시 <Text style={styles.termsLink}>이용약관</Text> 및{' '}
            <Text style={styles.termsLink}>개인정보처리방침</Text>에 동의하게 됩니다
          </Text>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  safeArea: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.xl },
  hero: {
    alignItems: 'center',
    paddingTop: H * 0.08,
    paddingBottom: Spacing.xxxl,
    gap: 12,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: Colors.primaryPale,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    ...Shadow.md,
  },
  logoEmoji: { fontSize: 48 },
  appName: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  heroSub: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  buttonsSection: { gap: Spacing.md },
  kakaoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: '#FEE500',
    paddingVertical: 16,
    borderRadius: Radius.xl,
    ...Shadow.sm,
  },
  kakaoIcon: { fontSize: 20 },
  kakaoBtnText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: '#3A1D1D',
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.backgroundCard,
    paddingVertical: 16,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  googleG: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleGText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: FontWeight.bold,
  },
  googleBtnText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginVertical: Spacing.sm,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.borderLight },
  dividerText: { fontSize: FontSize.sm, color: Colors.textMuted },
  emailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.backgroundCard,
    paddingVertical: 16,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emailBtnText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },
  formSection: { gap: Spacing.lg },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  backText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.medium,
  },
  inputGroup: { gap: Spacing.sm },
  inputLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
  },
  input: {
    flex: 1,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    padding: 0,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 17,
    borderRadius: Radius.xl,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  submitBtnLoading: { opacity: 0.7 },
  submitBtnText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: '#fff',
  },
  forgotBtn: { alignItems: 'center', paddingVertical: Spacing.sm },
  forgotText: { fontSize: FontSize.sm, color: Colors.textMuted },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xxxl,
    paddingBottom: Spacing.xl,
  },
  footerText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  signupLink: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  terms: {
    textAlign: 'center',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    lineHeight: 18,
    paddingBottom: Spacing.xl,
  },
  termsLink: { color: Colors.primary, textDecorationLine: 'underline' },
});
