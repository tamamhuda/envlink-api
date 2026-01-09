import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Crawler } from 'es6-crawler-detect';
import ipRangeCheck from 'ip-range-check';
import { GoodBotsService } from 'src/infrastructure/integrations/good-bot.service';

@Injectable()
export class CrawlerDetection implements NestMiddleware {
  constructor(private readonly goodBotsService: GoodBotsService) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const detector = new Crawler();
    const userAgent = req.headers['user-agent'] || '';

    // UA-based detection
    let isCrawler = detector.isCrawler(userAgent);

    // IP-based GoodBots detection (strict)
    if (!isCrawler) {
      const clientIp = req.ip || req.socket.remoteAddress || '';
      const goodBotCidrs = await this.goodBotsService.getBotCidrs();
      isCrawler = ipRangeCheck(clientIp, goodBotCidrs);
    }

    req.isCrawler = isCrawler;
    next();
  }
}
