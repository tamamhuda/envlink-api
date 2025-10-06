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
  UseGuards,
} from '@nestjs/common';
import { SessionService } from './session.service';
import { Request } from 'express';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import {
  SessionInfoResponse,
  SessionsInfoResponse,
  SessionInfoDto,
} from './dto/session.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { JWT_SECURITY } from 'src/config/jwt.config';
import LoggerService from 'src/logger/logger.service';
import { ZodSerializerDto } from 'nestjs-zod';

@Controller('session')
export class SessionController {
  constructor(
    private readonly sessionService: SessionService,
    private readonly logger: LoggerService,
  ) {}

  @Get(':id')
  @UseGuards(JwtGuard)
  @ApiBearerAuth(JWT_SECURITY)
  @ApiResponse({
    status: 200,
    type: SessionInfoResponse,
    description: 'Returns session by id',
  })
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(SessionInfoDto)
  async getSessionById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SessionInfoDto> {
    return this.sessionService.getSessionById(id);
  }

  @Get()
  @UseGuards(JwtGuard)
  @ApiBearerAuth(JWT_SECURITY)
  @ApiResponse({
    status: 200,
    type: SessionsInfoResponse,
    description: 'Returns all user sessions',
  })
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto([SessionInfoDto])
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
  @UseGuards(JwtGuard)
  @ApiBearerAuth(JWT_SECURITY)
  @ApiResponse({
    status: 204,
    description: 'No content',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async revokeSessionById(@Param('id', ParseUUIDPipe) id: string) {
    return this.sessionService.revokeSessionById(id);
  }

  @Post('revoke')
  @UseGuards(JwtGuard)
  @ApiBearerAuth(JWT_SECURITY)
  @ApiResponse({
    status: 204,
    description: 'No content',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async revokeAllSessions(@Req() req: Request) {
    return this.sessionService.revokeAllSessions(req);
  }
}
