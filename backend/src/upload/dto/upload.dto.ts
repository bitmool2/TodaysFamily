import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GetPresignedUrlDto {
  @ApiProperty({ example: 'photo.jpg' })
  @IsString()
  fileName: string;

  @ApiProperty({ example: 'image/jpeg' })
  @IsString()
  contentType: string;

  @ApiPropertyOptional({ example: 'families/123' })
  @IsString()
  @IsOptional()
  folder?: string;
}
