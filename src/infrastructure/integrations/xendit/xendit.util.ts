import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Env } from 'src/config/env.config';
import Xendit from 'xendit-node';
import { AxiosInstance } from 'axios';
import { HttpService } from '@nestjs/axios';
import ms from 'ms';
import axios from 'axios';

@Injectable()
export class XenditUtil {
  private x: Xendit;
  private xHttpClient: AxiosInstance;

  constructor(private readonly config: ConfigService<Env>) {
    this.x = new Xendit({
      secretKey: this.config.getOrThrow('XENDIT_API_KEY'),
    });

    this.xHttpClient = axios.create({
      baseURL: 'https://api.xendit.co',
      auth: {
        username: this.x.opts.secretKey,
        password: '',
      },
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: ms('10s'),
    });
  }

  client() {
    return this.x;
  }

  httpClient() {
    return new HttpService(this.xHttpClient);
  }
}
