import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Url } from './url.entity';
import { Analytic } from './analytic.entity';

@Entity({ name: 'channels' })
export class Channel extends BaseEntity {
  @Column({ type: 'varchar', length: 64 })
  name!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string;

  @OneToMany(() => Url, (url) => url.channel)
  urls!: Url[];

  @OneToMany(() => Analytic, (analythic) => analythic.channel)
  analytics!: Analytic[];
}
