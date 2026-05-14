import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadow } from '@/theme';
import type { TabScreenProps } from '@/types/navigation';
import type { GroupType } from '@/types';
import GroupTabBar from '@/components/common/GroupTabBar';
import Avatar from '@/components/common/Avatar';

const { width: W } = Dimensions.get('window');

type Props = TabScreenProps<'FamilyTab'>;

const GROUP_TABS: { type: GroupType; label: string; emoji: string }[] = [
  { type: 'ALL',      label: '전체', emoji: '👨‍👩‍👧‍👦' },
  { type: 'MATERNAL', label: '친정', emoji: '👩‍👧' },
  { type: 'PATERNAL', label: '시댁', emoji: '👴'  },
];

const MEMBERS = [
  { id: '1', name: '엄마',    role: '엄마',    emoji: '👩', group: 'ALL'      as GroupType, isOwner: true },
  { id: '2', name: '아빠',    role: '아빠',    emoji: '👨', group: 'ALL'      as GroupType },
  { id: '3', name: '외할머니', role: '외할머니', emoji: '👵', group: 'MATERNAL' as GroupType },
  { id: '4', name: '외할아버지', role: '외할아버지', emoji: '👴', group: 'MATERNAL' as GroupType },
  { id: '5', name: '할머니',  role: '시어머니', emoji: '👵', group: 'PATERNAL' as GroupType },
  { id: '6', name: '할아버지', role: '시아버지', emoji: '👴', group: 'PATERNAL' as GroupType },
];

export default function FamilyScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<GroupType>('ALL');

  const filteredMembers =
    activeTab === 'ALL' ? MEMBERS : MEMBERS.filter((m) => m.group === activeTab || m.group === 'ALL');

  const groupConfig = {
    ALL:      { label: '전체 가족 앨범', color: Colors.primary,  bg: Colors.primaryPale },
    MATERNAL: { label: '친정 앨범',      color: '#C4693A',       bg: '#FBE8DC'          },
    PATERNAL: { label: '시댁 앨범',      color: '#3A6CB5',       bg: '#DCE8FB'          },
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
          {/* ─── Album summary card ─── */}
          <View style={[styles.albumCard, { backgroundColor: groupConfig.bg }]}>
            <View style={styles.albumCardLeft}>
              <Text style={[styles.albumCardTitle, { color: groupConfig.color }]}>{groupConfig.label}</Text>
              <Text style={styles.albumCardSub}>사진 {ALBUM_PHOTOS.length}장 · 댓글 24개 · 반응 58개</Text>
            </View>
            <View style={styles.albumMemberStack}>
              {filteredMembers.slice(0, 3).map((m, i) => (
                <View key={m.id} style={[styles.stackAvatar, { marginLeft: i === 0 ? 0 : -10, zIndex: 3 - i }]}>
                  <Text style={{ fontSize: 18 }}>{m.emoji}</Text>
                </View>
              ))}
              {filteredMembers.length > 3 && (
                <View style={[styles.stackAvatar, styles.stackAvatarMore, { marginLeft: -10 }]}>
                  <Text style={styles.stackAvatarMoreText}>+{filteredMembers.length - 3}</Text>
                </View>
              )}
            </View>
          </View>

          {/* ─── Members ─── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>멤버 {filteredMembers.length}명</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.memberScroll}
            >
              {filteredMembers.map((m) => (
                <View key={m.id} style={styles.memberChip}>
                  <View style={styles.memberChipAvatar}>
                    <Text style={{ fontSize: 22 }}>{m.emoji}</Text>
                    {m.isOwner && (
                      <View style={styles.crownBadge}>
                        <Text style={{ fontSize: 9 }}>👑</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.memberChipName}>{m.name}</Text>
                  <Text style={styles.memberChipRole}>{m.role}</Text>
                </View>
              ))}
              {/* Add member */}
              <TouchableOpacity
                style={styles.addMemberChip}
                onPress={() => navigation.navigate('FamilyInvite', { groupType: activeTab })}
              >
                <View style={styles.addMemberIcon}>
                  <Ionicons name="add" size={22} color={Colors.primary} />
                </View>
                <Text style={styles.memberChipName}>초대</Text>
                <Text style={styles.memberChipRole}>새 멤버</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  inviteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 7,
    borderRadius: Radius.full,
  },
  inviteBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  tabsRow: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  scroll: { paddingBottom: 100 },
  albumCard: {
    marginHorizontal: Spacing.xl,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  albumCardLeft: { flex: 1 },
  albumCardTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  albumCardSub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 4 },
  albumMemberStack: { flexDirection: 'row', alignItems: 'center' },
  stackAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.backgroundCard,
  },
  stackAvatarMore: { backgroundColor: Colors.backgroundCard },
  stackAvatarMoreText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.textSecondary },
  section: { marginBottom: Spacing.xl },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  seeAll: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semibold },
  memberScroll: { paddingHorizontal: Spacing.xl, gap: Spacing.lg },
  memberChip: { alignItems: 'center', gap: 6, width: 68 },
  memberChipAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryPale,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  crownBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberChipName: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary, textAlign: 'center' },
  memberChipRole: { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center' },
  addMemberChip: { alignItems: 'center', gap: 6, width: 68 },
  addMemberIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.backgroundMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
});
