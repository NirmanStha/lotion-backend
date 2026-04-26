import { Expose, Type } from 'class-transformer';
import { CollaboratorRole } from '../entities/collaborator.entity';
import { UserSummaryDto } from 'src/user/dto/user.summary.dto';
import { WorkspaceResponseDto } from 'src/workspace/dto/api-workspace.dto';

export class WorkspaceCollaboratorResponseDto {
  @Expose()
  id!: string;

  @Expose()
  role!: CollaboratorRole;

  @Expose()
  @Type(() => WorkspaceResponseDto)
  workspace!: WorkspaceResponseDto;

  @Expose()
  @Type(() => UserSummaryDto)
  user!: UserSummaryDto;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;
}