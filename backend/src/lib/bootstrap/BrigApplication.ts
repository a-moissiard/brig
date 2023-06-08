import 'dotenv/config';

import { config } from '../config';
import { logger } from '../logger';
import { BrigMongoConnectionInitializer } from '../utils/mongo';
import { BrigMicroService } from './BrigMicroService';

export class BrigApplication {
    private readonly mongoConnectionInitializer: BrigMongoConnectionInitializer;
    private readonly brigMicroService: BrigMicroService;

    constructor() {
        this.mongoConnectionInitializer = new BrigMongoConnectionInitializer(config.mongo);

        this.brigMicroService = new BrigMicroService({ config, mongoConnectionInitializer: this.mongoConnectionInitializer });
    }

    public async startApp(): Promise<void> {
        await this.mongoConnectionInitializer.init();
        logger.info('Connection to mongodb successful');
        await this.brigMicroService.startMicroService();
    }
}
