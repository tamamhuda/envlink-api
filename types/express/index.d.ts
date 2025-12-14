import 'express'; // ensure express typings are loaded

import { TokensDto } from '../../src/auth/dto/token.dto';
import { UserInfoDto } from '../../src/auth/dto/user-info.dto';
import { ThrottlePolicy } from '../../src/common/interfaces/throttle.interface';
import { Url } from 'src/database/entities/url.entity';

declare module 'express' {
  interface Request {
    user: UserInfoDto;

    throttle?: {
      policy?: ThrottlePolicy;
      key: string;
      cost: number;
    };

    urlEntity?: Url;
    eventType?: 'CLICK' | 'IMPRESSION';
    isCrawler?: boolean;
    isBot?: boolean;

    state?: {
      user: any;
      tokens: TokensDto;
      redirect?: string;
    };
  }
}
