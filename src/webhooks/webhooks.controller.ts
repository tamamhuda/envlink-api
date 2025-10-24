import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import {
  PaymentMethodCallback,
  RecurringCycleCallback,
  RecurringPlanCallback,
} from 'src/common/interfaces/xendit.interface';
import { SkipThrottle } from 'src/common/throttle/decorators/skip-throttle.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { ApiOkResponse } from '@nestjs/swagger';
import { OkDto, OkResponse } from 'src/common/dto/response.dto';
import { ZodSerializerDto } from 'nestjs-zod';
import LoggerService from 'src/common/logger/logger.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(
    private readonly webhooksService: WebhooksService,
    private readonly logger: LoggerService,
  ) {}

  @SkipThrottle()
  @Public()
  @Post('xendit/payment_methods')
  @ApiOkResponse({
    type: OkResponse,
    description: 'successfully handling payment methods callback data',
  })
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(OkDto)
  async handleXenditPaymentMethods(
    @Body() body: PaymentMethodCallback,
  ): Promise<OkDto> {
    return await this.webhooksService.handleXenditPaymentMethods(body);
  }

  @SkipThrottle()
  @Public()
  @Post('xendit/recurring')
  @ApiOkResponse({
    type: OkResponse,
    description: 'successfully handling recurring plan callback data',
  })
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(OkDto)
  async handleXenditRecurring(
    @Body() body: RecurringCycleCallback | RecurringPlanCallback,
  ): Promise<OkDto> {
    return await this.webhooksService.handleXenditRecurring(body);
  }

  // @SkipThrottle()
  // @Public()
  // @Post('midtrans/recurring')
  // @ApiOkResponse({
  //   type: OkResponse,
  //   description: 'successfully handling recurring plan callback data',
  // })
  // @HttpCode(HttpStatus.OK)
  // @ZodSerializerDto(OkDto)
  // async handleMidtransRecurring(
  //   @Body() body: Record<string, any>,
  // ): Promise<OkDto> {
  //   this.logger.json('retrieved midtrans recurring plan callback data', body);
  //   return await Promise.resolve({ message: 'OK' });
  // }

  // @SkipThrottle()
  // @Public()
  // @Post('midtrans/notifications')
  // @ApiOkResponse({
  //   type: OkResponse,
  //   description: 'successfully handling notification callback data',
  // })
  // @HttpCode(HttpStatus.OK)
  // @ZodSerializerDto(OkDto)
  // async handleMidtransNotifications(
  //   @Body() body: Record<string, any>,
  // ): Promise<OkDto> {
  //   this.logger.json('retrieved midtrans notification callback data', body);
  //   return await Promise.resolve({ message: 'OK' });
  // }
}
