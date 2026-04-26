import { Expose, Type } from 'class-transformer';
import { PageRole } from '../entities/page-premission.entity';
import { UserSummaryDto } from 'src/user/dto/user.summary.dto';
import { PageSummaryDto } from 'src/page/dto/page.response.dto';

export class PagePremissionResponseDto {
  @Expose()
  id!: string;

  @Expose()
  role!: PageRole;

  @Expose()
  @Type(() => PageSummaryDto)
  page!: PageSummaryDto;

  @Expose()
  @Type(() => UserSummaryDto)
  user!: UserSummaryDto;

  @Expose()
  @Type(() => UserSummaryDto)
  grantedby!: UserSummaryDto;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;
}