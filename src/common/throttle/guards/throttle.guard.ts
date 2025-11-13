import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottleScopeGuard } from './throttle-scope.guard';
import { ThrottlePlanGuard } from './throttle-plan.guard';
import LoggerService from 'src/common/logger/logger.service';
import { Reflector } from '@nestjs/core';
import { SKIP_THROTTLE_KEY } from '../decorators/skip-throttle.decorator';

@Injectable()
export class ThrottleGuard implements CanActivate {
  constructor(
    private readonly scopeGuard: ThrottleScopeGuard,
    private readonly planGuard: ThrottlePlanGuard,
    private readonly logger: LoggerService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const handler = context.getHandler();
    const controller = context.getClass();

    // check if throttling should skip
    const skipThrottling =
      this.reflector.get<boolean>(SKIP_THROTTLE_KEY, handler) ||
      this.reflector.get<boolean>(SKIP_THROTTLE_KEY, controller);

    if (skipThrottling) return true;

    //  plan (if applicable)
    const handledByPlan = await this.planGuard.canActivate(context);

    // if not handled by plan (fallback to scope guard)
    if (!handledByPlan) await this.scopeGuard.canActivate(context);

    return true;
  }
}
