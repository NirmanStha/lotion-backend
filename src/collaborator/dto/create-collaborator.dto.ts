import { IsEnum, IsUUID } from 'class-validator';
import { CollaboratorRole } from '../entities/collaborator.entity';

export class CreateWorkspaceCollaboratorDto {
	@IsUUID()
	workspaceId!: string;

	@IsUUID()
	userId!: string;

	@IsEnum(CollaboratorRole)
	role!: CollaboratorRole;
}

export class CreateCollaboratorDto extends CreateWorkspaceCollaboratorDto {}
