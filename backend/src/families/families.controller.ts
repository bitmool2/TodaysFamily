import { Controller, Post, Get, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FamiliesService } from './families.service';
import { CreateFamilyDto, UpdateFamilyDto } from './dto/family.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('Families')
@ApiBearerAuth('JWT')
@Controller('families')
export class FamiliesController {
  constructor(private readonly svc: FamiliesService) {}

  @Post()
  @ApiOperation({ summary: '가족 생성 (3개 그룹 자동 생성)' })
  create(@CurrentUser() user: any, @Body() dto: CreateFamilyDto) {
    return this.svc.create(user.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: '가족 상세 조회' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.svc.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '가족 이름 수정' })
  update(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: UpdateFamilyDto) {
    return this.svc.update(id, user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '가족 삭제' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.svc.remove(id, user.id);
  }
}
