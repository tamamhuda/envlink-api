import { Injectable } from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import {
  UserInfo,
  UserInfoDto,
  UserInfoSerializer,
} from 'src/auth/dto/user-info.dto';
import { AwsS3Util } from 'src/common/utils/aws-s3.util';
import { Account } from 'src/database/entities/account.entity';
import { User } from 'src/database/entities/user.entity';

@Injectable()
export class UserMapper {
  constructor(private readonly awsS3Util: AwsS3Util) {}

  async mapToUserInfoDto(account: Account, user: User): Promise<UserInfo> {
    const { provider, isVerified, lastLoginAt } = account;
    const { avatar, externalId, ...restUser } = user;
    const avatarUrl = avatar ? await this.awsS3Util.getFileUrl(avatar) : null;
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
