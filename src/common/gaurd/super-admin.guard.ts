import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SUPER_ADMIN_ONLY_KEY } from '../decorator/super-admin-only.decorator';

/**
 * Blocks non-super-admins from platform-wide routes.
 *
 * The super-admin flag is read from the JWT rather than the database so this
 * guard stays synchronous and adds no query per request. The trade-off is
 * that revoking admin rights takes effect only when the token expires or is
 * refreshed - acceptable for a rarely-changed flag, and noted in the
 * bootstrap service where promotion happens.
 */
@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isSuperAdminOnly = this.reflector.getAllAndOverride<boolean>(
      SUPER_ADMIN_ONLY_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No @SuperAdminOnly on this route, let it through.
    if (!isSuperAdminOnly) return true;

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;
    const isSuperAdmin = request.user?.isSuperAdmin === true;

    if (!userId || !isSuperAdmin) {
      // Deliberately vague: don't confirm whether the account exists or is
      // merely unprivileged.
      throw new ForbiddenException('Administrator privileges required');
    }

    return true;
  }
}
