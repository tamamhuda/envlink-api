import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  async healthz(): Promise<{status: string}> {
    return {status: 'OK'};
  }

}
