import { PartialType } from '@nestjs/mapped-types';
import {
	CreateCollaboratorDto,
	CreateWorkspaceCollaboratorDto,
} from './create-collaborator.dto';

export class UpdateWorkspaceCollaboratorDto extends PartialType(
	CreateWorkspaceCollaboratorDto,
) {}

export class UpdateCollaboratorDto extends PartialType(CreateCollaboratorDto) {}
