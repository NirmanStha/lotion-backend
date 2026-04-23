import { Page } from 'src/page/entities/page.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PageRole {
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER',
}
@Entity()
export class PagePremission {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Page, { onDelete: 'CASCADE' })
  page!: Page;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user!: User;

  @Column({ type: 'enum', enum: PageRole })
  role!: PageRole;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  grantedby!: User;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
