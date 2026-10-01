import { Expose, Type } from 'class-transformer';
import { CollaboratorRole } from 'src/collaborator/entities/collaborator.entity';
import { UserSummaryDto } from 'src/user/dto/user.summary.dto';

export class WorkspaceCollaboratorSummaryDto {
  @Expose()
  id!: string;

  @Expose()
  role!: CollaboratorRole;

  @Expose()
  @Type(() => UserSummaryDto)
  user!: UserSummaryDto;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;
}

export class WorkspaceWithCollaboratorsResponseDto {
  @Expose()
  id!: string;

  @Expose()
  name!: string;

  @Expose()
  icon?: string;

  @Expose()
  description?: string;

  @Expose()
  @Type(() => UserSummaryDto)
  owner!: UserSummaryDto;

  @Expose()
  @Type(() => WorkspaceCollaboratorSummaryDto)
  collaborators!: WorkspaceCollaboratorSummaryDto[];

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;
}
