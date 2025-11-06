import {
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseBoolPipe,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { SessionService } from './session.service';
import { Request } from 'express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  SessionInfoResponse,
  SessionsInfoResponse,
  SessionInfoDto,
  SessionInfoSerializerDto,
} from './dto/session.dto';
import { JWT_SECURITY } from 'src/config/jwt.config';
import LoggerService from 'src/common/logger/logger.service';
import { ZodSerializerDto } from 'nestjs-zod';
import { InvalidateCache } from 'src/common/decorators/invalidate-cache.decorator';
import { CachePrefix } from 'src/common/enums/cache-prefix.enum';
import { Cached } from 'src/common/decorators/cached.decorator';
import { SkipThrottle } from 'src/common/throttle/decorators/skip-throttle.decorator';

@SkipThrottle()
@Controller('session')
@ApiTags('Sessions')
export class SessionController {
  constructor(
    private readonly sessionService: SessionService,
    private readonly logger: LoggerService,
  ) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get session by id' })
  @ApiBearerAuth(JWT_SECURITY)
  @ApiResponse({
    status: 200,
    type: SessionInfoResponse,
    description: 'Get session by id successfully',
  })
  @HttpCode(HttpStatus.OK)
  @Cached(CachePrefix.SESSION, ({ user, params }) => `${user?.id}:${params.id}`)
  @ZodSerializerDto(SessionInfoSerializerDto)
  async getSessionById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SessionInfoDto> {
    return this.sessionService.getSessionById(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user sessions' })
  @ApiBearerAuth(JWT_SECURITY)
  @ApiResponse({
    status: 200,
    type: SessionsInfoResponse,
    description: 'Get all user sessions successfully',
  })
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto([SessionInfoSerializerDto])
  async getAllUserSessions(
    @Req() req: Request,
    @Query('isActive', new DefaultValuePipe(false), ParseBoolPipe)
    isActive: boolean,
  ): Promise<SessionInfoDto[]> {
    const sessions = await this.sessionService.getAllUserSessions(
      req,
      isActive,
    );
    return sessions;
  }

  @Post('revoke/:id')
  @ApiOperation({ summary: 'Revoke a user session' })
  @ApiBearerAuth(JWT_SECURITY)
  @ApiResponse({
    status: 204,
    description: 'No content',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @InvalidateCache(
    CachePrefix.SESSION,
    (ctx) => `${ctx.user?.id}:${ctx.params.id}`,
  )
  async revokeSessionById(@Param('id', ParseUUIDPipe) id: string) {
    return this.sessionService.revokeSessionById(id);
  }

  @Post('revoke')
  @ApiOperation({ summary: 'Revoke all user sessions' })
  @ApiBearerAuth(JWT_SECURITY)
  @ApiResponse({
    status: 204,
    description: 'No content',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @InvalidateCache(CachePrefix.SESSION, (ctx) => `${ctx.user?.id}:*`)
  async revokeAllSessions(@Req() req: Request) {
    return this.sessionService.revokeAllSessions(req);
  }
}
