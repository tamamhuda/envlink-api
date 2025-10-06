import { RolesEnum } from 'src/common/enums/roles.enum';
import { ProviderEnum } from '../enums/provider.enum';

export interface JwtPayload {
  jti: string;
  sub: string;
  provider: ProviderEnum;
  role: RolesEnum;
  sessionId: string;
  iat: number;
  exp: number;
}
