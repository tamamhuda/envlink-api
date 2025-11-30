import { Injectable } from '@nestjs/common';
import { Analytic } from 'src/database/entities/analytic.entity';
import { Channel } from 'src/database/entities/channel.entity';
import { Url } from 'src/database/entities/url.entity';
import { AnalyticRepository } from 'src/database/repositories/analytic.repository';
import LoggerService from 'src/common/logger/logger.service';
import { AnalyticDto, CreateAnalyticDto } from 'src/urls/dto/analytic.dto';

@Injectable()
export class UrlAnalyticService {
  constructor(
    private readonly analyticRepository: AnalyticRepository,
    private readonly logger: LoggerService,
  ) {}

  async recordVisit(
    data: CreateAnalyticDto,
    url: Url,
    channels: Channel[] = [],
  ): Promise<AnalyticDto> {
    return this.analyticRepository.manager.transaction(async (manager) => {
      const analytic = manager.create(Analytic, {
        ...data,
        url,
        channels,
      });

      await manager.update(Url, url.id, {
        clickCount: url.clickCount + 1,
      });

      const { country: countryCode, ...rest } = await manager.save(analytic);
      return {
        ...rest,
        countryCode,
      };
    });
  }

  async incrementVisitorCount(analytic: Analytic): Promise<void> {
    await this.analyticRepository.manager.transaction(async (manager) => {
      const { visitorCount, url } = analytic;

      await manager.update(Analytic, analytic.id, {
        visitorCount: visitorCount + 1,
      });

      await manager.update(Url, analytic.url.id, {
        clickCount: url.clickCount + 1,
        uniqueClicks: analytic.isUnique
          ? url.uniqueClicks + 1
          : url.uniqueClicks,
      });
    });
  }

  async findAnalyticByIdentityHash(
    identityHash: string,
  ): Promise<Analytic | null> {
    return await this.analyticRepository.findOneByIdentityHash(identityHash);
  }
}
