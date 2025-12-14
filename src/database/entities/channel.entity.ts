import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Url } from './url.entity';
import { Analytic } from './analytic.entity';
import { User } from './user.entity';

@Entity({ name: 'channels' })
export class Channel extends BaseEntity {
  @Column({ type: 'varchar', length: 64 })
  name!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  badgeColor!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  badgeIcon!: string | null;

  @Column({ type: 'boolean', default: false })
  isStarred!: boolean;

  @ManyToOne(() => User, (user) => user.channels, { onDelete: 'CASCADE' })
  user!: User;

  @ManyToMany(() => Url, (url) => url.channels)
  @JoinTable({
    name: 'urls_channels_channels',
    joinColumn: {
      name: 'channelsId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'urlsId',
      referencedColumnName: 'id',
    },
  })
  urls!: Url[];

  @ManyToMany(() => Analytic, {
    cascade: ['insert', 'update', 'remove'],
    onDelete: 'CASCADE',
  })
  @JoinTable()
  analytics!: Analytic[];
}
