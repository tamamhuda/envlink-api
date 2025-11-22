import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { OauthService } from './oauth.service';
import { Public } from 'src/common/decorators/public.decorator';
import { SkipThrottle } from 'src/common/throttle/decorators/skip-throttle.decorator';
import { GoogleAuthGuard } from './guards/google-auth/google-auth.guard';
import { Request, Response } from 'express';
import {
  ExchangeCodeBodyDto,
  ExchangeCodeRequest,
} from './dto/exchange-code.dto';
import { CacheService } from 'src/common/cache/cache.service';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiPermanentRedirectResponse,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ZodSerializerDto } from 'nestjs-zod';
import {
  AuthenticatedResponse,
  AuthenticatedSerializerDto,
} from 'src/auth/dto/authenticated.dto';
import { GoogleUrlResponse } from './dto/url.dto';

@Controller('oauth')
@Public()
@SkipThrottle()
@ApiTags('OAuth')
export class OauthController {
  constructor(
    private readonly oauthService: OauthService,
    private readonly cache: CacheService,
  ) {}

  @Get('google/login')
  @ApiOperation({
    operationId: 'signInWithGoogle',
    summary: 'Redirects to Google OAuth login page',
  })
  @ApiQuery({
    name: 'redirect',
    required: false,
    type: String,
    description: 'The URL to redirect to after successful authentication',
    example: 'https://example.com/callback',
  })
  @ApiQuery({
    name: 'direct',
    required: false,
    type: Boolean,
    description: 'Whether to redirect directly to oauth google login page',
    example: true,
  })
  @ApiPermanentRedirectResponse({
    description: 'Redirects to the Google OAuth login page',
  })
  @ApiOkResponse({
    type: GoogleUrlResponse,
    description: 'The URL to redirect to Google OAuth login page',
  })
  @UseGuards(GoogleAuthGuard)
  googleSignIn(@Req() req: Request) {
    if (req['oauthUrl']) return { url: req['oauthUrl'] };
  }

  @Get('google/callback')
  @ApiOperation({
    operationId: 'callbackWithGoogle',
    summary: 'Callback from Google OAuth login page',
  })
  @ApiResponse({
    status: 200,
    description: 'Successful authentication',
    type: AuthenticatedResponse,
  })
  @ApiPermanentRedirectResponse({
    description:
      'Redirects to the provided redirect URL with the authentication code',
    example: 'https://example.com/callback?code=1234567890',
  })
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    // Google may recall without state; avoid double send errors
    if (!req.state) {
      res.status(204).send();
      return;
    }

    const { tokens, redirect, user } = req.state;

    if (redirect) {
      const code = await this.oauthService.generateCode({ tokens, user });
      const url = `${redirect}?code=${code}`;
      return res.redirect(url);
    }

    res.status(200).json({ user, tokens });
    return;
  }

  @Post('exchange-code')
  @ApiOperation({
    operationId: 'exchangeCode',
    summary: 'Exchanges an OAuth code for tokens',
  })
  @ApiBody({
    type: ExchangeCodeRequest,
    description: 'The request body for exchanging an OAuth code for tokens',
  })
  @ApiResponse({
    status: 200,
    description: 'Successful exchange of OAuth code for authenticated user',
    type: AuthenticatedResponse,
  })
  @ApiPermanentRedirectResponse({
    description: 'Redirects to the provided redirect URL',
  })
  @ZodSerializerDto(AuthenticatedSerializerDto)
  async exchangeCode(@Body() body: ExchangeCodeBodyDto) {
    return this.oauthService.exchangeCode(body.code);
  }
}
