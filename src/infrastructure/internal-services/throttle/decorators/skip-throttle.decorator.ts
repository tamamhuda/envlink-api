import { SetMetadata } from '@nestjs/common';

export const SKIP_THROTTLE_KEY = Symbol('SKIP_THROTTLE');
export const SkipThrottle = () => SetMetadata(SKIP_THROTTLE_KEY, true);
