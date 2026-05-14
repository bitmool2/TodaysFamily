import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/group.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('Groups')
@ApiBearerAuth('JWT')
@Controller()
export class GroupsController {
  constructor(private readonly svc: GroupsService) {}

  @Post('groups')
  @ApiOperation({ summary: '그룹 생성' })
  create(@CurrentUser() user: any, @Body() dto: CreateGroupDto & { familyId: string }) {
    return this.svc.create(dto.familyId, user.id, dto);
  }

  @Get('families/:familyId/groups')
  @ApiOperation({ summary: '가족의 그룹 목록' })
  findByFamily(@Param('familyId') familyId: string, @CurrentUser() user: any) {
    return this.svc.findByFamily(familyId, user.id);
  }
}
