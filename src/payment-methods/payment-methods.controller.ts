import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { PaymentMethodsService } from './payment-methods.service';
import {
  AllPaymentMethodsResponse,
  PaymentMethodDto,
  PaymentMethodResponse,
  PaymentMethodSerializerDto,
} from './dto/payment-method.dto';
import { Request } from 'express';
import { SkipThrottle } from 'src/common/throttle/decorators/skip-throttle.decorator';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { JWT_SECURITY } from 'src/config/jwt.config';
import { ZodSerializerDto } from 'nestjs-zod';
import {
  SortPaymentMethodsBodyDto,
  SortPaymentMethodsRequest,
} from './dto/sort-payment-methods.dto';
import {
  PaymentMethodActionDto,
  AllPaymentMethodActionResponse,
  PaymentMethodActionResponse,
} from './dto/request-payment-method.dto';
import LoggerService from 'src/common/logger/logger.service';
import { UserInfo } from 'src/auth/dto/user-info.dto';
import { AuthenticatedUser } from 'src/common/decorators/authenticated-user.dto';
import {
  CreatePaymentMethodBodyDto,
  CreatePaymentMethodRequest,
} from './dto/create-payment-method.dto';
import { OkDto, OkResponse } from 'src/common/dto/response.dto';
import {
  ValidatePaymentMethodBodyDto,
  ValidatePaymentMethodRequest,
} from './dto/validate-payment-method.dto';
import { Cached } from 'src/common/decorators/cached.decorator';
import { CachePrefix } from 'src/common/enums/cache-prefix.enum';
import { InvalidateCache } from 'src/common/decorators/invalidate-cache.decorator';

@SkipThrottle()
@Controller('payment-methods')
@ApiSecurity(JWT_SECURITY)
@ApiTags('Payment Methods')
export class PaymentMethodsController {
  constructor(
    private readonly paymentMethodsService: PaymentMethodsService,
    private readonly logger: LoggerService,
  ) {}

  @Get('/requests')
  @ApiOperation({
    operationId: 'Request',
    summary: 'Get requested payment methods',
  })
  @ApiOkResponse({
    type: AllPaymentMethodActionResponse,
    description: 'Get requested payment method successfully',
  })
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto([PaymentMethodActionDto])
  async requestPaymentMethod(
    @AuthenticatedUser() user: UserInfo,
    @Query('success_return_url') successReturnUrl: string,
    @Query('failure_return_url') failureReturnUrl: string,
  ): Promise<PaymentMethodActionDto[]> {
    return await this.paymentMethodsService.requestPaymentMethod(
      user.id,
      successReturnUrl,
      failureReturnUrl,
    );
  }

  @Get(':id')
  @ApiOperation({ operationId: 'GetById', summary: 'Get payment method by id' })
  @ApiOkResponse({
    type: PaymentMethodResponse,
    description: 'Get payment method by id successfully',
  })
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(PaymentMethodSerializerDto)
  async getPaymentMethodById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @AuthenticatedUser() user: UserInfo,
  ): Promise<PaymentMethodDto> {
    return await this.paymentMethodsService.getPaymentMethodByIdorExternalId(
      user.id,
      id,
    );
  }

  @Get()
  @ApiOperation({ operationId: 'GetAll', summary: 'Get all payment methods' })
  @ApiOkResponse({
    type: AllPaymentMethodsResponse,
    description: 'Get all payment methods successfully',
  })
  @HttpCode(HttpStatus.OK)
  @Cached(CachePrefix.PAYMENT_METHODS, (req) => `user_${req?.user?.id}`)
  @ZodSerializerDto([PaymentMethodSerializerDto])
  async getAllPaymentMethods(@Req() req: Request): Promise<PaymentMethodDto[]> {
    return await this.paymentMethodsService.getAllPaymentMethods(req.user.id);
  }

  @Patch('/sort')
  @ApiOperation({ operationId: 'Sort', summary: 'Sort payment methods' })
  @ApiBody({
    type: SortPaymentMethodsRequest,
    description: 'Request body sort payment methods',
  })
  @ApiOkResponse({
    type: AllPaymentMethodsResponse,
    description: 'Get payment method by id successfully',
  })
  @HttpCode(HttpStatus.OK)
  @InvalidateCache(
    CachePrefix.PAYMENT_METHODS,
    (req) => `user_${req?.user?.id}`,
  )
  @ZodSerializerDto([PaymentMethodSerializerDto])
  async sortPaymentMethods(
    @Req() req: Request,
    @Body() body: SortPaymentMethodsBodyDto,
  ): Promise<PaymentMethodDto[]> {
    return await this.paymentMethodsService.sortPaymentMethods(
      req.user.id,
      body,
    );
  }

  @Post('/validate')
  @ApiOperation({ operationId: 'Validate', summary: 'Validate payment method' })
  @ApiBody({
    type: ValidatePaymentMethodRequest,
    description: 'Request body validate payment method',
  })
  @ApiOkResponse({
    type: OkResponse,
    description: 'Validate payment method successfully',
  })
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(OkDto)
  async validatePaymentMethod(
    @Body() body: ValidatePaymentMethodBodyDto,
    @AuthenticatedUser() user: UserInfo,
  ): Promise<OkDto> {
    return await this.paymentMethodsService.validatePaymentMethod(
      body,
      user.id,
    );
  }

  @Post()
  @ApiOperation({ operationId: 'Create', summary: 'Create payment method' })
  @ApiBody({
    type: CreatePaymentMethodRequest,
    description: 'Request body create payment method',
  })
  @ApiOkResponse({
    type: PaymentMethodActionResponse,
    description: 'Create payment method successfully',
  })
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(PaymentMethodActionDto)
  async createPaymentMethod(
    @Body() body: CreatePaymentMethodBodyDto,
    @AuthenticatedUser() user: UserInfo,
  ): Promise<PaymentMethodActionDto> {
    return await this.paymentMethodsService.createPaymentMethod(user.id, body);
  }
}
