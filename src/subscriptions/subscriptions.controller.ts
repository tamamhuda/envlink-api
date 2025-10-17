import { Controller, Post, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { UpgradeSubscriptionDto } from './dto/upgrade-subscription';
import { ApiBearerAuth, ApiCreatedResponse } from '@nestjs/swagger';
import { JWT_SECURITY } from 'src/config/jwt.config';
import { SkipThrottle } from 'src/common/throttle/decorators/skip-throttle.decorator';

@ApiBearerAuth(JWT_SECURITY)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  /**
   * Upgrade an existing recurring plan
   * e.g. from basic → premium, by updating amount, schedule, or metadata
   */
  @SkipThrottle()
  @Post(':id/upgrade')
  @ApiCreatedResponse({
    description: 'Subscription plan upgraded successfully',
  })
  async upgradeSubscriptionPlan(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpgradeSubscriptionDto,
  ) {
    return await this.subscriptionsService.upgradeSubscriptionPlan(id, body);
  }
}
