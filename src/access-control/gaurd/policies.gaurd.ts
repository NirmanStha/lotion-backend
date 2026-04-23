// access-control/guards/policies.guard.ts
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ModuleRef } from '@nestjs/core';
import { CHECK_POLICY_KEY } from '../decorator/check-policy.decorator';
import type { IPolicyHandler } from '../interface/policy-handler.interface';

type PolicyHandlerConstructor = new (...args: any[]) => IPolicyHandler;
@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private moduleRef: ModuleRef,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policyClasses = this.reflector.getAllAndOverride<
      PolicyHandlerConstructor[]
    >(CHECK_POLICY_KEY, [context.getHandler(), context.getClass()]);

    // No @CheckPolicy on this route, let it through
    if (!policyClasses?.length) return true;

    // Resolve each policy class from NestJS DI container
    // strict: false means it searches all modules, not just the current one
    const handlers = await Promise.all(
      policyClasses.map((PolicyClass) =>
        this.moduleRef.resolve(PolicyClass, undefined, { strict: false }),
      ),
    );

    const results = await Promise.all(
      handlers.map((handler) => handler.handle(context)),
    );

    if (results.some((result) => !result)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
