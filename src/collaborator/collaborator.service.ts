import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateCollaboratorDto } from './dto/create-collaborator.dto';
import { UpdateCollaboratorDto } from './dto/update-collaborator.dto';
import { APIResponse } from 'src/common/dtos/api-response.dto';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { WorkspaceCollaborator } from './entities/collaborator.entity';
import { AccessControlService } from 'src/access-control/access-control.service';
import { WorkspacePermission } from 'src/access-control/enums/permission.enum';

@Injectable()
export class CollaboratorService {
  constructor(
    @InjectRepository(WorkspaceCollaborator)
    private readonly workspaceCollaboratorRepo: Repository<WorkspaceCollaborator>,
    private readonly accessControlService: AccessControlService,
  ) {}
  async create(createCollaboratorDto: CreateCollaboratorDto, userId: string) {
    const hasAccess = await this.accessControlService.canAccessWorkspace(
      userId,
      createCollaboratorDto.workspaceId,
      WorkspacePermission.INVITE_MEMBER,
    );

    if (!hasAccess) {
      throw new ForbiddenException(
        APIResponse.error('You do not have permission to invite collaborators'),
      );
    }

    const canInvite = await this.accessControlService.canInviteWithRole(
      userId,
      createCollaboratorDto.workspaceId,
      createCollaboratorDto.role,
    );
    if (!canInvite) {
      throw new ForbiddenException(
        APIResponse.error('You do not have permission to invite collaborators'),
      );
    }
    const existingCollaborator = await this.workspaceCollaboratorRepo.findOne({
      where: {
        workspace: { id: createCollaboratorDto.workspaceId },
        user: { id: createCollaboratorDto.userId },
      },
    });

    if (existingCollaborator) {
      throw new ForbiddenException(
        APIResponse.error('User is already a collaborator in this workspace'),
      );
    }
    const collaborator = this.workspaceCollaboratorRepo.create({
      workspace: { id: createCollaboratorDto.workspaceId },
      user: { id: createCollaboratorDto.userId },
      role: createCollaboratorDto.role,
    });

    const collab = await this.workspaceCollaboratorRepo.save(collaborator);
    console.log(collab);

    return APIResponse.success('Collaborator added successfully', collab);
  }

  findAll() {
    return `This action returns all collaborator`;
  }

  async findOne(id: string, userId: string) {
    const hasAccess = await this.accessControlService.canAccessWorkspace(
      userId,
      id,
      WorkspacePermission.READ,
    );
    if (!hasAccess) {
      throw new ForbiddenException(
        APIResponse.error(
          'You do not have permission to view this collaborator',
        ),
      );
    }
    const collaborator = await this.workspaceCollaboratorRepo.findOne({
      where: { id },
      relations: ['workspace', 'user'],
    });

    if (!collaborator) {
      throw new ForbiddenException(APIResponse.error('Collaborator not found'));
    }
    return APIResponse.success(
      'Collaborator retrieved successfully',
      collaborator,
    );
  }

  async update(
    id: string,
    updateCollaboratorDto: UpdateCollaboratorDto,
    userId: string,
  ) {
    const hasAccess = await this.accessControlService.canAccessWorkspace(
      userId,
      id,
      WorkspacePermission.UPDATE,
    );
    if (!hasAccess) {
      throw new ForbiddenException(
        APIResponse.error(
          'You do not have permission to update this collaborator',
        ),
      );
    }

    const collaborator = await this.workspaceCollaboratorRepo.findOne({
      where: { id },
    });
    if (!collaborator) {
      throw new ForbiddenException(APIResponse.error('Collaborator not found'));
    }
    Object.assign(collaborator, updateCollaboratorDto);
    return APIResponse.success(
      'Collaborator updated successfully',
      await this.workspaceCollaboratorRepo.save(collaborator),
    );
  }

  async remove(id: string, userId: string) {
    const hasAccess = await this.accessControlService.canAccessWorkspace(
      userId,
      id,
      WorkspacePermission.DELETE,
    );
    if (!hasAccess) {
      throw new ForbiddenException(
        APIResponse.error(
          'You do not have permission to remove this collaborator',
        ),
      );
    }

    const collaborator = await this.workspaceCollaboratorRepo.findOne({
      where: { id },
    });
    if (!collaborator) {
      throw new ForbiddenException(APIResponse.error('Collaborator not found'));
    }
    await this.workspaceCollaboratorRepo.remove(collaborator);
    return APIResponse.success('Collaborator removed successfully');
  }
}
