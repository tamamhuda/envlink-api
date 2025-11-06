import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import ms, { StringValue } from 'ms';
import {
  ThrottlePlanOptions,
  ThrottlePolicy,
} from '../interfaces/throttle.interface';
import { PlanRepository } from 'src/database/repositories/plan.reposiotry';
import { SubscriptionRepository } from 'src/database/repositories/subscription.repository';
import { PlanEnum } from '../enums/plans.enum';
import {
  PolicyScope,
  THROTTLE_POLICIES,
  THROTTLE_SCOPE_KEY,
} from './throttle.constans';
import { UserInfo } from 'src/auth/dto/user-info.dto';

@Injectable()
export class ThrottlePolicyResolver {
  constructor(
    private readonly subscriptions: SubscriptionRepository,
    private readonly plans: PlanRepository,
    private readonly reflector: Reflector,
  ) {}

  /**
   * Resolve a throttle policy dynamically using plan/subscription and scope.
   */
  async resolvePlanPolicy(
    meta: ThrottlePlanOptions,
    user?: UserInfo,
  ): Promise<ThrottlePolicy> {
    const freePlan = await this.plans.findOneOrFail({
      where: { name: PlanEnum.FREE },
    });

    const subscriptionPlan =
      user && (await this.subscriptions.findOneByUserId(user.id))?.plan;

    const activePlan = subscriptionPlan || freePlan;

    const limit = meta.limitOverride ?? activePlan.limit;
    const resetInterval = meta.resetInterval ?? activePlan.resetInterval;
    const cost = meta.cost ?? activePlan.cost;
    const chargeOnSuccess =
      meta.chargeOnSuccess ?? activePlan.chargeOnSuccess ?? true;
    const windowMs = this.parseResetInterval(resetInterval);

    return {
      plan: activePlan.name,
      limit,
      resetInterval,
      windowMs,
      cost,
      chargeOnSuccess,
      scope: meta.scope,
    };
  }

  /**
   * Resolve the policy from decorator metadata on controller/handler.
   * Used when interceptor or guard needs to know which scope applies.
   */
  resolveScopePolicy(context: ExecutionContext): ThrottlePolicy {
    const handler = context.getHandler();
    const controller = context.getClass();

    // Prefer method-level metadata, fallback to controller-level, then default
    const scope: PolicyScope =
      this.reflector.get<PolicyScope>(THROTTLE_SCOPE_KEY, handler) ||
      this.reflector.get<PolicyScope>(THROTTLE_SCOPE_KEY, controller) ||
      PolicyScope.DEFAULT; // fallback default scope

    const policy = THROTTLE_POLICIES[scope];

    if (!policy) {
      throw new Error(`No throttle policy found for scope: "${scope}"`);
    }

    return policy;
  }

  /**
   * Converts human-readable reset interval (e.g., "1d", "1h") into milliseconds.
   */
  private parseResetInterval(interval: string): number {
    const parsed = ms(interval as StringValue);
    if (!parsed) {
      console.warn(
        `[ThrottlePolicyResolver] Invalid resetInterval: "${interval}", falling back to 1d.`,
      );
    }
    return parsed || ms('1d');
  }
}
