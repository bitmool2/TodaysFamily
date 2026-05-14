import {
  Injectable, NotFoundException, ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { FamiliesService } from '@/families/families.service';
import { NotificationsService } from '@/notifications/notifications.service';
import { CreatePostDto, UpdatePostDto, GetPostsQueryDto } from './dto/post.dto';
import { GroupType } from '@prisma/client';

const POST_SELECT = {
  id: true, imageUrl: true, caption: true, source: true,
  isAiCaption: true, createdAt: true,
  group:  { select: { id: true, type: true, name: true } },
  author: { select: { id: true, name: true, profileImage: true } },
  child:  { select: { id: true, name: true } },
  _count: { select: { comments: true, reactions: true } },
  reactions: {
    select: { type: true, user: { select: { id: true, name: true } } },
    take: 5,
  },
};

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly familiesService: FamiliesService,
    private readonly notifications: NotificationsService,
  ) {}

  async create(userId: string, dto: CreatePostDto) {
    await this.familiesService.assertMember(dto.familyId, userId);

    const post = await this.prisma.post.create({
      data: {
        familyId:    dto.familyId,
        groupId:     dto.groupId,
        authorId:    userId,
        childId:     dto.childId,
        imageUrl:    dto.imageUrl,
        imageKey:    dto.imageKey,
        caption:     dto.caption,
        source:      dto.source,
        isAiCaption: dto.isAiCaption ?? false,
      },
      include: {
        group:  { select: { id: true, type: true, name: true } },
        author: { select: { id: true, name: true, profileImage: true } },
      },
    });

    // Push notification to other family members
    await this.notifications.notifyNewPost(dto.familyId, userId, post);

    return post;
  }

  async findAll(userId: string, query: GetPostsQueryDto) {
    if (query.familyId) {
      await this.familiesService.assertMember(query.familyId, userId);
    }

    // Resolve group filter — user can only see groups they belong to
    const groupFilter: any = {};
    if (query.familyId) groupFilter.familyId = query.familyId;
    if (query.group) groupFilter.type = query.group as GroupType;

    const where: any = {
      ...(query.familyId && { familyId: query.familyId }),
      ...(query.childId  && { childId:  query.childId  }),
      ...(query.group    && { group: { type: query.group } }),
    };

    const skip = ((query.page ?? 1) - 1) * (query.limit ?? 20);
    const take = query.limit ?? 20;

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        select: POST_SELECT,
      }),
      this.prisma.post.count({ where }),
    ]);

    return {
      data: posts,
      total,
      page: query.page ?? 1,
      limit: take,
      hasNext: skip + take < total,
    };
  }

  async findOne(postId: string, userId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        group:  { select: { id: true, type: true, name: true } },
        author: { select: { id: true, name: true, profileImage: true } },
        child:  { select: { id: true, name: true } },
        comments: {
          orderBy: { createdAt: 'asc' },
          include: { user: { select: { id: true, name: true, profileImage: true } } },
        },
        reactions: {
          include: { user: { select: { id: true, name: true } } },
        },
        _count: { select: { comments: true, reactions: true } },
      },
    });

    if (!post) throw new NotFoundException('게시물을 찾을 수 없습니다.');
    await this.familiesService.assertMember(post.familyId, userId);
    return post;
  }

  async update(postId: string, userId: string, dto: UpdatePostDto) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('게시물을 찾을 수 없습니다.');
    if (post.authorId !== userId) throw new ForbiddenException('수정 권한이 없습니다.');

    return this.prisma.post.update({
      where: { id: postId },
      data: { caption: dto.caption },
    });
  }

  async remove(postId: string, userId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('게시물을 찾을 수 없습니다.');
    if (post.authorId !== userId) throw new ForbiddenException('삭제 권한이 없습니다.');

    await this.prisma.post.delete({ where: { id: postId } });
    return { success: true };
  }
}
