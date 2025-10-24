import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { PaymentMethodData } from 'src/common/interfaces/xendit.interface';
import { PaymentMethodType } from 'src/common/enums/payment-method-type.enum';
import { Transaction } from './transaction.entity';

@Entity({ name: 'payment_methods' })
@Index(['externalId', 'customerId'], { unique: true })
export class PaymentMethod extends BaseEntity {
  @ManyToOne(() => User, (user) => user.paymentMethods, { onDelete: 'CASCADE' })
  user!: User;

  @OneToMany(() => Transaction, (transaction) => transaction.paymentMethod)
  transactions!: Transaction[];

  @Column({ type: 'varchar' })
  externalId!: string; // pm-xxxx from Xendit

  @Column({ type: 'varchar' })
  customerId!: string; // Xendit customer_id

  @Column({ type: 'enum', enum: PaymentMethodType })
  type!: PaymentMethodType;

  @Column({ type: 'varchar', nullable: true })
  reusability!: string | null; // MULTIPLE_USE, SINGLE_USE, etc.

  // ---- Common Fields ----
  @Column({ type: 'varchar', nullable: true })
  country!: string | null;

  @Column({ type: 'varchar', nullable: true })
  currency!: string | null;

  @Column({ type: 'varchar', nullable: true })
  status!: string | null; // ACTIVE, FAILED, EXPIRED

  @Column({ type: 'varchar', nullable: true })
  channelCode!: string | null; // e.g. OVO, DANA, BRI, BPI, etc.

  @Column({ type: 'varchar', nullable: true })
  provider!: string | null; // Issuer, bank, or ewallet provider name

  @Column({ type: 'varchar', nullable: true })
  failure_code!: string | null;

  @Column({ type: 'varchar', nullable: true })
  description!: string | null;

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

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, any> | null;

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
}
