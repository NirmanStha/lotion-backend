import { Module } from '@nestjs/common';
import { AccessControlModule } from 'src/access-control/access-control.module';
import { WorkspaceCrudPolicy } from './workspace-crud.policy';

@Module({
  imports: [AccessControlModule],
  providers: [WorkspaceCrudPolicy],
  exports: [WorkspaceCrudPolicy],
})
export class WorkspacePolicyModule {}
