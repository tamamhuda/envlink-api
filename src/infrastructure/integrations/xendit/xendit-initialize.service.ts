import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Xendit } from 'xendit-node';
import { XenditUtil } from './xendit.util';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, map } from 'rxjs';
import { AxiosError } from 'axios';
import LoggerService from 'src/infrastructure/logger/logger.service';

@Injectable()
export class XenditInitializeService {
  private client: HttpService;
  private APP_URL: string;
  private payload: Record<string, any>[] = [
    {
      type: 'payment_method_v2',
      path: '/api/v1/webhooks/xendit/payment_methods',
    },
    {
      type: 'recurring',
      path: '/api/v1/webhooks/xendit/recurring',
    },
  ];
  constructor(
    private readonly configService: ConfigService,
    private readonly xenditUtil: XenditUtil,
    private readonly logger: LoggerService,
  ) {
    this.client = this.xenditUtil.httpClient();
    this.APP_URL = this.configService.getOrThrow<string>('APP_URL');
  }

  async initialize(): Promise<void> {
    await Promise.all(
      this.payload.map(async (item) => {
        const response = await this.setWebhookURL(
          item.type,
          `${this.APP_URL}${item.path}`,
        );
        this.logger.log(
          `[Xendit Webhook:${response.type}] - URL set ${response.url} successfully`,
        );
      }),
    );
  }

  async setWebhookURL(type: string, url: string) {
    return await firstValueFrom(
      this.client
        .post<
          {
            status: string | 'SUCCESSFUL';
            url: string;
          },
          { url: string }
        >(`/callback_urls/${type}`, { url })
        .pipe(
          map((response) => {
            return {
              type,
              status: response.data.status,
              url: response.data.url,
            };
          }),
          catchError((error) => {
            let errorMsg = error.message;
            if (error instanceof AxiosError) {
              this.logger.error(JSON.stringify(error.response?.data.message));
              errorMsg = error.response?.data.message || errorMsg;
            }
            throw new Error(`Failed to create recurring plan: ${errorMsg}`);
          }),
        ),
    );
  }
}
