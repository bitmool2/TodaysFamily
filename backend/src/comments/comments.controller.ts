import { Controller, Post, Get, Patch, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('Comments')
@ApiBearerAuth('JWT')
@Controller('comments')
export class CommentsController {
  constructor(private readonly svc: CommentsService) {}

  @Post()
  @ApiOperation({ summary: '댓글 작성' })
  create(@CurrentUser() user: any, @Body() dto: CreateCommentDto) {
    return this.svc.create(user.id, dto);
  }

  @Get('post/:postId')
  @ApiOperation({ summary: '게시물 댓글 목록' })
  findByPost(@Param('postId') postId: string) {
    return this.svc.findByPost(postId);
  }

  @Patch(':id')
  @ApiOperation({ summary: '댓글 수정' })
  update(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: UpdateCommentDto) {
    return this.svc.update(id, user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '댓글 삭제' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.svc.remove(id, user.id);
  }
}
