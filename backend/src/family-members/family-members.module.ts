import { Module } from '@nestjs/common';
import { FamilyMembersService } from './family-members.service';
import { FamilyMembersController } from './family-members.controller';
import { FamiliesModule } from '@/families/families.module';

@Module({ imports: [FamiliesModule], controllers: [FamilyMembersController], providers: [FamilyMembersService] })
export class FamilyMembersModule {}
