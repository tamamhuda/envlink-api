import { Injectable, NotFoundException } from '@nestjs/common';
import LoggerService from 'src/infrastructure/logger/logger.service';
import { SubscriptionCycleRepository } from 'src/database/repositories/subscription-cycle.repository';
import { SubscriptionCycleDto } from '../dto/subscription-cycle.dto';
import { SubscriptionCycle } from 'src/database/entities/subscription-cycle.entity';
import { SubscriptionsService } from '../subscriptions.service';

@Injectable()
export class SubscriptionsCyclesService {
  constructor(
    private readonly cycleRepository: SubscriptionCycleRepository,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly logger: LoggerService,
  ) {}

  private mapCycleToDto(cycle: SubscriptionCycle): SubscriptionCycleDto {
    return {
      ...cycle,
      transactionId: cycle.transaction?.id || null,
      subscriptionId: cycle.subscription.id,
    };
  }

  async getAllUserSubscriptionCycles(
    userId: string,
    id: string,
  ): Promise<SubscriptionCycleDto[]> {
    const subscription =
      await this.subscriptionsService.findUserSubscriptionById(userId, id);
    return (
      await this.cycleRepository.findAllCyclesBySubscriptionId(subscription.id)
    ).map((cycle) => this.mapCycleToDto(cycle));
  }

  async getAllUserActiveSubscriptionCycles(
    userId: string,
  ): Promise<SubscriptionCycleDto[]> {
    const subscription =
      await this.subscriptionsService.findActiveSubscriptionByUserId(userId);
    return (
      await this.cycleRepository.findAllCyclesBySubscriptionId(subscription.id)
    ).map((cycle) => this.mapCycleToDto(cycle));
  }

  async findOneBySubscriptionIdAndCycleNumber(
    subscriptionId: string,
    cycleNumber: number,
  ) {
    const cycle =
      await this.cycleRepository.findOneCycleBySubscriptionIdAndCycleNumber(
        subscriptionId,
        cycleNumber,
      );
    if (!cycle) throw new NotFoundException('Subscription Cycle not found');
    return cycle;
  }

  async getUserSubscriptionCycleById(
    userId: string,
    id: string,
    cycleId: string,
  ): Promise<SubscriptionCycleDto> {
    const subscription =
      await this.subscriptionsService.findUserSubscriptionById(userId, id);
    const cycle = await this.cycleRepository.findOneCyclesBySubscriptionId(
      subscription.id,
      cycleId,
    );
    if (!cycle) throw new NotFoundException('Subscription Cycle not found');
    return this.mapCycleToDto(cycle);
  }
}
