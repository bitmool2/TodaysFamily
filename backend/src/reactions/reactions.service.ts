import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { ToggleReactionDto } from './dto/reaction.dto';

@Injectable()
export class ReactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async toggle(userId: string, dto: ToggleReactionDto) {
    const post = await this.prisma.post.findUnique({ where: { id: dto.postId } });
    if (!post) throw new NotFoundException('게시물을 찾을 수 없습니다.');

    const existing = await this.prisma.reaction.findUnique({
      where: { postId_userId: { postId: dto.postId, userId } },
    });

    if (existing) {
      if (existing.type === dto.type) {
        await this.prisma.reaction.delete({ where: { id: existing.id } });
        return { reacted: false, type: dto.type };
      }
      const updated = await this.prisma.reaction.update({
        where: { id: existing.id },
        data: { type: dto.type },
      });
      return { reacted: true, type: updated.type };
    }

    const reaction = await this.prisma.reaction.create({
      data: { postId: dto.postId, userId, type: dto.type },
    });
    return { reacted: true, type: reaction.type };
  }

  async findByPost(postId: string) {
    return this.prisma.reaction.findMany({
      where: { postId },
      include: { user: { select: { id: true, name: true } } },
    });
  }
}
