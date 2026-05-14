import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFamilyDto {
  @ApiProperty({ example: '민준이네 가족' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;
}

export class UpdateFamilyDto {
  @ApiProperty({ example: '민준이네 행복한 가족' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;
}
