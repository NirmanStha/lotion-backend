import { Module } from '@nestjs/common';
import { WorkspaceController } from './workspace.controller';
import { WorkspaceService } from './workspace.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Page } from 'src/page/entities/page.entity';
import { Workspace } from './entities/workspace.entity';

import { WorkspaceCollaborator } from 'src/collaborator/entities/collaborator.entity';
import { WorkspacePolicyModule } from './policies/workspace-policy.module';
import { AccessControlModule } from 'src/access-control/access-control.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace, Page, WorkspaceCollaborator]),
    WorkspacePolicyModule,
    AccessControlModule,
  ],
  controllers: [WorkspaceController],
  providers: [WorkspaceService],
})
export class WorkspaceModule {}
