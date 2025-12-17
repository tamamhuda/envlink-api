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
import { AnalyticType } from 'src/common/enums/analytic-type.enum';

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
    nullable: true,
  })
  referrer?: string | null;

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
    type: 'enum',
    enum: AnalyticType,
    default: AnalyticType.CLICK,
  })
  type!: AnalyticType;

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
