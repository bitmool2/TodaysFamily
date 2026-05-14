import { Module } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { FamiliesModule } from '@/families/families.module';

@Module({ imports: [FamiliesModule], controllers: [GroupsController], providers: [GroupsService] })
export class GroupsModule {}
