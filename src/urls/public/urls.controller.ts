import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UrlsService } from '../urls.service';
import LoggerService from 'src/common/logger/logger.service';
import {
  PublicShortenUrlBodyDto,
  PublicShortenUrlRequest,
} from '../dto/shorten.dto';
import { ZodSerializerDto } from 'nestjs-zod';
import {
  PublicUrlDto,
  PublicUrlResponse,
  PublicUrlSerializerDto,
} from '../dto/public-url.dto';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { UrlAnalyticInterceptor } from 'src/common/interceptors/url-analytic.interceptor';
import { Public } from 'src/common/decorators/public.decorator';
import { ThrottleScope } from 'src/common/throttle/decorators/throttle-scope.decorator';
import { PolicyScope } from 'src/common/throttle/throttle.constans';
import { SkipThrottle } from 'src/common/throttle/decorators/skip-throttle.decorator';
import { Request, Response } from 'express';
import { UrlAccessGuard } from '../guards/url-access.guard';
import { UnlockUrlBodyDto, UnlockUrlRequest } from '../dto/unlock.dto';
import { ConfirmUrlBodyDto, ConfirmUrlRequest } from '../dto/confirm.dto';
import { AnalyticType } from 'src/common/enums/analytic-type.enum';

@Controller('public/urls')
@ApiTags('Public URLs')
@Public()
export class PublicUrlsController {
  constructor(
    private readonly urlsService: UrlsService,
    private readonly logger: LoggerService,
  ) {}

  @Post('shorten')
  @ThrottleScope(PolicyScope.SHORTEN_PUBLIC)
  @ApiBody({ type: PublicShortenUrlRequest })
  @ApiOperation({
    operationId: 'PublicShorten',
    summary: 'Shorten a URL for public access',
  })
  @ApiCreatedResponse({
    type: PublicUrlResponse,
    description: 'Created a new public short URL successfully',
  })
  @ZodSerializerDto(PublicUrlSerializerDto)
  async shortenUrl(
    @Body() body: PublicShortenUrlBodyDto,
  ): Promise<PublicUrlDto> {
    return await this.urlsService.createUrl(body);
  }

  @SkipThrottle()
  @Get('/r/:slug')
  @UseGuards(UrlAccessGuard)
  @UseInterceptors(UrlAnalyticInterceptor)
  @ApiOperation({
    operationId: 'GetRedirectUrl',
    summary: 'Redirect to the original URL by code or alias',
  })
  @ApiParam({
    name: 'slug',
    description: 'Short code or custom alias',
    example: 'envlink',
  })
  @ApiOkResponse({
    type: PublicUrlResponse,
    description: 'Get a short URL for a public access',
  })
  @ApiFoundResponse({
    description: 'Redirect to the original URL successfully',
  })
  @HttpCode(HttpStatus.OK || HttpStatus.FOUND)
  async getRedirectUrl(
    @Req() req: Request,
    @Res() res: Response,
    @Param('slug') slug: string,
  ): Promise<void> {
    return await this.urlsService.getUrlRedirect(req, res, slug);
  }

  @SkipThrottle()
  @Post('/r/:slug/unlock')
  @UseInterceptors(UrlAnalyticInterceptor)
  @ApiOperation({
    operationId: 'UnlockRedirect',
    summary: 'Unlock a short URL for public access redirect',
  })
  @ApiBody({
    type: UnlockUrlRequest,
    description: 'Request body for unlocking a short URL',
  })
  @ApiFoundResponse()
  @HttpCode(HttpStatus.OK)
  async unlockUrl(
    @Req() req: Request,
    @Res() res: Response,
    @Param('slug') slug: string,
    @Body() body: UnlockUrlBodyDto,
  ): Promise<void> {
    return await this.urlsService.unlockUrlRedirect(req, res, slug, body);
  }

  @SkipThrottle()
  @Post('/r/:slug/confirm')
  @UseInterceptors(UrlAnalyticInterceptor)
  @ApiOperation({
    operationId: 'Confirm Redirect',
    summary: 'Confirm a short URL for splash redirect',
  })
  @ApiBody({
    type: ConfirmUrlRequest,
    description: 'Request body for confirming a short URL',
  })
  @ApiFoundResponse()
  @HttpCode(HttpStatus.OK)
  async confirmRedirect(
    @Req() req: Request,
    @Res() res: Response,
    @Param('slug') slug: string,
    @Body() body: ConfirmUrlBodyDto,
  ): Promise<void> {
    return await this.urlsService.confirmUrlRedirect(req, res, slug, body);
  }
}
