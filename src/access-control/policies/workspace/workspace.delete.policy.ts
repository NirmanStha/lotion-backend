import { ExecutionContext, Injectable } from '@nestjs/common';
import { AccessControlService } from 'src/access-control/access-control.service';
import { WorkspacePermission } from 'src/access-control/enums/permission.enum';
import { IPolicyHandler } from 'src/access-control/interface/policy-handler.interface';

@Injectable()
export class DeleteWorkspacePolicy implements IPolicyHandler {
	constructor(private readonly accessControl: AccessControlService) {}

	async handle(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const userId = request.user?.userId;
		const workspaceId = request.params?.id;

		if (!userId || !workspaceId) {
			return false;
		}

		return this.accessControl.canAccessWorkspace(
			userId,
			workspaceId,
			WorkspacePermission.DELETE,
		);
	}
}
