import {
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseArrayPipe,
  ParseDatePipe,
  ParseUUIDPipe,
  Query,
  Req,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { SkipThrottle } from 'src/common/throttle/decorators/skip-throttle.decorator';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  TransactionDto,
  TransactionsResponse,
  TransactionSerializerDto,
} from './dto/transaction.dto';
import { ZodSerializerDto } from 'nestjs-zod';
import { Request } from 'express';
import { JWT_SECURITY } from 'src/config/jwt.config';
import { TransactionStatus } from 'src/common/enums/trasaction-status.enum';

@Controller('transactions')
@ApiBearerAuth(JWT_SECURITY)
@ApiTags('Transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @SkipThrottle()
  @Get()
  @ApiOperation({
    operationId: 'GetAll',
    summary: 'Get all transactions',
  })
  @ApiOkResponse({
    type: TransactionsResponse,
    description: 'Get all transactions successfully',
  })
  @HttpCode(HttpStatus.OK)
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Start date filter (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'End date filter (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    isArray: true,
    enum: TransactionStatus,
    description: 'Transaction status filter (can include multiple)',
  })
  @ZodSerializerDto([TransactionSerializerDto])
  getAllTransactions(
    @Req() req: Request,

    @Query('startDate', new ParseDatePipe({ optional: true }))
    startDate?: Date,

    @Query('endDate', new ParseDatePipe({ optional: true }))
    endDate?: Date,

    @Query(
      'status',
      new DefaultValuePipe([]), // default empty array if not provided
      new ParseArrayPipe({ items: String, optional: true }),
    )
    status?: TransactionStatus[],
  ): Promise<TransactionDto[]> {
    return this.transactionsService.getAllTransactions(req.user.id, {
      startDate,
      endDate,
      status: status?.length ? status : undefined, // normalize to undefined if empty
    });
  }

  @Get(':id')
  @ApiOperation({ operationId: 'GetById', summary: 'Get transaction by id' })
  @ApiOkResponse({
    type: TransactionsResponse,
    description: 'get transaction by id successfully',
  })
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(TransactionSerializerDto)
  findOne(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TransactionDto> {
    return this.transactionsService.getTransactionById(id, req.user.id);
  }
}
