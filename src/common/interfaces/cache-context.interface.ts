import { UserInfoDto } from 'src/auth/dto/user-info.dto';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import { SessionInfoDto } from 'src/session/dto/session.dto';

export interface CacheKeyContext<TResponse = any> {
  params: ParamsDictionary;
  query: ParsedQs;
  body?: Record<string, any>;
  user?: UserInfoDto;
  sessionId?: string | null;
  res?: TResponse; // make this required
}
