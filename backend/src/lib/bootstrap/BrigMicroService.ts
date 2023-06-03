import express, { Express } from 'express';
import { MongoClient } from 'mongodb';
import path from 'path';

import { BrigFtpServerHandler } from '../api/BrigFtpServerHandler';
import { BrigFtpServerRouter } from '../api/BrigFtpServerRouter';
import { IBrigConfig } from '../config';
import { logger } from '../logger';
import { BrigFtpServerDao } from '../service/BrigFtpServerDao';
import { BrigService } from '../service/BrigService';

interface IBrigMicroServiceDependencies {
    config: IBrigConfig;
    mongoClient: MongoClient;
}

export class BrigMicroService {
    private readonly config: IBrigConfig;
    private readonly expressApp: Express;

    private readonly brigFtpServerDao: BrigFtpServerDao;
    private readonly brigFtpServerRouter: BrigFtpServerRouter;

    constructor(deps: IBrigMicroServiceDependencies) {
        const { config, mongoClient } = deps;
        this.config = config;

        this.brigFtpServerDao = new BrigFtpServerDao({
            collection: mongoClient.db(config.mongo.dbName).collection(BrigFtpServerDao.collectionName),
        });
        const brigService = new BrigService({ brigFtpServerDao: this.brigFtpServerDao });
        const brigFtpServerHandler = new BrigFtpServerHandler({ brigService });
        this.brigFtpServerRouter = new BrigFtpServerRouter({ brigFtpServerHandler });

        this.expressApp = express();
    }
    
    public async startMicroService(): Promise<void> {
        await this.brigFtpServerDao.init();
        const ftpServerRouter = this.brigFtpServerRouter.init();

        this.expressApp.use('/servers', ftpServerRouter);

        this.expressApp.use(express.static(path.join(__dirname, '../../../build/frontend')));

        const { port } = this.config.express;
        this.expressApp.listen(port, () => {
            logger.info(`Server started at http://localhost:${port}`);
        });
    }
}