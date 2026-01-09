import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import axios from 'axios';
import { CacheService } from 'src/infrastructure/cache/cache.service';
import { CachePrefix } from '../../common/enums/cache-prefix.enum';

@Injectable()
export class GoodBotsService implements OnApplicationBootstrap {
  private readonly logger = new Logger(GoodBotsService.name);
  private readonly url =
    'https://raw.githubusercontent.com/AnTheMaker/GoodBots/main/all.ips';
  private readonly cacheKey = 'GOOD_BOTS_IP_LIST';

  constructor(private readonly cache: CacheService) {}

  async onApplicationBootstrap() {
    await this.updateIpList();
  }

  async updateIpList() {
    try {
      this.logger.log('Fetching GoodBots IP list...');
      const { data } = await axios.get(this.url);

      const ipCidrs = data
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith('#'));

      await this.cache.set(
        CachePrefix.CIDRS,
        this.cacheKey,
        ipCidrs,
        24 * 60 * 60,
      ); // cache 1 day
      this.logger.log(
        `Loaded ${ipCidrs.length} GoodBots IP entries into cache`,
      );
    } catch (err) {
      this.logger.error('Failed to fetch GoodBots IP list', err);

      // fallback to cache if available
      const cached = await this.cache.getCache<string[]>(
        CachePrefix.CIDRS,
        this.cacheKey,
      );
      if (cached && cached.length) {
        this.logger.warn(
          `Using cached GoodBots IP list (${cached.length} entries)`,
        );
      } else {
        this.logger.error('No cached IP list available');
      }
    }
  }

  async getBotCidrs(): Promise<string[]> {
    const cached = await this.cache.getCache<string[]>(
      CachePrefix.CIDRS,
      this.cacheKey,
    );
    return cached ?? [];
  }
}
