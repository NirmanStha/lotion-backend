import { PartialType, OmitType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreatePageDto } from './create-page.dto';

/**
 * `workspaceId` and `parentPageId` are intentionally omitted:
 * - a page cannot change workspace through an update (see `TransferPageDto`)
 * - a page cannot be reparented through an update (see `MovePageDto`)
 *
 * `isPublished` and `isArchived` are accepted here for convenience, but the
 * service additionally verifies `page:publish` / `page:archive` before
 * honouring a change to them, so a caller with only `page:update` cannot
 * flip either flag.
 */
export class UpdatePageDto extends PartialType(
  OmitType(CreatePageDto, ['workspaceId', 'parentPageId'] as const),
) {
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;
}
