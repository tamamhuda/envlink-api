import {Injectable, NotFoundException} from '@nestjs/common';
import {delay} from "rxjs";
import LoggerService from "./common/logger/logger.service";
import {RedisService} from "./redis/redis.service";
import {IHealthz} from "./common/interfaces/healthz.interface";
import {DataSource} from "typeorm";

@Injectable()
export class AppService {
  constructor(
      private readonly logger: LoggerService,
      private readonly redisService: RedisService,
      private readonly dataSource: DataSource,
      ) {
  }

  async healthz(): Promise<IHealthz> {
    const redis = await this.redisService.client();
    const redisPing = await redis.ping();

    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();

    let dbStatus = 'UNKNOWN';
    try {
      await this.dataSource.query('SELECT 1'); // Lightweight DB ping
      dbStatus = 'OK';
    } catch (err) {
      dbStatus = 'FAIL';
      this.logger.error('Database connection failed', err);
    }

    this.logger.debug(`Redis: ${redisPing}, DB: ${dbStatus}`);


    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      redis: redisPing === 'PONG' ? 'UP' : 'DOWN',
      db: dbStatus,
      uptime: `${Math.floor(uptime)}s`,
      memory: {
        rss: memoryUsage.rss,
        heapUsed: memoryUsage.heapUsed,
        heapTotal: memoryUsage.heapTotal,
      },
    };
  }

}
