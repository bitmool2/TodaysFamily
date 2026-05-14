import {
  Injectable, NotFoundException, BadRequestException, ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { GroupType, InviteStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { InviteMemberDto, AcceptInviteDto, UpdateMemberRoleDto } from './dto/family-member.dto';
import { FamiliesService } from '@/families/families.service';

@Injectable()
export class FamilyMembersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly familiesService: FamiliesService,
  ) {}

  async invite(userId: string, dto: InviteMemberDto) {
    await this.familiesService.assertMember(dto.familyId, userId);

    const token = uuidv4().replace(/-/g, '');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invite = await this.prisma.familyInvite.create({
      data: {
        familyId:  dto.familyId,
        senderId:  userId,
        token,
        role:      dto.role,
        groupType: dto.groupType ?? GroupType.ALL,
        expiresAt,
      },
    });

    const inviteLink = `https://todaysfamily.app/invite/${token}`;

    return {
      token,
      inviteLink,
      expiresAt,
      kakaoShareUrl: `https://todaysfamily.app/kakao-share?token=${token}`,
    };
  }

  async acceptInvite(userId: string, dto: AcceptInviteDto) {
    const invite = await this.prisma.familyInvite.findUnique({
      where: { token: dto.token },
    });

    if (!invite) throw new NotFoundException('초대 링크가 유효하지 않습니다.');
    if (invite.status !== InviteStatus.PENDING)
      throw new BadRequestException('이미 사용된 초대 링크입니다.');
    if (invite.expiresAt < new Date())
      throw new BadRequestException('초대 링크가 만료되었습니다.');

    const existing = await this.prisma.familyMember.findUnique({
      where: { familyId_userId: { familyId: invite.familyId, userId } },
    });
    if (existing) throw new ConflictException('이미 가족 구성원입니다.');

    const [, member] = await this.prisma.$transaction([
      this.prisma.familyInvite.update({
        where: { id: invite.id },
        data: { status: InviteStatus.ACCEPTED, acceptedAt: new Date() },
      }),
      this.prisma.familyMember.create({
        data: { familyId: invite.familyId, userId, role: invite.role },
        include: { family: true, user: { select: { id: true, name: true } } },
      }),
    ]);

    return member;
  }

  async findByFamily(familyId: string, userId: string) {
    await this.familiesService.assertMember(familyId, userId);
    return this.prisma.familyMember.findMany({
      where: { familyId },
      include: { user: { select: { id: true, name: true, email: true, profileImage: true } } },
    });
  }

  async updateRole(familyId: string, targetUserId: string, requesterId: string, dto: UpdateMemberRoleDto) {
    await this.familiesService.assertOwner(familyId, requesterId);
    return this.prisma.familyMember.update({
      where: { familyId_userId: { familyId, userId: targetUserId } },
      data: { role: dto.role },
    });
  }

  async remove(familyId: string, targetUserId: string, requesterId: string) {
    await this.familiesService.assertOwner(familyId, requesterId);
    await this.prisma.familyMember.delete({
      where: { familyId_userId: { familyId, userId: targetUserId } },
    });
    return { success: true };
  }
}
