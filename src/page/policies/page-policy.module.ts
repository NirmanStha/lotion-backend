import { Module } from '@nestjs/common';
import { AccessControlModule } from 'src/access-control/access-control.module';
import { PageCrudPolicy } from './page-crud.policy';

@Module({
  imports: [AccessControlModule],
  providers: [PageCrudPolicy],
  exports: [PageCrudPolicy],
})
export class PagePolicyModule {}
