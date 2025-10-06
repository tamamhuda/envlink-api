import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Account } from './account.entity';

@Entity()
@Index(['refreshTokenHash'], { unique: true })
export default class Session {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'varchar',
    unique: true,
    nullable: true,
  })
  refreshTokenHash?: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  accessToken?: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  userAgent?: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  ipLocation?: string;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  expiresAt?: Date;

  @Index()
  @Column({
    type: 'boolean',
    default: false,
  })
  isRevoked!: boolean;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  revokedAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => User, (user) => user.sessions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user!: User;

  @ManyToOne(() => Account, (account) => account.sessions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  account!: Account;
}
