import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { RolesEnum } from '../../common/enums/roles.enum';
import { Account } from './account.entity';
import Session from './session.entity';
import { BaseEntity } from './base.entity';
import { Url } from './url.entity';
import { Channel } from './channel.entity';
import Subscription from './subscription.entity';
import { PlanUsage } from './plan-usage.entity';

@Entity({ name: 'users' })
@Index(['username', 'email'], { unique: true })
export class User extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 25,
    unique: true,
  })
  username!: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  fullName!: string;

  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
  })
  email!: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  phoneNumber?: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  avatar?: string;

  @Column({
    type: 'enum',
    enum: RolesEnum,
    default: RolesEnum.USER,
  })
  role!: RolesEnum;

  @OneToMany(() => Channel, (channel) => channel.user, { onDelete: 'CASCADE' })
  channels!: Channel[];

  @OneToMany(() => Account, (account) => account.user)
  accounts!: Account[];

  @OneToMany(() => Session, (session) => session.user)
  sessions!: Session[];

  @OneToMany(() => Url, (url) => url.user)
  urls!: Url[];

  @Column({ type: 'boolean', default: false })
  isTrial!: boolean;

  @OneToMany(() => Subscription, (sub) => sub.user, { cascade: true })
  subscriptions!: Subscription[];

  @ManyToOne(() => Subscription, { nullable: true, eager: true })
  activeSubscription!: Subscription;

  @OneToMany(() => PlanUsage, (usage) => usage.user)
  usages!: PlanUsage[];
}
