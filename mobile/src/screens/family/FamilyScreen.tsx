import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadow } from '@/theme';
import type { TabScreenProps } from '@/types/navigation';
import type { GroupType } from '@/types';
import GroupTabBar from '@/components/common/GroupTabBar';

const { width: W, height: H } = Dimensions.get('window');
type Props = TabScreenProps<'FamilyTab'>;

const GROUP_TABS: { type: GroupType; label: string; emoji: string }[] = [
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

const MEMBERS: Member[] = [
  { id: '1', name: '엄마',     role: '엄마',     emoji: '👩', group: 'ALL',      isOwner: true, bio: '민준이의 든든한 엄마 🌸', posts: 24, comments: 18, reactions: 42 },
  { id: '2', name: '아빠',     role: '아빠',     emoji: '👨', group: 'ALL',      bio: '주말엔 민준이랑 공원 산책 🚴', posts: 6,  comments: 11, reactions: 31 },
  { id: '3', name: '외할머니', role: '외할머니', emoji: '👵', group: 'MATERNAL', bio: '손주 사진 기다리는 중 ❤️',       posts: 1,  comments: 28, reactions: 56 },
  { id: '4', name: '외할아버지',role: '외할아버지',emoji: '👴',group: 'MATERNAL',                                        posts: 0,  comments: 7,  reactions: 22 },
  { id: '5', name: '할머니',   role: '시어머니', emoji: '👵', group: 'PATERNAL', bio: '민준이 보고 싶어요 😊',          posts: 0,  comments: 14, reactions: 38 },
  { id: '6', name: '할아버지', role: '시아버지', emoji: '👴', group: 'PATERNAL',                                        posts: 0,  comments: 4,  reactions: 19 },
];

// 멤버별 최근 활동 목업 데이터
const MEMBER_ACTIVITY: Record<string, { type: 'post' | 'comment' | 'reaction'; text: string; time: string }[]> = {
  '1': [
    { type: 'post',     text: '어린이집 물감놀이 사진을 공유했어요 🎨',     time: '오늘' },
    { type: 'comment',  text: '오늘도 민준이가 너무 귀여워요 💕',            time: '1시간 전' },
    { type: 'reaction', text: '할머니 사진에 ❤️ 반응을 남겼어요',            time: '3시간 전' },
    { type: 'post',     text: '수영 첫 도전 사진을 공유했어요 🏊',           time: '어제' },
  ],
  '2': [
    { type: 'comment',  text: '오늘 씩씩하게 잘 다녀왔네! 💪',              time: '5시간 전' },
    { type: 'reaction', text: '엄마 사진에 😊 반응을 남겼어요',              time: '어제' },
    { type: 'comment',  text: '우리 아들 최고야 🎉',                         time: '2일 전' },
  ],
  '3': [
    { type: 'comment',  text: '오늘 물감놀이 너무 즐거웠겠다 ❤️',           time: '10분 전' },
    { type: 'reaction', text: '엄마 사진에 ❤️ 반응을 남겼어요',              time: '2시간 전' },
    { type: 'comment',  text: '우리 민준이 잘했어요~ 더 많이 찍어줘요~',     time: '어제' },
    { type: 'reaction', text: '아빠 사진에 👏 반응을 남겼어요',              time: '어제' },
  ],
  '4': [{ type: 'comment', text: '민준이 보고 싶다 😊', time: '3일 전' }],
  '5': [
    { type: 'comment',  text: '손자 너무 예뻐요 ❤️',                         time: '어제' },
    { type: 'reaction', text: '엄마 사진에 ❤️ 반응을 남겼어요',              time: '2일 전' },
  ],
  '6': [{ type: 'comment', text: '우리 손자 최고!', time: '2시간 전' }],
};

export default function FamilyScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<GroupType>('ALL');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const filteredMembers = activeTab === 'ALL'
    ? MEMBERS
    : MEMBERS.filter((m) => m.group === activeTab || m.group === 'ALL');

  // 해당 그룹 멤버들의 실제 활동 합산
  const groupComments  = filteredMembers.reduce((s, m) => s + m.comments,  0);
  const groupReactions = filteredMembers.reduce((s, m) => s + m.reactions, 0);

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
          <GroupTabBar tabs={GROUP_TABS} active={activeTab} onChange={setActiveTab} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* ─── 그룹 요약 카드 (실제 활동 기반) ─── */}
          <View style={[styles.summaryCard, { backgroundColor: groupConfig.bg }]}>
            <View style={styles.summaryLeft}>
              <Text style={[styles.summaryTitle, { color: groupConfig.color }]}>{groupConfig.label}</Text>
              <Text style={styles.summarySub}>
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
              data={MEMBER_ACTIVITY[selectedMember.id] ?? []}
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
  summaryTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
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
});
