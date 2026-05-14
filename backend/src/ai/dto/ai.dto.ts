import { IsUrl, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateCaptionDto {
  @ApiProperty({ description: 'S3 image URL' })
  @IsUrl()
  imageUrl: string;

  @ApiPropertyOptional({ description: '아이 이름 (캡션에 반영)' })
  @IsString()
  @IsOptional()
  childName?: string;
}
