import { Module } from '@nestjs/common';
import { ChildrenService } from './children.service';
import { ChildrenController } from './children.controller';
import { FamiliesModule } from '@/families/families.module';

@Module({ imports: [FamiliesModule], controllers: [ChildrenController], providers: [ChildrenService] })
export class ChildrenModule {}
