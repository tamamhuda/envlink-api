import { SetMetadata } from '@nestjs/common';
import { ThrottlePlanOptions } from 'src/common/interfaces/throttle.interface';

export const THROTTLE_PLAN_KEY = Symbol('THROTTLE_PLAN');
export const THROTTLE_PREFIX = Symbol('THROTTLE:');
export const ThrottlePlan = (options: ThrottlePlanOptions) =>
  SetMetadata(THROTTLE_PLAN_KEY, options);
