import { IsString, MinLength, MaxLength, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty()
  @IsUUID()
  postId: string;

  @ApiProperty({ example: '오늘 물감놀이 너무 즐거웠겠다 ❤️' })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  content: string;
}

export class UpdateCommentDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  content: string;
}
