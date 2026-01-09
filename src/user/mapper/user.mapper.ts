import { Injectable } from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import {
  UserInfo,
  UserInfoDto,
  UserInfoSerializerDto,
} from 'src/auth/dto/user-info.dto';

import { Account } from 'src/database/entities/account.entity';
import { User } from 'src/database/entities/user.entity';
import { S3Service } from 'src/infrastructure/aws/s3.service';

@Injectable()
export class UserMapper {
  constructor(private readonly s3Service: S3Service) {}

  async mapToUserInfoDto(account: Account, user: User): Promise<UserInfo> {
    const { provider, isVerified, lastLoginAt } = account;
    const { avatar, externalId, ...restUser } = user;
    const avatarUrl = avatar ? await this.s3Service.getFileUrl(avatar) : null;
    return {
      ...restUser,
      customerId: externalId,
      avatar: avatarUrl,
      providers: {
        isVerified,
        provider,
      },
      lastLoginAt,
    };
  }
}
