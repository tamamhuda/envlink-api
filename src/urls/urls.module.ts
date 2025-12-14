import { Module } from '@nestjs/common';
import { UrlsService } from './urls.service';
import { UrlsController } from './urls.controller';
import { UserModule } from 'src/user/user.module';
import { PublicUrlsController } from './public/urls.controller';
import { CrawlerDetection } from './middlewares/crawler-detection.middleware';

@Module({
  imports: [UserModule],
  controllers: [UrlsController, PublicUrlsController],
  providers: [UrlsService, CrawlerDetection],
  exports: [UrlsService, CrawlerDetection],
})
export class UrlsModule {}
