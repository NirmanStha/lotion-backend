import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessControlModule } from 'src/access-control/access-control.module';
import { Workspace } from 'src/workspace/entities/workspace.entity';
import { Page } from './entities/page.entity';
import { PageController } from './page.controller';
import { PageService } from './page.service';
import { PagePolicyModule } from './policies/page-policy.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Page, Workspace]),
    AccessControlModule,
    PagePolicyModule,
  ],
  controllers: [PageController],
  providers: [PageService],
})
export class PageModule {}
