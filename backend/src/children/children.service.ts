import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { FamiliesService } from '@/families/families.service';
import { CreateChildDto, UpdateChildDto } from './dto/child.dto';

@Injectable()
export class ChildrenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly familiesService: FamiliesService,
  ) {}

  async create(userId: string, dto: CreateChildDto) {
    await this.familiesService.assertMember(dto.familyId, userId);
    return this.prisma.child.create({
      data: {
        familyId:     dto.familyId,
        name:         dto.name,
        birthDate:    new Date(dto.birthDate),
        profileImage: dto.profileImage,
      },
    });
  }

  async findByFamily(familyId: string, userId: string) {
    await this.familiesService.assertMember(familyId, userId);
    return this.prisma.child.findMany({ where: { familyId }, orderBy: { birthDate: 'desc' } });
  }

  async update(childId: string, userId: string, dto: UpdateChildDto) {
    const child = await this.prisma.child.findUnique({ where: { id: childId } });
    if (!child) throw new NotFoundException();
    await this.familiesService.assertMember(child.familyId, userId);
    return this.prisma.child.update({ where: { id: childId }, data: dto });
  }

  async remove(childId: string, userId: string) {
    const child = await this.prisma.child.findUnique({ where: { id: childId } });
    if (!child) throw new NotFoundException();
    await this.familiesService.assertOwner(child.familyId, userId);
    await this.prisma.child.delete({ where: { id: childId } });
    return { success: true };
  }
}
