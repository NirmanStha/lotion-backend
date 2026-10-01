import { IsOptional, IsUUID } from 'class-validator';

/**
 * Moves a page into a different workspace. Kept separate from `MovePageDto`
 * because reparenting within a workspace only needs `PagePermissionEnum.MOVE`
 * on the page, while crossing a workspace boundary also needs create rights
 * in the destination.
 */
export class TransferPageDto {
  @IsUUID()
  workspaceId!: string;

  @IsOptional()
  @IsUUID()
  parentPageId?: string | null;
}
