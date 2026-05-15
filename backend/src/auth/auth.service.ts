import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { AuthProvider } from '@prisma/client';
import {
  LoginDto,
  RegisterDto,
  SocialLoginDto,
  UpdateFcmTokenDto,
} from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  // ── Check email duplicate ─────────────────────────────────────────────────

  async checkEmail(email: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    return { available: !existing };
  }

  // ── Check admin email (멤버 가입 시: 실제 가입 계정 + ADMIN 역할 확인) ────

  async checkAdmin(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { exists: false, isAdmin: false, message: '등록된 계정이 없습니다.' };
    }
    const isAdmin = (user as any).role === 'ADMIN';
    if (!isAdmin) {
      return { exists: true, isAdmin: false, message: '해당 계정은 관리자가 아닙니다.' };
    }
    return { exists: true, isAdmin: true, message: '관리자 계정이 확인되었습니다.' };
  }

  // ── Register ─────────────────────────────────────────────────────────────

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('이미 사용 중인 이메일입니다.');

    const role = dto.role ?? 'ADMIN';

    // 멤버 가입 시 관리자 이메일 유효성 검증
    if (role === 'MEMBER') {
      if (!dto.adminEmail) throw new BadRequestException('관리자 이메일을 입력해주세요.');
      const admin = await this.prisma.user.findUnique({ where: { email: dto.adminEmail } });
      if (!admin) throw new NotFoundException('등록된 관리자 계정이 없습니다.');
      if ((admin as any).role !== 'ADMIN') throw new BadRequestException('해당 계정은 관리자가 아닙니다.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash,
        provider: AuthProvider.EMAIL,
        role: role as any,
      },
    });

    return this.issueTokens(user);
  }

  // ── Email Login ───────────────────────────────────────────────────────────

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !user.passwordHash)
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    if (!user.isActive) throw new UnauthorizedException('비활성화된 계정입니다.');

    return this.issueTokens(user);
  }

  // ── Social Login (Kakao / Google) ─────────────────────────────────────────

  async socialLogin(dto: SocialLoginDto) {
    let providerEmail: string;
    let providerName: string;
    let providerId: string;

    if (dto.provider === AuthProvider.KAKAO) {
      // Validate with Kakao API
      const kakaoUser = await this.validateKakaoToken(dto.accessToken);
      providerEmail = kakaoUser.email;
      providerName  = kakaoUser.name;
      providerId    = kakaoUser.id;
    } else if (dto.provider === AuthProvider.GOOGLE) {
      const googleUser = await this.validateGoogleToken(dto.accessToken);
      providerEmail = googleUser.email;
      providerName  = googleUser.name;
      providerId    = googleUser.id;
    } else {
      throw new BadRequestException('지원하지 않는 소셜 로그인입니다.');
    }

    let user = await this.prisma.user.findFirst({
      where: { OR: [{ email: providerEmail }, { provider: dto.provider, providerId }] },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: providerEmail,
          name: providerName,
          provider: dto.provider,
          providerId,
        },
      });
    }

    return this.issueTokens(user);
  }

  // ── Update FCM Token ──────────────────────────────────────────────────────

  async updateFcmToken(userId: string, dto: UpdateFcmTokenDto) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { fcmToken: dto.fcmToken },
    });
    return { success: true };
  }

  // ── Get current user ──────────────────────────────────────────────────────

  async getMe(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, name: true,
        profileImage: true, provider: true, createdAt: true,
        role: true,
        memberships: {
          include: { family: { select: { id: true, name: true } } },
        },
      },
    });
  }

  // ── Token helpers ─────────────────────────────────────────────────────────

  private issueTokens(user: { id: string; email: string; name: string }) {
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.config.get('JWT_EXPIRES_IN', '7d'),
    });
    return {
      accessToken,
      user: { id: user.id, email: user.email, name: user.name, role: (user as any).role ?? 'ADMIN' },
    };
  }

  // ── Social token validators (placeholders) ────────────────────────────────

  private async validateKakaoToken(accessToken: string) {
    // Call Kakao API: https://kapi.kakao.com/v2/user/me
    // In production, use axios/got to validate
    return { id: 'kakao-mock-id', email: 'kakao@example.com', name: '카카오 사용자' };
  }

  private async validateGoogleToken(accessToken: string) {
    // Call Google API: https://www.googleapis.com/oauth2/v3/userinfo
    return { id: 'google-mock-id', email: 'google@example.com', name: 'Google 사용자' };
  }
}
