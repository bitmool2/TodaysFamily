import { IsEnum, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { GroupType } from '@prisma/client';

export class CreateGroupDto {
  @ApiProperty({ enum: GroupType })
  @IsEnum(GroupType)
  type: GroupType;

  @ApiProperty({ example: '친정 앨범' })
  @IsString()
  @MinLength(2)
  name: string;
}
