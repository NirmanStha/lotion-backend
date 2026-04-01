import { Module } from '@nestjs/common';
import { PagePremissionService } from './page-premission.service';
import { PagePremissionController } from './page-premission.controller';

@Module({
  controllers: [PagePremissionController],
  providers: [PagePremissionService],
})
export class PagePremissionModule {}
