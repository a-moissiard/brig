import express, { Express } from 'express';
import { MongoClient } from 'mongodb';
import path from 'path';

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
    private readonly brigService: BrigService;

    constructor(deps: IBrigMicroServiceDependencies) {
        const { config, mongoClient } = deps;
        this.config = config;
        this.brigFtpServerDao = new BrigFtpServerDao({
            collection: mongoClient.db(config.mongo.dbName).collection(BrigFtpServerDao.collectionName),
        });
        this.brigService = new BrigService({ brigFtpServerDao: this.brigFtpServerDao });

        this.expressApp = express();
    }
    
    public async startMicroService(): Promise<void> {
        await this.brigFtpServerDao.init();

        this.expressApp.use(express.static(path.join(__dirname, '../../../build/frontend')));

        const { port } = this.config.express;
        this.expressApp.listen(port, () => {
            logger.info(`Server started at http://localhost:${port}`);
        });
    }
}