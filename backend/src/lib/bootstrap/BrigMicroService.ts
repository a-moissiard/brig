import express, { Express } from 'express';
import * as http from 'http';
import path from 'path';

import { BrigApi, BrigFtpServerHandler } from '../api';
import { errorMiddleware } from '../api/middlewares';
import { IBrigConfig } from '../config';
import { logger } from '../logger';
import { BrigFtpServerDao, BrigService } from '../service';
import { BrigMongoConnectionManager } from '../utils/mongo';

interface IBrigMicroServiceDependencies {
    config: IBrigConfig;
    mongoConnectionManager: BrigMongoConnectionManager;
}

export class BrigMicroService {
    private readonly config: IBrigConfig;
    private readonly expressApp: Express;
    private server: http.Server | undefined;

    private readonly brigApi: BrigApi;

    private readonly brigFtpServerDao: BrigFtpServerDao;

    constructor(deps: IBrigMicroServiceDependencies) {
        const { config, mongoConnectionManager } = deps;
        this.config = config;

        this.brigFtpServerDao = new BrigFtpServerDao({ mongoConnectionManager });
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
        this.server = this.expressApp.listen(port, () => {
            logger.info(`Server started at http://localhost:${port}`);
        });
    }

    public stopMicroService(): void {
        this.server?.close(() => {
            logger.info('Server shut down');
        });
    }

    private async initDAOs(): Promise<void> {
        await this.brigFtpServerDao.init();
    }
}
