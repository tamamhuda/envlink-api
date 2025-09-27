import { Inject, Injectable } from '@nestjs/common';
import LoggerService from 'src/logger/logger.service';
import { RedisService } from './redis/redis.service';
import { DataSource } from 'typeorm';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { CacheInvalidateService } from './common/cache/cache-invalidate.service';
import { Healthz, HealthzDto } from './common/dto/healthz.dto';

@Injectable()
export class AppService {
  constructor(
    private readonly logger: LoggerService,
    private readonly redisService: RedisService,
    private readonly dataSource: DataSource,
    @Inject(CACHE_MANAGER) private cache: Cache,
    private readonly invalidateCache: CacheInvalidateService,
  ) {}

  async testCache(): Promise<Healthz['cache']> {
    await this.cache.set('test:key', 'UP', 10000); // TTL = 10s

    const value = await this.cache.get<string>('test:key');
    return value === 'UP' ? value : 'DOWN';
  }

  async testDb(): Promise<Healthz['db']> {
    let dbStatus = 'UNKNOWN';
    try {
      await this.dataSource.query('SELECT 1'); // Lightweight DB ping
      dbStatus = 'OK';
    } catch (err) {
      dbStatus = 'FAIL';
      this.logger.error('Database connection failed', err);
    }

    return dbStatus;
  }

  async testRedis(): Promise<Healthz['redis']> {
    const redis = await this.redisService.client();
    const ping = await redis.ping();

    return ping === 'PONG' ? 'UP' : 'DOWN';
  }

  async healthz(): Promise<HealthzDto> {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();

    return {
      status: 'OK',
      db: await this.testDb(),
      redis: await this.testRedis(),
      cache: await this.testCache(),
      uptime: `${Math.floor(uptime)}s`,
      memory: {
        rss: memoryUsage.rss,
        heapUsed: memoryUsage.heapUsed,
        heapTotal: memoryUsage.heapTotal,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
