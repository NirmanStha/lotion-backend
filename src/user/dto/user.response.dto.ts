import { Expose } from 'class-transformer';
import { UserSummaryDto } from './user.summary.dto';

export class UserResponseDto extends UserSummaryDto {
  @Expose()
  age?: string;

  @Expose()
  isComplete!: boolean;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;
}
