import { Injectable, NestMiddleware } from '@nestjs/common';
import { Crawler } from 'es6-crawler-detect';
import { Request } from 'express';

@Injectable()
export class CrawlerDetection implements NestMiddleware {
  use(req: Request, _res: any, next: (error?: any) => void) {
    const detector = new Crawler();
    const userAgent = req.headers['user-agent'];
    req.isCrawler = detector.isCrawler(userAgent);

    return next();
  }
}
