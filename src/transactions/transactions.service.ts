import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TransactionRepository } from 'src/database/repositories/transaction.repository';
import { TransactionDto, transactionStatusSchema } from './dto/transaction.dto';
import { Transaction } from 'src/database/entities/transaction.entity';
import { TransactionStatus } from 'src/common/enums/transaction-status.enum';
import LoggerService from 'src/infrastructure/logger/logger.service';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly logger: LoggerService,
  ) {}

  private mapTransactionToDto(transaction: Transaction): TransactionDto {
    const { subscriptionCycle, user, subscription, paymentMethod, ...rest } =
      transaction;
    return {
      ...rest,
      subscriptionId: subscription.id,
      userId: user.id,
      cycleId: subscriptionCycle.id,
      paymentMethodId: paymentMethod.id,
    };
  }

  async getAllTransactions(
    userId: string,
    params: {
      startDate?: Date;
      endDate?: Date;
      status?: TransactionStatus[];
    },
  ): Promise<TransactionDto[]> {
    const statusError = transactionStatusSchema.safeParse(params.status).error;
    if (statusError) {
      throw new BadRequestException(
        "Validation failed (Invalid enum value. Expected 'PENDING' | 'PAID' | 'FAILED' | 'REFUSED' | 'REFUNDED')",
      );
    }
    return (
      await this.transactionRepository.findAllByUserIdWithFilters(
        userId,
        params,
      )
    ).map((transaction) => this.mapTransactionToDto(transaction));
  }

  async getTransactionById(
    id: string,
    userId: string,
  ): Promise<TransactionDto> {
    const transaction = await this.transactionRepository.findOneByIdAndUserId(
      id,
      userId,
    );
    if (!transaction) throw new NotFoundException(`Transaction not found`);

    return this.mapTransactionToDto(transaction);
  }
}
