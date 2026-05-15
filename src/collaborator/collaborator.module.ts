import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PagePremission } from 'src/page-premission/entities/page-premission.entity';
import { Page } from 'src/page/entities/page.entity';
import { Workspace } from 'src/workspace/entities/workspace.entity';
import { CollaboratorController } from './collaborator.controller';
import { CollaboratorService } from './collaborator.service';
import { WorkspaceCollaborator } from './entities/collaborator.entity';
import { AccessControlModule } from 'src/access-control/access-control.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceCollaborator, Page]),
    AccessControlModule,
  ],
  controllers: [CollaboratorController],
  providers: [CollaboratorService],
})
export class CollaboratorModule {}
