import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { Account } from './account.entity';
import { BaseEntity } from './base.entity';

@Entity({ name: 'sessions' })
@Index(['refreshTokenHash'], { unique: true })
export default class Session extends BaseEntity {
  @Column({
    type: 'varchar',
    unique: true,
    nullable: true,
  })
  refreshTokenHash?: string;

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
