import { IsString, IsEnum, IsUUID, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GroupType } from '@prisma/client';

export class InviteMemberDto {
  @ApiProperty()
  @IsUUID()
  familyId: string;

  @ApiProperty({ example: '외할머니', description: '관계/역할' })
  @IsString()
  @MinLength(1)
  @MaxLength(30)
  role: string;

  @ApiPropertyOptional({ enum: GroupType, default: GroupType.ALL })
  @IsEnum(GroupType)
  @IsOptional()
  groupType?: GroupType = GroupType.ALL;
}

export class AcceptInviteDto {
  @ApiProperty({ description: '초대 토큰' })
  @IsString()
  token: string;
}

export class UpdateMemberRoleDto {
  @ApiProperty({ example: '시어머니' })
  @IsString()
  @MinLength(1)
  role: string;
}
