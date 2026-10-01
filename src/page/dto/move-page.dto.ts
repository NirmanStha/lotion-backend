import { IsOptional, IsUUID } from 'class-validator';

export class MovePageDto {
  /**
   * New parent for the page. Send `null` to promote the page to a root
   * page of its workspace. Omit entirely to reject the move.
   */
  @IsOptional()
  @IsUUID()
  parentPageId!: string | null;
}
