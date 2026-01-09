import { Injectable } from '@nestjs/common';
import { Analytic } from 'src/database/entities/analytic.entity';
import { Channel } from 'src/database/entities/channel.entity';
import { Url } from 'src/database/entities/url.entity';
import { AnalyticRepository } from 'src/database/repositories/analytic.repository';
import LoggerService from 'src/infrastructure/logger/logger.service';
import { AnalyticDto, CreateAnalyticDto } from 'src/urls/dto/analytic.dto';

@Injectable()
export class UrlAnalyticService {
  constructor(
    private readonly analyticRepository: AnalyticRepository,
    private readonly logger: LoggerService,
  ) {}

  async recordVisit(
    data: Partial<Analytic>,
    url: Url,
    channels: Channel[] = [],
  ): Promise<Analytic> {
    return this.analyticRepository.manager.transaction(async (manager) => {
      const analytic = manager.create(Analytic, {
        ...data,
        url,
        channels,
      });

      await manager.update(Url, url.id, {
        clickCount: url.clickCount + 1,
      });

      return await manager.save(analytic);
    });
  }

  async incrementVisitorCount(analytic: Analytic): Promise<void> {
    await this.analyticRepository.manager.transaction(async (manager) => {
      const { url, isUnique, type } = analytic;

      if (type === 'CLICK') {
        await manager.update(Url, url.id, {
          clickCount: url.clickCount + 1,
          uniqueClicks: isUnique ? url.uniqueClicks + 1 : url.uniqueClicks,
        });
      } else if (type === 'IMPRESSION') {
        await manager.update(Url, url.id, {
          impressionCount: url.impressionCount + 1,
        });
      }
    });
  }

  async findAnalyticByIdentityHash(
    identityHash: string,
  ): Promise<Analytic | null> {
    return await this.analyticRepository.findOneByIdentityHash(identityHash);
  }
}
