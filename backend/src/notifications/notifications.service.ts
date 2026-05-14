import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);
  private app: admin.app.App | null = null;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit() {
    const serviceAccount = this.config.get<string>('FIREBASE_SERVICE_ACCOUNT');
    if (!serviceAccount) {
      this.logger.warn('FIREBASE_SERVICE_ACCOUNT not set — push notifications disabled');
      return;
    }
    try {
      this.app = admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(serviceAccount)),
      }, 'todaysfamily');
      this.logger.log('Firebase Admin initialized');
    } catch (err) {
      this.logger.error('Firebase init failed', err);
    }
  }

  // ── Notification triggers ─────────────────────────────────────────────────

  async notifyNewPost(familyId: string, authorId: string, post: any) {
    const tokens = await this.getFamilyTokens(familyId, [authorId]);
    if (!tokens.length) return;

    const author = await this.prisma.user.findUnique({
      where: { id: authorId },
      select: { name: true },
    });

    await this.send(tokens, {
      title: `${author?.name ?? '가족'}이 새 사진을 올렸어요 📷`,
      body:  post.caption ?? '새로운 소식이 도착했어요 ❤️',
      data:  { type: 'NEW_POST', postId: post.id },
    });
  }

  async notifyNewComment(post: any, commenterId: string, content: string) {
    if (post.authorId === commenterId) return;
    const authorToken = await this.getUserToken(post.authorId);
    if (!authorToken) return;

    const commenter = await this.prisma.user.findUnique({
      where: { id: commenterId },
      select: { name: true },
    });

    await this.send([authorToken], {
      title: `${commenter?.name ?? '가족'}이 댓글을 달았어요 💬`,
      body:  content.length > 50 ? content.slice(0, 50) + '…' : content,
      data:  { type: 'NEW_COMMENT', postId: post.id },
    });
  }

  async notifyKidsNoteDetected(userId: string, count: number) {
    const token = await this.getUserToken(userId);
    if (!token) return;
    await this.send([token], {
      title: `📷 새 사진 ${count}장을 발견했어요`,
      body:  '어린이집 사진을 가족과 공유해 보세요!',
      data:  { type: 'KIDSNOTE_DETECTED' },
    });
  }

  // ── Core send ─────────────────────────────────────────────────────────────

  private async send(
    tokens: string[],
    notification: { title: string; body: string; data?: Record<string, string> },
  ) {
    if (!this.app || !tokens.length) return;

    try {
      const messaging = admin.messaging(this.app);
      const result = await messaging.sendEachForMulticast({
        tokens,
        notification: { title: notification.title, body: notification.body },
        data: notification.data ?? {},
        apns: { payload: { aps: { sound: 'default', badge: 1 } } },
        android: { notification: { sound: 'default', channelId: 'default' } },
      });
      this.logger.debug(`FCM sent: ${result.successCount}/${tokens.length}`);
    } catch (err) {
      this.logger.error('FCM send failed', err);
    }
  }

  private async getFamilyTokens(familyId: string, excludeUserIds: string[] = []) {
    const members = await this.prisma.familyMember.findMany({
      where: { familyId, userId: { notIn: excludeUserIds } },
      include: { user: { select: { fcmToken: true } } },
    });
    return members
      .map((m) => m.user.fcmToken)
      .filter((t): t is string => Boolean(t));
  }

  private async getUserToken(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { fcmToken: true },
    });
    return user?.fcmToken ?? null;
  }
}
