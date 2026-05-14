import {
  Injectable, NotFoundException, ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateFamilyDto, UpdateFamilyDto } from './dto/family.dto';
import { GroupType } from '@prisma/client';

@Injectable()
export class FamiliesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateFamilyDto) {
    const family = await this.prisma.family.create({
      data: {
        name: dto.name,
        ownerId: userId,
        // Auto-create 3 default groups
        groups: {
          create: [
            { type: GroupType.ALL,      name: '전체 가족 앨범' },
            { type: GroupType.MATERNAL, name: '친정 앨범'      },
            { type: GroupType.PATERNAL, name: '시댁 앨범'      },
          ],
        },
        // Add owner as first member
        members: {
          create: [{ userId, role: '관리자' }],
        },
      },
      include: { groups: true, members: { include: { user: { select: { id: true, name: true, profileImage: true } } } } },
    });
    return family;
  }

  async findOne(familyId: string, userId: string) {
    await this.assertMember(familyId, userId);
    return this.prisma.family.findUnique({
      where: { id: familyId },
      include: {
        groups: true,
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, profileImage: true } },
          },
        },
        children: true,
      },
    });
  }

  async update(familyId: string, userId: string, dto: UpdateFamilyDto) {
    await this.assertOwner(familyId, userId);
    return this.prisma.family.update({ where: { id: familyId }, data: { name: dto.name } });
  }

  async remove(familyId: string, userId: string) {
    await this.assertOwner(familyId, userId);
    await this.prisma.family.delete({ where: { id: familyId } });
    return { success: true };
  }

  // ── Guards ─────────────────────────────────────────────────────────────────

  async assertMember(familyId: string, userId: string) {
    const member = await this.prisma.familyMember.findUnique({
      where: { familyId_userId: { familyId, userId } },
    });
    if (!member) throw new ForbiddenException('가족 구성원이 아닙니다.');
  }

  async assertOwner(familyId: string, userId: string) {
    const family = await this.prisma.family.findUnique({ where: { id: familyId } });
    if (!family) throw new NotFoundException('가족을 찾을 수 없습니다.');
    if (family.ownerId !== userId) throw new ForbiddenException('권한이 없습니다.');
  }
}
