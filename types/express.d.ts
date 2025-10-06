import { UserInfoDto } from 'src/auth/dto/user-info.dto';

export {};

declare module 'express-serve-static-core' {
  interface Request {
    user: UserInfoDto;
  }
}
