

// src/config/winston-config.service.ts
import { Injectable } from '@nestjs/common';
import {
    WinstonModuleOptions,
    WinstonModuleOptionsFactory,
} from 'nest-winston';
import {winstonLogger} from "./winston.logger";

@Injectable()
export class WinstonConfigService implements WinstonModuleOptionsFactory {
    createWinstonModuleOptions(): WinstonModuleOptions {
        return {
            instance: winstonLogger,
        };
    }
}
