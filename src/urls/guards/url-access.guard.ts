import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  GoneException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { RedirectType } from 'src/common/enums/redirect-type.enum';
import { UrlRepository } from 'src/database/repositories/url.repository';

@Injectable()
export class UrlAccessGuard implements CanActivate {
  constructor(private readonly urlRepo: UrlRepository) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<Request>();
    const slug = req.params.slug;

    const url = await this.urlRepo.findOneBySlug(slug);

    if (!url || url.isPrivate) {
      throw new NotFoundException('URL_NOT_FOUND');
    }
    // Allow crawlers to bypass restrictions
    if (req.isCrawler || url.redirectType === RedirectType.SPLASH) {
      req.urlEntity = url;
      return true;
    }

    if (url.isProtected && url.accessCode) {
      throw new ForbiddenException('REQUIRE_ACCESS_CODE');
    }

    if (url.activeAt && url.activeAt > new Date()) {
      throw new ForbiddenException('URL_NOT_ACTIVE');
    }

    if (
      (url.expiresAt && url.expiresAt < new Date()) ||
      (url.clickLimit && url.clickCount >= url.clickLimit)
    ) {
      throw new ForbiddenException('URL_EXPIRED');
    }

    req.urlEntity = url;
    return true;
  }
}
