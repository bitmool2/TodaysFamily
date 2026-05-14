import { PrismaClient, AuthProvider, GroupType, SourceType, ReactionType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── Users ──────────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('password123', 10);

  const mom = await prisma.user.upsert({
    where: { email: 'mom@todaysfamily.app' },
    update: {},
    create: {
      email: 'mom@todaysfamily.app',
      name: '엄마',
      provider: AuthProvider.EMAIL,
      passwordHash,
      profileImage: null,
    },
  });

  const dad = await prisma.user.upsert({
    where: { email: 'dad@todaysfamily.app' },
    update: {},
    create: {
      email: 'dad@todaysfamily.app',
      name: '아빠',
      provider: AuthProvider.EMAIL,
      passwordHash,
    },
  });

  const maternalGrandma = await prisma.user.upsert({
    where: { email: 'mgrandma@todaysfamily.app' },
    update: {},
    create: {
      email: 'mgrandma@todaysfamily.app',
      name: '외할머니',
      provider: AuthProvider.EMAIL,
      passwordHash,
    },
  });

  const paternalGrandma = await prisma.user.upsert({
    where: { email: 'pgrandma@todaysfamily.app' },
    update: {},
    create: {
      email: 'pgrandma@todaysfamily.app',
      name: '할머니',
      provider: AuthProvider.EMAIL,
      passwordHash,
    },
  });

  // ── Family ─────────────────────────────────────────────────────────────────
  const family = await prisma.family.upsert({
    where: { id: 'seed-family-001' },
    update: {},
    create: {
      id: 'seed-family-001',
      name: '민준이네 가족',
      ownerId: mom.id,
    },
  });

  // ── Groups ─────────────────────────────────────────────────────────────────
  const groupAll = await prisma.group.upsert({
    where: { familyId_type: { familyId: family.id, type: GroupType.ALL } },
    update: {},
    create: { familyId: family.id, type: GroupType.ALL, name: '전체 가족 앨범' },
  });

  const groupMaternal = await prisma.group.upsert({
    where: { familyId_type: { familyId: family.id, type: GroupType.MATERNAL } },
    update: {},
    create: { familyId: family.id, type: GroupType.MATERNAL, name: '친정 앨범' },
  });

  const groupPaternal = await prisma.group.upsert({
    where: { familyId_type: { familyId: family.id, type: GroupType.PATERNAL } },
    update: {},
    create: { familyId: family.id, type: GroupType.PATERNAL, name: '시댁 앨범' },
  });

  // ── FamilyMembers ──────────────────────────────────────────────────────────
  const memberData = [
    { userId: mom.id,            role: '엄마' },
    { userId: dad.id,            role: '아빠' },
    { userId: maternalGrandma.id, role: '외할머니' },
    { userId: paternalGrandma.id, role: '시어머니' },
  ];

  for (const m of memberData) {
    await prisma.familyMember.upsert({
      where: { familyId_userId: { familyId: family.id, userId: m.userId } },
      update: {},
      create: { familyId: family.id, userId: m.userId, role: m.role },
    });
  }

  // ── Child ──────────────────────────────────────────────────────────────────
  const child = await prisma.child.upsert({
    where: { id: 'seed-child-001' },
    update: {},
    create: {
      id: 'seed-child-001',
      familyId: family.id,
      name: '민준',
      birthDate: new Date('2022-03-15'),
    },
  });

  // ── Posts ──────────────────────────────────────────────────────────────────
  const postData = [
    {
      groupId: groupAll.id,
      caption: '오늘 어린이집에서 즐거운 물감놀이를 했어요 🎨 민준이가 처음으로 손바닥 도장을 찍었답니다!',
      source: SourceType.KIDSNOTE,
      imageUrl: 'https://picsum.photos/800/800?random=101',
      isAiCaption: true,
    },
    {
      groupId: groupMaternal.id,
      caption: '민준이가 처음으로 수영을 한 날이에요! 무서워하면서도 용감하게 도전했어요 🏊',
      source: SourceType.CAMERA,
      imageUrl: 'https://picsum.photos/800/800?random=102',
      isAiCaption: false,
    },
    {
      groupId: groupPaternal.id,
      caption: '공원에서 처음으로 자전거를 탄 날 ✨ 할머니께 보여드리고 싶었어요 🚲',
      source: SourceType.GALLERY,
      imageUrl: 'https://picsum.photos/800/800?random=103',
      isAiCaption: true,
    },
    {
      groupId: groupAll.id,
      caption: '어린이집 운동회날 🏅 달리기 1등 했어요! 온 가족이 응원해줘서 고마워요 ❤️',
      source: SourceType.KIDSNOTE,
      imageUrl: 'https://picsum.photos/800/800?random=104',
      isAiCaption: true,
    },
    {
      groupId: groupMaternal.id,
      caption: '외할머니 생신에 케이크 불 끄는 민준이 🎂 너무 신나했어요!',
      source: SourceType.CAMERA,
      imageUrl: 'https://picsum.photos/800/800?random=105',
      isAiCaption: false,
    },
  ];

  const createdPosts: { id: string }[] = [];
  for (const p of postData) {
    const post = await prisma.post.create({
      data: {
        familyId: family.id,
        groupId: p.groupId,
        authorId: mom.id,
        childId: child.id,
        imageUrl: p.imageUrl,
        caption: p.caption,
        source: p.source,
        isAiCaption: p.isAiCaption,
      },
    });
    createdPosts.push(post);
  }

  // ── Comments ───────────────────────────────────────────────────────────────
  if (createdPosts[0]) {
    await prisma.comment.createMany({
      data: [
        { postId: createdPosts[0].id, userId: maternalGrandma.id, content: '오늘 물감놀이 너무 즐거웠겠다 ❤️' },
        { postId: createdPosts[0].id, userId: dad.id,             content: '민준이 최고야! 😊' },
        { postId: createdPosts[0].id, userId: paternalGrandma.id, content: '우리 손자 잘했어요~' },
      ],
    });
  }

  // ── Reactions ──────────────────────────────────────────────────────────────
  if (createdPosts[0]) {
    await prisma.reaction.createMany({
      data: [
        { postId: createdPosts[0].id, userId: maternalGrandma.id, type: ReactionType.HEART },
        { postId: createdPosts[0].id, userId: dad.id,             type: ReactionType.CLAP  },
        { postId: createdPosts[0].id, userId: paternalGrandma.id, type: ReactionType.SMILE },
      ],
      skipDuplicates: true,
    });
  }

  console.log('✅ Seed complete!');
  console.log(`   Users   : ${await prisma.user.count()}`);
  console.log(`   Family  : ${await prisma.family.count()}`);
  console.log(`   Groups  : ${await prisma.group.count()}`);
  console.log(`   Posts   : ${await prisma.post.count()}`);
  console.log(`   Comments: ${await prisma.comment.count()}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
