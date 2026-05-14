import { IsString, IsDateString, IsOptional, IsUrl, IsUUID, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateChildDto {
  @ApiProperty()
  @IsUUID()
  familyId: string;

  @ApiProperty({ example: '민준' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({ example: '2022-03-15' })
  @IsDateString()
  birthDate: string;

  @ApiPropertyOptional()
  @IsUrl()
  @IsOptional()
  profileImage?: string;
}

export class UpdateChildDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsUrl()
  @IsOptional()
  profileImage?: string;
}
