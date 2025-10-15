export interface ThrottlePlanOptions {
  scope: string; // e.g., "shorten", "analytics"
  cost?: number; // default 1
  chargeOnSuccess?: boolean; // true | false
  limitOverride?: number; // optional per-endpoint override
  resetInterval?: string; // e.g., "1d", "1h"
}

export interface ThrottlePolicy {
  plan: string;
  limit: number;
  resetInterval: string;
  windowMs: number;
  cost: number;
  chargeOnSuccess: boolean;
  scope: string;
  blockDuration?: number;
  delay?: {
    base: number;
    interval?: number;
  };
}
