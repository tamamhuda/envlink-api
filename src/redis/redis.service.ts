import {Injectable, OnModuleInit} from '@nestjs/common';
import Redis from "ioredis";
import LoggerService from "../common/logger/logger.service";
import {InjectRedis} from "@nestjs-modules/ioredis";

@Injectable()
export class RedisService implements OnModuleInit {
    private readonly DEFAULT_TTL = 60 * 60 ;

    constructor(
        @InjectRedis() private readonly redis: Redis,
        private readonly logger: LoggerService
    ) {}

    async onModuleInit(): Promise<void> {
        try {
            const pong = await this.redis.ping()
            this.logger.info(`Redis service initialized: ${pong}`);
        } catch (error) {
            this.logger.error(`Redis connection failed`, error);
        }
    }

    async client(): Promise<Redis> {
        return this.redis
    }

    async set(key: string, value: any, ttl: number = this.DEFAULT_TTL ): Promise<void | "OK"> {
        return this.redis.set(key, JSON.stringify(value), 'EX', ttl);
    }

    async get<T>(key: string): Promise<T | null> {
        const data = await this.redis.get(key);
        return data ? JSON.parse(data) : null;
    }

    async del(key: string): Promise<number> {
        return this.redis.del(key);
    }


}
