import { config } from '../config';
import { logger } from '../logger';
import { MongoConnectionManager } from '../utils/mongo';
import { RedisConnectionManager } from '../utils/redis';
import { BrigMicroService } from './BrigMicroService';

export class BrigApplication {
    private readonly mongoConnectionManager: MongoConnectionManager;
    private readonly redisConnectionManager: RedisConnectionManager;
    private readonly brigMicroService: BrigMicroService;

    constructor() {
        process.on('SIGTERM', async () => {
            logger.info('SIGTERM received');
            await this.stopApp();
        });

        this.mongoConnectionManager = new MongoConnectionManager(config.mongo);
        this.redisConnectionManager = new RedisConnectionManager(config.redis);
        this.brigMicroService = new BrigMicroService({
            config,
            mongoConnectionManager: this.mongoConnectionManager,
            redisConnectionManager: this.redisConnectionManager,
        });
    }

    public async startApp(): Promise<void> {
        try {
            await this.mongoConnectionManager.init();
            await this.redisConnectionManager.init();
            await this.brigMicroService.startMicroService();
        } catch (e) {
            logger.error(`Application exited due to error ${(e as any)?.code} ${(e as any)?.stack}`);
            process.exit(1);
        }
    }

    public async stopApp(): Promise<void> {
        await this.brigMicroService.stopMicroService();
        await this.mongoConnectionManager.close();
        await this.mongoConnectionManager.close();
    }
}
