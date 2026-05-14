import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { FamiliesModule } from './families/families.module';
import { GroupsModule } from './groups/groups.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { ReactionsModule } from './reactions/reactions.module';
import { FamilyMembersModule } from './family-members/family-members.module';
import { ChildrenModule } from './children/children.module';
import { UploadModule } from './upload/upload.module';
import { AiModule } from './ai/ai.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    PrismaModule,
    AuthModule,
    FamiliesModule,
    GroupsModule,
    PostsModule,
    CommentsModule,
    ReactionsModule,
    FamilyMembersModule,
    ChildrenModule,
    UploadModule,
    AiModule,
    NotificationsModule,
  ],
})
export class AppModule {}
