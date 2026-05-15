import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Modal,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadow } from '@/theme';
import type { TabScreenProps } from '@/types/navigation';
import type { GroupType } from '@/types';
import GroupTabBar from '@/components/common/GroupTabBar';
import api from '@/api/client';
import { useAuthStore } from '@/store/authStore';
import { useFamilyStore } from '@/store/familyStore';

const { width: W, height: H } = Dimensions.get('window');
type Props = TabScreenProps<'FamilyTab'>;

const GROUP_EMOJI_OPTIONS = [
  '👩‍👧', '👨‍👩‍👧', '👵', '👴', '🏠', '🌸', '🌿', '🍀',
  '💐', '🎋', '🏡', '🌻', '🌷', '🎎', '🎍', '🍵',
  '🧧', '🎑', '🫖', '🌾', '🎐', '🌙', '⛩️', '🏮',
];

type GroupTabItem = { type: GroupType; label: string; emoji: string; imageUri?: string };

const DEFAULT_GROUP_TABS: GroupTabItem[] = [
  { type: 'ALL',      label: '전체', emoji: '👨‍👩‍👧‍👦' },
  { type: 'MATERNAL', label: '친정', emoji: '👩‍👧' },
  { type: 'PATERNAL', label: '시댁', emoji: '👴'  },
];

interface Member {
  id: string; name: string; role: string; emoji: string;
  group: GroupType; isOwner?: boolean;
  bio?: string;
  posts: number; comments: number; reactions: number;
}

export default function FamilyScreen({ navigation }: Props) {
  const user = useAuthStore((s) => s.user);
  const family = useFamilyStore((s) => s.family);
  const fetchFamily = useFamilyStore((s) => s.fetchFamily);

  const [activeTab, setActiveTab] = useState<GroupType>('ALL');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [groupTabs, setGroupTabs] = useState<GroupTabItem[]>(DEFAULT_GROUP_TABS);
  const [editingGroup, setEditingGroup] = useState<GroupType | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const myId = user?.id ?? '';
  const familyId = user?.familyId ?? family?.id;
  const isOwner = family?.ownerId === myId;

  const loadFamily = useCallback(async () => {
    if (!familyId) return;
    setIsLoading(true);
    try {
      await fetchFamily(familyId);
      const f = useFamilyStore.getState().family;
      if (!f) return;
      const GROUP_MAP: Record<string, GroupType> = {};
      f.groups.forEach((g) => { GROUP_MAP[g.id] = g.type as GroupType; });
      const mapped: Member[] = f.members.map((m: any) => ({
        id: m.userId,
        name: m.user?.name ?? '?',
        role: m.role ?? '멤버',
        emoji: m.user?.profileImage ?? '👤',
        group: 'ALL' as GroupType,
        isOwner: m.userId === f.ownerId,
        bio: undefined,
        posts: 0,
        comments: 0,
        reactions: 0,
      }));
      setMembers(mapped);
    } catch {
      setMembers([]);
    } finally {
      setIsLoading(false);
    }
  }, [familyId]);

  useEffect(() => { loadFamily(); }, [loadFamily]);

  /** 갤러리에서 사진 선택 → 200×200으로 리사이즈 + 품질 0.7 압축 → imageUri 저장 */
  const handlePickGroupPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (result.canceled || !result.assets[0]) return;

    const compressed = await ImageManipulator.manipulateAsync(
      result.assets[0].uri,
      [{ resize: { width: 200, height: 200 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );

    if (!editingGroup) return;
    setGroupTabs((prev) =>
      prev.map((t) =>
        t.type === editingGroup ? { ...t, imageUri: compressed.uri, emoji: '' } : t
      )
    );
    setEditingGroup(null);
  };

  const filteredMembers = activeTab === 'ALL'
    ? members
    : members.filter((m) => m.group === activeTab || m.group === 'ALL');

  const groupComments  = filteredMembers.reduce((s, m) => s + m.comments,  0);
  const groupReactions = filteredMembers.reduce((s, m) => s + m.reactions, 0);

  const currentTab = groupTabs.find((t) => t.type === activeTab);
  const currentTabEmoji = currentTab?.emoji ?? '';
  const currentTabImageUri = currentTab?.imageUri;

  const groupConfig = {
    ALL:      { label: '전체 가족',  color: Colors.primary, bg: Colors.primaryPale },
    MATERNAL: { label: '친정',       color: '#C4693A',       bg: '#FBE8DC'          },
    PATERNAL: { label: '시댁',       color: '#3A6CB5',       bg: '#DCE8FB'          },
  }[activeTab];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* ─── Header ─── */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>가족</Text>
          {isLoading && <ActivityIndicator size="small" color={Colors.primary} style={{ marginRight: Spacing.md }} />}
          <TouchableOpacity
            style={[styles.inviteBtn, { backgroundColor: groupConfig.bg }]}
            onPress={() => navigation.navigate('FamilyInvite', { groupType: activeTab })}
          >
            <Ionicons name="person-add-outline" size={16} color={groupConfig.color} />
            <Text style={[styles.inviteBtnText, { color: groupConfig.color }]}>가족 초대</Text>
          </TouchableOpacity>
        </View>

        {/* ─── Group Tabs ─── */}
        <View style={styles.tabsRow}>
          <GroupTabBar tabs={groupTabs} active={activeTab} onChange={setActiveTab} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* ─── 그룹 요약 카드 ─── */}
          <View style={[styles.summaryCard, { backgroundColor: groupConfig.bg }]}>
            <View style={styles.summaryLeft}>
              <View style={styles.summaryTitleRow}>
                <View style={styles.summaryIconWrap}>
                  {currentTabImageUri ? (
                    <Image source={{ uri: currentTabImageUri }} style={styles.summaryIconImage} />
                  ) : (
                    <Text style={{ fontSize: 22 }}>{currentTabEmoji}</Text>
                  )}
                </View>
                <Text style={[styles.summaryTitle, { color: groupConfig.color }]}>
                  {groupConfig.label}
                </Text>
                {/* 친정·시댁만 편집 가능, 그룹 생성자(오너)만 */}
                {isOwner && activeTab !== 'ALL' && (
                  <TouchableOpacity
                    style={[styles.editGroupIconBtn, { borderColor: groupConfig.color + '44' }]}
                    onPress={() => setEditingGroup(activeTab)}
                  >
                    <Ionicons name="pencil-outline" size={13} color={groupConfig.color} />
                    <Text style={[styles.editGroupIconText, { color: groupConfig.color }]}>아이콘 변경</Text>
                  </TouchableOpacity>
                )}
              </View>              <Text style={styles.summarySub}>
                댓글 {groupComments}개 · 반응 {groupReactions}개
              </Text>
            </View>
            <View style={styles.memberStack}>
              {filteredMembers.slice(0, 3).map((m, i) => (
                <View key={m.id} style={[styles.stackAvatar, { marginLeft: i === 0 ? 0 : -10, zIndex: 3 - i }]}>
                  <Text style={{ fontSize: 18 }}>{m.emoji}</Text>
                </View>
              ))}
              {filteredMembers.length > 3 && (
                <View style={[styles.stackAvatar, styles.stackMore, { marginLeft: -10 }]}>
                  <Text style={styles.stackMoreText}>+{filteredMembers.length - 3}</Text>
                </View>
              )}
            </View>
          </View>

          {/* ─── Members ─── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>멤버 {filteredMembers.length}명</Text>
              <Text style={styles.sectionHint}>아이콘을 탭하면 활동 내역을 볼 수 있어요</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.memberScroll}>
              {filteredMembers.map((m) => (
                <TouchableOpacity key={m.id} style={styles.memberChip} onPress={() => setSelectedMember(m)} activeOpacity={0.75}>
                  <View style={[styles.memberAvatar, { borderColor: m.isOwner ? groupConfig.color : 'transparent' }]}>
                    <Text style={{ fontSize: 22 }}>{m.emoji}</Text>
                    {m.isOwner && (
                      <View style={styles.crownBadge}><Text style={{ fontSize: 9 }}>👑</Text></View>
                    )}
                  </View>
                  <Text style={styles.memberName}>{m.name}</Text>
                  <Text style={styles.memberRole}>{m.role}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.memberChip}
                onPress={() => navigation.navigate('FamilyInvite', { groupType: activeTab })}
              >
                <View style={styles.addMemberAvatar}>
                  <Ionicons name="add" size={22} color={Colors.primary} />
                </View>
                <Text style={styles.memberName}>초대</Text>
                <Text style={styles.memberRole}>새 멤버</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* ─── 멤버 활동 내역 바텀시트 ─── */}
      <Modal
        visible={!!selectedMember}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedMember(null)}
      >
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setSelectedMember(null)} />
        {selectedMember && (
          <View style={styles.sheet}>
            {/* 핸들 */}
            <View style={styles.sheetHandle} />

            {/* 멤버 헤더 */}
            <View style={styles.sheetHeader}>
              <View style={styles.sheetAvatar}>
                <Text style={{ fontSize: 28 }}>{selectedMember.emoji}</Text>
              </View>
              <View style={styles.sheetMemberInfo}>
                <Text style={styles.sheetName}>{selectedMember.name}</Text>
                <Text style={styles.sheetRole}>{selectedMember.role}</Text>
                {selectedMember.bio ? (
                  <Text style={styles.sheetBio}>{selectedMember.bio}</Text>
                ) : null}
              </View>
              <TouchableOpacity style={styles.sheetClose} onPress={() => setSelectedMember(null)}>
                <Ionicons name="close" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* 활동 통계 */}
            <View style={styles.sheetStats}>
              <View style={styles.sheetStat}>
                <Text style={styles.sheetStatValue}>{selectedMember.posts}</Text>
                <Text style={styles.sheetStatLabel}>게시글</Text>
              </View>
              <View style={styles.sheetStatDivider} />
              <View style={styles.sheetStat}>
                <Text style={styles.sheetStatValue}>{selectedMember.comments}</Text>
                <Text style={styles.sheetStatLabel}>댓글</Text>
              </View>
              <View style={styles.sheetStatDivider} />
              <View style={styles.sheetStat}>
                <Text style={styles.sheetStatValue}>{selectedMember.reactions}</Text>
                <Text style={styles.sheetStatLabel}>반응</Text>
              </View>
            </View>

            {/* 최근 활동 목록 */}
            <Text style={styles.sheetSectionTitle}>최근 활동</Text>
            <FlatList
              data={[]} // 실제 활동 이력 API 연동 예정
              keyExtractor={(_, i) => String(i)}
              style={styles.sheetList}
              contentContainerStyle={{ paddingBottom: 32 }}
              ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: Colors.borderLight, marginLeft: 44 }} />}
              renderItem={({ item }) => (
                <View style={styles.activityRow}>
                  <View style={styles.activityIcon}>
                    <Text style={{ fontSize: 16 }}>
                      {item.type === 'post' ? '📸' : item.type === 'comment' ? '💬' : '❤️'}
                    </Text>
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityText}>{item.text}</Text>
                    <Text style={styles.activityTime}>{item.time}</Text>
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.sheetEmpty}>
                  <Text style={styles.sheetEmptyText}>아직 활동 내역이 없어요</Text>
                </View>
              }
            />
          </View>
        )}
      </Modal>

      {/* ─── 그룹 아이콘 편집 모달 (생성자 전용) ─── */}
      <Modal
        visible={!!editingGroup}
        transparent
        animationType="slide"
        onRequestClose={() => setEditingGroup(null)}
      >
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setEditingGroup(null)} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <View style={styles.sheetAvatar}>
              {groupTabs.find((t) => t.type === editingGroup)?.imageUri ? (
                <Image
                  source={{ uri: groupTabs.find((t) => t.type === editingGroup)!.imageUri }}
                  style={{ width: 48, height: 48, borderRadius: 24 }}
                />
              ) : (
                <Text style={{ fontSize: 28 }}>
                  {groupTabs.find((t) => t.type === editingGroup)?.emoji}
                </Text>
              )}
            </View>
            <View style={styles.sheetMemberInfo}>
              <Text style={styles.sheetName}>
                {editingGroup === 'MATERNAL' ? '친정' : '시댁'} 그룹 아이콘 변경
              </Text>
              <Text style={styles.sheetRole}>그룹 생성자만 변경할 수 있어요</Text>
            </View>
            <TouchableOpacity style={styles.sheetClose} onPress={() => setEditingGroup(null)}>
              <Ionicons name="close" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* 사진 선택 버튼 */}
          <TouchableOpacity style={styles.photoPickBtn} onPress={handlePickGroupPhoto} activeOpacity={0.8}>
            <Ionicons name="image-outline" size={20} color={Colors.primary} />
            <Text style={styles.photoPickBtnText}>갤러리에서 사진 선택</Text>
            <Text style={styles.photoPickBtnHint}>· 200×200 자동 압축</Text>
          </TouchableOpacity>

          <View style={styles.emojiSectionLabel}>
            <Text style={styles.emojiSectionLabelText}>또는 이모지 선택</Text>
          </View>
          <View style={styles.emojiGrid}>
            {GROUP_EMOJI_OPTIONS.map((e) => {
              const isSelected = groupTabs.find((t) => t.type === editingGroup)?.emoji === e;
              return (
                <TouchableOpacity
                  key={e}
                  style={[styles.emojiItem, isSelected && styles.emojiItemSelected]}
                  onPress={() => {
                    if (!editingGroup) return;
                    setGroupTabs((prev) => prev.map((t) => t.type === editingGroup ? { ...t, emoji: e, imageUri: undefined } : t));
                    setEditingGroup(null);
                  }}
                >
                  <Text style={{ fontSize: 28 }}>{e}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, paddingBottom: Spacing.sm,
  },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  inviteBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, paddingHorizontal: Spacing.lg, paddingVertical: 7, borderRadius: Radius.full },
  inviteBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  tabsRow: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.md },
  scroll: { paddingBottom: 100 },
  summaryCard: {
    marginHorizontal: Spacing.xl, borderRadius: Radius.xl, padding: Spacing.xl,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xl,
  },
  summaryLeft: { flex: 1 },
  summaryTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap' },
  summaryIconWrap: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  summaryIconImage: { width: 32, height: 32, borderRadius: 16 },
  summaryTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  editGroupIconBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1, borderRadius: Radius.full,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  editGroupIconText: { fontSize: 10, fontWeight: FontWeight.bold },
  summarySub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 4 },
  memberStack: { flexDirection: 'row', alignItems: 'center' },
  stackAvatar: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.backgroundCard,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.backgroundCard,
  },
  stackMore: { backgroundColor: Colors.backgroundCard },
  stackMoreText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.textSecondary },
  section: { marginBottom: Spacing.xl },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.xl, marginBottom: Spacing.md,
  },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  sectionHint: { fontSize: FontSize.xs, color: Colors.textMuted },
  memberScroll: { paddingHorizontal: Spacing.xl, gap: Spacing.lg },
  memberChip: { alignItems: 'center', gap: 6, width: 68 },
  memberAvatar: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primaryPale,
    alignItems: 'center', justifyContent: 'center', position: 'relative',
    borderWidth: 2,
  },
  crownBadge: {
    position: 'absolute', top: -4, right: -4, width: 18, height: 18,
    borderRadius: 9, backgroundColor: Colors.backgroundCard, alignItems: 'center', justifyContent: 'center',
  },
  memberName: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary, textAlign: 'center' },
  memberRole: { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center' },
  addMemberAvatar: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.backgroundMuted,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.border, borderStyle: 'dashed',
  },
  // ── Bottom sheet ──────────────────────────────────────────────────────────
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.backgroundCard, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: H * 0.75, paddingBottom: 0,
  },
  sheetHandle: { width: 44, height: 5, backgroundColor: Colors.border, borderRadius: 3, alignSelf: 'center', marginTop: Spacing.md },
  sheetHeader: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  sheetAvatar: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.primaryPale,
    alignItems: 'center', justifyContent: 'center',
  },
  sheetMemberInfo: { flex: 1 },
  sheetName: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  sheetRole: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  sheetBio: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 4, fontStyle: 'italic' },
  sheetClose: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.backgroundMuted,
    alignItems: 'center', justifyContent: 'center',
  },
  sheetStats: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: Spacing.xl, marginHorizontal: Spacing.xl,
    backgroundColor: Colors.background, borderRadius: Radius.xl, marginTop: Spacing.lg,
  },
  sheetStat: { flex: 1, alignItems: 'center', gap: 4 },
  sheetStatValue: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  sheetStatLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  sheetStatDivider: { width: 1, height: 32, backgroundColor: Colors.borderLight },
  sheetSectionTitle: {
    fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textSecondary,
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: Spacing.md,
  },
  sheetList: { flexGrow: 0 },
  activityRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md },
  activityIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.backgroundMuted, alignItems: 'center', justifyContent: 'center' },
  activityContent: { flex: 1 },
  activityText: { fontSize: FontSize.sm, color: Colors.textPrimary, lineHeight: 20 },
  activityTime: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  sheetEmpty: { alignItems: 'center', paddingVertical: Spacing.xxxl },
  sheetEmptyText: { fontSize: FontSize.sm, color: Colors.textMuted },
  // 그룹 아이콘 편집 모달
  photoPickBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    marginHorizontal: Spacing.lg, marginTop: Spacing.lg,
    backgroundColor: Colors.primaryPale, borderRadius: Radius.xl,
    paddingVertical: 13, paddingHorizontal: Spacing.xl,
  },
  photoPickBtnText: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.primary, flex: 1 },
  photoPickBtnHint: { fontSize: FontSize.xs, color: Colors.primary + 'AA' },
  emojiSectionLabel: {
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: Spacing.sm,
  },
  emojiSectionLabelText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.lg, gap: Spacing.md, justifyContent: 'center', paddingBottom: 40 },
  emojiItem: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.backgroundMuted },
  emojiItemSelected: { backgroundColor: Colors.primaryPale, borderWidth: 2, borderColor: Colors.primary },
});
