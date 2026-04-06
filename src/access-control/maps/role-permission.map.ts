import { CollaboratorRole } from 'src/collaborator/entities/collaborator.entity';
import {
  PagePermissionEnum,
  WorkspacePermission,
} from '../enums/permission.enum';
import { PageRole } from 'src/page-premission/entities/page-premission.entity';

export const RolePermissions: Record<
  CollaboratorRole,
  (WorkspacePermission | PagePermissionEnum)[]
> = {
  [CollaboratorRole.OWNER]: [
    ...Object.values(WorkspacePermission),
    ...Object.values(PagePermissionEnum),
  ],
  [CollaboratorRole.EDITOR]: [
    WorkspacePermission.READ,
    WorkspacePermission.INVITE_MEMBER,
    WorkspacePermission.EXPORT,
    PagePermissionEnum.READ,
    PagePermissionEnum.CREATE_SUBPAGE,
    PagePermissionEnum.UPDATE,
    PagePermissionEnum.DELETE,
    PagePermissionEnum.MOVE,
    PagePermissionEnum.ARCHIVE,
    PagePermissionEnum.PUBLISH,
    PagePermissionEnum.SHARE,
  ],
  [CollaboratorRole.VIEWER]: [
    WorkspacePermission.READ,
    PagePermissionEnum.READ,
  ],
  [CollaboratorRole.GUEST]: [
    // Guests have no workspace permissions
    // Their page access is resolved via PagePermission entity
  ],
};

export const PageRolePermissions: Record<PageRole, PagePermissionEnum[]> = {
  [PageRole.EDITOR]: [
    PagePermissionEnum.READ,
    PagePermissionEnum.UPDATE,
    PagePermissionEnum.CREATE_SUBPAGE,
    PagePermissionEnum.ARCHIVE,
  ],
  [PageRole.VIEWER]: [PagePermissionEnum.READ],
};
