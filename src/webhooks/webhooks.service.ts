import { BadRequestException, Injectable } from '@nestjs/common';
import { OkDto } from 'src/common/dto/response.dto';
import {
  PaymentMethodCallback,
  RecurringCycleCallback,
  RecurringPlanCallback,
} from 'src/common/interfaces/xendit.interface';
import { PaymentMethodsService } from 'src/payment-methods/payment-methods.service';
import { SubscriptionsCallbackService } from 'src/subscriptions/subscriptions-callback.service';

@Injectable()
export class WebhooksService {
  constructor(
    private readonly subscriptionCallbackService: SubscriptionsCallbackService,
    private readonly paymentMethodsService: PaymentMethodsService,
  ) {}

  async handleXenditPaymentMethods(
    body: PaymentMethodCallback,
  ): Promise<OkDto> {
    return await this.paymentMethodsService.handlePaymentMethodCallback(body);
  }

  async handleXenditRecurring(
    body: RecurringCycleCallback | RecurringPlanCallback,
  ): Promise<OkDto> {
    const { event } = body;

    if (event.includes('recurring.plan')) {
      return await this.subscriptionCallbackService.handleRecurringPlan(
        body as RecurringPlanCallback,
      );
    } else if (event.includes('recurring.cycle')) {
      return await this.subscriptionCallbackService.handleRecurringCycle(
        body as RecurringCycleCallback,
      );
    } else {
      throw new BadRequestException('Invalid event');
    }
  }
}
