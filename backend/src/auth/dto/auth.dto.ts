import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuthProvider } from '@prisma/client';

export type UserRoleType = 'ADMIN' | 'MEMBER';

export class LoginDto {
  @ApiProperty({ example: 'mom@todaysfamily.app' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'mom@todaysfamily.app' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '엄마' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ enum: ['ADMIN', 'MEMBER'], default: 'ADMIN', description: '가입 역할' })
  @IsOptional()
  @IsEnum(['ADMIN', 'MEMBER'])
  role?: UserRoleType;

  @ApiPropertyOptional({ example: 'admin@family.app', description: '멤버 가입 시 연결할 관리자 이메일' })
  @IsOptional()
  @IsEmail()
  adminEmail?: string;
}

export class SocialLoginDto {
  @ApiProperty({ enum: AuthProvider })
  @IsEnum(AuthProvider)
  provider: AuthProvider;

  @ApiProperty({ description: 'OAuth access token from social provider' })
  @IsString()
  accessToken: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}

export class UpdateFcmTokenDto {
  @ApiProperty()
  @IsString()
  fcmToken: string;
}
