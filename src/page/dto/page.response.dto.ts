import { Expose, Type } from 'class-transformer';
import { UserSummaryDto } from 'src/user/dto/user.summary.dto';
import { WorkspaceResponseDto } from 'src/workspace/dto/api-workspace.dto';

export class PageSummaryDto {
  @Expose()
  id!: string;

  @Expose()
  title!: string;
}

export class PageResponseDto {
  @Expose()
  id!: string;

  @Expose()
  title!: string;

  @Expose()
  icon?: string;

  @Expose()
  coverImage?: string;

  @Expose()
  content!: Record<string, unknown>;

  @Expose()
  isPublished!: boolean;

  @Expose()
  isArchived!: boolean;

  @Expose()
  inheritPermissions!: boolean;

  @Expose()
  @Type(() => PageSummaryDto)
  parentPage?: PageSummaryDto;

  @Expose()
  @Type(() => WorkspaceResponseDto)
  workspace!: WorkspaceResponseDto;

  @Expose()
  @Type(() => UserSummaryDto)
  createdBy!: UserSummaryDto;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;
}