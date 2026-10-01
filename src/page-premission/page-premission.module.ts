import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessControlModule } from 'src/access-control/access-control.module';
import { Page } from 'src/page/entities/page.entity';
import { User } from 'src/user/entities/user.entity';
import { PagePremission } from './entities/page-premission.entity';
import { PagePremissionController } from './page-premission.controller';
import { PagePremissionService } from './page-premission.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PagePremission, Page, User]),
    AccessControlModule,
  ],
  controllers: [PagePremissionController],
  providers: [PagePremissionService],
})
export class PagePremissionModule {}
