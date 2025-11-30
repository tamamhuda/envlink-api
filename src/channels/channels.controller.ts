import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ChannelsService } from './channels.service';
import {
  AllChannelResponse,
  ChannelDto,
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

@Controller('channels')
@ApiTags('Channels')
@ApiSecurity(JWT_SECURITY)
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @Get()
  @ApiOperation({
    operationId: 'getAll',
    summary: 'Get all channels',
  })
  @ApiOkResponse({
    type: AllChannelResponse,
    description: 'Get all channels successfully',
  })
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto([ChannelSerializerDto])
  async getChannels(
    @AuthenticatedUser() user: UserInfo,
  ): Promise<ChannelDto[]> {
    return this.channelsService.getAll(user.id);
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

  @Post(':id/items/add')
  @ApiOperation({
    operationId: 'addItems',
    summary: 'Add items to a channel',
  })
  @ApiBody({
    type: AddItemsRequest,
    description: 'Request body for adding items to a channel',
  })
  @ApiOkResponse({
    type: String,
    description: 'Add items to a channel successfully',
  })
  @HttpCode(HttpStatus.OK)
  async addItems(
    @AuthenticatedUser() user: UserInfo,
    @Param('id') id: string,
    @Body() body: AddItemsBodyDto,
  ): Promise<string> {
    return this.channelsService.addItems(user.id, id, body);
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
