import { TypeOrmModule } from '@nestjs/typeorm';
import { registerAs } from '@nestjs/config';
import { Page } from './page/entities/page.entity';
import { WorkspaceCollaborator } from './collaborator/entities/collaborator.entity';
import { Workspace } from './workspace/entities/workspace.entity';
import { User } from './user/entities/user.entity';
import { Auth } from './auth/entities/auth.entity';

export default registerAs(
  'database',
  (): TypeOrmModule => ({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME,
    password: String(process.env.DB_PASSWORD),
    database: process.env.DB_DATABASE,
    migrations: ['/../database/migrations/*{.ts,.js}'],
    entities: [Auth, User, Workspace, WorkspaceCollaborator, Page],
    synchronize: true, // Disable in production
  }),
);
