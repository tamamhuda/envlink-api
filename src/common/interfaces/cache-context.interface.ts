import { UserInfoDto } from 'src/auth/dto/user-info.dto';
import { ParsedQs } from 'qs';
import { SessionInfoDto } from 'src/sessions/dto/session.dto';

export interface CacheKeyContext<TResponse = any> {
  params: Record<string, any>;
  query: ParsedQs;
  body?: Record<string, any>;
  user?: UserInfoDto;
  sessionId?: string | null;
  res?: TResponse; // make this required
}
