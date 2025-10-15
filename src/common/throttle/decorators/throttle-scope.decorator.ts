import { SetMetadata } from '@nestjs/common';
import { PolicyScope, THROTTLE_SCOPE_KEY } from '../throttle.constans';

export const ThrottleScope = (scope: PolicyScope) =>
  SetMetadata(THROTTLE_SCOPE_KEY, scope);
