import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import {
  PaymentMethodCallback,
  RecurringCycleCallback,
  RecurringPlanCallback,
} from 'src/common/interfaces/xendit.interface';
import { SkipThrottle } from 'src/common/throttle/decorators/skip-throttle.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OkDto, OkResponse } from 'src/common/dto/response.dto';
import { ZodSerializerDto } from 'nestjs-zod';
import LoggerService from 'src/common/logger/logger.service';
import { WebhookRequest } from './dto/webhook.dto';

@Controller('webhooks')
@ApiTags('Webhooks')
export class WebhooksController {
  constructor(
    private readonly webhooksService: WebhooksService,
    private readonly logger: LoggerService,
  ) {}

  @SkipThrottle()
  @Public()
  @Post('xendit/payment_methods')
  @ApiBody({
    type: WebhookRequest,
    description: 'Xendit payment methods callback data',
  })
  @ApiOperation({ summary: 'Handle Xendit payment methods callback data' })
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
  @ApiBody({
    type: WebhookRequest,
    description: 'Xendit recurring plan callback data',
  })
  @ApiOperation({ summary: 'Handle Xendit recurring plan callback data' })
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
}
