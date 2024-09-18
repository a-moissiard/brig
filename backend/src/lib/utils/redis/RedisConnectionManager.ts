import { Redis } from 'ioredis';

import { IBrigRedisConfig } from '../../config';
import { logger } from '../../logger';

export interface IRedisConnectionManager {
    redisClient: Redis;
    init(): void;
    close(): void;
}

export class RedisConnectionManager implements IRedisConnectionManager {
    public readonly redisClient: Redis;

    constructor(redisConfig: IBrigRedisConfig) {
        const { password, host, port, db } = redisConfig.connection;
        this.redisClient = new Redis({
            host,
            port,
            password,
            db,
            lazyConnect: true,
        });
    }

    public async init(): Promise<void> {
        await this.redisClient.connect();
        logger.info('Connection to redis successful');
    }

    public async close(force = false): Promise<void> {
        if (force) {
            this.redisClient.disconnect();
        } else {
            await this.redisClient.quit();
        }
        logger.info('Connection to redis closed');
    }
}
