import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { OAuthLoginDto, RegisterLocalDto } from './dto/create-auth.dto';
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

  private async generateTokens(user: User) {
    const payload = { sub: user.id, username: user.username };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async saveRefreshToken(userId: string, refreshToken: string | null) {
    const hashed = refreshToken ? await bcrypt.hash(refreshToken, 10) : null;

    await this.authRepo.update(
      { user: { id: userId }, provider: 'local' },
      { refreshToken: hashed },
    );
  }

  async registerLocal(dto: RegisterLocalDto) {
    const { email, username, password } = dto;

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

      return { message: 'Registered successfully' };
    });
  }

  async loginLocal(email: string, password: string) {
    const auth = await this.authRepo.findOne({
      where: { provider: 'local', providerId: email },
      relations: ['user'],
    });
    if (!auth) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(password, auth.password);
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.generateTokens(auth.user);
    await this.saveRefreshToken(auth.user.id, tokens.refreshToken);

    return tokens;
  }

  async refreshToken(token: string) {
    let payload: any;

    try {
      payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const auth = await this.authRepo.findOne({
      where: { user: { id: payload.sub }, provider: 'local' },
      relations: ['user'],
    });
    if (!auth?.refreshToken) throw new UnauthorizedException('Token revoked');

    const tokenMatches = await bcrypt.compare(token, auth.refreshToken);
    if (!tokenMatches) throw new UnauthorizedException('Token mismatch');

    const tokens = await this.generateTokens(auth.user);
    await this.saveRefreshToken(auth.user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string) {
    await this.saveRefreshToken(userId, null);
    return { message: 'Logged out' };
  }

  async OAuthLogin(dto: OAuthLoginDto) {
    throw new Error('OAuth login not implemented yet');
  }
}
