import {
  IsString, IsOptional, IsEnum, IsBoolean, IsUUID,
  IsUrl, IsInt, Min, Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GroupType, SourceType } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreatePostDto {
  @ApiProperty()
  @IsUUID()
  familyId: string;

  @ApiProperty()
  @IsUUID()
  groupId: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  childId?: string;

  @ApiProperty()
  @IsUrl()
  imageUrl: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  imageKey?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  caption?: string;

  @ApiProperty({ enum: SourceType })
  @IsEnum(SourceType)
  source: SourceType;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isAiCaption?: boolean;
}

export class UpdatePostDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  caption?: string;
}

export class GetPostsQueryDto {
  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  familyId?: string;

  @ApiPropertyOptional({ enum: GroupType })
  @IsEnum(GroupType)
  @IsOptional()
  group?: GroupType;

  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  limit?: number = 20;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  childId?: string;
}
