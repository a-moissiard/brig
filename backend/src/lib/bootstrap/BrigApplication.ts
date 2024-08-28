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
        try {
            await this.mongoConnectionManager.init();
            await this.brigMicroService.startMicroService();
        } catch (e) {
            logger.error(`Application exited due to error ${(e as any)?.code} ${(e as any)?.stack}`);
            process.exit(1);
        }
    }

    public async stopApp(): Promise<void> {
        await this.brigMicroService.stopMicroService();
        await this.mongoConnectionManager.close();
    }
}
