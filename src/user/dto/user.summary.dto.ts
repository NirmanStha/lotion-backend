import { Expose } from 'class-transformer';

export class UserSummaryDto {
  @Expose()
  id!: string;

  @Expose()
  firstName!: string;

  @Expose()
  lastName!: string;

  @Expose()
  username!: string;

  @Expose()
  profilePic?: string;
}
