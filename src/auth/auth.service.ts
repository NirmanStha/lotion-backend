import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { OAuthLoginDto, RegisterLocalDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entities/user.entity';

import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth } from './entities/auth.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth)
    private readonly authRepo: Repository<Auth>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    private readonly jwtService: JwtService,
  ) {}
  //jwt generation and validation logic will go here
  private async generateTokens(user: User) {
    const payload = { sub: user.id, username: user.username };

    const accessToken = this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '15m',
    });
    const refreshToken = this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }
  private async saveRefreshToken(userId: string, refreshToken: string | null) {
    await this.authRepo.update(
      { user: { id: userId }, provider: 'local' },
      { refreshToken },
    );
  }

  async registerLocal(createAuthDto: RegisterLocalDto) {
    const { email, username, password } = createAuthDto;
    const existingUser = await this.authRepo.findOne({
      where: { provider: 'local', providerId: email },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    return this.authRepo.manager.transaction(async (manager) => {
      const user = this.userRepo.create({ username });
      await manager.save(user);

      const auth = this.authRepo.create({
        provider: 'local',
        providerId: email,
        username,
        email,
        password: hashedPassword,
        user,
      });
      await manager.save(auth);
      return auth;
    });
  }
  async loginLocal(email: string, password: string) {
    const auth = await this.authRepo.findOne({
      where: { provider: 'local', providerId: email },
      relations: ['user'],
    });
    if (!auth) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, auth.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(auth.user);
    await this.saveRefreshToken(auth.user.id, await tokens.refreshToken);
    return tokens;
  }
  async refreshToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      const user = await this.userRepo.findOne({ where: { id: payload.sub } });
      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }
      return this.generateTokens(user);
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async logout(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      await this.saveRefreshToken(payload.sub, null);
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async OAuthLogin(dto: OAuthLoginDto) {
    // This is a placeholder. You would need to verify the access token with the provider's API
    // and extract user info (like email) to find or create a user in your database.
    throw new Error('OAuth login not implemented yet');
  }
}
