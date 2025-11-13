import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { PaymentMethodData } from 'src/common/interfaces/xendit.interface';
import { PaymentMethodType } from 'src/common/enums/payment-method-type.enum';
import { Transaction } from './transaction.entity';
import { SubscriptionCycle } from './subscription-cycle.entity';
import { createHash } from 'crypto';
import { PaymentMethodStatus } from 'src/common/enums/payment-method-status.enum';

@Entity({ name: 'payment_methods' })
@Index(['externalId', 'customerId', 'accountIdentityHash'], { unique: true })
export class PaymentMethod extends BaseEntity {
  @ManyToOne(() => User, (user) => user.paymentMethods, { onDelete: 'CASCADE' })
  user!: User;

  @OneToMany(() => Transaction, (transaction) => transaction.paymentMethod)
  transactions!: Transaction[];

  @OneToMany(
    () => SubscriptionCycle,
    (subscriptionCycle) => subscriptionCycle.paymentMethod,
    {
      onDelete: 'SET NULL',
    },
  )
  subscriptionCycles!: SubscriptionCycle[];

  @Column({ type: 'varchar' })
  externalId!: string; // pm-xxxx from Xendit

  @Column({ type: 'varchar' })
  customerId!: string; // Xendit customer_id

  @Column({ type: 'enum', enum: PaymentMethodType })
  type!: PaymentMethodType;

  @Column({ type: 'varchar', nullable: true })
  reusability!: string | null; // MULTIPLE_USE, SINGLE_USE, etc.

  @Column({ type: 'varchar', nullable: true })
  accountIdentityHash!: string | null;

  // ---- Common Fields ----
  @Column({ type: 'varchar', nullable: true })
  country!: string | null;

  @Column({ type: 'varchar', nullable: true })
  currency!: string | null;

  @Column({ type: 'enum', enum: PaymentMethodStatus, nullable: true })
  status!: PaymentMethodStatus; // ACTIVE, FAILED, EXPIRED

  @Column({ type: 'varchar', nullable: true })
  channelCode!: string | null; // e.g. OVO, DANA, BRI, BPI, etc.

  @Column({ type: 'varchar', nullable: true })
  provider!: string | null; // Issuer, bank, or ewallet provider name

  @Column({ type: 'varchar', nullable: true })
  failureCode!: string | null;

  @Column({ type: 'varchar', nullable: true })
  customName!: string | null;

  // ---- Card Fields ----
  @Column({ type: 'varchar', nullable: true })
  network!: string | null; // VISA, MASTERCARD, etc.

  @Column({ type: 'varchar', nullable: true })
  issuer!: string | null;

  @Column({ type: 'varchar', nullable: true })
  cardType!: string | null; // CREDIT, DEBIT

  @Column({ type: 'varchar', nullable: true })
  maskedCardNumber!: string | null;

  @Column({ type: 'varchar', nullable: true })
  expiryMonth!: string | null;

  @Column({ type: 'varchar', nullable: true })
  expiryYear!: string | null;

  @Column({ type: 'varchar', nullable: true })
  cardHolderName!: string | null;

  // ---- Direct Debit / Bank Account ----
  @Column({ type: 'varchar', nullable: true })
  bankAccountNumber!: string | null;

  @Column({ type: 'varchar', nullable: true })
  bankAccountHash!: string | null;

  // ---- E-Wallet / OTC / QR ----
  @Column({ type: 'varchar', nullable: true })
  accountName!: string | null;

  @Column({ type: 'varchar', nullable: true })
  accountNumber!: string | null;

  @Column({ type: 'varchar', nullable: true })
  paymentCode!: string | null;

  @Column({ type: 'varchar', nullable: true })
  qrString!: string | null;

  @Column({ type: 'varchar', nullable: true })
  expiresAt!: string | null;

  // ---- Recurring Info ----
  @Column({ type: 'timestamptz', nullable: true })
  recurringExpiry!: Date | null;

  @Column({ type: 'int', nullable: true })
  recurringFrequency!: number | null;

  // ---- Flags ----
  @Column({ type: 'boolean', default: false })
  isDefault!: boolean;

  @Column({ type: 'int', default: 1 })
  rank!: number;

  @Column({ type: 'boolean', default: true })
  isRecurring!: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, any> | null;

  @BeforeInsert()
  @BeforeUpdate()
  setAccountIdentityHash() {
    this.accountIdentityHash = this.hashIdentity(this.getAccountIdentity());
  }

  getAccountIdentityHash(): string {
    return this.hashIdentity(this.getAccountIdentity());
  }

  // ---- Logic builders ----
  private getAccountIdentity(): string {
    switch (this.type) {
      case PaymentMethodType.CARD:
        // Uniqueness by card details
        return [
          this.user.id,
          this.cardType ?? 'UNKNOWN',
          this.maskedCardNumber ?? '****',
          this.expiryMonth ?? 'MM',
          this.expiryYear ?? 'YY',
        ].join(':');

      case PaymentMethodType.EWALLET:
      case PaymentMethodType.DIRECT_DEBIT:
        // Uniqueness by user + channelCode
        return `${this.user.id}:${this.channelCode ?? 'UNKNOWN'}`;

      default:
        return `${this.user.id}:${this.channelCode ?? 'UNKNOWN'}`;
    }
  }

  private hashIdentity(identity: string): string {
    return createHash('sha256').update(identity).digest('hex');
  }

  assignPaymentMethodByType(type: PaymentMethodType, data: PaymentMethodData) {
    const { card, ewallet, direct_debit } = data;
    switch (type) {
      case PaymentMethodType.CARD:
        this.network = card?.card_information?.network || null;
        this.cardHolderName = card?.card_information?.cardholder_name || null;
        this.maskedCardNumber =
          card?.card_information?.masked_card_number || null;
        this.expiryMonth = card?.card_information?.expiry_month || null;
        this.expiryYear = card?.card_information?.expiry_year || null;
        this.currency = card?.currency || null;
        this.issuer = card?.card_information?.issuer || null;
        this.network = card?.card_information?.network || null;
        this.cardType = card?.card_information.type || null;
        break;

      case PaymentMethodType.EWALLET:
        this.accountName = ewallet?.account?.name || null;
        this.accountNumber = ewallet?.account?.account_details || null;
        this.channelCode = ewallet?.channel_code || null;
        break;

      case PaymentMethodType.DIRECT_DEBIT:
        this.network = direct_debit?.type || null;
        this.bankAccountHash =
          direct_debit?.bank_account?.bank_account_hash || null;
        this.bankAccountNumber =
          direct_debit?.bank_account?.masked_bank_account_number || null;
        this.channelCode = direct_debit?.channel_code || null;
        break;
    }
  }

  getSummary() {
    let paymentMethodType: string | null = null;
    let lastNumber: string | null = null;
    let paymentMethodDisplay: string | null = null;

    switch (this.type) {
      case PaymentMethodType.CARD: {
        const network = this.network || 'Card';
        paymentMethodType = network;
        // Extract last 4 digits (from **** **** **** 4242)
        const match = this.maskedCardNumber?.match(/(\d{4})$/);
        lastNumber = match ? match[1] : null;
        paymentMethodDisplay = lastNumber
          ? `${network} ending •••• ${lastNumber}`
          : network;
        break;
      }

      case PaymentMethodType.EWALLET: {
        const channel = this.channelCode?.toUpperCase() || 'E-Wallet';
        paymentMethodType = channel;
        lastNumber = this.accountNumber ? this.accountNumber.slice(-4) : null;
        paymentMethodDisplay = lastNumber
          ? `${channel} Wallet •••• ${lastNumber}`
          : `${channel} Wallet`;
        break;
      }

      case PaymentMethodType.DIRECT_DEBIT: {
        const bank = this.channelCode || this.provider || 'Bank';
        paymentMethodType = bank;
        lastNumber = this.bankAccountNumber
          ? this.bankAccountNumber.slice(-4)
          : null;
        paymentMethodDisplay = lastNumber
          ? `${bank} account •••• ${lastNumber}`
          : `${bank} account`;
        break;
      }

      default:
        paymentMethodType = 'Unknown';
        paymentMethodDisplay = 'Unknown payment method';
        break;
    }

    return {
      paymentMethodType,
      lastNumber,
      currency: this.currency || 'IDR',
      paymentMethodDisplay,
    };
  }
}
