import { Expose, Type } from 'class-transformer';
import { UserSummaryDto } from 'src/user/dto/user.summary.dto';

export class AuthResponseDto {
  @Expose()
  id!: string;

  @Expose()
  provider!: string;

  @Expose()
  providerId!: string;

  @Expose()
  email!: string;

  @Expose()
  @Type(() => UserSummaryDto)
  user!: UserSummaryDto;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;
}