import { Controller, Post, Get, Patch, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ChildrenService } from './children.service';
import { CreateChildDto, UpdateChildDto } from './dto/child.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('Children')
@ApiBearerAuth('JWT')
@Controller('children')
export class ChildrenController {
  constructor(private readonly svc: ChildrenService) {}

  @Post()
  @ApiOperation({ summary: '아이 프로필 생성' })
  create(@CurrentUser() user: any, @Body() dto: CreateChildDto) {
    return this.svc.create(user.id, dto);
  }

  @Get('family/:familyId')
  @ApiOperation({ summary: '가족 내 아이 목록' })
  findByFamily(@Param('familyId') familyId: string, @CurrentUser() user: any) {
    return this.svc.findByFamily(familyId, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '아이 정보 수정' })
  update(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: UpdateChildDto) {
    return this.svc.update(id, user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '아이 삭제' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.svc.remove(id, user.id);
  }
}
