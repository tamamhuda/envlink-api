import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
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
import { UpdateUserBodyDto } from './dto/user.dto';
import { ZodSerializerDto, ZodValidationPipe } from 'nestjs-zod';
import { ImageUploadDto } from './dto/image-upload.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { AwsS3Util } from 'src/common/utils/aws-s3.util';
import { SkipThrottle } from 'src/common/throttle/decorators/skip-throttle.decorator';
import { ThrottleScope } from 'src/common/throttle/decorators/throttle-scope.decorator';
import { PolicyScope } from 'src/common/throttle/throttle.constans';

@Controller('user')
@ApiBearerAuth(JWT_SECURITY)
@ApiTags('User Management')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly awsS3Util: AwsS3Util,
  ) {}

  @SkipThrottle()
  @Get('me')
  @ApiOperation({ summary: 'Get user information' })
  @ApiOkResponse({
    type: UserInfoResponse,
    description: 'Get user information successfully',
  })
  @HttpCode(HttpStatus.OK)
  @Cached(CachePrefix.USER, (req) => `${req.user?.id}`)
  @ZodSerializerDto(UserInfoSerializer)
  userInfo(@Req() req: Request): UserInfoDto {
    return req.user;
  }

  @Put('update/:id')
  @ThrottleScope(PolicyScope.UPDATE_USER)
  @ApiOperation({ summary: 'Update user information' })
  @ApiOkResponse({
    type: UserInfoResponse,
    description: 'Update user information successfully',
  })
  @HttpCode(HttpStatus.OK)
  @InvalidateCache(CachePrefix.USER, (req) => `${req.user?.id}`)
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
  @ApiOperation({ summary: 'Upload user image' })
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
  @UseInterceptors(FileInterceptor('file'))
  @ZodSerializerDto(UserInfoSerializer)
  async imageUpload(
    @Req() req: Request,
    @UploadedFile(new ZodValidationPipe(ImageUploadDto))
    file: Express.Multer.File,
  ): Promise<UserInfoDto> {
    return await this.userService.imageUpload(req, file);
  }
}
