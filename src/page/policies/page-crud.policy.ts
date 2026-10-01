import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AccessControlService } from 'src/access-control/access-control.service';
import {
  POLICY_META_KEY,
  PolicyMeta,
} from 'src/access-control/decorator/policy-meta.decorator';
import { IPolicyHandler } from 'src/access-control/interface/policy-handler.interface';
import { PagePermissionEnum } from 'src/access-control/enums/permission.enum';

@Injectable()
export class PageCrudPolicy implements IPolicyHandler {
  constructor(
    private readonly accessControl: AccessControlService,
    private readonly reflector: Reflector,
  ) {}

  async handle(context: ExecutionContext): Promise<boolean> {
    const meta = this.reflector.getAllAndOverride<
      PolicyMeta<PagePermissionEnum>
    >(POLICY_META_KEY, [context.getHandler(), context.getClass()]);

    if (!meta) {
      return false;
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;
    const pageId = request.params?.[meta.param ?? 'id'];

    if (!userId || !pageId) {
      return false;
    }

    return await this.accessControl.canAccessPage(
      meta.permission,
      userId,
      pageId,
    );
  }
}
