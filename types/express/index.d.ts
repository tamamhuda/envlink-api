import 'express'; // ensure express typings are loaded

import { TokensDto } from '../../src/auth/dto/token.dto';
import { UserInfoDto } from '../../src/auth/dto/user-info.dto';
import { ThrottlePolicy } from '../../src/common/interfaces/throttle.interface';

declare module 'express' {
  interface Request {
    user: UserInfoDto;

    throttle?: {
      policy?: ThrottlePolicy;
      key: string;
      cost: number;
    };

    state?: {
      user: any;
      tokens: TokensDto;
      redirect?: string;
    };
  }
}
