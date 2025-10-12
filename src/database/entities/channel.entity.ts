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

  @ManyToOne(() => User, (user) => user.channels, { onDelete: 'CASCADE' })
  user!: User;

  @ManyToMany(() => Url, {
    cascade: ['insert', 'update', 'remove'],
    onDelete: 'CASCADE',
  })
  @JoinTable()
  urls!: Url[];

  @ManyToMany(() => Analytic, {
    cascade: ['insert', 'update', 'remove'],
    onDelete: 'CASCADE',
  })
  @JoinTable()
  analytics!: Analytic[];
}
