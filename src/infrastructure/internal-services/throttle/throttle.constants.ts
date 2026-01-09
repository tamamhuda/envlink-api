import ms from 'ms';
import { ThrottlePolicy } from 'src/common/interfaces/throttle.interface';

export const THROTTLE_SCOPE_KEY = 'throttle_scope';

export enum PolicyScope {
  REGISTER = 'register',
  LOGIN = 'login',
  RESEND_EMAIL = 'resend-email',
  FORGOT_PASSWORD = 'forgot-password',
  SHORTEN_PUBLIC = 'shorten-public',
  DEFAULT = 'default',
  CHANGE_PASSWORD = 'change-password',
  UPDATE_USER = 'update-user',
  IMAGE_UPLOAD_USER = 'image-upload-user',
}

export const THROTTLE_POLICIES: Record<PolicyScope, ThrottlePolicy> = {
  register: {
    plan: 'Anonymous',
    limit: 100,
    resetInterval: '1h',
    windowMs: ms('1h'),
    cost: 1,
    chargeOnSuccess: false,
    scope: 'register',
  },
  login: {
    plan: 'Anonymous',
    limit: 10,
    resetInterval: '30m',
    windowMs: ms('30m'),
    cost: 1,
    chargeOnSuccess: false,
    scope: 'login',
  },
  'resend-email': {
    plan: 'Authenticated',
    limit: 3,
    resetInterval: '5m',
    windowMs: ms('5m'),
    cost: 1,
    chargeOnSuccess: false,
    scope: 'resend-email',
    delay: {
      base: ms('90s'),
      interval: ms('60s'),
    },
  },
  'forgot-password': {
    plan: 'Anonymous',
    limit: 3,
    resetInterval: '5m',
    windowMs: ms('5m'),
    cost: 1,
    chargeOnSuccess: false,
    scope: 'forgot-password',
    delay: {
      base: ms('90s'),
      interval: ms('60s'),
    },
  },
  'shorten-public': {
    plan: 'Anonymous',
    limit: 5,
    resetInterval: '1d',
    windowMs: ms('1d'),
    cost: 1,
    chargeOnSuccess: false,
    scope: 'shorten-public',
  },
  'change-password': {
    plan: 'Authenticated',
    limit: 10,
    resetInterval: '1h',
    windowMs: ms('1h'),
    cost: 1,
    chargeOnSuccess: false,
    scope: 'change-password',
  },
  'image-upload-user': {
    plan: 'Authenticated',
    limit: 5,
    resetInterval: '1h',
    windowMs: ms('1h'),
    cost: 1,
    chargeOnSuccess: false,
    scope: 'image-upload-user',
  },
  'update-user': {
    plan: 'Authenticated',
    limit: 10,
    resetInterval: '1h',
    windowMs: ms('1h'),
    cost: 1,
    chargeOnSuccess: false,
    scope: 'update-user',
  },
  default: {
    plan: 'Anonymous',
    limit: 1000,
    resetInterval: '1d',
    windowMs: ms('1d'),
    cost: 1,
    chargeOnSuccess: false,
    scope: 'default',
  },
};
