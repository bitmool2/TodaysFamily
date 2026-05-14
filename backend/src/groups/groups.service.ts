import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { FamiliesService } from '@/families/families.service';
import { CreateGroupDto } from './dto/group.dto';

@Injectable()
export class GroupsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly familiesService: FamiliesService,
  ) {}

  async create(familyId: string, userId: string, dto: CreateGroupDto) {
    await this.familiesService.assertMember(familyId, userId);
    return this.prisma.group.create({ data: { familyId, ...dto } });
  }

  async findByFamily(familyId: string, userId: string) {
    await this.familiesService.assertMember(familyId, userId);
    return this.prisma.group.findMany({
      where: { familyId },
      include: { _count: { select: { posts: true } } },
    });
  }
}
