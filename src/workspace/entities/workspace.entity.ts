import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Page } from 'src/page/entities/page.entity';
import { WorkspaceCollaborator } from 'src/collaborator/entities/collaborator.entity';

@Entity()
export class Workspace {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  icon?: string;

  @Column({ nullable: true })
  description?: string;

  @ManyToOne(() => User, (user) => user.ownedWorkspaces, {
    onDelete: 'CASCADE',
  })
  owner: User;

  @OneToMany(() => Page, (page) => page.workspace)
  pages: Page[];

  @OneToMany(() => WorkspaceCollaborator, (collab) => collab.workspace)
  collaborators: WorkspaceCollaborator[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
