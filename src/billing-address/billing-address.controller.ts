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
} from '@nestjs/common';
import { BillingAddressService } from './billing-address.service';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { AuthenticatedUser } from 'src/security/decorators/authenticated-user.dto';
import { UserInfo } from 'src/auth/dto/user-info.dto';
import {
  AllBillingAddressResponse,
  BillingAddressDto,
  BillingAddressResponse,
  BillingAddressSerializerDto,
} from './dto/billing-address.dto';
import {
  UpdateBillingAddressBodyDto,
  UpdateBillingAddressRequest,
} from './dto/update.dto';
import {
  CreateBillingAddressBodyDto,
  CreateBillingAddressRequest,
} from './dto/create.dto';
import { SkipThrottle } from 'src/infrastructure/internal-services/throttle/decorators/skip-throttle.decorator';
import { JWT_SECURITY } from 'src/config/jwt.config';
import { ZodSerializerDto } from 'nestjs-zod';

@Controller('billing-address')
@ApiTags('Billing Address')
@SkipThrottle()
@ApiSecurity(JWT_SECURITY)
export class BillingAddressController {
  constructor(private readonly billingAddressService: BillingAddressService) {}

  @Get()
  @ApiOperation({
    operationId: 'getAll',
    summary: 'Get all billing addresses',
  })
  @ApiOkResponse({
    type: AllBillingAddressResponse,
    description: 'Returns a list of billing addresses successfully',
  })
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto([BillingAddressSerializerDto])
  async getAll(
    @AuthenticatedUser() user: UserInfo,
  ): Promise<BillingAddressDto[]> {
    return await this.billingAddressService.getAll(user.id);
  }

  @Get(':id')
  @ApiOperation({
    operationId: 'getById',
    summary: 'Get a billing address by id',
  })
  @ApiOkResponse({
    type: BillingAddressResponse,
    description: 'Returns a billing address successfully',
  })
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(BillingAddressSerializerDto)
  async getById(
    @AuthenticatedUser() user: UserInfo,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BillingAddressDto> {
    return await this.billingAddressService.getById(user.id, id);
  }

  @Patch(':id')
  @ApiOperation({
    operationId: 'update',
    summary: 'Update a billing address',
  })
  @ApiBody({
    type: UpdateBillingAddressRequest,
    description: 'Request body for updating a billing address',
  })
  @ApiOkResponse({
    type: BillingAddressResponse,
    description: 'Returns a billing address successfully',
  })
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(BillingAddressSerializerDto)
  async update(
    @AuthenticatedUser() user: UserInfo,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateBillingAddressBodyDto,
  ): Promise<BillingAddressDto> {
    return await this.billingAddressService.update(user.id, id, body);
  }

  @Post()
  @ApiOperation({
    operationId: 'create',
    summary: 'Create a billing address',
  })
  @ApiBody({
    type: CreateBillingAddressRequest,
    description: 'Request body for creating a billing address',
  })
  @ApiOkResponse({
    type: BillingAddressResponse,
    description: 'Returns a billing address successfully',
  })
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(BillingAddressSerializerDto)
  async create(
    @AuthenticatedUser() user: UserInfo,
    @Body() body: CreateBillingAddressBodyDto,
  ): Promise<BillingAddressDto> {
    return await this.billingAddressService.create(user.id, body);
  }
}
