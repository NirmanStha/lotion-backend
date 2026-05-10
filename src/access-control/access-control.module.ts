import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceCollaborator } from 'src/collaborator/entities/collaborator.entity';
import { PagePremission } from 'src/page-premission/entities/page-premission.entity';
import { Page } from 'src/page/entities/page.entity';
import { Workspace } from 'src/workspace/entities/workspace.entity';
import { AccessControlService } from './access-control.service';
import { PoliciesGuard } from './gaurd/policies.gaurd';
import { UpdateWorkspacePolicy } from './policies/workspace/workspace.update.policy';
import { DeleteWorkspacePolicy } from './policies/workspace/workspace.delete.policy';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkspaceCollaborator,
      Workspace,
      Page,
      PagePremission,
    ]),
  ],
  providers: [
    AccessControlService,
    PoliciesGuard,
    UpdateWorkspacePolicy,
    DeleteWorkspacePolicy,
  ],
  exports: [
    AccessControlService,
    PoliciesGuard,
    UpdateWorkspacePolicy,
    DeleteWorkspacePolicy,
  ],
})
export class AccessControlModule {}
