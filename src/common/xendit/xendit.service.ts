import { Injectable } from '@nestjs/common';
import { XenditUtil } from '../utils/xendit.util';
import {
  CreateRecurringPlan,
  RecurringSchedule,
  RecurringPlanData,
  RecurringCycleData,
} from '../interfaces/xendit.interface';
import { map, catchError, firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import Xendit from 'xendit-node';
import { Customer } from 'xendit-node/customer/models';
import { CustomerApi } from 'xendit-node/customer/apis';
import { User } from 'src/database/entities/user.entity';
import { randomUUID } from 'node:crypto';
import LoggerService from '../logger/logger.service';
import { UpgradeStrategy } from '../enums/upgrade-strategy.enum';
import Plan from 'src/database/entities/plan.entity';
import { PlansEnum } from '../enums/plans.enum';
import { PaymentRequestApi } from 'xendit-node/payment_request/apis';
import { PaymentRequest } from 'xendit-node/payment_request/models';
import { TransactionApi } from 'xendit-node/balance_and_transaction/apis';
import { TransactionResponse } from 'xendit-node/balance_and_transaction/models';

@Injectable()
export class XenditService {
  private readonly xenHttp: HttpService;
  private readonly xenClient: Xendit;
  private readonly xenCustomer: CustomerApi;
  private readonly xenPaymentRequest: PaymentRequestApi;
  private readonly xenTransaction: TransactionApi;

  constructor(
    xenUtil: XenditUtil,
    private readonly logger: LoggerService,
  ) {
    this.xenHttp = xenUtil.httpClient();
    this.xenClient = xenUtil.client();
    this.xenCustomer = this.xenClient.Customer;
    this.xenPaymentRequest = this.xenClient.PaymentRequest;
    this.xenTransaction = this.xenClient.Transaction;
  }

  resolveRequestRecurringPlan(
    referenceId: string,
    strategy: UpgradeStrategy,
    previousPlan: PlansEnum,
    newPlan: Plan,
    schedule: Pick<RecurringSchedule, 'interval_count' | 'interval'>,
    totalAmount: number,
    customer_id: string,
    user: User,
  ): CreateRecurringPlan {
    return {
      reference_id: referenceId,
      amount: totalAmount,
      currency: 'IDR',
      description: `Subscription for ${user.email}`,
      customer_id,
      recurring_action: 'PAYMENT',
      schedule: {
        ...schedule,
        reference_id: `${newPlan.name}-${schedule.interval}-${randomUUID()}-${Date.now()}`,
        anchor_date: new Date().toISOString(),
        failed_attempt_notifications: [1, 2, 3],
        retry_interval: 'DAY',
        retry_interval_count: 3,
        total_recurrence: 3,
        total_retry: 3,
      },
      immediate_action_type: 'FULL_AMOUNT',
      items: [
        {
          name: `Envlink ${newPlan.name} Plan`,
          type: 'DIGITAL_PRODUCT',
          net_unit_amount: totalAmount,
          category: 'subscription',
          quantity: 1,
          description: newPlan.description || undefined,
        },
      ],

      metadata: {
        strategy,
        previousPlan,
        newPlan: newPlan.name,
      },
      notification_config: {
        recurring_created: ['EMAIL'],
        recurring_failed: ['EMAIL'],
        recurring_succeeded: ['EMAIL'],
        locale: 'en',
      },
      failed_cycle_action: 'RESUME',
      payment_link_for_failed_attempt: true,
      success_return_url: 'https://tamamhuda.dev',
      failure_return_url: 'https://tamamhuda.dev',
    };
  }

  async createRecurringPlan(
    body: CreateRecurringPlan,
  ): Promise<RecurringPlanData> {
    return await firstValueFrom(
      this.xenHttp.post<RecurringPlanData>('/recurring/plans', body).pipe(
        map((response) => response.data),
        catchError((error) => {
          this.logger.error(JSON.stringify(error.stack));
          throw new Error(`Failed to create recurring plan: ${error.message}`);
        }),
      ),
    );
  }

  async getRecurringPlanById(id: string): Promise<RecurringPlanData> {
    return await firstValueFrom(
      this.xenHttp.get<RecurringPlanData>(`/recurring/plans/${id}`).pipe(
        map((response) => response.data),
        catchError((error) => {
          throw new Error(`Failed to get recurring plan: ${error.message}`);
        }),
      ),
    );
  }

  async getCustomerById(id: string): Promise<Customer | null> {
    const { data, hasMore } = await this.xenCustomer.getCustomerByReferenceID({
      referenceId: id,
    });

    if (!hasMore && data && data.length > 0) {
      return data[0];
    }
    return null;
  }

  assignCustomerReferenceId(userId: string): string {
    return `xen_customer-${userId}`;
  }

  private async createCustomer(user: User) {
    const { email, fullName, phoneNumber } = user;
    const referenceId = this.assignCustomerReferenceId(user.id);
    const customer = await this.xenCustomer.createCustomer({
      data: {
        referenceId,
        clientName: fullName,
        email,
        phoneNumber: phoneNumber || undefined,
        type: 'INDIVIDUAL',
        individualDetail: {
          givenNames: fullName,
        },
      },
    });
    return customer;
  }

  async getOrCreateCustomer(user: User) {
    try {
      const { id: userId } = user;
      const referenceId = this.assignCustomerReferenceId(userId);
      let customer = await this.getCustomerById(referenceId);
      if (!customer) {
        customer = await this.createCustomer(user);
      }
      return customer;
    } catch (error) {
      this.logger.error(`${JSON.stringify(error, null, 2)}`, error);
      throw new Error(`Failed to get or create customer: ${error.message}`);
    }
  }

  async getPaymentRequestById(
    paymentRequestId: string,
  ): Promise<PaymentRequest> {
    try {
      const paymentRequest = await this.xenPaymentRequest.getPaymentRequestByID(
        {
          paymentRequestId,
        },
      );
      return paymentRequest;
    } catch (error) {
      throw new Error(`Failed to get payment request: ${error.message}`);
    }
  }

  async getTransactionByReferenceId(
    referenceId: string,
  ): Promise<TransactionResponse> {
    try {
      const { hasMore, data } = await this.xenTransaction.getAllTransactions({
        referenceId,
      });
      if (!hasMore && data.length === 1) {
        return data[0];
      }
      throw new Error(`Transaction not found`);
    } catch (error) {
      throw new Error(`Failed to get transaction: ${error.message}`);
    }
  }

  async getListRecurringCyclesByRecyrringPlanId(
    planId: string,
  ): Promise<RecurringCycleData[]> {
    return await firstValueFrom(
      this.xenHttp
        .get<{
          hasMore: boolean;
          data: RecurringCycleData[];
        }>(`/recurring/plans/${planId}/cycles`)
        .pipe(
          map(({ data }) => data.data),
          catchError((error) => {
            this.logger.error(`${JSON.stringify(error, null, 2)}`, error);
            throw new Error(`Failed to get recurring cycles: ${error.message}`);
          }),
        ),
    );
  }
}
