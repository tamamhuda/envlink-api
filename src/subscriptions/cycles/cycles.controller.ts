import {
  Controller,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Get,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JWT_SECURITY } from 'src/config/jwt.config';
import { SkipThrottle } from 'src/common/throttle/decorators/skip-throttle.decorator';

import { ZodSerializerDto } from 'nestjs-zod';
import LoggerService from 'src/common/logger/logger.service';
import {
  SubscriptionCycleDto,
  AllSubscriptionCyclesResponse,
  SubscriptionCycleResponse,
  SubscriptionCycleSerializerDto,
} from '../dto/subscription-cycle.dto';
import { AuthenticatedUser } from 'src/common/decorators/authenticated-user.dto';
import { UserInfo } from 'src/auth/dto/user-info.dto';
import { SubscriptionsCyclesService } from './cycles.service';

@Controller('subscriptions')
@ApiBearerAuth(JWT_SECURITY)
@ApiTags('Subscriptions')
export class SubscriptionsCyclesController {
  constructor(
    private readonly cyclesService: SubscriptionsCyclesService,
    private readonly logger: LoggerService,
  ) {}

  @SkipThrottle()
  @Get('/active/cycles')
  @ApiOperation({
    operationId: 'getAllActiveSubscriptionCycles',
    summary: 'Get all active subscription cycles',
  })
  @ApiOkResponse({
    type: AllSubscriptionCyclesResponse,
    description: 'Get all active subscription cycles successfully',
  })
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto([SubscriptionCycleSerializerDto])
  async getUserActiveSubscriptionCycles(
    @AuthenticatedUser() user: UserInfo,
  ): Promise<SubscriptionCycleDto[]> {
    return await this.cyclesService.getAllUserActiveSubscriptionCycles(user.id);
  }

  @SkipThrottle()
  @Get(':id/cycles')
  @ApiOperation({
    operationId: 'getAllBySubscriptionId',
    summary: 'Get all subscription cycles',
  })
  @ApiOkResponse({
    type: AllSubscriptionCyclesResponse,
    description: 'Get all subscription cycles successfully',
  })
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto([SubscriptionCycleSerializerDto])
  async getAllUserSubscriptionCycles(
    @Param('id', ParseUUIDPipe) id: string,
    @AuthenticatedUser() user: UserInfo,
  ): Promise<SubscriptionCycleDto[]> {
    return await this.cyclesService.getAllUserSubscriptionCycles(user.id, id);
  }

  @SkipThrottle()
  @Get(':id/cycles/:cycleId')
  @ApiOperation({
    operationId: 'GetCycleById',
    summary: 'Get subscription cycle by id',
  })
  @ApiOkResponse({
    type: SubscriptionCycleResponse,
    description: 'Get subscription cycle by id successfully',
  })
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(SubscriptionCycleSerializerDto)
  async getUserSubscriptionCycleById(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('cycleId', ParseUUIDPipe) cycleId: string,
    @AuthenticatedUser() user: UserInfo,
  ): Promise<SubscriptionCycleDto> {
    return await this.cyclesService.getUserSubscriptionCycleById(
      user.id,
      id,
      cycleId,
    );
  }
}
