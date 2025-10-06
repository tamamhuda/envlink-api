import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProviderEnum } from '../../common/enums/provider.enum';
import { User } from './user.entity';
import Session from './session.entity';

@Entity()
@Index(['provider', 'providerAccountId'], { unique: true })
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'enum', enum: ProviderEnum, default: ProviderEnum.LOCAL })
  provider!: ProviderEnum;

  @Column({ type: 'varchar' })
  providerAccountId!: string;

  // Local auth only
  @Column({ type: 'varchar', nullable: true })
  passwordHash?: string;

  @Column({ type: 'boolean', default: false })
  isVerified!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt?: Date;

  // Security
  @Column({ type: 'int', default: 0 })
  failedLoginAttempts!: number;

  @Column({ type: 'boolean', default: false })
  isLocked!: boolean;

  // Recovery
  @Column({ type: 'varchar', nullable: true })
  resetTokenHash?: string;

  @Column({ type: 'timestamp', nullable: true })
  resetTokenExpiresAt?: Date;

  // OAuth tokens
  @Column({ type: 'text', nullable: true })
  accessToken?: string;

  @Column({ type: 'text', nullable: true })
  refreshToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  accessTokenExpiresAt?: Date;

  // Metadata
  @Column({ type: 'varchar', nullable: true })
  providerEmail?: string;

  @Column({ type: 'varchar', nullable: true })
  providerUsername?: string;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => User, (user) => user.accounts, { onDelete: 'CASCADE' })
  user!: User;

  @OneToMany(() => Session, (session) => session.user)
  sessions!: Session[];
}
