import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Public } from 'src/common/decorators/public.decorator';
import { SkipThrottle } from 'src/common/throttle/decorators/skip-throttle.decorator';
import { PaymentMethodsService } from '../payment-methods.service';
import { ConfigService } from '@nestjs/config';
import { Env } from 'src/config/env.config';
import { Response } from 'express';
import { SignedUrlGuard, UrlGeneratorService } from 'nestjs-url-generator';
import LoggerService from 'src/common/logger/logger.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OkDto, OkResponse } from 'src/common/dto/response.dto';
import { ZodSerializerDto } from 'nestjs-zod';

import { ValidatePaymentMethodBodyDto } from '../dto/validate-payment-method.dto';
import {
  PaymentMethodActionDto,
  PaymentMethodActionResponse,
} from '../dto/request-payment-method.dto';
import { CreatePaymentMethodBodyDto } from '../dto/create-payment-method.dto';

@Controller('public/payment-methods')
@SkipThrottle()
@Public()
@ApiTags('Public Payment Methods ')
export class PublicPaymentMethodsController {
  private readonly XENDIT_PUBLIC_KEY: string;
  constructor(
    private readonly paymentMethodsService: PaymentMethodsService,
    private readonly config: ConfigService<Env>,
    private readonly urlGenService: UrlGeneratorService,
    private readonly logger: LoggerService,
  ) {
    this.XENDIT_PUBLIC_KEY = this.config.getOrThrow('XENDIT_PUBLIC_KEY');
  }

  @Get('/add')
  @ApiOperation({ summary: 'Add payment method' })
  @UseGuards(SignedUrlGuard)
  async addPaymentMethod(
    @Res() res: Response,
    @Query('token') token: string,
    @Query('successReturnUrl') successReturnUrl: string,
    @Query('failureReturnUrl') failureReturnUrl: string,
  ) {
    const { customerId: customer_id, paymentMethodOptions } =
      await this.paymentMethodsService.getAllPaymentMethodsOptions(token);

    const validate_payment_methods_url = this.urlGenService.signUrl({
      relativePath: 'public/payment-methods/validate',
      query: { token },
    });

    const create_payment_methods_url = this.urlGenService.signUrl({
      relativePath: 'public/payment-methods/',
      query: { token },
    });

    return res.render('card', {
      xendit_public_key: this.XENDIT_PUBLIC_KEY,
      customer_id,
      validate_payment_methods_url,
      success_return_url: successReturnUrl,
      failure_return_url: failureReturnUrl,
      create_payment_methods_url,
      payment_methods_options: JSON.stringify(paymentMethodOptions),
    });
  }

  @Post('/validate')
  @ApiOperation({ summary: 'Validate payment method' })
  @UseGuards(SignedUrlGuard)
  @ApiOkResponse({
    type: OkResponse,
    description: 'Validate payment method successfully',
  })
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(OkDto)
  async validatePaymentMethod(
    @Body() body: ValidatePaymentMethodBodyDto,
    @Query('token') token: string,
  ): Promise<OkDto> {
    return await this.paymentMethodsService.validatePaymentMethodWithToken(
      body,
      token,
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create payment method' })
  @UseGuards(SignedUrlGuard)
  @ApiOkResponse({
    type: PaymentMethodActionResponse,
    description: 'Create payment method successfully',
  })
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(PaymentMethodActionDto)
  async createPaymentMethod(
    @Body() body: CreatePaymentMethodBodyDto,
    @Query('token') token: string,
  ): Promise<PaymentMethodActionDto> {
    return await this.paymentMethodsService.createPaymentMethodWithToken(
      token,
      body,
    );
  }
}
