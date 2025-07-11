import {BadRequestException, Controller, Get, HttpStatus, NotFoundException, Post} from '@nestjs/common';
import { AppService } from './app.service';
import LoggerService from "./common/logger/logger.service";
import {delay} from "rxjs";
import {IHealthz} from "./common/interfaces/healthz.interface";

@Controller()
export class AppController {
  constructor(
      private readonly appService: AppService,
      private readonly logger: LoggerService,
  ) {
  }


  @Get("/healthz")
  async healthz(): Promise<IHealthz> {
    await new Promise(resolve => setTimeout(resolve, 500));
    // throw new BadRequestException('Healthz Exception');
    return await this.appService.healthz();
  }
}
