import {
  Controller, Post, Get, Patch, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto, UpdatePostDto, GetPostsQueryDto } from './dto/post.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('Posts')
@ApiBearerAuth('JWT')
@Controller('posts')
export class PostsController {
  constructor(private readonly svc: PostsService) {}

  @Post()
  @ApiOperation({ summary: '게시물 작성' })
  create(@CurrentUser() user: any, @Body() dto: CreatePostDto) {
    return this.svc.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: '피드 조회 (그룹/가족 필터, 페이지네이션)' })
  findAll(@CurrentUser() user: any, @Query() query: GetPostsQueryDto) {
    return this.svc.findAll(user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: '게시물 상세' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.svc.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '게시물 캡션 수정' })
  update(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: UpdatePostDto) {
    return this.svc.update(id, user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '게시물 삭제' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.svc.remove(id, user.id);
  }
}
