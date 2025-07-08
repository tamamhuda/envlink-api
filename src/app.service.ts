import {Injectable, NotFoundException} from '@nestjs/common';
import {delay} from "rxjs";

@Injectable()
export class AppService {

  async healthz(): Promise<{status: string}> {
    return {status: 'OK'};
  }
}
