import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Auth } from 'src/auth/entities/auth.entity';
import { Workspace } from 'src/workspace/entities/workspace.entity';
import { WorkspaceCollaborator } from 'src/collaborator/entities/collaborator.entity';
import { Page } from 'src/page/entities/page.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ unique: true })
  username: string;

  @Column({ nullable: true })
  profilePic?: string;

  @Column({ nullable: true })
  age?: number;

  @OneToMany(() => Auth, (auth) => auth.user)
  authProviders: Auth[];

  @OneToMany(() => Workspace, (workspace) => workspace.owner)
  ownedWorkspaces: Workspace[];

  @OneToMany(() => WorkspaceCollaborator, (collab) => collab.user)
  collaborations: WorkspaceCollaborator[];

  @OneToMany(() => Page, (page) => page.createdBy)
  createdPages: Page[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
