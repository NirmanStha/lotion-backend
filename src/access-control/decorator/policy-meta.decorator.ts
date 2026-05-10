import { SetMetadata } from '@nestjs/common';
import { WorkspacePermission } from '../enums/permission.enum';

export const POLICY_META_KEY = 'policy_meta';

export interface PolicyMeta {
  permission: WorkspacePermission;
  param?: string;
}

export const PolicyMeta = (meta: PolicyMeta) => {
  return SetMetadata(POLICY_META_KEY, meta);
};
