import { Injectable } from '@nestjs/common';
import { Analytic } from 'src/database/entities/analytic.entity';
import { Url } from 'src/database/entities/url.entity';
import { AnalyticRepository } from 'src/database/repositories/analytic.repository';
import { AnalyticDto, CreateAnalyticDto } from 'src/urls/dto/analytic.dto';

@Injectable()
export class AnalyticService {
  constructor(private readonly analyticRepository: AnalyticRepository) {}

  async recordVisit(data: CreateAnalyticDto, url: Url): Promise<AnalyticDto> {
    return this.analyticRepository.manager.transaction(async (manager) => {
      const analytic = manager.create(Analytic, {
        ...data,
        url,
        channel: url.channel,
      });

      await manager.update(Url, url.id, {
        clickCount: url.clickCount + 1,
      });

      return await manager.save(analytic);
    });
  }

  async incrementVisitorCount(analytic: Analytic): Promise<void> {
    await this.analyticRepository.manager.transaction(async (manager) => {
      await manager.update(Analytic, analytic.id, {
        visitorCount: analytic.visitorCount + 1,
      });

      await manager.update(Url, analytic.url.id, {
        clickCount: analytic.url.clickCount + 1,
      });
    });
  }

  async findAnalyticByIdentityHash(
    identityHash: string,
  ): Promise<Analytic | null> {
    return await this.analyticRepository.findOneByIdentityHash(identityHash);
  }
}
