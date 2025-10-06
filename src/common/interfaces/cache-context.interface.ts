import { UserInfoDto } from 'src/auth/dto/user-info.dto';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

export interface CacheKeyContext<TResponse = any> {
  params: ParamsDictionary;
  query: ParsedQs;
  body?: Record<string, any>;
  user?: UserInfoDto;
  res?: TResponse; // make this required
}
