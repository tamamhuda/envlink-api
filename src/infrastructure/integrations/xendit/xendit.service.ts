import { BadRequestException, Injectable } from '@nestjs/common';
import { XenditUtil } from './xendit.util';
import {
  CreateRecurringPlan,
  RecurringSchedule,
  RecurringPlanData,
  RecurringCycleData,
  RecurringPaymentMethod,
} from '../../../common/interfaces/xendit.interface';
import { map, catchError, firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import Xendit, { XenditSdkError } from 'xendit-node';
import { Customer } from 'xendit-node/customer/models';
import { CustomerApi } from 'xendit-node/customer/apis';
import { User } from 'src/database/entities/user.entity';
import { randomUUID } from 'node:crypto';
import LoggerService from 'src/infrastructure/logger/logger.service';
import Plan from 'src/database/entities/plan.entity';
import { PaymentRequestApi } from 'xendit-node/payment_request/apis';
import { PaymentRequest } from 'xendit-node/payment_request/models';

import { InvoiceApi } from 'xendit-node/invoice/apis';
import { AxiosError } from 'axios';
import { PaymentMethodApi } from 'xendit-node/payment_method/apis';
import { PaymentMethodParameters } from 'xendit-node/payment_method/models';
import { UrlGeneratorService } from 'nestjs-url-generator';

@Injectable()
export class XenditService {
  private readonly xenHttp: HttpService;
  private readonly xenClient: Xendit;
  private readonly xenCustomer: CustomerApi;
  private readonly xenPaymentRequest: PaymentRequestApi;
  private readonly xenInvoice: InvoiceApi;
  private readonly xenPaymentMethod: PaymentMethodApi;

  constructor(
    xenUtil: XenditUtil,
    private readonly logger: LoggerService,
    private readonly urlGenService: UrlGeneratorService,
  ) {
    this.xenHttp = xenUtil.httpClient();
    this.xenClient = xenUtil.client();
    this.xenCustomer = this.xenClient.Customer;
    this.xenPaymentRequest = this.xenClient.PaymentRequest;

    this.xenInvoice = this.xenClient.Invoice;
    this.xenPaymentMethod = this.xenClient.PaymentMethod;
  }

  resolveRequestRecurringPlan(
    referenceId: string,
    metadata: CreateRecurringPlan['metadata'],
    newPlan: Plan,
    schedule: Pick<
      RecurringSchedule,
      'interval_count' | 'interval' | 'total_recurrence'
    >,
    totalAmount: number,
    customer_id: string,
    payment_methods: RecurringPaymentMethod[],
    user: User,
    successReturnUrl?: string,
    failureReturnUrl?: string,
  ): CreateRecurringPlan {
    let success_return_url = successReturnUrl;
    let failure_return_url = failureReturnUrl;

    if (!success_return_url || !failure_return_url) {
      success_return_url = this.urlGenService.signUrl({
        relativePath: 'public/subscription/success',
      });
      failure_return_url = this.urlGenService.signUrl({
        relativePath: 'public/subscription/failure',
      });
    }
    return {
      reference_id: referenceId,
      amount: totalAmount,
      currency: 'IDR',
      description: `Subscription for ${user.email}`,
      customer_id,
      recurring_action: 'PAYMENT',
      payment_methods,
      schedule: {
        ...schedule,
        reference_id: `${newPlan.name}-${schedule.interval}-${randomUUID()}-${Date.now()}`,
        // anchor_date: new Date().toISOString(),
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
      metadata,
      notification_config: {
        recurring_created: ['EMAIL'],
        recurring_failed: ['EMAIL'],
        recurring_succeeded: ['EMAIL'],
        locale: 'en',
      },
      failed_cycle_action: 'RESUME',
      payment_link_for_failed_attempt: true,
      success_return_url,
      failure_return_url,
    };
  }

  async createRecurringPlan(
    body: CreateRecurringPlan,
  ): Promise<RecurringPlanData> {
    return await firstValueFrom(
      this.xenHttp.post<RecurringPlanData>('/recurring/plans', body).pipe(
        map((response) => response.data),
        catchError((error) => {
          let errorMsg = error.message;
          if (error instanceof AxiosError) {
            this.logger.error(JSON.stringify(error.response?.data.message));
            errorMsg = error.response?.data.message || errorMsg;
          }
          throw new Error(`Failed to create recurring plan: ${errorMsg}`);
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

  async deactivateRecurringPlan(id: string): Promise<RecurringPlanData> {
    return await firstValueFrom(
      this.xenHttp
        .post<RecurringPlanData>(`/recurring/plans/${id}/deactivate`)
        .pipe(
          map((response) => response.data),
          catchError((error) => {
            throw new Error(`Failed to deactivate plan: ${error.message}`);
          }),
        ),
    );
  }

  async getCustomerByReferenceId(id: string): Promise<Customer | null> {
    const { data, hasMore } = await this.xenCustomer.getCustomerByReferenceID({
      referenceId: id,
    });

    if (!hasMore && data && data.length > 0) {
      return data[0];
    }
    return null;
  }

  async createCustomer(user: User): Promise<Customer> {
    try {
      const { email, fullName, phoneNumber } = user;
      const referenceId = `xen_customer-${user.id}`;
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
    } catch (error) {
      if (error instanceof AxiosError) {
        this.logger.error(JSON.stringify(error.response, null, 2));
      }
      throw new Error(error);
    }
  }

  async getOrCreateCustomer(user: User) {
    try {
      const referenceId = `xen_customer-${user.id}`;
      let customer = await this.getCustomerByReferenceId(referenceId);
      if (!customer) {
        customer = await this.createCustomer(user);
      }
      return customer;
    } catch (error) {
      if (error instanceof XenditSdkError) {
        throw new BadRequestException(error.errorMessage);
      }
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
      if (error instanceof XenditSdkError) {
        throw new BadRequestException(error.errorMessage);
      }
      throw new Error(`Failed to get payment request: ${error.message}`);
    }
  }

  async getAllCyclesByRecurringPlanId(
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
            if (error instanceof XenditSdkError) {
              throw new BadRequestException(error.errorMessage);
            }
            throw new Error(`Failed to get recurring cycles: ${error.message}`);
          }),
        ),
    );
  }

  async getInvoiceById(id: string) {
    try {
      return await this.xenInvoice.getInvoiceById({
        invoiceId: id,
      });
    } catch (error) {
      if (error instanceof XenditSdkError) {
        throw new BadRequestException(error.errorMessage);
      }
      throw new Error(`Failed to get invoice: ${error.message}`);
    }
  }

  async createPaymentMethod(data: PaymentMethodParameters) {
    try {
      return await this.xenPaymentMethod.createPaymentMethod({ data });
    } catch (error) {
      if (error instanceof XenditSdkError) {
        throw new BadRequestException(error.errorMessage);
      }
      throw new Error(`Failed to create payment method: ${error.message}`);
    }
  }
}
