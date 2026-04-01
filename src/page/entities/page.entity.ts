import { User } from 'src/user/entities/user.entity';
import { Workspace } from 'src/workspace/entities/workspace.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Page {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 'Untitled' })
  title: string;

  @Column({ nullable: true })
  icon?: string;

  @Column({ nullable: true })
  coverImage?: string;

  @Column({ type: 'jsonb', default: {} })
  content: any;

  @ManyToOne(() => Page, (page) => page.subPages, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  parentPage?: Page;

  @OneToMany(() => Page, (page) => page.parentPage)
  subPages: Page[];

  @ManyToOne(() => Workspace, (workspace) => workspace.pages, {
    onDelete: 'CASCADE',
  })
  workspace: Workspace;

  @ManyToOne(() => User, (user) => user.createdPages)
  createdBy: User;

  @Column({ default: false })
  isPublished: boolean;

  @Column({ default: false })
  isArchived: boolean;
  @Column({ default: true })
  inheritPermissions: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
