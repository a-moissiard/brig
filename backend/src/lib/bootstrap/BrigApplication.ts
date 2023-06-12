import 'dotenv/config';

import { config } from '../config';
import { logger } from '../logger';
import { MongoConnectionManager } from '../utils/mongo';
import { BrigMicroService } from './BrigMicroService';

export class BrigApplication {
    private readonly mongoConnectionManager: MongoConnectionManager;
    private readonly brigMicroService: BrigMicroService;

    constructor() {
        process.on('SIGTERM', async () => {
            logger.info('SIGTERM received');
            await this.stopApp();
        });

        this.mongoConnectionManager = new MongoConnectionManager(config.mongo);
        this.brigMicroService = new BrigMicroService({ config, mongoConnectionManager: this.mongoConnectionManager });
    }

    public async startApp(): Promise<void> {
        await this.mongoConnectionManager.init();
        await this.brigMicroService.startMicroService();
    }

    public async stopApp(): Promise<void> {
        this.brigMicroService.stopMicroService();
        await this.mongoConnectionManager.close();
    }
}
