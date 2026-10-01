import { IsEnum, IsUUID } from 'class-validator';
import { PageRole } from '../entities/page-premission.entity';

export class CreatePagePremissionDto {
  @IsUUID()
  pageId!: string;

  @IsUUID()
  userId!: string;

  @IsEnum(PageRole)
  role!: PageRole;

  /**
   * Accepted for signature compatibility but ignored: the service records
   * the authenticated caller as the grantor so the audit trail cannot be
   * forged from the request body.
   */
  @IsUUID()
  grantedbyId!: string;
}
