import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Workspace } from 'src/workspace/entities/workspace.entity';
import { User } from 'src/user/entities/user.entity';

export enum CollaboratorRole {
  OWNER = 'OWNER',
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER',
}

@Entity()
export class WorkspaceCollaborator {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Workspace, (workspace) => workspace.collaborators, {
    onDelete: 'CASCADE',
  })
  workspace: Workspace;

  @ManyToOne(() => User, (user) => user.collaborations, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Column({
    type: 'enum',
    enum: CollaboratorRole,
    default: CollaboratorRole.VIEWER,
  })
  role: CollaboratorRole;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
