import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ReactionsService } from './reactions.service';
import { ToggleReactionDto } from './dto/reaction.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('Reactions')
@ApiBearerAuth('JWT')
@Controller('reactions')
export class ReactionsController {
  constructor(private readonly svc: ReactionsService) {}

  @Post('toggle')
  @ApiOperation({ summary: '반응 토글 (추가/변경/삭제)' })
  toggle(@CurrentUser() user: any, @Body() dto: ToggleReactionDto) {
    return this.svc.toggle(user.id, dto);
  }

  @Get('post/:postId')
  @ApiOperation({ summary: '게시물 반응 목록' })
  findByPost(@Param('postId') postId: string) {
    return this.svc.findByPost(postId);
  }
}
