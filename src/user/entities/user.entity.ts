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

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  profilePic?: string;

  @Column({ nullable: true })
  age?: number;

  @OneToOne(() => Auth, (auth) => auth.user)
  auth: Auth;

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
