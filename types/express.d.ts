import { UserInfoDto } from 'src/auth/dto/user-info.dto';
import { ThrottlePolicy } from 'src/common/interfaces/throttle.interface';
import { SessionInfoDto } from 'src/session/dto/session.dto';

export {};

declare module 'express-serve-static-core' {
  interface Request {
    user: UserInfoDto;
    session?: SessionInfoDto | null;
    throttle?: {
      policy?: ThrottlePolicy;
      key: string;
      cost: number;
    };
  }
}
