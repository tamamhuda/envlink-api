import { InjectRedis } from '@nestjs-modules/ioredis';
import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import Redis from 'ioredis';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { CachePrefix } from '../enums/cache-prefix.enum';
import { PlanUsageHistory } from 'src/database/entities/plan-usage-history.entity';
import { PlanUsageRepository } from 'src/database/repositories/plan-usage-history.repository';
import { PlanUsage } from 'src/database/entities/plan-usage.entity';
import { User } from 'src/database/entities/user.entity';
import { createHash } from 'crypto';
import { ThrottlePolicy } from '../interfaces/throttle.interface';
import LoggerService from '../logger/logger.service';
import { Request, Response } from 'express';
import { ClientIdentityUtil } from '../utils/client-identity.util';
import { IpUtil } from '../utils/ip.util';

@Injectable()
export class ThrottleService {
  private readonly prefix = CachePrefix.THROTTLE;
  private limiterMap = new Map<string, RateLimiterRedis>();

  constructor(
    private readonly ipUtil: IpUtil,
    private readonly clientIdentityUtil: ClientIdentityUtil,
    @InjectRedis() private readonly redis: Redis,
    private readonly planUsageRepository: PlanUsageRepository,
    private readonly logger: LoggerService,
  ) {}

  createThrottleKey(req: Request, policy: ThrottlePolicy) {
    const userAgent = req.headers['user-agent'] || 'unknown';
    const ip = this.ipUtil.getClientIp(req);
    const { browser, os, deviceType } =
      this.clientIdentityUtil.parseUserAgent(userAgent);
    const unique = req.user
      ? `${req.user.id}:${policy.scope}`
      : `anonymous:${policy.scope}`;

    const { identityHash } = this.clientIdentityUtil.generateHashes(
      unique,
      ip,
      {
        browser,
        os,
        deviceType,
      },
    );

    return identityHash;
  }

  createLimiter(key: string, policy: ThrottlePolicy) {
    const rateLimiter = new RateLimiterRedis({
      storeClient: this.redis,
      keyPrefix: `${this.prefix}:${policy.scope}`,
      points: policy.limit,
      duration: Math.floor(policy.windowMs / 1000),
    });

    this.limiterMap.set(key, rateLimiter);
    return rateLimiter;
  }

  createOrGetLimiter(policy: ThrottlePolicy): {
    limiterKey: string;
    limiter: RateLimiterRedis;
  } {
    const limiterKey = `${policy.plan}:${policy.scope}`;
    let limiter = this.limiterMap.get(limiterKey);

    if (!limiter) {
      limiter = this.createLimiter(limiterKey, policy);
    }

    return { limiterKey, limiter };
  }

  createCooldownLimiter(policy: ThrottlePolicy, delay: number) {
    return new RateLimiterRedis({
      storeClient: this.redis,
      keyPrefix: `${this.prefix}:${policy.scope}:cooldown`,
      points: 1,
      duration: delay,
    });
  }

  async consume(key: string, policy: ThrottlePolicy, cost: number) {
    const { limiter } = this.createOrGetLimiter(policy);

    try {
      if (policy.delay) {
        const { limit, remaining } = await this.resolveLimiter(key, policy);
        const n = limit - remaining;
        const base = (policy.delay.base ?? 0) / 1000;
        const interval = (policy.delay.interval ?? 0) / 1000;

        const dynamicDelay = base + n * interval;
        const cooldownLimiter = this.createCooldownLimiter(
          policy,
          dynamicDelay,
        );
        await cooldownLimiter.consume(key);
      }
      await limiter.consume(key, cost);
      return true;
    } catch (error) {
      if (error instanceof Error)
        throw new InternalServerErrorException(error.message);

      let retryAfter = 0;

      if ('msBeforeNext' in error && typeof error.msBeforeNext === 'number') {
        retryAfter = Math.ceil(error.msBeforeNext / 1000);
      }

      throw new HttpException(
        `Too many attempts. Retry after ${retryAfter} seconds.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  async resolveLimiter(
    key: string,
    policy: ThrottlePolicy,
  ): Promise<{
    limit: number;
    remaining: number;
    retryAfter: number;
    resetTime: number;
    policyName: string;
  }> {
    const { limiter } = this.createOrGetLimiter(policy);

    const points = await limiter.get(key);
    const consumed = points?.consumedPoints ?? 0;
    const remaining = Math.max(0, policy.limit - consumed);

    // msBeforeNext only exists if the key has hit the limit at least once
    const msBeforeNext = points?.msBeforeNext ?? 0;
    const retryAfter = remaining > 0 ? 0 : Math.ceil(msBeforeNext / 1000); // in seconds

    // Use msBeforeNext if it exists; fallback to full window
    const resetTime = Date.now() + (msBeforeNext || policy.windowMs);

    const policyName = `${policy.plan} ${policy.limit}/${policy.resetInterval}`;

    return {
      limit: policy.limit,
      remaining,
      retryAfter,
      resetTime,
      policyName,
    };
  }

  async applyRateLimiterHeader(
    response: Response,
    key: string,
    policy: ThrottlePolicy,
    throwHttpError: boolean = false,
  ) {
    let totalRetryAfter: number = 0;
    const { resetTime, retryAfter, remaining, policyName } =
      await this.resolveLimiter(key, policy);

    totalRetryAfter = retryAfter;

    // Apply custom per-point delay if defined
    if (policy.delay) {
      const n = policy.limit - remaining;
      const base = (policy.delay.base ?? 0) / 1000;
      const interval = (policy.delay.interval ?? 0) / 1000;

      const dynamicDelay = base + n * interval;
      totalRetryAfter = Math.max(totalRetryAfter, dynamicDelay);
    }

    response.setHeader('X-RateLimit-Limit', policy.limit);
    response.setHeader('X-RateLimit-Remaining', remaining);
    response.setHeader('X-RateLimit-Reset', Math.floor(resetTime / 1000));
    if (retryAfter > 0) response.setHeader('Retry-After', totalRetryAfter);
    response.setHeader('X-RateLimit-Policy', policyName);

    if (throwHttpError) {
      throw new HttpException(
        `Too many attempts. Retry after ${totalRetryAfter} seconds`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  async getRemaining(key: string, policy: any): Promise<number> {
    const { limiter } = this.createOrGetLimiter(policy);
    const points = await limiter.get(key);
    return Math.max(0, policy.limit - (points?.consumedPoints ?? 0));
  }

  async recordUsage(
    key: string,
    used: number,
    userId: string,
    action: string,
    policy: ThrottlePolicy,
  ): Promise<PlanUsageHistory> {
    return await this.planUsageRepository.manager.transaction(
      async (manager) => {
        const remaining = await this.getRemaining(key, policy);
        const usageIdentity = createHash('SHA256').update(key).digest('hex');

        const user = await manager
          .findOneOrFail(User, {
            where: { id: userId },
            relations: ['activeSubscription', 'activeSubscription.plan'],
          })
          .catch(() => {
            throw new Error('User not found');
          });

        const subscription = user.activeSubscription;

        const existingUsage = await manager.findOne(PlanUsage, {
          where: {
            usageIdentity,
          },
        });

        if (!existingUsage) {
          const planUsage = manager.create(PlanUsage, {
            usageIdentity,
            user,
            remaining,
            subscription,
            plan: subscription.plan,
            scope: policy.scope,
            used,
            resetAt: new Date(Date.now() + policy.windowMs),
          });

          const savedPlanUsage = await manager.save(planUsage);
          const history = manager.create(PlanUsageHistory, {
            action,
            used,
            usage: savedPlanUsage,
          });
          return await manager.save(history);
        }

        const history = manager.create(PlanUsageHistory, {
          action,
          used,
          usage: existingUsage,
        });

        const merge = manager.merge(PlanUsage, existingUsage, {
          remaining,
          used: existingUsage.used + used,
        });
        await manager.save(merge);

        return await manager.save(history);
      },
    );
  }
}
