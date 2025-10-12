import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UrlRepository } from 'src/database/repositories/url.repository';
import LoggerService from 'src/logger/logger.service';
import { ShortenUrlDto } from './dto/shorten.dto';
import { UnlockUrlDto, UpdateUrlDto, UrlDto } from './dto/url.dto';
import { UserInfo } from 'src/auth/dto/user-info.dto';
import { UserService } from 'src/user/user.service';
import { Url } from 'src/database/entities/url.entity';
import { Request } from 'express';
import { BcryptUtil } from 'src/common/utils/bcrypt.util';
import { ShortCodeUtil } from 'src/common/utils/short-code.util';
import { InjectQueue } from '@nestjs/bullmq';
import { URL_METADATA_QUEUE } from 'src/queue/queue.constans';
import { Queue } from 'bullmq';
import { UrlMetadataJob } from 'src/queue/interfaces/url-metadata.interface';
import { Channel } from 'src/database/entities/channel.entity';
import { In } from 'typeorm';

@Injectable()
export class UrlsService {
  private readonly bcryptUtil: BcryptUtil = new BcryptUtil();
  private readonly shortCodeUtil: ShortCodeUtil = new ShortCodeUtil();
  constructor(
    private readonly urlRepository: UrlRepository,
    private readonly logger: LoggerService,
    @InjectQueue(URL_METADATA_QUEUE)
    private readonly queue: Queue<UrlMetadataJob>,
    private readonly userService: UserService,
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

  async validateCode(code: string): Promise<void> {
    const url = await this.urlRepository.findOneByCode(code);
    if (url) throw new ConflictException('Code already exists');
  }

  async createUrl(body: ShortenUrlDto, userInfo?: UserInfo): Promise<UrlDto> {
    return this.urlRepository.manager.transaction(async (manager) => {
      const { code, isProtected, accessCode, channelIds, ...restOfBody } = body;
      const alias = code ?? this.shortCodeUtil.generate(6);
      await this.validateCode(alias);

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
        this.logger.debug(
          `Found ${channels.length} channels for user ${user.id}`,
        );
      }

      const url = manager.create(Url, {
        ...restOfBody,
        code: alias,
        isProtected,
        isAnonymous: user ? false : true,
        user,
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
          void this.queue.add(`url-metadata-${code}`, {
            urlId: id,
          });
          return url;
        });
    });
  }

  async updateUrl(id: string, body: UpdateUrlDto): Promise<UrlDto> {
    const existingUrl = await this.findUrlByIdOrCode(id);
    const { code } = body;
    if (code) await this.validateCode(code);
    return await this.urlRepository.updateOne(existingUrl, body);
  }

  async deleteUrl(id: string): Promise<void> {
    const result = await this.urlRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Url not found');
  }

  async unlockUrlByCode(code: string, body: UnlockUrlDto): Promise<UrlDto> {
    const url = await this.findUrlByIdOrCode(code);
    const isValidate =
      url.accessCode &&
      (await this.bcryptUtil.verifyAccessCode(body.accessCode, url.accessCode));
    if (!isValidate) throw new ConflictException('Invalid code');
    return url;
  }
}
