import { InjectQueue } from '@nestjs/bullmq';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Queue } from 'bullmq';
import { Request } from 'express';
import { Observable, tap } from 'rxjs';
import { UrlAnalyticJob } from 'src/queue/interfaces/url-analytic-job.interface';
import { URL_ANALYTIC_QUEUE } from 'src/queue/queue.constans';
import { CreateAnalyticDto } from 'src/urls/dto/analytic.dto';
import { UrlDto } from 'src/urls/dto/url.dto';
import { IpUtil } from '../utils/ip.util';

@Injectable()
export class UrlAnalyticInterceptor<T extends UrlDto>
  implements NestInterceptor<T, T>
{
  private readonly logger = new Logger(UrlAnalyticInterceptor.name);
  private readonly ipUtil: IpUtil = new IpUtil();
  constructor(
    @InjectQueue(URL_ANALYTIC_QUEUE)
    private readonly urlAnalyticQueue: Queue<UrlAnalyticJob>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<T> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const ipAddress = this.ipUtil.getClientIp(request);

    return next.handle().pipe(
      tap((data: T) => {
        const userAgent = request.headers['user-agent'];
        if (userAgent) {
          const referrer = request.headers['referer'] || 'unknown';
          const urlCode = data.code;
          const urlAnalyticJob: UrlAnalyticJob = {
            ipAddress,
            userAgent,
            referrer,
            urlCode,
          };
          void this.urlAnalyticQueue.add('url-analytic', urlAnalyticJob);
        }
      }),
    );
  }
}
