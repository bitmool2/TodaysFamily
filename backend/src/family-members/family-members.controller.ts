import { Controller, Post, Get, Patch, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FamilyMembersService } from './family-members.service';
import { InviteMemberDto, AcceptInviteDto, UpdateMemberRoleDto } from './dto/family-member.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('Family Members')
@ApiBearerAuth('JWT')
@Controller('family-members')
export class FamilyMembersController {
  constructor(private readonly svc: FamilyMembersService) {}

  @Post('invite')
  @ApiOperation({ summary: '가족 초대 링크 생성 (카카오/SMS 공유용)' })
  invite(@CurrentUser() user: any, @Body() dto: InviteMemberDto) {
    return this.svc.invite(user.id, dto);
  }

  @Post('accept')
  @ApiOperation({ summary: '초대 수락' })
  accept(@CurrentUser() user: any, @Body() dto: AcceptInviteDto) {
    return this.svc.acceptInvite(user.id, dto);
  }

  @Get(':familyId')
  @ApiOperation({ summary: '가족 구성원 목록' })
  findByFamily(@Param('familyId') familyId: string, @CurrentUser() user: any) {
    return this.svc.findByFamily(familyId, user.id);
  }

  @Patch(':familyId/member/:userId/role')
  @ApiOperation({ summary: '구성원 역할 수정' })
  updateRole(
    @Param('familyId') familyId: string,
    @Param('userId')   userId:   string,
    @CurrentUser()     user:     any,
    @Body()            dto:      UpdateMemberRoleDto,
  ) {
    return this.svc.updateRole(familyId, userId, user.id, dto);
  }

  @Delete(':familyId/member/:userId')
  @ApiOperation({ summary: '구성원 제거' })
  remove(
    @Param('familyId') familyId: string,
    @Param('userId')   userId:   string,
    @CurrentUser()     user:     any,
  ) {
    return this.svc.remove(familyId, userId, user.id);
  }
}
