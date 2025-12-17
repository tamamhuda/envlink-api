import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseBoolPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ChannelsService } from './channels.service';
import {
  AllChannelResponse,
  ChannelDto,
  ChannelPaginatedDto,
  ChannelPaginatedResponse,
  ChannelPaginatedSerializedDto,
  ChannelResponse,
  ChannelSerializerDto,
} from './dto/channel.dto';
import { AuthenticatedUser } from 'src/common/decorators/authenticated-user.dto';
import { UserInfo } from 'src/auth/dto/user-info.dto';
import {
  PaginatedQuery,
  PaginatedQueryDto,
} from 'src/common/dto/paginated.dto';
import { CreateChannelBodyDto, CreateChannelRequest } from './dto/create.dto';
import { UpdateChannelBodyDto, UpdateChannelRequest } from './dto/update.dto';
import {
  ApiBody,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { JWT_SECURITY } from 'src/config/jwt.config';
import { ZodSerializerDto } from 'nestjs-zod';
import {
  ChannelItemsPaginatedDto,
  ChannelItemsPaginatedResponse,
  ChannelItemsPaginatedSerializerDto,
} from './dto/items.dto';
import { AddItemsBodyDto, AddItemsRequest } from './dto/add-items.dto';
import { ApiPaginationQuery } from 'src/common/decorators/api-pagination.decorator';
import { OkDto, OkResponse } from 'src/common/dto/response.dto';

@Controller('channels')
@ApiTags('Channels')
@ApiSecurity(JWT_SECURITY)
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @Get()
  @ApiOperation({
    operationId: 'getAll',
    summary: 'Get paginated channels',
  })
  @ApiOkResponse({
    type: ChannelPaginatedResponse,
    description: 'Get paginated channels successfully',
  })
  @ApiPaginationQuery()
  @ApiQuery({
    name: 'starred',
    type: Boolean,
    description: 'Get starred channels',
    required: false,
    default: false,
  })
  @ApiQuery({
    name: 'q',
    type: String,
    description: 'Search query',
    required: false,
    default: '',
  })
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(ChannelPaginatedSerializedDto)
  async getChannels(
    @AuthenticatedUser() user: UserInfo,
    @Query() query: PaginatedQueryDto,
    @Query('starred', new DefaultValuePipe(false), ParseBoolPipe)
    starred: boolean,
    @Query('q', new DefaultValuePipe(undefined))
    q?: string,
  ): Promise<ChannelPaginatedDto> {
    return this.channelsService.getAllPaginated(user.id, query, {
      starred,
      q,
    });
  }

  @Get(':id')
  @ApiOperation({
    operationId: 'getById',
    summary: 'Get channel by id',
  })
  @ApiOkResponse({
    type: ChannelResponse,
    description: 'Get channel by id successfully',
  })
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(ChannelSerializerDto)
  async getChannel(
    @AuthenticatedUser() user: UserInfo,
    @Param('id') id: string,
  ): Promise<any> {
    return this.channelsService.getById(user.id, id);
  }

  @Get(':id/items')
  @ApiOperation({
    operationId: 'getItems',
    summary: 'Get all items of a channel',
  })
  @ApiOkResponse({
    type: ChannelItemsPaginatedResponse,
    description: 'Get all items of a channel successfully',
  })
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(ChannelItemsPaginatedSerializerDto)
  async getItems(
    @AuthenticatedUser() user: UserInfo,
    @Param('id') id: string,
    @Query() pagination: PaginatedQueryDto,
  ): Promise<ChannelItemsPaginatedDto> {
    return this.channelsService.getAllItems(user.id, id, pagination);
  }

  @Post('items/add')
  @ApiOperation({
    operationId: 'addItems',
    summary: 'Add items to a channel',
  })
  @ApiBody({
    type: AddItemsRequest,
    description: 'Request body for adding items to a channels',
  })
  @ApiOkResponse({
    type: OkResponse,
    description: 'Add items to a channels successfully',
  })
  @HttpCode(HttpStatus.OK)
  async addItems(
    @AuthenticatedUser() user: UserInfo,
    @Body() body: AddItemsBodyDto,
  ): Promise<OkDto> {
    return this.channelsService.addItems(user.id, body);
  }

  @Post()
  @ApiOperation({
    operationId: 'create',
    summary: 'Create a new channel',
  })
  @ApiBody({
    type: CreateChannelRequest,
    description: 'Request body for creating a new channel',
  })
  @ApiOkResponse({
    type: ChannelResponse,
    description: 'Create a new channel successfully',
  })
  @HttpCode(HttpStatus.CREATED)
  @ZodSerializerDto(ChannelSerializerDto)
  async createChannel(
    @AuthenticatedUser() user: UserInfo,
    @Body() body: CreateChannelBodyDto,
  ): Promise<ChannelDto> {
    return this.channelsService.create(user.id, body);
  }

  @Put(':id')
  @ApiOperation({
    operationId: 'update',
    summary: 'Update a channel',
  })
  @ApiBody({
    type: UpdateChannelRequest,
    description: 'Request body for updating a channel',
  })
  @ApiOkResponse({
    type: ChannelResponse,
    description: 'Update a channel successfully',
  })
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(ChannelSerializerDto)
  async updateChannel(
    @AuthenticatedUser() user: UserInfo,
    @Param('id') id: string,
    @Body() body: UpdateChannelBodyDto,
  ): Promise<ChannelDto> {
    return this.channelsService.update(user.id, id, body);
  }

  @Delete(':id')
  @ApiOperation({
    operationId: 'delete',
    summary: 'Delete a channel',
  })
  @ApiNoContentResponse({})
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteChannel(
    @AuthenticatedUser() user: UserInfo,
    @Param('id') id: string,
  ): Promise<void> {
    return this.channelsService.delete(user.id, id);
  }
}
