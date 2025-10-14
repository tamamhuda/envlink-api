import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { UserInfoDto } from '../dto/user-info.dto';
import { Injectable } from '@nestjs/common';
import LoggerService from 'src/common/logger/logger.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: LoggerService,
  ) {
    super();
  }

  async validate(username: string, password: string): Promise<UserInfoDto> {
    return await this.authService.validateCredentialsByLocalProvider(
      username,
      password,
    );
  }
}
