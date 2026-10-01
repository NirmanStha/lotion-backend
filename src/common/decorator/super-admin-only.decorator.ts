import { SetMetadata } from '@nestjs/common';

export const SUPER_ADMIN_ONLY_KEY = 'super_admin_only';

/**
 * Restricts a route to platform administrators. Apply alongside
 * `SuperAdminGuard`:
 *
 *   @UseGuards(SuperAdminGuard)
 *   @SuperAdminOnly()
 */
export const SuperAdminOnly = () => SetMetadata(SUPER_ADMIN_ONLY_KEY, true);
