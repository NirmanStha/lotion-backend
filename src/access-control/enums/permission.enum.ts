export enum WorkspacePermission {
  READ = 'workspace:read',
  UPDATE = 'workspace:update',
  DELETE = 'workspace:delete',
  INVITE_MEMBER = 'workspace:invite_member',
  REMOVE_MEMBER = 'workspace:remove_member',
  CHANGE_ROLE = 'workspace:change_role',
  EXPORT = 'workspace:export',
}

export enum PagePermissionEnum {
  READ = 'page:read',
  CREATE_SUBPAGE = 'page:create_subpage',
  UPDATE = 'page:update',
  DELETE = 'page:delete',
  MOVE = 'page:move',
  ARCHIVE = 'page:archive',
  PUBLISH = 'page:publish',
  SHARE = 'page:share',
  MANAGE_PERMISSIONS = 'page:manage_permissions',
}
