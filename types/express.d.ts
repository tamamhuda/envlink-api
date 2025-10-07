import { UserInfoDto } from 'src/auth/dto/user-info.dto';
import { SessionInfoDto } from 'src/session/dto/session.dto';

export {};

declare module 'express-serve-static-core' {
  interface Request {
    user: UserInfoDto;
    session?: SessionInfoDto | null;
  }
}
