import { SetMetadata } from '@nestjs/common';
import {
  PagePermissionEnum,
  WorkspacePermission,
} from '../enums/permission.enum';

export const POLICY_META_KEY = 'policy_meta';

export interface PolicyMeta<
  TPermission = WorkspacePermission | PagePermissionEnum,
> {
  permission: TPermission;
  /** Name of the route param holding the id to authorize against. Defaults to `id`. */
  param?: string;
}

export const PolicyMeta = <TPermission>(meta: PolicyMeta<TPermission>) => {
  return SetMetadata(POLICY_META_KEY, meta);
};
