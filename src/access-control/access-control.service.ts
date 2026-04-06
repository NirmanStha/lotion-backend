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
import { permission } from 'process';

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
    depth = 0,
  ) {
    if (depth > 20) {
      return false;
    }
    const page = await this.pageRepo.findOne({
      where: { id: pageId },
      relations: ['workspace', 'workspace.owner', 'parentPage', 'createdBy'],
    });

    if (!page) {
      return false;
    }

    //layer 1: If user is the creator of the page, they have full access(Owner Permission)
    if (page.createdBy.id === userId) {
      return true;
    }
    //layer 2: Check workspace-level permissions (Editor, Viewer Permission)
    const workspaceRole = await this.getWorkspaceRole(
      userId,
      page.workspace.id,
    );

    if (workspaceRole && workspaceRole !== CollaboratorRole.GUEST) {
      const allowed = this.roleHasPermission(workspaceRole, permission);

      if (!allowed) return false;
      if (
        workspaceRole === CollaboratorRole.EDITOR &&
        [PagePermissionEnum.DELETE, PagePermissionEnum.MOVE].includes(
          permission,
        )
      ) {
        return page.createdBy.id === userId;
      }
      return true;
    }
    //layer 3: check page-level permissions (Guest Permission)

    const pageRole = await this.getPageLevelPermission(userId, pageId);

    if (pageRole !== null) {
      const pageRolePermissions = RolePermissions[pageRole];
      return pageRolePermissions.includes(permission);
    }

    // layer 4 : if the page inherits permissions and has a parent page, check the parent page's permissions recursively
    if (page.inheritPermissions && page.parentPage) {
      return this.canAccessPage(
        permission,
        userId,
        page.parentPage.id,
        depth + 1,
      );
    }

    // public access : if the page is published and the permission being checked is READ, allow access to everyone
    if (page.isPublished && permission === PagePermissionEnum.READ) {
      return true;
    }

    return false;
  }

  // dont need this for now, but can be used in the future to fetch all pages a user has access to with a certain permission
  async canInviteWithRole(
    userId: string,
    workspaceId: string,
    roleToInvite: CollaboratorRole,
  ): Promise<boolean> {
    const userRole = await this.getWorkspaceRole(userId, workspaceId);
    if (!userRole) return false;

    if (![CollaboratorRole.OWNER, CollaboratorRole.EDITOR].includes(userRole)) {
      return false; // only OWNER and EDITOR can invite
    }

    // OWNER can invite any role, EDITOR can only invite VIEWER or GUEST
    if (
      userRole === CollaboratorRole.EDITOR &&
      [CollaboratorRole.EDITOR, CollaboratorRole.OWNER].includes(roleToInvite)
    ) {
      return false;
    }

    return true;
  }
}
