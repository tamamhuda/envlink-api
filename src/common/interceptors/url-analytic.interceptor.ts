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

  intercept(context: ExecutionContext, next: CallHandler): Observable<T> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const ipAddress = this.ipUtil.getClientIp(request);

    return next.handle().pipe(
      tap(({ code: urlCode }: T) => {
        const userAgent = request.headers['user-agent'];
        if (userAgent) {
          let referrer = request.headers['referer'];
          if (referrer && ['http', 'https'].includes(referrer.split(':')[0])) {
            referrer = new URL(referrer).hostname;
          }

          const urlAnalyticJob: UrlAnalyticJob = {
            ipAddress,
            userAgent,
            referrer,
            urlCode,
          };
          void this.urlAnalyticQueue.add(
            `url-analytic-${urlCode}`,
            urlAnalyticJob,
          );
        }
      }),
    );
  }
}
