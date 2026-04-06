import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CollaboratorRole,
  WorkspaceCollaborator,
} from 'src/collaborator/entities/collaborator.entity';
import {
  PagePremission,
  PageRole,
} from 'src/page-premission/entities/page-premission.entity';
import { Page } from 'src/page/entities/page.entity';
import { Workspace } from 'src/workspace/entities/workspace.entity';
import { Repository } from 'typeorm/browser/repository/Repository.js';
import {
  WorkspacePermission,
  PagePermissionEnum,
} from './enums/permission.enum';
import { RolePermissions } from './maps/role-permission.map';

@Injectable()
export class AccessControlService {
  constructor(
    @InjectRepository(Workspace) private workspaceRepo: Repository<Workspace>,
    @InjectRepository(WorkspaceCollaborator)
    private collaboratorRepo: Repository<WorkspaceCollaborator>,
    @InjectRepository(Page) private pageRepo: Repository<Page>,
    @InjectRepository(PagePremission)
    private pagePermissionRepo: Repository<PagePremission>,
  ) {}

  private roleHasPermission(
    role: CollaboratorRole,
    permission: WorkspacePermission | PagePermissionEnum,
  ): boolean {
    const permissions = RolePermissions[role];
    if (!permissions) {
      return false;
    }
    return permissions.includes(permission);
  }
  async getWorkspaceRole(userId: string, workspaceId: string) {
    const workspace = await this.workspaceRepo.findOne({
      where: { id: workspaceId },
      relations: ['owner'],
    });
    if (!workspace) {
      return null;
    }
    if (workspace.owner.id === userId) {
      return CollaboratorRole.OWNER;
    }
    const collaborator = await this.collaboratorRepo.findOne({
      where: {
        user: { id: userId },
        workspace: { id: workspaceId },
      },
    });
    return collaborator ? collaborator.role : null;
  }
  async canAccessWorkspace(
    userId: string,
    workspaceId: string,
    permission: WorkspacePermission,
  ): Promise<boolean> {
    const role = await this.getWorkspaceRole(userId, workspaceId);

    // User has no membership at all
    if (!role) return false;

    // GUEST role has no workspace-level permissions whatsoever
    if (role === CollaboratorRole.GUEST) return false;

    return this.roleHasPermission(role, permission);
  }
  async getPageLevelPermission(
    userId: string,
    pageId: string,
  ): Promise<PageRole | null> {
    const pagePermission = await this.pagePermissionRepo.findOne({
      where: {
        user: { id: userId },
        page: { id: pageId },
      },
    });
    return pagePermission?.role ?? null;
  }

  async canAccessPage(
    permission: PagePermissionEnum,
    userId: string,
    pageId: string,
    debpt = 0,
  ) {
    if (debpt > 20) {
      return false;
    }
    const page = await this.pageRepo.findOne({
      where: { id: pageId },
      relations: ['workspace', 'workspace.owner', 'parentPage', 'createdBy'],
    });
  }
}
