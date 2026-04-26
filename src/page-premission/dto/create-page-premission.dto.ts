import { IsEnum, IsUUID } from 'class-validator';
import { PageRole } from '../entities/page-premission.entity';

export class CreatePagePremissionDto {
	@IsUUID()
	pageId!: string;

	@IsUUID()
	userId!: string;

	@IsEnum(PageRole)
	role!: PageRole;

	@IsUUID()
	grantedbyId!: string;
}
