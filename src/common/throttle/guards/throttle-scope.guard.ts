import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottleService } from '../throttle.service';
import { ThrottlePolicyResolver } from '../throttle-policy.resolver';
import LoggerService from 'src/common/logger/logger.service';
import { Request, Response } from 'express';

@Injectable()
export class ThrottleScopeGuard implements CanActivate {
  constructor(
    private readonly throttleService: ThrottleService,
    private readonly policyResolver: ThrottlePolicyResolver,
    private readonly logger: LoggerService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const policy = this.policyResolver.resolveScopePolicy(context); // from decorator
    const key = this.throttleService.createThrottleKey(req, policy);

    req.throttle = { policy, key, cost: policy.cost };

    if (!policy.chargeOnSuccess) {
      await this.throttleService.consume(key, policy, policy.cost);
      return true;
    }

    const { remaining } = await this.throttleService.resolveLimiter(
      key,
      policy,
    );

    if (remaining <= 0) {
      //  Apply limit headers (retry-after, reset, etc.)
      await this.throttleService.applyRateLimiterHeader(res, key, policy, true);
    }

    return true;
  }
}
