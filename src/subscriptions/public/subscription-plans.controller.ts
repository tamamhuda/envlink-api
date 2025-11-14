import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseEnumPipe,
} from '@nestjs/common';
import {
  AllPlansResponse,
  PlanDto,
  PlanResponse,
  PlanSerializerDto,
} from '../dto/plan.dto';
import { SubscriptionsPlansService } from '../plans/plans.service';
import { Public } from 'src/common/decorators/public.decorator';
import { PlanEnum } from 'src/common/enums/plans.enum';
import { ZodSerializerDto } from 'nestjs-zod';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from 'src/common/throttle/decorators/skip-throttle.decorator';

@Controller('public/subscriptions/plans')
@ApiTags('Public Subscriptions Plans')
@Public()
export class PublicSubscriptionPlansController {
  constructor(private readonly planService: SubscriptionsPlansService) {}

  @SkipThrottle()
  @Get()
  @ApiOperation({
    operationId: 'GetAll',
    summary: 'Get all plan details',
  })
  @ApiOkResponse({
    type: AllPlansResponse,
    description: 'Get all plan details suc ',
  })
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto([PlanSerializerDto])
  async getAllPlans(): Promise<PlanDto[]> {
    return await this.planService.getAllPlans();
  }

  @SkipThrottle()
  @Get(':name')
  @ApiOperation({
    operationId: 'GetByName',
    summary: 'Get plan details by name',
  })
  @ApiOkResponse({
    type: PlanResponse,
    description: 'Get plan details successfully ',
  })
  @ZodSerializerDto(PlanSerializerDto)
  async getPlanByName(
    @Param('name', new ParseEnumPipe(PlanEnum)) name: PlanEnum,
  ): Promise<PlanDto> {
    return await this.planService.getPlanByName(name);
  }
}
