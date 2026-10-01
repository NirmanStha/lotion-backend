import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.['access_token'],
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET')!,
    });
  }

  async validate(payload: any) {
    // Super-admin status is read from the database rather than trusted from
    // the token body: a claim set at login would keep granting admin rights
    // until the token expired, and could not be revoked at all.
    const user = await this.userRepo.findOne({
      where: { id: payload.sub },
      select: ['id', 'username', 'isSuperAdmin'],
    });

    // A token outlives the account it was issued for. Without this check a
    // deleted user's access token keeps authenticating until it expires.
    if (!user) {
      throw new UnauthorizedException('Account no longer exists');
    }

    return {
      userId: user.id,
      username: user.username,
      isSuperAdmin: user.isSuperAdmin,
    };
  }
}
