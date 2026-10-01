import { IsEnum } from 'class-validator';
import { PageRole } from '../entities/page-premission.entity';

/**
 * Only the role is mutable. The page, user, and grantor are fixed for the
 * lifetime of a grant - changing any of them means creating a new one, so
 * there is no way to re-point an existing grant at a different page.
 */
export class UpdatePagePremissionDto {
  @IsEnum(PageRole)
  role!: PageRole;
}
