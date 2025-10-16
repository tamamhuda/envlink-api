import { UserInfoDto } from 'src/auth/dto/user-info.dto';
import { ThrottlePolicy } from 'src/common/interfaces/throttle.interface';

export {};

declare module 'express-serve-static-core' {
  interface Request {
    user: UserInfoDto;
    throttle?: {
      policy?: ThrottlePolicy;
      key: string;
      cost: number;
    };
  }
}
