import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AwsS3Util } from 'src/common/utils/aws-s3.util';

@Module({
  controllers: [UserController],
  providers: [UserService, AwsS3Util],
  exports: [UserService, AwsS3Util],
})
export class UserModule {}
