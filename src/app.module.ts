import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import databaseConfig from './database.config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { CollaboratorModule } from './collaborator/collaborator.module';
import { PageModule } from './page/page.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtStrategy } from './common/gaurd/jwt.auth.gaurd';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.get('database')!,
    }),
    AuthModule,
    UserModule,
    WorkspaceModule,
    CollaboratorModule,
    PageModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: JwtStrategy }],
})
export class AppModule {}
