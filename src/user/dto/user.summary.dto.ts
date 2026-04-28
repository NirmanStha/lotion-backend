import { Expose, Transform, Type } from 'class-transformer';
import { Auth } from 'src/auth/entities/auth.entity';

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

  @Expose()
  @Transform(({ obj }) => obj.authProviders?.[0]?.email || null)
  email!: string;
}
