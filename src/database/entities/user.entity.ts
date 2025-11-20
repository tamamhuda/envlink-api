import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';
import { RolesEnum } from '../../common/enums/roles.enum';
import { Account } from './account.entity';
import Session from './session.entity';
import { BaseEntity } from './base.entity';
import { Url } from './url.entity';
import { Channel } from './channel.entity';
import Subscription from './subscription.entity';
import { PlanUsage } from './plan-usage.entity';
import { Transaction } from './transaction.entity';
import { PaymentMethod } from './payment-method.entity';
import { SubscriptionHistory } from './subscription-history.entity';
import { v4 as uuidv4 } from 'uuid';
import { BillingAddress } from './billing-address.entity';

@Entity({ name: 'users' })
@Index(['username', 'email', 'externalId'], { unique: true })
export class User extends BaseEntity {
  constructor() {
    super();
    this.id = uuidv4();
  }

  @Column({
    type: 'varchar',
    nullable: true,
  })
  externalId!: string | null;

  @Column({
    type: 'varchar',
    length: 25,
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
  })
  email!: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  phoneNumber!: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  avatar!: string | null;

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

  @OneToMany(() => BillingAddress, (address) => address.user)
  billingAddresses!: BillingAddress[];

  @Column({ type: 'boolean', default: false })
  isTrial!: boolean;

  @OneToMany(() => Subscription, (sub) => sub.user)
  subscriptions!: Subscription[];

  @ManyToOne(() => Subscription, {
    nullable: true,
    eager: true,
    onDelete: 'SET NULL',
  })
  activeSubscription!: Subscription;

  @OneToMany(() => PlanUsage, (usage) => usage.user)
  usages!: PlanUsage[];

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions!: Transaction[];

  @OneToMany(() => PaymentMethod, (paymentMethod) => paymentMethod.user)
  paymentMethods!: PaymentMethod[];

  @OneToMany(() => SubscriptionHistory, (history) => history.user)
  subscriptionHistories!: SubscriptionHistory[];
}
