import { Module } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { WorkspaceController } from './workspace.controller';

import { Page } from 'src/page/entities/page.entity';
import { Workspace } from './entities/workspace.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceCollaborator } from 'src/collaborator/entities/collaborator.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Workspace, Page, WorkspaceCollaborator])],
  controllers: [WorkspaceController],
  providers: [WorkspaceService],
})
export class WorkspaceModule {}
