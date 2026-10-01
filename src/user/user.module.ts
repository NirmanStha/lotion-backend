import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auth } from 'src/auth/entities/auth.entity';
import { User } from './entities/user.entity';
import { SuperAdminBootstrapService } from './super-admin-bootstrap.service';
@Module({
  imports: [TypeOrmModule.forFeature([User, Auth])],
  controllers: [UserController],
  providers: [UserService, SuperAdminBootstrapService],
})
export class UserModule {}
