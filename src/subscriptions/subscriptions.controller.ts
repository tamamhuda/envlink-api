import {
  Controller,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Get,
  BadRequestException,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { UpgradeSubscriptionDto } from './dto/upgrade-subscription';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { JWT_SECURITY } from 'src/config/jwt.config';
import { SkipThrottle } from 'src/common/throttle/decorators/skip-throttle.decorator';
import {
  SubscriptionInfoDto,
  SubscriptionInfoResponse,
} from './dto/subscription.dto';
import { ZodSerializerDto } from 'nestjs-zod';
import { Public } from 'src/common/decorators/public.decorator';
import { OkDto, OkResponse } from 'src/common/dto/response.dto';
import LoggerService from 'src/common/logger/logger.service';
import {
  RecurringCycleCallback,
  RecurringPlanCallback,
} from 'src/common/interfaces/xendit.interface';

@ApiBearerAuth(JWT_SECURITY)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly logger: LoggerService,
  ) {}

  @SkipThrottle()
  @Post(':id/upgrade')
  @ApiCreatedResponse({
    type: SubscriptionInfoResponse,
    description: 'Subscription plan upgraded successfully',
  })
  @HttpCode(HttpStatus.CREATED)
  @ZodSerializerDto(SubscriptionInfoDto)
  async upgradeSubscriptionPlan(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpgradeSubscriptionDto,
  ): Promise<SubscriptionInfoDto> {
    return await this.subscriptionsService.upgradeSubscriptionPlan(id, body);
  }

  @SkipThrottle()
  @Get(':id')
  @ApiOkResponse({
    type: SubscriptionInfoResponse,
    description: 'successfully get subscription',
  })
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(SubscriptionInfoDto)
  async getSubscriptionById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SubscriptionInfoDto> {
    return await this.subscriptionsService.getSubscriptionById(id);
  }

  @SkipThrottle()
  @Public()
  @Post('/recurring-plans/callback')
  @ApiOkResponse({
    type: OkResponse,
    description: 'successfully handling recurring plan callback data',
  })
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(OkDto)
  async recurringPlanCallback(
    @Body() body: RecurringPlanCallback | RecurringCycleCallback,
  ): Promise<OkDto> {
    const { event } = body;

    if (event.includes('recurring.plan')) {
      return await this.subscriptionsService.handleRecurringPlan(
        body as RecurringPlanCallback,
      );
    } else if (event.includes('recurring.cycle')) {
      return await this.subscriptionsService.handleRecurringCycle(
        body as RecurringCycleCallback,
      );
    } else {
      throw new BadRequestException('Invalid event');
    }
  }
}
