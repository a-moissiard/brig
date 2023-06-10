import 'dotenv/config';

import { config } from '../config';
import { logger } from '../logger';
import { BrigMongoConnectionManager } from '../utils/mongo';
import { BrigMicroService } from './BrigMicroService';

export class BrigApplication {
    private readonly mongoConnectionManager: BrigMongoConnectionManager;
    private readonly brigMicroService: BrigMicroService;

    constructor() {
        this.mongoConnectionInitializer = new BrigMongoConnectionInitializer(config.mongo);

        this.mongoConnectionManager = new BrigMongoConnectionManager(config.mongo);
        this.brigMicroService = new BrigMicroService({ config, mongoConnectionManager: this.mongoConnectionManager });
    }

    public async startApp(): Promise<void> {
        await this.mongoConnectionManager.init();
        await this.brigMicroService.startMicroService();
    }
}
