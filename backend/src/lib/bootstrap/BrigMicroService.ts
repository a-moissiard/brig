import express, { Express } from 'express';
import path from 'path';

import { BrigApi, BrigFtpServerHandler } from '../api';
import { errorMiddleware } from '../api/middlewares';
import { IBrigConfig } from '../config';
import { logger } from '../logger';
import { BrigFtpServerDao, BrigService } from '../service';
import { BrigMongoConnectionInitializer } from '../utils/mongo';

interface IBrigMicroServiceDependencies {
    config: IBrigConfig;
    mongoConnectionInitializer: BrigMongoConnectionInitializer;
}

export class BrigMicroService {
    private readonly config: IBrigConfig;
    private readonly expressApp: Express;

    private readonly brigApi: BrigApi;

    private readonly brigFtpServerDao: BrigFtpServerDao;

    constructor(deps: IBrigMicroServiceDependencies) {
        const { config, mongoConnectionInitializer } = deps;
        this.config = config;

        this.brigFtpServerDao = new BrigFtpServerDao({ mongoConnectionInitializer });
        const brigService = new BrigService({ brigFtpServerDao: this.brigFtpServerDao });        
        const brigFtpServerHandler = new BrigFtpServerHandler({ brigService });
        
        this.brigApi = new BrigApi({ brigFtpServerHandler });

        this.expressApp = express();
    }
    
    public async startMicroService(): Promise<void> {
        await this.initDAOs();

        this.expressApp.use(express.static(path.join(__dirname, '../../../build/frontend')));

        this.expressApp.use(express.json());
        this.expressApp.use('/api', this.brigApi.init());
        this.expressApp.use(errorMiddleware);

        const { port } = this.config.express;
        this.expressApp.listen(port, () => {
            logger.info(`Server started at http://localhost:${port}`);
        });
    }

    private async initDAOs(): Promise<void> {
        await this.brigFtpServerDao.init();
    }
}
