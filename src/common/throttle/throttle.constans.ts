// throttle.constants.ts
import { ThrottlePolicy } from '../interfaces/throttle.interface';
import ms from 'ms';

export const THROTTLE_SCOPE_KEY = 'throttle_scope';

export enum PolicyScope {
  REGISTER = 'register',
  LOGIN = 'login',
  RESEND_EMAIL = 'resend-email',
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
    chargeOnSuccess: true,
    scope: 'register',
  },
  login: {
    plan: 'Anonymous',
    limit: 10,
    resetInterval: '30m',
    windowMs: ms('30m'),
    cost: 1,
    chargeOnSuccess: true,
    scope: 'login',
  },
  'resend-email': {
    plan: 'Authenticated',
    limit: 3,
    resetInterval: '5m',
    windowMs: ms('5m'),
    cost: 1,
    chargeOnSuccess: true,
    scope: 'resend-email',
    delay: {
      base: ms('90s'),
      interval: ms('60s'),
    },
  },
  'shorten-public': {
    plan: 'Anonymous',
    limit: 20,
    resetInterval: '1d',
    windowMs: ms('1d'),
    cost: 1,
    chargeOnSuccess: true,
    scope: 'shorten-public',
  },
  'change-password': {
    plan: 'Authenticated',
    limit: 10,
    resetInterval: '1h',
    windowMs: ms('1h'),
    cost: 1,
    chargeOnSuccess: true,
    scope: 'change-password',
  },
  'image-upload-user': {
    plan: 'Authenticated',
    limit: 5,
    resetInterval: '1h',
    windowMs: ms('1h'),
    cost: 1,
    chargeOnSuccess: true,
    scope: 'image-upload-user',
  },
  'update-user': {
    plan: 'Authenticated',
    limit: 10,
    resetInterval: '1h',
    windowMs: ms('1h'),
    cost: 1,
    chargeOnSuccess: true,
    scope: 'update-user',
  },
  default: {
    plan: 'Anonymous',
    limit: 1000,
    resetInterval: '1d',
    windowMs: ms('1d'),
    cost: 1,
    chargeOnSuccess: true,
    scope: 'default',
  },
};
