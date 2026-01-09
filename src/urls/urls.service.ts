import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UrlRepository } from 'src/database/repositories/url.repository';
import LoggerService from 'src/infrastructure/logger/logger.service';

import { ShortenUrlBodyDto } from './dto/shorten.dto';
import { UrlDto, UrlPaginatedDto } from './dto/url.dto';
import { UserService } from 'src/user/user.service';
import { Url } from 'src/database/entities/url.entity';
import { Request, Response } from 'express';

import { InjectQueue } from '@nestjs/bullmq';
import { URL_METADATA_QUEUE } from 'src/queue/queue.constants';
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
import { CachePrefix } from 'src/common/enums/cache-prefix.enum';
import { BulkUpdateUrlsBodyDto } from './dto/bulk-udate.dto';
import { OkDto } from 'src/common/dto/response.dto';
import { BulkDeleteUrlsBodyDto } from './dto/bulk-delete.dto';
import { RedirectType } from 'src/common/enums/redirect-type.enum';
import { PublicUrlDto, publicUrlDtoSchema } from './dto/public-url.dto';
import { UnlockUrlBodyDto } from './dto/unlock.dto';
import { UpdateUrlBodyDto } from './dto/update.dto';
import { ConfirmUrlBodyDto } from './dto/confirm.dto';
import { AnalyticType } from 'src/common/enums/analytic-type.enum';
import { CacheService } from 'src/infrastructure/cache/cache.service';
import { BcryptService } from 'src/security/services/bcrypt.service';
import { RedirectTokenService } from 'src/security/services/redirect-token.service';
import { generateShortCode } from 'src/common/helpers/short-code.helper';

@Injectable()
export class UrlsService {
  constructor(
    private readonly bcryptService: BcryptService,
    private readonly urlRepository: UrlRepository,
    private readonly urlGenService: UrlGeneratorService,
    private readonly logger: LoggerService,
    @InjectQueue(URL_METADATA_QUEUE)
    private readonly urlMetadataQueue: Queue<UrlMetadataJob>,
    private readonly userService: UserService,
    private readonly cache: CacheService,
    private readonly redirectTokenService: RedirectTokenService,
  ) {}

  async findUrlByIdOrCode(id?: string, code?: string): Promise<Url> {
    const url = await this.urlRepository.findOneByIdOrCode(id, code);
    if (!url) throw new NotFoundException('Url not found');
    return url;
  }

  async getUrlById(id: string): Promise<UrlDto> {
    return await this.findUrlByIdOrCode(id);
  }

  async getUrlBySlug(slug: string): Promise<Url> {
    const url = await this.findUrlByIdOrCode(undefined, slug);
    if (!url) throw new NotFoundException('Url not found');
    return url;
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

  async getUrlRedirect(
    req: Request,
    res: Response<PublicUrlDto>,
    _slug: string,
  ): Promise<void> {
    const url = req.urlEntity!;

    // DIRECT or CRAWLER
    if (req.isCrawler || url.redirectType === RedirectType.DIRECT) {
      req.eventType = AnalyticType.CLICK;
      res.redirect(url.originalUrl);
      return;
    }

    // SPLASH
    req.eventType = AnalyticType.IMPRESSION;
    const publicUrlDto = publicUrlDtoSchema.parse(url);
    res.status(200).json(publicUrlDto);
    return;
  }

  async bulkUpdateUrls(
    userId: string,
    body: BulkUpdateUrlsBodyDto,
  ): Promise<OkDto> {
    const { itemIds, data } = body;
    await this.urlRepository.updateMany(userId, itemIds, data);
    return {
      message: `Update ${itemIds.length} URLs successfully`,
    };
  }

  async bulkDeleteUrls(
    userId: string,
    body: BulkDeleteUrlsBodyDto,
  ): Promise<OkDto> {
    const { itemIds } = body;
    const { affected = null } = await this.urlRepository.deleteMany(
      userId,
      itemIds,
    );
    if (!affected) throw new NotFoundException('URLs not found');
    return {
      message: `Delete ${affected} URLs successfully`,
    };
  }

  async validateAlias(alias: string): Promise<void> {
    const url = await this.urlRepository.findOneByCode(alias);
    if (url) throw new ConflictException('Code already exists');
  }

  async generateAndValidateCode() {
    let code = generateShortCode(6);
    let url = await this.urlRepository.findOneByCode(code);
    while (url) {
      code = generateShortCode(6);
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
          ? await this.bcryptService.hashAccessCode(accessCode)
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

  async unlockUrlRedirect(
    req: Request,
    res: Response,
    slug: string,
    body: UnlockUrlBodyDto,
  ): Promise<void> {
    const url = await this.getUrlBySlug(slug);
    const isValidate =
      url.accessCode &&
      (await this.bcryptService.verifyAccessCode(
        body.accessCode,
        url.accessCode,
      ));
    if (!isValidate) throw new ConflictException('Invalid access code');

    req.eventType = AnalyticType.CLICK;
    res.redirect(url.originalUrl);
    return;
  }

  async confirmUrlRedirect(
    req: Request,
    res: Response,
    slug: string,
    body: ConfirmUrlBodyDto,
  ): Promise<void> {
    const { token } = body;
    const result = this.redirectTokenService.verify(token);
    if (!result || result.isExpired)
      throw new ForbiddenException('INVALID_REDIRECT_TOKEN');

    if (result.payload.slug !== slug) {
      throw new ForbiddenException('TOKEN_SLUG_MISMATCH');
    }

    req.eventType = AnalyticType.CLICK;
    res.redirect(result.payload.redirectUrl);
    return;
  }
}
