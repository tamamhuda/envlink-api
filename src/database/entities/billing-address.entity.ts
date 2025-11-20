import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity({ name: 'billing_address' })
export class BillingAddress extends BaseEntity {
  @ManyToOne(() => User, (user) => user.billingAddresses)
  user!: User;

  @Column({ type: 'varchar', length: 100, nullable: true })
  customName!: string | null;

  @Column({ type: 'varchar', length: 100 })
  firstName!: string;

  @Column({ type: 'varchar', length: 100 })
  lastName!: string;

  @Column({ type: 'varchar', length: 255 })
  street1!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  street2?: string | null;

  @Column({ type: 'varchar', length: 100 })
  city!: string;

  @Column({ type: 'varchar', length: 50 })
  state!: string;

  @Column({ type: 'varchar', length: 50 })
  country!: string;

  @Column({ type: 'varchar', length: 10 })
  zipCode!: string;

  @Column({ type: 'varchar', length: 20 })
  phone!: string;

  @Column({ type: 'boolean', default: false })
  isDefault!: boolean;
}
