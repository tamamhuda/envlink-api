import {
  Controller,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import {
  UpgradeSubscriptionBodyDto,
  UpgradeSubscriptionRequest,
} from './dto/upgrade-subscription.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JWT_SECURITY } from 'src/config/jwt.config';
import { SkipThrottle } from 'src/infrastructure/internal-services/throttle/decorators/skip-throttle.decorator';
import {
  AllSubscriptionInfoResponse,
  SubscriptionInfoDto,
  SubscriptionInfoResponse,
  SubscriptionInfoSerializerDto,
} from './dto/subscription.dto';
import { ZodSerializerDto } from 'nestjs-zod';
import LoggerService from 'src/infrastructure/logger/logger.service';
import {
  UpgradePlanOptionDto,
  SubscriptionUpgradeOptionSerializerDto,
  SubscriptionUpgradeOptionsResponse,
} from './dto/upgrade-plan-option.dto';
import { AuthenticatedUser } from 'src/security/decorators/authenticated-user.dto';
import { UserInfo } from 'src/auth/dto/user-info.dto';

@Controller('subscriptions')
@ApiBearerAuth(JWT_SECURITY)
@ApiTags('Subscriptions')
export class SubscriptionsController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly logger: LoggerService,
  ) {}

  @SkipThrottle()
  @Get('/active')
  @ApiOperation({
    operationId: 'GetActive',
    summary: 'Get current user active subscription',
  })
  @ApiOkResponse({
    type: SubscriptionInfoResponse,
    description: 'Get user active subscription successfully',
  })
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(SubscriptionInfoSerializerDto)
  async getUserActiveSubscription(
    @AuthenticatedUser() user: UserInfo,
  ): Promise<SubscriptionInfoDto> {
    return await this.subscriptionsService.getUserActiveSubscription(user.id);
  }

  @SkipThrottle()
  @Get()
  @ApiOperation({
    operationId: 'GetAll',
    summary: 'Get all subscriptions',
  })
  @ApiOkResponse({
    type: AllSubscriptionInfoResponse,
    description: 'Get all subscriptions successfully',
  })
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto([SubscriptionInfoSerializerDto])
  async getAllSubscriptions(
    @AuthenticatedUser() user: UserInfo,
  ): Promise<SubscriptionInfoDto[]> {
    return await this.subscriptionsService.getAll(user.id);
  }

  @SkipThrottle()
  @Get(':id')
  @ApiOperation({
    operationId: 'GetById',
    summary: 'Get subscription by id',
  })
  @ApiOkResponse({
    type: SubscriptionInfoResponse,
    description: 'Get subscription by id successfully',
  })
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(SubscriptionInfoSerializerDto)
  async getSubscriptionById(
    @Param('id', ParseUUIDPipe) id: string,
    @AuthenticatedUser() user: UserInfo,
  ): Promise<SubscriptionInfoDto> {
    return await this.subscriptionsService.getUserSubscriptionById(user.id, id);
  }

  @SkipThrottle()
  @Post(':id/deactivate')
  @ApiOperation({
    operationId: 'Deactivate',
    summary: 'Deactivate subscription plan',
  })
  @ApiOkResponse({
    type: SubscriptionInfoResponse,
    description: 'Deactivate Subscription plan successfully',
  })
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(SubscriptionInfoSerializerDto)
  async deactivateSubscription(
    @Param('id', ParseUUIDPipe) id: string,
    @AuthenticatedUser() user: UserInfo,
  ): Promise<SubscriptionInfoDto> {
    return await this.subscriptionsService.deactivateSubscription(user.id, id);
  }

  @SkipThrottle()
  @Post(':id/upgrade')
  @ApiOperation({
    operationId: 'Upgrade',
    summary: 'Upgrade subscription plan',
  })
  @ApiBody({
    type: UpgradeSubscriptionRequest,
    description: 'Request body for upgrading subscription plan',
  })
  @ApiCreatedResponse({
    type: SubscriptionInfoResponse,
    description: 'Upgrade subscription plan successfully',
  })
  @HttpCode(HttpStatus.CREATED)
  @ZodSerializerDto(SubscriptionInfoSerializerDto)
  async upgradeSubscriptionPlan(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpgradeSubscriptionBodyDto,
    @AuthenticatedUser() user: UserInfo,
  ): Promise<SubscriptionInfoDto> {
    return await this.subscriptionsService.upgradeSubscriptionPlan(
      user.id,
      id,
      body,
    );
  }

  @SkipThrottle()
  @Get(':id/upgrade-options')
  @ApiOperation({
    operationId: 'GetUpgradeOptions',
    summary: 'Get subscription upgrade options',
  })
  @ApiCreatedResponse({
    type: SubscriptionUpgradeOptionsResponse,
    description: 'Get subscription upgrade options successfully',
  })
  @HttpCode(HttpStatus.CREATED)
  @ZodSerializerDto([SubscriptionUpgradeOptionSerializerDto])
  async getAllUpgradePlanOptions(
    @Param('id', ParseUUIDPipe) id: string,
    @AuthenticatedUser() user: UserInfo,
  ): Promise<UpgradePlanOptionDto[]> {
    return await this.subscriptionsService.getAllUpgradePlanOptions(
      user.id,
      id,
    );
  }
}
