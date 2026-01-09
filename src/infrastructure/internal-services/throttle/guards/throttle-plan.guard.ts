import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Reflector } from '@nestjs/core';
import { ThrottleService } from '../throttle.service';
import { ThrottlePlanOptions } from 'src/common/interfaces/throttle.interface';
import { THROTTLE_PLAN_KEY } from '../decorators/throttle-plan.decorator';
import { ThrottlePolicyResolver } from '../throttle-policy.resolver';
import LoggerService from 'src/infrastructure/logger/logger.service';

@Injectable()
export class ThrottlePlanGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly throttleService: ThrottleService,
    private readonly policyResolver: ThrottlePolicyResolver,
    private readonly logger: LoggerService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();
    const user = req.user;
    const handler = context.getHandler();

    const meta = this.reflector.get<ThrottlePlanOptions>(
      THROTTLE_PLAN_KEY,
      handler,
    );

    // If no plan metadata or not authenticated, skip to next guard
    if (!meta || !user) return false;

    // Resolve plan-based policy (user-specific or default)
    const policy = await this.policyResolver.resolvePlanPolicy(meta, user);

    // Create limiter for this policy scope
    const { limiter } = this.throttleService.createOrGetLimiter(policy);
    const key = user
      ? `user:${user.id}:${policy.scope}`
      : `anon:${policy.scope}`;
    const cost = policy.cost ?? 1;

    // Attach policy info to request for later usage in ThrottleInterceptor
    req.throttle = { policy, key, cost };

    // If chargeOnSuccess = false → charge *before* handler
    if (!policy.chargeOnSuccess) {
      try {
        await limiter.consume(key, cost);

        return true;
      } catch (rejRes) {
        // Handle rate limit exceeded or Redis error
        if (rejRes instanceof Error) {
          this.logger.error(rejRes);
          throw new InternalServerErrorException(rejRes.message);
        }

        // Apply limit headers (retry-after, reset, etc.)
        await this.throttleService.applyRateLimiterHeader(
          res,
          key,
          policy,
          true,
        );
      }
    }

    const { remaining } = await this.throttleService.resolveLimiter(
      key,
      policy,
    );

    if (remaining <= 0) {
      // Apply limit headers (retry-after, reset, etc.)
      await this.throttleService.applyRateLimiterHeader(res, key, policy, true);
    }

    return true;
  }
}
