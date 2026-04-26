import { Expose, Type } from 'class-transformer';
import { UserSummaryDto } from 'src/user/dto/user.summary.dto';

export class WorkspaceResponseDto {
  @Expose()
  id!: string;

  @Expose()
  name!: string;

  @Expose()
  icon?: string;

  @Expose()
  description?: string;

  @Expose()
  @Type(() => UserSummaryDto)
  owner!: UserSummaryDto;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;
}

export class APIWorkspaceResponseDto extends WorkspaceResponseDto {}
