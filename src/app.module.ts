import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UserModule } from './user/user.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { PageModule } from './page/page.module';
import { CollaboratorModule } from './collaborator/collaborator.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    UserModule,
    WorkspaceModule,
    PageModule,
    CollaboratorModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
