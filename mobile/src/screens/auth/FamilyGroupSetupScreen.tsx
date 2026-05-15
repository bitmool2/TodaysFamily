import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackScreenProps } from '@/types/navigation';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadow } from '@/theme';
import type { GroupType } from '@/types';
import { useFamilyStore } from '@/store/familyStore';
import { useAuthStore } from '@/store/authStore';

type Props = RootStackScreenProps<'FamilyGroupSetup'>;

interface GroupCard {
  type: GroupType;
  label: string;
  description: string;
  detail: string;
  emoji: string;
  color: string;
  bg: string;
  members: string[];
}

const CARDS: GroupCard[] = [
  {
    type: 'ALL',
    label: '전체',
    description: '모든 가족과 공유',
    detail: '친정·시댁 모두 함께 볼 수 있는 공유 앨범이에요',
    emoji: '👨‍👩‍👧‍👦',
    color: Colors.primary,
    bg: Colors.primaryPale,
    members: ['👩', '👨', '👵', '👴'],
  },
  {
    type: 'MATERNAL',
    label: '친정',
    description: '친정 가족과만 공유',
    detail: '엄마 쪽 가족만 볼 수 있는 비공개 앨범이에요',
    emoji: '👩‍👧',
    color: '#C4693A',
    bg: '#FBE8DC',
    members: ['👵', '👴', '👩'],
  },
  {
    type: 'PATERNAL',
    label: '시댁',
    description: '시댁 가족과만 공유',
    detail: '남편 쪽 가족만 볼 수 있는 비공개 앨범이에요',
    emoji: '👴',
    color: '#3A6CB5',
    bg: '#DCE8FB',
    members: ['👵', '👴', '👨'],
  },
];

export default function FamilyGroupSetupScreen({ navigation }: Props) {
  const [selected, setSelected] = useState<GroupType[]>(['ALL']);
  const [isCreating, setIsCreating] = useState(false);
  const createFamily = useFamilyStore((s) => s.createFamily);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const toggle = (type: GroupType) =>
    setSelected((prev) =>
      prev.includes(type) ? prev.filter((g) => g !== type) : [...prev, type]
    );

  const handleNext = async () => {
    if (!selected.length) return;
    setIsCreating(true);
    try {
      await createFamily(`${user?.name ?? '우리'}의 가족`);
      const family = useFamilyStore.getState().family;
      if (family && user) {
        setUser({ ...user, familyId: family.id });
      }
      navigation.replace('Main');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? '가족 그룹 생성에 실패했습니다.';
      Alert.alert('오류', msg);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Progress */}
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepText}>마지막 단계</Text>
            </View>
            <Text style={styles.title}>우리 가족 그룹 설정</Text>
            <Text style={styles.subtitle}>
              공유할 가족 그룹을 선택해주세요.{'\n'}
              나중에 설정에서 언제든지 변경할 수 있어요.
            </Text>
          </View>

          {/* Info — 카드 위에 위치 */}
          <View style={styles.infoBox}>
            <Ionicons name="bulb-outline" size={16} color={Colors.accent} />
            <Text style={styles.infoText}>
              여러 그룹을 동시에 선택할 수 있어요. 사진마다 공유 범위를 다르게 설정할 수 있답니다 😊
            </Text>
          </View>

          {/* Cards */}
          <View style={styles.cards}>
            {CARDS.map((card) => {
              const isSelected = selected.includes(card.type);
              return (
                <TouchableOpacity
                  key={card.type}
                  style={[
                    styles.card,
                    isSelected && { borderColor: card.color, borderWidth: 2 },
                  ]}
                  onPress={() => toggle(card.type)}
                  activeOpacity={0.85}
                >
                  {/* Top row */}
                  <View style={styles.cardTop}>
                    <View style={[styles.cardIconBg, { backgroundColor: card.bg }]}>
                      <Text style={styles.cardEmoji}>{card.emoji}</Text>
                    </View>

                    <View style={styles.cardMeta}>
                      <Text style={styles.cardLabel}>{card.label}</Text>
                      <Text style={styles.cardDesc}>{card.description}</Text>
                    </View>

                    <View style={[
                      styles.checkCircle,
                      isSelected && { backgroundColor: card.color, borderColor: card.color },
                    ]}>
                      {isSelected && <Ionicons name="checkmark" size={14} color="#fff" />}
                    </View>
                  </View>

                  {/* Detail */}
                  <View style={[styles.cardDetail, { backgroundColor: card.bg + '80' }]}>
                    <Ionicons name="people-outline" size={14} color={card.color} />
                    <Text style={[styles.cardDetailText, { color: card.color }]}>{card.detail}</Text>
                  </View>

                  {/* Member avatars */}
                  <View style={styles.memberAvatars}>
                    {card.members.map((m, i) => (
                      <View key={i} style={[styles.memberAvatar, { marginLeft: i === 0 ? 0 : -8 }]}>
                        <Text style={{ fontSize: 14 }}>{m}</Text>
                      </View>
                    ))}
                    <Text style={styles.inviteHint}>+ 초대 가능</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* CTA */}
        <View style={styles.footer}>
          <View style={styles.selectedInfo}>
            <Text style={styles.selectedInfoText}>
              {selected.length === 0
                ? '그룹을 선택해주세요'
                : `${selected.map((s) => CARDS.find((c) => c.type === s)?.label).join(', ')} 선택됨`}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.nextBtn, (!selected.length || isCreating) && styles.nextBtnDisabled]}
            onPress={handleNext}
            disabled={!selected.length || isCreating}
            activeOpacity={0.85}
          >
            {isCreating
              ? <ActivityIndicator color="#fff" size="small" />
              : <>
                  <Text style={styles.nextBtnText}>시작하기</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </>
            }
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  safeArea: { flex: 1 },
  scroll: { padding: Spacing.xl, paddingBottom: 20, gap: Spacing.xl },
  progressBar: {
    height: 4,
    backgroundColor: Colors.borderLight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  header: { gap: Spacing.md },
  stepBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryPale,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  stepText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  cards: { gap: Spacing.md },
  card: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    gap: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    ...Shadow.sm,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  cardIconBg: {
    width: 52,
    height: 52,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardEmoji: { fontSize: 26 },
  cardMeta: { flex: 1 },
  cardLabel: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  cardDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
  },
  cardDetailText: {
    fontSize: FontSize.xs,
    flex: 1,
    lineHeight: 16,
  },
  memberAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.backgroundMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.backgroundCard,
  },
  inviteHint: {
    marginLeft: Spacing.sm,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.accentLight,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
  },
  infoText: {
    flex: 1,
    fontSize: FontSize.xs,
    color: Colors.accent,
    lineHeight: 18,
  },
  footer: {
    padding: Spacing.xl,
    gap: Spacing.md,
    backgroundColor: Colors.backgroundCard,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  selectedInfo: {
    alignItems: 'center',
  },
  selectedInfoText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingVertical: 17,
    borderRadius: Radius.full,
  },
  nextBtnDisabled: { backgroundColor: Colors.textMuted },
  nextBtnText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: '#fff',
  },
});
