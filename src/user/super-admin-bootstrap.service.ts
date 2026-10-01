import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auth } from 'src/auth/entities/auth.entity';
import { User } from './entities/user.entity';

/**
 * Promotes the configured account to super admin at startup.
 *
 * Seeding happens here rather than through the API on purpose: there is no
 * endpoint that can grant the flag, so a fresh deployment cannot be
 * bootstrapped by an attacker who registers an account first. The email
 * must already exist - the flag is only ever attached to a known user.
 *
 * Set SUPER_ADMIN_EMAIL in the environment. Leaving it unset is safe: the
 * application starts with no administrators, and the flag can then be
 * granted directly in the database.
 */
@Injectable()
export class SuperAdminBootstrapService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SuperAdminBootstrapService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Auth)
    private readonly authRepo: Repository<Auth>,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const email = this.configService.get<string>('SUPER_ADMIN_EMAIL');

    if (!email) {
      this.logger.warn(
        'SUPER_ADMIN_EMAIL is not set - starting with no super admin. ' +
          'Grant access by setting user.isSuperAdmin = true directly in the database.',
      );
      return;
    }

    const auth = await this.authRepo.findOne({
      where: { email },
      relations: ['user'],
    });

    // The configured address is deliberately not echoed: it is the identity of
    // the most privileged account on the platform, and startup logs tend to be
    // shipped somewhere less protected than the database holding it.
    if (!auth?.user) {
      this.logger.warn(
        'Configured SUPER_ADMIN_EMAIL does not match a registered user - no super admin was seeded.',
      );
      return;
    }

    if (auth.user.isSuperAdmin) {
      return;
    }

    await this.userRepo.update(auth.user.id, { isSuperAdmin: true });
    // User id rather than email: it is enough to identify the account in the
    // database without printing the address into logs.
    this.logger.log(`Seeded super admin for user ${auth.user.id}`);
  }
}
