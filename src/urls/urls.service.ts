import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UrlRepository } from 'src/database/repositories/url.repository';
import LoggerService from 'src/common/logger/logger.service';
import { PublicShortenUrlBodyDto, ShortenUrlBodyDto } from './dto/shorten.dto';
import {
  UnlockUrlBodyDto,
  UpdateUrlBodyDto,
  UrlDto,
  UrlPaginatedDto,
} from './dto/url.dto';
import { UserService } from 'src/user/user.service';
import { Url } from 'src/database/entities/url.entity';
import { Request } from 'express';
import { BcryptUtil } from 'src/common/utils/bcrypt.util';
import { ShortCodeUtil } from 'src/common/utils/short-code.util';
import { InjectQueue } from '@nestjs/bullmq';
import { URL_METADATA_QUEUE } from 'src/queue/queue.constans';
import { Queue } from 'bullmq';
import {
  UrlMetadata,
  UrlMetadataJob,
} from 'src/queue/interfaces/url-metadata.interface';
import { Channel } from 'src/database/entities/channel.entity';
import { In } from 'typeorm';
import { UserInfo } from 'src/auth/dto/user-info.dto';
import { PaginatedQueryDto } from 'src/common/dto/paginated.dto';
import { UrlGeneratorService } from 'nestjs-url-generator';
import { FilterQueryDto } from './dto/filter-query.dto';
import { CacheService } from 'src/common/cache/cache.service';
import { CachePrefix } from 'src/common/enums/cache-prefix.enum';

@Injectable()
export class UrlsService {
  private readonly bcryptUtil: BcryptUtil = new BcryptUtil();
  private readonly shortCodeUtil: ShortCodeUtil = new ShortCodeUtil();
  constructor(
    private readonly urlRepository: UrlRepository,
    private readonly urlGenService: UrlGeneratorService,
    private readonly logger: LoggerService,
    @InjectQueue(URL_METADATA_QUEUE)
    private readonly urlMetadataQueue: Queue<UrlMetadataJob>,
    private readonly userService: UserService,
    private readonly cache: CacheService,
  ) {}

  async findUrlByIdOrCode(id?: string, code?: string): Promise<Url> {
    const url = await this.urlRepository.findOneByIdOrCode(id, code);
    if (!url) throw new NotFoundException('Url not found');
    return url;
  }

  async getUrlById(id: string): Promise<UrlDto> {
    return await this.findUrlByIdOrCode(id);
  }

  async getUserUrls(req: Request): Promise<UrlDto[]> {
    const { id } = req.user;
    return await this.urlRepository.findManyByUserId(id);
  }

  async getUrlsPaginated(
    userId: string,
    pagination: PaginatedQueryDto,
    filter: FilterQueryDto,
  ): Promise<UrlPaginatedDto> {
    const url = this.urlGenService.generateUrlFromPath({
      relativePath: 'urls',
    });

    return await this.urlRepository.findUrlsPaginated(
      userId,
      {
        ...pagination,
        url,
      },
      filter,
    );
  }

  async getUrlByCode(code: string): Promise<UrlDto> {
    const url = await this.findUrlByIdOrCode(undefined, code);
    if (url.isProtected)
      throw new ForbiddenException(
        'Access denied. This link is protected. Please provide a access code to continue.',
      );
    if (url.expiresAt && url.expiresAt < new Date())
      throw new ForbiddenException('Access denied. This link has expired.');
    return url;
  }

  async validateAlias(alias: string): Promise<void> {
    const url = await this.urlRepository.findOneByCode(alias);
    if (url) throw new ConflictException('Code already exists');
  }

  async generateAndValidateCode() {
    let code = this.shortCodeUtil.generate(6);
    let url = await this.urlRepository.findOneByCode(code);
    while (url) {
      code = this.shortCodeUtil.generate(6);
      url = await this.urlRepository.findOneByCode(code);
    }
    return code;
  }

  async createUrl(
    body: ShortenUrlBodyDto,
    userInfo?: UserInfo,
  ): Promise<UrlDto> {
    return this.urlRepository.manager.transaction(async (manager) => {
      const {
        alias,
        isProtected,
        accessCode,
        channelIds,
        originalUrl,
        ...restOfBody
      } = body;
      const code = await this.generateAndValidateCode();
      if (alias) await this.validateAlias(alias);

      const user = userInfo
        ? await this.userService.findUserById(userInfo.id)
        : undefined;

      const accessCodeHash =
        isProtected && accessCode
          ? await this.bcryptUtil.hashAccessCode(accessCode)
          : undefined;

      let channels: Channel[] = [];
      if (channelIds && user) {
        channels = await manager.find(Channel, {
          where: { id: In(channelIds) },
        });
      }

      const metadata = await this.cache.getCache<UrlMetadata>(
        CachePrefix.URL_METADATA,
        originalUrl,
      );

      const url = manager.create(Url, {
        ...restOfBody,
        originalUrl,
        alias,
        code,
        isProtected,
        isAnonymous: user ? false : true,
        user,
        metadata,
        accessCode: accessCodeHash,
        channels,
      });

      return await manager
        .save(url, {
          reload: true,
        })
        .then(async ({ id, code }) => {
          const url = await manager.findOneOrFail(Url, {
            where: { id },
            relations: ['channels'],
          });
          if (!metadata) {
            void this.urlMetadataQueue.add(`url-metadata-${code}`, {
              urlId: id,
            });
          }
          return url;
        });
    });
  }

  async updateUrl(id: string, body: UpdateUrlBodyDto): Promise<UrlDto> {
    const existing = await this.findUrlByIdOrCode(id);
    const { alias, channelsIds, isArchived, ...rest } = body;
    if (alias) await this.validateAlias(alias);
    return await this.urlRepository.updateOne(existing, {
      alias,
      archivedAt: isArchived ? new Date() : existing.archivedAt,
      isArchived,
      ...rest,
    });
  }

  async deleteUrl(id: string): Promise<void> {
    const result = await this.urlRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Url not found');
  }

  async unlockUrlByCode(code: string, body: UnlockUrlBodyDto): Promise<UrlDto> {
    const url = await this.findUrlByIdOrCode(code);
    const isValidate =
      url.accessCode &&
      (await this.bcryptUtil.verifyAccessCode(body.accessCode, url.accessCode));
    if (!isValidate) throw new ConflictException('Invalid code');
    return url;
  }
}
