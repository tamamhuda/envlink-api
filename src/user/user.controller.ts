import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  UserInfoDto,
  UserInfoResponse,
  UserInfoSerializer,
} from 'src/auth/dto/user-info.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JWT_SECURITY } from 'src/config/jwt.config';
import { Cached } from 'src/common/decorators/cached.decorator';
import { CachePrefix } from 'src/common/enums/cache-prefix.enum';
import { InvalidateCache } from 'src/common/decorators/invalidate-cache.decorator';
import { UpdateUserBodyDto, UpdateUserRequest } from './dto/user.dto';
import { ZodSerializerDto, ZodValidationPipe } from 'nestjs-zod';
import { ImageUploadDto } from './dto/image-upload.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { AwsS3Util } from 'src/common/utils/aws-s3.util';
import { SkipThrottle } from 'src/common/throttle/decorators/skip-throttle.decorator';
import { ThrottleScope } from 'src/common/throttle/decorators/throttle-scope.decorator';
import { PolicyScope } from 'src/common/throttle/throttle.constans';
import { ClientUrl } from 'src/common/decorators/client-url.decorator';
import multer from 'multer';

@Controller('user')
@ApiBearerAuth(JWT_SECURITY)
@ApiTags('User')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly awsS3Util: AwsS3Util,
  ) {}

  @SkipThrottle()
  @Get('me')
  @Cached(CachePrefix.USER, (req) => `${req.user?.id}`)
  @ApiOperation({ operationId: 'GetInfo', summary: 'Get user information' })
  @ApiOkResponse({
    type: UserInfoResponse,
    description: 'Get user information successfully',
  })
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(UserInfoSerializer)
  userInfo(@Req() req: Request, @ClientUrl() clientUrl: string): UserInfoDto {
    console.log(clientUrl);
    return req.user;
  }

  @Patch(':id')
  @ThrottleScope(PolicyScope.UPDATE_USER)
  @ApiBody({
    description: 'Request body for updating user',
    type: UpdateUserRequest,
  })
  @InvalidateCache([
    {
      prefix: CachePrefix.SESSION,
      key: (req) => `${req.user?.id}:*`,
    },
    {
      prefix: CachePrefix.USER,
      key: (req) => `${req.user?.id}`,
    },
  ])
  @ApiOperation({ operationId: 'Update', summary: 'Update user information' })
  @ApiOkResponse({
    type: UserInfoResponse,
    description: 'Update user information successfully',
  })
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(UserInfoSerializer)
  async updateUser(
    @Req() req: Request,
    @Body() body: UpdateUserBodyDto,
    @Param('id') id: string,
  ): Promise<UserInfoDto> {
    return this.userService.updateUser(req, body, id);
  }

  @Post('image/upload')
  @ThrottleScope(PolicyScope.IMAGE_UPLOAD_USER)
  @InvalidateCache([
    {
      prefix: CachePrefix.SESSION,
      key: (req) => `${req.user?.id}:*`,
    },
    {
      prefix: CachePrefix.USER,
      key: (req) => `${req.user?.id}`,
    },
  ])
  @ApiOperation({ operationId: 'UploadAvatar', summary: 'Upload user image' })
  @ApiOkResponse({
    type: UserInfoResponse,
    description: 'Upload user image successfully',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @InvalidateCache(CachePrefix.USER, (req) => `${req.user?.id}`)
  @UseInterceptors(FileInterceptor('file', { storage: multer.memoryStorage() }))
  @ZodSerializerDto(UserInfoSerializer)
  async imageUpload(
    @Req() req: Request,
    @UploadedFile(new ZodValidationPipe(ImageUploadDto))
    file: Express.Multer.File,
  ): Promise<UserInfoDto> {
    return await this.userService.imageUpload(req, file);
  }
}
