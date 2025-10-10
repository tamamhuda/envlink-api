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
import {
  URL_ANALYTIC_QUEUE,
  URL_METADATA_QUEUE,
} from 'src/queue/queue.constans';
import { UrlDto } from 'src/urls/dto/url.dto';
import { IpUtil } from '../utils/ip.util';
import LoggerService from 'src/logger/logger.service';
import { ConfigService } from '@nestjs/config';
import { UrlMetadataJob } from 'src/queue/interfaces/url-metadata.interface';

@Injectable()
export class UrlAnalyticInterceptor<T extends UrlDto>
  implements NestInterceptor<T, T>
{
  constructor(
    private readonly ipUtil: IpUtil,
    @InjectQueue(URL_ANALYTIC_QUEUE)
    private readonly urlAnalyticQueue: Queue<UrlAnalyticJob>,
    @InjectQueue(URL_METADATA_QUEUE)
    private readonly urlMetadataQueue: Queue<UrlMetadataJob>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<T> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const ipAddress = this.ipUtil.getClientIp(request);

    return next.handle().pipe(
      tap(({ id: urlId, code: urlCode }: T) => {
        const userAgent = request.headers['user-agent'];
        if (userAgent) {
          const referrer = request.headers['referer'] || 'unknown';

          const urlAnalyticJob: UrlAnalyticJob = {
            ipAddress,
            userAgent,
            referrer,
            urlCode,
          };
          void this.urlAnalyticQueue.add('url-analytic', urlAnalyticJob);
          void this.urlMetadataQueue.add('url-metadata', {
            urlId,
          });
        }
      }),
    );
  }
}
