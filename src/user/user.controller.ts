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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserInfoDto, UserInfoResponse } from 'src/auth/dto/user-info.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
} from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { JWT_SECURITY } from 'src/config/jwt.config';
import { Cached } from 'src/common/decorators/cached.decorator';
import { CachePrefix } from 'src/common/enums/cache-prefix.enum';
import { InvalidateCache } from 'src/common/decorators/invalidate-cache.decorator';
import { UpdateUserDto } from './dto/user.dto';
import { ZodValidationPipe } from 'nestjs-zod';
import { ImageUploadDto } from './dto/image-upload.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { AwsS3Util } from 'src/common/utils/aws-s3.util';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly awsS3Util: AwsS3Util,
  ) {}

  @Get('me')
  @UseGuards(JwtGuard)
  @ApiOkResponse({
    type: UserInfoResponse,
  })
  @ApiBearerAuth(JWT_SECURITY)
  @HttpCode(HttpStatus.OK)
  @Cached(CachePrefix.USER, (req) => `${req.user?.id}`)
  userInfo(@Req() req: Request): UserInfoDto {
    return req.user;
  }

  @Put('update/:id')
  @UseGuards(JwtGuard)
  @ApiOkResponse({
    type: UserInfoResponse,
  })
  @ApiBearerAuth(JWT_SECURITY)
  @HttpCode(HttpStatus.OK)
  @InvalidateCache(CachePrefix.USER, (req) => `${req.user?.id}`)
  async updateUser(
    @Req() req: Request,
    @Body() body: UpdateUserDto,
    @Param('id') id: string,
  ): Promise<UserInfoDto> {
    return this.userService.updateUser(req, body, id);
  }

  @Post('image/upload')
  @UseGuards(JwtGuard)
  @ApiOkResponse({
    type: UserInfoResponse,
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
  @ApiBearerAuth(JWT_SECURITY)
  @HttpCode(HttpStatus.OK)
  @InvalidateCache(CachePrefix.USER, (req) => `${req.user?.id}`)
  @UseInterceptors(FileInterceptor('file'))
  async imageUpload(
    @Req() req: Request,
    @UploadedFile(new ZodValidationPipe(ImageUploadDto))
    file: Express.Multer.File,
  ): Promise<UserInfoDto> {
    return await this.userService.imageUpload(req, file);
  }
}
