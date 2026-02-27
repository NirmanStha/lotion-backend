import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Auth } from './entities/auth.entity';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Auth, User]),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET || 'dev-secret',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
