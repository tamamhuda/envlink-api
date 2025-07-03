import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("/healthz")
  async healthz(): Promise<{"status": string}> {
    return await this.appService.healthz();
  }
}
