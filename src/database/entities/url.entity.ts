import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

import { Channel } from './channel.entity';
import { Analytic } from './analytic.entity';

@Entity({ name: 'urls' })
export class Url extends BaseEntity {
  @Column({ type: 'varchar', unique: true })
  code!: string;

  @Column({
    type: 'text',
    nullable: false,
  })
  originalUrl!: string;

  @Column({
    type: 'boolean',
    default: false,
  })
  isAnonymous!: boolean;

  @Column({
    type: 'boolean',
    default: false,
  })
  isProtected!: boolean;

  @Column({
    type: 'text',
    nullable: true,
    default: null,
  })
  accessCode!: string | null;

  @Column({
    type: 'timestamp',
    nullable: true,
    default: null,
  })
  expiresAt!: Date | null;

  @Column({
    type: 'int',
    default: 0,
  })
  clickCount!: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: {
    title?: string;
    description?: string;
    image?: string;
    favicon?: string;
    siteName?: string;
  } | null;

  @ManyToOne(() => User, (user) => user.urls, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  user!: User;

  @OneToMany(() => Analytic, (analytic) => analytic.url, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  analytics!: Analytic[];

  @ManyToOne(() => Channel, (channel) => channel.urls, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  channel!: Channel;
}
