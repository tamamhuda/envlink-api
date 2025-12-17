import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

import { Channel } from './channel.entity';
import { Analytic } from './analytic.entity';
import { RedirectType } from 'src/common/enums/redirect-type.enum';

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
    type: 'varchar',
    nullable: true,
    default: null,
  })
  description?: string | null;

  @Column({
    type: 'enum',
    enum: RedirectType,
    default: RedirectType.DIRECT,
  })
  redirectType!: RedirectType;

  @Column({
    type: 'boolean',
    default: false,
  })
  isAnonymous!: boolean;

  @Column({
    type: 'boolean',
    default: false,
  })
  isPrivate!: boolean;

  @Column({
    type: 'boolean',
    default: false,
  })
  isArchived!: boolean;

  @Column({
    type: 'timestamptz',
    nullable: true,
    default: null,
  })
  archivedAt?: Date | null;

  @Column({
    type: 'varchar',
    nullable: true,
    unique: true,
  })
  alias?: string | null;

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
  accessCode?: string | null;

  @Column({
    type: 'timestamptz',
    nullable: true,
    default: null,
  })
  activeAt?: Date | null;

  @Column({
    type: 'timestamptz',
    nullable: true,
    default: null,
  })
  expiresAt?: Date | null;

  @Column({
    type: 'varchar',
    nullable: true,
    default: null,
  })
  expirationRedirect?: string | null;

  @Column({
    type: 'int',
    default: 0,
  })
  clickCount!: number;

  @Column({
    type: 'int',
    default: 0,
  })
  uniqueClicks!: number;

  @Column({
    type: 'int',
    default: null,
  })
  clickLimit?: number | null;

  @Column({
    type: 'int',
    default: 0,
  })
  impressionCount!: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    title?: string | null;
    url?: string | null;
    description?: string | null;
    image?: string | null;
    favicon?: string | null;
    site_name?: string | null;
    keywords?: string | null;
    type?: string | null;
    robots?: string | null;
    author?: string | null;
    [key: string]: any;
  } | null;

  @ManyToOne(() => User, (user) => user.urls, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  user?: User;

  @ManyToMany(() => Analytic, {
    cascade: ['insert', 'update', 'remove'],
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinTable()
  analytics!: Analytic[];

  @ManyToMany(() => Channel, (channel) => channel.urls)
  channels!: Channel[];
}
