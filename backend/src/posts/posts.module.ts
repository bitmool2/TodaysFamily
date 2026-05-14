import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { FamiliesModule } from '@/families/families.module';
import { NotificationsModule } from '@/notifications/notifications.module';

@Module({
  imports: [FamiliesModule, NotificationsModule],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
