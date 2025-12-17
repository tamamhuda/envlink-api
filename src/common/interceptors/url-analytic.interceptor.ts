import { InjectQueue } from '@nestjs/bullmq';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Queue } from 'bullmq';
import { Request } from 'express';
import { Observable, tap } from 'rxjs';
import { UrlAnalyticJob } from 'src/queue/interfaces/url-analytic.interface';
import { URL_ANALYTIC_QUEUE } from 'src/queue/queue.constans';
import { UrlDto } from 'src/urls/dto/url.dto';
import { IpUtil } from '../utils/ip.util';

@Injectable()
export class UrlAnalyticInterceptor<T extends UrlDto>
  implements NestInterceptor<T, T>
{
  constructor(
    private readonly ipUtil: IpUtil,
    @InjectQueue(URL_ANALYTIC_QUEUE)
    private readonly urlAnalyticQueue: Queue<UrlAnalyticJob>,
  ) {}

  private normalizedReferrer(request: Request): string | undefined {
    let referrer = request.headers['referer'];
    if (referrer && ['http', 'https'].includes(referrer.split(':')[0])) {
      referrer = new URL(referrer).hostname;
    }
    return referrer;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<T> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const slug = request.params.slug;
    const userAgent = request.headers['user-agent'];

    if (!slug || !userAgent) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(() => {
        const type = request.eventType;
        const isCrawler = request.isCrawler;

        if (!type || isCrawler) return;
        const referrer = this.normalizedReferrer(request);

        const ipAddress = this.ipUtil.getClientIp(request);
        const urlAnalyticJob: UrlAnalyticJob = {
          type,
          ipAddress,
          userAgent,
          referrer,
          slug,
        };
        console.log(urlAnalyticJob);
        void this.urlAnalyticQueue.add(`url-analytic-${slug}`, urlAnalyticJob);
      }),
    );
  }
}
