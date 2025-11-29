import {
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  ManyToOne,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Url } from './url.entity';
import { Channel } from './channel.entity';

@Entity({ name: 'analytics' })
@Index(['url', 'identityHash'], { unique: true })
@Index(['identityHash'])
@Index(['url'])
@Index(['createdAt'])
@Index('IDX_ANALYTIC_SEGMENTS', [
  'deviceType',
  'os',
  'browser',
  'country',
  'region',
  'city',
  'referrer',
])
export class Analytic extends BaseEntity {
  @Column({ type: 'varchar', length: 128, nullable: false })
  identityHash!: string;

  @Column({
    type: 'varchar',
    length: 64,
    nullable: false,
  })
  ipAddress!: string;

  @Column({
    type: 'varchar',
  })
  userAgent!: string;

  @Column({
    type: 'varchar',
    default: 'direct',
  })
  referrer!: string;

  @Column({
    type: 'varchar',
    length: 64,
  })
  region!: string;

  @Column({
    type: 'varchar',
    length: 64,
  })
  city!: string;

  @Column({
    type: 'varchar',
    length: 64,
    default: 'Unknown',
  })
  country!: string;

  @Column({
    type: 'varchar',
    length: 64,
    nullable: false,
  })
  language!: string;

  @Column({
    type: 'boolean',
    default: false,
  })
  isUnique!: boolean;

  @Column({
    type: 'varchar',
    length: 32,
  })
  deviceType!: string;

  @Column({
    type: 'varchar',
    length: 64,
    nullable: false,
  })
  os!: string;

  @Column({
    type: 'varchar',
    length: 64,
    nullable: false,
  })
  browser!: string;

  @Column({
    type: 'integer',
    default: 1,
  })
  visitorCount!: number;

  @ManyToOne(() => Url, (url) => url.id, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  url!: Url;

  @ManyToMany(() => Channel, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinTable()
  channels!: Channel[];
}
